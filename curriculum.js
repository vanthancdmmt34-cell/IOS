// Python Lab curriculum - expanded to ~100 exercises, basic to advanced
import { PY_HIDDEN_CHAPTER } from "./content/py-hidden-chapter.js";
export const CHAPTERS = [
  {
    id: "c1",
    title: "Chương 1: Lệnh in đầu tiên",
    theory: "print là lệnh đầu tiên trong Python: nó in nội dung ra màn hình. Bạn có thể in chuỗi chữ, số, hoặc kết quả phép tính, mỗi lệnh print in một dòng. Lỗi thường gặp nhất là viết hoa Print, quên ngoặc đơn, hoặc quên đóng ngoặc kép của chuỗi. Nhớ Python phân biệt chữ hoa và chữ thường, nên chỉ print viết thường mới đúng, còn số in trực tiếp không cần ngoặc kép.",
    example: "print(\"Xin chào Python\")\nprint(3 + 4)\nprint(2 ** 3)",
    exercises: [
      {
        id: "c1e1", title: "Bài 1.1: In câu chào",
        prompt: "In ra đúng một dòng: Xin chào Python",
        starter: "",
        expectedOutput: "Xin chào Python",
        sample: "print(\"Xin chào Python\")",
        require: ["print"],
      },
      {
        id: "c1e2", title: "Bài 1.2: In hai dòng",
        prompt: "In ra hai dòng, mỗi dòng một lệnh print:\nDòng 1: Học Python\nDòng 2: Từ con số 0",
        starter: "",
        expectedOutput: "Học Python\nTừ con số 0",
        sample: "print(\"Học Python\")\nprint(\"Từ con số 0\")",
        require: ["print"],
      },
      {
        id: "c1e3", title: "Bài 1.3: In số",
        prompt: "In ra số 2026 (không cần ngoặc kép)",
        starter: "",
        expectedOutput: "2026",
        sample: "print(2026)",
        require: ["print"],
      },
      {
        id: "c1e4", title: "Bài 1.4: In phép tính",
        prompt: "In ra kết quả của 3 + 4 (phải để Python tính, không in thẳng số 7)",
        starter: "",
        expectedOutput: "7",
        sample: "print(3 + 4)",
        require: ["print"],
      },
      {
        id: "c1e5", title: "Bài 1.5: In chuỗi dài",
        prompt: "In ra đúng: Python Lab - Học lập trình",
        starter: "",
        expectedOutput: "Python Lab - Học lập trình",
        sample: "print(\"Python Lab - Học lập trình\")",
        require: ["print"],
      },
      {
        id: "c1e6", title: "Bài 1.6: Ba dòng",
        prompt: "In ba dòng liên tiếp:\nA\nB\nC",
        starter: "",
        expectedOutput: "A\nB\nC",
        sample: "print(\"A\")\nprint(\"B\")\nprint(\"C\")",
        require: ["print"],
      },
      {
        id: "c1e7", title: "Bài 1.7: In kết quả nhân",
        prompt: "In ra kết quả 6 * 7",
        starter: "",
        expectedOutput: "42",
        sample: "print(6 * 7)",
        require: ["print"],
      },
      {
        id: "c1e8", title: "Bài 1.8: In kết quả chia",
        prompt: "In ra kết quả 20 / 4 (để Python tính).\nLưu ý: phép chia / luôn cho số thực, nên Python in 5.0 (muốn lấy phần nguyên dùng //).",
        starter: "",
        expectedOutput: "5.0",
        sample: "print(20 / 4)",
        require: ["print"],
      },
      {
        id: "c1e9", title: "Bài 1.9: In chuỗi có dấu",
        prompt: "In ra đúng: Học \"Python\" thật vui (có dấu ngoặc kép bên trong)",
        starter: "",
        expectedOutput: "Học \"Python\" thật vui",
        sample: "print('Học \"Python\" thật vui')",
        require: ["print"],
      },
      {
        id: "c1e10", title: "Bài 1.10: In dòng trống giữa",
        prompt: "In \"Trên\", một dòng trống, rồi \"Dưới\"",
        starter: "",
        expectedOutput: "Trên\n\nDưới",
        sample: "print(\"Trên\")\nprint()\nprint(\"Dưới\")",
        require: ["print"],
      },
      {
        id: "c1e11", title: "Bài 1.11: In modulo",
        prompt: "In ra kết quả 17 % 5 (phần dư)",
        starter: "",
        expectedOutput: "2",
        sample: "print(17 % 5)",
        require: ["print"],
      },
      {
        id: "c1e12", title: "Bài 1.12: In lũy thừa",
        prompt: "In ra kết quả 2 ** 8",
        starter: "",
        expectedOutput: "256",
        sample: "print(2 ** 8)",
        require: ["print"],
      },
    ],
    exam: {
      code: {"prompt": "In ra đúng hai dòng:\nHello\nWorld", "expectedOutput": "Hello\nWorld", "sample": "print(\"Hello\")\nprint(\"World\")", "require": ["print"]},
      mcq: [{"id": "q1", "q": "Lệnh in ra màn hình trong Python là gì?", "options": ["echo", "print", "printf", "write"], "answer": 1}, {"id": "q2", "q": "print(2+3) in ra gì?", "options": ["2+3", "5", "\"2+3\"", "Lỗi"], "answer": 1}],
    },
  },
  {
    id: "c2",
    title: "Chương 2: Biến và phép tính",
    theory: "Biến là tên gắn với một giá trị để dùng lại nhiều lần. Bạn gán bằng dấu bằng, ví dụ a = 5, rồi dùng tên biến đó trong các phép tính sau. Tên biến nên viết thường, không dấu, không khoảng trắng và không bắt đầu bằng số, và có thể cập nhật bằng +=. Lỗi thường gặp là nhầm dấu gán = với dấu so sánh ==, viết sai chính tả tên biến, hoặc in tên biến trong ngoặc kép thay vì in giá trị của nó.",
    example: "a = 5\nb = 3\nprint(a + b)\ntong = 0\ntong += 10\nprint(tong)",
    exercises: [
      {
        id: "c2e1", title: "Bài 2.1: Cộng hai biến",
        prompt: "Tạo biến a = 5 và b = 3, rồi in ra tổng a + b (kết quả 8). Không được in thẳng số 8.",
        starter: "a = 5\nb = 3",
        expectedOutput: "8",
        sample: "a = 5\nb = 3\nprint(a + b)",
        require: ["variable"],
      },
      {
        id: "c2e2", title: "Bài 2.2: Tính tiền",
        prompt: "Một món hàng giá 12000 đồng, mua 3 món. Tạo biến gia = 12000 và so_luong = 3, rồi in ra tổng tiền (36000).",
        starter: "gia = 12000\nso_luong = 3",
        expectedOutput: "36000",
        sample: "gia = 12000\nso_luong = 3\nprint(gia * so_luong)",
        require: ["variable"],
      },
      {
        id: "c2e3", title: "Bài 2.3: Hiệu hai số",
        prompt: "Tạo x = 100, y = 37, in ra x - y.",
        starter: "x = 100\ny = 37",
        expectedOutput: "63",
        sample: "x = 100\ny = 37\nprint(x - y)",
        require: ["variable"],
      },
      {
        id: "c2e4", title: "Bài 2.4: Trung bình",
        prompt: "Tạo a = 8, b = 12, in ra trung bình (a + b) / 2.",
        starter: "a = 8\nb = 12",
        expectedOutput: "10.0",
        sample: "a = 8\nb = 12\nprint((a + b) / 2)",
        require: ["variable"],
      },
      {
        id: "c2e5", title: "Bài 2.5: Đổi giá trị",
        prompt: "Tạo n = 10, rồi gán n = n + 5, sau đó in n (phải ra 15).",
        starter: "n = 10",
        expectedOutput: "15",
        sample: "n = 10\nn = n + 5\nprint(n)",
        require: ["variable"],
      },
      {
        id: "c2e6", title: "Bài 2.6: Chuỗi trong biến",
        prompt: "Tạo biến msg = \"Xin chào\", rồi in msg.",
        starter: "msg = \"Xin chào\"",
        expectedOutput: "Xin chào",
        sample: "msg = \"Xin chào\"\nprint(msg)",
        require: ["variable"],
      },
      {
        id: "c2e7", title: "Bài 2.7: Nối chuỗi",
        prompt: "Tạo ho = \"Nguyen\", ten = \"An\", in ra ho + \" \" + ten.",
        starter: "ho = \"Nguyen\"\nten = \"An\"",
        expectedOutput: "Nguyen An",
        sample: "ho = \"Nguyen\"\nten = \"An\"\nprint(ho + \" \" + ten)",
        require: ["variable"],
      },
      {
        id: "c2e8", title: "Bài 2.8: Phép chia lấy dư",
        prompt: "Tạo a = 29, b = 4, in a % b.",
        starter: "a = 29\nb = 4",
        expectedOutput: "1",
        sample: "a = 29\nb = 4\nprint(a % b)",
        require: ["variable"],
      },
      {
        id: "c2e9", title: "Bài 2.9: Bình phương",
        prompt: "Tạo n = 9, in n * n (hoặc n ** 2).",
        starter: "n = 9",
        expectedOutput: "81",
        sample: "n = 9\nprint(n * n)",
        require: ["variable"],
      },
      {
        id: "c2e10", title: "Bài 2.10: Cập nhật +=",
        prompt: "Tạo tong = 0, rồi tong += 7, tong += 8, in tong (15).",
        starter: "tong = 0",
        expectedOutput: "15",
        sample: "tong = 0\ntong += 7\ntong += 8\nprint(tong)",
        require: ["variable"],
      },
      {
        id: "c2e11", title: "Bài 2.11: Nhiều biến",
        prompt: "Tạo a = 2, b = 3, c = 4, in a * b * c.",
        starter: "a = 2\nb = 3\nc = 4",
        expectedOutput: "24",
        sample: "a = 2\nb = 3\nc = 4\nprint(a * b * c)",
        require: ["variable"],
      },
      {
        id: "c2e12", title: "Bài 2.12: Đổi chỗ hai biến",
        prompt: "Tạo a = 1, b = 2. Đổi giá trị của a và b (dùng biến tạm), rồi in a và b mỗi biến một dòng (2 rồi 1).",
        starter: "a = 1\nb = 2",
        expectedOutput: "2\n1",
        sample: "a = 1\nb = 2\nt = a\na = b\nb = t\nprint(a)\nprint(b)",
        require: ["variable"],
      },
      {
        id: "c2e13", title: "Bài 2.13: Chu vi hình chữ nhật",
        prompt: "dai = 10, rong = 5. In chu vi 2 * (dai + rong).",
        starter: "dai = 10\nrong = 5",
        expectedOutput: "30",
        sample: "dai = 10\nrong = 5\nprint(2 * (dai + rong))",
        require: ["variable"],
      },
      {
        id: "c2e14", title: "Bài 2.14: Diện tích",
        prompt: "dai = 10, rong = 5. In diện tích dai * rong.",
        starter: "dai = 10\nrong = 5",
        expectedOutput: "50",
        sample: "dai = 10\nrong = 5\nprint(dai * rong)",
        require: ["variable"],
      },
    ],
    exam: {
      code: {"prompt": "Gán a = 15, b = 4 rồi in ra a * b + a", "expectedOutput": "75", "sample": "a = 15\nb = 4\nprint(a * b + a)", "require": ["variable"]},
      mcq: [{"id": "q1", "q": "a = 5 nghĩa là gì?", "options": ["So sánh a với 5", "Gán 5 cho a", "In a và 5", "Xóa a"], "answer": 1}, {"id": "q2", "q": "Biến trong Python dùng để làm gì?", "options": ["Lưu giá trị để dùng lại sau", "In ra màn hình", "Tạo vòng lặp", "Định nghĩa hàm"], "answer": 0}],
    },
  },
  {
    id: "c3",
    title: "Chương 3: Chuỗi và f-string",
    theory: "Chuỗi là dãy ký tự trong ngoặc kép hoặc nháy đơn, có thể nối bằng dấu cộng. f-string chèn biến vào chuỗi: đặt chữ f trước chuỗi rồi đặt tên biến trong cặp ngoặc nhọn, bạn cũng có thể chèn cả phép tính. Lỗi thường gặp nhất là quên chữ f, khi đó Python in nguyên văn ngoặc nhọn thay vì giá trị, hoặc quên đóng ngoặc nhọn, hoặc dùng biến chưa được định nghĩa.",
    example: "ten = \"An\"\ntuoi = 20\nprint(f\"Tôi tên {ten}, {tuoi} tuổi\")",
    exercises: [
      {
        id: "c3e1", title: "Bài 3.1: Chào theo tên",
        prompt: "Tạo ten = \"An\", dùng f-string in: Xin chào An",
        starter: "ten = \"An\"",
        expectedOutput: "Xin chào An",
        sample: "ten = \"An\"\nprint(f\"Xin chào {ten}\")",
        require: ["fstring"],
      },
      {
        id: "c3e2", title: "Bài 3.2: f-string có phép tính",
        prompt: "Tạo a = 4, b = 6, dùng f-string in: Tổng là 10 (dùng {a + b}).",
        starter: "a = 4\nb = 6",
        expectedOutput: "Tổng là 10",
        sample: "a = 4\nb = 6\nprint(f\"Tổng là {a + b}\")",
        require: ["fstring"],
      },
      {
        id: "c3e3", title: "Bài 3.3: Tuổi",
        prompt: "tuoi = 18, in f-string: Tôi 18 tuổi",
        starter: "tuoi = 18",
        expectedOutput: "Tôi 18 tuổi",
        sample: "tuoi = 18\nprint(f\"Tôi {tuoi} tuổi\")",
        require: ["fstring"],
      },
      {
        id: "c3e4", title: "Bài 3.4: Hai biến",
        prompt: "ten = \"Bình\", tuoi = 20, in: Bình 20 tuổi",
        starter: "ten = \"Bình\"\ntuoi = 20",
        expectedOutput: "Bình 20 tuổi",
        sample: "ten = \"Bình\"\ntuoi = 20\nprint(f\"{ten} {tuoi} tuổi\")",
        require: ["fstring"],
      },
      {
        id: "c3e5", title: "Bài 3.5: Giá tiền",
        prompt: "gia = 15000, in: Giá: 15000đ",
        starter: "gia = 15000",
        expectedOutput: "Giá: 15000đ",
        sample: "gia = 15000\nprint(f\"Giá: {gia}đ\")",
        require: ["fstring"],
      },
      {
        id: "c3e6", title: "Bài 3.6: Phép nhân trong f-string",
        prompt: "a = 5, b = 6, in: Tích = 30",
        starter: "a = 5\nb = 6",
        expectedOutput: "Tích = 30",
        sample: "a = 5\nb = 6\nprint(f\"Tích = {a * b}\")",
        require: ["fstring"],
      },
      {
        id: "c3e7", title: "Bài 3.7: Năm sinh",
        prompt: "nam = 2006, in: Sinh năm 2006",
        starter: "nam = 2006",
        expectedOutput: "Sinh năm 2006",
        sample: "nam = 2006\nprint(f\"Sinh năm {nam}\")",
        require: ["fstring"],
      },
      {
        id: "c3e8", title: "Bài 3.8: Điểm số",
        prompt: "diem = 9, in: Điểm của bạn: 9",
        starter: "diem = 9",
        expectedOutput: "Điểm của bạn: 9",
        sample: "diem = 9\nprint(f\"Điểm của bạn: {diem}\")",
        require: ["fstring"],
      },
      {
        id: "c3e9", title: "Bài 3.9: Chu vi trong f-string",
        prompt: "dai = 8, rong = 3, in: Chu vi = 22",
        starter: "dai = 8\nrong = 3",
        expectedOutput: "Chu vi = 22",
        sample: "dai = 8\nrong = 3\nprint(f\"Chu vi = {2 * (dai + rong)}\")",
        require: ["fstring"],
      },
      {
        id: "c3e10", title: "Bài 3.10: Lời chào đầy đủ",
        prompt: "ho = \"Tran\", ten = \"Lan\", in: Xin chào Tran Lan",
        starter: "ho = \"Tran\"\nten = \"Lan\"",
        expectedOutput: "Xin chào Tran Lan",
        sample: "ho = \"Tran\"\nten = \"Lan\"\nprint(f\"Xin chào {ho} {ten}\")",
        require: ["fstring"],
      },
      {
        id: "c3e11", title: "Bài 3.11: Phần trăm",
        prompt: "dung = 8, tong = 10, in: Đúng 8/10 câu",
        starter: "dung = 8\ntong = 10",
        expectedOutput: "Đúng 8/10 câu",
        sample: "dung = 8\ntong = 10\nprint(f\"Đúng {dung}/{tong} câu\")",
        require: ["fstring"],
      },
      {
        id: "c3e12", title: "Bài 3.12: Nhiệt độ",
        prompt: "c = 30, in: 30 độ C",
        starter: "c = 30",
        expectedOutput: "30 độ C",
        sample: "c = 30\nprint(f\"{c} độ C\")",
        require: ["fstring"],
      },
    ],
    exam: {
      code: {"prompt": "ten = \"Bình\", dùng f-string in: Tôi là Bình", "expectedOutput": "Tôi là Bình", "sample": "ten = \"Bình\"\nprint(f\"Tôi là {ten}\")", "require": ["fstring"]},
      mcq: [{"id": "q1", "q": "f-string dùng để làm gì?", "options": ["Tăng tốc", "Chèn biến vào chuỗi", "Xóa chuỗi", "Đổi màu chữ"], "answer": 1}, {"id": "q2", "q": "Quên chữ f trước ngoặc kép thì sao?", "options": ["In giá trị biến", "In nguyên văn {ten}", "Báo lỗi", "In chữ f"], "answer": 1}],
    },
  },
  {
    id: "c4",
    title: "Chương 4: Rẽ nhánh if / else",
    theory: "if dùng để rẽ nhánh: điều kiện đúng thì chạy khối lệnh thụt lề bên dưới, sai thì bỏ qua hoặc chạy nhánh else. elif thêm một điều kiện khác, các nhánh kiểm tra theo thứ tự từ trên xuống. Điều kiện dùng phép so sánh và kết hợp bằng and, or, not. Lỗi thường gặp là quên dấu hai chấm cuối dòng if, dùng dấu gán = thay cho ==, hoặc thụt lề các dòng trong cùng khối không đều nhau.",
    example: "diem = 85\nif diem >= 80:\n    print(\"Giỏi\")\nelse:\n    print(\"Chưa giỏi\")",
    exercises: [
      {
        id: "c4e1", title: "Bài 4.1: Xếp loại",
        prompt: "Biến diem = 85. Nếu diem >= 80 thì in Giỏi, ngược lại in Chưa giỏi. Phải dùng if/else.",
        starter: "diem = 85",
        expectedOutput: "Giỏi",
        sample: "diem = 85\nif diem >= 80:\n    print(\"Giỏi\")\nelse:\n    print(\"Chưa giỏi\")",
        require: ["if"],
      },
      {
        id: "c4e2", title: "Bài 4.2: Đủ tuổi",
        prompt: "Biến tuoi = 20. Nếu tuoi >= 18 in Đủ tuổi, ngược lại Chưa đủ tuổi.",
        starter: "tuoi = 20",
        expectedOutput: "Đủ tuổi",
        sample: "tuoi = 20\nif tuoi >= 18:\n    print(\"Đủ tuổi\")\nelse:\n    print(\"Chưa đủ tuổi\")",
        require: ["if"],
      },
      {
        id: "c4e3", title: "Bài 4.3: Số chẵn",
        prompt: "n = 8. Nếu n % 2 == 0 in Chẵn, ngược lại Lẻ.",
        starter: "n = 8",
        expectedOutput: "Chẵn",
        sample: "n = 8\nif n % 2 == 0:\n    print(\"Chẵn\")\nelse:\n    print(\"Lẻ\")",
        require: ["if"],
      },
      {
        id: "c4e4", title: "Bài 4.4: Số lẻ",
        prompt: "n = 7. Nếu n % 2 == 0 in Chẵn, ngược lại Lẻ.",
        starter: "n = 7",
        expectedOutput: "Lẻ",
        sample: "n = 7\nif n % 2 == 0:\n    print(\"Chẵn\")\nelse:\n    print(\"Lẻ\")",
        require: ["if"],
      },
      {
        id: "c4e5", title: "Bài 4.5: So sánh hai số",
        prompt: "a = 10, b = 7. Nếu a > b in a lớn hơn, ngược lại b lớn hơn hoặc bằng.",
        starter: "a = 10\nb = 7",
        expectedOutput: "a lớn hơn",
        sample: "a = 10\nb = 7\nif a > b:\n    print(\"a lớn hơn\")\nelse:\n    print(\"b lớn hơn hoặc bằng\")",
        require: ["if"],
      },
      {
        id: "c4e6", title: "Bài 4.6: Điểm đạt",
        prompt: "diem = 60. Nếu diem >= 50 in Đạt, ngược lại Chưa đạt.",
        starter: "diem = 60",
        expectedOutput: "Đạt",
        sample: "diem = 60\nif diem >= 50:\n    print(\"Đạt\")\nelse:\n    print(\"Chưa đạt\")",
        require: ["if"],
      },
      {
        id: "c4e7", title: "Bài 4.7: Điểm chưa đạt",
        prompt: "diem = 40. Nếu diem >= 50 in Đạt, ngược lại Chưa đạt.",
        starter: "diem = 40",
        expectedOutput: "Chưa đạt",
        sample: "diem = 40\nif diem >= 50:\n    print(\"Đạt\")\nelse:\n    print(\"Chưa đạt\")",
        require: ["if"],
      },
      {
        id: "c4e8", title: "Bài 4.8: Nhiệt độ",
        prompt: "nhiet = 35. Nếu nhiet >= 30 in Nóng, ngược lại Mát.",
        starter: "nhiet = 35",
        expectedOutput: "Nóng",
        sample: "nhiet = 35\nif nhiet >= 30:\n    print(\"Nóng\")\nelse:\n    print(\"Mát\")",
        require: ["if"],
      },
      {
        id: "c4e9", title: "Bài 4.9: Mật khẩu đơn giản",
        prompt: "pwd = \"abc123\". Nếu pwd == \"abc123\" in Đúng, ngược lại Sai.",
        starter: "pwd = \"abc123\"",
        expectedOutput: "Đúng",
        sample: "pwd = \"abc123\"\nif pwd == \"abc123\":\n    print(\"Đúng\")\nelse:\n    print(\"Sai\")",
        require: ["if"],
      },
      {
        id: "c4e10", title: "Bài 4.10: elif xếp loại",
        prompt: "diem = 75. Nếu >= 90 Xuất sắc, elif >= 80 Giỏi, elif >= 65 Khá, else Trung bình.",
        starter: "diem = 75",
        expectedOutput: "Khá",
        sample: "diem = 75\nif diem >= 90:\n    print(\"Xuất sắc\")\nelif diem >= 80:\n    print(\"Giỏi\")\nelif diem >= 65:\n    print(\"Khá\")\nelse:\n    print(\"Trung bình\")",
        require: ["if"],
      },
      {
        id: "c4e11", title: "Bài 4.11: elif điểm cao",
        prompt: "diem = 92. Dùng cùng thang điểm bài 4.10.",
        starter: "diem = 92",
        expectedOutput: "Xuất sắc",
        sample: "diem = 92\nif diem >= 90:\n    print(\"Xuất sắc\")\nelif diem >= 80:\n    print(\"Giỏi\")\nelif diem >= 65:\n    print(\"Khá\")\nelse:\n    print(\"Trung bình\")",
        require: ["if"],
      },
      {
        id: "c4e12", title: "Bài 4.12: Số dương",
        prompt: "n = -3. Nếu n > 0 in Dương, elif n < 0 in Âm, else Zero.",
        starter: "n = -3",
        expectedOutput: "Âm",
        sample: "n = -3\nif n > 0:\n    print(\"Dương\")\nelif n < 0:\n    print(\"Âm\")\nelse:\n    print(\"Zero\")",
        require: ["if"],
      },
      {
        id: "c4e13", title: "Bài 4.13: Năm nhuận đơn giản",
        prompt: "nam = 2024. Nếu nam % 4 == 0 in Nhuận, else Không nhuận.",
        starter: "nam = 2024",
        expectedOutput: "Nhuận",
        sample: "nam = 2024\nif nam % 4 == 0:\n    print(\"Nhuận\")\nelse:\n    print(\"Không nhuận\")",
        require: ["if"],
      },
      {
        id: "c4e14", title: "Bài 4.14: Mua hàng",
        prompt: "tien = 50000. Nếu tien >= 100000 in Miễn phí ship, else Tính ship.",
        starter: "tien = 50000",
        expectedOutput: "Tính ship",
        sample: "tien = 50000\nif tien >= 100000:\n    print(\"Miễn phí ship\")\nelse:\n    print(\"Tính ship\")",
        require: ["if"],
      },
    ],
    exam: {
      code: {"prompt": "diem = 60. Nếu >= 50 in Đạt, else Chưa đạt.", "expectedOutput": "Đạt", "sample": "diem = 60\nif diem >= 50:\n    print(\"Đạt\")\nelse:\n    print(\"Chưa đạt\")", "require": ["if"]},
      mcq: [{"id": "q1", "q": "Trong if, so sánh bằng dùng dấu nào?", "options": ["=", "==", ":=", "=>"], "answer": 1}, {"id": "q2", "q": "Dòng if phải kết thúc bằng gì?", "options": [";", ":", ".", "Không cần"], "answer": 1}],
    },
  },
  {
    id: "c5",
    title: "Chương 5: Vòng lặp for",
    theory: "for lặp lại một khối lệnh với từng giá trị trong một dãy. Dạng hay dùng nhất là range: range(n) chạy từ 0 đến n trừ 1, range(a, b) chạy từ a đến b trừ 1. Bạn cũng có thể duyệt trực tiếp từng phần tử của danh sách hoặc chuỗi. Khi tính tổng, hãy đặt biến tổng bằng 0 trước vòng lặp rồi cộng dồn trong vòng lặp. Lỗi thường gặp là quên số cuối của range, quên dấu hai chấm, hoặc quên thụt lề khối lệnh.",
    example: "for i in range(1, 6):\n    print(i)\n\ntong = 0\nfor i in range(1, 11):\n    tong += i\nprint(tong)",
    exercises: [
      {
        id: "c5e1", title: "Bài 5.1: In từ 1 đến 5",
        prompt: "Dùng for và range in các số 1 2 3 4 5, mỗi số một dòng.",
        starter: "",
        expectedOutput: "1\n2\n3\n4\n5",
        sample: "for i in range(1, 6):\n    print(i)",
        require: ["for", "range"],
      },
      {
        id: "c5e2", title: "Bài 5.2: Cộng dồn",
        prompt: "Dùng for tính tổng 1+2+...+10 rồi in tổng (55).",
        starter: "tong = 0",
        expectedOutput: "55",
        sample: "tong = 0\nfor i in range(1, 11):\n    tong += i\nprint(tong)",
        require: ["for", "range"],
      },
      {
        id: "c5e3", title: "Bài 5.3: In 0 đến 4",
        prompt: "Dùng for in 0 1 2 3 4 mỗi số một dòng.",
        starter: "",
        expectedOutput: "0\n1\n2\n3\n4",
        sample: "for i in range(5):\n    print(i)",
        require: ["for", "range"],
      },
      {
        id: "c5e4", title: "Bài 5.4: Bảng nhân 2",
        prompt: "In 5 dòng: 2 x 1 = 2 ... 2 x 5 = 10 (dùng for).",
        starter: "",
        expectedOutput: "2 x 1 = 2\n2 x 2 = 4\n2 x 3 = 6\n2 x 4 = 8\n2 x 5 = 10",
        sample: "for i in range(1, 6):\n    print(f\"2 x {i} = {2 * i}\")",
        require: ["for", "range"],
      },
      {
        id: "c5e5", title: "Bài 5.5: Tổng chẵn",
        prompt: "Tính tổng các số chẵn từ 2 đến 10 (2+4+6+8+10=30).",
        starter: "tong = 0",
        expectedOutput: "30",
        sample: "tong = 0\nfor i in range(2, 11, 2):\n    tong += i\nprint(tong)",
        require: ["for", "range"],
      },
      {
        id: "c5e6", title: "Bài 5.6: Đếm ngược",
        prompt: "In 5 4 3 2 1 mỗi số một dòng.",
        starter: "",
        expectedOutput: "5\n4\n3\n2\n1",
        sample: "for i in range(5, 0, -1):\n    print(i)",
        require: ["for", "range"],
      },
      {
        id: "c5e7", title: "Bài 5.7: Lặp chuỗi",
        prompt: "Dùng for in từng chữ của \"Python\", mỗi chữ một dòng.",
        starter: "",
        expectedOutput: "P\ny\nt\nh\no\nn",
        sample: "for ch in \"Python\":\n    print(ch)",
        require: ["for"],
      },
      {
        id: "c5e8", title: "Bài 5.8: Bình phương 1-5",
        prompt: "In bình phương của 1 đến 5 (1 4 9 16 25).",
        starter: "",
        expectedOutput: "1\n4\n9\n16\n25",
        sample: "for i in range(1, 6):\n    print(i * i)",
        require: ["for", "range"],
      },
      {
        id: "c5e9", title: "Bài 5.9: Tổng 1..n",
        prompt: "n = 5. Tính tổng 1..n rồi in.",
        starter: "n = 5\ntong = 0",
        expectedOutput: "15",
        sample: "n = 5\ntong = 0\nfor i in range(1, n + 1):\n    tong += i\nprint(tong)",
        require: ["for", "range"],
      },
      {
        id: "c5e10", title: "Bài 5.10: Đếm số lần",
        prompt: "In chữ Hi đúng 3 lần, mỗi lần một dòng.",
        starter: "",
        expectedOutput: "Hi\nHi\nHi",
        sample: "for i in range(3):\n    print(\"Hi\")",
        require: ["for", "range"],
      },
      {
        id: "c5e11", title: "Bài 5.11: Bảng nhân 3",
        prompt: "In 3 x 1 = 3 đến 3 x 4 = 12.",
        starter: "",
        expectedOutput: "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12",
        sample: "for i in range(1, 5):\n    print(f\"3 x {i} = {3 * i}\")",
        require: ["for", "range"],
      },
      {
        id: "c5e12", title: "Bài 5.12: Tổng lẻ",
        prompt: "Tổng các số lẻ từ 1 đến 9 (1+3+5+7+9=25).",
        starter: "tong = 0",
        expectedOutput: "25",
        sample: "tong = 0\nfor i in range(1, 10, 2):\n    tong += i\nprint(tong)",
        require: ["for", "range"],
      },
      {
        id: "c5e13", title: "Bài 5.13: Giai thừa nhỏ",
        prompt: "n = 5. Tính 5! = 120 bằng for.",
        starter: "n = 5\ngt = 1",
        expectedOutput: "120",
        sample: "n = 5\ngt = 1\nfor i in range(1, n + 1):\n    gt *= i\nprint(gt)",
        require: ["for", "range"],
      },
      {
        id: "c5e14", title: "Bài 5.14: In sao",
        prompt: "In 4 dòng, dòng thứ i có i dấu * (1 đến 4).",
        starter: "",
        expectedOutput: "*\n**\n***\n****",
        sample: "for i in range(1, 5):\n    line = \"\"\n    for j in range(i):\n        line = line + \"*\"\n    print(line)",
        require: ["for", "range"],
      },
    ],
    exam: {
      code: {"prompt": "Dùng for in các số 1 đến 3, mỗi số một dòng.", "expectedOutput": "1\n2\n3", "sample": "for i in range(1, 4):\n    print(i)", "require": ["for", "range"]},
      mcq: [{"id": "q1", "q": "range(3) tạo dãy nào?", "options": ["1 2 3", "0 1 2", "0 1 2 3", "1 2"], "answer": 1}, {"id": "q2", "q": "for cần dấu gì ở cuối dòng?", "options": [";", ":", ",", "."], "answer": 1}],
    },
  },
  {
    id: "c6",
    title: "Chương 6: Vòng lặp while",
    theory: "while lặp khối lệnh chừng nào điều kiện còn đúng, hợp khi chưa biết trước sẽ lặp bao nhiêu lần. Muốn vòng lặp dừng được, bên trong phải có câu lệnh làm điều kiện dần sai đi, thường là tăng biến đếm như i += 1. Lỗi nguy hiểm nhất là quên tăng biến đếm, khiến điều kiện luôn đúng và chương trình chạy mãi không dừng. Bạn cũng có thể dùng break để thoát sớm và continue để bỏ qua lần lặp hiện tại.",
    example: "i = 1\nwhile i <= 5:\n    print(i)\n    i += 1",
    exercises: [
      {
        id: "c6e1", title: "Bài 6.1: while đếm",
        prompt: "Dùng while in 1 2 3 mỗi số một dòng.",
        starter: "i = 1",
        expectedOutput: "1\n2\n3",
        sample: "i = 1\nwhile i <= 3:\n    print(i)\n    i += 1",
        require: ["print"],
      },
      {
        id: "c6e2", title: "Bài 6.2: while tổng",
        prompt: "Tính tổng 1..5 bằng while, in 15.",
        starter: "i = 1\ntong = 0",
        expectedOutput: "15",
        sample: "i = 1\ntong = 0\nwhile i <= 5:\n    tong += i\n    i += 1\nprint(tong)",
        require: ["print"],
      },
      {
        id: "c6e3", title: "Bài 6.3: while đếm ngược",
        prompt: "In 3 2 1 bằng while.",
        starter: "i = 3",
        expectedOutput: "3\n2\n1",
        sample: "i = 3\nwhile i >= 1:\n    print(i)\n    i -= 1",
        require: ["print"],
      },
      {
        id: "c6e4", title: "Bài 6.4: while nhân đôi",
        prompt: "Bắt đầu n = 1, nhân đôi cho đến khi n > 20, in mỗi giá trị (1 2 4 8 16).",
        starter: "n = 1",
        expectedOutput: "1\n2\n4\n8\n16",
        sample: "n = 1\nwhile n <= 16:\n    print(n)\n    n *= 2",
        require: ["print"],
      },
      {
        id: "c6e5", title: "Bài 6.5: while đến 10",
        prompt: "In các số từ 0 đến 10 bước 2 (0 2 4 6 8 10).",
        starter: "i = 0",
        expectedOutput: "0\n2\n4\n6\n8\n10",
        sample: "i = 0\nwhile i <= 10:\n    print(i)\n    i += 2",
        require: ["print"],
      },
      {
        id: "c6e6", title: "Bài 6.6: while bình phương",
        prompt: "In i*i với i từ 1 đến 4.",
        starter: "i = 1",
        expectedOutput: "1\n4\n9\n16",
        sample: "i = 1\nwhile i <= 4:\n    print(i * i)\n    i += 1",
        require: ["print"],
      },
      {
        id: "c6e7", title: "Bài 6.7: while chuỗi",
        prompt: "In \"Go\" đúng 4 lần bằng while.",
        starter: "i = 0",
        expectedOutput: "Go\nGo\nGo\nGo",
        sample: "i = 0\nwhile i < 4:\n    print(\"Go\")\n    i += 1",
        require: ["print"],
      },
      {
        id: "c6e8", title: "Bài 6.8: while giai",
        prompt: "dem = 5, giảm dần in đến 1.",
        starter: "dem = 5",
        expectedOutput: "5\n4\n3\n2\n1",
        sample: "dem = 5\nwhile dem > 0:\n    print(dem)\n    dem -= 1",
        require: ["print"],
      },
      {
        id: "c6e9", title: "Bài 6.9: while tổng chẵn",
        prompt: "Tổng chẵn 2..8 bằng while (20).",
        starter: "i = 2\ntong = 0",
        expectedOutput: "20",
        sample: "i = 2\ntong = 0\nwhile i <= 8:\n    tong += i\n    i += 2\nprint(tong)",
        require: ["print"],
      },
      {
        id: "c6e10", title: "Bài 6.10: while giai thừa",
        prompt: "n = 4, tính 4! = 24 bằng while.",
        starter: "n = 4\ngt = 1\ni = 1",
        expectedOutput: "24",
        sample: "n = 4\ngt = 1\ni = 1\nwhile i <= n:\n    gt *= i\n    i += 1\nprint(gt)",
        require: ["print"],
      },
    ],
    exam: {
      code: {"prompt": "Dùng while in 1 và 2 mỗi số một dòng.", "expectedOutput": "1\n2", "sample": "i = 1\nwhile i <= 2:\n    print(i)\n    i += 1", "require": ["print"]},
      mcq: [{"id": "q1", "q": "while dừng khi nào?", "options": ["Sau 10 lần", "Khi điều kiện sai", "Không bao giờ", "Khi có print"], "answer": 1}, {"id": "q2", "q": "Thiếu i += 1 trong while đếm thường dẫn đến?", "options": ["In 1 lần", "Lặp vô hạn", "Báo lỗi cú pháp", "Bỏ qua vòng lặp"], "answer": 1}],
    },
  },
  {
    id: "c7",
    title: "Chương 7: Danh sách (list)",
    theory: "Danh sách, hay list, lưu nhiều giá trị trong một biến, viết trong cặp ngoặc vuông. Phần tử đầu tiên có chỉ số 0, len cho biết danh sách có bao nhiêu phần tử. Bạn có thể duyệt từng phần tử bằng for, dùng sum để tính tổng nhanh, hoặc thêm phần tử bằng append. Lỗi thường gặp là tưởng chỉ số bắt đầu từ 1, lấy chỉ số vượt quá độ dài, hoặc gán sai vị trí khi muốn sửa một phần tử.",
    example: "ds = [\"An\", \"Bình\", \"Chi\"]\nprint(ds[1])\nprint(len(ds))\nfor x in ds:\n    print(x)",
    exercises: [
      {
        id: "c7e1", title: "Bài 7.1: Lấy phần tử",
        prompt: "ds = [\"An\", \"Bình\", \"Chi\"], in phần tử thứ hai (Bình) bằng chỉ số.",
        starter: "ds = [\"An\", \"Bình\", \"Chi\"]",
        expectedOutput: "Bình",
        sample: "ds = [\"An\", \"Bình\", \"Chi\"]\nprint(ds[1])",
        require: ["list"],
      },
      {
        id: "c7e2", title: "Bài 7.2: Phần tử đầu",
        prompt: "nums = [10, 20, 30], in phần tử đầu.",
        starter: "nums = [10, 20, 30]",
        expectedOutput: "10",
        sample: "nums = [10, 20, 30]\nprint(nums[0])",
        require: ["list"],
      },
      {
        id: "c7e3", title: "Bài 7.3: Phần tử cuối",
        prompt: "nums = [10, 20, 30], in phần tử cuối bằng nums[len(nums)-1].",
        starter: "nums = [10, 20, 30]",
        expectedOutput: "30",
        sample: "nums = [10, 20, 30]\nprint(nums[len(nums) - 1])",
        require: ["list"],
      },
      {
        id: "c7e4", title: "Bài 7.4: Độ dài",
        prompt: "ds = [1, 2, 3, 4], in len(ds).",
        starter: "ds = [1, 2, 3, 4]",
        expectedOutput: "4",
        sample: "ds = [1, 2, 3, 4]\nprint(len(ds))",
        require: ["list"],
      },
      {
        id: "c7e5", title: "Bài 7.5: Duyệt list",
        prompt: "ds = [2, 4, 6], dùng for in từng phần tử.",
        starter: "ds = [2, 4, 6]",
        expectedOutput: "2\n4\n6",
        sample: "ds = [2, 4, 6]\nfor x in ds:\n    print(x)",
        require: ["list", "for"],
      },
      {
        id: "c7e6", title: "Bài 7.6: Tổng list",
        prompt: "nums = [1, 2, 3, 4], tính tổng bằng for rồi in.",
        starter: "nums = [1, 2, 3, 4]\ntong = 0",
        expectedOutput: "10",
        sample: "nums = [1, 2, 3, 4]\ntong = 0\nfor x in nums:\n    tong += x\nprint(tong)",
        require: ["list", "for"],
      },
      {
        id: "c7e7", title: "Bài 7.7: Tổng bằng sum",
        prompt: "nums = [5, 10, 15], in sum(nums).",
        starter: "nums = [5, 10, 15]",
        expectedOutput: "30",
        sample: "nums = [5, 10, 15]\nprint(sum(nums))",
        require: ["list"],
      },
      {
        id: "c7e8", title: "Bài 7.8: Max thủ công",
        prompt: "nums = [3, 9, 2, 7], tìm max bằng for rồi in.",
        starter: "nums = [3, 9, 2, 7]",
        expectedOutput: "9",
        sample: "nums = [3, 9, 2, 7]\nm = nums[0]\nfor x in nums:\n    if x > m:\n        m = x\nprint(m)",
        require: ["list", "for", "if"],
      },
      {
        id: "c7e9", title: "Bài 7.9: Đếm phần tử",
        prompt: "ds = [1, 2, 2, 3, 2], đếm số lần 2 xuất hiện rồi in.",
        starter: "ds = [1, 2, 2, 3, 2]\ndem = 0",
        expectedOutput: "3",
        sample: "ds = [1, 2, 2, 3, 2]\ndem = 0\nfor x in ds:\n    if x == 2:\n        dem += 1\nprint(dem)",
        require: ["list", "for", "if"],
      },
      {
        id: "c7e10", title: "Bài 7.10: Nhân đôi phần tử",
        prompt: "nums = [1, 2, 3], in mỗi phần tử nhân 2.",
        starter: "nums = [1, 2, 3]",
        expectedOutput: "2\n4\n6",
        sample: "nums = [1, 2, 3]\nfor x in nums:\n    print(x * 2)",
        require: ["list", "for"],
      },
      {
        id: "c7e11", title: "Bài 7.11: Chỉ số và giá trị",
        prompt: "ds = [\"a\", \"b\", \"c\"], in dạng 0:a 1:b 2:c mỗi dòng.",
        starter: "ds = [\"a\", \"b\", \"c\"]",
        expectedOutput: "0:a\n1:b\n2:c",
        sample: "ds = [\"a\", \"b\", \"c\"]\nfor i in range(len(ds)):\n    print(f\"{i}:{ds[i]}\")",
        require: ["list", "for", "range"],
      },
      {
        id: "c7e12", title: "Bài 7.12: Lọc số chẵn",
        prompt: "nums = [1, 2, 3, 4, 5, 6], in các số chẵn.",
        starter: "nums = [1, 2, 3, 4, 5, 6]",
        expectedOutput: "2\n4\n6",
        sample: "nums = [1, 2, 3, 4, 5, 6]\nfor x in nums:\n    if x % 2 == 0:\n        print(x)",
        require: ["list", "for", "if"],
      },
    ],
    exam: {
      code: {"prompt": "nums = [2, 4, 6], in phần tử đầu.", "expectedOutput": "2", "sample": "nums = [2, 4, 6]\nprint(nums[0])", "require": ["list"]},
      mcq: [{"id": "q1", "q": "Trong [\"An\",\"Bình\",\"Chi\"], ds[1] là?", "options": ["An", "Bình", "Chi", "Lỗi"], "answer": 1}, {"id": "q2", "q": "Chỉ số list bắt đầu từ?", "options": ["1", "0", "-1", "2"], "answer": 1}],
    },
  },
  {
    id: "c8",
    title: "Chương 8: Hàm (def)",
    theory: "Hàm gom một việc lặp lại thành một khối có tên. Bạn định nghĩa bằng def, đặt tên hàm và các tham số trong ngoặc đơn, rồi thụt lề thân hàm. return trả một giá trị về cho nơi gọi hàm, khác với print chỉ in ra màn hình. Muốn hàm chạy thì phải gọi nó, và số đối số khi gọi phải khớp với số tham số. Lỗi thường gặp là quên dấu hai chấm sau dòng def, quên return, hoặc gọi hàm mà không in kết quả.",
    example: "def tong(a, b):\n    return a + b\n\nprint(tong(4, 6))",
    exercises: [
      {
        id: "c8e1", title: "Bài 8.1: Hàm cộng",
        prompt: "Định nghĩa tong(a, b) trả về a+b, gọi print(tong(4, 6)).",
        starter: "def tong(a, b):",
        expectedOutput: "10",
        sample: "def tong(a, b):\n    return a + b\n\nprint(tong(4, 6))",
        require: ["function"],
      },
      {
        id: "c8e2", title: "Bài 8.2: Hàm nhân",
        prompt: "Định nghĩa nhan(a, b) trả về a*b, in nhan(3, 5).",
        starter: "def nhan(a, b):",
        expectedOutput: "15",
        sample: "def nhan(a, b):\n    return a * b\n\nprint(nhan(3, 5))",
        require: ["function"],
      },
      {
        id: "c8e3", title: "Bài 8.3: Hàm chào",
        prompt: "Định nghĩa chao(ten) in f\"Xin chào {ten}\". Gọi chao(\"An\").",
        starter: "def chao(ten):",
        expectedOutput: "Xin chào An",
        sample: "def chao(ten):\n    print(f\"Xin chào {ten}\")\n\nchao(\"An\")",
        require: ["function"],
      },
      {
        id: "c8e4", title: "Bài 8.4: Hàm bình phương",
        prompt: "Định nghĩa bp(n) trả về n*n, in bp(9).",
        starter: "def bp(n):",
        expectedOutput: "81",
        sample: "def bp(n):\n    return n * n\n\nprint(bp(9))",
        require: ["function"],
      },
      {
        id: "c8e5", title: "Bài 8.5: Hàm max2",
        prompt: "Định nghĩa max2(a, b) trả về số lớn hơn, in max2(7, 12).",
        starter: "def max2(a, b):",
        expectedOutput: "12",
        sample: "def max2(a, b):\n    if a > b:\n        return a\n    return b\n\nprint(max2(7, 12))",
        require: ["function", "if"],
      },
      {
        id: "c8e6", title: "Bài 8.6: Hàm chẵn lẻ",
        prompt: "Định nghĩa loai(n) trả về \"Chan\" nếu chẵn, \"Le\" nếu lẻ. In loai(8).",
        starter: "def loai(n):",
        expectedOutput: "Chan",
        sample: "def loai(n):\n    if n % 2 == 0:\n        return \"Chan\"\n    return \"Le\"\n\nprint(loai(8))",
        require: ["function", "if"],
      },
      {
        id: "c8e7", title: "Bài 8.7: Hàm giai",
        prompt: "Định nghĩa gt(n) tính giai thừa, in gt(5).",
        starter: "def gt(n):",
        expectedOutput: "120",
        sample: "def gt(n):\n    k = 1\n    for i in range(1, n + 1):\n        k *= i\n    return k\n\nprint(gt(5))",
        require: ["function", "for", "range"],
      },
      {
        id: "c8e8", title: "Bài 8.8: Hàm tổng list",
        prompt: "Định nghĩa tong_list(ds) trả về tổng, in tong_list([1,2,3,4]).",
        starter: "def tong_list(ds):",
        expectedOutput: "10",
        sample: "def tong_list(ds):\n    s = 0\n    for x in ds:\n        s += x\n    return s\n\nprint(tong_list([1, 2, 3, 4]))",
        require: ["function", "list", "for"],
      },
      {
        id: "c8e9", title: "Bài 8.9: Hàm chu vi",
        prompt: "Định nghĩa chu_vi(dai, rong) trả về 2*(dai+rong), in chu_vi(5, 3).",
        starter: "def chu_vi(dai, rong):",
        expectedOutput: "16",
        sample: "def chu_vi(dai, rong):\n    return 2 * (dai + rong)\n\nprint(chu_vi(5, 3))",
        require: ["function"],
      },
      {
        id: "c8e10", title: "Bài 8.10: Hàm tuyệt đối",
        prompt: "Định nghĩa abs_val(n) trả về |n|, in abs_val(-7).",
        starter: "def abs_val(n):",
        expectedOutput: "7",
        sample: "def abs_val(n):\n    if n < 0:\n        return -n\n    return n\n\nprint(abs_val(-7))",
        require: ["function", "if"],
      },
      {
        id: "c8e11", title: "Bài 8.11: Hàm lũy thừa",
        prompt: "Định nghĩa luy_thua(a, b) trả về a**b, in luy_thua(2, 10).",
        starter: "def luy_thua(a, b):",
        expectedOutput: "1024",
        sample: "def luy_thua(a, b):\n    return a ** b\n\nprint(luy_thua(2, 10))",
        require: ["function"],
      },
      {
        id: "c8e12", title: "Bài 8.12: Hàm đếm chẵn",
        prompt: "Định nghĩa dem_chan(ds) trả về số phần tử chẵn, in dem_chan([1,2,3,4,5,6]).",
        starter: "def dem_chan(ds):",
        expectedOutput: "3",
        sample: "def dem_chan(ds):\n    d = 0\n    for x in ds:\n        if x % 2 == 0:\n            d += 1\n    return d\n\nprint(dem_chan([1, 2, 3, 4, 5, 6]))",
        require: ["function", "list", "for", "if"],
      },
    ],
    exam: {
      code: {"prompt": "Định nghĩa nhan(a,b) trả về a*b, in nhan(3,5).", "expectedOutput": "15", "sample": "def nhan(a, b):\n    return a * b\n\nprint(nhan(3, 5))", "require": ["function"]},
      mcq: [{"id": "q1", "q": "Định nghĩa hàm mà không gọi thì sao?", "options": ["Hàm tự chạy", "Không chạy", "Báo lỗi", "Chạy 2 lần"], "answer": 1}, {"id": "q2", "q": "Từ khóa trả về giá trị là?", "options": ["give", "return", "yield", "out"], "answer": 1}],
    },
  },
  {
    id: "c9",
    title: "Chương 9: Bài tập tổng hợp trung cấp",
    theory: "Kết hợp for, if, list, chuỗi để giải bài toán thực tế: lọc, đếm, đảo, Fibonacci, kiểm tra nguyên tố.",
    example: "tong = 0\nfor i in range(1, 21):\n    if i % 3 == 0 or i % 5 == 0:\n        tong += i\nprint(tong)",
    exercises: [
      {
        id: "c9e1", title: "Bài 9.1: Fizz đơn giản",
        prompt: "for i in 1..15, nếu chia hết 3 in Fizz, else in i.",
        starter: "",
        expectedOutput: "1\n2\nFizz\n4\n5\nFizz\n7\n8\nFizz\n10\n11\nFizz\n13\n14\nFizz",
        sample: "for i in range(1, 16):\n    if i % 3 == 0:\n        print(\"Fizz\")\n    else:\n        print(i)",
        require: ["for", "range", "if"],
      },
      {
        id: "c9e2", title: "Bài 9.2: Tổng điều kiện",
        prompt: "Tổng các số 1..20 chia hết cho 3 hoặc 5 (98).",
        starter: "tong = 0",
        expectedOutput: "98",
        sample: "tong = 0\nfor i in range(1, 21):\n    if i % 3 == 0 or i % 5 == 0:\n        tong += i\nprint(tong)",
        require: ["for", "range", "if"],
      },
      {
        id: "c9e3", title: "Bài 9.3: Đảo chuỗi thủ công",
        prompt: "s = \"hello\", in đảo \"olleh\" bằng for.",
        starter: "s = \"hello\"\nout = \"\"",
        expectedOutput: "olleh",
        sample: "s = \"hello\"\nout = \"\"\nfor ch in s:\n    out = ch + out\nprint(out)",
        require: ["for"],
      },
      {
        id: "c9e4", title: "Bài 9.4: Đếm nguyên âm",
        prompt: "s = \"education\", đếm aeiou rồi in.",
        starter: "s = \"education\"\ndem = 0",
        expectedOutput: "5",
        sample: "s = \"education\"\ndem = 0\nfor ch in s:\n    if ch in \"aeiou\":\n        dem += 1\nprint(dem)",
        require: ["for", "if"],
      },
      {
        id: "c9e5", title: "Bài 9.5: Tam giác số",
        prompt: "In:\n1\n12\n123\n1234",
        starter: "",
        expectedOutput: "1\n12\n123\n1234",
        sample: "for i in range(1, 5):\n    line = \"\"\n    for j in range(1, i + 1):\n        line += str(j)\n    print(line)",
        require: ["for", "range"],
      },
      {
        id: "c9e6", title: "Bài 9.6: Kiểm tra nguyên tố",
        prompt: "n = 17. Nếu nguyên tố in Yes, else No.",
        starter: "n = 17",
        expectedOutput: "Yes",
        sample: "n = 17\nok = True\nif n < 2:\n    ok = False\nfor i in range(2, n):\n    if n % i == 0:\n        ok = False\nif ok:\n    print(\"Yes\")\nelse:\n    print(\"No\")",
        require: ["for", "range", "if"],
      },
      {
        id: "c9e7", title: "Bài 9.7: Không nguyên tố",
        prompt: "n = 15. In Yes nếu nguyên tố, else No.",
        starter: "n = 15",
        expectedOutput: "No",
        sample: "n = 15\nok = True\nif n < 2:\n    ok = False\nfor i in range(2, n):\n    if n % i == 0:\n        ok = False\nif ok:\n    print(\"Yes\")\nelse:\n    print(\"No\")",
        require: ["for", "range", "if"],
      },
      {
        id: "c9e8", title: "Bài 9.8: Fibonacci đơn",
        prompt: "In 8 số Fibonacci đầu: 0 1 1 2 3 5 8 13 mỗi dòng.",
        starter: "a = 0\nb = 1",
        expectedOutput: "0\n1\n1\n2\n3\n5\n8\n13",
        sample: "a = 0\nb = 1\nfor i in range(8):\n    print(a)\n    t = a + b\n    a = b\n    b = t",
        require: ["for", "range"],
      },
      {
        id: "c9e9", title: "Bài 9.9: Min list",
        prompt: "nums = [4, 1, 7, 3], tìm min bằng for.",
        starter: "nums = [4, 1, 7, 3]",
        expectedOutput: "1",
        sample: "nums = [4, 1, 7, 3]\nm = nums[0]\nfor x in nums:\n    if x < m:\n        m = x\nprint(m)",
        require: ["list", "for", "if"],
      },
      {
        id: "c9e10", title: "Bài 9.10: Trung bình list",
        prompt: "nums = [2, 4, 6, 8], in trung bình.",
        starter: "nums = [2, 4, 6, 8]",
        expectedOutput: "5.0",
        sample: "nums = [2, 4, 6, 8]\nprint(sum(nums) / len(nums))",
        require: ["list"],
      },
      {
        id: "c9e11", title: "Bài 9.11: Vẽ hình chữ nhật",
        prompt: "In hình 3 hàng 5 cột dấu #.",
        starter: "",
        expectedOutput: "#####\n#####\n#####",
        sample: "for i in range(3):\n    line = \"\"\n    for j in range(5):\n        line = line + \"#\"\n    print(line)",
        require: ["for", "range"],
      },
      {
        id: "c9e12", title: "Bài 9.12: Lọc và đếm",
        prompt: "nums = [5, 12, 7, 20, 3, 15], đếm số > 10 rồi in.",
        starter: "nums = [5, 12, 7, 20, 3, 15]\ndem = 0",
        expectedOutput: "3",
        sample: "nums = [5, 12, 7, 20, 3, 15]\ndem = 0\nfor x in nums:\n    if x > 10:\n        dem += 1\nprint(dem)",
        require: ["list", "for", "if"],
      },
    ],
    exam: {
      code: {"prompt": "Dùng for in 1 2 3.", "expectedOutput": "1\n2\n3", "sample": "for i in range(1, 4):\n    print(i)", "require": ["for", "range"]},
      mcq: [{"id": "q1", "q": "Toán tử or nghĩa là?", "options": ["Và", "Hoặc", "Phủ định", "So sánh"], "answer": 1}, {"id": "q2", "q": "len(\"hi\") bằng?", "options": ["1", "2", "3", "0"], "answer": 1}],
    },
  },
  {
    id: "c10",
    title: "Chương 10: Nâng cao & tổng hợp",
    theory: "Lồng vòng lặp, hàm kết hợp list/if/for, bài toán cổ điển: palindrome, max thứ hai, ma trận, lọc dữ liệu.",
    example: "def is_even(n):\n    return n % 2 == 0\n\nfor i in range(1, 6):\n    if is_even(i):\n        print(i)",
    exercises: [
      {
        id: "c10e1", title: "Bài 10.1: Nested loop",
        prompt: "In ma trận 3x3 số 1.",
        starter: "",
        expectedOutput: "1 1 1\n1 1 1\n1 1 1",
        sample: "for i in range(3):\n    line = \"\"\n    for j in range(3):\n        if j > 0:\n            line += \" \"\n        line += \"1\"\n    print(line)",
        require: ["for", "range"],
      },
      {
        id: "c10e2", title: "Bài 10.2: Bảng cửu chương 5",
        prompt: "In bảng nhân 5 từ 1 đến 5.",
        starter: "",
        expectedOutput: "5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25",
        sample: "for i in range(1, 6):\n    print(f\"5 x {i} = {5 * i}\")",
        require: ["for", "range"],
      },
      {
        id: "c10e3", title: "Bài 10.3: Hàm is_even",
        prompt: "Định nghĩa is_even(n) trả về \"Yes\" nếu chẵn else \"No\". In is_even(10).",
        starter: "def is_even(n):",
        expectedOutput: "Yes",
        sample: "def is_even(n):\n    if n % 2 == 0:\n        return \"Yes\"\n    return \"No\"\n\nprint(is_even(10))",
        require: ["function", "if"],
      },
      {
        id: "c10e4", title: "Bài 10.4: Hàm average",
        prompt: "Định nghĩa average(ds) trả về trung bình, in average([10, 20, 30]).",
        starter: "def average(ds):",
        expectedOutput: "20.0",
        sample: "def average(ds):\n    return sum(ds) / len(ds)\n\nprint(average([10, 20, 30]))",
        require: ["function", "list"],
      },
      {
        id: "c10e5", title: "Bài 10.5: Đếm từ",
        prompt: "s = \"a b a c a\", đếm số từ \"a\" (tách bằng for trên split thủ công bằng khoảng trắng đơn giản: dùng list cố định).",
        starter: "words = [\"a\", \"b\", \"a\", \"c\", \"a\"]\ndem = 0",
        expectedOutput: "3",
        sample: "words = [\"a\", \"b\", \"a\", \"c\", \"a\"]\ndem = 0\nfor w in words:\n    if w == \"a\":\n        dem += 1\nprint(dem)",
        require: ["list", "for", "if"],
      },
      {
        id: "c10e6", title: "Bài 10.6: Second max",
        prompt: "nums = [5, 1, 9, 3, 9, 7], tìm max thứ hai phân biệt (7).",
        starter: "nums = [5, 1, 9, 3, 9, 7]",
        expectedOutput: "7",
        sample: "nums = [5, 1, 9, 3, 9, 7]\nm1 = nums[0]\nm2 = nums[0]\nfor x in nums:\n    if x > m1:\n        m2 = m1\n        m1 = x\n    elif x > m2 and x != m1:\n        m2 = x\nprint(m2)",
        require: ["list", "for", "if"],
      },
      {
        id: "c10e7", title: "Bài 10.7: Palindrome số",
        prompt: "n = 121. In Yes nếu đọc xuôi ngược giống nhau (dạng chuỗi), else No.",
        starter: "n = 121",
        expectedOutput: "Yes",
        sample: "n = 121\ns = str(n)\nrev = \"\"\nfor ch in s:\n    rev = ch + rev\nif s == rev:\n    print(\"Yes\")\nelse:\n    print(\"No\")",
        require: ["for", "if"],
      },
      {
        id: "c10e8", title: "Bài 10.8: Tổng đường chéo",
        prompt: "Tính 1+5+9 từ ma trận giả lập rows = [[1,2,3],[4,5,6],[7,8,9]].",
        starter: "rows = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\ntong = 0",
        expectedOutput: "15",
        sample: "rows = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\ntong = 0\nfor i in range(3):\n    tong += rows[i][i]\nprint(tong)",
        require: ["list", "for", "range"],
      },
      {
        id: "c10e9", title: "Bài 10.9: Hàm filter_even",
        prompt: "Định nghĩa filter_even(ds) in các số chẵn trong ds. Gọi filter_even([1,2,3,4,5,6]).",
        starter: "def filter_even(ds):",
        expectedOutput: "2\n4\n6",
        sample: "def filter_even(ds):\n    for x in ds:\n        if x % 2 == 0:\n            print(x)\n\nfilter_even([1, 2, 3, 4, 5, 6])",
        require: ["function", "list", "for", "if"],
      },
      {
        id: "c10e10", title: "Bài 10.10: Tổng lũy thừa",
        prompt: "Tính 1**2 + 2**2 + ... + 10**2 (385).",
        starter: "tong = 0",
        expectedOutput: "385",
        sample: "tong = 0\nfor i in range(1, 11):\n    tong += i * i\nprint(tong)",
        require: ["for", "range"],
      },
    ],
    exam: {
      code: {"prompt": "In tổng 1..5 (15) bằng for.", "expectedOutput": "15", "sample": "tong = 0\nfor i in range(1, 6):\n    tong += i\nprint(tong)", "require": ["for", "range"]},
      mcq: [{"id": "q1", "q": "Vòng lặp lồng là gì?", "options": ["while trong while/for trong for", "Hai biến", "Hàm trong hàm", "List trong list"], "answer": 0}, {"id": "q2", "q": "str(121) tạo ra gì?", "options": ["Số 121", "Chuỗi \"121\"", "List", "Lỗi"], "answer": 1}],
    },
  },
  {
    id: "c11",
    title: "Chương 11: Toán phổ thông với Python",
    theory: "Nhiều bài toán lớp 6–9 có thể giải bằng biến và phép tính: chu vi, diện tích, trung bình cộng, quy đổi đơn vị, phần trăm.",
    example: "dai = 8\nrong = 5\nprint(2 * (dai + rong))\nprint(dai * rong)",
    exercises: [
      {
        id: "c11e1", title: "Bài 11.1: Chu vi HCN",
        prompt: "Hình chữ nhật dài 12cm, rộng 7cm. In chu vi (2*(dài+rộng)).",
        starter: "dai = 12\nrong = 7",
        expectedOutput: "38",
        sample: "dai = 12\nrong = 7\nprint(2 * (dai + rong))",
        require: ["variable"],
      },
      {
        id: "c11e2", title: "Bài 11.2: Diện tích HCN",
        prompt: "Dài 12, rộng 7. In diện tích.",
        starter: "dai = 12\nrong = 7",
        expectedOutput: "84",
        sample: "dai = 12\nrong = 7\nprint(dai * rong)",
        require: ["variable"],
      },
      {
        id: "c11e3", title: "Bài 11.3: Chu vi hình vuông",
        prompt: "Cạnh a = 9. In chu vi 4*a.",
        starter: "a = 9",
        expectedOutput: "36",
        sample: "a = 9\nprint(4 * a)",
        require: ["variable"],
      },
      {
        id: "c11e4", title: "Bài 11.4: Diện tích hình vuông",
        prompt: "Cạnh a = 9. In a*a.",
        starter: "a = 9",
        expectedOutput: "81",
        sample: "a = 9\nprint(a * a)",
        require: ["variable"],
      },
      {
        id: "c11e5", title: "Bài 11.5: Trung bình cộng",
        prompt: "Ba điểm 7, 8, 9. In trung bình cộng.",
        starter: "a = 7\nb = 8\nc = 9",
        expectedOutput: "8.0",
        sample: "a = 7\nb = 8\nc = 9\nprint((a + b + c) / 3)",
        require: ["variable"],
      },
      {
        id: "c11e6", title: "Bài 11.6: Đổi cm sang m",
        prompt: "cm = 250. In số mét (cm/100).",
        starter: "cm = 250",
        expectedOutput: "2.5",
        sample: "cm = 250\nprint(cm / 100)",
        require: ["variable"],
      },
      {
        id: "c11e7", title: "Bài 11.7: Phần trăm",
        prompt: "Số học sinh 40, nghỉ 8. In phần trăm nghỉ (8/40*100).",
        starter: "tong = 40\nnghi = 8",
        expectedOutput: "20.0",
        sample: "tong = 40\nnghi = 8\nprint(nghi / tong * 100)",
        require: ["variable"],
      },
      {
        id: "c11e8", title: "Bài 11.8: Vận tốc",
        prompt: "Quãng đường s = 150 km, thời gian t = 3 giờ. In vận tốc s/t.",
        starter: "s = 150\nt = 3",
        expectedOutput: "50.0",
        sample: "s = 150\nt = 3\nprint(s / t)",
        require: ["variable"],
      },
      {
        id: "c11e9", title: "Bài 11.9: Tiền lãi đơn",
        prompt: "Vốn 2000000, lãi suất 5% một năm. In tiền lãi một năm.",
        starter: "von = 2000000\nlai_suat = 5",
        expectedOutput: "100000.0",
        sample: "von = 2000000\nlai_suat = 5\nprint(von * lai_suat / 100)",
        require: ["variable"],
      },
      {
        id: "c11e10", title: "Bài 11.10: Tuổi sau n năm",
        prompt: "Tuổi hiện tại 14, sau 6 năm. In tuổi lúc đó.",
        starter: "tuoi = 14\nn = 6",
        expectedOutput: "20",
        sample: "tuoi = 14\nn = 6\nprint(tuoi + n)",
        require: ["variable"],
      },
      {
        id: "c11e11", title: "Bài 11.11: Diện tích tam giác",
        prompt: "Đáy 10, cao 6. In (day*cao)/2.",
        starter: "day = 10\ncao = 6",
        expectedOutput: "30.0",
        sample: "day = 10\ncao = 6\nprint(day * cao / 2)",
        require: ["variable"],
      },
      {
        id: "c11e12", title: "Bài 11.12: Tổng dãy 1..n (công thức)",
        prompt: "n = 100. In tổng 1+2+...+n bằng n*(n+1)/2.",
        starter: "n = 100",
        expectedOutput: "5050.0",
        sample: "n = 100\nprint(n * (n + 1) / 2)",
        require: ["variable"],
      },
    ],
    exam: {
      code: {"prompt": "dai=10, rong=4. In chu vi HCN.", "expectedOutput": "28", "sample": "dai = 10\nrong = 4\nprint(2 * (dai + rong))", "require": ["variable"]},
      mcq: [{"id": "q1", "q": "Chu vi HCN là?", "options": ["dài×rộng", "2×(dài+rộng)", "dài+rộng", "4×dài"], "answer": 1}, {"id": "q2", "q": "Trung bình 6 và 10 là?", "options": ["16", "8", "4", "60"], "answer": 1}],
    },
  },
  {
    id: "c12",
    title: "Chương 12: Điểm số & xếp loại học sinh",
    theory: "Bài tập quen thuộc ở trường: xếp loại theo điểm, tính điểm trung bình, so sánh đạt/không đạt, bảng điểm bằng list.",
    example: "diem = 8.5\nif diem >= 8:\n    print(\"Gioi\")\nelif diem >= 6.5:\n    print(\"Kha\")\nelse:\n    print(\"TB\")",
    exercises: [
      {
        id: "c12e1", title: "Bài 12.1: Đạt / chưa đạt",
        prompt: "diem = 5.5. Nếu >= 5 in Dat, else Chua dat.",
        starter: "diem = 5.5",
        expectedOutput: "Dat",
        sample: "diem = 5.5\nif diem >= 5:\n    print(\"Dat\")\nelse:\n    print(\"Chua dat\")",
        require: ["if"],
      },
      {
        id: "c12e2", title: "Bài 12.2: Xếp loại 3 mức",
        prompt: "diem = 7. Nếu >= 8 Gioi, elif >= 6.5 Kha, else TB.",
        starter: "diem = 7",
        expectedOutput: "Kha",
        sample: "diem = 7\nif diem >= 8:\n    print(\"Gioi\")\nelif diem >= 6.5:\n    print(\"Kha\")\nelse:\n    print(\"TB\")",
        require: ["if"],
      },
      {
        id: "c12e3", title: "Bài 12.3: Học sinh giỏi",
        prompt: "diem = 9.2. Xếp loại như 12.2.",
        starter: "diem = 9.2",
        expectedOutput: "Gioi",
        sample: "diem = 9.2\nif diem >= 8:\n    print(\"Gioi\")\nelif diem >= 6.5:\n    print(\"Kha\")\nelse:\n    print(\"TB\")",
        require: ["if"],
      },
      {
        id: "c12e4", title: "Bài 12.4: Điểm TB 3 môn",
        prompt: "toan=8, van=7, anh=9. In trung bình.",
        starter: "toan = 8\nvan = 7\nanh = 9",
        expectedOutput: "8.0",
        sample: "toan = 8\nvan = 7\nanh = 9\nprint((toan + van + anh) / 3)",
        require: ["variable"],
      },
      {
        id: "c12e5", title: "Bài 12.5: TB có trọng số",
        prompt: "toan=8, van=7. TB = (toan*2 + van)/3. In TB.",
        starter: "toan = 8\nvan = 7",
        expectedOutput: "7.666666666666667",
        sample: "toan = 8\nvan = 7\nprint((toan * 2 + van) / 3)",
        require: ["variable"],
      },
      {
        id: "c12e6", title: "Bài 12.6: So sánh hai học sinh",
        prompt: "a=8.5, b=7.0. In hoc sinh a neu a>b, else hoc sinh b.",
        starter: "a = 8.5\nb = 7.0",
        expectedOutput: "hoc sinh a",
        sample: "a = 8.5\nb = 7.0\nif a > b:\n    print(\"hoc sinh a\")\nelse:\n    print(\"hoc sinh b\")",
        require: ["if"],
      },
      {
        id: "c12e7", title: "Bài 12.7: Điểm danh sách",
        prompt: "diems = [6, 8, 9, 7]. In điểm cao nhất (max thủ công hoặc max logic for).",
        starter: "diems = [6, 8, 9, 7]",
        expectedOutput: "9",
        sample: "diems = [6, 8, 9, 7]\nm = diems[0]\nfor d in diems:\n    if d > m:\n        m = d\nprint(m)",
        require: ["list", "for", "if"],
      },
      {
        id: "c12e8", title: "Bài 12.8: Đếm học sinh đạt",
        prompt: "diems = [4, 5, 6, 3, 8]. Đếm số điểm >= 5.",
        starter: "diems = [4, 5, 6, 3, 8]\ndem = 0",
        expectedOutput: "3",
        sample: "diems = [4, 5, 6, 3, 8]\ndem = 0\nfor d in diems:\n    if d >= 5:\n        dem += 1\nprint(dem)",
        require: ["list", "for", "if"],
      },
      {
        id: "c12e9", title: "Bài 12.9: TB list điểm",
        prompt: "diems = [7, 8, 9, 6]. In trung bình.",
        starter: "diems = [7, 8, 9, 6]",
        expectedOutput: "7.5",
        sample: "diems = [7, 8, 9, 6]\nprint(sum(diems) / len(diems))",
        require: ["list"],
      },
      {
        id: "c12e10", title: "Bài 12.10: In phiếu điểm",
        prompt: "ten=\"An\", diem=8.5. Dùng f-string in: An - 8.5 diem",
        starter: "ten = \"An\"\ndiem = 8.5",
        expectedOutput: "An - 8.5 diem",
        sample: "ten = \"An\"\ndiem = 8.5\nprint(f\"{ten} - {diem} diem\")",
        require: ["fstring"],
      },
      {
        id: "c12e11", title: "Bài 12.11: Học bổng",
        prompt: "diem=8.5, hanh_kiem=\"Tot\". Nếu diem>=8 và in Tot thì in Dat hoc bong, else Khong.",
        starter: "diem = 8.5\nhanh_kiem = \"Tot\"",
        expectedOutput: "Dat hoc bong",
        sample: "diem = 8.5\nhanh_kiem = \"Tot\"\nif diem >= 8 and hanh_kiem == \"Tot\":\n    print(\"Dat hoc bong\")\nelse:\n    print(\"Khong\")",
        require: ["if"],
      },
      {
        id: "c12e12", title: "Bài 12.12: Xếp loại 4 mức",
        prompt: "diem=6. Nếu >=9 Xuat sac, >=8 Gioi, >=6.5 Kha, else TB.",
        starter: "diem = 6",
        expectedOutput: "TB",
        sample: "diem = 6\nif diem >= 9:\n    print(\"Xuat sac\")\nelif diem >= 8:\n    print(\"Gioi\")\nelif diem >= 6.5:\n    print(\"Kha\")\nelse:\n    print(\"TB\")",
        require: ["if"],
      },
    ],
    exam: {
      code: {"prompt": "diem=6.5. Nếu >=5 in Dat else Chua dat.", "expectedOutput": "Dat", "sample": "diem = 6.5\nif diem >= 5:\n    print(\"Dat\")\nelse:\n    print(\"Chua dat\")", "require": ["if"]},
      mcq: [{"id": "q1", "q": "Điểm trung bình 3 môn dùng phép?", "options": ["Cộng 3 số", "(a+b+c)/3", "a*b*c", "max"], "answer": 1}, {"id": "q2", "q": "Xếp loại cần cấu trúc?", "options": ["for", "if/elif/else", "def", "list"], "answer": 1}],
    },
  },
  {
    id: "c13",
    title: "Chương 13: Chuỗi văn bản (bài kiểu SGK)",
    theory: "Bài tập chuỗi thường gặp: nối họ tên, đếm ký tự, đảo chuỗi, kiểm tra đối xứng, in hoa logic đơn giản.",
    example: "ho = \"Nguyen\"\nten = \"An\"\nprint(ho + \" \" + ten)",
    exercises: [
      {
        id: "c13e1", title: "Bài 13.1: Ghép họ tên",
        prompt: "ho=\"Le\", ten=\"Minh\". In \"Le Minh\".",
        starter: "ho = \"Le\"\nten = \"Minh\"",
        expectedOutput: "Le Minh",
        sample: "ho = \"Le\"\nten = \"Minh\"\nprint(ho + \" \" + ten)",
        require: ["variable"],
      },
      {
        id: "c13e2", title: "Bài 13.2: Độ dài tên",
        prompt: "ten=\"Phuong\". In len(ten).",
        starter: "ten = \"Phuong\"",
        expectedOutput: "6",
        sample: "ten = \"Phuong\"\nprint(len(ten))",
        require: ["variable"],
      },
      {
        id: "c13e3", title: "Bài 13.3: Ký tự đầu",
        prompt: "s=\"Python\". In ký tự đầu s[0].",
        starter: "s = \"Python\"",
        expectedOutput: "P",
        sample: "s = \"Python\"\nprint(s[0])",
        require: ["variable"],
      },
      {
        id: "c13e4", title: "Bài 13.4: Ký tự cuối",
        prompt: "s=\"Python\". In ký tự cuối bằng s[len(s)-1].",
        starter: "s = \"Python\"",
        expectedOutput: "n",
        sample: "s = \"Python\"\nprint(s[len(s) - 1])",
        require: ["variable"],
      },
      {
        id: "c13e5", title: "Bài 13.5: Lặp chuỗi",
        prompt: "Dùng vòng lặp for in chữ ha ba lần trên cùng một dòng (hahaha).",
        starter: "out = \"\"",
        expectedOutput: "hahaha",
        sample: "out = \"\"\nfor i in range(3):\n    out = out + \"ha\"\nprint(out)",
        require: ["for", "range"],
      },
      {
        id: "c13e6", title: "Bài 13.6: Đảo chuỗi",
        prompt: "s=\"abc\". In đảo \"cba\".",
        starter: "s = \"abc\"\nout = \"\"",
        expectedOutput: "cba",
        sample: "s = \"abc\"\nout = \"\"\nfor ch in s:\n    out = ch + out\nprint(out)",
        require: ["for"],
      },
      {
        id: "c13e7", title: "Bài 13.7: Đếm chữ a",
        prompt: "s=\"banana\". Đếm số chữ a.",
        starter: "s = \"banana\"\ndem = 0",
        expectedOutput: "3",
        sample: "s = \"banana\"\ndem = 0\nfor ch in s:\n    if ch == \"a\":\n        dem += 1\nprint(dem)",
        require: ["for", "if"],
      },
      {
        id: "c13e8", title: "Bài 13.8: Đối xứng",
        prompt: "s=\"aba\". In Yes nếu palindrome, else No.",
        starter: "s = \"aba\"",
        expectedOutput: "Yes",
        sample: "s = \"aba\"\nrev = \"\"\nfor ch in s:\n    rev = ch + rev\nif s == rev:\n    print(\"Yes\")\nelse:\n    print(\"No\")",
        require: ["for", "if"],
      },
      {
        id: "c13e9", title: "Bài 13.9: Không đối xứng",
        prompt: "s=\"ab\". In Yes/No như trên.",
        starter: "s = \"ab\"",
        expectedOutput: "No",
        sample: "s = \"ab\"\nrev = \"\"\nfor ch in s:\n    rev = ch + rev\nif s == rev:\n    print(\"Yes\")\nelse:\n    print(\"No\")",
        require: ["for", "if"],
      },
      {
        id: "c13e10", title: "Bài 13.10: f-string giới thiệu",
        prompt: "ten=\"Lan\", lop=10. In: Em la Lan, hoc lop 10",
        starter: "ten = \"Lan\"\nlop = 10",
        expectedOutput: "Em la Lan, hoc lop 10",
        sample: "ten = \"Lan\"\nlop = 10\nprint(f\"Em la {ten}, hoc lop {lop}\")",
        require: ["fstring"],
      },
      {
        id: "c13e11", title: "Bài 13.11: Đếm khoảng trắng",
        prompt: "s=\"a b c\". Đếm số dấu cách.",
        starter: "s = \"a b c\"\ndem = 0",
        expectedOutput: "2",
        sample: "s = \"a b c\"\ndem = 0\nfor ch in s:\n    if ch == \" \":\n        dem += 1\nprint(dem)",
        require: ["for", "if"],
      },
      {
        id: "c13e12", title: "Bài 13.12: In từng ký tự",
        prompt: "s=\"HI\". In mỗi ký tự một dòng.",
        starter: "s = \"HI\"",
        expectedOutput: "H\nI",
        sample: "s = \"HI\"\nfor ch in s:\n    print(ch)",
        require: ["for"],
      },
    ],
    exam: {
      code: {"prompt": "ho=\"Tran\", ten=\"Nam\". In \"Tran Nam\".", "expectedOutput": "Tran Nam", "sample": "ho = \"Tran\"\nten = \"Nam\"\nprint(ho + \" \" + ten)", "require": ["variable"]},
      mcq: [{"id": "q1", "q": "len(\"abc\") bằng?", "options": ["2", "3", "4", "1"], "answer": 1}, {"id": "q2", "q": "Nối chuỗi dùng toán tử?", "options": ["+", "-", "*", "/"], "answer": 0}],
    },
  },
  {
    id: "c14",
    title: "Chương 14: Dãy số & vòng lặp (bài thi)",
    theory: "Các dạng hay ra kiểm tra: tổng dãy, tích, số chẵn/lẻ, bảng cửu chương, đếm ước, Fibonacci đơn giản.",
    example: "tong = 0\nfor i in range(1, 11):\n    tong += i\nprint(tong)",
    exercises: [
      {
        id: "c14e1", title: "Bài 14.1: Tổng 1..n",
        prompt: "n=20. Tính tổng 1..20.",
        starter: "n = 20\ntong = 0",
        expectedOutput: "210",
        sample: "n = 20\ntong = 0\nfor i in range(1, n + 1):\n    tong += i\nprint(tong)",
        require: ["for", "range"],
      },
      {
        id: "c14e2", title: "Bài 14.2: Tích 1..n",
        prompt: "n=5. Tính 1*2*...*5.",
        starter: "n = 5\ntich = 1",
        expectedOutput: "120",
        sample: "n = 5\ntich = 1\nfor i in range(1, n + 1):\n    tich *= i\nprint(tich)",
        require: ["for", "range"],
      },
      {
        id: "c14e3", title: "Bài 14.3: Tổng chẵn 1..n",
        prompt: "n=10. Tổng các số chẵn từ 1 đến 10.",
        starter: "n = 10\ntong = 0",
        expectedOutput: "30",
        sample: "n = 10\ntong = 0\nfor i in range(1, n + 1):\n    if i % 2 == 0:\n        tong += i\nprint(tong)",
        require: ["for", "range", "if"],
      },
      {
        id: "c14e4", title: "Bài 14.4: Đếm ước",
        prompt: "n=12. Đếm số ước của n.",
        starter: "n = 12\ndem = 0",
        expectedOutput: "6",
        sample: "n = 12\ndem = 0\nfor i in range(1, n + 1):\n    if n % i == 0:\n        dem += 1\nprint(dem)",
        require: ["for", "range", "if"],
      },
      {
        id: "c14e5", title: "Bài 14.5: In ước",
        prompt: "n=10. In các ước, mỗi ước một dòng.",
        starter: "n = 10",
        expectedOutput: "1\n2\n5\n10",
        sample: "n = 10\nfor i in range(1, n + 1):\n    if n % i == 0:\n        print(i)",
        require: ["for", "range", "if"],
      },
      {
        id: "c14e6", title: "Bài 14.6: Bảng cửu chương 7",
        prompt: "In 7 x 1 = 7 ... 7 x 5 = 35.",
        starter: "",
        expectedOutput: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35",
        sample: "for i in range(1, 6):\n    print(f\"7 x {i} = {7 * i}\")",
        require: ["for", "range"],
      },
      {
        id: "c14e7", title: "Bài 14.7: Số chính phương",
        prompt: "In các số chính phương từ 1^2 đến 5^2.",
        starter: "",
        expectedOutput: "1\n4\n9\n16\n25",
        sample: "for i in range(1, 6):\n    print(i * i)",
        require: ["for", "range"],
      },
      {
        id: "c14e8", title: "Bài 14.8: Tổng bình phương",
        prompt: "Tổng 1^2+...+5^2.",
        starter: "tong = 0",
        expectedOutput: "55",
        sample: "tong = 0\nfor i in range(1, 6):\n    tong += i * i\nprint(tong)",
        require: ["for", "range"],
      },
      {
        id: "c14e9", title: "Bài 14.9: Fibonacci 6 số",
        prompt: "In 6 số Fib đầu: 0 1 1 2 3 5.",
        starter: "a = 0\nb = 1",
        expectedOutput: "0\n1\n1\n2\n3\n5",
        sample: "a = 0\nb = 1\nfor i in range(6):\n    print(a)\n    t = a + b\n    a = b\n    b = t",
        require: ["for", "range"],
      },
      {
        id: "c14e10", title: "Bài 14.10: Đếm số chia hết",
        prompt: "Đếm số từ 1..30 chia hết cho 3.",
        starter: "dem = 0",
        expectedOutput: "10",
        sample: "dem = 0\nfor i in range(1, 31):\n    if i % 3 == 0:\n        dem += 1\nprint(dem)",
        require: ["for", "range", "if"],
      },
      {
        id: "c14e11", title: "Bài 14.11: Hình sao ngược",
        prompt: "In 5 dòng: 5 sao, 4 sao, ... 1 sao (dùng vòng lặp lồng nhau).",
        starter: "",
        expectedOutput: "*****\n****\n***\n**\n*",
        sample: "for i in range(5, 0, -1):\n    line = \"\"\n    for j in range(i):\n        line = line + \"*\"\n    print(line)",
        require: ["for", "range"],
      },
      {
        id: "c14e12", title: "Bài 14.12: Tổng lẻ 1..n",
        prompt: "n=9. Tổng số lẻ 1+3+...+9.",
        starter: "n = 9\ntong = 0",
        expectedOutput: "25",
        sample: "n = 9\ntong = 0\nfor i in range(1, n + 1):\n    if i % 2 == 1:\n        tong += i\nprint(tong)",
        require: ["for", "range", "if"],
      },
    ],
    exam: {
      code: {"prompt": "Tính tổng 1..5 (15) bằng for.", "expectedOutput": "15", "sample": "tong = 0\nfor i in range(1, 6):\n    tong += i\nprint(tong)", "require": ["for", "range"]},
      mcq: [{"id": "q1", "q": "range(1,5) gồm?", "options": ["1..5", "1..4", "0..5", "0..4"], "answer": 1}, {"id": "q2", "q": "n % i == 0 nghĩa là?", "options": ["n chia i dư 0", "n bằng i", "n lớn hơn i", "i chia n"], "answer": 0}],
    },
  },
  {
    id: "c15",
    title: "Chương 15: Bài tập dạng đề thi (biến cho sẵn)",
    theory: "Ở lớp, đề thường cho sẵn giá trị (giống đã nhập input). Bạn dùng biến đề cho, tính toán rồi print kết quả đúng định dạng.",
    example: "a = 3\nb = 4\nprint(a * a + b * b)",
    exercises: [
      {
        id: "c15e1", title: "Bài 15.1: Tổng hai số",
        prompt: "a=15, b=27. In tổng a+b.",
        starter: "a = 15\nb = 27",
        expectedOutput: "42",
        sample: "a = 15\nb = 27\nprint(a + b)",
        require: ["variable"],
      },
      {
        id: "c15e2", title: "Bài 15.2: Hiệu tuyệt đối",
        prompt: "a=10, b=25. In a-b nếu a>b else b-a (khoảng cách).",
        starter: "a = 10\nb = 25",
        expectedOutput: "15",
        sample: "a = 10\nb = 25\nif a > b:\n    print(a - b)\nelse:\n    print(b - a)",
        require: ["if"],
      },
      {
        id: "c15e3", title: "Bài 15.3: Bình phương tổng",
        prompt: "a=3, b=4. In (a+b)**2.",
        starter: "a = 3\nb = 4",
        expectedOutput: "49",
        sample: "a = 3\nb = 4\nprint((a + b) * (a + b))",
        require: ["variable"],
      },
      {
        id: "c15e4", title: "Bài 15.4: Thương và dư",
        prompt: "a=17, b=5. In thương nguyên int(a/b) và dư a%b mỗi dòng.",
        starter: "a = 17\nb = 5",
        expectedOutput: "3\n2",
        sample: "a = 17\nb = 5\nprint(int(a / b))\nprint(a % b)",
        require: ["variable"],
      },
      {
        id: "c15e5", title: "Bài 15.5: Đổi chỗ in",
        prompt: "a=5, b=9. In b rồi a (mỗi dòng) không cần đổi biến.",
        starter: "a = 5\nb = 9",
        expectedOutput: "9\n5",
        sample: "a = 5\nb = 9\nprint(b)\nprint(a)",
        require: ["variable"],
      },
      {
        id: "c15e6", title: "Bài 15.6: Max 3 số",
        prompt: "a=4, b=9, c=2. In số lớn nhất.",
        starter: "a = 4\nb = 9\nc = 2",
        expectedOutput: "9",
        sample: "a = 4\nb = 9\nc = 2\nm = a\nif b > m:\n    m = b\nif c > m:\n    m = c\nprint(m)",
        require: ["if"],
      },
      {
        id: "c15e7", title: "Bài 15.7: Min 3 số",
        prompt: "a=4, b=9, c=2. In số nhỏ nhất.",
        starter: "a = 4\nb = 9\nc = 2",
        expectedOutput: "2",
        sample: "a = 4\nb = 9\nc = 2\nm = a\nif b < m:\n    m = b\nif c < m:\n    m = c\nprint(m)",
        require: ["if"],
      },
      {
        id: "c15e8", title: "Bài 15.8: Năm nhuận đủ",
        prompt: "nam=2000. Nếu chia hết 400, hoặc chia hết 4 nhưng không chia hết 100 thì in Yes, else No.",
        starter: "nam = 2000",
        expectedOutput: "Yes",
        sample: "nam = 2000\nif nam % 400 == 0:\n    print(\"Yes\")\nelif nam % 4 == 0 and nam % 100 != 0:\n    print(\"Yes\")\nelse:\n    print(\"No\")",
        require: ["if"],
      },
      {
        id: "c15e9", title: "Bài 15.9: Không nhuận",
        prompt: "nam=1900. Cùng quy tắc năm nhuận.",
        starter: "nam = 1900",
        expectedOutput: "No",
        sample: "nam = 1900\nif nam % 400 == 0:\n    print(\"Yes\")\nelif nam % 4 == 0 and nam % 100 != 0:\n    print(\"Yes\")\nelse:\n    print(\"No\")",
        require: ["if"],
      },
      {
        id: "c15e10", title: "Bài 15.10: BMI đơn giản",
        prompt: "can=50, cao_cm=160. BMI = can / ((cao_cm/100)**2). In phần nguyên của BMI (dùng // ).",
        starter: "can = 50\ncao_cm = 160",
        expectedOutput: "19",
        sample: "can = 50\ncao_cm = 160\nh = cao_cm / 100\nbmi = can / (h * h)\nprint(int(bmi))",
        require: ["variable"],
      },
      {
        id: "c15e11", title: "Bài 15.11: Giờ phút",
        prompt: "tong_phut=135. In số giờ và số phút dư, mỗi dòng.",
        starter: "tong_phut = 135",
        expectedOutput: "2\n15",
        sample: "tong_phut = 135\nprint(int(tong_phut / 60))\nprint(tong_phut % 60)",
        require: ["variable"],
      },
      {
        id: "c15e12", title: "Bài 15.12: Tổng chữ số",
        prompt: "n=375. In tổng các chữ số (3+7+5).",
        starter: "n = 375",
        expectedOutput: "15",
        sample: "n = 375\ntong = 0\nwhile n > 0:\n    tong = tong + (n % 10)\n    n = int(n / 10)\nprint(tong)",
        require: ["print"],
      },
    ],
    exam: {
      code: {"prompt": "a=8, b=3. In a+b.", "expectedOutput": "11", "sample": "a = 8\nb = 3\nprint(a + b)", "require": ["variable"]},
      mcq: [{"id": "q1", "q": "a // b là gì?", "options": ["Chia thực", "Chia lấy phần nguyên", "Lũy thừa", "Phần dư"], "answer": 1}, {"id": "q2", "q": "a % b là gì?", "options": ["Phần dư", "Thương", "Tích", "Hiệu"], "answer": 0}],
    },
  },
  {
    id: "c16",
    title: "Chương 16: Đếm – lọc – thống kê",
    theory: "Dạng bài hay gặp: đếm phần tử thỏa điều kiện, lọc số, tổng có điều kiện trên list hoặc range.",
    example: "dem = 0\nfor i in range(1, 11):\n    if i % 2 == 0:\n        dem += 1\nprint(dem)",
    exercises: [
      {
        id: "c16e1", title: "Bài 16.1: Đếm số > 0",
        prompt: "nums=[3,-1,0,5,-2,8]. Đếm số dương.",
        starter: "nums = [3, -1, 0, 5, -2, 8]\ndem = 0",
        expectedOutput: "3",
        sample: "nums = [3, -1, 0, 5, -2, 8]\ndem = 0\nfor x in nums:\n    if x > 0:\n        dem += 1\nprint(dem)",
        require: ["list", "for", "if"],
      },
      {
        id: "c16e2", title: "Bài 16.2: Đếm số âm",
        prompt: "nums=[3,-1,0,5,-2,8]. Đếm số âm.",
        starter: "nums = [3, -1, 0, 5, -2, 8]\ndem = 0",
        expectedOutput: "2",
        sample: "nums = [3, -1, 0, 5, -2, 8]\ndem = 0\nfor x in nums:\n    if x < 0:\n        dem += 1\nprint(dem)",
        require: ["list", "for", "if"],
      },
      {
        id: "c16e3", title: "Bài 16.3: Tổng số dương",
        prompt: "nums=[3,-1,5,-2]. Tổng các số > 0.",
        starter: "nums = [3, -1, 5, -2]\ntong = 0",
        expectedOutput: "8",
        sample: "nums = [3, -1, 5, -2]\ntong = 0\nfor x in nums:\n    if x > 0:\n        tong += x\nprint(tong)",
        require: ["list", "for", "if"],
      },
      {
        id: "c16e4", title: "Bài 16.4: In số chẵn trong list",
        prompt: "nums=[1,2,3,4,5,6]. In các số chẵn mỗi dòng.",
        starter: "nums = [1, 2, 3, 4, 5, 6]",
        expectedOutput: "2\n4\n6",
        sample: "nums = [1, 2, 3, 4, 5, 6]\nfor x in nums:\n    if x % 2 == 0:\n        print(x)",
        require: ["list", "for", "if"],
      },
      {
        id: "c16e5", title: "Bài 16.5: Đếm trong khoảng",
        prompt: "nums=[2,5,8,11,14]. Đếm số trong [5, 12].",
        starter: "nums = [2, 5, 8, 11, 14]\ndem = 0",
        expectedOutput: "3",
        sample: "nums = [2, 5, 8, 11, 14]\ndem = 0\nfor x in nums:\n    if x >= 5 and x <= 12:\n        dem += 1\nprint(dem)",
        require: ["list", "for", "if"],
      },
      {
        id: "c16e6", title: "Bài 16.6: Tìm vị trí đầu",
        prompt: "nums=[4,7,2,7,9]. In chỉ số đầu tiên của số 7 (1).",
        starter: "nums = [4, 7, 2, 7, 9]\nidx = -1",
        expectedOutput: "1",
        sample: "nums = [4, 7, 2, 7, 9]\nidx = -1\nfor i in range(len(nums)):\n    if nums[i] == 7:\n        if idx < 0:\n            idx = i\nprint(idx)",
        require: ["list", "for", "range", "if"],
      },
      {
        id: "c16e7", title: "Bài 16.7: Có số 0 không",
        prompt: "nums=[1,2,0,4]. In Co nếu có 0, else Khong.",
        starter: "nums = [1, 2, 0, 4]",
        expectedOutput: "Co",
        sample: "nums = [1, 2, 0, 4]\nco = 0\nfor x in nums:\n    if x == 0:\n        co = 1\nif co == 1:\n    print(\"Co\")\nelse:\n    print(\"Khong\")",
        require: ["list", "for", "if"],
      },
      {
        id: "c16e8", title: "Bài 16.8: Trung bình làm tròn xuống",
        prompt: "nums=[5,7,8,6]. In TB // 1.",
        starter: "nums = [5, 7, 8, 6]",
        expectedOutput: "6",
        sample: "nums = [5, 7, 8, 6]\nprint(int(sum(nums) / len(nums)))",
        require: ["list"],
      },
      {
        id: "c16e9", title: "Bài 16.9: Đếm ước số",
        prompt: "n=18. Đếm số ước.",
        starter: "n = 18\ndem = 0",
        expectedOutput: "6",
        sample: "n = 18\ndem = 0\nfor i in range(1, n + 1):\n    if n % i == 0:\n        dem += 1\nprint(dem)",
        require: ["for", "range", "if"],
      },
      {
        id: "c16e10", title: "Bài 16.10: Tổng ước (trừ chính nó)",
        prompt: "n=12. Tổng ước thực sự (1+2+3+4+6=16).",
        starter: "n = 12\ntong = 0",
        expectedOutput: "16",
        sample: "n = 12\ntong = 0\nfor i in range(1, n):\n    if n % i == 0:\n        tong += i\nprint(tong)",
        require: ["for", "range", "if"],
      },
      {
        id: "c16e11", title: "Bài 16.11: Số hoàn hảo",
        prompt: "n=6. Nếu tổng ước thực sự = n in Yes else No.",
        starter: "n = 6",
        expectedOutput: "Yes",
        sample: "n = 6\ntong = 0\nfor i in range(1, n):\n    if n % i == 0:\n        tong += i\nif tong == n:\n    print(\"Yes\")\nelse:\n    print(\"No\")",
        require: ["for", "range", "if"],
      },
      {
        id: "c16e12", title: "Bài 16.12: Không hoàn hảo",
        prompt: "n=8. Cùng bài số hoàn hảo.",
        starter: "n = 8",
        expectedOutput: "No",
        sample: "n = 8\ntong = 0\nfor i in range(1, n):\n    if n % i == 0:\n        tong += i\nif tong == n:\n    print(\"Yes\")\nelse:\n    print(\"No\")",
        require: ["for", "range", "if"],
      },
    ],
    exam: {
      code: {"prompt": "Đếm số chẵn từ 1 đến 10.", "expectedOutput": "5", "sample": "dem = 0\nfor i in range(1, 11):\n    if i % 2 == 0:\n        dem += 1\nprint(dem)", "require": ["for", "range", "if"]},
      mcq: [{"id": "q1", "q": "Muốn đếm phần tử thỏa điều kiện dùng?", "options": ["Chỉ print", "for + if + biến đếm", "Chỉ if", "Chỉ list"], "answer": 1}, {"id": "q2", "q": "Số hoàn hảo 6 có tổng ước thực sự?", "options": ["5", "6", "7", "12"], "answer": 1}],
    },
  },
  {
    id: "c17",
    title: "Chương 17: Hình học & công thức thực tế",
    theory: "Áp dụng công thức toán vào code: hình tròn, tam giác, đổi đơn vị, tính tiền điện đơn giản.",
    example: "r = 5\nprint(2 * 3 * r)\nprint(3 * r * r)",
    exercises: [
      {
        id: "c17e1", title: "Bài 17.1: Chu vi hình tròn",
        prompt: "r=5. In chu vi xấp xỉ 2*3*r (pi~3).",
        starter: "r = 5",
        expectedOutput: "30",
        sample: "r = 5\nprint(2 * 3 * r)",
        require: ["variable"],
      },
      {
        id: "c17e2", title: "Bài 17.2: Diện tích hình tròn",
        prompt: "r=5. In 3*r*r.",
        starter: "r = 5",
        expectedOutput: "75",
        sample: "r = 5\nprint(3 * r * r)",
        require: ["variable"],
      },
      {
        id: "c17e3", title: "Bài 17.3: Thể tích lập phương",
        prompt: "canh=4. In canh**3.",
        starter: "canh = 4",
        expectedOutput: "64",
        sample: "canh = 4\nprint(canh * canh * canh)",
        require: ["variable"],
      },
      {
        id: "c17e4", title: "Bài 17.4: Diện tích xung quanh HCN",
        prompt: "dai=5, rong=3, cao=2. Sxq = 2*(dai+rong)*cao.",
        starter: "dai = 5\nrong = 3\ncao = 2",
        expectedOutput: "32",
        sample: "dai = 5\nrong = 3\ncao = 2\nprint(2 * (dai + rong) * cao)",
        require: ["variable"],
      },
      {
        id: "c17e5", title: "Bài 17.5: Đổi °C sang °F",
        prompt: "c=30. F = c*9/5+32. In phần nguyên F//1.",
        starter: "c = 30",
        expectedOutput: "86",
        sample: "c = 30\nf = c * 9 / 5 + 32\nprint(int(f))",
        require: ["variable"],
      },
      {
        id: "c17e6", title: "Bài 17.6: Tiền điện bậc 1",
        prompt: "kwh=80, gia=2000. In kwh*gia.",
        starter: "kwh = 80\ngia = 2000",
        expectedOutput: "160000",
        sample: "kwh = 80\ngia = 2000\nprint(kwh * gia)",
        require: ["variable"],
      },
      {
        id: "c17e7", title: "Bài 17.7: Tiền điện 2 bậc",
        prompt: "kwh=120. 100 số đầu *2000, phần còn lại *2500. In tổng tiền.",
        starter: "kwh = 120",
        expectedOutput: "250000",
        sample: "kwh = 120\nif kwh <= 100:\n    print(kwh * 2000)\nelse:\n    print(100 * 2000 + (kwh - 100) * 2500)",
        require: ["if"],
      },
      {
        id: "c17e8", title: "Bài 17.8: Quãng đường",
        prompt: "v=40, t=3. In s=v*t.",
        starter: "v = 40\nt = 3",
        expectedOutput: "120",
        sample: "v = 40\nt = 3\nprint(v * t)",
        require: ["variable"],
      },
      {
        id: "c17e9", title: "Bài 17.9: Thời gian đi",
        prompt: "s=150, v=50. In t=s/v (phần nguyên //1).",
        starter: "s = 150\nv = 50",
        expectedOutput: "3",
        sample: "s = 150\nv = 50\nprint(int(s / v))",
        require: ["variable"],
      },
      {
        id: "c17e10", title: "Bài 17.10: Bình phương cạnh huyền",
        prompt: "a=3, b=4. In a*a + b*b (bằng 25).",
        starter: "a = 3\nb = 4",
        expectedOutput: "25",
        sample: "a = 3\nb = 4\nprint(a * a + b * b)",
        require: ["variable"],
      },
      {
        id: "c17e11", title: "Bài 17.11: Diện tích hình thang",
        prompt: "day_lon=10, day_nho=6, cao=4. In (day_lon+day_nho)*cao/2 //1.",
        starter: "day_lon = 10\nday_nho = 6\ncao = 4",
        expectedOutput: "32",
        sample: "day_lon = 10\nday_nho = 6\ncao = 4\nprint(int((day_lon + day_nho) * cao / 2))",
        require: ["variable"],
      },
      {
        id: "c17e12", title: "Bài 17.12: Chiết khấu",
        prompt: "gia=200000, giam=15. In giá sau giảm.",
        starter: "gia = 200000\ngiam = 15",
        expectedOutput: "170000",
        sample: "gia = 200000\ngiam = 15\nprint(int(gia - gia * giam / 100))",
        require: ["variable"],
      },
    ],
    exam: {
      code: {"prompt": "r=2. In 3*r*r.", "expectedOutput": "12", "sample": "r = 2\nprint(3 * r * r)", "require": ["variable"]},
      mcq: [{"id": "q1", "q": "Chu vi hình tròn (pi=3) là?", "options": ["3r", "2*3*r", "3r*r", "2r"], "answer": 1}, {"id": "q2", "q": "Thể tích lập phương cạnh a?", "options": ["a*a", "4*a", "a*a*a", "2*a"], "answer": 2}],
    },
  },
  {
    id: "c18",
    title: "Chương 18: Luyện đề tổng hợp cho học sinh",
    theory: "Ôn tập kết hợp if, for, list, f-string theo phong cách đề kiểm tra trên lớp. Cách làm một bài tổng hợp: đọc kỹ đề và viết ra kết quả cần in trước; xác định dữ liệu cho sẵn (biến, danh sách); chọn kỹ thuật phù hợp (if để rẽ nhánh, for để duyệt, f-string để in đẹp); viết từng phần nhỏ rồi bấm Chạy thử để kiểm tra trước khi nộp. Lỗi hay gặp: in sai thứ tự dòng, thừa hoặc thiếu khoảng trắng trong chuỗi, và quên cập nhật biến đếm, biến tổng trong vòng lặp.",
    example: "for i in range(1, 6):\n    if i % 2 == 0:\n        print(i)",
    exercises: [
      {
        id: "c18e1", title: "Bài 18.1: In dãy cách 3",
        prompt: "In 3 6 9 12 15 mỗi dòng.",
        starter: "",
        expectedOutput: "3\n6\n9\n12\n15",
        sample: "for i in range(3, 16, 3):\n    print(i)",
        require: ["for", "range"],
      },
      {
        id: "c18e2", title: "Bài 18.2: Tổng chia hết 7",
        prompt: "Tổng các số 1..50 chia hết cho 7.",
        starter: "tong = 0",
        expectedOutput: "196",
        sample: "tong = 0\nfor i in range(1, 51):\n    if i % 7 == 0:\n        tong += i\nprint(tong)",
        require: ["for", "range", "if"],
      },
      {
        id: "c18e3", title: "Bài 18.3: Phân loại tuổi",
        prompt: "tuoi=15. Nếu <6 Mam non, <12 Tieu hoc, <16 THCS, else THPT.",
        starter: "tuoi = 15",
        expectedOutput: "THCS",
        sample: "tuoi = 15\nif tuoi < 6:\n    print(\"Mam non\")\nelif tuoi < 12:\n    print(\"Tieu hoc\")\nelif tuoi < 16:\n    print(\"THCS\")\nelse:\n    print(\"THPT\")",
        require: ["if"],
      },
      {
        id: "c18e4", title: "Bài 18.4: Bảng điểm f-string",
        prompt: "mon=\"Toan\", diem=9. In: Toan: 9",
        starter: "mon = \"Toan\"\ndiem = 9",
        expectedOutput: "Toan: 9",
        sample: "mon = \"Toan\"\ndiem = 9\nprint(f\"{mon}: {diem}\")",
        require: ["fstring"],
      },
      {
        id: "c18e5", title: "Bài 18.5: Đếm chữ số chẵn",
        prompt: "n=2846. Đếm chữ số chẵn bằng while (kết quả 4).",
        starter: "n = 2846\ndem = 0",
        expectedOutput: "4",
        sample: "n = 2846\ndem = 0\nwhile n > 0:\n    d = n % 10\n    if d % 2 == 0:\n        dem = dem + 1\n    n = int(n / 10)\nprint(dem)",
        require: ["print"],
      },
      {
        id: "c18e6", title: "Bài 18.6: Đảo số",
        prompt: "n=1234. In số đảo 4321.",
        starter: "n = 1234\nrev = 0",
        expectedOutput: "4321",
        sample: "n = 1234\nrev = 0\nwhile n > 0:\n    rev = rev * 10 + (n % 10)\n    n = int(n / 10)\nprint(rev)",
        require: ["print"],
      },
      {
        id: "c18e7", title: "Bài 18.7: List điểm đạt",
        prompt: "diems=[3,5,6,4,9]. In các điểm >=5 mỗi dòng.",
        starter: "diems = [3, 5, 6, 4, 9]",
        expectedOutput: "5\n6\n9",
        sample: "diems = [3, 5, 6, 4, 9]\nfor d in diems:\n    if d >= 5:\n        print(d)",
        require: ["list", "for", "if"],
      },
      {
        id: "c18e8", title: "Bài 18.8: Hàm xếp loại",
        prompt: "def xep(diem) trả về Gioi nếu >=8 else Kha. In xep(8.5).",
        starter: "def xep(diem):",
        expectedOutput: "Gioi",
        sample: "def xep(diem):\n    if diem >= 8:\n        return \"Gioi\"\n    return \"Kha\"\n\nprint(xep(8.5))",
        require: ["function", "if"],
      },
      {
        id: "c18e9", title: "Bài 18.9: Hàm tổng range",
        prompt: "def tong_n(n) trả về tổng 1..n. In tong_n(10).",
        starter: "def tong_n(n):",
        expectedOutput: "55",
        sample: "def tong_n(n):\n    s = 0\n    for i in range(1, n + 1):\n        s += i\n    return s\n\nprint(tong_n(10))",
        require: ["function", "for", "range"],
      },
      {
        id: "c18e10", title: "Bài 18.10: Kiểm tra số nguyên tố nhỏ",
        prompt: "n=13. In Yes nếu nguyên tố.",
        starter: "n = 13",
        expectedOutput: "Yes",
        sample: "n = 13\nok = 1\nif n < 2:\n    ok = 0\nfor i in range(2, n):\n    if n % i == 0:\n        ok = 0\nif ok == 1:\n    print(\"Yes\")\nelse:\n    print(\"No\")",
        require: ["for", "range", "if"],
      },
      {
        id: "c18e11", title: "Bài 18.11: In hình chữ số",
        prompt: "In:\n1\n22\n333",
        starter: "",
        expectedOutput: "1\n22\n333",
        sample: "for i in range(1, 4):\n    line = \"\"\n    for j in range(i):\n        line = line + str(i)\n    print(line)",
        require: ["for", "range"],
      },
      {
        id: "c18e12", title: "Bài 18.12: Tổng đường chéo 2x2",
        prompt: "a=[[1,2],[3,4]]. In a[0][0]+a[1][1].",
        starter: "a = [[1, 2], [3, 4]]",
        expectedOutput: "5",
        sample: "a = [[1, 2], [3, 4]]\nprint(a[0][0] + a[1][1])",
        require: ["list"],
      },
    ],
    exam: {
      code: {"prompt": "In 2 4 6 mỗi dòng.", "expectedOutput": "2\n4\n6", "sample": "for i in range(2, 7, 2):\n    print(i)", "require": ["for", "range"]},
      mcq: [{"id": "q1", "q": "Đảo số 123 thành 321 dùng?", "options": ["for trên list", "while lấy %10 và //10", "Chỉ print", "if"], "answer": 1}, {"id": "q2", "q": "str(i) dùng để?", "options": ["Xóa i", "Đổi i thành chuỗi", "Tăng i", "So sánh i"], "answer": 1}],
    },
  },
  {
    id: "c19",
    title: "Chương 19: Hàm nâng cao (sinh viên)",
    theory: "Viết hàm nhận tham số, trả về giá trị, kết hợp if/for — nền tảng bài lab đại học.",
    example: "def tong_ds(ds):\n    s = 0\n    for x in ds:\n        s += x\n    return s\nprint(tong_ds([1, 2, 3]))",
    exercises: [
      {
        id: "c19e1", title: "Bài 19.1: Hàm bình phương",
        prompt: "def square(x) trả về x*x. In square(6).",
        starter: "def square(x):",
        expectedOutput: "36",
        sample: "def square(x):\n    return x * x\n\nprint(square(6))",
        require: ["function"],
      },
      {
        id: "c19e2", title: "Bài 19.2: Hàm max2",
        prompt: "def max2(a,b) trả về số lớn hơn. In max2(3,8).",
        starter: "def max2(a, b):",
        expectedOutput: "8",
        sample: "def max2(a, b):\n    if a > b:\n        return a\n    return b\n\nprint(max2(3, 8))",
        require: ["function", "if"],
      },
      {
        id: "c19e3", title: "Bài 19.3: Hàm chẵn lẻ",
        prompt: "def is_even(n) trả về 1 nếu chẵn, 0 nếu lẻ. In is_even(10).",
        starter: "def is_even(n):",
        expectedOutput: "1",
        sample: "def is_even(n):\n    if n % 2 == 0:\n        return 1\n    return 0\n\nprint(is_even(10))",
        require: ["function", "if"],
      },
      {
        id: "c19e4", title: "Bài 19.4: Hàm tổng list",
        prompt: "def tong(ds) trả về tổng. In tong([2,4,6]).",
        starter: "def tong(ds):",
        expectedOutput: "12",
        sample: "def tong(ds):\n    s = 0\n    for x in ds:\n        s += x\n    return s\n\nprint(tong([2, 4, 6]))",
        require: ["function", "list", "for"],
      },
      {
        id: "c19e5", title: "Bài 19.5: Hàm đếm dương",
        prompt: "def dem_duong(ds) trả về số phần tử >0. In dem_duong([1,-2,3,0]).",
        starter: "def dem_duong(ds):",
        expectedOutput: "2",
        sample: "def dem_duong(ds):\n    d = 0\n    for x in ds:\n        if x > 0:\n            d += 1\n    return d\n\nprint(dem_duong([1, -2, 3, 0]))",
        require: ["function", "list", "for", "if"],
      },
      {
        id: "c19e6", title: "Bài 19.6: Hàm giai nhiệt độ",
        prompt: "def c_to_f(c) trả về int(c*9/5+32). In c_to_f(0).",
        starter: "def c_to_f(c):",
        expectedOutput: "32",
        sample: "def c_to_f(c):\n    return int(c * 9 / 5 + 32)\n\nprint(c_to_f(0))",
        require: ["function"],
      },
      {
        id: "c19e7", title: "Bài 19.7: Hàm giai chuỗi",
        prompt: "def join2(a,b) trả về a + \"-\" + b. In join2(\"a\",\"b\").",
        starter: "def join2(a, b):",
        expectedOutput: "a-b",
        sample: "def join2(a, b):\n    return a + \"-\" + b\n\nprint(join2(\"a\", \"b\"))",
        require: ["function"],
      },
      {
        id: "c19e8", title: "Bài 19.8: Hàm giai điểm",
        prompt: "def xep_loai(d) trả về Gioi/Kha/TB. In xep_loai(7).",
        starter: "def xep_loai(d):",
        expectedOutput: "Kha",
        sample: "def xep_loai(d):\n    if d >= 8:\n        return \"Gioi\"\n    if d >= 6.5:\n        return \"Kha\"\n    return \"TB\"\n\nprint(xep_loai(7))",
        require: ["function", "if"],
      },
      {
        id: "c19e9", title: "Bài 19.9: Hàm lũy thừa vòng lặp",
        prompt: "def power(a,n) tính a**n bằng for (n>=0). In power(2,5).",
        starter: "def power(a, n):",
        expectedOutput: "32",
        sample: "def power(a, n):\n    r = 1\n    for i in range(n):\n        r *= a\n    return r\n\nprint(power(2, 5))",
        require: ["function", "for", "range"],
      },
      {
        id: "c19e10", title: "Bài 19.10: Hàm có trong list",
        prompt: "def has_x(ds, x) trả về 1 nếu có x. In has_x([1,3,5], 3).",
        starter: "def has_x(ds, x):",
        expectedOutput: "1",
        sample: "def has_x(ds, x):\n    for v in ds:\n        if v == x:\n            return 1\n    return 0\n\nprint(has_x([1, 3, 5], 3))",
        require: ["function", "list", "for", "if"],
      },
    ],
    exam: {
      code: {"prompt": "def double(x) trả về 2*x. In double(7).", "expectedOutput": "14", "sample": "def double(x):\n    return 2 * x\n\nprint(double(7))", "require": ["function"]},
      mcq: [{"id": "q1", "q": "return dùng để?", "options": ["In ra màn hình", "Trả giá trị khỏi hàm", "Khai báo biến", "Dừng chương trình"], "answer": 1}, {"id": "q2", "q": "Hàm không gọi thì?", "options": ["Tự chạy", "Không chạy", "Lỗi cú pháp", "Chạy 2 lần"], "answer": 1}],
    },
  },
  {
    id: "c20",
    title: "Chương 20: Thuật toán cổ điển (sinh viên)",
    theory: "Các thuật toán nền: UCLN, tổng mảng, đảo list, tìm kiếm tuyến tính — thường gặp lab/bài tập CSDL & CTDL mở đầu.",
    example: "def ucln(a, b):\n    while b != 0:\n        t = b\n        b = a % b\n        a = t\n    return a\nprint(ucln(12, 18))",
    exercises: [
      {
        id: "c20e1", title: "Bài 20.1: UCLN",
        prompt: "a=12, b=18. Tính UCLN bằng while.",
        starter: "a = 12\nb = 18",
        expectedOutput: "6",
        sample: "a = 12\nb = 18\nwhile b != 0:\n    t = b\n    b = a % b\n    a = t\nprint(a)",
        require: ["print"],
      },
      {
        id: "c20e2", title: "Bài 20.2: BCNN",
        prompt: "a=4, b=6. BCNN = a*b/UCLN. In BCNN (12).",
        starter: "a = 4\nb = 6",
        expectedOutput: "12",
        sample: "a = 4\nb = 6\nx = a\ny = b\nwhile y != 0:\n    t = y\n    y = x % y\n    x = t\nprint(int(a * b / x))",
        require: ["print"],
      },
      {
        id: "c20e3", title: "Bài 20.3: Đảo list",
        prompt: "ds=[1,2,3,4]. In list đảo bằng cách dựng list mới.",
        starter: "ds = [1, 2, 3, 4]\nout = []",
        expectedOutput: "4\n3\n2\n1",
        sample: "ds = [1, 2, 3, 4]\nout = []\nfor x in ds:\n    out = [x] + out\nfor x in out:\n    print(x)",
        require: ["list", "for"],
      },
      {
        id: "c20e4", title: "Bài 20.4: Tìm kiếm tuyến tính",
        prompt: "ds=[5,2,9,1], x=9. In chỉ số nếu có, else -1.",
        starter: "ds = [5, 2, 9, 1]\nx = 9\nidx = -1",
        expectedOutput: "2",
        sample: "ds = [5, 2, 9, 1]\nx = 9\nidx = -1\nfor i in range(len(ds)):\n    if ds[i] == x:\n        if idx < 0:\n            idx = i\nprint(idx)",
        require: ["list", "for", "range", "if"],
      },
      {
        id: "c20e5", title: "Bài 20.5: Không tìm thấy",
        prompt: "ds=[5,2,9,1], x=7. In -1.",
        starter: "ds = [5, 2, 9, 1]\nx = 7\nidx = -1",
        expectedOutput: "-1",
        sample: "ds = [5, 2, 9, 1]\nx = 7\nidx = -1\nfor i in range(len(ds)):\n    if ds[i] == x:\n        if idx < 0:\n            idx = i\nprint(idx)",
        require: ["list", "for", "range", "if"],
      },
      {
        id: "c20e6", title: "Bài 20.6: Tổng đường chéo",
        prompt: "a=[[1,2,3],[4,5,6],[7,8,9]]. In a[0][0]+a[1][1]+a[2][2].",
        starter: "a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
        expectedOutput: "15",
        sample: "a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nprint(a[0][0] + a[1][1] + a[2][2])",
        require: ["list"],
      },
      {
        id: "c20e7", title: "Bài 20.7: Đếm tần suất",
        prompt: "ds=[1,2,1,3,1], x=1. Đếm số lần x xuất hiện.",
        starter: "ds = [1, 2, 1, 3, 1]\nx = 1\ndem = 0",
        expectedOutput: "3",
        sample: "ds = [1, 2, 1, 3, 1]\nx = 1\ndem = 0\nfor v in ds:\n    if v == x:\n        dem += 1\nprint(dem)",
        require: ["list", "for", "if"],
      },
      {
        id: "c20e8", title: "Bài 20.8: Max thứ hai đơn giản",
        prompt: "ds=[3,8,5,8,2]. Tìm max, rồi max trong các số < max.",
        starter: "ds = [3, 8, 5, 8, 2]",
        expectedOutput: "5",
        sample: "ds = [3, 8, 5, 8, 2]\nm1 = ds[0]\nfor x in ds:\n    if x > m1:\n        m1 = x\nm2 = -999999\nfor x in ds:\n    if x != m1:\n        if x > m2:\n            m2 = x\nprint(m2)",
        require: ["list", "for", "if"],
      },
      {
        id: "c20e9", title: "Bài 20.9: Tổng 2 mảng cùng chỉ số",
        prompt: "a=[1,2,3], b=[4,5,6]. In a[i]+b[i] mỗi dòng.",
        starter: "a = [1, 2, 3]\nb = [4, 5, 6]",
        expectedOutput: "5\n7\n9",
        sample: "a = [1, 2, 3]\nb = [4, 5, 6]\nfor i in range(len(a)):\n    print(a[i] + b[i])",
        require: ["list", "for", "range"],
      },
      {
        id: "c20e10", title: "Bài 20.10: Kiểm tra tăng dần",
        prompt: "ds=[1,3,5,8]. In Yes nếu không giảm, else No.",
        starter: "ds = [1, 3, 5, 8]",
        expectedOutput: "Yes",
        sample: "ds = [1, 3, 5, 8]\nok = 1\nfor i in range(1, len(ds)):\n    if ds[i] < ds[i - 1]:\n        ok = 0\nif ok == 1:\n    print(\"Yes\")\nelse:\n    print(\"No\")",
        require: ["list", "for", "range", "if"],
      },
    ],
    exam: {
      code: {"prompt": "UCLN của 8 và 12.", "expectedOutput": "4", "sample": "a = 8\nb = 12\nwhile b != 0:\n    t = b\n    b = a % b\n    a = t\nprint(a)", "require": ["print"]},
      mcq: [{"id": "q1", "q": "UCLN thường dùng thuật toán?", "options": ["Bubble sort", "Euclid", "DFS", "Binary search"], "answer": 1}, {"id": "q2", "q": "Tìm kiếm tuyến tính độ phức tạp?", "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"], "answer": 1}],
    },
  },
  {
    id: "c21",
    title: "Chương 21: Luyện thêm · Cơ bản mở rộng",
    theory: "Ôn print, biến, if, for với các tình huống đời thường: tiền hàng, điểm danh, lịch.",
    example: "gia = 15000\nsl = 3\nprint(gia * sl)",
    exercises: [
      {
        id: "c21e1", title: "Bài 21.1: Thành tiền",
        prompt: "gia=12000, sl=4. In thành tiền.",
        starter: "gia = 12000\nsl = 4",
        expectedOutput: "48000",
        sample: "gia = 12000\nsl = 4\nprint(gia * sl)",
        require: ["variable"],
      },
      {
        id: "c21e2", title: "Bài 21.2: Giảm giá 10%",
        prompt: "gia=200000. In giá sau giảm 10% (int).",
        starter: "gia = 200000",
        expectedOutput: "180000",
        sample: "gia = 200000\nprint(int(gia * 0.9))",
        require: ["variable"],
      },
      {
        id: "c21e3", title: "Bài 21.3: Điểm danh",
        prompt: "si_so=40, vang=3. In số có mặt.",
        starter: "si_so = 40\nvang = 3",
        expectedOutput: "37",
        sample: "si_so = 40\nvang = 3\nprint(si_so - vang)",
        require: ["variable"],
      },
      {
        id: "c21e4", title: "Bài 21.4: Vé xem phim",
        prompt: "tuoi=15. Nếu <13 in Tre em, <18 Teen, else Nguoi lon.",
        starter: "tuoi = 15",
        expectedOutput: "Teen",
        sample: "tuoi = 15\nif tuoi < 13:\n    print(\"Tre em\")\nelif tuoi < 18:\n    print(\"Teen\")\nelse:\n    print(\"Nguoi lon\")",
        require: ["if"],
      },
      {
        id: "c21e5", title: "Bài 21.5: In lịch 1 tuần",
        prompt: "In Thu 2 đến Thu 8 mỗi dòng (for + f-string số).",
        starter: "",
        expectedOutput: "Thu 2\nThu 3\nThu 4\nThu 5\nThu 6\nThu 7\nThu 8",
        sample: "for i in range(2, 9):\n    print(f\"Thu {i}\")",
        require: ["for", "range"],
      },
      {
        id: "c21e6", title: "Bài 21.6: Tổng tiền list",
        prompt: "gias=[10000,20000,15000]. In tổng.",
        starter: "gias = [10000, 20000, 15000]",
        expectedOutput: "45000",
        sample: "gias = [10000, 20000, 15000]\nprint(sum(gias))",
        require: ["list"],
      },
      {
        id: "c21e7", title: "Bài 21.7: Đếm đủ điểm",
        prompt: "diems=[4,5,6,7,3]. Đếm >=5.",
        starter: "diems = [4, 5, 6, 7, 3]\ndem = 0",
        expectedOutput: "3",
        sample: "diems = [4, 5, 6, 7, 3]\ndem = 0\nfor d in diems:\n    if d >= 5:\n        dem += 1\nprint(dem)",
        require: ["list", "for", "if"],
      },
      {
        id: "c21e8", title: "Bài 21.8: Password đơn giản",
        prompt: "mk=\"abc123\". Nếu len>=6 in Manh else Yeu.",
        starter: "mk = \"abc123\"",
        expectedOutput: "Manh",
        sample: "mk = \"abc123\"\nif len(mk) >= 6:\n    print(\"Manh\")\nelse:\n    print(\"Yeu\")",
        require: ["if"],
      },
      {
        id: "c21e9", title: "Bài 21.9: In số lẻ 1..15",
        prompt: "In các số lẻ từ 1 đến 15.",
        starter: "",
        expectedOutput: "1\n3\n5\n7\n9\n11\n13\n15",
        sample: "for i in range(1, 16):\n    if i % 2 == 1:\n        print(i)",
        require: ["for", "range", "if"],
      },
      {
        id: "c21e10", title: "Bài 21.10: Chào theo buổi",
        prompt: "gio=14. Nếu <12 Sang, <18 Chieu, else Toi.",
        starter: "gio = 14",
        expectedOutput: "Chieu",
        sample: "gio = 14\nif gio < 12:\n    print(\"Sang\")\nelif gio < 18:\n    print(\"Chieu\")\nelse:\n    print(\"Toi\")",
        require: ["if"],
      },
    ],
    exam: {
      code: {"prompt": "gia=1000, sl=5. In gia*sl.", "expectedOutput": "5000", "sample": "gia = 1000\nsl = 5\nprint(gia * sl)", "require": ["variable"]},
      mcq: [{"id": "q1", "q": "len(s) trả về?", "options": ["Ký tự đầu", "Độ dài chuỗi", "Chuỗi đảo", "None"], "answer": 1}, {"id": "q2", "q": "sum([1,2,3]) bằng?", "options": ["6", "3", "123", "0"], "answer": 0}],
    },
  },
  {
    id: "c22",
    title: "Chương 22: Luyện thêm · Thuật toán nhẹ",
    theory: "Bài ôn: dãy số, đếm, mô phỏng vòng lặp lồng — cầu nối HS giỏi và sinh viên năm nhất.",
    example: "for i in range(1, 4):\n    for j in range(1, i + 1):\n        print(j)",
    exercises: [
      {
        id: "c22e1", title: "Bài 22.1: Tổng 1..n công thức",
        prompt: "n=50. In n*(n+1)/2 dạng int.",
        starter: "n = 50",
        expectedOutput: "1275",
        sample: "n = 50\nprint(int(n * (n + 1) / 2))",
        require: ["variable"],
      },
      {
        id: "c22e2", title: "Bài 22.2: Giai thừa 6",
        prompt: "Tính 6! bằng for.",
        starter: "t = 1",
        expectedOutput: "720",
        sample: "t = 1\nfor i in range(1, 7):\n    t *= i\nprint(t)",
        require: ["for", "range"],
      },
      {
        id: "c22e3", title: "Bài 22.3: Số chữ số",
        prompt: "n=5027. Đếm số chữ số.",
        starter: "n = 5027\ndem = 0",
        expectedOutput: "4",
        sample: "n = 5027\ndem = 0\nwhile n > 0:\n    dem += 1\n    n = int(n / 10)\nprint(dem)",
        require: ["print"],
      },
      {
        id: "c22e4", title: "Bài 22.4: Tổng lẻ list",
        prompt: "nums=[1,2,3,4,5]. Tổng số lẻ.",
        starter: "nums = [1, 2, 3, 4, 5]\ntong = 0",
        expectedOutput: "9",
        sample: "nums = [1, 2, 3, 4, 5]\ntong = 0\nfor x in nums:\n    if x % 2 == 1:\n        tong += x\nprint(tong)",
        require: ["list", "for", "if"],
      },
      {
        id: "c22e5", title: "Bài 22.5: In cặp i j",
        prompt: "In các cặp i<=j với i,j trong 1..3 (mỗi dòng i j).",
        starter: "",
        expectedOutput: "1 1\n1 2\n1 3\n2 2\n2 3\n3 3",
        sample: "for i in range(1, 4):\n    for j in range(i, 4):\n        print(f\"{i} {j}\")",
        require: ["for", "range"],
      },
      {
        id: "c22e6", title: "Bài 22.6: Đếm nguyên tố 1..20",
        prompt: "Đếm số nguyên tố từ 1 đến 20.",
        starter: "dem = 0",
        expectedOutput: "8",
        sample: "dem = 0\nfor n in range(2, 21):\n    ok = 1\n    for i in range(2, n):\n        if n % i == 0:\n            ok = 0\n    if ok == 1:\n        dem += 1\nprint(dem)",
        require: ["for", "range", "if"],
      },
      {
        id: "c22e7", title: "Bài 22.7: Mảng cộng dồn",
        prompt: "nums=[2,3,4]. In tổng cộng dồn mỗi bước.",
        starter: "nums = [2, 3, 4]\ns = 0",
        expectedOutput: "2\n5\n9",
        sample: "nums = [2, 3, 4]\ns = 0\nfor x in nums:\n    s += x\n    print(s)",
        require: ["list", "for"],
      },
      {
        id: "c22e8", title: "Bài 22.8: Lọc bội 3",
        prompt: "In bội của 3 từ 3 đến 30.",
        starter: "",
        expectedOutput: "3\n6\n9\n12\n15\n18\n21\n24\n27\n30",
        sample: "for i in range(3, 31, 3):\n    print(i)",
        require: ["for", "range"],
      },
      {
        id: "c22e9", title: "Bài 22.9: Chuỗi xen kẽ",
        prompt: "In 1a2a3a bằng for (không a cuối).",
        starter: "",
        expectedOutput: "1a2a3",
        sample: "out = \"\"\nfor i in range(1, 4):\n    out = out + str(i)\n    if i < 3:\n        out = out + \"a\"\nprint(out)",
        require: ["for", "range"],
      },
      {
        id: "c22e10", title: "Bài 22.10: So sánh hai list tổng",
        prompt: "a=[1,2,3], b=[3,3]. In a neu sum(a)>sum(b) else b.",
        starter: "a = [1, 2, 3]\nb = [3, 3]",
        expectedOutput: "b",
        sample: "a = [1, 2, 3]\nb = [3, 3]\nif sum(a) > sum(b):\n    print(\"a\")\nelse:\n    print(\"b\")",
        require: ["list", "if"],
      },
    ],
    exam: {
      code: {"prompt": "Tính 5!.", "expectedOutput": "120", "sample": "t = 1\nfor i in range(1, 6):\n    t *= i\nprint(t)", "require": ["for", "range"]},
      mcq: [{"id": "q1", "q": "Giai thừa n! là?", "options": ["Tổng 1..n", "Tích 1..n", "n*2", "n^2"], "answer": 1}, {"id": "q2", "q": "Vòng lặp lồng là?", "options": ["for trong for", "Hai if", "Hai print", "def trong def"], "answer": 0}],
    },
  },
  {
    id: "c23",
    title: "Chương 23: Từ điển và dữ liệu dạng bảng",
    theory: "Từ điển, hay dict, lưu dữ liệu theo cặp khóa và giá trị trong cặp ngoặc nhọn. Bạn lấy giá trị bằng tên khóa trong ngoặc vuông, thêm hoặc sửa một khóa bằng cách gán, và dùng len để đếm số khóa. Một danh sách các từ điển chính là một bảng dữ liệu: mỗi từ điển là một hàng, mỗi khóa là một cột, và bạn có thể duyệt từng hàng bằng for để tính tổng, trung bình hoặc đếm số hàng đạt điều kiện.",
    example: "hs = {\"ten\": \"An\", \"diem\": 8}\nprint(hs[\"ten\"])\nprint(hs[\"diem\"])\nds = [{\"ten\": \"An\", \"diem\": 8}, {\"ten\": \"Binh\", \"diem\": 9}]\ntong = 0\nfor h in ds:\n    tong += h[\"diem\"]\nprint(tong)",
    exercises: [
      {
        id: "c23e1", title: "Bài 23.1: Lấy tên trong từ điển",
        prompt: "Tạo từ điển hs có ten là An và tuoi là 20, rồi in tên.",
        starter: "",
        expectedOutput: "An",
        sample: "hs = {\"ten\": \"An\", \"tuoi\": 20}\nprint(hs[\"ten\"])",
        require: ["dict"],
      },
      {
        id: "c23e2", title: "Bài 23.2: Lấy tuổi trong từ điển",
        prompt: "Tạo từ điển hs có ten là An và tuoi là 20, rồi in tuổi.",
        starter: "",
        expectedOutput: "20",
        sample: "hs = {\"ten\": \"An\", \"tuoi\": 20}\nprint(hs[\"tuoi\"])",
        require: ["dict"],
      },
      {
        id: "c23e3", title: "Bài 23.3: Thêm khóa mới",
        prompt: "Tạo từ điển hs chỉ có ten là An, thêm khóa lop là 10A, rồi in lop.",
        starter: "",
        expectedOutput: "10A",
        sample: "hs = {\"ten\": \"An\"}\nhs[\"lop\"] = \"10A\"\nprint(hs[\"lop\"])",
        require: ["dict"],
      },
      {
        id: "c23e4", title: "Bài 23.4: Đếm số khóa",
        prompt: "Tạo từ điển hs có ten là An, tuoi là 20 và lop là 10A, rồi in số khóa của từ điển.",
        starter: "",
        expectedOutput: "3",
        sample: "hs = {\"ten\": \"An\", \"tuoi\": 20, \"lop\": \"10A\"}\nprint(len(hs))",
        require: ["dict"],
      },
      {
        id: "c23e5", title: "Bài 23.5: Tổng điểm của bảng",
        prompt: "Bảng có 2 học sinh: An điểm 8 và Binh điểm 9. Dùng vòng lặp để tính và in tổng điểm.",
        starter: "",
        expectedOutput: "17",
        sample: "ds = [{\"ten\": \"An\", \"diem\": 8}, {\"ten\": \"Binh\", \"diem\": 9}]\ntong = 0\nfor hs in ds:\n    tong += hs[\"diem\"]\nprint(tong)",
        require: ["dict", "for"],
      },
      {
        id: "c23e6", title: "Bài 23.6: Điểm trung bình của bảng",
        prompt: "Bảng có 2 học sinh: An điểm 8 và Binh điểm 9. Dùng vòng lặp để tính và in điểm trung bình.",
        starter: "",
        expectedOutput: "8.5",
        sample: "ds = [{\"ten\": \"An\", \"diem\": 8}, {\"ten\": \"Binh\", \"diem\": 9}]\ntong = 0\nfor hs in ds:\n    tong += hs[\"diem\"]\nprint(tong / len(ds))",
        require: ["dict", "for"],
      },
      {
        id: "c23e7", title: "Bài 23.7: Đếm học sinh đạt",
        prompt: "Bảng có 3 học sinh điểm 8, 6 và 9. Đếm và in số học sinh có điểm từ 8 trở lên.",
        starter: "",
        expectedOutput: "2",
        sample: "ds = [{\"ten\": \"An\", \"diem\": 8}, {\"ten\": \"Binh\", \"diem\": 6}, {\"ten\": \"Chi\", \"diem\": 9}]\ndem = 0\nfor hs in ds:\n    if hs[\"diem\"] >= 8:\n        dem += 1\nprint(dem)",
        require: ["dict", "for", "if"],
      },
      {
        id: "c23e8", title: "Bài 23.8: In tên từng hàng",
        prompt: "Bảng có An và Binh. Dùng vòng lặp để in tên từng học sinh, mỗi tên một dòng.",
        starter: "",
        expectedOutput: "An\nBinh",
        sample: "ds = [{\"ten\": \"An\", \"diem\": 8}, {\"ten\": \"Binh\", \"diem\": 9}]\nfor hs in ds:\n    print(hs[\"ten\"])",
        require: ["dict", "for"],
      },
      {
        id: "c23e9", title: "Bài 23.9: Sửa giá trị trong từ điển",
        prompt: "Từ điển hs có ten là An và diem là 7. Sửa diem thành 9 rồi in diem.",
        starter: "",
        expectedOutput: "9",
        sample: "hs = {\"ten\": \"An\", \"diem\": 7}\nhs[\"diem\"] = 9\nprint(hs[\"diem\"])",
        require: ["dict"],
      },
      {
        id: "c23e10", title: "Bài 23.10: Tổng tiền của bảng hàng",
        prompt: "Bảng hàng: Vo giá 15000 số lượng 2, But giá 5000 số lượng 3. Tính và in tổng tiền.",
        starter: "",
        expectedOutput: "45000",
        sample: "ds = [{\"ten\": \"Vo\", \"gia\": 15000, \"sl\": 2}, {\"ten\": \"But\", \"gia\": 5000, \"sl\": 3}]\ntong = 0\nfor h in ds:\n    tong += h[\"gia\"] * h[\"sl\"]\nprint(tong)",
        require: ["dict", "for"],
      },
    ],
    exam: {
      code: {"prompt": "Tạo từ điển hs có ten là An và diem là 9, rồi in diem.", "expectedOutput": "9", "sample": "hs = {\"ten\": \"An\", \"diem\": 9}\nprint(hs[\"diem\"])", "require": ["dict"]},
      mcq: [{"id": "q1", "q": "hs[\"ten\"] dùng để làm gì?", "options": ["Lấy giá trị của khóa ten", "Tạo danh sách", "In toàn bộ từ điển", "Xóa khóa ten"], "answer": 0}, {"id": "q2", "q": "len(hs) trả về gì khi hs là từ điển?", "options": ["Số khóa trong từ điển", "Tên đầu tiên", "Giá trị lớn nhất", "Độ dài của chuỗi tên"], "answer": 0}],
    },
  },
{
  "id": "c24",
  "title": "Chương 24: Hàm nâng cao và đệ quy",
  "theory": "Hàm không chỉ trả về một số: nó có thể trả về một list hoặc một dict để mang nhiều kết quả, và một hàm cũng có thể gọi một hàm khác để chia nhỏ công việc. Đệ quy là khi hàm tự gọi chính nó: mỗi lần gọi bài toán nhỏ dần lại, và bắt buộc phải có điều kiện dừng, nếu không hàm sẽ gọi mãi không dứt. Lỗi thường gặp là quên điều kiện dừng, quên return trong nhánh đệ quy, hoặc gọi hàm với số đối số sai.",
  "example": "def tong_hieu(a, b):\n    return [a + b, a - b]\nkq = tong_hieu(10, 3)\nprint(kq[0])\nprint(kq[1])",
  "exercises": [
    {
      "id": "c24e1",
      "title": "Bài 24.1: Hàm trả về list",
      "prompt": "Viết hàm tong_hieu(a, b) trả về list [tổng, hiệu], rồi in tong_hieu(10, 3)[0] và [1], mỗi kết quả một dòng.",
      "starter": "",
      "expectedOutput": "13\n7",
      "sample": "def tong_hieu(a, b):\n    return [a + b, a - b]\nkq = tong_hieu(10, 3)\nprint(kq[0])\nprint(kq[1])",
      "require": [
        "function",
        "list"
      ]
    },
    {
      "id": "c24e2",
      "title": "Bài 24.2: Hàm trả về dict",
      "prompt": "Viết hàm hs_info() trả về dict {\"ten\": \"An\", \"diem\": 9}, rồi in tên và điểm, mỗi giá trị một dòng.",
      "starter": "",
      "expectedOutput": "An\n9",
      "sample": "def hs_info():\n    return {\"ten\": \"An\", \"diem\": 9}\nhs = hs_info()\nprint(hs[\"ten\"])\nprint(hs[\"diem\"])",
      "require": [
        "function",
        "dict"
      ]
    },
    {
      "id": "c24e3",
      "title": "Bài 24.3: Hàm gọi hàm",
      "prompt": "Viết hàm cong(a, b) trả về a + b và hàm nhan_doi(x) gọi cong(x, x), rồi in nhan_doi(7).",
      "starter": "",
      "expectedOutput": "14",
      "sample": "def cong(a, b):\n    return a + b\ndef nhan_doi(x):\n    return cong(x, x)\nprint(nhan_doi(7))",
      "require": [
        "function"
      ]
    },
    {
      "id": "c24e4",
      "title": "Bài 24.4: Đệ quy giai thừa",
      "prompt": "Viết hàm gt(n) bằng đệ quy: nếu n <= 1 trả về 1, ngược lại trả về n * gt(n - 1). In gt(5).",
      "starter": "",
      "expectedOutput": "120",
      "sample": "def gt(n):\n    if n <= 1:\n        return 1\n    return n * gt(n - 1)\nprint(gt(5))",
      "require": [
        "function"
      ]
    },
    {
      "id": "c24e5",
      "title": "Bài 24.5: Đệ quy tính tổng",
      "prompt": "Viết hàm tong_n(n) bằng đệ quy: nếu n <= 0 trả về 0, ngược lại trả về n + tong_n(n - 1). In tong_n(5).",
      "starter": "",
      "expectedOutput": "15",
      "sample": "def tong_n(n):\n    if n <= 0:\n        return 0\n    return n + tong_n(n - 1)\nprint(tong_n(5))",
      "require": [
        "function",
        "if"
      ]
    },
    {
      "id": "c24e6",
      "title": "Bài 24.6: Đệ quy Fibonacci",
      "prompt": "Viết hàm fib(n) bằng đệ quy: nếu n <= 1 trả về n, ngược lại trả về fib(n - 1) + fib(n - 2). In fib(8). Chỉ dùng số nhỏ để tránh chạy lâu.",
      "starter": "",
      "expectedOutput": "21",
      "sample": "def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)\nprint(fib(8))",
      "require": [
        "function"
      ]
    },
    {
      "id": "c24e7",
      "title": "Bài 24.7: Đệ quy đếm ngược",
      "prompt": "Viết hàm dem(n): nếu n > 0 thì in n rồi gọi dem(n - 1). Gọi dem(3) để in 3, 2, 1 mỗi số một dòng.",
      "starter": "",
      "expectedOutput": "3\n2\n1",
      "sample": "def dem(n):\n    if n > 0:\n        print(n)\n        dem(n - 1)\ndem(3)",
      "require": [
        "function"
      ]
    },
    {
      "id": "c24e8",
      "title": "Bài 24.8: Đệ quy lũy thừa",
      "prompt": "Viết hàm luy(a, n) bằng đệ quy: nếu n == 0 trả về 1, ngược lại trả về a * luy(a, n - 1). In luy(2, 4).",
      "starter": "",
      "expectedOutput": "16",
      "sample": "def luy(a, n):\n    if n == 0:\n        return 1\n    return a * luy(a, n - 1)\nprint(luy(2, 4))",
      "require": [
        "function"
      ]
    },
    {
      "id": "c24e9",
      "title": "Bài 24.9: Đệ quy cộng list",
      "prompt": "Viết hàm tong_ds(ds, i) bằng đệ quy: nếu i >= len(ds) trả về 0, ngược lại trả về ds[i] + tong_ds(ds, i + 1). In tong_ds([1, 2, 3, 4], 0).",
      "starter": "",
      "expectedOutput": "10",
      "sample": "def tong_ds(ds, i):\n    if i >= len(ds):\n        return 0\n    return ds[i] + tong_ds(ds, i + 1)\nprint(tong_ds([1, 2, 3, 4], 0))",
      "require": [
        "function",
        "list"
      ]
    },
    {
      "id": "c24e10",
      "title": "Bài 24.10: Hàm tìm số lớn nhất",
      "prompt": "Viết hàm lon_nhat(ds) duyệt list để tìm số lớn nhất rồi trả về nó. In lon_nhat([3, 9, 4]).",
      "starter": "",
      "expectedOutput": "9",
      "sample": "def lon_nhat(ds):\n    lon = ds[0]\n    for x in ds:\n        if x > lon:\n            lon = x\n    return lon\nprint(lon_nhat([3, 9, 4]))",
      "require": [
        "function",
        "list",
        "for",
        "if"
      ]
    }
  ],
  "exam": {
    "code": {
      "prompt": "Viết hàm gt(n) bằng đệ quy rồi in gt(4).",
      "expectedOutput": "24",
      "sample": "def gt(n):\n    if n <= 1:\n        return 1\n    return n * gt(n - 1)\nprint(gt(4))",
      "require": [
        "function"
      ]
    },
    "mcq": [
      {
        "id": "q1",
        "q": "Đệ quy cần nhất điều gì?",
        "options": [
          "Vòng lặp for",
          "Điều kiện dừng",
          "Danh sách rỗng",
          "Chuỗi dài"
        ],
        "answer": 1
      },
      {
        "id": "q2",
        "q": "Hàm muốn trả về nhiều kết quả trong bài này dùng cách nào?",
        "options": [
          "In nhiều lần",
          "Trả về list hoặc dict",
          "Dùng nhiều hàm",
          "Không thể trả về nhiều"
        ],
        "answer": 1
      }
    ]
  }
},
{
  "id": "c25",
  "title": "Chương 25: Tìm kiếm và sắp xếp cơ bản",
  "theory": "Tìm kiếm tuyến tính duyệt từng phần tử cho đến khi gặp giá trị cần tìm, đơn giản nhưng chậm với list dài. Tìm kiếm nhị phân nhanh hơn nhưng bắt buộc list đã sắp xếp: mỗi lần nó so sánh với phần tử giữa rồi bỏ đi một nửa còn lại. Các thuật toán sắp xếp đều dựa trên so sánh và đổi chỗ, và lỗi thường gặp là chỉ số vượt ngoài list hoặc quên đổi chỗ cả hai phía.",
  "example": "ds = [5, 2, 8, 1]\nfor i in range(len(ds)):\n    for j in range(len(ds) - 1):\n        if ds[j] > ds[j + 1]:\n            tam = ds[j]\n            ds[j] = ds[j + 1]\n            ds[j + 1] = tam\nprint(ds)",
  "exercises": [
    {
      "id": "c25e1",
      "title": "Bài 25.1: Tìm tuyến tính",
      "prompt": "Cho ds = [4, 7, 2, 9], tìm vị trí của số 2 bằng vòng lặp, in vị trí đó, nếu không thấy in -1. Bài này in 2.",
      "starter": "ds = [4, 7, 2, 9]",
      "expectedOutput": "2",
      "sample": "ds = [4, 7, 2, 9]\nkq = -1\nfor i in range(len(ds)):\n    if ds[i] == 2:\n        kq = i\n        break\nprint(kq)",
      "require": [
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c25e2",
      "title": "Bài 25.2: Đếm số lần xuất hiện",
      "prompt": "Cho ds = [1, 2, 2, 3, 2], đếm số lần số 2 xuất hiện rồi in số đếm đó.",
      "starter": "ds = [1, 2, 2, 3, 2]",
      "expectedOutput": "3",
      "sample": "ds = [1, 2, 2, 3, 2]\ndem = 0\nfor x in ds:\n    if x == 2:\n        dem += 1\nprint(dem)",
      "require": [
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c25e3",
      "title": "Bài 25.3: Tìm kiếm nhị phân",
      "prompt": "Cho ds đã sắp xếp [1, 3, 5, 7, 9], tìm vị trí của số 7 bằng tìm kiếm nhị phân với while, in vị trí đó.",
      "starter": "ds = [1, 3, 5, 7, 9]",
      "expectedOutput": "3",
      "sample": "ds = [1, 3, 5, 7, 9]\ntrai = 0\nphai = len(ds) - 1\nkq = -1\nwhile trai <= phai:\n    giua = (trai + phai) // 2\n    if ds[giua] == 7:\n        kq = giua\n        break\n    if ds[giua] < 7:\n        trai = giua + 1\n    else:\n        phai = giua - 1\nprint(kq)",
      "require": [
        "list",
        "while"
      ]
    },
    {
      "id": "c25e4",
      "title": "Bài 25.4: Nhị phân không thấy",
      "prompt": "Cho ds đã sắp xếp [1, 3, 5, 7, 9], tìm số 6 bằng tìm kiếm nhị phân, không thấy thì in -1.",
      "starter": "ds = [1, 3, 5, 7, 9]",
      "expectedOutput": "-1",
      "sample": "ds = [1, 3, 5, 7, 9]\ntrai = 0\nphai = len(ds) - 1\nkq = -1\nwhile trai <= phai:\n    giua = (trai + phai) // 2\n    if ds[giua] == 6:\n        kq = giua\n        break\n    if ds[giua] < 6:\n        trai = giua + 1\n    else:\n        phai = giua - 1\nprint(kq)",
      "require": [
        "list",
        "while"
      ]
    },
    {
      "id": "c25e5",
      "title": "Bài 25.5: Sắp xếp nổi bọt tăng dần",
      "prompt": "Sắp xếp ds = [5, 2, 8, 1] tăng dần bằng sắp xếp nổi bọt rồi in cả list.",
      "starter": "ds = [5, 2, 8, 1]",
      "expectedOutput": "[1, 2, 5, 8]",
      "sample": "ds = [5, 2, 8, 1]\nfor i in range(len(ds)):\n    for j in range(len(ds) - 1):\n        if ds[j] > ds[j + 1]:\n            tam = ds[j]\n            ds[j] = ds[j + 1]\n            ds[j + 1] = tam\nprint(ds)",
      "require": [
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c25e6",
      "title": "Bài 25.6: Sắp xếp nổi bọt giảm dần",
      "prompt": "Sắp xếp ds = [5, 2, 8, 1] giảm dần bằng sắp xếp nổi bọt rồi in cả list.",
      "starter": "ds = [5, 2, 8, 1]",
      "expectedOutput": "[8, 5, 2, 1]",
      "sample": "ds = [5, 2, 8, 1]\nfor i in range(len(ds)):\n    for j in range(len(ds) - 1):\n        if ds[j] < ds[j + 1]:\n            tam = ds[j]\n            ds[j] = ds[j + 1]\n            ds[j + 1] = tam\nprint(ds)",
      "require": [
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c25e7",
      "title": "Bài 25.7: Sắp xếp chọn",
      "prompt": "Sắp xếp ds = [5, 2, 8, 1] tăng dần bằng sắp xếp chọn: mỗi vòng chọn vị trí nhỏ nhất còn lại rồi đổi chỗ, rồi in cả list.",
      "starter": "ds = [5, 2, 8, 1]",
      "expectedOutput": "[1, 2, 5, 8]",
      "sample": "ds = [5, 2, 8, 1]\nfor i in range(len(ds)):\n    vitri = i\n    for j in range(i + 1, len(ds)):\n        if ds[j] < ds[vitri]:\n            vitri = j\n    tam = ds[i]\n    ds[i] = ds[vitri]\n    ds[vitri] = tam\nprint(ds)",
      "require": [
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c25e8",
      "title": "Bài 25.8: Sắp xếp chèn",
      "prompt": "Sắp xếp ds = [5, 2, 8, 1] tăng dần bằng sắp xếp chèn với while, rồi in cả list.",
      "starter": "ds = [5, 2, 8, 1]",
      "expectedOutput": "[1, 2, 5, 8]",
      "sample": "ds = [5, 2, 8, 1]\nfor i in range(1, len(ds)):\n    tam = ds[i]\n    j = i - 1\n    while j >= 0:\n        if ds[j] <= tam:\n            break\n        ds[j + 1] = ds[j]\n        j -= 1\n    ds[j + 1] = tam\nprint(ds)",
      "require": [
        "list",
        "for",
        "while"
      ]
    },
    {
      "id": "c25e9",
      "title": "Bài 25.9: Kiểm tra đã sắp xếp",
      "prompt": "Cho ds = [1, 3, 5, 7], in 1 nếu list đã tăng dần, ngược lại in 0.",
      "starter": "ds = [1, 3, 5, 7]",
      "expectedOutput": "1",
      "sample": "ds = [1, 3, 5, 7]\nok = 1\nfor i in range(len(ds) - 1):\n    if ds[i] > ds[i + 1]:\n        ok = 0\nprint(ok)",
      "require": [
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c25e10",
      "title": "Bài 25.10: Vị trí nhỏ nhất",
      "prompt": "Cho ds = [5, 2, 8, 1, 4], tìm vị trí của số nhỏ nhất rồi in vị trí đó.",
      "starter": "ds = [5, 2, 8, 1, 4]",
      "expectedOutput": "3",
      "sample": "ds = [5, 2, 8, 1, 4]\nvitri = 0\nfor i in range(len(ds)):\n    if ds[i] < ds[vitri]:\n        vitri = i\nprint(vitri)",
      "require": [
        "list",
        "for",
        "if"
      ]
    }
  ],
  "exam": {
    "code": {
      "prompt": "Sắp xếp ds = [4, 1, 3, 2] tăng dần bằng sắp xếp nổi bọt rồi in cả list.",
      "expectedOutput": "[1, 2, 3, 4]",
      "sample": "ds = [4, 1, 3, 2]\nfor i in range(len(ds)):\n    for j in range(len(ds) - 1):\n        if ds[j] > ds[j + 1]:\n            tam = ds[j]\n            ds[j] = ds[j + 1]\n            ds[j + 1] = tam\nprint(ds)",
      "require": [
        "list",
        "for",
        "if"
      ]
    },
    "mcq": [
      {
        "id": "q1",
        "q": "Tìm kiếm nhị phân yêu cầu gì trước tiên?",
        "options": [
          "List rỗng",
          "List đã sắp xếp",
          "List toàn số chẵn",
          "List không trùng"
        ],
        "answer": 1
      },
      {
        "id": "q2",
        "q": "Sắp xếp nổi bọt làm gì trong mỗi lần duyệt?",
        "options": [
          "Xóa phần tử lớn nhất",
          "So sánh và đổi chỗ các cặp kề nhau",
          "Chia list làm đôi",
          "Đảo ngược list"
        ],
        "answer": 1
      }
    ]
  }
},
{
  "id": "c26",
  "title": "Chương 26: Chuỗi nâng cao và dữ liệu văn bản",
  "theory": "Chuỗi trong Python có nhiều phương thức: split tách chuỗi thành list các từ, join ghép list thành một chuỗi, strip bỏ khoảng trắng thừa ở hai đầu, lower và upper đổi chữ hoa thường, replace thay chuỗi con và count đếm số lần xuất hiện. Lỗi thường gặp là quên rằng các phương thức này trả về chuỗi mới chứ không tự sửa chuỗi gốc, hoặc tách chuỗi mà không xử lý khoảng trắng thừa nên đếm từ bị sai.",
  "example": "s = \"  Hoc   Python  \"\nprint(\" \".join(s.split()))\nprint(len(s.split()))",
  "exercises": [
    {
      "id": "c26e1",
      "title": "Bài 26.1: Đếm từ",
      "prompt": "Cho s = \"Hoc Python rat vui\", tách thành các từ rồi in số từ.",
      "starter": "",
      "expectedOutput": "4",
      "sample": "s = \"Hoc Python rat vui\"\nparts = s.split()\nprint(len(parts))",
      "require": [
        "string"
      ]
    },
    {
      "id": "c26e2",
      "title": "Bài 26.2: Chuẩn hóa khoảng trắng",
      "prompt": "Cho s = \"  Hoc   Python  \", chuẩn hóa thành \"Hoc Python\" rồi in ra.",
      "starter": "",
      "expectedOutput": "Hoc Python",
      "sample": "s = \"  Hoc   Python  \"\nprint(\" \".join(s.split()))",
      "require": [
        "string"
      ]
    },
    {
      "id": "c26e3",
      "title": "Bài 26.3: Đổi chữ thường",
      "prompt": "Cho s = \"Hoc PYTHON\", đổi thành chữ thường rồi in ra.",
      "starter": "",
      "expectedOutput": "hoc python",
      "sample": "s = \"Hoc PYTHON\"\nprint(s.lower())",
      "require": [
        "string"
      ]
    },
    {
      "id": "c26e4",
      "title": "Bài 26.4: Thay chuỗi con",
      "prompt": "Cho s = \"a-b-c\", thay dấu - bằng dấu + rồi in ra.",
      "starter": "",
      "expectedOutput": "a+b+c",
      "sample": "s = \"a-b-c\"\nprint(s.replace(\"-\", \"+\"))",
      "require": [
        "string"
      ]
    },
    {
      "id": "c26e5",
      "title": "Bài 26.5: Kiểm tra đối xứng",
      "prompt": "Cho s = \"madam\", đảo ngược chuỗi bằng vòng lặp, nếu đảo ngược bằng chuỗi gốc thì in Dung, ngược lại in Sai.",
      "starter": "",
      "expectedOutput": "Dung",
      "sample": "s = \"madam\"\ndao = \"\"\nfor ch in s:\n    dao = ch + dao\nif dao == s:\n    print(\"Dung\")\nelse:\n    print(\"Sai\")",
      "require": ["for", "if"]
    },
    {
      "id": "c26e6",
      "title": "Bài 26.6: Đếm ký tự",
      "prompt": "Cho s = \"banana\", đếm số lần chữ a xuất hiện rồi in số đếm đó.",
      "starter": "",
      "expectedOutput": "3",
      "sample": "s = \"banana\"\nprint(s.count(\"a\"))",
      "require": [
        "string"
      ]
    },
    {
      "id": "c26e7",
      "title": "Bài 26.7: Ghép list thành câu",
      "prompt": "Cho ds = [\"An\", \"Binh\", \"Chi\"], ghép thành \"An, Binh, Chi\" rồi in ra.",
      "starter": "",
      "expectedOutput": "An, Binh, Chi",
      "sample": "ds = [\"An\", \"Binh\", \"Chi\"]\nprint(\", \".join(ds))",
      "require": [
        "string",
        "list"
      ]
    },
    {
      "id": "c26e8",
      "title": "Bài 26.8: Tách theo dấu phẩy",
      "prompt": "Cho s = \"toan,ly,hoa\", tách theo dấu phẩy, in số phần rồi in phần thứ hai, mỗi kết quả một dòng.",
      "starter": "",
      "expectedOutput": "3\nly",
      "sample": "s = \"toan,ly,hoa\"\nparts = s.split(\",\")\nprint(len(parts))\nprint(parts[1])",
      "require": [
        "string"
      ]
    },
    {
      "id": "c26e9",
      "title": "Bài 26.9: Chuẩn hóa họ tên",
      "prompt": "Cho ten = \"  nguyen   van an \", bỏ khoảng trắng thừa, đổi chữ thường rồi ghép lại thành một họ tên chuẩn, rồi in ra.",
      "starter": "",
      "expectedOutput": "nguyen van an",
      "sample": "ten = \"  nguyen   van an \"\nparts = ten.strip().lower().split()\nprint(\" \".join(parts))",
      "require": [
        "string"
      ]
    },
    {
      "id": "c26e10",
      "title": "Bài 26.10: Đếm nguyên âm",
      "prompt": "Cho s = \"hoc python\", đếm số nguyên âm a, e, i, o, u xuất hiện rồi in số đếm đó.",
      "starter": "",
      "expectedOutput": "2",
      "sample": "s = \"hoc python\"\ndem = 0\nfor ch in s:\n    if ch in \"aeiou\":\n        dem += 1\nprint(dem)",
      "require": ["for", "if"]
    }
  ],
  "exam": {
    "code": {
      "prompt": "Cho s = \"  Python   rat  hay \", chuẩn hóa rồi in câu đã chuẩn hóa ở dòng 1 và số từ ở dòng 2.",
      "expectedOutput": "Python rat hay\n3",
      "sample": "s = \"  Python   rat  hay \"\ncau = \" \".join(s.split())\nprint(cau)\nprint(len(cau.split()))",
      "require": [
        "string"
      ]
    },
    "mcq": [
      {
        "id": "q1",
        "q": "split() dùng để làm gì?",
        "options": [
          "Ghép list thành chuỗi",
          "Tách chuỗi thành list",
          "Đổi chữ hoa thành chữ thường",
          "Xóa ký tự đầu tiên"
        ],
        "answer": 0
      },
      {
        "id": "q2",
        "q": "join() dùng để làm gì?",
        "options": [
          "Tách chuỗi",
          "Ghép các phần tử thành một chuỗi",
          "Đếm từ",
          "Thay chuỗi con"
        ],
        "answer": 1
      }
    ]
  }
},
{
  "id": "c27",
  "title": "Chương 27: Danh sách 2 chiều và ma trận",
  "theory": "Danh sách 2 chiều, hay ma trận, là một list mà mỗi phần tử lại là một list: phần tử bang[i][j] nằm ở hàng i và cột j, cả hai đều bắt đầu từ 0. Muốn duyệt toàn bộ bảng thì dùng hai vòng lặp lồng nhau cho hàng và cột, và muốn tạo bảng mới thì tạo từng hàng rỗng rồi append từng giá trị vào. Lỗi thường gặp là nhầm hàng với cột khi chuyển vị hoặc dùng chỉ số vượt ngoài bảng.",
  "example": "bang = [[1, 2, 3], [4, 5, 6]]\nprint(bang[1][2])\ntong = 0\nfor hang in bang:\n    for x in hang:\n        tong += x\nprint(tong)",
  "exercises": [
    {
      "id": "c27e1",
      "title": "Bài 27.1: Lấy ô trong bảng",
      "prompt": "Cho bang = [[1, 2, 3], [4, 5, 6]], in ô ở hàng 1, cột 2.",
      "starter": "",
      "expectedOutput": "6",
      "sample": "bang = [[1, 2, 3], [4, 5, 6]]\nprint(bang[1][2])",
      "require": [
        "list"
      ]
    },
    {
      "id": "c27e2",
      "title": "Bài 27.2: Tổng toàn bảng",
      "prompt": "Cho bang = [[1, 2, 3], [4, 5, 6]], tính tổng tất cả các ô rồi in tổng đó.",
      "starter": "",
      "expectedOutput": "21",
      "sample": "bang = [[1, 2, 3], [4, 5, 6]]\ntong = 0\nfor hang in bang:\n    for x in hang:\n        tong += x\nprint(tong)",
      "require": [
        "list",
        "for"
      ]
    },
    {
      "id": "c27e3",
      "title": "Bài 27.3: Tổng một hàng",
      "prompt": "Cho bang = [[1, 2, 3], [4, 5, 6]], tính tổng hàng 1 rồi in tổng đó.",
      "starter": "",
      "expectedOutput": "15",
      "sample": "bang = [[1, 2, 3], [4, 5, 6]]\ntong = 0\nfor x in bang[1]:\n    tong += x\nprint(tong)",
      "require": [
        "list",
        "for"
      ]
    },
    {
      "id": "c27e4",
      "title": "Bài 27.4: Tổng một cột",
      "prompt": "Cho bang = [[1, 2, 3], [4, 5, 6]], tính tổng cột 1 rồi in tổng đó.",
      "starter": "",
      "expectedOutput": "7",
      "sample": "bang = [[1, 2, 3], [4, 5, 6]]\ntong = 0\nfor hang in bang:\n    tong += hang[1]\nprint(tong)",
      "require": [
        "list",
        "for"
      ]
    },
    {
      "id": "c27e5",
      "title": "Bài 27.5: Tổng đường chéo chính",
      "prompt": "Cho bang = [[1, 2, 3], [4, 5, 6], [7, 8, 9]], tính tổng đường chéo chính bang[i][i] rồi in tổng đó.",
      "starter": "",
      "expectedOutput": "15",
      "sample": "bang = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\ntong = 0\nfor i in range(3):\n    tong += bang[i][i]\nprint(tong)",
      "require": [
        "list",
        "for",
        "range"
      ]
    },
    {
      "id": "c27e6",
      "title": "Bài 27.6: Chuyển vị",
      "prompt": "Cho a = [[1, 2], [3, 4]], tạo ma trận chuyển vị rồi in ra.",
      "starter": "",
      "expectedOutput": "[[1, 3], [2, 4]]",
      "sample": "a = [[1, 2], [3, 4]]\ncv = []\nfor i in range(2):\n    hang = []\n    for j in range(2):\n        hang.append(a[j][i])\n    cv.append(hang)\nprint(cv)",
      "require": [
        "list",
        "for",
        "range"
      ]
    },
    {
      "id": "c27e7",
      "title": "Bài 27.7: Số lớn nhất trong bảng",
      "prompt": "Cho bang = [[1, 9, 3], [4, 2, 8]], tìm số lớn nhất trong bảng rồi in số đó.",
      "starter": "",
      "expectedOutput": "9",
      "sample": "bang = [[1, 9, 3], [4, 2, 8]]\nlon = bang[0][0]\nfor hang in bang:\n    for x in hang:\n        if x > lon:\n            lon = x\nprint(lon)",
      "require": [
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c27e8",
      "title": "Bài 27.8: Cộng hai ma trận",
      "prompt": "Cho a = [[1, 2], [3, 4]] và b = [[5, 6], [7, 8]], cộng từng ô tương ứng rồi in ma trận kết quả.",
      "starter": "",
      "expectedOutput": "[[6, 8], [10, 12]]",
      "sample": "a = [[1, 2], [3, 4]]\nb = [[5, 6], [7, 8]]\nkq = []\nfor i in range(2):\n    hang = []\n    for j in range(2):\n        hang.append(a[i][j] + b[i][j])\n    kq.append(hang)\nprint(kq)",
      "require": [
        "list",
        "for",
        "range"
      ]
    },
    {
      "id": "c27e9",
      "title": "Bài 27.9: Đổi một ô trong bảng",
      "prompt": "Cho bang = [[1, 2], [3, 4]], đổi ô hàng 0, cột 1 thành 9 rồi in ô đó.",
      "starter": "",
      "expectedOutput": "9",
      "sample": "bang = [[1, 2], [3, 4]]\nbang[0][1] = 9\nprint(bang[0][1])",
      "require": [
        "list"
      ]
    },
    {
      "id": "c27e10",
      "title": "Bài 27.10: Đếm ô lớn hơn 5",
      "prompt": "Cho bang = [[1, 9, 3], [8, 2, 7]], đếm số ô lớn hơn 5 rồi in số đếm đó.",
      "starter": "",
      "expectedOutput": "3",
      "sample": "bang = [[1, 9, 3], [8, 2, 7]]\ndem = 0\nfor hang in bang:\n    for x in hang:\n        if x > 5:\n            dem += 1\nprint(dem)",
      "require": [
        "list",
        "for",
        "if"
      ]
    }
  ],
  "exam": {
    "code": {
      "prompt": "Cho bang = [[5, 1], [2, 9]], tính tổng đường chéo chính rồi in tổng đó.",
      "expectedOutput": "14",
      "sample": "bang = [[5, 1], [2, 9]]\ntong = 0\nfor i in range(2):\n    tong += bang[i][i]\nprint(tong)",
      "require": [
        "list",
        "for",
        "range"
      ]
    },
    "mcq": [
      {
        "id": "q1",
        "q": "bang[i][j] có nghĩa là gì?",
        "options": [
          "Ô ở cột i, hàng j",
          "Ô ở hàng i, cột j",
          "Hàng thứ i nhân cột j",
          "Tổng hàng i và cột j"
        ],
        "answer": 1
      },
      {
        "id": "q2",
        "q": "Chuyển vị ma trận làm gì?",
        "options": [
          "Đổi dấu các ô",
          "Đổi hàng thành cột và cột thành hàng",
          "Xóa hàng đầu tiên",
          "Nhân đôi mọi ô"
        ],
        "answer": 1
      }
    ]
  }
},
{
  "id": "c28",
  "title": "Chương 28: Đồ án nhỏ quản lý sinh viên",
  "theory": "Đồ án này gom mọi kỹ năng đã học vào một bảng dữ liệu: mỗi sinh viên là một dict có tên, lớp và điểm, và cả lớp là một list các dict. Muốn làm báo cáo thì duyệt từng dict, cộng điểm để tính trung bình, so sánh để tìm điểm cao nhất, đếm theo điều kiện để lọc sinh viên đạt và đếm theo lớp. Lỗi thường gặp là dùng sai tên khóa trong dict hoặc quên khởi tạo biến đếm và biến lớn nhất trước vòng lặp.",
  "example": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}]\ntong = 0\nfor s in ds:\n    tong += s[\"diem\"]\nprint(tong // len(ds))",
  "exercises": [
    {
      "id": "c28e1",
      "title": "Bài 28.1: Thêm sinh viên",
      "prompt": "Cho ds có 2 sinh viên An (lop A, diem 8) và Binh (lop B, diem 6), thêm sinh viên Dung (lop B, diem 7) bằng append rồi in số sinh viên.",
      "starter": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}]",
      "expectedOutput": "3",
      "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}]\nds.append({\"ten\": \"Dung\", \"lop\": \"B\", \"diem\": 7})\nprint(len(ds))",
      "require": [
        "dict",
        "list"
      ]
    },
    {
      "id": "c28e2",
      "title": "Bài 28.2: Điểm trung bình lớp",
      "prompt": "Cho ds gồm An 8, Binh 6, Chi 9, tính điểm trung bình nguyên (chia lấy phần nguyên) rồi in ra.",
      "starter": "",
      "expectedOutput": "7",
      "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 9}]\ntong = 0\nfor s in ds:\n    tong += s[\"diem\"]\nprint(tong // len(ds))",
      "require": [
        "dict",
        "list",
        "for"
      ]
    },
    {
      "id": "c28e3",
      "title": "Bài 28.3: Đếm sinh viên giỏi",
      "prompt": "Cho ds gồm An 8, Binh 6, Chi 9, đếm số sinh viên có điểm từ 8 trở lên rồi in số đếm đó.",
      "starter": "",
      "expectedOutput": "2",
      "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 9}]\ndem = 0\nfor s in ds:\n    if s[\"diem\"] >= 8:\n        dem += 1\nprint(dem)",
      "require": [
        "dict",
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c28e4",
      "title": "Bài 28.4: Sinh viên điểm cao nhất",
      "prompt": "Cho ds gồm An 8, Binh 6, Chi 9, tìm tên sinh viên có điểm cao nhất rồi in tên đó.",
      "starter": "",
      "expectedOutput": "Chi",
      "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 9}]\nten_max = ds[0][\"ten\"]\ndiem_max = ds[0][\"diem\"]\nfor s in ds:\n    if s[\"diem\"] > diem_max:\n        diem_max = s[\"diem\"]\n        ten_max = s[\"ten\"]\nprint(ten_max)",
      "require": [
        "dict",
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c28e5",
      "title": "Bài 28.5: Lọc sinh viên đạt",
      "prompt": "Cho ds gồm An 8, Binh 4, Chi 9, in tên từng sinh viên có điểm từ 5 trở lên, mỗi tên một dòng.",
      "starter": "",
      "expectedOutput": "An\nChi",
      "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 4}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 9}]\nfor s in ds:\n    if s[\"diem\"] >= 5:\n        print(s[\"ten\"])",
      "require": [
        "dict",
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c28e6",
      "title": "Bài 28.6: Thống kê theo lớp",
      "prompt": "Cho ds gồm An lớp A, Binh lớp B, Chi lớp A, in số sinh viên lớp A ở dòng 1 và số sinh viên lớp B ở dòng 2.",
      "starter": "",
      "expectedOutput": "2\n1",
      "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 9}]\ndem_a = 0\ndem_b = 0\nfor s in ds:\n    if s[\"lop\"] == \"A\":\n        dem_a += 1\n    else:\n        dem_b += 1\nprint(dem_a)\nprint(dem_b)",
      "require": [
        "dict",
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c28e7",
      "title": "Bài 28.7: In báo cáo lớp",
      "prompt": "Cho ds gồm An 8, Binh 6, Chi 9, in 3 dòng: số sinh viên, điểm trung bình nguyên, tên sinh viên điểm cao nhất.",
      "starter": "",
      "expectedOutput": "3\n7\nChi",
      "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 9}]\ntong = 0\nten_max = ds[0][\"ten\"]\ndiem_max = ds[0][\"diem\"]\nfor s in ds:\n    tong += s[\"diem\"]\n    if s[\"diem\"] > diem_max:\n        diem_max = s[\"diem\"]\n        ten_max = s[\"ten\"]\nprint(len(ds))\nprint(tong // len(ds))\nprint(ten_max)",
      "require": [
        "dict",
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c28e8",
      "title": "Bài 28.8: Tìm sinh viên theo tên",
      "prompt": "Cho ds gồm An 8, Binh 6, Chi 9, tìm sinh viên tên Binh rồi in điểm của sinh viên đó.",
      "starter": "",
      "expectedOutput": "6",
      "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 9}]\nfor s in ds:\n    if s[\"ten\"] == \"Binh\":\n        print(s[\"diem\"])\n        break",
      "require": [
        "dict",
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c28e9",
      "title": "Bài 28.9: Xếp hạng theo điểm",
      "prompt": "Cho ds gồm An 8, Binh 6, Chi 9, sắp xếp giảm dần theo điểm bằng sắp xếp nổi bọt rồi in tên từng sinh viên theo thứ tự mới, mỗi tên một dòng.",
      "starter": "",
      "expectedOutput": "Chi\nAn\nBinh",
      "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 9}]\nfor i in range(len(ds)):\n    for j in range(len(ds) - 1):\n        if ds[j][\"diem\"] < ds[j + 1][\"diem\"]:\n            tam = ds[j]\n            ds[j] = ds[j + 1]\n            ds[j + 1] = tam\nfor s in ds:\n    print(s[\"ten\"])",
      "require": [
        "dict",
        "list",
        "for",
        "if"
      ]
    },
    {
      "id": "c28e10",
      "title": "Bài 28.10: Thêm rồi báo cáo",
      "prompt": "Cho ds có An 8 và Binh 6, thêm Dung 7, rồi in 2 dòng: số sinh viên và điểm trung bình nguyên.",
      "starter": "",
      "expectedOutput": "3\n7",
      "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}]\nds.append({\"ten\": \"Dung\", \"lop\": \"B\", \"diem\": 7})\ntong = 0\nfor s in ds:\n    tong += s[\"diem\"]\nprint(len(ds))\nprint(tong // len(ds))",
      "require": [
        "dict",
        "list",
        "for"
      ]
    }
  ],
  "exam": {
    "code": {
      "prompt": "Cho ds gồm An 9, Binh 7, Chi 8, in 2 dòng: điểm trung bình nguyên và tên sinh viên điểm cao nhất.",
      "expectedOutput": "8\nAn",
      "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 9}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 7}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 8}]\ntong = 0\nten_max = ds[0][\"ten\"]\ndiem_max = ds[0][\"diem\"]\nfor s in ds:\n    tong += s[\"diem\"]\n    if s[\"diem\"] > diem_max:\n        diem_max = s[\"diem\"]\n        ten_max = s[\"ten\"]\nprint(tong // len(ds))\nprint(ten_max)",
      "require": [
        "dict",
        "list",
        "for",
        "if"
      ]
    },
    "mcq": [
      {
        "id": "q1",
        "q": "Danh sách các dict trong đồ án này giống bảng dữ liệu ở điểm nào?",
        "options": [
          "Mỗi dict là một hàng, mỗi khóa là một cột",
          "Mỗi dict là một cột",
          "Không giống bảng",
          "Chỉ lưu được số"
        ],
        "answer": 0
      },
      {
        "id": "q2",
        "q": "Điểm trung bình của lớp tính bằng gì?",
        "options": [
          "Tổng điểm chia số sinh viên",
          "Điểm cao nhất trừ điểm thấp nhất",
          "Điểm đầu tiên",
          "Số sinh viên nhân điểm"
        ],
        "answer": 0
      }
    ]
  }
},
{
    "id": "c29",
    "title": "Chương 29: Logic và điều khiển nâng cao",
    "theory": "Một điều kiện có thể kết hợp nhiều ý bằng and (cả hai đều đúng), or (chỉ cần một đúng) và not (đảo ngược). break dừng hẳn vòng lặp ngay khi gặp điều kiện, còn continue chỉ bỏ qua lượt hiện tại rồi chạy tiếp lượt sau. Lỗi thường gặp là viết and với chỉ số có thể vượt ngoài list, quên break nên vòng lặp chạy hết list, hoặc nhầm break với continue: break thoát hẳn, continue chỉ nhảy lượt.",
    "example": "ds = [3, 7, 9, 4]\nfor i in range(len(ds)):\n    if ds[i] == 9:\n        print(i)\n        break",
    "exercises": [
      {
        "id": "c29e1",
        "title": "Bài 29.1: and trong if",
        "prompt": "Cho diem = 8. Nếu diem >= 5 và diem < 10 thì in Kha, ngược lại in Khac.",
        "starter": "",
        "expectedOutput": "Kha",
        "sample": "diem = 8\nif diem >= 5 and diem < 10:\n    print(\"Kha\")\nelse:\n    print(\"Khac\")",
        "require": [
          "if"
        ]
      },
      {
        "id": "c29e2",
        "title": "Bài 29.2: or trong if",
        "prompt": "Cho tuoi = 15. Nếu tuoi < 18 hoặc tuoi > 60 thì in Uu dai, ngược lại in Thuong.",
        "starter": "",
        "expectedOutput": "Uu dai",
        "sample": "tuoi = 15\nif tuoi < 18 or tuoi > 60:\n    print(\"Uu dai\")\nelse:\n    print(\"Thuong\")",
        "require": [
          "if"
        ]
      },
      {
        "id": "c29e3",
        "title": "Bài 29.3: not trong if",
        "prompt": "Cho diem = 3. Nếu không phải diem >= 5 thì in Chua dat, ngược lại in Dat.",
        "starter": "",
        "expectedOutput": "Chua dat",
        "sample": "diem = 3\nif not diem >= 5:\n    print(\"Chua dat\")\nelse:\n    print(\"Dat\")",
        "require": [
          "if"
        ]
      },
      {
        "id": "c29e4",
        "title": "Bài 29.4: if lồng nhau",
        "prompt": "Cho diem = 9. Nếu diem >= 8 thì xét tiếp: nếu diem >= 9 in Xuat sac, ngược lại in Gioi; nếu diem < 8 in Chua gioi.",
        "starter": "",
        "expectedOutput": "Xuat sac",
        "sample": "diem = 9\nif diem >= 8:\n    if diem >= 9:\n        print(\"Xuat sac\")\n    else:\n        print(\"Gioi\")\nelse:\n    print(\"Chua gioi\")",
        "require": [
          "if"
        ]
      },
      {
        "id": "c29e5",
        "title": "Bài 29.5: break tìm vị trí",
        "prompt": "Cho ds = [3, 7, 9, 4]. Duyệt và in vị trí đầu tiên có giá trị 9, rồi dừng ngay bằng break.",
        "starter": "",
        "expectedOutput": "2",
        "sample": "ds = [3, 7, 9, 4]\nfor i in range(len(ds)):\n    if ds[i] == 9:\n        print(i)\n        break",
        "require": [
          "for",
          "range",
          "if"
        ]
      },
      {
        "id": "c29e6",
        "title": "Bài 29.6: break khi gặp số âm",
        "prompt": "Cho ds = [5, 8, -1, 9]. Cộng dồn từ đầu và dừng ngay khi gặp số âm, rồi in tổng đã cộng được trước đó.",
        "starter": "",
        "expectedOutput": "13",
        "sample": "ds = [5, 8, -1, 9]\ntong = 0\nfor x in ds:\n    if x < 0:\n        break\n    tong += x\nprint(tong)",
        "require": [
          "for",
          "if"
        ]
      },
      {
        "id": "c29e7",
        "title": "Bài 29.7: continue bỏ qua số lẻ",
        "prompt": "Cho ds = [1, 2, 3, 4]. Dùng continue để bỏ qua số lẻ, cộng các số chẵn còn lại rồi in tổng.",
        "starter": "",
        "expectedOutput": "6",
        "sample": "ds = [1, 2, 3, 4]\ntong = 0\nfor x in ds:\n    if x % 2 == 1:\n        continue\n    tong += x\nprint(tong)",
        "require": [
          "for",
          "if"
        ]
      },
      {
        "id": "c29e8",
        "title": "Bài 29.8: while + break an toàn",
        "prompt": "Dùng while True, in i từ 0, mỗi lượt tăng i lên 1, và break khi i >= 3. In 3 dòng 0, 1, 2.",
        "starter": "",
        "expectedOutput": "0\n1\n2",
        "sample": "i = 0\nwhile True:\n    if i >= 3:\n        break\n    print(i)\n    i += 1",
        "require": [
          "while",
          "if"
        ]
      },
      {
        "id": "c29e9",
        "title": "Bài 29.9: Đếm số trong khoảng",
        "prompt": "Cho ds = [3, 6, 11, 8, 4]. Đếm và in số lượng số thỏa cả hai điều kiện: >= 5 và <= 10.",
        "starter": "",
        "expectedOutput": "2",
        "sample": "ds = [3, 6, 11, 8, 4]\ndem = 0\nfor x in ds:\n    if x >= 5 and x <= 10:\n        dem += 1\nprint(dem)",
        "require": [
          "for",
          "if"
        ]
      },
      {
        "id": "c29e10",
        "title": "Bài 29.10: Kiểm tra đăng nhập",
        "prompt": "Cho ten = admin và mk = 123. Nếu cả hai đều đúng thì in Dang nhap thanh cong, ngược lại in Sai thong tin.",
        "starter": "",
        "expectedOutput": "Dang nhap thanh cong",
        "sample": "ten = \"admin\"\nmk = \"123\"\nif ten == \"admin\" and mk == \"123\":\n    print(\"Dang nhap thanh cong\")\nelse:\n    print(\"Sai thong tin\")",
        "require": [
          "if"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Cho ds = [2, 5, 9, 4]. Duyệt và in vị trí đầu tiên có giá trị lớn hơn 8, rồi dừng bằng break.",
        "expectedOutput": "2",
        "sample": "ds = [2, 5, 9, 4]\nfor i in range(len(ds)):\n    if ds[i] > 8:\n        print(i)\n        break",
        "require": [
          "for",
          "range",
          "if"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "break trong vòng lặp dùng để làm gì?",
          "options": [
            "Bỏ qua lượt hiện tại rồi chạy tiếp",
            "Dừng hẳn vòng lặp ngay lập tức",
            "Lặp lại từ đầu",
            "In thêm một dòng"
          ],
          "answer": 1
        },
        {
          "id": "q2",
          "q": "Điều kiện a and b đúng khi nào?",
          "options": [
            "a đúng hoặc b đúng",
            "Cả a và b đều đúng",
            "a sai và b sai",
            "Luôn đúng"
          ],
          "answer": 1
        }
      ]
    }
  },
  {
    "id": "c30",
    "title": "Chương 30: Đọc code, đoán kết quả và sửa lỗi",
    "theory": "Đọc code là kỹ năng riêng, khác với viết code: phải chạy từng dòng trong đầu, theo dõi biến thay đổi ra sao, rồi mới đoán kết quả. Sửa lỗi cũng vậy, phải tìm đúng dòng sai trước khi sửa: thiếu dấu hai chấm, dùng = thay ==, quên thụt lề, sai điều kiện, quên tăng biến đếm trong while. Lưu ý trung thực: máy chấm trong hệ thống này chỉ so kết quả in ra và kỹ thuật bắt buộc, nên bài sửa lỗi yêu cầu viết lại đoạn code đúng, còn phần đoán kết quả được hỏi thêm ở trắc nghiệm của bài thi.",
    "example": "# Đoạn sai (dùng = trong điều kiện):\n# if diem = 8:\n#     print(\"Dat\")\n# Đoạn đúng:\ndiem = 8\nif diem == 8:\n    print(\"Dat\")",
    "exercises": [
      {
        "id": "c30e1",
        "title": "Bài 30.1: Sửa thiếu dấu hai chấm",
        "prompt": "Đoạn code sau sai vì thiếu dấu hai chấm: if diem >= 5 print(\"Dat\"). Viết lại đúng với diem = 8 để in Dat.",
        "starter": "",
        "expectedOutput": "Dat",
        "sample": "diem = 8\nif diem >= 5:\n    print(\"Dat\")",
        "require": [
          "if"
        ]
      },
      {
        "id": "c30e2",
        "title": "Bài 30.2: Sửa = thành ==",
        "prompt": "Đoạn code sau sai vì dùng dấu gán trong điều kiện: if diem = 8. Viết lại đúng với diem = 8 để in Dung.",
        "starter": "",
        "expectedOutput": "Dung",
        "sample": "diem = 8\nif diem == 8:\n    print(\"Dung\")",
        "require": [
          "if"
        ]
      },
      {
        "id": "c30e3",
        "title": "Bài 30.3: Sửa thụt lề trong for",
        "prompt": "Đoạn code sau sai vì dòng print không thụt lề trong vòng lặp for i in range(3). Viết lại đúng để in 0, 1, 2 mỗi số một dòng.",
        "starter": "",
        "expectedOutput": "0\n1\n2",
        "sample": "for i in range(3):\n    print(i)",
        "require": [
          "for",
          "range"
        ]
      },
      {
        "id": "c30e4",
        "title": "Bài 30.4: Sửa biến chưa có",
        "prompt": "Đoạn code sau in c nhưng chỉ có a = 5 và b = 3. Sửa thành in tổng a + b.",
        "starter": "",
        "expectedOutput": "8",
        "sample": "a = 5\nb = 3\nprint(a + b)",
        "require": [
          "variable"
        ]
      },
      {
        "id": "c30e5",
        "title": "Bài 30.5: Sửa range lệch một",
        "prompt": "Đoạn code in 0 đến 4 nhưng đề cần in 1 đến 5. Sửa range để in 1, 2, 3, 4, 5 mỗi số một dòng.",
        "starter": "",
        "expectedOutput": "1\n2\n3\n4\n5",
        "sample": "for i in range(1, 6):\n    print(i)",
        "require": [
          "for",
          "range"
        ]
      },
      {
        "id": "c30e6",
        "title": "Bài 30.6: Sửa điều kiện ngược",
        "prompt": "Đoạn code in Dat khi diem < 5 là ngược. Sửa lại: diem = 7, nếu diem >= 5 thì in Dat, ngược lại in Chua dat.",
        "starter": "",
        "expectedOutput": "Dat",
        "sample": "diem = 7\nif diem >= 5:\n    print(\"Dat\")\nelse:\n    print(\"Chua dat\")",
        "require": [
          "if"
        ]
      },
      {
        "id": "c30e7",
        "title": "Bài 30.7: Sửa tổng bị đặt lại trong vòng lặp",
        "prompt": "Đoạn code đặt tong = 0 bên trong vòng lặp nên tổng cứ bị đặt lại. Sửa lại: đặt tong = 0 trước vòng lặp, cộng ds = [1, 2, 3] rồi in tổng.",
        "starter": "",
        "expectedOutput": "6",
        "sample": "ds = [1, 2, 3]\ntong = 0\nfor x in ds:\n    tong += x\nprint(tong)",
        "require": [
          "for"
        ]
      },
      {
        "id": "c30e8",
        "title": "Bài 30.8: Sửa hàm thiếu return",
        "prompt": "Đoạn code định nghĩa hàm cong(a, b) nhưng chỉ print bên trong nên print(cong(4, 5)) in ra None. Sửa hàm thành return a + b rồi in cong(4, 5).",
        "starter": "",
        "expectedOutput": "9",
        "sample": "def cong(a, b):\n    return a + b\nprint(cong(4, 5))",
        "require": [
          "function"
        ]
      },
      {
        "id": "c30e9",
        "title": "Bài 30.9: Sửa while không dừng",
        "prompt": "Đoạn code while i < 3 nhưng quên tăng i nên chạy mãi. Sửa lại: in i rồi tăng i lên 1 mỗi lượt, để in 0, 1, 2.",
        "starter": "",
        "expectedOutput": "0\n1\n2",
        "sample": "i = 0\nwhile i < 3:\n    print(i)\n    i += 1",
        "require": [
          "while"
        ]
      },
      {
        "id": "c30e10",
        "title": "Bài 30.10: Sửa khóa dict sai",
        "prompt": "Đoạn code có hs = {\"ten\": \"An\", \"diem\": 9} nhưng lại in hs[\"name\"] nên lỗi. Sửa thành in hs[\"ten\"] rồi in hs[\"diem\"], mỗi giá trị một dòng.",
        "starter": "",
        "expectedOutput": "An\n9",
        "sample": "hs = {\"ten\": \"An\", \"diem\": 9}\nprint(hs[\"ten\"])\nprint(hs[\"diem\"])",
        "require": [
          "dict"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Đoạn code sau sai ở hai chỗ: thiếu dấu hai chấm và dùng = thay == trong if. Viết lại đúng với diem = 10 để in Dat.",
        "expectedOutput": "Dat",
        "sample": "diem = 10\nif diem == 10:\n    print(\"Dat\")",
        "require": [
          "if"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Đoạn code: x = 3; for i in range(3): x += 2; print(x) in ra gì?",
          "options": [
            "5",
            "7",
            "9",
            "3"
          ],
          "answer": 2
        },
        {
          "id": "q2",
          "q": "Đoạn code while i < 3 mà quên i += 1 thì xảy ra gì?",
          "options": [
            "Vòng lặp dừng ngay",
            "Vòng lặp chạy mãi không dừng",
            "In ra 0, 1, 2",
            "Báo lỗi ngay dòng đầu"
          ],
          "answer": 1
        }
      ]
    }
  },
  {
    "id": "c31",
    "title": "Chương 31: Báo cáo dữ liệu dạng bảng",
    "theory": "Báo cáo theo nhóm làm bằng từ điển: khóa là tên nhóm, giá trị là số đếm, tổng hoặc giá trị lớn nhất của nhóm đó. Với mỗi hàng, lấy tên nhóm rồi cộng dồn vào từ điển bằng get(nhóm, 0) để nhóm chưa có vẫn bắt đầu từ 0, và dùng get(khóa, 0) để hàng thiếu khóa không làm hỏng báo cáo. Cuối cùng chỉ in các nhóm theo thứ tự cố định đã cho trong đề, không in cả từ điển để thứ tự không bị lệch. Lỗi thường gặp là ghi đè thay vì cộng dồn, hoặc quên khởi tạo nhóm mới.",
    "example": "ds = [{\"lop\": \"A\", \"diem\": 8}, {\"lop\": \"B\", \"diem\": 6}, {\"lop\": \"A\", \"diem\": 9}]\ndem = {}\nfor s in ds:\n    lop = s[\"lop\"]\n    dem[lop] = dem.get(lop, 0) + 1\nprint(dem[\"A\"])\nprint(dem[\"B\"])",
    "exercises": [
      {
        "id": "c31e1",
        "title": "Bài 31.1: Đếm theo lớp",
        "prompt": "Cho ds gồm An lớp A, Binh lớp B, Chi lớp A. Gộp đếm theo lớp rồi in số lớp A ở dòng 1 và số lớp B ở dòng 2.",
        "starter": "",
        "expectedOutput": "2\n1",
        "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\"}, {\"ten\": \"Binh\", \"lop\": \"B\"}, {\"ten\": \"Chi\", \"lop\": \"A\"}]\ndem = {}\nfor s in ds:\n    lop = s[\"lop\"]\n    dem[lop] = dem.get(lop, 0) + 1\nprint(dem[\"A\"])\nprint(dem[\"B\"])",
        "require": [
          "dict",
          "for"
        ]
      },
      {
        "id": "c31e2",
        "title": "Bài 31.2: Tổng điểm theo lớp",
        "prompt": "Cho ds gồm An lớp A điểm 8, Binh lớp B điểm 6, Chi lớp A điểm 9. Gộp tổng điểm theo lớp rồi in tổng lớp A ở dòng 1 và tổng lớp B ở dòng 2.",
        "starter": "",
        "expectedOutput": "17\n6",
        "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 9}]\ntong = {}\nfor s in ds:\n    lop = s[\"lop\"]\n    tong[lop] = tong.get(lop, 0) + s[\"diem\"]\nprint(tong[\"A\"])\nprint(tong[\"B\"])",
        "require": [
          "dict",
          "for"
        ]
      },
      {
        "id": "c31e3",
        "title": "Bài 31.3: Trung bình theo lớp",
        "prompt": "Cho ds như bài 31.2. Tính trung bình nguyên của lớp A rồi in ra.",
        "starter": "",
        "expectedOutput": "8",
        "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 9}]\ntong = {}\ndem = {}\nfor s in ds:\n    lop = s[\"lop\"]\n    tong[lop] = tong.get(lop, 0) + s[\"diem\"]\n    dem[lop] = dem.get(lop, 0) + 1\nprint(tong[\"A\"] // dem[\"A\"])",
        "require": [
          "dict",
          "for"
        ]
      },
      {
        "id": "c31e4",
        "title": "Bài 31.4: Điểm cao nhất theo lớp",
        "prompt": "Cho ds như bài 31.2. Tìm điểm cao nhất của lớp A và lớp B rồi in ở hai dòng theo thứ tự A, B.",
        "starter": "",
        "expectedOutput": "9\n6",
        "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 9}]\nlon = {}\nfor s in ds:\n    lop = s[\"lop\"]\n    if s[\"diem\"] > lon.get(lop, 0):\n        lon[lop] = s[\"diem\"]\nprint(lon[\"A\"])\nprint(lon[\"B\"])",
        "require": [
          "dict",
          "for",
          "if"
        ]
      },
      {
        "id": "c31e5",
        "title": "Bài 31.5: Đếm công việc theo trạng thái",
        "prompt": "Cho ds công việc gồm 2 việc Hoan thanh, 1 việc Cho, 1 việc Hoan thanh. Đếm theo trạng thái rồi in số Hoan thanh ở dòng 1 và số Cho ở dòng 2.",
        "starter": "",
        "expectedOutput": "3\n1",
        "sample": "ds = [{\"ten\": \"A\", \"tt\": \"Hoan thanh\"}, {\"ten\": \"B\", \"tt\": \"Cho\"}, {\"ten\": \"C\", \"tt\": \"Hoan thanh\"}, {\"ten\": \"D\", \"tt\": \"Hoan thanh\"}]\ndem = {}\nfor s in ds:\n    tt = s[\"tt\"]\n    dem[tt] = dem.get(tt, 0) + 1\nprint(dem[\"Hoan thanh\"])\nprint(dem[\"Cho\"])",
        "require": [
          "dict",
          "for"
        ]
      },
      {
        "id": "c31e6",
        "title": "Bài 31.6: Tổng giờ theo phòng ban",
        "prompt": "Cho ds gồm Van hanh 8 giờ, Ky thuat 5 giờ, Van hanh 7 giờ. Gộp tổng giờ theo phòng rồi in tổng Van hanh ở dòng 1 và tổng Ky thuat ở dòng 2.",
        "starter": "",
        "expectedOutput": "15\n5",
        "sample": "ds = [{\"phong\": \"Van hanh\", \"gio\": 8}, {\"phong\": \"Ky thuat\", \"gio\": 5}, {\"phong\": \"Van hanh\", \"gio\": 7}]\ntong = {}\nfor s in ds:\n    phong = s[\"phong\"]\n    tong[phong] = tong.get(phong, 0) + s[\"gio\"]\nprint(tong[\"Van hanh\"])\nprint(tong[\"Ky thuat\"])",
        "require": [
          "dict",
          "for"
        ]
      },
      {
        "id": "c31e7",
        "title": "Bài 31.7: Đếm đơn theo phòng ban",
        "prompt": "Cho ds đơn hàng gồm Van hanh 2 đơn, Ky thuat 1 đơn, Van hanh 1 đơn. Đếm theo phòng rồi in số Van hanh ở dòng 1 và số Ky thuat ở dòng 2.",
        "starter": "",
        "expectedOutput": "3\n1",
        "sample": "ds = [{\"phong\": \"Van hanh\"}, {\"phong\": \"Ky thuat\"}, {\"phong\": \"Van hanh\"}, {\"phong\": \"Van hanh\"}]\ndem = {}\nfor s in ds:\n    phong = s[\"phong\"]\n    dem[phong] = dem.get(phong, 0) + 1\nprint(dem[\"Van hanh\"])\nprint(dem[\"Ky thuat\"])",
        "require": [
          "dict",
          "for"
        ]
      },
      {
        "id": "c31e8",
        "title": "Bài 31.8: Hàng thiếu khóa",
        "prompt": "Cho ds gồm An điểm 8, Binh không có khóa diem, Chi điểm 9. Dùng get(\"diem\", 0) để tính tổng điểm, rồi in tổng.",
        "starter": "",
        "expectedOutput": "17",
        "sample": "ds = [{\"ten\": \"An\", \"diem\": 8}, {\"ten\": \"Binh\"}, {\"ten\": \"Chi\", \"diem\": 9}]\ntong = 0\nfor s in ds:\n    tong += s.get(\"diem\", 0)\nprint(tong)",
        "require": [
          "dict",
          "for"
        ]
      },
      {
        "id": "c31e9",
        "title": "Bài 31.9: Số nhóm trong bảng",
        "prompt": "Cho ds gồm An lớp A, Binh lớp B, Chi lớp A, Dung lớp C. Đếm số lớp khác nhau bằng từ điển đếm rồi in số nhóm.",
        "starter": "",
        "expectedOutput": "3",
        "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\"}, {\"ten\": \"Binh\", \"lop\": \"B\"}, {\"ten\": \"Chi\", \"lop\": \"A\"}, {\"ten\": \"Dung\", \"lop\": \"C\"}]\ndem = {}\nfor s in ds:\n    lop = s[\"lop\"]\n    dem[lop] = dem.get(lop, 0) + 1\nprint(len(dem))",
        "require": [
          "dict",
          "for"
        ]
      },
      {
        "id": "c31e10",
        "title": "Bài 31.10: Báo cáo phòng Van hanh",
        "prompt": "Cho ds công việc gồm Van hanh 8 giờ, Ky thuat 5 giờ, Van hanh 7 giờ. In 2 dòng: số việc của Van hanh và tổng giờ của Van hanh.",
        "starter": "",
        "expectedOutput": "2\n15",
        "sample": "ds = [{\"phong\": \"Van hanh\", \"gio\": 8}, {\"phong\": \"Ky thuat\", \"gio\": 5}, {\"phong\": \"Van hanh\", \"gio\": 7}]\ndem = 0\ntong = 0\nfor s in ds:\n    if s[\"phong\"] == \"Van hanh\":\n        dem += 1\n        tong += s[\"gio\"]\nprint(dem)\nprint(tong)",
        "require": [
          "dict",
          "for",
          "if"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Cho ds gồm An lớp A điểm 8, Binh lớp B điểm 7, Chi lớp A điểm 6. Gộp tổng điểm theo lớp rồi in tổng lớp A ở dòng 1 và tổng lớp B ở dòng 2.",
        "expectedOutput": "14\n7",
        "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 7}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 6}]\ntong = {}\nfor s in ds:\n    lop = s[\"lop\"]\n    tong[lop] = tong.get(lop, 0) + s[\"diem\"]\nprint(tong[\"A\"])\nprint(tong[\"B\"])",
        "require": [
          "dict",
          "for"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Gộp theo nhóm bằng từ điển thì khóa nên là gì?",
          "options": [
            "Tên nhóm",
            "Tổng điểm",
            "Số thứ tự bất kỳ",
            "Giá trị cần tính"
          ],
          "answer": 0
        },
        {
          "id": "q2",
          "q": "dem.get(lop, 0) dùng để làm gì?",
          "options": [
            "Xóa nhóm",
            "Lấy số đếm, nhóm chưa có thì tính từ 0",
            "In cả từ điển",
            "Đổi tên nhóm"
          ],
          "answer": 1
        }
      ]
    }
  },
{
    "id": "c32",
    "title": "Chương 32: Trí tuệ nhân tạo cơ bản (CS311)",
    "theory": "Trí tuệ nhân tạo không phải viết sẵn mọi luật, mà để máy học quy luật từ dữ liệu: dữ liệu huấn luyện để học mô hình, dữ liệu kiểm tra để đo độ chính xác, tuyệt đối không lấy dữ liệu kiểm tra ra huấn luyện. Chương này tự viết tay mọi thuật toán bằng list và vòng lặp, không dùng thư viện sẵn, đúng tinh thần CS311: k-NN theo điểm gần nhất, perceptron sửa trọng số khi đoán sai, hồi quy tuyến tính tìm đường thẳng khớp dữ liệu nhất. Lỗi thường gặp là học thuộc dữ liệu huấn luyện và quên chia tập kiểm tra.",
    "example": "ds = [[1, 0], [2, 1], [5, 1]]\nmoi = 3\nkc_min = 100\nnhan = 0\nfor d in ds:\n    kc = (moi - d[0]) ** 2\n    if kc < kc_min:\n        kc_min = kc\n        nhan = d[1]\nprint(nhan)",
    "exercises": [
      {
        "id": "c32e1",
        "title": "Bài 32.1: Khoảng cách bình phương",
        "prompt": "Cho hai điểm có x là 1 và 4, y là 2 và 6. Tính và in khoảng cách bình phương (x2 - x1) ** 2 + (y2 - y1) ** 2.",
        "starter": "",
        "expectedOutput": "25",
        "sample": "x1 = 1\nx2 = 4\ny1 = 2\ny2 = 6\nprint((x2 - x1) ** 2 + (y2 - y1) ** 2)",
        "require": [
          "variable"
        ]
      },
      {
        "id": "c32e2",
        "title": "Bài 32.2: k-NN tìm điểm gần nhất",
        "prompt": "Cho ds = [[1, 0], [2, 1], [5, 1]] trong đó mỗi phần tử là [x, nhãn]. Điểm mới có x = 3. Tìm điểm gần nhất theo khoảng cách bình phương rồi in nhãn của điểm đó.",
        "starter": "",
        "expectedOutput": "1",
        "sample": "ds = [[1, 0], [2, 1], [5, 1]]\nmoi = 3\nkc_min = 100\nnhan = 0\nfor d in ds:\n    kc = (moi - d[0]) ** 2\n    if kc < kc_min:\n        kc_min = kc\n        nhan = d[1]\nprint(nhan)",
        "require": [
          "for",
          "if"
        ]
      },
      {
        "id": "c32e3",
        "title": "Bài 32.3: Perceptron dự đoán",
        "prompt": "Cho trọng số w = 0.5, độ lệch b = 0, đầu vào x = 4. Tính tong = w * x + b, nếu tong >= 0 thì in 1, ngược lại in 0.",
        "starter": "",
        "expectedOutput": "1",
        "sample": "w = 0.5\nb = 0\nx = 4\ntong = w * x + b\nif tong >= 0:\n    print(1)\nelse:\n    print(0)",
        "require": [
          "variable",
          "if"
        ]
      },
      {
        "id": "c32e4",
        "title": "Bài 32.4: Perceptron sửa trọng số",
        "prompt": "Cho w = 0, x = 2, nhãn đúng là 1, mô hình đoán 0. Sửa trọng số theo công thức w_moi = w + 1 * (1 - 0) * x rồi in w_moi.",
        "starter": "",
        "expectedOutput": "2",
        "sample": "w = 0\nx = 2\nw_moi = w + 1 * (1 - 0) * x\nprint(w_moi)",
        "require": [
          "variable"
        ]
      },
      {
        "id": "c32e5",
        "title": "Bài 32.5: Hệ số hồi quy tuyến tính",
        "prompt": "Cho xs = [1, 2, 3], ys = [2, 4, 6], trung bình x là 2, trung bình y là 4. Tính tử số và mẫu số rồi in hệ số góc nguyên tu // mau.",
        "starter": "",
        "expectedOutput": "2",
        "sample": "xs = [1, 2, 3]\nys = [2, 4, 6]\ntb_x = 2\ntb_y = 4\ntu = 0\nmau = 0\nfor i in range(3):\n    tu += (xs[i] - tb_x) * (ys[i] - tb_y)\n    mau += (xs[i] - tb_x) ** 2\nprint(tu // mau)",
        "require": [
          "for",
          "range"
        ]
      },
      {
        "id": "c32e6",
        "title": "Bài 32.6: Dự đoán bằng hồi quy",
        "prompt": "Cho hệ số góc a = 2, hệ số chặn b = 1. Dự đoán y tại x = 5 theo công thức y = a * x + b rồi in y.",
        "starter": "",
        "expectedOutput": "11",
        "sample": "a = 2\nb = 1\nx = 5\nprint(a * x + b)",
        "require": [
          "variable"
        ]
      },
      {
        "id": "c32e7",
        "title": "Bài 32.7: Độ chính xác của mô hình",
        "prompt": "Mô hình đoán đúng 3 trên tổng số 4 mẫu. Tính và in độ chính xác theo phần trăm nguyên: dung * 100 // tong.",
        "starter": "",
        "expectedOutput": "75",
        "sample": "dung = 3\ntong = 4\nprint(dung * 100 // tong)",
        "require": [
          "variable"
        ]
      },
      {
        "id": "c32e8",
        "title": "Bài 32.8: Phân loại bằng ngưỡng",
        "prompt": "Cho điểm số diem = 7. Nếu diem >= 5 thì in 1 (đạt), ngược lại in 0 (chưa đạt). Đây chính là một cây quyết định chỉ có một ngưỡng.",
        "starter": "",
        "expectedOutput": "1",
        "sample": "diem = 7\nif diem >= 5:\n    print(1)\nelse:\n    print(0)",
        "require": [
          "if"
        ]
      },
      {
        "id": "c32e9",
        "title": "Bài 32.9: Chuẩn hóa min-max",
        "prompt": "Cho x = 75, giá trị nhỏ nhất là 50, lớn nhất là 100. Tính và in giá trị chuẩn hóa (x - 50) / (100 - 50).",
        "starter": "",
        "expectedOutput": "0.5",
        "sample": "x = 75\nprint((x - 50) / (100 - 50))",
        "require": [
          "variable"
        ]
      },
      {
        "id": "c32e10",
        "title": "Bài 32.10: Độ chính xác trên tập kiểm tra",
        "prompt": "Cho nhãn thật that = [1, 0, 1, 1] và nhãn mô hình đoán du_doan = [1, 0, 0, 1]. Đếm số mẫu đoán đúng rồi in độ chính xác phần trăm nguyên.",
        "starter": "",
        "expectedOutput": "75",
        "sample": "that = [1, 0, 1, 1]\ndu_doan = [1, 0, 0, 1]\ndung = 0\nfor i in range(4):\n    if that[i] == du_doan[i]:\n        dung += 1\nprint(dung * 100 // 4)",
        "require": [
          "for",
          "range",
          "if"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Cho ds = [[1, 0], [4, 1], [6, 1]] trong đó mỗi phần tử là [x, nhãn]. Điểm mới có x = 5. Tìm điểm gần nhất theo khoảng cách bình phương rồi in nhãn của điểm đó.",
        "expectedOutput": "1",
        "sample": "ds = [[1, 0], [4, 1], [6, 1]]\nmoi = 5\nkc_min = 100\nnhan = 0\nfor d in ds:\n    kc = (moi - d[0]) ** 2\n    if kc < kc_min:\n        kc_min = kc\n        nhan = d[1]\nprint(nhan)",
        "require": [
          "for",
          "if"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Mô hình học máy học quy luật từ đâu?",
          "options": [
            "Từ luật viết sẵn tay",
            "Từ dữ liệu huấn luyện",
            "Từ dữ liệu kiểm tra",
            "Từ đáp án của giáo viên"
          ],
          "answer": 1
        },
        {
          "id": "q2",
          "q": "k-NN phân loại điểm mới dựa vào gì?",
          "options": [
            "Điểm xa nhất",
            "Điểm gần nhất",
            "Điểm đầu tiên trong list",
            "Giá trị trung bình mọi điểm"
          ],
          "answer": 1
        }
      ]
    }
  },
{
    "id": "c33",
    "title": "Chương 33: Cấu trúc dữ liệu",
    "theory": "Ngăn xếp (stack) vào sau ra trước, hàng đợi (queue) vào trước ra trước, bảng băm (dict) tra cứu theo khóa, cây là dict lồng dict, đồ thị là dict mà mỗi đỉnh ánh xạ tới list các đỉnh kề. Duyệt theo chiều rộng (BFS) dùng hàng đợi, duyệt theo chiều sâu (DFS) dùng đệ quy. Lỗi thường gặp là dùng pop() trên danh sách rỗng, quên đánh dấu đỉnh đã thăm nên BFS lặp vô hạn, và nhầm thứ tự vào ra của ngăn xếp với hàng đợi.",
    "example": "ds = [1, 2, 3]\nds.append(4)\nprint(ds.pop())\nprint(ds)",
    "exercises": [
      {
        "id": "c33e1",
        "title": "Bài 33.1: Đỉnh ngăn xếp",
        "prompt": "Cho ds = [10, 20, 30] làm ngăn xếp. In phần tử trên cùng bằng chỉ số âm.",
        "starter": "",
        "expectedOutput": "30",
        "sample": "ds = [10, 20, 30]\nprint(ds[-1])",
        "require": [
          "list"
        ]
      },
      {
        "id": "c33e2",
        "title": "Bài 33.2: Pop khỏi ngăn xếp",
        "prompt": "Cho ds = [1, 2, 3]. Thêm 4 rồi pop một lần, in giá trị pop ra ở dòng 1 và in ds còn lại ở dòng 2.",
        "starter": "",
        "expectedOutput": "4\n[1, 2, 3]",
        "sample": "ds = [1, 2, 3]\nds.append(4)\nx = ds.pop()\nprint(x)\nprint(ds)",
        "require": [
          "pop",
          "list"
        ]
      },
      {
        "id": "c33e3",
        "title": "Bài 33.3: Hàng đợi bằng chỉ số",
        "prompt": "Cho hang = [\"A\", \"B\", \"C\"]. Dùng chỉ số đầu dau = 0 để in phần tử đầu, tăng dau lên 1 rồi in phần tử tiếp theo.",
        "starter": "",
        "expectedOutput": "A\nB",
        "sample": "hang = [\"A\", \"B\", \"C\"]\ndau = 0\nprint(hang[dau])\ndau += 1\nprint(hang[dau])",
        "require": [
          "list"
        ]
      },
      {
        "id": "c33e4",
        "title": "Bài 33.4: Pop đầu hàng đợi",
        "prompt": "Cho hang = [\"A\", \"B\", \"C\"]. Pop phần tử đầu bằng pop(0), in giá trị đó ở dòng 1 và in hang còn lại ở dòng 2.",
        "starter": "",
        "expectedOutput": "A\n['B', 'C']",
        "sample": "hang = [\"A\", \"B\", \"C\"]\nx = hang.pop(0)\nprint(x)\nprint(hang)",
        "require": [
          "pop",
          "list"
        ]
      },
      {
        "id": "c33e5",
        "title": "Bài 33.5: Bảng băm tra cứu",
        "prompt": "Cho bang = {\"An\": 8, \"Binh\": 6, \"Chi\": 9}. In điểm của Binh.",
        "starter": "",
        "expectedOutput": "6",
        "sample": "bang = {\"An\": 8, \"Binh\": 6, \"Chi\": 9}\nprint(bang[\"Binh\"])",
        "require": [
          "dict"
        ]
      },
      {
        "id": "c33e6",
        "title": "Bài 33.6: Đếm từ bằng bảng băm",
        "prompt": "Cho ds từ = [\"python\", \"java\", \"python\"]. Đếm bằng dict get rồi in số lần xuất hiện của python.",
        "starter": "",
        "expectedOutput": "2",
        "sample": "ds = [\"python\", \"java\", \"python\"]\ndem = {}\nfor w in ds:\n    dem[w] = dem.get(w, 0) + 1\nprint(dem[\"python\"])",
        "require": [
          "dict",
          "for"
        ]
      },
      {
        "id": "c33e7",
        "title": "Bài 33.7: Cây lồng dict",
        "prompt": "Cho cay = {\"ten\": \"A\", \"con\": [{\"ten\": \"B\", \"con\": []}, {\"ten\": \"C\", \"con\": []}]}. In tên nút con đầu tiên.",
        "starter": "",
        "expectedOutput": "B",
        "sample": "cay = {\"ten\": \"A\", \"con\": [{\"ten\": \"B\", \"con\": []}, {\"ten\": \"C\", \"con\": []}]}\nprint(cay[\"con\"][0][\"ten\"])",
        "require": [
          "dict"
        ]
      },
      {
        "id": "c33e8",
        "title": "Bài 33.8: Duyệt cây bằng đệ quy",
        "prompt": "Cho cây như bài 33.7. Viết hàm duyet(nut) in tên nút rồi duyệt từng nút con, gọi duyet(cay) để in A, B, C mỗi tên một dòng.",
        "starter": "",
        "expectedOutput": "A\nB\nC",
        "sample": "cay = {\"ten\": \"A\", \"con\": [{\"ten\": \"B\", \"con\": []}, {\"ten\": \"C\", \"con\": []}]}\ndef duyet(nut):\n    print(nut[\"ten\"])\n    for c in nut[\"con\"]:\n        duyet(c)\nduyet(cay)",
        "require": [
          "function",
          "dict",
          "for"
        ]
      },
      {
        "id": "c33e9",
        "title": "Bài 33.9: Đồ thị kề",
        "prompt": "Cho do_thi = {\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [], \"D\": []}. In list các đỉnh kề của A.",
        "starter": "",
        "expectedOutput": "['B', 'C']",
        "sample": "do_thi = {\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [], \"D\": []}\nprint(do_thi[\"A\"])",
        "require": [
          "dict"
        ]
      },
      {
        "id": "c33e10",
        "title": "Bài 33.10: BFS",
        "prompt": "Cho đồ thị như bài 33.9. Duyệt BFS từ A bằng hàng đợi và danh sách đã thăm, in danh sách đã thăm.",
        "starter": "",
        "expectedOutput": "['A', 'B', 'C', 'D']",
        "sample": "do_thi = {\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [], \"D\": []}\nda_tham = []\nhang = [\"A\"]\ndau = 0\nwhile dau < len(hang):\n    x = hang[dau]\n    dau += 1\n    if x in da_tham:\n        continue\n    da_tham.append(x)\n    for k in do_thi[x]:\n        hang.append(k)\nprint(da_tham)",
        "require": [
          "while",
          "for",
          "if"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Cho ds = [5, 8, 3]. Thêm 9 rồi pop một lần, in giá trị pop ra.",
        "expectedOutput": "9",
        "sample": "ds = [5, 8, 3]\nds.append(9)\nprint(ds.pop())",
        "require": [
          "pop",
          "list"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Ngăn xếp (stack) lấy ra theo thứ tự nào?",
          "options": [
            "Vào trước ra trước",
            "Vào sau ra trước",
            "Ngẫu nhiên",
            "Theo thứ tự bảng chữ cái"
          ],
          "answer": 1
        },
        {
          "id": "q2",
          "q": "BFS dùng cấu trúc nào?",
          "options": [
            "Ngăn xếp",
            "Hàng đợi",
            "Cây",
            "Bảng băm"
          ],
          "answer": 1
        }
      ]
    }
  },
  {
    "id": "c34",
    "title": "Chương 34: Thuật toán nâng cao",
    "theory": "Sắp xếp nhanh (quick sort) chọn một chốt rồi chia list thành nhóm nhỏ hơn và lớn hơn, tìm kiếm nhị phân chỉ đúng khi list đã sắp xếp, quy hoạch động lưu kết quả con đã tính vào dict để khỏi tính lại, hai con trỏ và cửa sổ trượt giúp bài toán trên list chỉ cần duyệt một lần. Lỗi thường gặp là tìm kiếm nhị phân trên list chưa sắp xếp, quên điều kiện dừng của đệ quy, và tính lại cùng một bài toán con nhiều lần thay vì lưu vào bảng.",
    "example": "def sap(x):\n    if len(x) <= 1:\n        return x\n    chot = x[0]\n    nho = []\n    lon = []\n    for v in x:\n        if v < chot:\n            nho.append(v)\n        if v > chot:\n            lon.append(v)\n    return sap(nho) + [chot] + sap(lon)\nprint(sap([3, 1, 2]))",
    "exercises": [
      {
        "id": "c34e1",
        "title": "Bài 34.1: Sắp xếp nhanh",
        "prompt": "Viết hàm sap(x) bằng đệ quy và chốt x[0] như ví dụ, in sap([3, 1, 2]).",
        "starter": "",
        "expectedOutput": "[1, 2, 3]",
        "sample": "def sap(x):\n    if len(x) <= 1:\n        return x\n    chot = x[0]\n    nho = []\n    lon = []\n    for v in x:\n        if v < chot:\n            nho.append(v)\n        if v > chot:\n            lon.append(v)\n    return sap(nho) + [chot] + sap(lon)\nprint(sap([3, 1, 2]))",
        "require": [
          "function",
          "list",
          "for",
          "if"
        ]
      },
      {
        "id": "c34e2",
        "title": "Bài 34.2: Trộn hai list đã sắp xếp",
        "prompt": "Cho a = [1, 4, 7] và b = [2, 3, 6]. Trộn bằng hai chỉ số i, j rồi in list đã trộn.",
        "starter": "",
        "expectedOutput": "[1, 2, 3, 4, 6, 7]",
        "sample": "a = [1, 4, 7]\nb = [2, 3, 6]\ni = 0\nj = 0\nkq = []\nwhile i < len(a) and j < len(b):\n    if a[i] < b[j]:\n        kq.append(a[i])\n        i += 1\n    else:\n        kq.append(b[j])\n        j += 1\nwhile i < len(a):\n    kq.append(a[i])\n    i += 1\nwhile j < len(b):\n    kq.append(b[j])\n    j += 1\nprint(kq)",
        "require": [
          "while",
          "list",
          "if"
        ]
      },
      {
        "id": "c34e3",
        "title": "Bài 34.3: Tìm kiếm nhị phân lặp",
        "prompt": "Cho ds = [1, 3, 5, 7, 9] đã sắp xếp, tìm 7 bằng vòng lặp while với lo, hi, mid, in vị trí tìm được.",
        "starter": "",
        "expectedOutput": "3",
        "sample": "ds = [1, 3, 5, 7, 9]\nlo = 0\nhi = len(ds) - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if ds[mid] == 7:\n        print(mid)\n        break\n    if ds[mid] < 7:\n        lo = mid + 1\n    else:\n        hi = mid - 1",
        "require": [
          "while",
          "if"
        ]
      },
      {
        "id": "c34e4",
        "title": "Bài 34.4: Tìm kiếm nhị phân đệ quy",
        "prompt": "Viết hàm tk(ds, x, lo, hi) đệ quy: nếu lo > hi trả về -1, mid = (lo + hi) // 2, nếu bằng thì trả về mid, nếu nhỏ hơn thì tìm nửa phải, ngược lại tìm nửa trái. In tk([1, 3, 5, 7, 9], 7, 0, 4).",
        "starter": "",
        "expectedOutput": "3",
        "sample": "def tk(ds, x, lo, hi):\n    if lo > hi:\n        return -1\n    mid = (lo + hi) // 2\n    if ds[mid] == x:\n        return mid\n    if ds[mid] < x:\n        return tk(ds, x, mid + 1, hi)\n    return tk(ds, x, lo, mid - 1)\nprint(tk([1, 3, 5, 7, 9], 7, 0, 4))",
        "require": [
          "function",
          "if"
        ]
      },
      {
        "id": "c34e5",
        "title": "Bài 34.5: Fibonacci có nhớ",
        "prompt": "Viết hàm fib(n) có dict memo ở ngoài: nếu n <= 1 trả về n, nếu n đã có trong memo thì trả về memo[n], ngược lại tính, lưu rồi trả về. In fib(10).",
        "starter": "",
        "expectedOutput": "55",
        "sample": "memo = {}\ndef fib(n):\n    if n <= 1:\n        return n\n    if n in memo:\n        return memo[n]\n    kq = fib(n - 1) + fib(n - 2)\n    memo[n] = kq\n    return kq\nprint(fib(10))",
        "require": [
          "function",
          "dict",
          "if"
        ]
      },
      {
        "id": "c34e6",
        "title": "Bài 34.6: Dãy con tăng dài nhất",
        "prompt": "Cho ds = [3, 1, 4, 1, 5]. Dùng dp với dp[i] là độ dài dãy tăng kết thúc tại i, in độ dài lớn nhất.",
        "starter": "",
        "expectedOutput": "3",
        "sample": "ds = [3, 1, 4, 1, 5]\ndp = [1, 1, 1, 1, 1]\nfor i in range(len(ds)):\n    for j in range(i):\n        if ds[j] < ds[i] and dp[j] + 1 > dp[i]:\n            dp[i] = dp[j] + 1\nlon = dp[0]\nfor x in dp:\n    if x > lon:\n        lon = x\nprint(lon)",
        "require": [
          "for",
          "range",
          "if"
        ]
      },
      {
        "id": "c34e7",
        "title": "Bài 34.7: Đổi tiền ít xu nhất",
        "prompt": "Cho các mệnh giá [1, 5, 10] và số tiền 11. Dùng dp với dp[0] = 0, các ô còn lại bắt đầu bằng 100, in số xu ít nhất để đổi 11.",
        "starter": "",
        "expectedOutput": "2",
        "sample": "coins = [1, 5, 10]\ndp = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]\ndp[0] = 0\nfor i in range(1, 12):\n    for c in coins:\n        if c <= i and dp[i - c] + 1 < dp[i]:\n            dp[i] = dp[i - c] + 1\nprint(dp[11])",
        "require": [
          "for",
          "range",
          "if"
        ]
      },
      {
        "id": "c34e8",
        "title": "Bài 34.8: Hai con trỏ tìm cặp",
        "prompt": "Cho ds = [1, 2, 4, 7, 9] đã sắp xếp và tổng cần tìm là 11. Dùng hai con trỏ i từ đầu và j từ cuối, in i ở dòng 1 và j ở dòng 2 khi tìm được cặp.",
        "starter": "",
        "expectedOutput": "1\n4",
        "sample": "ds = [1, 2, 4, 7, 9]\ni = 0\nj = len(ds) - 1\nwhile i < j:\n    tong = ds[i] + ds[j]\n    if tong == 11:\n        print(i)\n        print(j)\n        break\n    if tong < 11:\n        i += 1\n    else:\n        j -= 1",
        "require": [
          "while",
          "if"
        ]
      },
      {
        "id": "c34e9",
        "title": "Bài 34.9: Cửa sổ trượt",
        "prompt": "Cho ds = [1, 4, 2, 10, 3] và k = 3. Tính tổng cửa sổ đầu, trượt từng bước rồi in tổng lớn nhất.",
        "starter": "",
        "expectedOutput": "16",
        "sample": "ds = [1, 4, 2, 10, 3]\ntong = ds[0] + ds[1] + ds[2]\nlon = tong\nfor i in range(3, 5):\n    tong += ds[i] - ds[i - 3]\n    if tong > lon:\n        lon = tong\nprint(lon)",
        "require": [
          "for",
          "range",
          "if"
        ]
      },
      {
        "id": "c34e10",
        "title": "Bài 34.10: Sắp xếp bằng đếm",
        "prompt": "Cho ds = [2, 1, 2, 3, 1, 2]. Đếm bằng dict rồi xây lại list đã sắp xếp theo thứ tự giá trị 1, 2, 3 và in list đó.",
        "starter": "",
        "expectedOutput": "[1, 1, 2, 2, 2, 3]",
        "sample": "ds = [2, 1, 2, 3, 1, 2]\ndem = {}\nfor x in ds:\n    dem[x] = dem.get(x, 0) + 1\nkq = []\nfor v in [1, 2, 3]:\n    for k in range(dem[v]):\n        kq.append(v)\nprint(kq)",
        "require": [
          "dict",
          "for",
          "range"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Viết hàm sap(x) sắp xếp nhanh như bài 34.1 rồi in sap([4, 1, 3]).",
        "expectedOutput": "[1, 3, 4]",
        "sample": "def sap(x):\n    if len(x) <= 1:\n        return x\n    chot = x[0]\n    nho = []\n    lon = []\n    for v in x:\n        if v < chot:\n            nho.append(v)\n        if v > chot:\n            lon.append(v)\n    return sap(nho) + [chot] + sap(lon)\nprint(sap([4, 1, 3]))",
        "require": [
          "function",
          "list",
          "for",
          "if"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Tìm kiếm nhị phân yêu cầu gì trước?",
          "options": [
            "List đã sắp xếp",
            "List càng dài càng tốt",
            "Không cần sắp xếp",
            "List chỉ có số chẵn"
          ],
          "answer": 0
        },
        {
          "id": "q2",
          "q": "Quy hoạch động tiết kiệm thời gian bằng cách nào?",
          "options": [
            "Tính lại mọi lần",
            "Lưu kết quả con đã tính",
            "Bỏ qua bài toán con",
            "Chỉ dùng đệ quy"
          ],
          "answer": 1
        }
      ]
    }
  },
  {
    "id": "c35",
    "title": "Chương 35: Đệ quy nâng cao và chia để trị",
    "theory": "Chia để trị là chia bài toán lớn thành bài toán con giống hệt nhưng nhỏ hơn, giải xong rồi gộp lại: sắp xếp nhanh, tìm kiếm nhị phân, lũy thừa nhanh đều theo cách này. Quay lui (backtracking) thử một lựa chọn, nếu sai thì quay lại thử lựa chọn khác. Mọi đệ quy đều cần điều kiện dừng rõ ràng và bài toán con phải nhỏ dần, nếu không sẽ gọi mãi hoặc tràn ngăn xếp. Lỗi thường gặp là quên trường hợp cơ sở, và dùng cắt lát sai biên làm bài toán con không nhỏ lại.",
    "example": "def ucln(a, b):\n    if b == 0:\n        return a\n    return ucln(b, a % b)\nprint(ucln(48, 18))",
    "exercises": [
      {
        "id": "c35e1",
        "title": "Bài 35.1: Tổng đệ quy theo chỉ số",
        "prompt": "Viết hàm tong(ds, i): nếu i >= len(ds) trả về 0, ngược lại trả về ds[i] + tong(ds, i + 1). In tong([1, 2, 3, 4], 0).",
        "starter": "",
        "expectedOutput": "10",
        "sample": "def tong(ds, i):\n    if i >= len(ds):\n        return 0\n    return ds[i] + tong(ds, i + 1)\nprint(tong([1, 2, 3, 4], 0))",
        "require": [
          "function",
          "if"
        ]
      },
      {
        "id": "c35e2",
        "title": "Bài 35.2: Đảo chuỗi đệ quy",
        "prompt": "Viết hàm dao(s): nếu len(s) <= 1 trả về s, ngược lại trả về s[-1] + dao(s[:-1]). In dao(\"abc\").",
        "starter": "",
        "expectedOutput": "cba",
        "sample": "def dao(s):\n    if len(s) <= 1:\n        return s\n    return s[-1] + dao(s[:-1])\nprint(dao(\"abc\"))",
        "require": [
          "function",
          "slice",
          "if"
        ]
      },
      {
        "id": "c35e3",
        "title": "Bài 35.3: Lũy thừa nhanh",
        "prompt": "Viết hàm luy(a, n): nếu n == 0 trả về 1, nếu n chẵn trả về luy(a, n // 2) ** 2, ngược lại trả về a * luy(a, n - 1). In luy(2, 5).",
        "starter": "",
        "expectedOutput": "32",
        "sample": "def luy(a, n):\n    if n == 0:\n        return 1\n    if n % 2 == 0:\n        return luy(a, n // 2) ** 2\n    return a * luy(a, n - 1)\nprint(luy(2, 5))",
        "require": [
          "function",
          "if"
        ]
      },
      {
        "id": "c35e4",
        "title": "Bài 35.4: Ước chung lớn nhất",
        "prompt": "Viết hàm ucln(a, b) bằng thuật toán Euclid đệ quy rồi in ucln(48, 18).",
        "starter": "",
        "expectedOutput": "6",
        "sample": "def ucln(a, b):\n    if b == 0:\n        return a\n    return ucln(b, a % b)\nprint(ucln(48, 18))",
        "require": [
          "function",
          "if"
        ]
      },
      {
        "id": "c35e5",
        "title": "Bài 35.5: Chuỗi đối xứng đệ quy",
        "prompt": "Viết hàm dx(s): nếu len(s) <= 1 trả về True, nếu s[0] != s[-1] trả về False, ngược lại trả về dx(s[1:-1]). Nếu dx(\"level\") đúng thì in Dung, ngược lại in Sai.",
        "starter": "",
        "expectedOutput": "Dung",
        "sample": "def dx(s):\n    if len(s) <= 1:\n        return True\n    if s[0] != s[-1]:\n        return False\n    return dx(s[1:-1])\nif dx(\"level\"):\n    print(\"Dung\")\nelse:\n    print(\"Sai\")",
        "require": [
          "function",
          "slice",
          "if"
        ]
      },
      {
        "id": "c35e6",
        "title": "Bài 35.6: Đếm đệ quy",
        "prompt": "Viết hàm dem(ds, x, i): nếu i >= len(ds) trả về 0, nếu ds[i] == x thì trả về 1 + dem(ds, x, i + 1), ngược lại trả về dem(ds, x, i + 1). In dem([1, 2, 1, 3], 1, 0).",
        "starter": "",
        "expectedOutput": "2",
        "sample": "def dem(ds, x, i):\n    if i >= len(ds):\n        return 0\n    if ds[i] == x:\n        return 1 + dem(ds, x, i + 1)\n    return dem(ds, x, i + 1)\nprint(dem([1, 2, 1, 3], 1, 0))",
        "require": [
          "function",
          "if"
        ]
      },
      {
        "id": "c35e7",
        "title": "Bài 35.7: Quay lui tìm tổng",
        "prompt": "Viết hàm co_tong(ds, i, can): nếu can == 0 trả về True, nếu i >= len(ds) trả về False, ngược lại thử bỏ qua hoặc lấy ds[i]. Nếu co_tong([3, 5, 2], 0, 7) đúng thì in Co, ngược lại in Khong.",
        "starter": "",
        "expectedOutput": "Co",
        "sample": "def co_tong(ds, i, can):\n    if can == 0:\n        return True\n    if i >= len(ds):\n        return False\n    return co_tong(ds, i + 1, can) or co_tong(ds, i + 1, can - ds[i])\nif co_tong([3, 5, 2], 0, 7):\n    print(\"Co\")\nelse:\n    print(\"Khong\")",
        "require": [
          "function",
          "if"
        ]
      },
      {
        "id": "c35e8",
        "title": "Bài 35.8: Số bước tháp Hà Nội",
        "prompt": "Viết hàm hanoi(n): nếu n == 1 trả về 1, ngược lại trả về 2 * hanoi(n - 1) + 1. In hanoi(3).",
        "starter": "",
        "expectedOutput": "7",
        "sample": "def hanoi(n):\n    if n == 1:\n        return 1\n    return 2 * hanoi(n - 1) + 1\nprint(hanoi(3))",
        "require": [
          "function",
          "if"
        ]
      },
      {
        "id": "c35e9",
        "title": "Bài 35.9: Số lớn nhất đệ quy",
        "prompt": "Viết hàm lon(ds, i): nếu i == len(ds) - 1 trả về ds[i], ngược lại lấy lon(ds, i + 1) rồi trả về số lớn hơn trong hai số. In lon([3, 9, 4], 0).",
        "starter": "",
        "expectedOutput": "9",
        "sample": "def lon(ds, i):\n    if i == len(ds) - 1:\n        return ds[i]\n    sau = lon(ds, i + 1)\n    if ds[i] > sau:\n        return ds[i]\n    return sau\nprint(lon([3, 9, 4], 0))",
        "require": [
          "function",
          "if"
        ]
      },
      {
        "id": "c35e10",
        "title": "Bài 35.10: Tổng các chữ số đệ quy",
        "prompt": "Viết hàm tong_chu_so(n): nếu n < 10 trả về n, ngược lại trả về n % 10 + tong_chu_so(n // 10). In tong_chu_so(123).",
        "starter": "",
        "expectedOutput": "6",
        "sample": "def tong_chu_so(n):\n    if n < 10:\n        return n\n    return n % 10 + tong_chu_so(n // 10)\nprint(tong_chu_so(123))",
        "require": [
          "function",
          "if"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Viết hàm ucln(a, b) bằng Euclid đệ quy rồi in ucln(36, 24).",
        "expectedOutput": "12",
        "sample": "def ucln(a, b):\n    if b == 0:\n        return a\n    return ucln(b, a % b)\nprint(ucln(36, 24))",
        "require": [
          "function",
          "if"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Đệ quy bắt buộc phải có gì?",
          "options": [
            "Điều kiện dừng và bài toán con nhỏ dần",
            "Vòng lặp for",
            "Danh sách rỗng",
            "Chuỗi dài"
          ],
          "answer": 0
        },
        {
          "id": "q2",
          "q": "Chia để trị làm gì?",
          "options": [
            "Chia bài toán lớn thành bài toán con giống hệt nhưng nhỏ hơn",
            "Chia list thành hai nửa bằng nhau mọi lúc",
            "Chỉ dùng cho sắp xếp",
            "Bỏ qua bài toán con"
          ],
          "answer": 0
        }
      ]
    }
  },
  {
    "id": "c36",
    "title": "Chương 36: Lập trình hướng đối tượng mô phỏng",
    "theory": "Chương này luyện tư duy hướng đối tượng bằng dict và hàm, nền tảng trước khi học cú pháp class trong bài học Lập trình hướng đối tượng ở mục Bài học: một đối tượng là một dict chứa các trường, một phương thức là một hàm nhận dict đó làm đối số, hàm tạo là hàm trả về dict mới. Kế thừa được mô phỏng bằng cách sao chép các trường của đối tượng cha rồi thêm trường mới, đa hình được mô phỏng bằng cách chọn hành vi theo loại đối tượng. Học xong chương này, sang Python thật Võ chỉ cần đổi dict thành class và hàm thành phương thức, tư duy giữ nguyên. Lỗi thường gặp là quên hàm phải nhận đúng đối tượng cần sửa, và tưởng sao chép dict là tạo đối tượng mới trong khi chỉ là tham chiếu.",
    "example": "def tao_sv(ten, diem):\n    return {\"ten\": ten, \"diem\": diem}\nsv = tao_sv(\"An\", 9)\nprint(sv[\"diem\"])",
    "exercises": [
      {
        "id": "c36e1",
        "title": "Bài 36.1: Đối tượng là dict",
        "prompt": "Cho sv = {\"ten\": \"An\", \"diem\": 9}. In tên của đối tượng.",
        "starter": "",
        "expectedOutput": "An",
        "sample": "sv = {\"ten\": \"An\", \"diem\": 9}\nprint(sv[\"ten\"])",
        "require": [
          "dict"
        ]
      },
      {
        "id": "c36e2",
        "title": "Bài 36.2: Phương thức là hàm",
        "prompt": "Cho sv như bài 36.1. Viết hàm chao(sv) trả về \"Xin chao \" + tên rồi in chao(sv).",
        "starter": "",
        "expectedOutput": "Xin chao An",
        "sample": "sv = {\"ten\": \"An\", \"diem\": 9}\ndef chao(sv):\n    return \"Xin chao \" + sv[\"ten\"]\nprint(chao(sv))",
        "require": [
          "function",
          "dict"
        ]
      },
      {
        "id": "c36e3",
        "title": "Bài 36.3: Hàm tạo đối tượng",
        "prompt": "Viết hàm tao_sv(ten, diem) trả về dict có hai khóa ten và diem, tạo sv = tao_sv(\"An\", 9) rồi in điểm.",
        "starter": "",
        "expectedOutput": "9",
        "sample": "def tao_sv(ten, diem):\n    return {\"ten\": ten, \"diem\": diem}\nsv = tao_sv(\"An\", 9)\nprint(sv[\"diem\"])",
        "require": [
          "function",
          "dict"
        ]
      },
      {
        "id": "c36e4",
        "title": "Bài 36.4: Phương thức sửa đối tượng",
        "prompt": "Cho sv = {\"ten\": \"An\", \"diem\": 8}. Viết hàm tang_diem(sv, them) cộng thêm vào trường diem, gọi tang_diem(sv, 1) rồi in điểm mới.",
        "starter": "",
        "expectedOutput": "9",
        "sample": "sv = {\"ten\": \"An\", \"diem\": 8}\ndef tang_diem(sv, them):\n    sv[\"diem\"] = sv[\"diem\"] + them\ntang_diem(sv, 1)\nprint(sv[\"diem\"])",
        "require": [
          "function",
          "dict"
        ]
      },
      {
        "id": "c36e5",
        "title": "Bài 36.5: Hàm lấy trường",
        "prompt": "Cho sv như bài 36.4. Viết hàm lay_ten(sv) trả về tên rồi in lay_ten(sv).",
        "starter": "",
        "expectedOutput": "An",
        "sample": "sv = {\"ten\": \"An\", \"diem\": 9}\ndef lay_ten(sv):\n    return sv[\"ten\"]\nprint(lay_ten(sv))",
        "require": [
          "function",
          "dict"
        ]
      },
      {
        "id": "c36e6",
        "title": "Bài 36.6: Kế thừa bằng sao chép trường",
        "prompt": "Cho cha = {\"ten\": \"An\"}. Tạo con = {} rồi sao chép từng khóa của cha sang con bằng vòng lặp qua cha.keys(), thêm con[\"diem\"] = 9, in tên và điểm mỗi giá trị một dòng.",
        "starter": "",
        "expectedOutput": "An\n9",
        "sample": "cha = {\"ten\": \"An\"}\ncon = {}\nfor k in cha.keys():\n    con[k] = cha[k]\ncon[\"diem\"] = 9\nprint(con[\"ten\"])\nprint(con[\"diem\"])",
        "require": [
          "dict",
          "for"
        ]
      },
      {
        "id": "c36e7",
        "title": "Bài 36.7: Đa hình theo loại",
        "prompt": "Viết hàm tieng_keu(loai): nếu loai == \"cho\" trả về \"Gau\", ngược lại trả về \"Meo\". In tieng_keu(\"cho\") ở dòng 1 và tieng_keu(\"meo\") ở dòng 2.",
        "starter": "",
        "expectedOutput": "Gau\nMeo",
        "sample": "def tieng_keu(loai):\n    if loai == \"cho\":\n        return \"Gau\"\n    return \"Meo\"\nprint(tieng_keu(\"cho\"))\nprint(tieng_keu(\"meo\"))",
        "require": [
          "function",
          "if"
        ]
      },
      {
        "id": "c36e8",
        "title": "Bài 36.8: Danh sách đối tượng",
        "prompt": "Cho ds gồm An 8, Binh 6, Chi 9 dưới dạng dict. Sắp xếp giảm dần theo điểm bằng sắp xếp nổi bọt rồi in tên từng đối tượng theo thứ tự mới.",
        "starter": "",
        "expectedOutput": "Chi\nAn\nBinh",
        "sample": "ds = [{\"ten\": \"An\", \"diem\": 8}, {\"ten\": \"Binh\", \"diem\": 6}, {\"ten\": \"Chi\", \"diem\": 9}]\nfor i in range(len(ds)):\n    for j in range(len(ds) - 1):\n        if ds[j][\"diem\"] < ds[j + 1][\"diem\"]:\n            tam = ds[j]\n            ds[j] = ds[j + 1]\n            ds[j + 1] = tam\nfor s in ds:\n    print(s[\"ten\"])",
        "require": [
          "dict",
          "list",
          "for",
          "if"
        ]
      },
      {
        "id": "c36e9",
        "title": "Bài 36.9: Tài khoản ngân hàng",
        "prompt": "Viết hàm tao_tk(so_du) trả về dict, hàm nap(tk, tien) cộng tiền, hàm rut(tk, tien) trừ tiền nếu đủ số dư. Tạo tk 50, nạp 100, rút 30 rồi in số dư.",
        "starter": "",
        "expectedOutput": "120",
        "sample": "def tao_tk(so_du):\n    return {\"so_du\": so_du}\ndef nap(tk, tien):\n    tk[\"so_du\"] = tk[\"so_du\"] + tien\ndef rut(tk, tien):\n    if tk[\"so_du\"] >= tien:\n        tk[\"so_du\"] = tk[\"so_du\"] - tien\ntk = tao_tk(50)\nnap(tk, 100)\nrut(tk, 30)\nprint(tk[\"so_du\"])",
        "require": [
          "function",
          "dict",
          "if"
        ]
      },
      {
        "id": "c36e10",
        "title": "Bài 36.10: Bộ đếm dùng chung",
        "prompt": "Cho dem = {\"so\": 0}. Viết hàm tang(dem) cộng 1 vào trường so, gọi 3 lần rồi in dem[\"so\"].",
        "starter": "",
        "expectedOutput": "3",
        "sample": "dem = {\"so\": 0}\ndef tang(dem):\n    dem[\"so\"] = dem[\"so\"] + 1\ntang(dem)\ntang(dem)\ntang(dem)\nprint(dem[\"so\"])",
        "require": [
          "function",
          "dict"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Viết hàm tao_sv(ten, diem) trả về dict rồi tạo sv = tao_sv(\"An\", 9) và in điểm.",
        "expectedOutput": "9",
        "sample": "def tao_sv(ten, diem):\n    return {\"ten\": ten, \"diem\": diem}\nsv = tao_sv(\"An\", 9)\nprint(sv[\"diem\"])",
        "require": [
          "function",
          "dict"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Trong mô phỏng này, đối tượng được biểu diễn bằng gì?",
          "options": [
            "Một dict chứa các trường",
            "Một list rỗng",
            "Một chuỗi",
            "Một số nguyên"
          ],
          "answer": 0
        },
        {
          "id": "q2",
          "q": "Phương thức trong mô phỏng này là gì?",
          "options": [
            "Một hàm nhận dict đối tượng làm đối số",
            "Một khóa trong dict",
            "Một vòng lặp",
            "Một file riêng"
          ],
          "answer": 0
        }
      ]
    }
  },
  {
    "id": "c37",
    "title": "Chương 37: Đồ án tổng hợp nâng cao",
    "theory": "Đồ án nâng cao gộp nhiều kỹ năng đã học vào một chương trình: tìm kiếm theo từ khóa, gợi ý theo độ tương đồng, gộp nhóm rồi sắp xếp nhóm theo tổng, đường đi ngắn nhất bằng BFS, phân tích tần suất từ, doanh thu theo sản phẩm, và dùng bộ nhớ đệm (cache) để khỏi tính lại. Mỗi bài đều bắt đầu từ dữ liệu mẫu cho sẵn, viết code tính ra kết quả, rồi in đúng định dạng đề yêu cầu. Lỗi thường gặp ở đồ án là làm đúng từng phần nhỏ nhưng quên gộp lại thành đáp án cuối, và in cả cấu trúc thay vì in đúng từng dòng đề cần.",
    "example": "ds = [{\"ten\": \"A\", \"nd\": \"hoc python co ban\"}, {\"ten\": \"B\", \"nd\": \"hoc toan\"}]\nfor d in ds:\n    if \"python\" in d[\"nd\"]:\n        print(d[\"ten\"])",
    "exercises": [
      {
        "id": "c37e1",
        "title": "Bài 37.1: Tìm kiếm tài liệu",
        "prompt": "Cho ds gồm A có nội dung hoc python co ban và B có nội dung hoc toan. In tên tài liệu có chứa từ python.",
        "starter": "",
        "expectedOutput": "A",
        "sample": "ds = [{\"ten\": \"A\", \"nd\": \"hoc python co ban\"}, {\"ten\": \"B\", \"nd\": \"hoc toan\"}]\nfor d in ds:\n    if \"python\" in d[\"nd\"]:\n        print(d[\"ten\"])",
        "require": [
          "dict",
          "for",
          "if"
        ]
      },
      {
        "id": "c37e2",
        "title": "Bài 37.2: Gợi ý theo sở thích chung",
        "prompt": "Cho sở thích của người dùng là [\"python\", \"toan\"]. Các món: X có [\"python\"], Y có [\"toan\", \"python\"], Z có [\"ly\"]. Đếm sở thích chung của từng món rồi in tên món có số chung lớn nhất.",
        "starter": "",
        "expectedOutput": "Y",
        "sample": "user = [\"python\", \"toan\"]\nmon = [{\"ten\": \"X\", \"st\": [\"python\"]}, {\"ten\": \"Y\", \"st\": [\"toan\", \"python\"]}, {\"ten\": \"Z\", \"st\": [\"ly\"]}]\nten_max = \"\"\ndiem_max = -1\nfor m in mon:\n    dem = 0\n    for s in m[\"st\"]:\n        if s in user:\n            dem += 1\n    if dem > diem_max:\n        diem_max = dem\n        ten_max = m[\"ten\"]\nprint(ten_max)",
        "require": [
          "dict",
          "for",
          "if"
        ]
      },
      {
        "id": "c37e3",
        "title": "Bài 37.3: Sắp xếp nhóm theo tổng",
        "prompt": "Cho ten = [\"A\", \"B\"] và tong = [17, 6] song song nhau. Sắp xếp giảm dần theo tổng bằng cách đổi chỗ cả hai list rồi in ten.",
        "starter": "",
        "expectedOutput": "['A', 'B']",
        "sample": "ten = [\"A\", \"B\"]\ntong = [17, 6]\nfor i in range(len(tong)):\n    for j in range(len(tong) - 1):\n        if tong[j] < tong[j + 1]:\n            tam = tong[j]\n            tong[j] = tong[j + 1]\n            tong[j + 1] = tam\n            tam2 = ten[j]\n            ten[j] = ten[j + 1]\n            ten[j + 1] = tam2\nprint(ten)",
        "require": [
          "list",
          "for",
          "if"
        ]
      },
      {
        "id": "c37e4",
        "title": "Bài 37.4: Đường đi ngắn nhất bằng BFS",
        "prompt": "Cho đồ thị {\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [], \"D\": []}. Tính khoảng cách BFS từ A tới D bằng dict khoảng cách và hàng đợi theo chỉ số, in khoảng cách tới D.",
        "starter": "",
        "expectedOutput": "2",
        "sample": "do_thi = {\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [], \"D\": []}\nkc = {\"A\": 0}\nhang = [\"A\"]\ndau = 0\nwhile dau < len(hang):\n    x = hang[dau]\n    dau += 1\n    for k in do_thi[x]:\n        if k in kc:\n            continue\n        kc[k] = kc[x] + 1\n        hang.append(k)\nprint(kc[\"D\"])",
        "require": [
          "dict",
          "while",
          "for",
          "if"
        ]
      },
      {
        "id": "c37e5",
        "title": "Bài 37.5: k-NN nhiều đặc trưng",
        "prompt": "Cho các điểm [x, y, nhãn]: [1, 1, 0], [2, 2, 1], [5, 5, 1]. Điểm mới là [3, 3]. Tính khoảng cách bình phương theo cả x và y, in nhãn của điểm gần nhất.",
        "starter": "",
        "expectedOutput": "1",
        "sample": "ds = [[1, 1, 0], [2, 2, 1], [5, 5, 1]]\nmoi_x = 3\nmoi_y = 3\nkc_min = 100\nnhan = 0\nfor d in ds:\n    kc = (moi_x - d[0]) ** 2 + (moi_y - d[1]) ** 2\n    if kc < kc_min:\n        kc_min = kc\n        nhan = d[2]\nprint(nhan)",
        "require": [
          "for",
          "if"
        ]
      },
      {
        "id": "c37e6",
        "title": "Bài 37.6: Từ xuất hiện nhiều nhất",
        "prompt": "Cho văn bản \"python java python\". Tách từ, đếm bằng dict rồi in từ xuất hiện nhiều nhất.",
        "starter": "",
        "expectedOutput": "python",
        "sample": "vb = \"python java python\"\nds = vb.split(\" \")\ndem = {}\nfor w in ds:\n    dem[w] = dem.get(w, 0) + 1\ntu_max = \"\"\nsl_max = -1\nfor w in dem.keys():\n    if dem[w] > sl_max:\n        sl_max = dem[w]\n        tu_max = w\nprint(tu_max)",
        "require": [
          "dict",
          "for",
          "if"
        ]
      },
      {
        "id": "c37e7",
        "title": "Bài 37.7: Sản phẩm doanh thu cao nhất",
        "prompt": "Cho đơn hàng gồm Vo giá 15000 số lượng 2, But giá 5000 số lượng 3, Vo giá 15000 số lượng 1. Gộp doanh thu theo tên rồi in tên sản phẩm có doanh thu cao nhất ở dòng 1 và doanh thu đó ở dòng 2.",
        "starter": "",
        "expectedOutput": "Vo\n45000",
        "sample": "ds = [{\"ten\": \"Vo\", \"gia\": 15000, \"sl\": 2}, {\"ten\": \"But\", \"gia\": 5000, \"sl\": 3}, {\"ten\": \"Vo\", \"gia\": 15000, \"sl\": 1}]\ndt = {}\nfor d in ds:\n    dt[d[\"ten\"]] = dt.get(d[\"ten\"], 0) + d[\"gia\"] * d[\"sl\"]\nten_max = \"\"\nmax_dt = -1\nfor ten in dt.keys():\n    if dt[ten] > max_dt:\n        max_dt = dt[ten]\n        ten_max = ten\nprint(ten_max)\nprint(max_dt)",
        "require": [
          "dict",
          "for",
          "if"
        ]
      },
      {
        "id": "c37e8",
        "title": "Bài 37.8: Tìm giờ trống",
        "prompt": "Cho các giờ bận là [9, 10]. Duyệt các giờ từ 8 đến 11, in giờ đầu tiên không bận rồi dừng bằng break.",
        "starter": "",
        "expectedOutput": "8",
        "sample": "ban = [9, 10]\nfor h in range(8, 12):\n    if h in ban:\n        continue\n    print(h)\n    break",
        "require": [
          "for",
          "range",
          "if"
        ]
      },
      {
        "id": "c37e9",
        "title": "Bài 37.9: Bộ nhớ đệm",
        "prompt": "Cho các truy vấn [2, 3, 2]. Dùng dict cache: nếu truy vấn đã có thì in giá trị đã lưu, ngược lại tính bình phương, lưu rồi in. In 3 dòng kết quả.",
        "starter": "",
        "expectedOutput": "4\n9\n4",
        "sample": "cache = {}\nfor q in [2, 3, 2]:\n    if q in cache:\n        print(cache[q])\n    else:\n        cache[q] = q * q\n        print(cache[q])",
        "require": [
          "dict",
          "for",
          "if"
        ]
      },
      {
        "id": "c37e10",
        "title": "Bài 37.10: Báo cáo tổng hợp cuối khóa",
        "prompt": "Cho ds sinh viên gồm An lớp A điểm 8, Binh lớp B điểm 6, Chi lớp A điểm 9. In 4 dòng: số sinh viên, điểm trung bình nguyên, tên điểm cao nhất, số sinh viên lớp A.",
        "starter": "",
        "expectedOutput": "3\n7\nChi\n2",
        "sample": "ds = [{\"ten\": \"An\", \"lop\": \"A\", \"diem\": 8}, {\"ten\": \"Binh\", \"lop\": \"B\", \"diem\": 6}, {\"ten\": \"Chi\", \"lop\": \"A\", \"diem\": 9}]\ntong = 0\ndem_a = 0\nten_max = ds[0][\"ten\"]\ndiem_max = ds[0][\"diem\"]\nfor s in ds:\n    tong += s[\"diem\"]\n    if s[\"lop\"] == \"A\":\n        dem_a += 1\n    if s[\"diem\"] > diem_max:\n        diem_max = s[\"diem\"]\n        ten_max = s[\"ten\"]\nprint(len(ds))\nprint(tong // len(ds))\nprint(ten_max)\nprint(dem_a)",
        "require": [
          "dict",
          "for",
          "if"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Cho ds sinh viên gồm An 8, Binh 6, Chi 9. In 2 dòng: điểm trung bình nguyên và tên điểm cao nhất.",
        "expectedOutput": "7\nChi",
        "sample": "ds = [{\"ten\": \"An\", \"diem\": 8}, {\"ten\": \"Binh\", \"diem\": 6}, {\"ten\": \"Chi\", \"diem\": 9}]\ntong = 0\nten_max = ds[0][\"ten\"]\ndiem_max = ds[0][\"diem\"]\nfor s in ds:\n    tong += s[\"diem\"]\n    if s[\"diem\"] > diem_max:\n        diem_max = s[\"diem\"]\n        ten_max = s[\"ten\"]\nprint(tong // len(ds))\nprint(ten_max)",
        "require": [
          "dict",
          "for",
          "if"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Bộ nhớ đệm (cache) dùng để làm gì?",
          "options": [
            "Tính lại mọi lần",
            "Lưu kết quả đã tính để khỏi tính lại",
            "Xóa dữ liệu",
            "Sắp xếp dữ liệu"
          ],
          "answer": 1
        },
        {
          "id": "q2",
          "q": "Đường đi ngắn nhất trên đồ thị không trọng số thường dùng thuật toán nào?",
          "options": [
            "BFS",
            "Sắp xếp nhanh",
            "Tìm kiếm nhị phân",
            "Đệ quy Fibonacci"
          ],
          "answer": 0
        }
      ]
    }
  },
  {
    "id": "c38",
    "title": "Chương 38: Tư duy AI nhập môn — dữ liệu, đặc trưng và nhãn",
    "theory": "Mọi hệ thống AI bắt đầu từ dữ liệu. Một mẫu dữ liệu gồm các đặc trưng (feature) là những con số hoặc chữ mô tả sự vật, và có thể kèm nhãn (label) là đáp án đúng mà ta muốn máy dự đoán. Trước khi dạy máy, ta phải đếm, làm sạch, chuẩn hóa dữ liệu và chia thành tập huấn luyện (để học) và tập kiểm tra (để đo). Tư duy quan trọng nhất của người làm AI là luôn hỏi: dữ liệu này nói lên điều gì, thiếu gì, lệch ở đâu. Lỗi thường gặp là trộn nhãn vào đặc trưng và dùng dữ liệu kiểm tra để huấn luyện.",
    "example": "nhan = [\"mèo\", \"chó\", \"mèo\"]\ndem = {}\nfor n in nhan:\n    dem[n] = dem.get(n, 0) + 1\nprint(dem[\"mèo\"])",
    "exercises": [
      {
        "id": "c38e1",
        "title": "Bài 38.1: Một mẫu dữ liệu",
        "prompt": "Tạo từ điển mau gồm hai đặc trưng: \"chieu_cao\" bằng 170 và \"can_nang\" bằng 65. In ra số đặc trưng của mẫu bằng len().",
        "starter": "",
        "expectedOutput": "2",
        "sample": "mau = {\"chieu_cao\": 170, \"can_nang\": 65}\nprint(len(mau))",
        "require": [
          "dict"
        ]
      },
      {
        "id": "c38e2",
        "title": "Bài 38.2: Tạo đặc trưng mới",
        "prompt": "Từ chieu_cao = 170 (cm) và can_nang = 65 (kg), tạo đặc trưng chỉ số khối bmi = can_nang * 10000 // (chieu_cao ** 2) rồi in bmi. Đây là cách người làm AI \"chế\" thêm đặc trưng từ dữ liệu có sẵn.",
        "starter": "",
        "expectedOutput": "22",
        "sample": "chieu_cao = 170\ncan_nang = 65\nbmi = can_nang * 10000 // (chieu_cao ** 2)\nprint(bmi)",
        "require": [
          "variable"
        ]
      },
      {
        "id": "c38e3",
        "title": "Bài 38.3: Đếm một nhãn",
        "prompt": "Cho nhan = [\"mèo\", \"chó\", \"mèo\", \"mèo\"]. Dùng vòng lặp for và if đếm số nhãn \"mèo\" rồi in kết quả.",
        "starter": "",
        "expectedOutput": "3",
        "sample": "nhan = [\"mèo\", \"chó\", \"mèo\", \"mèo\"]\nso_meo = 0\nfor n in nhan:\n    if n == \"mèo\":\n        so_meo += 1\nprint(so_meo)",
        "require": [
          "for",
          "if"
        ]
      },
      {
        "id": "c38e4",
        "title": "Bài 38.4: Đếm mọi nhãn bằng từ điển",
        "prompt": "Cho nhan = [\"mèo\", \"chó\", \"mèo\", \"mèo\"]. Dùng từ điển dem và dem.get để đếm từng nhãn, rồi in số \"mèo\" ở dòng 1 và số \"chó\" ở dòng 2.",
        "starter": "",
        "expectedOutput": "3\n1",
        "sample": "nhan = [\"mèo\", \"chó\", \"mèo\", \"mèo\"]\ndem = {}\nfor n in nhan:\n    dem[n] = dem.get(n, 0) + 1\nprint(dem[\"mèo\"])\nprint(dem[\"chó\"])",
        "require": [
          "dict",
          "for"
        ]
      },
      {
        "id": "c38e5",
        "title": "Bài 38.5: Lớp đa số",
        "prompt": "Cho nhan = [\"a\", \"b\", \"a\", \"c\", \"a\", \"b\"]. Đếm số lần xuất hiện của từng nhãn bằng từ điển rồi in nhãn xuất hiện nhiều nhất (lớp đa số). Mô hình ngây thơ nhất luôn đoán lớp này.",
        "starter": "",
        "expectedOutput": "a",
        "sample": "nhan = [\"a\", \"b\", \"a\", \"c\", \"a\", \"b\"]\ndem = {}\nfor n in nhan:\n    dem[n] = dem.get(n, 0) + 1\ntot = \"\"\nso_tot = 0\nfor k in dem.keys():\n    if dem[k] > so_tot:\n        so_tot = dem[k]\n        tot = k\nprint(tot)",
        "require": [
          "dict",
          "for",
          "if"
        ]
      },
      {
        "id": "c38e6",
        "title": "Bài 38.6: Tách đặc trưng và nhãn",
        "prompt": "Cho ds = [[170, 65, 1], [160, 50, 0], [180, 80, 1]] trong đó hai số đầu là đặc trưng, số cuối là nhãn. Tạo list y chứa nhãn của từng dòng rồi in y.",
        "starter": "",
        "expectedOutput": "[1, 0, 1]",
        "sample": "ds = [[170, 65, 1], [160, 50, 0], [180, 80, 1]]\ny = []\nfor d in ds:\n    y.append(d[-1])\nprint(y)",
        "require": [
          "for",
          "list"
        ]
      },
      {
        "id": "c38e7",
        "title": "Bài 38.7: Xử lý dữ liệu thiếu",
        "prompt": "Cho du_lieu = [5, None, 7, None, 9] (None là ô bị thiếu). Tính trung bình nguyên (tổng // số lượng) của các giá trị CÓ dữ liệu, rồi in kết quả.",
        "starter": "",
        "expectedOutput": "7",
        "sample": "du_lieu = [5, None, 7, None, 9]\ntong = 0\nso = 0\nfor x in du_lieu:\n    if x != None:\n        tong += x\n        so += 1\nprint(tong // so)",
        "require": [
          "for",
          "if"
        ]
      },
      {
        "id": "c38e8",
        "title": "Bài 38.8: Chuẩn hóa min-max",
        "prompt": "Cho xs = [10, 20, 30, 50]. Tự tìm giá trị nhỏ nhất và lớn nhất bằng vòng lặp, rồi in list các giá trị đã chuẩn hóa về thang 0..100 theo công thức (x - nhỏ nhất) * 100 // (lớn nhất - nhỏ nhất).",
        "starter": "",
        "expectedOutput": "[0, 25, 50, 100]",
        "sample": "xs = [10, 20, 30, 50]\nthap = xs[0]\ncao = xs[0]\nfor x in xs:\n    if x < thap:\n        thap = x\n    if x > cao:\n        cao = x\nkq = []\nfor x in xs:\n    kq.append((x - thap) * 100 // (cao - thap))\nprint(kq)",
        "require": [
          "for",
          "if",
          "list"
        ]
      },
      {
        "id": "c38e9",
        "title": "Bài 38.9: Chia tập huấn luyện và kiểm tra",
        "prompt": "Cho du = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]. Dùng cắt lát chia 80% đầu làm train và 20% cuối làm test, rồi in len(train) ở dòng 1 và len(test) ở dòng 2.",
        "starter": "",
        "expectedOutput": "8\n2",
        "sample": "du = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\ntrain = du[:8]\ntest = du[8:]\nprint(len(train))\nprint(len(test))",
        "require": [
          "slice"
        ]
      },
      {
        "id": "c38e10",
        "title": "Bài 38.10: Hàm tiền xử lý văn bản",
        "prompt": "Viết hàm chuan_hoa(van_ban) trả về văn bản đã bỏ khoảng trắng hai đầu và chuyển thành chữ thường. Gọi hàm với \"  Xin CHÀO  \" và in kết quả.",
        "starter": "",
        "expectedOutput": "xin chào",
        "sample": "def chuan_hoa(van_ban):\n    return van_ban.strip().lower()\n\nprint(chuan_hoa(\"  Xin CHÀO  \"))",
        "require": [
          "function",
          "string"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Cho nhan = [\"x\", \"y\", \"y\", \"x\", \"y\"]. Đếm số lần xuất hiện từng nhãn bằng từ điển rồi in nhãn xuất hiện nhiều nhất.",
        "expectedOutput": "y",
        "sample": "nhan = [\"x\", \"y\", \"y\", \"x\", \"y\"]\ndem = {}\nfor n in nhan:\n    dem[n] = dem.get(n, 0) + 1\ntot = \"\"\nso_tot = 0\nfor k in dem.keys():\n    if dem[k] > so_tot:\n        so_tot = dem[k]\n        tot = k\nprint(tot)",
        "require": [
          "dict",
          "for"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Đặc trưng (feature) trong AI là gì?",
          "options": [
            "Đáp án cần dự đoán",
            "Thông tin mô tả một mẫu dữ liệu dùng làm đầu vào",
            "Tên của mô hình",
            "Điểm số của giáo viên"
          ],
          "answer": 1
        },
        {
          "id": "q2",
          "q": "Vì sao phải có tập kiểm tra tách riêng khỏi tập huấn luyện?",
          "options": [
            "Để mô hình học nhanh hơn",
            "Để đo mô hình trên dữ liệu chưa từng thấy",
            "Để giảm dung lượng file",
            "Để có nhiều nhãn hơn"
          ],
          "answer": 1
        }
      ]
    }
  },
  {
    "id": "c39",
    "title": "Chương 39: Hệ thống dựa trên luật và hệ chuyên gia",
    "theory": "Trước khi có học máy, AI chủ yếu là các hệ thống luật: chuyên gia viết ra quy tắc dạng NẾU điều kiện THÌ kết luận, máy chỉ việc áp dụng. Luật dễ hiểu, dễ giải thích và kiểm soát, nhưng khó mở rộng vì thế giới có quá nhiều ngoại lệ, và luật không tự cải thiện khi gặp dữ liệu mới. Chương này luyện cách chuyển tri thức thành if/elif, kết hợp điều kiện bằng and/or, lọc từ khóa, chấm điểm luật và đo xem bộ luật đúng bao nhiêu phần trăm. Lỗi thường gặp là xếp luật sai thứ tự (luật rộng đứng trước chặn mất luật hẹp) và viết = thay vì ==.",
    "example": "diem = 65\nif diem >= 80:\n    print(\"cao\")\nelif diem >= 50:\n    print(\"trung bình\")\nelse:\n    print(\"thấp\")",
    "exercises": [
      {
        "id": "c39e1",
        "title": "Bài 39.1: Luật đơn",
        "prompt": "Cho nhiet_do = 39. Nếu nhiet_do >= 38 thì in \"sốt\", ngược lại in \"bình thường\".",
        "starter": "",
        "expectedOutput": "sốt",
        "sample": "nhiet_do = 39\nif nhiet_do >= 38:\n    print(\"sốt\")\nelse:\n    print(\"bình thường\")",
        "require": [
          "if"
        ]
      },
      {
        "id": "c39e2",
        "title": "Bài 39.2: Luật nhiều mức",
        "prompt": "Cho diem_rui_ro = 65. Dùng if/elif/else: từ 80 trở lên in \"cao\", từ 50 trở lên in \"trung bình\", còn lại in \"thấp\".",
        "starter": "",
        "expectedOutput": "trung bình",
        "sample": "diem_rui_ro = 65\nif diem_rui_ro >= 80:\n    print(\"cao\")\nelif diem_rui_ro >= 50:\n    print(\"trung bình\")\nelse:\n    print(\"thấp\")",
        "require": [
          "if"
        ]
      },
      {
        "id": "c39e3",
        "title": "Bài 39.3: Kết hợp luật bằng and / or",
        "prompt": "Cho ho = True, sot = True, kho_tho = False. Luật: nếu (ho và sot) hoặc kho_tho thì in \"Đi khám\", ngược lại in \"Theo dõi tại nhà\".",
        "starter": "",
        "expectedOutput": "Đi khám",
        "sample": "ho = True\nsot = True\nkho_tho = False\nif (ho and sot) or kho_tho:\n    print(\"Đi khám\")\nelse:\n    print(\"Theo dõi tại nhà\")",
        "require": [
          "if"
        ]
      },
      {
        "id": "c39e4",
        "title": "Bài 39.4: Lọc thư rác bằng từ khóa",
        "prompt": "Cho thu = \"trúng thưởng ngay hôm nay\" và tu_khoa = [\"trúng thưởng\", \"miễn phí\", \"vay nhanh\"]. Dùng for và toán tử in: nếu có từ khóa nào nằm trong thư thì in \"spam\", không thì in \"bình thường\".",
        "starter": "",
        "expectedOutput": "spam",
        "sample": "thu = \"trúng thưởng ngay hôm nay\"\ntu_khoa = [\"trúng thưởng\", \"miễn phí\", \"vay nhanh\"]\nla_spam = False\nfor tu in tu_khoa:\n    if tu in thu:\n        la_spam = True\nif la_spam:\n    print(\"spam\")\nelse:\n    print(\"bình thường\")",
        "require": [
          "for",
          "if"
        ]
      },
      {
        "id": "c39e5",
        "title": "Bài 39.5: Chấm điểm bằng nhiều luật",
        "prompt": "Cho thu = \"miễn phí vay nhanh cho bạn\" và tu_khoa = [\"trúng thưởng\", \"miễn phí\", \"vay nhanh\"]. Đếm có bao nhiêu từ khóa khớp rồi in số đó (điểm nghi ngờ spam).",
        "starter": "",
        "expectedOutput": "2",
        "sample": "thu = \"miễn phí vay nhanh cho bạn\"\ntu_khoa = [\"trúng thưởng\", \"miễn phí\", \"vay nhanh\"]\ndiem = 0\nfor tu in tu_khoa:\n    if tu in thu:\n        diem += 1\nprint(diem)",
        "require": [
          "for",
          "if"
        ]
      },
      {
        "id": "c39e6",
        "title": "Bài 39.6: Chatbot theo từ khóa",
        "prompt": "Cho cau = \"cho mình hỏi giá\" và luat = {\"giá\": \"Bảng giá ở mục Giá\", \"địa chỉ\": \"Cửa hàng ở Hà Nội\"}. Duyệt các khóa của luat, khóa nào nằm trong câu thì in câu trả lời tương ứng.",
        "starter": "",
        "expectedOutput": "Bảng giá ở mục Giá",
        "sample": "cau = \"cho mình hỏi giá\"\nluat = {\"giá\": \"Bảng giá ở mục Giá\", \"địa chỉ\": \"Cửa hàng ở Hà Nội\"}\nfor k in luat.keys():\n    if k in cau:\n        print(luat[k])",
        "require": [
          "dict",
          "for",
          "if"
        ]
      },
      {
        "id": "c39e7",
        "title": "Bài 39.7: Luật ưu tiên",
        "prompt": "Cho cau = \"giá và địa chỉ\" và luat = {\"giá\": \"A\", \"địa chỉ\": \"B\"}. Chatbot chỉ trả lời luật khớp ĐẦU TIÊN rồi dừng bằng break. In ra câu trả lời đó.",
        "starter": "",
        "expectedOutput": "A",
        "sample": "cau = \"giá và địa chỉ\"\nluat = {\"giá\": \"A\", \"địa chỉ\": \"B\"}\nfor k in luat.keys():\n    if k in cau:\n        print(luat[k])\n        break",
        "require": [
          "dict",
          "for",
          "if"
        ]
      },
      {
        "id": "c39e8",
        "title": "Bài 39.8: Hệ chuyên gia chẩn đoán",
        "prompt": "Cho benh = {\"cảm\": [\"ho\", \"sốt\", \"sổ mũi\"], \"dị ứng\": [\"ngứa\", \"sổ mũi\"]} và trieu_chung = [\"ho\", \"sốt\"]. Với mỗi bệnh đếm số triệu chứng khớp, rồi in tên bệnh có nhiều triệu chứng khớp nhất.",
        "starter": "",
        "expectedOutput": "cảm",
        "sample": "benh = {\"cảm\": [\"ho\", \"sốt\", \"sổ mũi\"], \"dị ứng\": [\"ngứa\", \"sổ mũi\"]}\ntrieu_chung = [\"ho\", \"sốt\"]\ntot = \"\"\nkhop_tot = -1\nfor ten in benh.keys():\n    khop = 0\n    for t in trieu_chung:\n        if t in benh[ten]:\n            khop += 1\n    if khop > khop_tot:\n        khop_tot = khop\n        tot = ten\nprint(tot)",
        "require": [
          "dict",
          "for",
          "if"
        ]
      },
      {
        "id": "c39e9",
        "title": "Bài 39.9: Đóng gói luật thành hàm",
        "prompt": "Viết hàm duyet_vay(thu_nhap, no): nếu no * 3 > thu_nhap thì trả về \"từ chối\", ngược lại trả về \"duyệt\". Gọi hàm với (30, 5) rồi với (30, 15), mỗi kết quả in một dòng.",
        "starter": "",
        "expectedOutput": "duyệt\ntừ chối",
        "sample": "def duyet_vay(thu_nhap, no):\n    if no * 3 > thu_nhap:\n        return \"từ chối\"\n    return \"duyệt\"\n\nprint(duyet_vay(30, 5))\nprint(duyet_vay(30, 15))",
        "require": [
          "function",
          "if"
        ]
      },
      {
        "id": "c39e10",
        "title": "Bài 39.10: Đo độ chính xác của bộ luật",
        "prompt": "Cho thu = [[\"miễn phí ngay\", \"spam\"], [\"họp lúc 9h\", \"ok\"], [\"bài tập miễn phí\", \"ok\"], [\"vay nhanh\", \"spam\"]] (mỗi phần tử là [nội dung, nhãn thật]). Luật: nếu \"miễn phí\" trong nội dung thì đoán \"spam\", còn lại đoán \"ok\". Tính và in độ chính xác phần trăm nguyên. Con số này cho thấy giới hạn của luật viết tay.",
        "starter": "",
        "expectedOutput": "50",
        "sample": "thu = [[\"miễn phí ngay\", \"spam\"], [\"họp lúc 9h\", \"ok\"], [\"bài tập miễn phí\", \"ok\"], [\"vay nhanh\", \"spam\"]]\ndung = 0\nfor t in thu:\n    if \"miễn phí\" in t[0]:\n        doan = \"spam\"\n    else:\n        doan = \"ok\"\n    if doan == t[1]:\n        dung += 1\nprint(dung * 100 // len(thu))",
        "require": [
          "for",
          "if"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Cho diem_rui_ro = 45. Dùng if/elif/else: từ 80 trở lên in \"cao\", từ 50 trở lên in \"trung bình\", còn lại in \"thấp\".",
        "expectedOutput": "thấp",
        "sample": "diem_rui_ro = 45\nif diem_rui_ro >= 80:\n    print(\"cao\")\nelif diem_rui_ro >= 50:\n    print(\"trung bình\")\nelse:\n    print(\"thấp\")",
        "require": [
          "if"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Ưu điểm lớn nhất của hệ thống dựa trên luật là gì?",
          "options": [
            "Tự học từ dữ liệu mới",
            "Dễ giải thích vì mỗi quyết định đi theo một luật rõ ràng",
            "Không cần chuyên gia",
            "Luôn chính xác hơn học máy"
          ],
          "answer": 1
        },
        {
          "id": "q2",
          "q": "Khi xếp các luật if/elif, vì sao thứ tự quan trọng?",
          "options": [
            "Python chạy luật cuối trước",
            "Luật đúng đầu tiên sẽ chặn các luật phía sau",
            "Luật nào dài hơn thì thắng",
            "Thứ tự không ảnh hưởng"
          ],
          "answer": 1
        }
      ]
    }
  },
  {
    "id": "c40",
    "title": "Chương 40: Đo lường và đánh giá mô hình",
    "theory": "Một mô hình AI chỉ có giá trị khi ta đo được nó tốt đến đâu. Với bài toán phân loại, ta đếm bốn loại kết quả: TP (đoán dương, đúng), TN (đoán âm, đúng), FP (đoán dương, sai) và FN (đoán âm, sai). Từ đó tính độ chính xác (accuracy), precision (trong số đoán dương, bao nhiêu đúng), recall (trong số thật sự dương, bắt được bao nhiêu) và F1. Phải so với mô hình ngây thơ luôn đoán lớp đa số, vì khi dữ liệu lệch, accuracy cao có thể chỉ là ảo tưởng. Phải đo trên tập kiểm tra: mô hình đạt 100% khi huấn luyện nhưng thấp khi kiểm tra là đang học thuộc (overfitting). Lỗi thường gặp là chia cho 0 và chỉ nhìn mỗi accuracy.",
    "example": "that = [1, 0, 1, 1]\ndd = [1, 0, 0, 1]\ntp = 0\nfor i in range(4):\n    if that[i] == 1 and dd[i] == 1:\n        tp += 1\nprint(tp)",
    "exercises": [
      {
        "id": "c40e1",
        "title": "Bài 40.1: Đếm TP",
        "prompt": "Cho that = [1, 0, 1, 1, 0, 0] (nhãn thật) và dd = [1, 0, 0, 1, 1, 0] (mô hình đoán). Đếm TP: số mẫu mà cả nhãn thật và dự đoán đều bằng 1. In kết quả.",
        "starter": "",
        "expectedOutput": "2",
        "sample": "that = [1, 0, 1, 1, 0, 0]\ndd = [1, 0, 0, 1, 1, 0]\ntp = 0\nfor i in range(6):\n    if that[i] == 1 and dd[i] == 1:\n        tp += 1\nprint(tp)",
        "require": [
          "for",
          "range",
          "if"
        ]
      },
      {
        "id": "c40e2",
        "title": "Bài 40.2: Ma trận nhầm lẫn",
        "prompt": "Với that = [1, 0, 1, 1, 0, 0] và dd = [1, 0, 0, 1, 1, 0], đếm bốn giá trị tp, fp, fn, tn rồi in lần lượt mỗi giá trị một dòng theo đúng thứ tự đó.",
        "starter": "",
        "expectedOutput": "2\n1\n1\n2",
        "sample": "that = [1, 0, 1, 1, 0, 0]\ndd = [1, 0, 0, 1, 1, 0]\ntp = 0\nfp = 0\nfn = 0\ntn = 0\nfor i in range(6):\n    if that[i] == 1 and dd[i] == 1:\n        tp += 1\n    elif that[i] == 0 and dd[i] == 1:\n        fp += 1\n    elif that[i] == 1 and dd[i] == 0:\n        fn += 1\n    else:\n        tn += 1\nprint(tp)\nprint(fp)\nprint(fn)\nprint(tn)",
        "require": [
          "for",
          "range",
          "if"
        ]
      },
      {
        "id": "c40e3",
        "title": "Bài 40.3: Accuracy từ ma trận",
        "prompt": "Cho tp = 2, fp = 1, fn = 1, tn = 2. Tính accuracy phần trăm nguyên theo công thức (tp + tn) * 100 // (tp + tn + fp + fn) rồi in.",
        "starter": "",
        "expectedOutput": "66",
        "sample": "tp = 2\nfp = 1\nfn = 1\ntn = 2\nprint((tp + tn) * 100 // (tp + tn + fp + fn))",
        "require": [
          "variable"
        ]
      },
      {
        "id": "c40e4",
        "title": "Bài 40.4: Precision",
        "prompt": "Cho tp = 8, fp = 2. Tính precision phần trăm nguyên theo công thức tp * 100 // (tp + fp) rồi in. Precision trả lời: trong số mẫu mô hình báo dương, bao nhiêu phần trăm đúng?",
        "starter": "",
        "expectedOutput": "80",
        "sample": "tp = 8\nfp = 2\nprint(tp * 100 // (tp + fp))",
        "require": [
          "variable"
        ]
      },
      {
        "id": "c40e5",
        "title": "Bài 40.5: Recall",
        "prompt": "Cho tp = 6, fn = 2. Tính recall phần trăm nguyên theo công thức tp * 100 // (tp + fn) rồi in. Recall trả lời: trong số mẫu thật sự dương, mô hình bắt được bao nhiêu phần trăm?",
        "starter": "",
        "expectedOutput": "75",
        "sample": "tp = 6\nfn = 2\nprint(tp * 100 // (tp + fn))",
        "require": [
          "variable"
        ]
      },
      {
        "id": "c40e6",
        "title": "Bài 40.6: F1",
        "prompt": "Cho precision = 80 và recall = 60. Tính F1 nguyên theo công thức 2 * p * r // (p + r) rồi in.",
        "starter": "",
        "expectedOutput": "68",
        "sample": "p = 80\nr = 60\nprint(2 * p * r // (p + r))",
        "require": [
          "variable"
        ]
      },
      {
        "id": "c40e7",
        "title": "Bài 40.7: Mô hình ngây thơ",
        "prompt": "Cho nhan = [0] * 9 + [1] (9 nhãn 0 và 1 nhãn 1). Một mô hình ngây thơ luôn đoán 0. Đếm số nhãn 0 rồi in accuracy phần trăm nguyên của mô hình ngây thơ đó. Kết quả cao nhưng mô hình vô dụng, đó là bẫy khi dữ liệu lệch.",
        "starter": "",
        "expectedOutput": "90",
        "sample": "nhan = [0] * 9 + [1]\nso_0 = 0\nfor n in nhan:\n    if n == 0:\n        so_0 += 1\nprint(so_0 * 100 // len(nhan))",
        "require": [
          "for",
          "list"
        ]
      },
      {
        "id": "c40e8",
        "title": "Bài 40.8: Phát hiện overfitting",
        "prompt": "Cho acc_train = 100 và acc_test = 62. Tính chênh lệch gap = acc_train - acc_test. Nếu gap > 20 thì in \"overfit\", ngược lại in \"ổn\".",
        "starter": "",
        "expectedOutput": "overfit",
        "sample": "acc_train = 100\nacc_test = 62\ngap = acc_train - acc_test\nif gap > 20:\n    print(\"overfit\")\nelse:\n    print(\"ổn\")",
        "require": [
          "variable",
          "if"
        ]
      },
      {
        "id": "c40e9",
        "title": "Bài 40.9: Chọn ngưỡng quyết định",
        "prompt": "Cho diem = [0.9, 0.4, 0.7, 0.2] (điểm mô hình) và that = [1, 0, 1, 0]. Với ngưỡng 0.5, đoán 1 nếu điểm >= 0.5 ngược lại đoán 0. Tạo list dd các dự đoán rồi in dd ở dòng 1 và in accuracy phần trăm nguyên ở dòng 2.",
        "starter": "",
        "expectedOutput": "[1, 0, 1, 0]\n100",
        "sample": "diem = [0.9, 0.4, 0.7, 0.2]\nthat = [1, 0, 1, 0]\ndd = []\nfor d in diem:\n    if d >= 0.5:\n        dd.append(1)\n    else:\n        dd.append(0)\nprint(dd)\ndung = 0\nfor i in range(4):\n    if dd[i] == that[i]:\n        dung += 1\nprint(dung * 100 // 4)",
        "require": [
          "for",
          "if",
          "list"
        ]
      },
      {
        "id": "c40e10",
        "title": "Bài 40.10: Hàm đánh giá",
        "prompt": "Viết hàm accuracy(that, dd) trả về phần trăm nguyên các vị trí đoán đúng. Gọi với that = [1, 1, 0, 0, 1] và dd = [1, 0, 0, 0, 1] rồi in kết quả.",
        "starter": "",
        "expectedOutput": "80",
        "sample": "def accuracy(that, dd):\n    dung = 0\n    for i in range(len(that)):\n        if that[i] == dd[i]:\n            dung += 1\n    return dung * 100 // len(that)\n\nprint(accuracy([1, 1, 0, 0, 1], [1, 0, 0, 0, 1]))",
        "require": [
          "function",
          "for",
          "if"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Cho tp = 5 và fp = 5. Tính precision phần trăm nguyên theo công thức tp * 100 // (tp + fp) rồi in.",
        "expectedOutput": "50",
        "sample": "tp = 5\nfp = 5\nprint(tp * 100 // (tp + fp))",
        "require": [
          "variable"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Dữ liệu có 95% nhãn 0. Mô hình luôn đoán 0 đạt accuracy 95%. Kết luận đúng là gì?",
          "options": [
            "Mô hình rất tốt",
            "Accuracy đánh lừa, cần xem thêm precision và recall",
            "Cần ít dữ liệu hơn",
            "Mô hình bị thiếu nhãn 0"
          ],
          "answer": 1
        },
        {
          "id": "q2",
          "q": "Overfitting nghĩa là gì?",
          "options": [
            "Mô hình tốt trên tập huấn luyện nhưng kém trên dữ liệu mới",
            "Mô hình quá nhỏ",
            "Dữ liệu bị thiếu",
            "Mô hình chạy quá chậm"
          ],
          "answer": 0
        }
      ]
    }
  },
  {
    "id": "c41",
    "title": "Chương 41: Học máy cổ điển viết tay",
    "theory": "Chương này tự cài các thuật toán học máy kinh điển chỉ bằng vòng lặp và list để hiểu bản chất. k-NN đoán nhãn bằng cách bỏ phiếu k điểm gần nhất. Bộ phân loại tâm cụm so điểm mới với trung bình từng lớp. Hồi quy tuyến tính tìm đường thẳng khớp dữ liệu, và hàm mất mát (như tổng bình phương sai số) đo độ lệch. Gradient descent là cách máy học: lặp đi lặp lại đi ngược hướng độ dốc của hàm mất mát với bước nhảy lr (learning rate). Perceptron tự sửa trọng số mỗi khi đoán sai. k-means gom nhóm không cần nhãn bằng cách lặp gán điểm vào tâm gần nhất rồi tính lại tâm. Mẹo trong bài: vì chưa có sắp xếp cặp, ta mã hóa [khoảng cách, nhãn] thành một số khoảng_cách * 10 + nhãn để sort. Lỗi thường gặp: lr quá lớn làm gradient descent nhảy lung tung, quên cập nhật tâm cụm.",
    "example": "w = 0\nfor i in range(3):\n    w = w - 0.25 * 2 * (w - 3)\nprint(w)",
    "exercises": [
      {
        "id": "c41e1",
        "title": "Bài 41.1: k-NN với k = 3",
        "prompt": "Cho ds = [[1, 0], [2, 0], [3, 1], [6, 1], [7, 1]] (mỗi phần tử [x, nhãn]) và điểm mới moi = 4. Với mỗi điểm tính kc = (moi - x) ** 2 rồi thêm số kc * 10 + nhãn vào list ma. Sắp xếp ma, lấy 3 phần tử đầu, cộng các nhãn (ma_i % 10) lại; nếu tổng >= 2 thì in 1, ngược lại in 0.",
        "starter": "",
        "expectedOutput": "1",
        "sample": "ds = [[1, 0], [2, 0], [3, 1], [6, 1], [7, 1]]\nmoi = 4\nma = []\nfor d in ds:\n    kc = (moi - d[0]) ** 2\n    ma.append(kc * 10 + d[1])\nma.sort()\ntong = 0\nfor i in range(3):\n    tong += ma[i] % 10\nif tong >= 2:\n    print(1)\nelse:\n    print(0)",
        "require": [
          "for",
          "if",
          "sort"
        ]
      },
      {
        "id": "c41e2",
        "title": "Bài 41.2: Bộ phân loại tâm cụm",
        "prompt": "Lớp A có các giá trị a = [1, 2, 3], lớp B có b = [8, 9, 10]. Tính trung bình nguyên mỗi lớp (sum // len), rồi với điểm mới moi = 6 in \"A\" nếu moi gần tâm A hơn (so khoảng cách bình phương), ngược lại in \"B\".",
        "starter": "",
        "expectedOutput": "B",
        "sample": "a = [1, 2, 3]\nb = [8, 9, 10]\ntam_a = sum(a) // len(a)\ntam_b = sum(b) // len(b)\nmoi = 6\nif (moi - tam_a) ** 2 < (moi - tam_b) ** 2:\n    print(\"A\")\nelse:\n    print(\"B\")",
        "require": [
          "variable",
          "if"
        ]
      },
      {
        "id": "c41e3",
        "title": "Bài 41.3: Hồi quy tuyến tính",
        "prompt": "Cho xs = [1, 2, 3] và ys = [3, 5, 7]. Tính tb_x = sum(xs) // len(xs), tb_y = sum(ys) // len(ys), hệ số góc a = tử // mẫu (tử = tổng (x - tb_x) * (y - tb_y), mẫu = tổng (x - tb_x) ** 2) và hệ số chặn b = tb_y - a * tb_x. In a ở dòng 1 và b ở dòng 2.",
        "starter": "",
        "expectedOutput": "2\n1",
        "sample": "xs = [1, 2, 3]\nys = [3, 5, 7]\ntb_x = sum(xs) // len(xs)\ntb_y = sum(ys) // len(ys)\ntu = 0\nmau = 0\nfor i in range(3):\n    tu += (xs[i] - tb_x) * (ys[i] - tb_y)\n    mau += (xs[i] - tb_x) ** 2\na = tu // mau\nb = tb_y - a * tb_x\nprint(a)\nprint(b)",
        "require": [
          "for",
          "range"
        ]
      },
      {
        "id": "c41e4",
        "title": "Bài 41.4: Hàm mất mát",
        "prompt": "Cho dd = [2, 4, 6] (dự đoán) và that = [3, 4, 8] (thật). Tính tổng bình phương sai số SSE = tổng (dd_i - that_i) ** 2 rồi in. Mô hình càng tốt thì SSE càng nhỏ.",
        "starter": "",
        "expectedOutput": "5",
        "sample": "dd = [2, 4, 6]\nthat = [3, 4, 8]\nsse = 0\nfor i in range(3):\n    sse += (dd[i] - that[i]) ** 2\nprint(sse)",
        "require": [
          "for",
          "range"
        ]
      },
      {
        "id": "c41e5",
        "title": "Bài 41.5: Gradient descent",
        "prompt": "Hàm mất mát f(w) = (w - 3) ** 2 có độ dốc 2 * (w - 3). Bắt đầu từ w = 0 với lr = 0.25, lặp 3 lần: w = w - lr * độ dốc. In w sau 3 lần lặp.",
        "starter": "",
        "expectedOutput": "2.625",
        "sample": "w = 0\nlr = 0.25\nfor i in range(3):\n    do_doc = 2 * (w - 3)\n    w = w - lr * do_doc\nprint(w)",
        "require": [
          "for",
          "range"
        ]
      },
      {
        "id": "c41e6",
        "title": "Bài 41.6: Perceptron học hàm AND",
        "prompt": "Dữ liệu x = [[0, 0], [0, 1], [1, 0], [1, 1]], nhãn y = [0, 0, 0, 1], bắt đầu w1 = 0, w2 = 0, b = 0, tốc độ học 1. Lặp 10 vòng, mỗi vòng duyệt từng mẫu: dự đoán 1 nếu w1 * x1 + w2 * x2 + b >= 0 ngược lại 0; nếu đoán sai thì sai_so = nhãn - dự đoán rồi w1 += sai_so * x1, w2 += sai_so * x2, b += sai_so. In w1, w2, b trên cùng một dòng cách nhau dấu cách.",
        "starter": "",
        "expectedOutput": "2 1 -3",
        "sample": "x = [[0, 0], [0, 1], [1, 0], [1, 1]]\ny = [0, 0, 0, 1]\nw1 = 0\nw2 = 0\nb = 0\nfor vong in range(10):\n    for i in range(4):\n        tong = w1 * x[i][0] + w2 * x[i][1] + b\n        if tong >= 0:\n            doan = 1\n        else:\n            doan = 0\n        sai_so = y[i] - doan\n        w1 += sai_so * x[i][0]\n        w2 += sai_so * x[i][1]\n        b += sai_so\nprint(w1, w2, b)",
        "require": [
          "for",
          "range",
          "if"
        ]
      },
      {
        "id": "c41e7",
        "title": "Bài 41.7: k-means một vòng",
        "prompt": "Cho du_lieu = [1, 2, 9, 10] và hai tâm ban đầu t1 = 1, t2 = 10. Gán mỗi điểm vào tâm gần hơn (so khoảng cách bình phương), rồi tính tâm mới là trung bình (tổng / số điểm) của từng cụm. In tâm mới của cụm 1 ở dòng 1 và cụm 2 ở dòng 2.",
        "starter": "",
        "expectedOutput": "1.5\n9.5",
        "sample": "du_lieu = [1, 2, 9, 10]\nt1 = 1\nt2 = 10\nc1 = []\nc2 = []\nfor x in du_lieu:\n    if (x - t1) ** 2 <= (x - t2) ** 2:\n        c1.append(x)\n    else:\n        c2.append(x)\nprint(sum(c1) / len(c1))\nprint(sum(c2) / len(c2))",
        "require": [
          "for",
          "if",
          "list"
        ]
      },
      {
        "id": "c41e8",
        "title": "Bài 41.8: Hàm k-NN tổng quát",
        "prompt": "Viết hàm knn(ds, moi, k) dùng mẹo mã hóa kc * 10 + nhãn như bài 41.1, trả về 1 nếu tổng nhãn của k điểm gần nhất * 2 > k, ngược lại 0. Với ds = [[1, 0], [2, 0], [3, 1], [6, 1], [7, 1]], gọi knn(ds, 2, 3) rồi knn(ds, 6, 3), mỗi kết quả in một dòng.",
        "starter": "",
        "expectedOutput": "0\n1",
        "sample": "def knn(ds, moi, k):\n    ma = []\n    for d in ds:\n        kc = (moi - d[0]) ** 2\n        ma.append(kc * 10 + d[1])\n    ma.sort()\n    tong = 0\n    for i in range(k):\n        tong += ma[i] % 10\n    if tong * 2 > k:\n        return 1\n    return 0\n\nds = [[1, 0], [2, 0], [3, 1], [6, 1], [7, 1]]\nprint(knn(ds, 2, 3))\nprint(knn(ds, 6, 3))",
        "require": [
          "function",
          "for",
          "sort"
        ]
      },
      {
        "id": "c41e9",
        "title": "Bài 41.9: Chọn k bằng tập kiểm tra",
        "prompt": "Dùng ds_train = [[1, 1], [2, 1], [3, 1], [7, 0], [8, 1], [9, 1]] (có một điểm nhiễu [7, 0]) và tập kiểm tra ds_test = [[7, 1], [5, 1], [9, 1], [0, 1]]. Viết hàm knn(ds, moi, k) như bài 41.8, rồi tính số mẫu kiểm tra đoán đúng với k = 1 ở dòng 1 và với k = 3 ở dòng 2 (k lớn hơn giúp bỏ phiếu lấn át điểm nhiễu).",
        "starter": "",
        "expectedOutput": "2\n4",
        "sample": "def knn(ds, moi, k):\n    ma = []\n    for d in ds:\n        kc = (moi - d[0]) ** 2\n        ma.append(kc * 10 + d[1])\n    ma.sort()\n    tong = 0\n    for i in range(k):\n        tong += ma[i] % 10\n    if tong * 2 > k:\n        return 1\n    return 0\n\nds_train = [[1, 1], [2, 1], [3, 1], [7, 0], [8, 1], [9, 1]]\nds_test = [[7, 1], [5, 1], [9, 1], [0, 1]]\nfor k in [1, 3]:\n    dung = 0\n    for t in ds_test:\n        if knn(ds_train, t[0], k) == t[1]:\n            dung += 1\n    print(dung)",
        "require": [
          "function",
          "for",
          "if"
        ]
      },
      {
        "id": "c41e10",
        "title": "Bài 41.10: Dự đoán với nhiều đặc trưng",
        "prompt": "Cho x = [[1, 2], [3, 4]] (mỗi dòng là một mẫu có 2 đặc trưng), trọng số w = [2, 1] và độ lệch b = 1. Với mỗi mẫu tính y = w[0] * x1 + w[1] * x2 + b, đưa vào list du_doan rồi in list đó.",
        "starter": "",
        "expectedOutput": "[5, 11]",
        "sample": "x = [[1, 2], [3, 4]]\nw = [2, 1]\nb = 1\ndu_doan = []\nfor m in x:\n    du_doan.append(w[0] * m[0] + w[1] * m[1] + b)\nprint(du_doan)",
        "require": [
          "for",
          "list"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Hàm mất mát f(w) = (w - 3) ** 2 có độ dốc 2 * (w - 3). Bắt đầu từ w = 0 với lr = 0.25, lặp 2 lần: w = w - lr * độ dốc. In w sau 2 lần lặp.",
        "expectedOutput": "2.25",
        "sample": "w = 0\nlr = 0.25\nfor i in range(2):\n    w = w - lr * 2 * (w - 3)\nprint(w)",
        "require": [
          "for",
          "range"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Trong gradient descent, learning rate quá lớn có thể gây ra điều gì?",
          "options": [
            "Mô hình học chính xác hơn",
            "Bước nhảy quá to nên không hội tụ",
            "Dữ liệu tự sạch hơn",
            "Không có ảnh hưởng gì"
          ],
          "answer": 1
        },
        {
          "id": "q2",
          "q": "k-means là thuật toán thuộc nhóm nào?",
          "options": [
            "Học có giám sát, cần nhãn",
            "Học không giám sát, gom nhóm không cần nhãn",
            "Học tăng cường",
            "Hệ thống luật"
          ],
          "answer": 1
        }
      ]
    }
  },
  {
    "id": "c42",
    "title": "Chương 42: Ngôn ngữ, văn bản và hệ gợi ý",
    "theory": "Máy không hiểu chữ, nó chỉ làm việc với số, nên bước đầu của xử lý ngôn ngữ là biến văn bản thành số. Cách đơn giản nhất là túi từ (bag of words): tách từ, đếm tần suất, rồi biểu diễn mỗi văn bản thành một vector đếm theo từ vựng cố định. Hai vector càng giống thì tích vô hướng (hoặc cosin) càng lớn, nên ta dùng nó để tìm văn bản gần nghĩa, tìm người dùng có gu giống nhau và gợi ý sản phẩm. Naive Bayes dùng tần suất đếm để ước lượng xác suất nhãn, còn chuỗi Markov dự đoán từ kế tiếp từ bảng đếm các cặp từ. Lỗi thường gặp: quên chuẩn hóa chữ hoa chữ thường trước khi đếm, và dùng từ vựng khác nhau cho hai văn bản cần so sánh.",
    "example": "van_ban = \"mèo ăn cá mèo ngủ\"\ndem = {}\nfor t in van_ban.split():\n    dem[t] = dem.get(t, 0) + 1\nprint(dem[\"mèo\"])",
    "exercises": [
      {
        "id": "c42e1",
        "title": "Bài 42.1: Tách từ",
        "prompt": "Cho van_ban = \"mèo ăn cá mèo ngủ\". Dùng split() tách thành các từ rồi in số từ bằng len().",
        "starter": "",
        "expectedOutput": "5",
        "sample": "van_ban = \"mèo ăn cá mèo ngủ\"\ntu = van_ban.split()\nprint(len(tu))",
        "require": [
          "string"
        ]
      },
      {
        "id": "c42e2",
        "title": "Bài 42.2: Túi từ",
        "prompt": "Với van_ban = \"mèo ăn cá mèo ngủ\", đếm tần suất từng từ vào từ điển dem rồi in dem[\"mèo\"].",
        "starter": "",
        "expectedOutput": "2",
        "sample": "van_ban = \"mèo ăn cá mèo ngủ\"\ndem = {}\nfor t in van_ban.split():\n    dem[t] = dem.get(t, 0) + 1\nprint(dem[\"mèo\"])",
        "require": [
          "dict",
          "for",
          "string"
        ]
      },
      {
        "id": "c42e3",
        "title": "Bài 42.3: Từ vựng không trùng",
        "prompt": "Cho van_ban = \"mèo ăn cá mèo ngủ\". Tạo list vocab chứa các từ không trùng nhau (chỉ thêm từ nếu nó chưa có trong vocab, dùng if not (t in vocab)). In len(vocab).",
        "starter": "",
        "expectedOutput": "4",
        "sample": "van_ban = \"mèo ăn cá mèo ngủ\"\nvocab = []\nfor t in van_ban.split():\n    if not (t in vocab):\n        vocab.append(t)\nprint(len(vocab))",
        "require": [
          "for",
          "if"
        ]
      },
      {
        "id": "c42e4",
        "title": "Bài 42.4: Vector đếm",
        "prompt": "Cho vocab = [\"mèo\", \"chó\", \"cá\"] và cau = \"mèo ăn cá mèo\". Tạo vector vec có đúng 3 phần tử, mỗi phần tử là số lần từ tương ứng của vocab xuất hiện trong câu. In vec.",
        "starter": "",
        "expectedOutput": "[2, 0, 1]",
        "sample": "vocab = [\"mèo\", \"chó\", \"cá\"]\ncau = \"mèo ăn cá mèo\"\nvec = []\nfor v in vocab:\n    dem = 0\n    for t in cau.split():\n        if t == v:\n            dem += 1\n    vec.append(dem)\nprint(vec)",
        "require": [
          "for",
          "if",
          "list"
        ]
      },
      {
        "id": "c42e5",
        "title": "Bài 42.5: Tích vô hướng",
        "prompt": "Cho a = [2, 0, 1] và b = [1, 1, 1]. Tính tích vô hướng (a0*b0 + a1*b1 + a2*b2) bằng vòng lặp rồi in. Tích vô hướng càng lớn thì hai vector càng giống nhau.",
        "starter": "",
        "expectedOutput": "3",
        "sample": "a = [2, 0, 1]\nb = [1, 1, 1]\ntich = 0\nfor i in range(3):\n    tich += a[i] * b[i]\nprint(tich)",
        "require": [
          "for",
          "range"
        ]
      },
      {
        "id": "c42e6",
        "title": "Bài 42.6: Độ giống cosin (bình phương)",
        "prompt": "Cho a = [2, 0, 1] và b = [1, 1, 1]. Tính độ giống cosin bình phương theo phần trăm nguyên: tích * tích * 100 // (độ dài bình phương của a * độ dài bình phương của b), với độ dài bình phương là tổng bình phương các phần tử. In kết quả.",
        "starter": "",
        "expectedOutput": "60",
        "sample": "a = [2, 0, 1]\nb = [1, 1, 1]\ntich = 0\nla = 0\nlb = 0\nfor i in range(3):\n    tich += a[i] * b[i]\n    la += a[i] ** 2\n    lb += b[i] ** 2\nprint(tich * tich * 100 // (la * lb))",
        "require": [
          "for",
          "range"
        ]
      },
      {
        "id": "c42e7",
        "title": "Bài 42.7: Gợi ý phim",
        "prompt": "Cho phim = [\"Mưa\", \"Biển\", \"Rừng\", \"Núi\"], mình = [1, 0, 1, 0] (1 là đã thích) và nguoi = {\"An\": [1, 1, 1, 0], \"Bình\": [0, 1, 0, 1]}. Tìm người có tích vô hướng với mình lớn nhất, rồi in tên phim đầu tiên người đó thích mà mình chưa thích.",
        "starter": "",
        "expectedOutput": "Biển",
        "sample": "phim = [\"Mưa\", \"Biển\", \"Rừng\", \"Núi\"]\nminh = [1, 0, 1, 0]\nnguoi = {\"An\": [1, 1, 1, 0], \"Bình\": [0, 1, 0, 1]}\ntot = \"\"\ndiem_tot = -1\nfor ten in nguoi.keys():\n    tich = 0\n    for i in range(4):\n        tich += minh[i] * nguoi[ten][i]\n    if tich > diem_tot:\n        diem_tot = tich\n        tot = ten\nfor i in range(4):\n    if nguoi[tot][i] == 1 and minh[i] == 0:\n        print(phim[i])\n        break",
        "require": [
          "for",
          "if",
          "dict"
        ]
      },
      {
        "id": "c42e8",
        "title": "Bài 42.8: Naive Bayes bằng cách đếm",
        "prompt": "Cho thu = [[1, \"spam\"], [1, \"spam\"], [1, \"spam\"], [1, \"ok\"], [0, \"ok\"]] (mỗi phần tử [có chữ \"miễn phí\" hay không, nhãn]). Trong các thư có chữ \"miễn phí\", đếm tỉ lệ là spam theo phần trăm nguyên (spam * 100 // tổng) và in ra.",
        "starter": "",
        "expectedOutput": "75",
        "sample": "thu = [[1, \"spam\"], [1, \"spam\"], [1, \"spam\"], [1, \"ok\"], [0, \"ok\"]]\ntong = 0\nspam = 0\nfor t in thu:\n    if t[0] == 1:\n        tong += 1\n        if t[1] == \"spam\":\n            spam += 1\nprint(spam * 100 // tong)",
        "require": [
          "for",
          "if"
        ]
      },
      {
        "id": "c42e9",
        "title": "Bài 42.9: Chuỗi Markov dự đoán từ kế tiếp",
        "prompt": "Cho van_ban = \"a b a c a b\". Tách thành list tu rồi với mỗi cặp từ liền nhau (tu[i], tu[i+1]) đếm vào bảng sau[tu[i]][tu[i+1]] (dict lồng dict). In từ thường xuất hiện nhất ngay sau từ \"a\".",
        "starter": "",
        "expectedOutput": "b",
        "sample": "van_ban = \"a b a c a b\"\ntu = van_ban.split()\nsau = {}\nfor i in range(len(tu) - 1):\n    hien_tai = tu[i]\n    ke = tu[i + 1]\n    if not (hien_tai in sau):\n        sau[hien_tai] = {}\n    sau[hien_tai][ke] = sau[hien_tai].get(ke, 0) + 1\ntot = \"\"\nso_tot = 0\nfor k in sau[\"a\"].keys():\n    if sau[\"a\"][k] > so_tot:\n        so_tot = sau[\"a\"][k]\n        tot = k\nprint(tot)",
        "require": [
          "dict",
          "for",
          "if",
          "range"
        ]
      },
      {
        "id": "c42e10",
        "title": "Bài 42.10: Tìm kiếm tài liệu",
        "prompt": "Cho tai_lieu = [\"mèo ăn cá\", \"chó ăn xương\", \"mèo bắt chuột mèo\"] và truy_van = \"mèo\". Với mỗi tài liệu đếm số lần từ truy vấn xuất hiện, rồi in chỉ số (bắt đầu từ 0) của tài liệu có số lần cao nhất.",
        "starter": "",
        "expectedOutput": "2",
        "sample": "tai_lieu = [\"mèo ăn cá\", \"chó ăn xương\", \"mèo bắt chuột mèo\"]\ntruy_van = \"mèo\"\ntot = 0\nso_tot = -1\nfor i in range(len(tai_lieu)):\n    dem = 0\n    for t in tai_lieu[i].split():\n        if t == truy_van:\n            dem += 1\n    if dem > so_tot:\n        so_tot = dem\n        tot = i\nprint(tot)",
        "require": [
          "for",
          "if",
          "range"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Cho van_ban = \"a b a b a\". Đếm tần suất từng từ vào từ điển dem rồi in dem[\"a\"] ở dòng 1 và dem[\"b\"] ở dòng 2.",
        "expectedOutput": "3\n2",
        "sample": "van_ban = \"a b a b a\"\ndem = {}\nfor t in van_ban.split():\n    dem[t] = dem.get(t, 0) + 1\nprint(dem[\"a\"])\nprint(dem[\"b\"])",
        "require": [
          "dict",
          "for",
          "string"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Vì sao phải biến văn bản thành số trước khi đưa vào mô hình?",
          "options": [
            "Vì máy chỉ tính toán được trên số",
            "Vì số luôn chính xác hơn chữ",
            "Vì Python không đọc được chữ",
            "Vì chữ chiếm nhiều bộ nhớ"
          ],
          "answer": 0
        },
        {
          "id": "q2",
          "q": "Hai vector đếm từ có tích vô hướng càng lớn thì điều gì xảy ra?",
          "options": [
            "Hai văn bản càng giống nhau",
            "Hai văn bản càng khác nhau",
            "Hai văn bản có cùng độ dài",
            "Không kết luận được gì"
          ],
          "answer": 0
        }
      ]
    }
  },
  {
    "id": "c43",
    "title": "Chương 43: Tìm kiếm, lập kế hoạch và ra quyết định",
    "theory": "AI cổ điển giải bài toán bằng cách tìm kiếm trong không gian các trạng thái. Đồ thị mô tả trạng thái và bước đi giữa chúng. BFS (tìm theo chiều rộng, dùng hàng đợi) luôn cho đường đi ít bước nhất trên đồ thị không trọng số, DFS (chiều sâu, dùng đệ quy hoặc ngăn xếp) đi sâu đến cùng rồi quay lui. Thuật toán tham lam chọn phương án tốt nhất trước mắt, nhanh nhưng không phải lúc nào cũng tối ưu. Heuristic là ước lượng khoảng cách còn lại, ví dụ khoảng cách Manhattan. Minimax cho trò chơi hai người: MAX chọn nước đi tối đa hóa điểm, MIN chọn tối thiểu hóa. Leo đồi cải thiện nghiệm từng bước và có thể kẹt ở đỉnh cục bộ. Học tăng cường (Q-learning) cập nhật giá trị Q từ phần thưởng. Lỗi thường gặp: quên đánh dấu đỉnh đã thăm gây vòng lặp vô tận, và kiểm tra biên của lưới sai.",
    "example": "do_thi = {\"A\": [\"B\", \"C\"], \"B\": [], \"C\": []}\nprint(len(do_thi[\"A\"]))",
    "exercises": [
      {
        "id": "c43e1",
        "title": "Bài 43.1: Biểu diễn đồ thị",
        "prompt": "Cho do_thi = {\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [\"D\"], \"D\": []}. In số đỉnh kề của \"A\" ở dòng 1 và số đỉnh của đồ thị (len(do_thi)) ở dòng 2.",
        "starter": "",
        "expectedOutput": "2\n4",
        "sample": "do_thi = {\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [\"D\"], \"D\": []}\nprint(len(do_thi[\"A\"]))\nprint(len(do_thi))",
        "require": [
          "dict"
        ]
      },
      {
        "id": "c43e2",
        "title": "Bài 43.2: BFS thứ tự duyệt",
        "prompt": "Với đồ thị ở bài 43.1, duyệt BFS từ \"A\" bằng hàng đợi (list, lấy phần tử đầu bằng pop(0)), chỉ thêm đỉnh chưa thăm. In thứ tự duyệt, các đỉnh cách nhau một dấu cách (dùng \" \".join).",
        "starter": "",
        "expectedOutput": "A B C D",
        "sample": "do_thi = {\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [\"D\"], \"D\": []}\nhang_doi = [\"A\"]\nda_tham = [\"A\"]\nthu_tu = []\nwhile len(hang_doi) > 0:\n    dinh = hang_doi.pop(0)\n    thu_tu.append(dinh)\n    for ke in do_thi[dinh]:\n        if not (ke in da_tham):\n            da_tham.append(ke)\n            hang_doi.append(ke)\nprint(\" \".join(thu_tu))",
        "require": [
          "while",
          "pop",
          "list"
        ]
      },
      {
        "id": "c43e3",
        "title": "Bài 43.3: Đường đi ngắn nhất",
        "prompt": "Với đồ thị ở bài 43.1, dùng BFS và từ điển khoang_cach (A cách A 0 bước, mỗi đỉnh kề mới cách đỉnh hiện tại thêm 1) để tính số bước ngắn nhất từ \"A\" đến \"D\". In kết quả.",
        "starter": "",
        "expectedOutput": "2",
        "sample": "do_thi = {\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [\"D\"], \"D\": []}\nhang_doi = [\"A\"]\nkhoang_cach = {\"A\": 0}\nwhile len(hang_doi) > 0:\n    dinh = hang_doi.pop(0)\n    for ke in do_thi[dinh]:\n        if not (ke in khoang_cach):\n            khoang_cach[ke] = khoang_cach[dinh] + 1\n            hang_doi.append(ke)\nprint(khoang_cach[\"D\"])",
        "require": [
          "while",
          "pop",
          "dict"
        ]
      },
      {
        "id": "c43e4",
        "title": "Bài 43.4: Tìm đường trong mê cung",
        "prompt": "Mê cung 3x3: me_cung = [\"..#\", \"#..\", \"...\"] trong đó . là ô đi được và # là tường. Đi 4 hướng (lên, xuống, trái, phải) từ ô (0, 0) đến ô (2, 2). Dùng BFS để in số bước ngắn nhất. Gợi ý: lưu ô dưới dạng số hàng * 3 + cột, kiểm tra biên bằng các if lồng nhau.",
        "starter": "",
        "expectedOutput": "4",
        "sample": "me_cung = [\"..#\", \"#..\", \"...\"]\nhang_doi = [0]\nkhoang_cach = {\"0\": 0}\nhd = [-1, 1, 0, 0]\ncd = [0, 0, -1, 1]\nwhile len(hang_doi) > 0:\n    o = hang_doi.pop(0)\n    r = o // 3\n    c = o % 3\n    for k in range(4):\n        nr = r + hd[k]\n        nc = c + cd[k]\n        if nr >= 0:\n            if nr < 3:\n                if nc >= 0:\n                    if nc < 3:\n                        if me_cung[nr][nc] == \".\":\n                            ma = nr * 3 + nc\n                            if not (str(ma) in khoang_cach):\n                                khoang_cach[str(ma)] = khoang_cach[str(o)] + 1\n                                hang_doi.append(ma)\nprint(khoang_cach[\"8\"])",
        "require": [
          "while",
          "pop",
          "dict"
        ]
      },
      {
        "id": "c43e5",
        "title": "Bài 43.5: DFS đệ quy",
        "prompt": "Cho do_thi = {\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [\"D\"], \"D\": [], \"E\": []}. Viết hàm dfs(dinh, da_tham) đánh dấu đỉnh vào list da_tham rồi gọi đệ quy cho các đỉnh kề chưa thăm. Gọi dfs(\"A\", da_tham) với da_tham = [] rồi in len(da_tham) (số đỉnh đến được từ A).",
        "starter": "",
        "expectedOutput": "4",
        "sample": "do_thi = {\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [\"D\"], \"D\": [], \"E\": []}\n\ndef dfs(dinh, da_tham):\n    da_tham.append(dinh)\n    for ke in do_thi[dinh]:\n        if not (ke in da_tham):\n            dfs(ke, da_tham)\n\nda_tham = []\ndfs(\"A\", da_tham)\nprint(len(da_tham))",
        "require": [
          "function",
          "for",
          "if"
        ]
      },
      {
        "id": "c43e6",
        "title": "Bài 43.6: Thuật toán tham lam",
        "prompt": "Đổi 85 nghìn đồng với các mệnh giá menh_gia = [50, 20, 10, 5]. Mỗi lần luôn chọn tờ lớn nhất còn dùng được (duyệt từ lớn đến nhỏ, dùng while hoặc phép chia //). In tổng số tờ dùng.",
        "starter": "",
        "expectedOutput": "4",
        "sample": "menh_gia = [50, 20, 10, 5]\ncon_lai = 85\nso_to = 0\nfor m in menh_gia:\n    so_to += con_lai // m\n    con_lai = con_lai % m\nprint(so_to)",
        "require": [
          "for",
          "list"
        ]
      },
      {
        "id": "c43e7",
        "title": "Bài 43.7: Heuristic Manhattan",
        "prompt": "Viết hàm tri_tuyet_doi(x) trả về x nếu x >= 0, ngược lại trả về -x. Rồi viết hàm manhattan(r1, c1, r2, c2) trả về tri_tuyet_doi(r1 - r2) + tri_tuyet_doi(c1 - c2). In manhattan(0, 0, 3, 4).",
        "starter": "",
        "expectedOutput": "7",
        "sample": "def tri_tuyet_doi(x):\n    if x >= 0:\n        return x\n    return -x\n\ndef manhattan(r1, c1, r2, c2):\n    return tri_tuyet_doi(r1 - r2) + tri_tuyet_doi(c1 - c2)\n\nprint(manhattan(0, 0, 3, 4))",
        "require": [
          "function",
          "if"
        ]
      },
      {
        "id": "c43e8",
        "title": "Bài 43.8: Minimax hai tầng",
        "prompt": "Cây trò chơi cay = [[3, 5], [2, 9]]: MAX chọn một trong hai nhánh, rồi MIN chọn một số trong nhánh đó. Với mỗi nhánh tìm giá trị nhỏ nhất (MIN), rồi lấy giá trị lớn nhất trong các kết quả đó (MAX). In giá trị minimax.",
        "starter": "",
        "expectedOutput": "3",
        "sample": "cay = [[3, 5], [2, 9]]\ntot = -1000\nfor nhanh in cay:\n    nho = nhanh[0]\n    for v in nhanh:\n        if v < nho:\n            nho = v\n    if nho > tot:\n        tot = nho\nprint(tot)",
        "require": [
          "for",
          "if",
          "list"
        ]
      },
      {
        "id": "c43e9",
        "title": "Bài 43.9: Leo đồi",
        "prompt": "Hàm điểm f(x) = 25 - (x - 5) ** 2. Bắt đầu từ x = 0, lặp: nếu f(x + 1) > f(x) thì x += 1, ngược lại dừng (break). In x ở dòng 1 và f(x) ở dòng 2. Chú ý: leo đồi chỉ đảm bảo ra đỉnh cục bộ.",
        "starter": "",
        "expectedOutput": "5\n25",
        "sample": "def f(x):\n    return 25 - (x - 5) ** 2\n\nx = 0\nwhile True:\n    if f(x + 1) > f(x):\n        x += 1\n    else:\n        break\nprint(x)\nprint(f(x))",
        "require": [
          "function",
          "while",
          "if"
        ]
      },
      {
        "id": "c43e10",
        "title": "Bài 43.10: Q-learning một bước",
        "prompt": "Cho q = 1 (giá trị hiện tại), phần thưởng r = 10, alpha = 0.5, gamma = 0.5 và q_tiep = [1, 3, 2] (giá trị các hành động ở trạng thái kế tiếp). Tìm giá trị lớn nhất của q_tiep bằng vòng lặp rồi cập nhật q = q + alpha * (r + gamma * lớn_nhất - q). In q mới.",
        "starter": "",
        "expectedOutput": "6.25",
        "sample": "q = 1\nr = 10\nalpha = 0.5\ngamma = 0.5\nq_tiep = [1, 3, 2]\nlon_nhat = q_tiep[0]\nfor v in q_tiep:\n    if v > lon_nhat:\n        lon_nhat = v\nq = q + alpha * (r + gamma * lon_nhat - q)\nprint(q)",
        "require": [
          "for",
          "if",
          "list"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Đổi 90 nghìn đồng với menh_gia = [50, 20, 10, 5], luôn chọn tờ lớn nhất còn dùng được (duyệt từ lớn đến nhỏ). In tổng số tờ dùng.",
        "expectedOutput": "3",
        "sample": "menh_gia = [50, 20, 10, 5]\ncon_lai = 90\nso_to = 0\nfor m in menh_gia:\n    so_to += con_lai // m\n    con_lai = con_lai % m\nprint(so_to)",
        "require": [
          "for",
          "list"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Đường đi ít bước nhất trên đồ thị không trọng số thường tìm bằng thuật toán nào?",
          "options": [
            "DFS",
            "BFS",
            "Sắp xếp nổi bọt",
            "Tìm kiếm nhị phân"
          ],
          "answer": 1
        },
        {
          "id": "q2",
          "q": "Trong minimax, nút MIN làm gì?",
          "options": [
            "Chọn giá trị lớn nhất",
            "Chọn giá trị nhỏ nhất vì đối thủ muốn bất lợi cho ta",
            "Chọn ngẫu nhiên",
            "Bỏ qua nhánh"
          ],
          "answer": 1
        }
      ]
    }
  },
  {
    "id": "c44",
    "title": "Chương 44: AI có trách nhiệm và đồ án tổng hợp",
    "theory": "Mô hình AI chạy tốt trên trung bình vẫn có thể bất công với một nhóm nhỏ. Người làm AI có trách nhiệm kiểm tra dữ liệu có bị lệch không, đo độ chính xác riêng cho từng nhóm, so sánh tỉ lệ được duyệt giữa các nhóm, tránh rò rỉ dữ liệu (mẫu kiểm tra lọt vào tập huấn luyện làm điểm số ảo), che thông tin cá nhân, đặt rào chắn an toàn cho đầu ra và chuyển những ca không chắc chắn cho con người duyệt. Ngưỡng quyết định cũng là một lựa chọn đạo đức vì hai loại lỗi có chi phí khác nhau. Chương cuối ghép mọi bước thành một quy trình hoàn chỉnh: chuẩn bị dữ liệu, chia tập, huấn luyện, đánh giá, rồi kết luận có nên dùng mô hình hay không. Lỗi thường gặp: chỉ báo cáo con số trung bình và tin rằng điểm cao nghĩa là mô hình công bằng.",
    "example": "nhom = [\"A\", \"A\", \"B\"]\nso_b = 0\nfor n in nhom:\n    if n == \"B\":\n        so_b += 1\nprint(so_b * 100 // len(nhom))",
    "exercises": [
      {
        "id": "c44e1",
        "title": "Bài 44.1: Dữ liệu bị lệch",
        "prompt": "Cho nhom = [\"A\", \"A\", \"A\", \"A\", \"B\"] (nhóm của từng mẫu trong dữ liệu huấn luyện). Tính tỉ lệ phần trăm nguyên của nhóm B trong dữ liệu rồi in. Nhóm quá ít mẫu thì mô hình thường học kém về nhóm đó.",
        "starter": "",
        "expectedOutput": "20",
        "sample": "nhom = [\"A\", \"A\", \"A\", \"A\", \"B\"]\nso_b = 0\nfor n in nhom:\n    if n == \"B\":\n        so_b += 1\nprint(so_b * 100 // len(nhom))",
        "require": [
          "for",
          "if"
        ]
      },
      {
        "id": "c44e2",
        "title": "Bài 44.2: Độ chính xác theo nhóm",
        "prompt": "Cho mau = [[\"A\", 1, 1], [\"A\", 0, 0], [\"B\", 1, 0], [\"B\", 0, 0]] (mỗi phần tử [nhóm, nhãn thật, dự đoán]). Tính độ chính xác phần trăm nguyên riêng cho nhóm A và nhóm B. In hai dòng dạng \"A: 100\" và \"B: 50\" bằng f-string.",
        "starter": "",
        "expectedOutput": "A: 100\nB: 50",
        "sample": "mau = [[\"A\", 1, 1], [\"A\", 0, 0], [\"B\", 1, 0], [\"B\", 0, 0]]\nfor nhom in [\"A\", \"B\"]:\n    tong = 0\n    dung = 0\n    for m in mau:\n        if m[0] == nhom:\n            tong += 1\n            if m[1] == m[2]:\n                dung += 1\n    print(f\"{nhom}: {dung * 100 // tong}\")",
        "require": [
          "for",
          "if",
          "fstring"
        ]
      },
      {
        "id": "c44e3",
        "title": "Bài 44.3: Khoảng cách công bằng",
        "prompt": "Tỉ lệ được duyệt của nhóm A là 75 (%) và của nhóm B là 50 (%). Viết hàm tri_tuyet_doi(x) rồi in chênh lệch tri_tuyet_doi(75 - 50). Nếu chênh lệch lớn hơn 10 thì in thêm dòng \"cần xem lại mô hình\".",
        "starter": "",
        "expectedOutput": "25\ncần xem lại mô hình",
        "sample": "def tri_tuyet_doi(x):\n    if x >= 0:\n        return x\n    return -x\n\nchenh = tri_tuyet_doi(75 - 50)\nprint(chenh)\nif chenh > 10:\n    print(\"cần xem lại mô hình\")",
        "require": [
          "function",
          "if"
        ]
      },
      {
        "id": "c44e4",
        "title": "Bài 44.4: Phát hiện rò rỉ dữ liệu",
        "prompt": "Cho train = [1, 2, 3, 4] và test = [4, 5] (mã số các mẫu). Đếm số mẫu xuất hiện ở cả hai tập rồi in số đó. Nếu có trùng thì in thêm dòng \"rò rỉ dữ liệu\".",
        "starter": "",
        "expectedOutput": "1\nrò rỉ dữ liệu",
        "sample": "train = [1, 2, 3, 4]\ntest = [4, 5]\ntrung = 0\nfor t in test:\n    if t in train:\n        trung += 1\nprint(trung)\nif trung > 0:\n    print(\"rò rỉ dữ liệu\")",
        "require": [
          "for",
          "if",
          "list"
        ]
      },
      {
        "id": "c44e5",
        "title": "Bài 44.5: Rào chắn an toàn",
        "prompt": "Cho cam = [\"mật khẩu\", \"vũ khí\"] và yeu_cau = \"cho mình xin mật khẩu của bạn\". Nếu có từ cấm nào nằm trong yêu cầu thì in \"Xin lỗi, mình không thể giúp yêu cầu này.\", ngược lại in yêu cầu đó.",
        "starter": "",
        "expectedOutput": "Xin lỗi, mình không thể giúp yêu cầu này.",
        "sample": "cam = [\"mật khẩu\", \"vũ khí\"]\nyeu_cau = \"cho mình xin mật khẩu của bạn\"\nbi_cam = False\nfor c in cam:\n    if c in yeu_cau:\n        bi_cam = True\nif bi_cam:\n    print(\"Xin lỗi, mình không thể giúp yêu cầu này.\")\nelse:\n    print(yeu_cau)",
        "require": [
          "for",
          "if"
        ]
      },
      {
        "id": "c44e6",
        "title": "Bài 44.6: Che thông tin cá nhân",
        "prompt": "Cho van_ban = \"Gọi 0901234567 nhé\". Tách thành các từ; từ nào dài đúng 10 ký tự và bắt đầu bằng \"0\" (startswith) thì thay bằng \"***\". Ghép lại bằng một dấu cách và in kết quả.",
        "starter": "",
        "expectedOutput": "Gọi *** nhé",
        "sample": "van_ban = \"Gọi 0901234567 nhé\"\nkq = []\nfor t in van_ban.split():\n    if len(t) == 10 and t.startswith(\"0\"):\n        kq.append(\"***\")\n    else:\n        kq.append(t)\nprint(\" \".join(kq))",
        "require": [
          "for",
          "if",
          "string"
        ]
      },
      {
        "id": "c44e7",
        "title": "Bài 44.7: Giải thích mô hình",
        "prompt": "Mô hình tuyến tính có w = [2, -1, 3] và mẫu x = [1, 4, 2]. Tính đóng góp từng đặc trưng w[i] * x[i], rồi in chỉ số (từ 0) của đặc trưng có đóng góp lớn nhất xét theo giá trị tuyệt đối (tự viết hàm tri_tuyet_doi).",
        "starter": "",
        "expectedOutput": "2",
        "sample": "def tri_tuyet_doi(x):\n    if x >= 0:\n        return x\n    return -x\n\nw = [2, -1, 3]\nx = [1, 4, 2]\ntot = 0\nlon_nhat = -1\nfor i in range(3):\n    dong_gop = tri_tuyet_doi(w[i] * x[i])\n    if dong_gop > lon_nhat:\n        lon_nhat = dong_gop\n        tot = i\nprint(tot)",
        "require": [
          "function",
          "for",
          "if"
        ]
      },
      {
        "id": "c44e8",
        "title": "Bài 44.8: Chọn ngưỡng theo chi phí",
        "prompt": "Cho diem = [9, 8, 6, 4, 3, 1] và that = [1, 1, 0, 1, 0, 0]. Đoán 1 nếu điểm >= ngưỡng. Bỏ sót ca dương (FN) tốn 5 đơn vị, báo nhầm (FP) tốn 1 đơn vị. Thử các ngưỡng 3, 5, 7, tính tổng chi phí mỗi ngưỡng và in ngưỡng có chi phí thấp nhất (nếu hòa thì lấy ngưỡng đến trước).",
        "starter": "",
        "expectedOutput": "3",
        "sample": "diem = [9, 8, 6, 4, 3, 1]\nthat = [1, 1, 0, 1, 0, 0]\ntot = 0\nchi_phi_tot = 1000\nfor nguong in [3, 5, 7]:\n    chi_phi = 0\n    for i in range(6):\n        if diem[i] >= nguong:\n            doan = 1\n        else:\n            doan = 0\n        if doan == 1 and that[i] == 0:\n            chi_phi += 1\n        if doan == 0 and that[i] == 1:\n            chi_phi += 5\n    if chi_phi < chi_phi_tot:\n        chi_phi_tot = chi_phi\n        tot = nguong\nprint(tot)",
        "require": [
          "for",
          "if",
          "list"
        ]
      },
      {
        "id": "c44e9",
        "title": "Bài 44.9: Chuyển ca khó cho con người",
        "prompt": "Cho tin_cay = [95, 60, 88, 55, 72] (độ tin cậy % của từng dự đoán). Dự đoán có tin cậy >= 70 thì máy tự xử lý, còn lại chuyển cho người duyệt. In số ca máy tự xử lý ở dòng 1 và số ca chuyển cho người ở dòng 2.",
        "starter": "",
        "expectedOutput": "3\n2",
        "sample": "tin_cay = [95, 60, 88, 55, 72]\ntu_dong = 0\nchuyen_nguoi = 0\nfor t in tin_cay:\n    if t >= 70:\n        tu_dong += 1\n    else:\n        chuyen_nguoi += 1\nprint(tu_dong)\nprint(chuyen_nguoi)",
        "require": [
          "for",
          "if",
          "list"
        ]
      },
      {
        "id": "c44e10",
        "title": "Bài 44.10: Đồ án quy trình AI hoàn chỉnh",
        "prompt": "Cho du = [[1, 0], [2, 0], [3, 0], [4, 1], [5, 1], [6, 1], [7, 1], [2, 0], [5, 1], [3, 1]] (mỗi phần tử [x, nhãn]). Chia 7 mẫu đầu làm train và 3 mẫu cuối làm test bằng cắt lát. Mô hình 1-NN: nhãn của điểm test là nhãn của điểm train gần nhất theo khoảng cách bình phương (hòa thì lấy điểm đến trước). In số mẫu test đoán đúng ở dòng 1, rồi in \"dùng được\" nếu độ chính xác phần trăm nguyên >= 60, ngược lại in \"chưa dùng được\" ở dòng 2.",
        "starter": "",
        "expectedOutput": "2\ndùng được",
        "sample": "du = [[1, 0], [2, 0], [3, 0], [4, 1], [5, 1], [6, 1], [7, 1], [2, 0], [5, 1], [3, 1]]\ntrain = du[:7]\ntest = du[7:]\ndung = 0\nfor t in test:\n    kc_min = 1000\n    nhan = 0\n    for d in train:\n        kc = (t[0] - d[0]) ** 2\n        if kc < kc_min:\n            kc_min = kc\n            nhan = d[1]\n    if nhan == t[1]:\n        dung += 1\nprint(dung)\nif dung * 100 // len(test) >= 60:\n    print(\"dùng được\")\nelse:\n    print(\"chưa dùng được\")",
        "require": [
          "for",
          "if",
          "slice"
        ]
      }
    ],
    "exam": {
      "code": {
        "prompt": "Cho nhom = [\"A\", \"B\", \"B\", \"B\", \"B\"]. Tính tỉ lệ phần trăm nguyên của nhóm A trong dữ liệu rồi in.",
        "expectedOutput": "20",
        "sample": "nhom = [\"A\", \"B\", \"B\", \"B\", \"B\"]\nso_a = 0\nfor n in nhom:\n    if n == \"A\":\n        so_a += 1\nprint(so_a * 100 // len(nhom))",
        "require": [
          "for",
          "if"
        ]
      },
      "mcq": [
        {
          "id": "q1",
          "q": "Rò rỉ dữ liệu (data leakage) là gì?",
          "options": [
            "Dữ liệu bị mất do lỗi ổ đĩa",
            "Thông tin của tập kiểm tra lọt vào quá trình huấn luyện làm điểm số cao giả",
            "Mô hình quá lớn",
            "Người dùng bị lộ mật khẩu"
          ],
          "answer": 1
        },
        {
          "id": "q2",
          "q": "Khi mô hình có độ chính xác trung bình cao nhưng thấp ở một nhóm nhỏ, nên làm gì?",
          "options": [
            "Bỏ qua vì trung bình đã cao",
            "Đo riêng từng nhóm và bổ sung dữ liệu hoặc điều chỉnh mô hình",
            "Xóa nhóm đó khỏi dữ liệu",
            "Đổi tên nhóm"
          ],
          "answer": 1
        }
      ]
    }
  }

];

CHAPTERS.push(PY_HIDDEN_CHAPTER);

/** Learning groups by target audience */
export const LEARNING_GROUPS = [
  {
    id: "sv-zero",
    title: "Đại học · Học từ đầu",
    subtitle: "Sinh viên mới bắt đầu · từ print đến đồ án nhỏ",
    icon: "🎓",
    color: "#0EA5E9",
    chapters: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c23", "c24", "c25", "c26", "c27", "c28", "c29", "c30", "c31", "c32"],
  },

  {
    id: "zero-adv",
    title: "Từ 0 đến nâng cao",
    subtitle: "Người chưa học gì · từ print đến cấu trúc dữ liệu, thuật toán và đồ án nâng cao",
    icon: "🚀",
    color: "#DC2626",
    chapters: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c23", "c24", "c25", "c26", "c27", "c28", "c29", "c30", "c31", "c32", "c33", "c34", "c35", "c36", "c37", "c45"],
  },

  {
    id: "ai-thinking",
    title: "Tư duy Trí tuệ nhân tạo",
    subtitle: "Từ 0 đến nâng cao · dữ liệu, luật, đánh giá, học máy, ngôn ngữ, tìm kiếm và AI có trách nhiệm",
    icon: "🤖",
    color: "#7C3AED",
    chapters: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c23", "c32", "c38", "c39", "c40", "c41", "c42", "c43", "c44"],
  },

  {
    id: "hs-coban",
    title: "Học sinh · Cơ bản",
    subtitle: "Lớp 6–9 · làm quen Python",
    icon: "🌱",
    color: "#10B981",
    chapters: ["c1", "c2", "c3", "c4", "c5"],
  },
  {
    id: "hs-thpt",
    title: "Học sinh · THPT & luyện thi",
    subtitle: "Lớp 10–12 · if/for/list + dạng đề",
    icon: "📘",
    color: "#6D5EF6",
    chapters: ["c6", "c7", "c8", "c11", "c12", "c13", "c14", "c15", "c16"],
  },
  {
    id: "sv-cs",
    title: "Sinh viên · Lập trình cơ sở",
    subtitle: "Đại học năm 1–2 · thuật toán & hàm",
    icon: "🎓",
    color: "#0D9488",
    chapters: ["c9", "c10", "c17", "c18", "c19", "c20", "c23", "c32"],
  },
  {
    id: "practice",
    title: "Luyện thêm · Tổng hợp",
    subtitle: "Ôn tập mở rộng mọi trình độ",
    icon: "🔥",
    color: "#F59E0B",
    chapters: ["c21", "c22", "c45"],
  },
];


/** Structured learning paths (selectable in UI) */
export const LEARNING_PATHS = [
  {
    id: "path-sv-zero",
    title: "Sinh viên · Học từ đầu",
    subtitle: "Từ print đến logic nâng cao, sửa lỗi và báo cáo theo nhóm",
    icon: "🎓",
    color: "#0EA5E9",
    days: 42,
    exerciseIds: ["c1e1", "c1e2", "c2e1", "c2e3", "c3e1", "c3e2", "c4e1", "c4e3", "c5e1", "c5e2", "c6e1", "c7e1", "c7e5", "c8e1", "c8e3", "c23e1", "c23e2", "c24e1", "c24e4", "c24e6", "c25e1", "c25e3", "c25e5", "c26e1", "c26e2", "c26e5", "c27e1", "c27e6", "c28e1", "c28e2", "c28e4", "c28e7", "c29e1", "c29e5", "c29e7", "c30e1", "c30e7", "c31e1", "c31e2", "c31e6", "c32e2", "c32e3", "c32e5", "c32e10"],
  },

  {
    id: "path-zero-adv",
    title: "Từ 0 đến nâng cao",
    subtitle: "Một mạch duy nhất · từ print đến đồ án tổng hợp nâng cao",
    icon: "🚀",
    color: "#DC2626",
    days: 90,
    exerciseIds: ["c1e1", "c1e2", "c2e1", "c2e3", "c3e1", "c3e2", "c4e1", "c4e3", "c5e1", "c5e2", "c6e1", "c7e1", "c7e5", "c8e1", "c8e3", "c23e1", "c23e2", "c24e1", "c24e4", "c25e1", "c25e3", "c26e1", "c26e2", "c27e1", "c27e6", "c28e1", "c28e7", "c29e1", "c29e5", "c30e1", "c30e7", "c31e1", "c31e2", "c32e2", "c32e3", "c32e5", "c33e2", "c33e10", "c34e1", "c34e5", "c35e4", "c35e7", "c36e3", "c36e9", "c37e2", "c37e4", "c37e10", "c45e1", "c45e3", "c45e4", "c45e6", "c45e10"],
  },

  {
    id: "path-ai-thinking",
    title: "Tư duy AI · Từ 0 đến nâng cao",
    subtitle: "Python nền tảng, rồi dữ liệu, luật, đánh giá, học máy, ngôn ngữ, tìm kiếm và AI có trách nhiệm",
    icon: "🤖",
    color: "#7C3AED",
    days: 60,
    exerciseIds: ["c1e1", "c2e1", "c4e1", "c5e1", "c7e1", "c8e1", "c23e1", "c32e2", "c32e3", "c38e1", "c38e3", "c38e4", "c38e6", "c38e9", "c39e1", "c39e2", "c39e4", "c39e6", "c39e8", "c39e10", "c40e2", "c40e3", "c40e4", "c40e7", "c40e8", "c41e1", "c41e3", "c41e5", "c41e6", "c41e7", "c42e2", "c42e4", "c42e5", "c42e7", "c42e9", "c43e2", "c43e3", "c43e5", "c43e8", "c43e9", "c44e2", "c44e4", "c44e8", "c44e10"],
  },

  {
    id: "path-30",
    title: "Python 30 ngày",
    subtitle: "Mỗi ngày 1 bài · từ print đến thuật toán nhẹ",
    icon: "📅",
    color: "#6D5EF6",
    days: 30,
    exerciseIds: ["c1e1", "c1e2", "c1e5", "c2e1", "c2e3", "c2e6", "c3e1", "c3e3", "c3e5", "c4e1", "c4e3", "c4e5", "c5e1", "c5e3", "c5e5", "c6e1", "c6e3", "c7e1", "c7e5", "c8e1", "c8e3", "c11e1", "c11e5", "c12e1", "c12e4", "c14e1", "c14e6", "c15e1", "c16e1", "c18e3"],
  },
  {
    id: "path-exam4",
    title: "Ôn thi 4 tuần",
    subtitle: "Củng cố if · vòng lặp · list · hàm trước kiểm tra",
    icon: "📝",
    color: "#DC2626",
    days: 28,
    weeks: {"Tuần 1 · Cơ bản & if": ["c1e1", "c1e5", "c2e1", "c2e4", "c4e1", "c4e2", "c4e5", "c12e1", "c12e2", "c15e6"], "Tuần 2 · Vòng lặp": ["c5e1", "c5e3", "c5e8", "c6e1", "c14e1", "c14e2", "c14e4", "c16e9", "c18e1", "c18e2"], "Tuần 3 · List & chuỗi": ["c7e1", "c7e5", "c7e7", "c13e1", "c13e6", "c13e7", "c16e1", "c16e4", "c9e9", "c9e10"], "Tuần 4 · Hàm & tổng hợp": ["c8e1", "c8e3", "c8e5", "c19e1", "c19e4", "c19e8", "c20e1", "c18e8", "c18e10", "c22e2"]},
    exerciseIds: ["c1e1", "c1e5", "c2e1", "c2e4", "c4e1", "c4e2", "c4e5", "c12e1", "c12e2", "c15e6", "c5e1", "c5e3", "c5e8", "c6e1", "c14e1", "c14e2", "c14e4", "c16e9", "c18e1", "c18e2", "c7e1", "c7e5", "c7e7", "c13e1", "c13e6", "c13e7", "c16e1", "c16e4", "c9e9", "c9e10", "c8e1", "c8e3", "c8e5", "c19e1", "c19e4", "c19e8", "c20e1", "c18e8", "c18e10", "c22e2"],
  },
  {
    id: "path-if",
    title: "Chủ đề: Rẽ nhánh if/else",
    subtitle: "Điều kiện, xếp loại, năm nhuận, menu logic",
    icon: "🔀",
    color: "#0D9488",
    exerciseIds: ["c4e1", "c4e2", "c4e3", "c4e5", "c4e7", "c12e1", "c12e2", "c12e12", "c15e6", "c15e8", "c18e3", "c21e4"],
  },
  {
    id: "path-loop",
    title: "Chủ đề: Vòng lặp for/while",
    subtitle: "range, tổng dãy, bảng cửu chương, đếm",
    icon: "🔁",
    color: "#2563EB",
    exerciseIds: ["c5e1", "c5e2", "c5e3", "c5e8", "c6e1", "c6e2", "c14e1", "c14e3", "c14e6", "c16e9", "c18e1", "c22e2"],
  },
  {
    id: "path-list",
    title: "Chủ đề: List & xử lý mảng",
    subtitle: "Duyệt, min/max, lọc, tìm kiếm",
    icon: "📋",
    color: "#D97706",
    exerciseIds: ["c7e1", "c7e2", "c7e5", "c7e7", "c9e9", "c9e10", "c16e1", "c16e4", "c16e7", "c20e3", "c20e4", "c20e7"],
  },
  {
    id: "path-func",
    title: "Chủ đề: Hàm (def)",
    subtitle: "Viết hàm, return, kết hợp list/if",
    icon: "🧩",
    color: "#7C3AED",
    exerciseIds: ["c8e1", "c8e2", "c8e3", "c8e5", "c19e1", "c19e2", "c19e4", "c19e5", "c19e8", "c19e9", "c18e8", "c18e9"],
  },
  {
    id: "path-algo",
    title: "Chủ đề: Thuật toán nhẹ",
    subtitle: "UCLN, nguyên tố, đảo, tìm kiếm, hoàn hảo",
    icon: "🧠",
    color: "#DB2777",
    exerciseIds: ["c14e4", "c16e10", "c16e11", "c18e10", "c20e1", "c20e2", "c20e4", "c20e8", "c22e2", "c22e6", "c19e9", "c20e10"],
  },
];

// Learning objectives for all 44 chapters. Chapters with custom-authored objectives
// are preserved; remaining chapters receive objectives based on their chapter topic.
for (const chapter of CHAPTERS) {
  if (!Array.isArray(chapter.objectives) || chapter.objectives.length < 2) {
    const topic = String(chapter.title || chapter.id).replace(/^Chương\s+\d+\s*:\s*/i, "").trim().replace(/[.·—–]+$/g, "");
    chapter.objectives = [
      `Giải thích được khái niệm, cú pháp và mục đích sử dụng ${topic.toLowerCase()}.`,
      `Vận dụng ${topic.toLowerCase()} để hoàn thành bài tập và tự kiểm tra kết quả của chương.`,
    ];
  }
}

/** Topic tags attached to exercises (used for quick filtering) */
export const TOPIC_TAGS = [
  { id: "print", label: "print / nhập xuất", match: ["print"] },
  { id: "variable", label: "Biến & phép tính", match: ["variable"] },
  { id: "if", label: "if / else", match: ["if"] },
  { id: "for", label: "for / range", match: ["for", "range"] },
  { id: "while", label: "while", match: ["while"] },
  { id: "list", label: "list", match: ["list"] },
  { id: "function", label: "hàm def", match: ["function"] },
  { id: "string", label: "chuỗi", match: ["fstring"] },
  { id: "dict", label: "Từ điển", match: ["dict"] },
];

export const ALL_EXERCISES = CHAPTERS.flatMap((c) =>
  c.exercises.map((e) => ({ ...e, chapterId: c.id, chapterTitle: c.title }))
);
export function findExercise(id) {
  return ALL_EXERCISES.find((e) => e.id === id) || null;
}
export function findChapter(id) {
  return CHAPTERS.find((c) => c.id === id) || null;
}
