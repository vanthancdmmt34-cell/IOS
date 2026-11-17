// Translate real Python errors into Vietnamese for beginners: what failed, on which line, and how to fix it.
// Keep the original error name (NameError...) so learners get familiar with real Python messages.

const q = (s) => `"${s}"`;

const RULES = [
  // ---- Syntax / indentation ----
  [/^IndentationError$/, /expected an indented block/, () => ["Thiếu thụt lề: sau dòng kết thúc bằng dấu : phải có ít nhất một dòng thụt vào.", "Thêm 4 dấu cách ở đầu dòng ngay bên dưới dòng if/for/while/def."]],
  [/^IndentationError$/, /unexpected indent/, () => ["Dòng này bị thụt lề thừa (không nằm trong khối if/for/while/def nào).", "Xóa các dấu cách thừa ở đầu dòng cho thẳng hàng với dòng phía trên."]],
  [/^IndentationError$/, /unindent does not match/, () => ["Thụt lề không khớp với các dòng phía trên.", "Các dòng cùng một khối phải thụt vào bằng nhau (thường là 4 dấu cách). Đừng trộn Tab và dấu cách."]],
  [/^TabError$/, /./, () => ["Trộn lẫn Tab và dấu cách khi thụt lề.", "Chỉ dùng dấu cách (4 dấu cách cho mỗi cấp thụt lề)."]],
  [/^SyntaxError$/, /expected ':'/, () => ["Thiếu dấu hai chấm : ở cuối dòng.", "Sau if, elif, else, for, while, def, class, try, except luôn có dấu : ở cuối dòng."]],
  [/^SyntaxError$/, /unterminated string literal|EOL while scanning/, () => ["Chuỗi chưa được đóng: thiếu dấu nháy ở cuối.", "Mở chuỗi bằng nháy nào thì đóng bằng nháy đó, ví dụ: print(\"Xin chào\")."]],
  [/^SyntaxError$/, /unterminated triple-quoted/, () => ["Chuỗi ba dấu nháy (\"\"\") chưa được đóng.", "Thêm \"\"\" để kết thúc chuỗi nhiều dòng."]],
  [/^SyntaxError$/, /'\(' was never closed/, () => ["Thiếu dấu đóng ngoặc ).", "Đếm số dấu ( và ) trên dòng này, chúng phải bằng nhau."]],
  [/^SyntaxError$/, /'\[' was never closed/, () => ["Thiếu dấu đóng ngoặc vuông ].", "Danh sách mở bằng [ phải đóng bằng ]."]],
  [/^SyntaxError$/, /'\{' was never closed/, () => ["Thiếu dấu đóng ngoặc nhọn }.", "Từ điển / tập hợp mở bằng { phải đóng bằng }."]],
  [/^SyntaxError$/, /unmatched '\)'/, () => ["Thừa dấu đóng ngoặc ).", "Xóa bớt dấu ) hoặc thêm dấu ( còn thiếu."]],
  [/^SyntaxError$/, /invalid character '(.)'/, (m) => [`Có ký tự lạ ${q(m[1])} trong code (thường do dán từ Word/Zalo).`, "Gõ lại ký tự đó bằng bàn phím: dùng nháy thẳng \" ' và các dấu + - * / thường."]],
  [/^SyntaxError$/, /cannot assign to expression|cannot assign to literal/, () => ["Vế trái của dấu = phải là tên biến.", "Viết dạng ten_bien = gia_tri, ví dụ: tong = a + b (không viết a + b = tong)."]],
  [/^SyntaxError$/, /Missing parentheses in call to 'print'/, () => ["Trong Python 3, print cần dấu ngoặc tròn.", "Viết print(\"...\") thay vì print \"...\"."]],
  [/^SyntaxError$/, /invalid syntax. Maybe you meant '==' or ':=' instead of '='\?|invalid syntax\. Maybe you meant '=='/, () => ["Trong điều kiện, so sánh bằng phải dùng hai dấu ==.", "Ví dụ: if diem == 10: (một dấu = chỉ dùng để gán giá trị)."]],
  [/^SyntaxError$/, /'return' outside function/, () => ["Lệnh return chỉ dùng được bên trong hàm (def).", "Thụt lề return vào trong thân hàm, hoặc dùng print nếu muốn in ra."]],
  [/^SyntaxError$/, /'break' outside loop|'continue' (not properly in loop|outside loop)/, () => ["break / continue chỉ dùng được bên trong vòng lặp.", "Đặt lệnh này trong thân vòng for hoặc while."]],
  [/^SyntaxError$/, /f-string/, () => ["f-string viết chưa đúng.", "Dạng đúng: f\"Xin chào {ten}\", trong {} là tên biến hoặc biểu thức."]],
  [/^SyntaxError$/, /./, () => ["Câu lệnh viết sai cú pháp Python.", "Kiểm tra dòng này: dấu ngoặc, dấu nháy, dấu : và chính tả từ khóa (if, for, while, def, print...)."]],
  // ---- Runtime errors ----
  [/^NameError$/, /name '(open|eval|exec|compile)' is not defined/, (m) => [`Hàm ${q(m[1])} không được dùng trong bài làm.`, `${m[1]} bị chặn để giữ an toàn cho máy chấm. Bài tập chỉ cần print, input, range, len, str, int, float, list, dict, set (và math, random).`, true]],
  [/^NameError$/, /name '(.+)' is not defined/, (m) => [`Tên ${q(m[1])} chưa được định nghĩa.`, `Kiểm tra chính tả (Python phân biệt hoa/thường), hoặc gán giá trị cho ${m[1]} trước khi dùng. Nếu là chữ thì đặt trong dấu nháy: "${m[1]}".`]],
  [/^UnboundLocalError$/, /./, () => ["Biến được dùng trong hàm trước khi được gán giá trị.", "Gán giá trị cho biến ở đầu hàm, hoặc truyền nó vào làm tham số."]],
  [/^ZeroDivisionError$/, /./, () => ["Phép chia cho 0.", "Kiểm tra số chia trước khi chia, ví dụ: if b != 0: print(a / b)."]],
  [/^ValueError$/, /invalid literal for int\(\) with base 10: (.+)/, (m) => [`Không đổi được ${m[1]} sang số nguyên bằng int().`, "Dữ liệu nhập vào phải là chữ số (ví dụ \"12\"). Nếu có số thập phân thì dùng float()."]],
  [/^ValueError$/, /could not convert string to float: (.+)/, (m) => [`Không đổi được ${m[1]} sang số thực bằng float().`, "Dữ liệu phải là số, dùng dấu chấm cho phần thập phân (3.5, không viết 3,5)."]],
  [/^ValueError$/, /not enough values to unpack|too many values to unpack/, () => ["Số biến bên trái không khớp số giá trị bên phải.", "Ví dụ a, b = 1, 2 cần đúng 2 giá trị; với input().split() hãy kiểm tra số phần tử nhập vào."]],
  [/^ValueError$/, /./, () => ["Giá trị không hợp lệ cho thao tác này.", "Kiểm tra dữ liệu đầu vào và kiểu dữ liệu của biến."]],
  [/^TypeError$/, /can only concatenate str \(not "(\w+)"\) to str/, (m) => [`Không cộng chuỗi với ${m[1]} được.`, "Đổi số thành chuỗi bằng str(...), hoặc dùng f-string: f\"Tổng: {tong}\"."]],
  [/^TypeError$/, /unsupported operand type\(s\) for (.+): '(\w+)' and '(\w+)'/, (m) => [`Không dùng phép ${m[1]} giữa kiểu ${m[2]} và ${m[3]} được.`, "Đổi về cùng kiểu trước (int(...), float(...) hoặc str(...)). Lưu ý: input() luôn trả về chuỗi."]],
  [/^TypeError$/, /'(\w+)' object is not callable/, (m) => [`Giá trị kiểu ${m[1]} không gọi như hàm được (thừa dấu ngoặc?).`, "Kiểm tra có đặt tên biến trùng tên hàm (ví dụ sum = 0 rồi gọi sum(...)) hoặc thừa dấu ()."]],
  [/^TypeError$/, /'(\w+)' object is not subscriptable/, (m) => [`Không lấy phần tử [..] từ kiểu ${m[1]} được.`, "Chỉ chuỗi, danh sách, tuple, từ điển mới dùng [ ] được."]],
  [/^TypeError$/, /'(\w+)' object is not iterable/, (m) => [`Không lặp for qua kiểu ${m[1]} được.`, "Với số nguyên hãy dùng range(n), ví dụ: for i in range(n):"]],
  [/^TypeError$/, /missing (\d+) required positional argument/, () => ["Gọi hàm thiếu tham số.", "Truyền đủ số tham số như khi định nghĩa hàm def."]],
  [/^TypeError$/, /takes (\d+) positional arguments? but (\d+) (were|was) given/, (m) => [`Hàm nhận ${m[1]} tham số nhưng được truyền ${m[2]}.`, "Kiểm tra lại số tham số khi gọi hàm."]],
  [/^TypeError$/, /'(.+)' not supported between instances of '(\w+)' and '(\w+)'/, (m) => [`Không so sánh ${m[1]} giữa kiểu ${m[2]} và ${m[3]} được.`, "Đổi về cùng kiểu (thường là int(input()) thay vì input())."]],
  [/^TypeError$/, /./, () => ["Sai kiểu dữ liệu cho thao tác này.", "Kiểm tra kiểu của từng biến (số, chuỗi, danh sách) trên dòng bị lỗi."]],
  [/^IndexError$/, /out of range/, () => ["Vị trí (chỉ số) vượt quá độ dài.", "Chỉ số bắt đầu từ 0 và nhỏ hơn len(...). Ví dụ danh sách 3 phần tử chỉ có vị trí 0, 1, 2."]],
  [/^KeyError$/, /(.+)/, (m) => [`Từ điển không có khóa ${m[1]}.`, "Kiểm tra chính tả khóa, hoặc dùng .get(khoa, gia_tri_mac_dinh)."]],
  [/^AttributeError$/, /'(\w+)' object has no attribute '(\w+)'/, (m) => [`Kiểu ${m[1]} không có ${q(m[2])}.`, "Kiểm tra chính tả tên phương thức và kiểu của biến (ví dụ chuỗi có .upper(), danh sách có .append())."]],
  [/^RecursionError$/, /./, () => ["Hàm gọi lại chính nó quá nhiều lần (đệ quy không dừng).", "Kiểm tra điều kiện dừng của hàm đệ quy và chắc chắn mỗi lần gọi đều tiến gần tới điều kiện dừng."]],
  [/^EOFError$/, /./, () => ["Chương trình gọi input() nhiều hơn số dòng dữ liệu đầu vào.", "Thêm dữ liệu ở tab Đầu vào (mỗi dòng một lần input()), hoặc bớt lệnh input()."]],
  [/^ImportError$/, /Không được import module '([\w.]+)' trong bài làm/, (m) => [`Bài làm không được dùng module ${q(m[1])}.`, `Module ${m[1]} bị chặn để giữ an toàn cho máy chấm. Bài tập chỉ cần print, input, range, len, str, int, float, list, dict, set (và math, random). Bỏ dòng import ${m[1]} đi là chạy được.`, true]],
  [/^(ModuleNotFoundError|ImportError)$/, /No module named '([\w.]+)'/, (m) => [`Không có thư viện ${q(m[1])} trong môi trường học.`, "Môi trường học chỉ có thư viện chuẩn của Python (math, random, json, sqlite3, datetime...). Không cài thêm thư viện và không có mạng."]],
  [/^(OSError|ConnectionError|ConnectionRefusedError|TimeoutError|gaierror)$/, /Network is unreachable|Name or service not known|Temporary failure in name resolution|Connection refused/, () => ["Môi trường học không có kết nối mạng.", "Bài tập chạy trong môi trường không có Internet. Các bài về HTTP/API dùng dữ liệu mẫu có sẵn trong đề."]],
  [/^(OSError|PermissionError|FileNotFoundError)$/, /./, () => ["Không mở được tệp hoặc thư mục này.", "Trong môi trường học chỉ được đọc/ghi tệp trong thư mục hiện tại (tối đa vài MB) và tệp sẽ bị xóa sau khi chạy."]],
  [/^MemoryError$/, /./, () => ["Chương trình dùng quá nhiều bộ nhớ.", "Bài tập ở đây chỉ cần dữ liệu nhỏ. Kiểm tra danh sách/chuỗi đang phình to trong vòng lặp."]],
  [/^Timeout$/, /^$|./, () => ["Chương trình chạy quá lâu nên đã bị dừng (có thể là vòng lặp vô hạn).", "Kiểm tra điều kiện dừng của vòng while, và input() trong vòng lặp có đủ dữ liệu không."]],
  [/^OutputLimit$/, /^$|./, () => ["Chương trình in ra quá nhiều nên đã bị dừng.", "Có thể vòng lặp in ra không bao giờ dừng. Kiểm tra điều kiện dừng."]],
  [/^AssertionError$/, /./, () => ["Một lệnh assert không đúng.", "Giá trị thực tế khác với giá trị bạn khẳng định trong assert."]],
];

