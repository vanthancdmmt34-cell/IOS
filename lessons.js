// 10-part structured lessons (3.0.0). Each lesson: objectives, why it matters, concepts, syntax,
// example, line-by-line explanation, common mistakes, practice (server-graded with hidden tests), quick quiz, summary.
// Stage 1 is free. Stages 2 and 3 require Pro (entitlement checked on the server).
// Quiz answers and hidden test cases are NEVER sent to the browser.

export const LESSON_STAGES = [
  { id: 1, title: "Giai đoạn 1: Nền tảng", desc: "Từ lệnh print đầu tiên đến danh sách. Miễn phí cho mọi người.", pro: false },
  { id: 2, title: "Giai đoạn 2: Python thực chiến", desc: "Hàm nâng cao, dict, xử lý lỗi, lập trình hướng đối tượng.", pro: false },
  { id: 3, title: "Giai đoạn 3: Thử thách thuật toán", desc: "Bài toán nhiều bước về danh sách, thống kê, số học và xử lý chuỗi.", pro: false },
];

const T = (input, expected, hidden = false) => ({ input, expected, hidden });

export const LESSONS = [
  // ---------------- STAGE 1 ----------------
  {
    id: "l01", slug: "lenh-print-va-chu-thich", stage: 1, pro: false, minutes: 15,
    title: "Lệnh print và chú thích",
    description: "Viết chương trình Python đầu tiên: in chữ ra màn hình bằng print, in nhiều giá trị, dùng chú thích để ghi chú trong code.",
    objectives: ["Dùng print() để in chữ và số ra màn hình", "In nhiều giá trị trên một dòng", "Viết chú thích bằng dấu #"],
    why: "Mọi chương trình đều cần cho người dùng thấy kết quả. print() là cách đơn giản nhất để chương trình \"nói chuyện\" với bạn, và cũng là công cụ số một để kiểm tra code đang chạy đúng hay sai.",
    concept: "Chương trình Python chạy lần lượt từng dòng, từ trên xuống dưới.\n\nprint(...) in ra những gì nằm trong ngoặc. Chữ (chuỗi) phải đặt trong dấu nháy \"...\" hoặc '...'. Số thì viết trực tiếp, không cần nháy.\n\nKhi đưa nhiều giá trị vào print, cách nhau bằng dấu phẩy, Python tự chèn một dấu cách giữa chúng.\n\nDòng bắt đầu bằng # là chú thích: Python bỏ qua, chỉ để người đọc hiểu code.",
    syntax: "print(\"chữ cần in\")\nprint(gia_tri_1, gia_tri_2)\n# đây là chú thích",
    example: { code: "# Chương trình đầu tiên\nprint(\"Xin chào Python\")\nprint(\"Năm nay là\", 2026)\nprint(3 + 4)", output: "Xin chào Python\nNăm nay là 2026\n7" },
    walkthrough: [
      "Dòng 1: chú thích, Python bỏ qua.",
      "Dòng 2: in chuỗi Xin chào Python.",
      "Dòng 3: in hai giá trị, một chuỗi và một số; Python tự thêm dấu cách ở giữa.",
      "Dòng 4: Python tính 3 + 4 trước rồi in kết quả 7.",
    ],
    mistakes: [
      { wrong: "print(Xin chào)", why: "Thiếu dấu nháy, Python tưởng Xin là tên biến và báo NameError hoặc SyntaxError.", fix: "print(\"Xin chào\")" },
      { wrong: "Print(\"Xin chào\")", why: "Python phân biệt chữ hoa chữ thường. Print khác print.", fix: "print(\"Xin chào\")" },
      { wrong: "print(\"Xin chào\"", why: "Thiếu dấu đóng ngoặc.", fix: "print(\"Xin chào\")" },
    ],
    practice: [
      { id: "l01p1", title: "Lời chào hai dòng", prompt: "In ra đúng 2 dòng:\nTôi đang học Python\nHọc từ con số 0", starter: "# Viết code của bạn ở đây\n", require: ["print"], tests: [T("", "Tôi đang học Python\nHọc từ con số 0")], sample: "print(\"Tôi đang học Python\")\nprint(\"Học từ con số 0\")" },
      { id: "l01p2", title: "In phép tính", prompt: "In ra dòng: Tổng là 15 (Python phải tự tính 7 + 8, đừng gõ sẵn số 15).", starter: "print(\"Tổng là\", ...)\n", require: ["print"], tests: [T("", "Tổng là 15")], sample: "print(\"Tổng là\", 7 + 8)", forbid: ["15"] },
    ],
    quiz: [
      { q: "print(\"A\", \"B\") in ra gì?", options: ["AB", "A B", "A,B", "\"A\" \"B\""], answer: 1, explain: "Nhiều giá trị cách nhau bằng dấu phẩy được in cách nhau một dấu cách." },
      { q: "Dòng nào là chú thích?", options: ["// ghi chú", "# ghi chú", "<!-- ghi chú -->", "/* ghi chú */"], answer: 1, explain: "Trong Python, chú thích bắt đầu bằng dấu #." },
      { q: "print(2 * 3) in ra gì?", options: ["2 * 3", "6", "23", "Lỗi"], answer: 1, explain: "Không có dấu nháy nên Python tính phép nhân rồi in 6." },
    ],
    summary: ["print() in giá trị ra màn hình, mỗi lệnh print in một dòng.", "Chuỗi đặt trong nháy, số thì không.", "Dấu phẩy trong print chèn một dấu cách.", "# bắt đầu chú thích."],
  },
  {
    id: "l02", slug: "bien-va-kieu-du-lieu", stage: 1, pro: false, minutes: 20,
    title: "Biến và kiểu dữ liệu",
    description: "Biến là gì, cách đặt tên biến, bốn kiểu dữ liệu cơ bản int, float, str, bool và hàm type().",
    objectives: ["Tạo biến và gán giá trị", "Phân biệt int, float, str, bool", "Dùng type() để xem kiểu", "Đặt tên biến đúng quy tắc"],
    why: "Chương trình cần nhớ thông tin: tên người dùng, điểm số, giá tiền. Biến là \"chiếc hộp có nhãn\" để cất và lấy lại thông tin đó.",
    concept: "Viết ten_bien = gia_tri để tạo biến. Dấu = trong Python nghĩa là gán (cất giá trị vào hộp), không phải \"bằng nhau\".\n\nBốn kiểu cơ bản: int là số nguyên (10, -3), float là số thực (3.14, 5.0), str là chuỗi chữ (\"Lan\"), bool là đúng/sai (True, False).\n\nTên biến gồm chữ, số, dấu _, không bắt đầu bằng số, không có dấu cách. Nên dùng tên có nghĩa như diem_toan thay vì x.\n\nGán lại giá trị mới thì giá trị cũ mất đi.",
    syntax: "ten = \"Lan\"\ntuoi = 15\nchieu_cao = 1.55\nda_dang_ky = True\nprint(type(tuoi))",
    example: { code: "ten = \"Lan\"\ntuoi = 15\ntuoi = tuoi + 1\nprint(ten, \"năm sau\", tuoi, \"tuổi\")\nprint(type(ten))", output: "Lan năm sau 16 tuổi\n<class 'str'>" },
    walkthrough: [
      "Dòng 1: tạo biến ten chứa chuỗi \"Lan\".",
      "Dòng 2: tạo biến tuoi chứa số nguyên 15.",
      "Dòng 3: lấy giá trị cũ 15 cộng 1 rồi gán lại vào tuoi, giờ tuoi là 16.",
      "Dòng 4: in các giá trị, cách nhau dấu cách.",
      "Dòng 5: type(ten) cho biết ten có kiểu str.",
    ],
    mistakes: [
      { wrong: "2ten = \"Lan\"", why: "Tên biến không được bắt đầu bằng số.", fix: "ten2 = \"Lan\"" },
      { wrong: "ho ten = \"Lan\"", why: "Tên biến không có dấu cách.", fix: "ho_ten = \"Lan\"" },
      { wrong: "print(Tuoi)", why: "Đã tạo tuoi (chữ thường) nhưng lại gọi Tuoi: Python báo NameError.", fix: "print(tuoi)" },
    ],
    practice: [
      { id: "l02p1", title: "Giới thiệu bản thân", prompt: "Tạo biến ten = \"Minh\" và tuoi = 12. Sau đó in: Minh 12 tuổi (dùng biến, không gõ thẳng).", starter: "ten = \"Minh\"\ntuoi = 12\n", require: ["variable", "print"], tests: [T("", "Minh 12 tuổi")], sample: "ten = \"Minh\"\ntuoi = 12\nprint(ten, tuoi, \"tuổi\")" },
      { id: "l02p2", title: "Kiểu của giá trị", prompt: "Tạo biến gia = 9.5. In ra kiểu của biến gia bằng type().", starter: "gia = 9.5\n", require: ["print"], tests: [T("", "<class 'float'>")], sample: "gia = 9.5\nprint(type(gia))" },
    ],
    quiz: [
      { q: "Giá trị 5.0 có kiểu gì?", options: ["int", "float", "str", "bool"], answer: 1, explain: "Có dấu chấm thập phân nên là số thực float." },
      { q: "Tên biến nào hợp lệ?", options: ["diem toan", "1diem", "diem_toan", "diem-toan"], answer: 2, explain: "Chỉ dùng chữ, số, dấu gạch dưới và không bắt đầu bằng số." },
      { q: "Sau x = 3 rồi x = x * 2, x bằng bao nhiêu?", options: ["3", "5", "6", "x * 2"], answer: 2, explain: "Vế phải tính trước: 3 * 2 = 6, rồi gán lại cho x." },
    ],
    summary: ["= là phép gán.", "int, float, str, bool là 4 kiểu cơ bản.", "type() cho biết kiểu của giá trị.", "Tên biến phân biệt hoa thường, nên đặt tên có nghĩa."],
  },
  {
    id: "l03", slug: "nhap-du-lieu-input", stage: 1, pro: false, minutes: 20,
    title: "Nhập dữ liệu với input()",
    description: "Đọc dữ liệu người dùng gõ vào bằng input(), đổi chuỗi sang số bằng int() và float(), phép chia / và //.",
    objectives: ["Đọc dữ liệu bằng input()", "Đổi kiểu bằng int(), float(), str()", "Hiểu khác biệt giữa / và //, %"],
    why: "Chương trình hữu ích phải nhận dữ liệu từ người dùng: nhập tên, nhập điểm, nhập số tiền. input() làm việc này.",
    concept: "input() đọc một dòng người dùng gõ vào và LUÔN trả về chuỗi (str), kể cả khi họ gõ số.\n\nMuốn tính toán phải đổi sang số: int(input()) cho số nguyên, float(input()) cho số thực.\n\nPhép chia / luôn cho kết quả float (7 / 2 = 3.5, 6 / 2 = 3.0). Phép // chia lấy phần nguyên (7 // 2 = 3), phép % lấy phần dư (7 % 2 = 1).\n\nTrên Python Lab, dữ liệu nhập được lấy từ ô \"Dữ liệu vào\", mỗi dòng là một lần input().",
    syntax: "ten = input()\nn = int(input())\nx = float(input())",
    example: { code: "a = int(input())\nb = int(input())\nprint(\"Tổng:\", a + b)\nprint(\"Thương:\", a / b)\nprint(\"Dư:\", a % b)", input: "7\n2", output: "Tổng: 9\nThương: 3.5\nDư: 1" },
    walkthrough: [
      "Dòng 1: đọc dòng đầu \"7\", đổi thành số 7, gán vào a.",
      "Dòng 2: đọc dòng thứ hai \"2\", đổi thành số 2.",
      "Dòng 3: 7 + 2 = 9.",
      "Dòng 4: 7 / 2 = 3.5 (luôn ra số thực).",
      "Dòng 5: 7 chia 2 dư 1.",
    ],
    mistakes: [
      { wrong: "a = input()\nprint(a + 1)", why: "a là chuỗi, không cộng được với số: TypeError.", fix: "a = int(input())" },
      { wrong: "a = input()\nb = input()\nprint(a + b)  # nhập 2 và 3", why: "Cộng hai chuỗi là nối chuỗi, in ra 23 chứ không phải 5.", fix: "Dùng int(input()) cho cả hai." },
      { wrong: "n = int(input())  # người dùng gõ 2.5", why: "int() không đổi được chuỗi có dấu chấm: ValueError.", fix: "Dùng float(input()) khi dữ liệu có thể là số thực." },
    ],
    practice: [
      { id: "l03p1", title: "Chào theo tên", prompt: "Đọc một tên từ bàn phím rồi in: Xin chào <tên>!\nVí dụ nhập An thì in: Xin chào An!", starter: "ten = input()\n", require: ["input", "print"], tests: [T("An", "Xin chào An!"), T("Bình", "Xin chào Bình!"), T("Thu Hà", "Xin chào Thu Hà!", true)], sample: "ten = input()\nprint(\"Xin chào \" + ten + \"!\")" },
      { id: "l03p2", title: "Chu vi hình chữ nhật", prompt: "Đọc chiều dài và chiều rộng (hai số nguyên, mỗi số một dòng). In chu vi = (dài + rộng) * 2.", starter: "dai = int(input())\nrong = int(input())\n", require: ["input", "print"], tests: [T("5\n3", "16"), T("10\n10", "40"), T("0\n7", "14", true), T("123\n45", "336", true)], sample: "dai = int(input())\nrong = int(input())\nprint((dai + rong) * 2)" },
    ],
    quiz: [
      { q: "input() trả về kiểu gì?", options: ["int", "float", "str", "Tùy dữ liệu gõ vào"], answer: 2, explain: "input() luôn trả về chuỗi, cần int()/float() để đổi sang số." },
      { q: "9 // 4 bằng bao nhiêu?", options: ["2.25", "2", "1", "3"], answer: 1, explain: "// lấy phần nguyên của phép chia." },
      { q: "8 / 2 in ra gì?", options: ["4", "4.0", "4.00", "Lỗi"], answer: 1, explain: "Phép / luôn cho số thực, nên in 4.0." },
    ],
    summary: ["input() luôn trả về chuỗi.", "int(), float() đổi chuỗi sang số.", "/ cho số thực, // lấy phần nguyên, % lấy phần dư."],
  },
  {
    id: "l04", slug: "cau-lenh-dieu-kien-if", stage: 1, pro: false, minutes: 25,
    title: "Câu lệnh điều kiện if / elif / else",
    description: "Cho chương trình ra quyết định: so sánh, if, elif, else, toán tử and/or/not và quy tắc thụt lề.",
    objectives: ["Dùng toán tử so sánh ==, !=, <, >, <=, >=", "Viết if / elif / else", "Kết hợp điều kiện bằng and, or, not", "Thụt lề đúng"],
    why: "Chương trình thông minh phải biết rẽ nhánh: đủ điểm thì đậu, thiếu thì rớt; đúng mật khẩu thì vào, sai thì báo lỗi.",
    concept: "if dieu_kien: chạy khối lệnh thụt lề bên dưới khi điều kiện đúng.\n\nelif (else if) kiểm tra tiếp điều kiện khác khi các điều kiện trước sai. else chạy khi tất cả đều sai. Python dừng ở nhánh ĐẦU TIÊN đúng.\n\nSo sánh bằng dùng ==, còn = là gán. Kết hợp điều kiện: and (cả hai đúng), or (một trong hai đúng), not (đảo).\n\nSau dấu : phải xuống dòng và thụt lề 4 dấu cách. Các dòng cùng khối phải thụt đều nhau.",
    syntax: "if dieu_kien_1:\n    lenh\nelif dieu_kien_2:\n    lenh\nelse:\n    lenh",
    example: { code: "diem = float(input())\nif diem >= 8:\n    print(\"Giỏi\")\nelif diem >= 5:\n    print(\"Đạt\")\nelse:\n    print(\"Chưa đạt\")", input: "6.5", output: "Đạt" },
    walkthrough: [
      "Dòng 1: đọc điểm 6.5.",
      "Dòng 2: 6.5 >= 8 sai, bỏ qua dòng 3.",
      "Dòng 4: 6.5 >= 5 đúng, chạy dòng 5 in Đạt.",
      "Dòng 6-7: không chạy nữa vì đã có nhánh đúng.",
    ],
    mistakes: [
      { wrong: "if x = 5:", why: "= là gán; so sánh phải dùng ==.", fix: "if x == 5:" },
      { wrong: "if x > 3\n    print(x)", why: "Thiếu dấu hai chấm cuối dòng if.", fix: "if x > 3:" },
      { wrong: "if x > 3:\nprint(x)", why: "Khối lệnh sau if phải thụt lề: IndentationError.", fix: "Thêm 4 dấu cách trước print(x)." },
    ],
    practice: [
      { id: "l04p1", title: "Chẵn hay lẻ", prompt: "Đọc một số nguyên n. In Chẵn nếu n chia hết cho 2, ngược lại in Lẻ.", starter: "n = int(input())\n", require: ["if", "input"], tests: [T("4", "Chẵn"), T("7", "Lẻ"), T("0", "Chẵn", true), T("-3", "Lẻ", true)], sample: "n = int(input())\nif n % 2 == 0:\n    print(\"Chẵn\")\nelse:\n    print(\"Lẻ\")" },
      { id: "l04p2", title: "Xếp loại nhiệt độ", prompt: "Đọc nhiệt độ t (số nguyên). In:\nLạnh nếu t < 18\nMát nếu 18 <= t <= 28\nNóng nếu t > 28", starter: "t = int(input())\n", require: ["if", "input"], tests: [T("10", "Lạnh"), T("25", "Mát"), T("35", "Nóng"), T("18", "Mát", true), T("28", "Mát", true), T("29", "Nóng", true)], sample: "t = int(input())\nif t < 18:\n    print(\"Lạnh\")\nelif t <= 28:\n    print(\"Mát\")\nelse:\n    print(\"Nóng\")" },
    ],
    quiz: [
      { q: "Toán tử nào so sánh bằng?", options: ["=", "==", "===", "equals"], answer: 1, explain: "== so sánh, = là gán." },
      { q: "x = 7. Biểu thức x > 5 and x < 10 có giá trị?", options: ["True", "False", "7", "Lỗi"], answer: 0, explain: "Cả hai điều kiện đều đúng nên and cho True." },
      { q: "Có nhiều nhánh elif đúng thì Python chạy nhánh nào?", options: ["Tất cả", "Nhánh cuối", "Nhánh đầu tiên đúng", "Không nhánh nào"], answer: 2, explain: "Python dừng ở nhánh đầu tiên có điều kiện đúng." },
    ],
    summary: ["if / elif / else để rẽ nhánh.", "== so sánh, = gán.", "and, or, not kết hợp điều kiện.", "Dấu : và thụt lề 4 dấu cách là bắt buộc."],
  },
  {
    id: "l05", slug: "vong-lap-for-while", stage: 1, pro: false, minutes: 30,
    title: "Vòng lặp for và while",
    description: "Lặp lại công việc với for và range(), while, cộng dồn, break và continue.",
    objectives: ["Dùng for với range(start, stop, step)", "Dùng while với điều kiện dừng", "Viết mẫu cộng dồn", "Dùng break, continue"],
    why: "Máy tính giỏi nhất là làm đi làm lại không mệt. In 100 dòng, cộng 1000 số, duyệt danh sách học viên: tất cả cần vòng lặp.",
    concept: "for i in range(n): lặp n lần với i = 0, 1, ..., n-1. range(a, b) đi từ a đến b-1. range(a, b, buoc) nhảy theo bước.\n\nwhile dieu_kien: lặp chừng nào điều kiện còn đúng. Phải có lệnh làm điều kiện dần sai, nếu không sẽ lặp vô tận (máy chấm dừng sau vài giây).\n\nMẫu cộng dồn: tạo tong = 0 trước vòng lặp, mỗi vòng tong = tong + gia_tri.\n\nbreak thoát vòng lặp ngay; continue bỏ qua phần còn lại của vòng hiện tại.",
    syntax: "for i in range(1, 6):\n    print(i)\n\nwhile n > 0:\n    n = n - 1",
    example: { code: "n = int(input())\ntong = 0\nfor i in range(1, n + 1):\n    tong = tong + i\nprint(\"Tổng 1 đến\", n, \"là\", tong)", input: "5", output: "Tổng 1 đến 5 là 15" },
    walkthrough: [
      "Dòng 1: n = 5.",
      "Dòng 2: tong bắt đầu bằng 0.",
      "Dòng 3: i chạy 1, 2, 3, 4, 5 (range dừng trước n + 1 = 6).",
      "Dòng 4: mỗi vòng cộng i vào tong: 1, 3, 6, 10, 15.",
      "Dòng 5: sau vòng lặp mới in (dòng này KHÔNG thụt lề).",
    ],
    mistakes: [
      { wrong: "for i in range(1, 5):  # muốn 1..5", why: "range dừng trước số cuối, chỉ có 1..4.", fix: "range(1, 6) hoặc range(1, n + 1)" },
      { wrong: "while i < 5:\n    print(i)", why: "Không tăng i nên lặp vô tận.", fix: "Thêm i = i + 1 trong vòng lặp." },
      { wrong: "for i in range(5):\n    tong = 0\n    tong = tong + i", why: "Đặt tong = 0 trong vòng lặp làm tổng bị xóa mỗi vòng.", fix: "Đặt tong = 0 trước vòng for." },
    ],
    practice: [
      { id: "l05p1", title: "Bảng cửu chương", prompt: "Đọc số n. In bảng nhân n từ 1 đến 10, mỗi dòng dạng: n x i = kết quả\nVí dụ n = 3, dòng đầu: 3 x 1 = 3", starter: "n = int(input())\n", require: ["for", "input"], tests: [T("3", Array.from({ length: 10 }, (_, i) => `3 x ${i + 1} = ${3 * (i + 1)}`).join("\n")), T("9", Array.from({ length: 10 }, (_, i) => `9 x ${i + 1} = ${9 * (i + 1)}`).join("\n"), true)], sample: "n = int(input())\nfor i in range(1, 11):\n    print(n, \"x\", i, \"=\", n * i)" },
      { id: "l05p2", title: "Tổng các chữ số", prompt: "Đọc số nguyên dương n. In tổng các chữ số của n bằng vòng lặp while (gợi ý: n % 10 lấy chữ số cuối, n // 10 bỏ chữ số cuối).", starter: "n = int(input())\ntong = 0\n", require: ["while", "input"], tests: [T("123", "6"), T("9", "9"), T("1000", "1", true), T("987654321", "45", true)], sample: "n = int(input())\ntong = 0\nwhile n > 0:\n    tong = tong + n % 10\n    n = n // 10\nprint(tong)" },
    ],
    quiz: [
      { q: "range(2, 8, 2) cho các số nào?", options: ["2 4 6 8", "2 4 6", "2 3 4 5 6 7", "4 6 8"], answer: 1, explain: "Bắt đầu 2, bước 2, dừng trước 8." },
      { q: "Lệnh nào thoát vòng lặp ngay lập tức?", options: ["continue", "stop", "break", "exit"], answer: 2, explain: "break thoát vòng lặp." },
      { q: "for i in range(3): chạy bao nhiêu lần?", options: ["2", "3", "4", "Vô hạn"], answer: 1, explain: "i = 0, 1, 2: ba lần." },
    ],
    summary: ["for + range để lặp số lần biết trước.", "while lặp theo điều kiện, nhớ làm điều kiện dần sai.", "Biến cộng dồn khởi tạo trước vòng lặp.", "break thoát, continue bỏ qua vòng hiện tại."],
  },
  {
    id: "l06", slug: "danh-sach-list", stage: 1, pro: false, minutes: 30,
    title: "Danh sách (list)",
    description: "Lưu nhiều giá trị trong một biến: tạo list, chỉ số, append, len, duyệt list, sum, max, min, split().",
    objectives: ["Tạo list và truy cập phần tử bằng chỉ số", "Thêm, sửa phần tử", "Duyệt list bằng for", "Dùng len, sum, max, min", "Đọc nhiều số trên một dòng bằng split()"],
    why: "Lớp học có 40 học viên, không ai tạo 40 biến. List giữ cả dãy giá trị trong một biến và xử lý chúng bằng vòng lặp.",
    concept: "List viết trong ngoặc vuông: diem = [8, 6, 9].\n\nChỉ số bắt đầu từ 0: diem[0] là 8. diem[-1] là phần tử cuối. Truy cập chỉ số không tồn tại gây IndexError.\n\nappend(x) thêm x vào cuối. len(ds) là số phần tử. sum, max, min tính tổng, lớn nhất, nhỏ nhất.\n\ninput().split() tách một dòng thành list các chuỗi; dùng [int(x) for x in input().split()] hoặc list(map(int, input().split())) để được list số.",
    syntax: "ds = [1, 2, 3]\nds.append(4)\nprint(ds[0], len(ds))\nfor x in ds:\n    print(x)",
    example: { code: "diem = list(map(int, input().split()))\nprint(\"Số bài:\", len(diem))\nprint(\"Cao nhất:\", max(diem))\nprint(\"Trung bình:\", sum(diem) / len(diem))", input: "8 6 10", output: "Số bài: 3\nCao nhất: 10\nTrung bình: 8.0" },
    walkthrough: [
      "Dòng 1: tách \"8 6 10\" thành [\"8\", \"6\", \"10\"], đổi từng phần tử sang số: [8, 6, 10].",
      "Dòng 2: len cho 3.",
      "Dòng 3: max cho 10.",
      "Dòng 4: 24 / 3 = 8.0 (phép / cho số thực).",
    ],
    mistakes: [
      { wrong: "ds = [1, 2, 3]\nprint(ds[3])", why: "List có 3 phần tử, chỉ số chỉ từ 0 đến 2: IndexError.", fix: "print(ds[2]) hoặc ds[-1]" },
      { wrong: "ds = input().split()\nprint(sum(ds))", why: "Các phần tử vẫn là chuỗi, sum báo TypeError.", fix: "ds = list(map(int, input().split()))" },
      { wrong: "ds.append(4, 5)", why: "append chỉ nhận một giá trị.", fix: "ds.append(4) rồi ds.append(5), hoặc ds.extend([4, 5])" },
    ],
    practice: [
      { id: "l06p1", title: "Đếm số dương", prompt: "Một dòng gồm nhiều số nguyên cách nhau dấu cách. In số lượng số lớn hơn 0.", starter: "ds = list(map(int, input().split()))\n", require: ["for", "input"], tests: [T("3 -1 4 0 5", "3"), T("-2 -3", "0"), T("7", "1", true), T("0 0 0 1", "1", true)], sample: "ds = list(map(int, input().split()))\ndem = 0\nfor x in ds:\n    if x > 0:\n        dem = dem + 1\nprint(dem)" },
      { id: "l06p2", title: "Đảo ngược danh sách", prompt: "Một dòng gồm các từ cách nhau dấu cách. In các từ theo thứ tự ngược lại, cách nhau một dấu cách.", starter: "tu = input().split()\n", require: ["input"], tests: [T("tôi học python", "python học tôi"), T("a b c d", "d c b a"), T("một", "một", true)], sample: "tu = input().split()\nprint(\" \".join(tu[::-1]))" },
    ],
    quiz: [
      { q: "ds = [5, 7, 9]. ds[1] là?", options: ["5", "7", "9", "Lỗi"], answer: 1, explain: "Chỉ số bắt đầu từ 0, nên ds[1] là phần tử thứ hai." },
      { q: "Lệnh thêm phần tử vào cuối list?", options: ["ds.add(x)", "ds.push(x)", "ds.append(x)", "ds.insert(x)"], answer: 2, explain: "append thêm vào cuối." },
      { q: "len([1, [2, 3], 4]) bằng?", options: ["3", "4", "2", "Lỗi"], answer: 0, explain: "List con [2, 3] tính là một phần tử." },
    ],
    summary: ["List trong ngoặc vuông, chỉ số từ 0.", "append, len, sum, max, min là công cụ hằng ngày.", "split() + map(int, ...) để đọc nhiều số trên một dòng."],
  },

  // ---------------- STAGE 2 (PRO) ----------------
  {
    id: "l07", slug: "ham-nang-cao", stage: 2, pro: false, minutes: 30,
    title: "Hàm: tham số mặc định, trả về nhiều giá trị",
    description: "Tự viết hàm với def, return, tham số mặc định, tham số theo tên, trả về nhiều giá trị (tuple) và phạm vi biến.",
    objectives: ["Viết hàm có return", "Dùng tham số mặc định và gọi theo tên", "Trả về nhiều giá trị bằng tuple", "Hiểu biến cục bộ"],
    why: "Hàm giúp chia chương trình lớn thành các mảnh nhỏ, đặt tên rõ ràng và dùng lại nhiều lần. Đây là bước đầu để viết code như người làm nghề.",
    concept: "def ten_ham(tham_so): định nghĩa hàm; return trả kết quả về nơi gọi. Hàm không có return trả về None.\n\nTham số mặc định: def chao(ten, loi=\"Xin chào\") cho phép gọi chao(\"An\") hoặc chao(\"An\", loi=\"Hi\").\n\nreturn a, b trả về một tuple; nhận bằng x, y = ham().\n\nBiến tạo trong hàm là biến cục bộ, biến mất khi hàm kết thúc. Nên truyền dữ liệu qua tham số và return thay vì dùng biến toàn cục.",
    syntax: "def ten_ham(a, b=10):\n    return a + b, a * b\n\ntong, tich = ten_ham(3)",
    example: { code: "def thong_ke(ds):\n    return min(ds), max(ds), sum(ds) / len(ds)\n\nnho, lon, tb = thong_ke([4, 8, 6])\nprint(nho, lon, tb)", output: "4 8 6.0" },
    walkthrough: [
      "Dòng 1-2: định nghĩa hàm thong_ke trả về 3 giá trị.",
      "Dòng 4: gọi hàm với [4, 8, 6]; tuple (4, 8, 6.0) được tách vào ba biến.",
      "Dòng 5: in ba giá trị.",
    ],
    mistakes: [
      { wrong: "def tong(a, b):\n    print(a + b)\nx = tong(1, 2) + 1", why: "Hàm chỉ print, không return, nên tong(1, 2) là None: TypeError khi cộng.", fix: "Dùng return a + b" },
      { wrong: "def f(a=1, b):", why: "Tham số mặc định phải đứng sau tham số bắt buộc: SyntaxError.", fix: "def f(b, a=1):" },
      { wrong: "def them(x, ds=[]):\n    ds.append(x)\n    return ds", why: "List mặc định được dùng chung giữa các lần gọi, kết quả cộng dồn bất ngờ.", fix: "def them(x, ds=None):\n    if ds is None:\n        ds = []" },
    ],
    practice: [
      { id: "l07p1", title: "Hàm tính tiền có giảm giá", prompt: "Viết hàm tinh_tien(gia, so_luong, giam=0) trả về gia * so_luong * (100 - giam) // 100.\nĐọc gia, so_luong, giam (mỗi số một dòng) rồi in kết quả của hàm.", starter: "def tinh_tien(gia, so_luong, giam=0):\n    # viết code ở đây\n    pass\n\ngia = int(input())\nsl = int(input())\ngiam = int(input())\nprint(tinh_tien(gia, sl, giam))\n", require: ["function", "return"], tests: [T("100000\n2\n10", "180000"), T("59000\n1\n0", "59000"), T("12345\n3\n15", "31479", true), T("1\n1\n100", "0", true)], sample: "def tinh_tien(gia, so_luong, giam=0):\n    return gia * so_luong * (100 - giam) // 100\n\ngia = int(input())\nsl = int(input())\ngiam = int(input())\nprint(tinh_tien(gia, sl, giam))" },
      { id: "l07p2", title: "Hàm trả về hai giá trị", prompt: "Viết hàm chia(a, b) trả về hai giá trị: thương nguyên và số dư. Đọc a, b trên một dòng, in thương và dư cách nhau dấu cách.", starter: "def chia(a, b):\n    pass\n\na, b = map(int, input().split())\n", require: ["function", "return"], tests: [T("17 5", "3 2"), T("10 2", "5 0"), T("3 7", "0 3", true), T("100 1", "100 0", true)], sample: "def chia(a, b):\n    return a // b, a % b\n\na, b = map(int, input().split())\nq, r = chia(a, b)\nprint(q, r)" },
    ],
    quiz: [
      { q: "Hàm không có return trả về gì?", options: ["0", "\"\"", "None", "Lỗi"], answer: 2, explain: "Python tự trả về None." },
      { q: "def f(a, b=2): return a * b. f(5) bằng?", options: ["5", "7", "10", "Lỗi"], answer: 2, explain: "b lấy giá trị mặc định 2." },
      { q: "return 1, 2 trả về kiểu gì?", options: ["list", "tuple", "hai giá trị riêng không có kiểu", "dict"], answer: 1, explain: "Nhiều giá trị cách nhau dấu phẩy tạo thành tuple." },
    ],
    summary: ["def + return để tạo hàm dùng lại được.", "Tham số mặc định đứng sau tham số bắt buộc.", "return a, b trả về tuple, nhận bằng x, y = ...", "Không dùng list làm giá trị mặc định."],
  },
  {
    id: "l08", slug: "tu-dien-dict-va-tap-hop-set", stage: 2, pro: false, minutes: 30,
    title: "Từ điển (dict) và tập hợp (set)",
    description: "Lưu dữ liệu theo khóa với dict, đếm tần suất, duyệt items(), get(); loại trùng với set.",
    objectives: ["Tạo, đọc, sửa dict", "Dùng get() để tránh KeyError", "Đếm tần suất bằng dict", "Dùng set để loại phần tử trùng"],
    why: "Danh bạ điện thoại, bảng điểm theo tên, đếm số lần xuất hiện của từ: dữ liệu dạng \"khóa → giá trị\" có mặt ở khắp nơi. dict là cấu trúc được dùng nhiều nhất trong Python thực tế.",
    concept: "dict viết {khoa: gia_tri}: diem = {\"An\": 8, \"Bình\": 7}. Lấy giá trị bằng diem[\"An\"]; gán diem[\"Chi\"] = 9 để thêm hoặc sửa.\n\nKhóa không tồn tại gây KeyError; diem.get(\"Dũng\", 0) trả 0 thay vì lỗi.\n\nDuyệt: for ten, d in diem.items(). \"An\" in diem kiểm tra khóa có tồn tại.\n\nset là tập hợp không trùng, không thứ tự: set([1, 2, 2]) là {1, 2}. Dùng sorted(set(...)) để in có thứ tự.",
    syntax: "d = {\"a\": 1}\nd[\"b\"] = 2\nfor k, v in d.items():\n    print(k, v)\ns = set([3, 1, 3])",
    example: { code: "tu = input().split()\ndem = {}\nfor w in tu:\n    dem[w] = dem.get(w, 0) + 1\nfor w in sorted(dem):\n    print(w, dem[w])", input: "mèo chó mèo gà mèo", output: "chó 1\ngà 1\nmèo 3" },
    walkthrough: [
      "Dòng 1: tách câu thành list các từ.",
      "Dòng 2: dict rỗng để đếm.",
      "Dòng 3-4: mỗi từ, lấy số đếm cũ (mặc định 0) cộng 1.",
      "Dòng 5-6: duyệt các khóa đã sắp xếp theo bảng chữ cái và in.",
    ],
    mistakes: [
      { wrong: "dem[w] = dem[w] + 1", why: "Lần đầu gặp từ w, khóa chưa có: KeyError.", fix: "dem[w] = dem.get(w, 0) + 1" },
      { wrong: "s = {}", why: "{} là dict rỗng, không phải set rỗng.", fix: "s = set()" },
      { wrong: "print(set([3, 1, 2]))  # mong đợi thứ tự", why: "set không đảm bảo thứ tự khi in.", fix: "print(sorted(s))" },
    ],
    practice: [
      { id: "l08p1", title: "Đếm ký tự", prompt: "Đọc một chuỗi (không có dấu cách). In mỗi ký tự khác nhau và số lần xuất hiện, sắp xếp theo ký tự, mỗi dòng: ký_tự số_lần.", starter: "s = input()\n", require: ["for", "input"], tests: [T("banana", "a 3\nb 1\nn 2"), T("abc", "a 1\nb 1\nc 1"), T("zzzz", "z 4", true), T("hello", "e 1\nh 1\nl 2\no 1", true)], sample: "s = input()\ndem = {}\nfor c in s:\n    dem[c] = dem.get(c, 0) + 1\nfor c in sorted(dem):\n    print(c, dem[c])" },
      { id: "l08p2", title: "Số khác nhau", prompt: "Một dòng gồm các số nguyên. In các số khác nhau theo thứ tự tăng dần, cách nhau dấu cách.", starter: "ds = list(map(int, input().split()))\n", require: ["input"], tests: [T("3 1 3 2 1", "1 2 3"), T("5 5 5", "5"), T("-1 10 -1 0", "-1 0 10", true)], sample: "ds = list(map(int, input().split()))\nprint(*sorted(set(ds)))" },
    ],
    quiz: [
      { q: "d = {\"x\": 1}. d.get(\"y\", 5) trả về?", options: ["None", "5", "KeyError", "1"], answer: 1, explain: "Khóa không có nên trả giá trị mặc định 5." },
      { q: "Cách tạo set rỗng đúng?", options: ["{}", "[]", "set()", "()"], answer: 2, explain: "{} là dict rỗng." },
      { q: "len(set(\"hello\")) bằng?", options: ["5", "4", "3", "Lỗi"], answer: 1, explain: "Các ký tự khác nhau: h, e, l, o." },
    ],
    summary: ["dict lưu khóa → giá trị, khóa không trùng.", "get(k, mac_dinh) tránh KeyError.", "items() để duyệt cả khóa và giá trị.", "set loại phần tử trùng."],
  },
  {
    id: "l09", slug: "xu-ly-loi-try-except", stage: 2, pro: false, minutes: 25,
    title: "Xử lý lỗi với try / except",
    description: "Bắt lỗi khi chương trình chạy: try, except ValueError, ZeroDivisionError, else, finally và raise.",
    objectives: ["Phân biệt lỗi cú pháp và lỗi khi chạy", "Bắt lỗi cụ thể bằng except", "Dùng else, finally", "Tự báo lỗi bằng raise"],
    why: "Người dùng sẽ nhập sai: gõ chữ khi cần số, chia cho 0. Chương trình tốt không \"sập\" mà báo lỗi rõ ràng và tiếp tục chạy.",
    concept: "Đặt code có thể lỗi trong try:. Nếu lỗi xảy ra, Python nhảy tới except phù hợp thay vì dừng chương trình.\n\nNên bắt lỗi cụ thể: except ValueError (đổi kiểu sai), except ZeroDivisionError (chia cho 0). Không nên dùng except trống vì che mất lỗi thật.\n\nelse chạy khi try không lỗi; finally luôn chạy (dọn dẹp).\n\nraise ValueError(\"thông báo\") tự báo lỗi khi dữ liệu không hợp lệ.",
    syntax: "try:\n    x = int(input())\nexcept ValueError:\n    print(\"Không phải số\")\nelse:\n    print(x * 2)",
    example: { code: "a = int(input())\nb = int(input())\ntry:\n    print(a // b)\nexcept ZeroDivisionError:\n    print(\"Không chia được cho 0\")\nfinally:\n    print(\"Xong\")", input: "5\n0", output: "Không chia được cho 0\nXong" },
    walkthrough: [
      "Dòng 1-2: a = 5, b = 0.",
      "Dòng 4: 5 // 0 gây ZeroDivisionError, Python bỏ phần còn lại của try.",
      "Dòng 5-6: nhánh except phù hợp, in thông báo.",
      "Dòng 7-8: finally luôn chạy.",
    ],
    mistakes: [
      { wrong: "try:\n    x = int(input())\nexcept:\n    pass", why: "except trống nuốt mọi lỗi, kể cả lỗi bạn gõ sai tên biến, rất khó tìm.", fix: "except ValueError: và báo ra cho người dùng." },
      { wrong: "try:\n    print(1/0)\nexcept ValueError:\n    print(\"lỗi\")", why: "Sai loại lỗi: 1/0 là ZeroDivisionError nên không được bắt.", fix: "except ZeroDivisionError:" },
      { wrong: "try\n    x = 1", why: "Thiếu dấu : sau try.", fix: "try:" },
    ],
    practice: [
      { id: "l09p1", title: "Nhập số an toàn", prompt: "Đọc một dòng. Nếu là số nguyên thì in bình phương của nó. Nếu không phải số nguyên thì in: Dữ liệu không hợp lệ", starter: "s = input()\n", require: ["try"], tests: [T("7", "49"), T("abc", "Dữ liệu không hợp lệ"), T("-3", "9", true), T("2.5", "Dữ liệu không hợp lệ", true)], sample: "s = input()\ntry:\n    n = int(s)\nexcept ValueError:\n    print(\"Dữ liệu không hợp lệ\")\nelse:\n    print(n * n)" },
      { id: "l09p2", title: "Máy tính chia", prompt: "Đọc hai dòng a và b. In kết quả a / b làm tròn 2 chữ số (dùng round). Nếu b bằng 0 in: Lỗi chia cho 0. Nếu dữ liệu không phải số in: Lỗi dữ liệu", starter: "", require: ["try"], tests: [T("7\n2", "3.5"), T("1\n0", "Lỗi chia cho 0"), T("x\n2", "Lỗi dữ liệu"), T("10\n3", "3.33", true), T("5\nabc", "Lỗi dữ liệu", true)], sample: "try:\n    a = float(input())\n    b = float(input())\n    print(round(a / b, 2))\nexcept ZeroDivisionError:\n    print(\"Lỗi chia cho 0\")\nexcept ValueError:\n    print(\"Lỗi dữ liệu\")" },
    ],
    quiz: [
      { q: "int(\"abc\") gây lỗi gì?", options: ["TypeError", "ValueError", "NameError", "SyntaxError"], answer: 1, explain: "Chuỗi không đổi được sang số: ValueError." },
      { q: "Khối nào luôn chạy dù có lỗi hay không?", options: ["else", "except", "finally", "try"], answer: 2, explain: "finally luôn chạy." },
      { q: "try/except có bắt được SyntaxError trong chính khối try không?", options: ["Có", "Không, vì code không chạy được ngay từ đầu", "Chỉ với except trống", "Chỉ khi có finally"], answer: 1, explain: "Lỗi cú pháp được phát hiện trước khi chạy, nên try không có cơ hội bắt." },
    ],
    summary: ["try/except giúp chương trình không sập.", "Bắt lỗi cụ thể, tránh except trống.", "else khi không lỗi, finally luôn chạy.", "raise để tự báo lỗi."],
  },
  {
    id: "l10", slug: "lap-trinh-huong-doi-tuong-class", stage: 2, pro: false, minutes: 35,
    title: "Lập trình hướng đối tượng: class",
    description: "Tạo class, hàm khởi tạo __init__, thuộc tính, phương thức, self, __str__ và tạo nhiều đối tượng.",
    objectives: ["Định nghĩa class với __init__", "Hiểu self", "Viết phương thức thay đổi trạng thái đối tượng", "Dùng __str__ để in đối tượng đẹp"],
    why: "Khi chương trình lớn dần, gom dữ liệu và hành vi liên quan vào một \"khuôn\" giúp code dễ hiểu và dễ mở rộng. Hầu hết thư viện Python (Django, pandas...) đều dựa trên class.",
    concept: "class là khuôn mẫu, đối tượng là sản phẩm tạo từ khuôn. class TaiKhoan: định nghĩa khuôn; tk = TaiKhoan(\"An\", 100) tạo một đối tượng.\n\n__init__ chạy khi tạo đối tượng, dùng để gán thuộc tính: self.ten = ten.\n\nself là chính đối tượng đang được dùng; mọi phương thức đều có self là tham số đầu tiên.\n\n__str__ trả về chuỗi được dùng khi print(doi_tuong).",
    syntax: "class TenClass:\n    def __init__(self, a):\n        self.a = a\n\n    def phuong_thuc(self):\n        return self.a\n\nx = TenClass(5)",
    example: { code: "class TaiKhoan:\n    def __init__(self, chu, so_du=0):\n        self.chu = chu\n        self.so_du = so_du\n\n    def nap(self, tien):\n        self.so_du += tien\n\n    def __str__(self):\n        return f\"{self.chu}: {self.so_du}đ\"\n\ntk = TaiKhoan(\"An\", 100)\ntk.nap(50)\nprint(tk)", output: "An: 150đ" },
    walkthrough: [
      "Dòng 1-4: khuôn TaiKhoan có hai thuộc tính chu, so_du.",
      "Dòng 6-7: phương thức nap cộng tiền vào so_du của chính đối tượng (self).",
      "Dòng 9-10: __str__ quyết định cách in đối tượng.",
      "Dòng 12: tạo đối tượng, __init__ chạy với chu = \"An\", so_du = 100.",
      "Dòng 13-14: nạp 50 rồi in, Python gọi __str__.",
    ],
    mistakes: [
      { wrong: "def nap(tien):\n    self.so_du += tien", why: "Thiếu self ở tham số đầu: khi gọi tk.nap(50) báo TypeError.", fix: "def nap(self, tien):" },
      { wrong: "def __init__(self, chu):\n    chu = chu", why: "Chỉ gán biến cục bộ, đối tượng không có thuộc tính chu.", fix: "self.chu = chu" },
      { wrong: "def __int__(self, chu):", why: "Gõ nhầm __int__ thay vì __init__, hàm khởi tạo không được gọi.", fix: "def __init__(self, chu):" },
    ],
    practice: [
      { id: "l10p1", title: "Hình chữ nhật", prompt: "Viết class HinhChuNhat có __init__(self, dai, rong), phương thức dien_tich() và chu_vi().\nĐọc dai, rong trên một dòng, in diện tích và chu vi trên hai dòng.", starter: "class HinhChuNhat:\n    def __init__(self, dai, rong):\n        pass\n\ndai, rong = map(int, input().split())\nh = HinhChuNhat(dai, rong)\nprint(h.dien_tich())\nprint(h.chu_vi())\n", require: ["class"], tests: [T("5 3", "15\n16"), T("1 1", "1\n4"), T("12 7", "84\n38", true)], sample: "class HinhChuNhat:\n    def __init__(self, dai, rong):\n        self.dai = dai\n        self.rong = rong\n\n    def dien_tich(self):\n        return self.dai * self.rong\n\n    def chu_vi(self):\n        return (self.dai + self.rong) * 2\n\ndai, rong = map(int, input().split())\nh = HinhChuNhat(dai, rong)\nprint(h.dien_tich())\nprint(h.chu_vi())" },
      { id: "l10p2", title: "Giỏ hàng", prompt: "Viết class GioHang có danh sách mặt hàng rỗng khi tạo, phương thức them(ten, gia) và tong(). \nDòng đầu là số mặt hàng n, n dòng sau mỗi dòng: tên giá. In tổng tiền.", starter: "class GioHang:\n    def __init__(self):\n        self.hang = []\n\n    def them(self, ten, gia):\n        pass\n\n    def tong(self):\n        pass\n\ng = GioHang()\nn = int(input())\nfor _ in range(n):\n    ten, gia = input().split()\n    g.them(ten, int(gia))\nprint(g.tong())\n", require: ["class"], tests: [T("2\nbut 5000\nvo 12000", "17000"), T("0", "0"), T("3\na 1\nb 2\nc 3", "6", true)], sample: "class GioHang:\n    def __init__(self):\n        self.hang = []\n\n    def them(self, ten, gia):\n        self.hang.append((ten, gia))\n\n    def tong(self):\n        return sum(g for _, g in self.hang)\n\ng = GioHang()\nn = int(input())\nfor _ in range(n):\n    ten, gia = input().split()\n    g.them(ten, int(gia))\nprint(g.tong())" },
    ],
    quiz: [
      { q: "__init__ chạy khi nào?", options: ["Khi print đối tượng", "Khi tạo đối tượng", "Khi xóa đối tượng", "Khi gọi bất kỳ phương thức nào"], answer: 1, explain: "__init__ là hàm khởi tạo." },
      { q: "self trong phương thức là gì?", options: ["Tên class", "Đối tượng đang gọi phương thức", "Một từ khóa bắt buộc phải tên là self", "Biến toàn cục"], answer: 1, explain: "self là chính đối tượng; tên self là quy ước, không phải từ khóa." },
      { q: "Phương thức nào quyết định cách print(doi_tuong) hiển thị?", options: ["__init__", "__print__", "__str__", "show"], answer: 2, explain: "print gọi __str__." },
    ],
    summary: ["class là khuôn, đối tượng là sản phẩm.", "__init__ gán thuộc tính qua self.", "Phương thức luôn có self đầu tiên.", "__str__ để in đối tượng dễ đọc."],
  },

  // ---------------- STAGE 3 (PRO CHALLENGES) ----------------
  {
    id: "l11", slug: "thu-thach-thuat-toan-danh-sach", stage: 3, pro: false, minutes: 45,
    title: "Thử thách thuật toán với danh sách",
    description: "Luyện tư duy quét dữ liệu, hai con trỏ, xử lý trường hợp biên và tối ưu thao tác trên list.",
    objectives: ["Tìm phần tử lớn thứ hai phân biệt", "Trộn hai dãy đã sắp xếp bằng hai con trỏ", "Xoay danh sách theo số bước"],
    why: "Bài toán thuật toán không chỉ cần code chạy đúng mà còn cần chọn cách làm phù hợp. Ba thử thách này giúp bạn luyện cách chia nhỏ vấn đề và kiểm soát chỉ số.",
    concept: "Khi xử lý danh sách lớn, hãy xác định rõ dữ liệu đầu vào, điều kiện biên và số lần duyệt. Kỹ thuật hai con trỏ giúp trộn hai dãy đã sắp xếp chỉ bằng một lượt quét. Với thao tác xoay vòng, phép chia lấy dư giúp chuẩn hóa số bước trước khi cắt lát danh sách.",
    syntax: "for x in ds:\n    ...\n\nwhile i < len(a) and j < len(b):\n    ...\n\nk = k % len(ds)\nket_qua = ds[-k:] + ds[:-k]",
    example: { code: "ds = [7, 2, 9, 5]\nlon_nhat = max(ds)\nlon_nhi = -1000000000\nfor x in ds:\n    if x < lon_nhat and x > lon_nhi:\n        lon_nhi = x\nprint(lon_nhat, lon_nhi)", output: "9 7" },
    walkthrough: ["Duyệt danh sách để tìm giá trị lớn nhất.", "Duyệt lại, chỉ xét các giá trị nhỏ hơn giá trị lớn nhất.", "Giữ lại giá trị lớn nhất trong nhóm còn lại để có phần tử lớn thứ hai phân biệt."],
    mistakes: [
      { wrong: "lon_nhi = max(ds) - 1", why: "Giá trị đứng thứ hai không nhất thiết bằng giá trị lớn nhất trừ một.", fix: "Duyệt dữ liệu và tìm giá trị lớn nhất nhỏ hơn lon_nhat." },
      { wrong: "k = k % len(ds)\nket_qua = ds[k:] + ds[:k]", why: "Cách cắt này xoay trái, không phải xoay phải theo yêu cầu.", fix: "Dùng ds[-k:] + ds[:-k] để chuyển k phần tử cuối lên đầu." },
      { wrong: "while i < len(a):\n    ... b[j] ...", why: "Có thể truy cập vượt chỉ số khi một danh sách đã hết phần tử.", fix: "Điều kiện vòng lặp chính cần kiểm tra cả i và j." },
    ],
    practice: [
      { id: "l11p1", title: "Tìm hai điểm cao nhất phân biệt", prompt: "Một dòng gồm ít nhất hai giá trị điểm nguyên, nằm trong khoảng -1.000.000 đến 1.000.000. Hãy in điểm cao nhất và điểm cao thứ hai KHÁC điểm cao nhất, cách nhau một dấu cách. Luôn có ít nhất hai giá trị phân biệt.", starter: "ds = list(map(int, input().split()))\n", require: ["for", "input"], tests: [T("7 2 9 9 5", "9 7"), T("-8 -3 -10 -3", "-3 -8"), T("4 4 2 1", "4 2", true), T("100 99", "100 99", true)], sample: "ds = list(map(int, input().split()))\nlon_nhat = max(ds)\nlon_nhi = -1000000000\nfor x in ds:\n    if x < lon_nhat and x > lon_nhi:\n        lon_nhi = x\nprint(lon_nhat, lon_nhi)" },
      { id: "l11p2", title: "Trộn hai dãy đã sắp xếp", prompt: "Có hai dòng, mỗi dòng là một dãy số nguyên đã được sắp xếp tăng dần (có thể có số trùng). Hãy trộn thành một dãy tăng dần và in trên một dòng, cách nhau một dấu cách. Không dùng sorted() cho toàn bộ kết quả; hãy sử dụng hai con trỏ.", starter: "a = list(map(int, input().split()))\nb = list(map(int, input().split()))\ni = 0\nj = 0\nket_qua = []\n", require: ["while", "append"], tests: [T("1 3 5\n2 4 6", "1 2 3 4 5 6"), T("-3 0 8\n-5 0 9", "-5 -3 0 0 8 9"), T("1 1 1\n1 2", "1 1 1 1 2", true)], sample: "a = list(map(int, input().split()))\nb = list(map(int, input().split()))\ni = 0\nj = 0\nket_qua = []\nwhile i < len(a) and j < len(b):\n    if a[i] <= b[j]:\n        ket_qua.append(a[i])\n        i = i + 1\n    else:\n        ket_qua.append(b[j])\n        j = j + 1\nwhile i < len(a):\n    ket_qua.append(a[i])\n    i = i + 1\nwhile j < len(b):\n    ket_qua.append(b[j])\n    j = j + 1\nprint(*ket_qua)" },
      { id: "l11p3", title: "Xoay danh sách sang phải", prompt: "Dòng 1 là các từ cách nhau dấu cách. Dòng 2 là số nguyên k không âm. Hãy xoay danh sách sang phải k vị trí và in các từ trên một dòng. Nếu k lớn hơn độ dài danh sách, hãy xoay theo phần dư. Danh sách luôn có ít nhất một từ.", starter: "ds = input().split()\nk = int(input())\n", require: ["input"], tests: [T("a b c d\n1", "d a b c"), T("a b c d\n6", "c d a b"), T("python\n100", "python", true)], sample: "ds = input().split()\nk = int(input())\nk = k % len(ds)\nket_qua = ds[-k:] + ds[:-k]\nprint(\" \".join(ket_qua))" },
    ],
    quiz: [
      { q: "Khi tìm phần tử lớn thứ hai phân biệt, vì sao phải bỏ qua giá trị bằng lớn nhất?", options: ["Để bỏ phần tử âm", "Vì cần giá trị khác lớn nhất", "Để danh sách ngắn hơn", "Vì max() không ổn định"], answer: 1, explain: "Hai vị trí có cùng giá trị lớn nhất vẫn chỉ là một mức điểm; cần tìm giá trị nhỏ hơn lớn nhất." },
      { q: "Kỹ thuật hai con trỏ khi trộn hai dãy tăng dần giúp gì?", options: ["Không cần đọc dữ liệu", "Giảm số vòng lặp xuống một lần duyệt theo tổng phần tử", "Tự loại bỏ số trùng", "Sắp xếp từng dãy đầu vào"], answer: 1, explain: "Mỗi bước lấy phần tử nhỏ hơn ở đầu hai dãy, do đó mỗi phần tử chỉ được xử lý một lần." },
      { q: "Vì sao dùng k % len(ds) trước khi xoay?", options: ["Để đảo ngược danh sách", "Để số bước xoay không vượt độ dài cần thiết", "Để xóa phần tử trùng", "Để sắp xếp danh sách"], answer: 1, explain: "Xoay đủ một vòng sẽ trở lại trạng thái ban đầu; phần dư là số bước thực sự cần thực hiện." },
    ],
    summary: ["Luôn xác định rõ trường hợp biên trước khi viết thuật toán.", "Hai con trỏ là kỹ thuật hiệu quả cho hai dãy đã sắp xếp.", "Dùng phép chia lấy dư để chuẩn hóa số bước xoay."],
  },
  {
    id: "l12", slug: "phan-tich-du-lieu-va-thong-ke", stage: 3, pro: false, minutes: 50,
    title: "Phân tích dữ liệu và thống kê",
    description: "Dùng dict và list để thống kê tần suất, tính trung vị và tìm chuỗi dữ liệu tăng liên tiếp.",
    objectives: ["Thống kê tần suất và xử lý trường hợp đồng hạng", "Tính trung vị cho số lượng phần tử chẵn/lẻ", "Tìm đoạn tăng liên tiếp dài nhất"],
    why: "Các bài toán dữ liệu thường bắt đầu bằng việc đếm, tóm tắt và tìm xu hướng. Đây là kỹ năng nền tảng khi làm báo cáo, phân tích điểm hoặc theo dõi số liệu kinh doanh.",
    concept: "Dict giúp gom số lần xuất hiện theo khóa. Khi có nhiều giá trị cùng tần suất, cần quy định tiêu chí phá hòa để kết quả ổn định. Trung vị là giá trị nằm giữa dãy sau khi sắp xếp. Độ dài chuỗi tăng liên tiếp cần được tính bằng cách so sánh từng phần tử với phần tử ngay trước nó; đây không giống bài toán tìm dãy con tăng bất kỳ.",
    syntax: "tan_suat[x] = tan_suat.get(x, 0) + 1\n\nds = sorted(ds)\n\nif ds[i] > ds[i - 1]:\n    do_dai = do_dai + 1",
    example: { code: "ds = [5, 2, 5, 3, 2, 5]\ndem = {}\nfor x in ds:\n    dem[x] = dem.get(x, 0) + 1\nprint(dem[5], dem[2])", output: "3 2" },
    walkthrough: ["Khởi tạo dict rỗng để lưu số lần xuất hiện.", "Duyệt từng phần tử và tăng bộ đếm tương ứng.", "Sau khi thống kê, dùng dữ liệu đã gom để tính chỉ số cần thiết."],
    mistakes: [
      { wrong: "dem[x] = dem[x] + 1", why: "Khóa x có thể chưa tồn tại trong lần gặp đầu tiên.", fix: "Dùng dem.get(x, 0) + 1 để cấp giá trị mặc định." },
      { wrong: "ds[len(ds) // 2]", why: "Chỉ lấy đúng trung vị với số phần tử lẻ; số lượng chẵn cần lấy trung bình hai phần tử giữa.", fix: "Kiểm tra n % 2 trước khi chọn cách tính." },
      { wrong: "do_dai = do_dai + 1" , why: "Không đặt lại độ dài hiện tại khi chuỗi không còn tăng liên tiếp.", fix: "Khi ds[i] <= ds[i - 1], đặt do_dai = 1." },
    ],
    practice: [
      { id: "l12p1", title: "Giá trị xuất hiện nhiều nhất", prompt: "Một dòng gồm các số nguyên. Hãy in số xuất hiện nhiều nhất và số lần xuất hiện. Nếu nhiều số đồng hạng, chọn số nhỏ nhất. Dữ liệu luôn có ít nhất một số.", starter: "ds = list(map(int, input().split()))\ndem = {}\n", require: ["dict", "for"], tests: [T("4 2 4 3 2 4", "4 3"), T("8 5 8 5", "5 2"), T("-1 -1 2 2 3", "-1 2", true)], sample: "ds = list(map(int, input().split()))\ndem = {}\nfor x in ds:\n    dem[x] = dem.get(x, 0) + 1\nso_tot_nhat = min(dem)\nmax_lan = 0\nfor x in sorted(dem):\n    if dem[x] > max_lan:\n        max_lan = dem[x]\n        so_tot_nhat = x\nprint(so_tot_nhat, max_lan)" },
      { id: "l12p2", title: "Tính trung vị", prompt: "Một dòng gồm n số nguyên, n có thể chẵn hoặc lẻ và luôn lớn hơn 0. In trung vị của dãy sau khi sắp xếp tăng dần. Nếu n chẵn, trung vị là trung bình cộng của hai số ở giữa.", starter: "ds = list(map(int, input().split()))\nds = sorted(ds)\nn = len(ds)\n", require: ["input"], tests: [T("7 1 5", "5"), T("1 2 8 9", "5.0"), T("-5 10 0 5 1 2", "1.5", true)], sample: "ds = list(map(int, input().split()))\nds = sorted(ds)\nn = len(ds)\nif n % 2 == 1:\n    print(ds[n // 2])\nelse:\n    print((ds[n // 2 - 1] + ds[n // 2]) / 2)" },
      { id: "l12p3", title: "Chuỗi tăng liên tiếp dài nhất", prompt: "Một dòng gồm ít nhất một số nguyên. Hãy tìm độ dài đoạn LIÊN TIẾP tăng nghiêm ngặt dài nhất. Ví dụ 1 2 2 3 4 có kết quả 3 vì đoạn 2 3 4 dài 3.", starter: "ds = list(map(int, input().split()))\n", require: ["for"], tests: [T("1 2 3 1 2 5 6", "4"), T("5 4 3 2", "1"), T("1 2 2 3 4", "3", true)], sample: "ds = list(map(int, input().split()))\ndo_dai = 1\ntot_nhat = 1\nfor i in range(1, len(ds)):\n    if ds[i] > ds[i - 1]:\n        do_dai = do_dai + 1\n    else:\n        do_dai = 1\n    if do_dai > tot_nhat:\n        tot_nhat = do_dai\nprint(tot_nhat)" },
    ],
    quiz: [
      { q: "Dict phù hợp với bài toán tần suất vì?", options: ["Mỗi khóa lưu một bộ đếm", "Dict luôn tự sắp xếp", "Không cần duyệt dữ liệu", "Dict chỉ chứa số"], answer: 0, explain: "Khóa là giá trị cần thống kê, giá trị tương ứng là số lần xuất hiện." },
      { q: "Với 4 phần tử đã sắp xếp, trung vị được tính thế nào?", options: ["Lấy phần tử thứ 2", "Lấy trung bình hai phần tử giữa", "Lấy phần tử lớn nhất", "Lấy tổng chia 4"], answer: 1, explain: "Khi số phần tử chẵn, hai giá trị ở giữa cùng đóng góp vào trung vị." },
      { q: "Đoạn tăng liên tiếp khác dãy con tăng ở điểm nào?", options: ["Đoạn liên tiếp không được bỏ qua phần tử ở giữa", "Đoạn liên tiếp phải có số âm", "Dãy con không được tăng", "Hai khái niệm giống hệt nhau"], answer: 0, explain: "Đoạn liên tiếp yêu cầu các phần tử đứng cạnh nhau trong dãy gốc." },
    ],
    summary: ["Dùng dict để đếm và tổng hợp dữ liệu.", "Trung vị cần xử lý riêng n chẵn và n lẻ.", "Khi tính đoạn liên tiếp, hãy reset độ dài khi điều kiện bị phá vỡ."],
  },
  {
    id: "l13", slug: "thuat-toan-so-hoc-va-chuoi", stage: 3, pro: false, minutes: 50,
    title: "Thuật toán số học và xử lý chuỗi",
    description: "Vận dụng vòng lặp while, phép chia dư, thuật toán Euclid và cắt lát chuỗi để giải quyết bài toán thực tế.",
    objectives: ["Tính UCLN và BCNN bằng thuật toán Euclid", "Kiểm tra số nguyên tố hiệu quả hơn cách thử mọi ước", "Chuẩn hóa chuỗi trước khi kiểm tra đối xứng"],
    why: "Những thuật toán nhỏ như Euclid hay kiểm tra số nguyên tố là bài luyện rất tốt để rèn tư duy vòng lặp, điều kiện dừng và tối ưu số bước xử lý.",
    concept: "Thuật toán Euclid dùng tính chất gcd(a, b) = gcd(b, a % b) cho đến khi số dư bằng 0. Để kiểm tra số nguyên tố, chỉ cần thử ước d đến khi d * d vượt n; nếu không có ước nào thì n là số nguyên tố. Với chuỗi, cần chuẩn hóa dữ liệu trước (ví dụ bỏ dấu cách và chuyển chữ thường) rồi mới so sánh với chuỗi đảo ngược.",
    syntax: "while b != 0:\n    a, b = b, a % b\n\nwhile d * d <= n:\n    ...\n\ns = s.lower().replace(\" \", \"\")\ns == s[::-1]",
    example: { code: "a = 48\nb = 18\nwhile b != 0:\n    a, b = b, a % b\nprint(a)", output: "6" },
    walkthrough: ["Lần lượt thay cặp (a, b) bằng (b, a % b).", "Mỗi vòng làm số thứ hai nhỏ hơn; khi b bằng 0, a chính là UCLN.", "Điều kiện d * d <= n giúp dừng khi đã thử đủ các ước cần thiết."],
    mistakes: [
      { wrong: "while b > 0:\n    a = b\n    b = a % b", why: "Cập nhật a trước khiến phép tính số dư dùng giá trị mới, làm sai thuật toán.", fix: "Tính số dư vào biến tạm trước, sau đó mới cập nhật a và b." },
      { wrong: "while d < n:", why: "Thử đến n làm tốn nhiều bước không cần thiết.", fix: "Chỉ cần thử khi d * d <= n." },
      { wrong: "s == s[::-1]", why: "Nếu đề yêu cầu bỏ khoảng trắng và không phân biệt hoa thường thì cần chuẩn hóa trước.", fix: "Dùng lower() và replace() trước khi so sánh." },
    ],
    practice: [
      { id: "l13p1", title: "UCLN và BCNN", prompt: "Đọc hai số nguyên dương a, b trên một dòng. In UCLN và BCNN của chúng trên một dòng, cách nhau một dấu cách. Dùng thuật toán Euclid để tìm UCLN. BCNN = a * b // UCLN.", starter: "a, b = map(int, input().split())\n", require: ["while", "input"], tests: [T("12 18", "6 36"), T("7 5", "1 35"), T("100 25", "25 100", true)], sample: "a, b = map(int, input().split())\nx = a\ny = b\nwhile y != 0:\n    r = x % y\n    x = y\n    y = r\nucln = x\nbcnn = a * b // ucln\nprint(ucln, bcnn)" },
      { id: "l13p2", title: "Đếm số nguyên tố không vượt quá N", prompt: "Nhập số nguyên N (2 <= N <= 500). Hãy đếm có bao nhiêu số nguyên tố trong đoạn từ 2 đến N. Với từng số n, chỉ cần thử ước d khi d * d <= n.", starter: "n = int(input())\ndem = 0\n", require: ["for", "while"], tests: [T("10", "4"), T("2", "1"), T("30", "10", true)], sample: "n = int(input())\ndem = 0\nfor x in range(2, n + 1):\n    la_nguyen_to = True\n    d = 2\n    while d * d <= x:\n        if x % d == 0:\n            la_nguyen_to = False\n            break\n        d = d + 1\n    if la_nguyen_to:\n        dem = dem + 1\nprint(dem)" },
      { id: "l13p3", title: "Kiểm tra chuỗi đối xứng", prompt: "Nhập một dòng văn bản. Bỏ tất cả dấu cách thường và không phân biệt chữ hoa/chữ thường. In YES nếu chuỗi sau chuẩn hóa đọc xuôi và ngược giống nhau, ngược lại in NO.", starter: "s = input()\n", require: ["input"], tests: [T("Madam Im Adam", "YES"), T("Python", "NO"), T("A man a plan a canal Panama", "YES", true)], sample: "s = input()\ns = s.lower().replace(\" \", \"\")\nif s == s[::-1]:\n    print(\"YES\")\nelse:\n    print(\"NO\")" },
    ],
    quiz: [
      { q: "Thuật toán Euclid dừng khi nào?", options: ["a bằng 1", "b bằng 0", "a bằng b", "số dư bằng 1"], answer: 1, explain: "Khi b bằng 0 thì a là UCLN của cặp ban đầu." },
      { q: "Khi kiểm tra n có nguyên tố không, vì sao chỉ cần thử đến căn bậc hai của n?", options: ["Vì mọi ước đều là số chẵn", "Nếu n có ước lớn hơn căn n thì sẽ có một ước cặp nhỏ hơn căn n", "Vì số nguyên tố không có ước", "Để vòng lặp luôn chạy một lần"], answer: 1, explain: "Các ước của n xuất hiện thành cặp; nếu cả hai đều lớn hơn căn n thì tích sẽ vượt n." },
      { q: "Vì sao chuẩn hóa chuỗi trước khi kiểm tra palindrome?", options: ["Để xóa mọi ký tự", "Để bỏ qua khác biệt hoa thường và dấu cách theo yêu cầu", "Để sắp xếp chữ cái", "Để đổi chuỗi thành số"], answer: 1, explain: "Chuẩn hóa đảm bảo chỉ so sánh phần nội dung cần xét." },
    ],
    summary: ["Euclid là cách hiệu quả để tính UCLN; BCNN suy ra từ a * b // UCLN.", "Kiểm tra nguyên tố chỉ cần thử ước tới căn bậc hai.", "Chuẩn hóa chuỗi trước khi kiểm tra đối xứng."],
  },

];

