# C / C++ / Java grader. Reads JSON from stdin, prints JSON result to stdout.
# {"lang":"c|cpp|java","code":"...","tests":["input1","input2"],"tl":2000}
import json, os, subprocess, sys, tempfile, time, shutil, resource

LIMIT = 64 * 1024

def clip(b):
    s = b[:LIMIT].decode("utf-8", "replace")
    return s + ("\n...(cắt bớt)" if len(b) > LIMIT else "")

def main():
    job = json.loads(sys.stdin.read() or "{}")
    lang = job.get("lang")
    code = str(job.get("code", ""))[:100000]
    tests = [str(t) for t in (job.get("tests") or [])][:30]
    tl = max(0.5, min(10.0, float(job.get("tl", 2000)) / 1000))
    work = tempfile.mkdtemp(prefix="cc-", dir=os.environ.get("CC_WORKDIR") or "/tmp")
    try:
        if lang == "c":
            src, comp, run = "main.c", ["gcc", "-std=c11", "-O2", "-pipe", "-o", "main", "main.c", "-lm"], ["./main"]
        elif lang == "cpp":
            src, comp, run = "main.cpp", ["g++", "-std=c++17", "-O2", "-pipe", "-o", "main", "main.cpp"], ["./main"]
        elif lang == "java":
            src, comp = "Main.java", ["javac", "-encoding", "UTF-8", "-J-Xmx256m", "-J-XX:+UseSerialGC", "-J-XX:TieredStopAtLevel=1", "Main.java"]
            run = ["java", "-Xmx128m", "-Xss16m", "-XX:+UseSerialGC", "-XX:TieredStopAtLevel=1", "-Dfile.encoding=UTF-8", "-cp", ".", "Main"]
        else:
            print(json.dumps({"ok": False, "stage": "setup", "error": "Ngôn ngữ không hỗ trợ"})); return
        with open(os.path.join(work, src), "w", encoding="utf-8") as f:
            f.write(code)
        try:
            c = subprocess.run(comp, cwd=work, capture_output=True, timeout=25)
        except subprocess.TimeoutExpired:
            print(json.dumps({"ok": False, "stage": "compile", "error": "Biên dịch quá thời gian."})); return
        if c.returncode != 0:
            msg = clip(c.stderr or c.stdout).replace(work + "/", "")
            print(json.dumps({"ok": False, "stage": "compile", "error": msg[:6000]})); return
        out = []
        for inp in tests:
            t0 = time.time()
            try:
                r = subprocess.run(run, cwd=work, input=inp.encode("utf-8"), capture_output=True, timeout=tl * (3 if lang == "java" else 1))
                out.append({"status": "ok" if r.returncode == 0 else "rte", "code": r.returncode, "stdout": clip(r.stdout), "stderr": clip(r.stderr)[:2000], "ms": int((time.time() - t0) * 1000)})
            except subprocess.TimeoutExpired:
                out.append({"status": "tle", "stdout": "", "stderr": "", "ms": int(tl * 1000)})
        print(json.dumps({"ok": True, "results": out}))
    finally:
        shutil.rmtree(work, ignore_errors=True)

main()