// err: { type, message, line, text? } from harness
export function translatePyError(err) {
  const type = String(err?.type || "Error");
  const msg = String(err?.message || "");
  for (const [tRe, mRe, fn] of RULES) {
    if (!tRe.test(type)) continue;
    const m = msg.match(mRe);
    if (!m) continue;
    const [message, fix, hideOriginal] = fn(m);
    const original = (type === "Timeout" || type === "OutputLimit" || hideOriginal) ? "" : ` (Python báo: ${type}${msg ? ": " + msg : ""})`;
    return { line: Number(err.line) || 0, message: message + original, fix, type };
  }
  return { line: Number(err.line) || 0, message: `Chương trình gặp lỗi ${type}${msg ? ": " + msg : ""}.`, fix: "Đọc kỹ dòng bị lỗi, kiểm tra tên biến, kiểu dữ liệu và giá trị.", type };
}

export function statusErrorPy(status, timeoutMs) {
  if (status === "timeout") return { line: 0, message: `Chương trình chạy quá ${Math.round(timeoutMs / 1000)} giây nên đã bị dừng (có thể là vòng lặp vô hạn hoặc tính toán quá nặng).`, fix: "Kiểm tra điều kiện dừng của vòng lặp while, range() của vòng for, và điều kiện dừng của hàm đệ quy." };
  if (status === "memory") return { line: 0, message: "Chương trình dùng quá nhiều bộ nhớ nên đã bị dừng.", fix: "Bài tập ở đây chỉ cần dữ liệu nhỏ. Kiểm tra các danh sách hoặc chuỗi đang phình to trong vòng lặp." };
  if (status === "busy") return { line: 0, message: "Máy chủ đang chấm quá nhiều bài cùng lúc.", fix: "Chờ vài giây rồi bấm lại." };
  return { line: 0, message: "Bộ chạy code đang gặp sự cố.", fix: "Bấm chạy lại sau ít giây. Nếu lỗi lặp lại, báo cho quản trị viên." };
}
