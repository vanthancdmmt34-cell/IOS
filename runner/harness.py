# Python Lab - runner that executes student submissions INSIDE the sandbox container.
# Reads 1 line of JSON from stdin: {"code": "...", "inputs": ["...", ...], "limit": 65536, "per_test_s": 3}
# Executes the code once per input (with a fresh variable scope each time), returning 1 line of JSON on stdout.
# The container has no network, read-only rootfs, and CPU/RAM/process limits; this harness additionally limits
# output size and per-test execution time.
#
# SECURITY (defense-in-depth; the Docker container is the primary boundary):
# - Student code runs with a restricted __builtins__: only safe functions (print, input, range, len,
#   str/int/float/list/dict/set/bool/tuple, sum/min/max/abs/round/sorted/enumerate/zip/reversed/any/all/ord/chr).
#   open/eval/exec/compile/__import__(real)/globals/locals/getattr/setattr/dir/help/... are NOT available.
# - __import__ is replaced with a restricted version: only math, random, numpy, string may be imported.
#   os/sys/subprocess/pathlib/shutil/socket/importlib/ctypes/... are blocked (ImportError).
#   So `import os` fails and `print(os.environ)` / `print(os.listdir('/'))` raise NameError (no output).
import sys, io, json, signal, traceback, builtins
import os
# numpy o /opt/pylibs (image sci); python3 -I bo qua PYTHONPATH nen chen tay vao sys.path.
if os.path.isdir("/opt/pylibs") and "/opt/pylibs" not in sys.path:
    sys.path.insert(0, "/opt/pylibs")

FILENAME = "<bai-lam>"
_real_stdout = sys.stdout
_payload = json.loads(sys.stdin.readline() or "{}")
_code = _payload.get("code", "")
_inputs = _payload.get("inputs") or [""]
_limit = int(_payload.get("limit", 65536))
_per_test = float(_payload.get("per_test_s", 3))


class OutputLimit(BaseException):
    pass


class TestTimeout(BaseException):
    pass


class LimitedWriter(io.TextIOBase):
    def __init__(self, limit):
        self.buf = []
        self.size = 0
        self.limit = limit

    def writable(self):
        return True

    def write(self, s):
        s = str(s)
        self.size += len(s)
        if self.size > self.limit:
            self.buf.append(s[: max(0, self.limit - (self.size - len(s)))])
            raise OutputLimit()
        self.buf.append(s)
        return len(s)

    def getvalue(self):
        return "".join(self.buf)


def _on_alarm(signum, frame):
    raise TestTimeout()


signal.signal(signal.SIGALRM, _on_alarm)


def _user_line(tb):
    line = 0
    for fr in traceback.extract_tb(tb):
        if fr.filename == FILENAME:
            line = fr.lineno
    return line


# ---- Restricted execution environment (defense-in-depth) ----
_real_import = builtins.__import__

_ALLOWED_MODULES = frozenset(["math", "random", "numpy", "string"])

_BLOCKED_MODULES = frozenset([
    "os", "sys", "subprocess", "pathlib", "shutil", "socket",
    "importlib", "ctypes", "builtins", "io", "code", "ast",
    "inspect", "pkgutil", "runpy", "traceback", "signal",
    "threading", "multiprocessing", "pty", "fcntl", "posix",
    "nt", "platform", "getpass", "pwd", "grp",
    "urllib", "http", "ftplib", "smtplib", "telnetlib",
    "socketserver", "xmlrpc", "pickle", "shelve", "dbm",
    "sqlite3", "zlib", "gzip", "tarfile", "zipfile",
    "gc", "weakref", "resource", "commands",
])


def _safe_import(name, globals=None, locals=None, fromlist=(), level=0):
    if level and level > 0:
        raise ImportError("Khong duoc import tuong doi trong bai lam.", name=name)
    root = str(name).split(".")[0]
    if root in _BLOCKED_MODULES or root not in _ALLOWED_MODULES:
        raise ImportError("Không được import module %r trong bài làm." % root, name=root)
    return _real_import(name, globals, locals, fromlist, level)


_SAFE_BUILTINS = {
    "print": print,
    "input": input,
    "range": range,
    "len": len,
    "str": str,
    "int": int,
    "float": float,
    "list": list,
    "dict": dict,
    "set": set,
    "bool": bool,
    "tuple": tuple,
    "sum": sum,
    "min": min,
    "max": max,
    "abs": abs,
    "round": round,
    "sorted": sorted,
    "enumerate": enumerate,
    "zip": zip,
    "reversed": reversed,
    "any": any,
    "all": all,
    "ord": ord,
    "chr": chr,
    "__import__": _safe_import,
}


def _run_one(compiled, stdin_text):
    out = LimitedWriter(_limit)
    sys.stdout = out
    sys.stderr = out
    sys.stdin = io.StringIO(stdin_text)
    g = {"__name__": "__main__", "__builtins__": _SAFE_BUILTINS}
    res = {"ok": True, "output": "", "error": None}
    signal.setitimer(signal.ITIMER_REAL, _per_test, _per_test)
    try:
        exec(compiled, g)
    except OutputLimit:
        res["ok"] = False
        res["error"] = {"type": "OutputLimit", "message": "", "line": 0}
    except TestTimeout:
        res["ok"] = False
        res["error"] = {"type": "Timeout", "message": "", "line": 0}
    except SystemExit:
        pass
    except BaseException as e:  # user submission error
        res["ok"] = False
        res["error"] = {"type": type(e).__name__, "message": str(e)[:500], "line": _user_line(e.__traceback__)}
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        sys.stdout = _real_stdout
        sys.stderr = sys.__stderr__
    res["output"] = out.getvalue()
    return res


def main():
    try:
        compiled = compile(_code, FILENAME, "exec")
    except SyntaxError as e:
        err = {"type": type(e).__name__, "message": str(e.msg or "")[:300], "line": e.lineno or 0, "text": (e.text or "").rstrip()[:200]}
        _real_stdout.write(json.dumps({"compile_error": err}, ensure_ascii=False) + "\n")
        return
    results = [_run_one(compiled, s if isinstance(s, str) else "") for s in _inputs]
    _real_stdout.write(json.dumps({"results": results}, ensure_ascii=False) + "\n")


main()