export const findLesson = (id) => LESSONS.find((l) => l.id === id || l.slug === id) || null;
export function findLessonExercise(exId) {
  for (const l of LESSONS) { const e = l.practice.find((p) => p.id === exId); if (e) return { lesson: l, exercise: e }; }
  return null;
}

// Public view (guests, SEO): excludes quiz answers, hidden tests, and sample solutions.
export function lessonOutline(l) {
  return { id: l.id, slug: l.slug, stage: l.stage, pro: l.pro, title: l.title, description: l.description, minutes: l.minutes, objectives: l.objectives, practiceCount: l.practice.length, quizCount: l.quiz.length };
}
export function lessonFull(l, { showSample = false } = {}) {
  return {
    ...lessonOutline(l), why: l.why, concept: l.concept, syntax: l.syntax, example: l.example, walkthrough: l.walkthrough, mistakes: l.mistakes, summary: l.summary,
    practice: l.practice.map((p) => ({ id: p.id, title: p.title, prompt: p.prompt, starter: p.starter, require: p.require || [], tests: p.tests.filter((t) => !t.hidden).map((t) => ({ input: t.input, expected: t.expected })), hiddenTests: p.tests.filter((t) => t.hidden).length, sample: showSample ? p.sample : undefined })),
    quiz: l.quiz.map((q, i) => ({ i, q: q.q, options: q.options })),
  };
}
