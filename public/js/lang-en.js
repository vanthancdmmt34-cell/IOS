/* 4.9.10 - English UI for Foreign Languages.
   Translates text nodes and title/placeholder/aria-label attributes as soon as the page renders,
   skipping .lx-vi regions (Vietnamese meanings of words/sentences - kept for Vietnamese learners).
   Runs before the general translator (i18n.js) because it is registered earlier. */
import { currentLang } from "./i18n.js";

const N = "(\\d[\\d.,]*)";
const R = (src, out) => [new RegExp("^" + src + "$"), out];
export const RULES = [
  // Home / subject picker
  R("Chào (.+), bạn muốn học gì\\?", "Hi $1, what would you like to learn?"),
  R("Chọn một môn để trang tổng quan tập trung vào môn đó\\. Bạn có thể đổi môn bất cứ lúc nào bằng nút", "Pick a subject and your overview will focus on it. You can switch at any time with the"),
  R("trên thanh trên cùng; tiến độ các môn luôn được giữ nguyên\\.", "button in the top bar; your progress in every subject is kept."),
  R(`${N} lộ trình · ${N} chương · ${N} bài tập tự chấm`, "$1 paths · $2 chapters · $3 auto-graded exercises"),
  R(`${N} chương · ${N}/${N} bài`, "$1 chapters · $2/$3 exercises"),
  R(`${N}/${N} bài đạt · ${N}%`, "$1/$2 passed · $3%"), R(`${N}/${N} bài đạt`, "$1/$2 passed"), R(`${N}/${N} bài đã đạt`, "$1/$2 passed"),
  R(`${N}/${N} bài · ${N}%`, "$1/$2 exercises · $3%"), R(`${N}/${N} bài`, "$1/$2 exercises"),
  R("Theo khung chuẩn quốc tế: HSK, JLPT, DELF, CEFR, TOPIK\\.", "Aligned with international frameworks: HSK, JLPT, DELF, CEFR, TOPIK, DELE."),
  R("Đổi nội dung học", "Switch subject"), R("Đổi môn học", "Switch subject"), R("Đổi môn", "Switch"), R("Chọn môn học", "Choose a subject"),
  R("Đang học", "Studying"), R("Học môn này", "Study this"),
  R("🐍 Đang học", "🐍 Studying"), R("Chọn lộ trình phù hợp với bạn\\.", "Choose the path that suits you."), R("Toàn bộ giáo trình", "Full curriculum"),
  // Subject overview
  R("Đang học · (.+)", "Studying · $1"), R("Cấp hiện tại:", "Current level:"),
  R("Học tiếp: (.+)", "Continue: $1"), R("Bắt đầu: (.+)", "Start: $1"),
  R("Bạn đã hoàn thành toàn bộ khóa!", "You have completed the whole course!"),
  R("Hoàn thành khóa", "Course complete"), R("Bài đã đạt", "Exercises passed"), R("Từ vựng đã thuộc", "Words learned"), R("Chuỗi ngày học 🔥", "Day streak 🔥"),
  R(`Ôn tập hôm nay: ${N} từ`, "Review today: $1 words"), R("Ôn tập từ vựng", "Vocabulary review"),
  R(`Đang theo dõi ${N} từ · từ hay sai được nhắc lại sau 1, 3, 7… ngày`, "Tracking $1 words · missed words come back after 1, 3, 7… days"),
  R("Làm bài từ vựng để bắt đầu theo dõi từ cần ôn", "Do vocabulary exercises to start tracking words to review"),
  R("Ôn ngay", "Review now"), R("Mở", "Open"), R("Lộ trình cấp độ", "Level path"), R("Xem toàn bộ khóa", "View full course"),
  R("🎓 Chứng nhận (.+)", "🎓 $1 certificate"), R("🏆 Xếp hạng (.+)", "🏆 $1 leaderboard"), R("Theo số bài đã đạt\\.", "By number of exercises passed."),
  R("Chưa có ai đạt bài nào\\. Hãy là người đầu tiên!", "No one has passed an exercise yet. Be the first!"),
  R("(.+) \\(bạn\\)", "$1 (you)"), R(`${N} bài đạt`, "$1 passed"), R("Làm gần đây", "Recent activity"),
  R("(.+) — bài học", "$1 — lessons"),
  // Levels, lessons
  R("(.+) · (\\d+) CẤP ĐỘ", "$1 · $2 LEVELS"), R("Bài (\\w+): (.+)", "Lesson $1: $2"),
  R(`${N} từ vựng · bổ sung`, "$1 words · added"), R(`${N} từ vựng`, "$1 words"),
  R("Lý thuyết", "Theory"), R("Từ vựng · quy tắc · mẫu câu", "Vocabulary · rules · sample sentences"), R("Học trước", "Study first"),
  R(`${N} câu · ${N} lần nộp`, "$1 questions · $2 submissions"), R(`${N} câu`, "$1 questions"),
  R(`${N} câu tổng hợp · đạt từ ${N} điểm`, "$1 mixed questions · pass at $2 points"),
  R("Chưa làm", "Not started"), R("Pro", "Pro"), R("ẩn", "hidden"),
  R("(.+) dành cho thành viên Pro", "$1 is for Pro members"),
  R(`${N} bài học · ${N} bài tập tự chấm, có lý thuyết, luyện nghe, luyện nói và gia sư AI\\.`, "$1 lessons · $2 auto-graded exercises with theory, listening, speaking and an AI tutor."),
  R("Nội dung dành cho thành viên Pro", "Pro members only"), R("Nâng cấp Pro", "Upgrade to Pro"), R("Về trang chủ", "Back to home"),
  R("Không tìm thấy khóa học\\.?", "Course not found."), R("Khóa này chưa có cấp độ nào\\.", "This course has no levels yet."),
  // Theory
  R("Lý thuyết bài (\\w+)", "Lesson $1 theory"), R("(.+) · LÝ THUYẾT", "$1 · THEORY"),
  R("Đọc và nghe trước, rồi làm (\\d+) dạng bài tập bên dưới\\. Có thắc mắc, bấm", "Read and listen first, then do the $1 exercise types below. Questions? Tap"),
  R("Đọc và nghe trước, rồi làm 4 dạng exercises bên dưới\\. Có thắc mắc, bấm", "Read and listen first, then do the exercises below. Questions? Tap"),
  R("— gia sư biết bạn đang học bài này\\.", "— the tutor knows which lesson you are on."),
  R("📐 Quy tắc nền tảng của (.+)", "📐 $1 fundamentals"), R(`📖 Từ vựng \\(${N}\\)`, "📖 Vocabulary ($1)"), R("🧩 Quy tắc ngữ pháp", "🧩 Grammar rules"), R("💬 Mẫu câu", "💬 Sample sentences"),
  R("Từ", "Word"), R("Nghĩa", "Meaning (Vietnamese)"), R("pinyin", "pinyin"), R("cách đọc", "reading"), R("phiên âm", "romanization"),
  R("💬 Hỏi AI giải thích bài này", "💬 Ask AI to explain this lesson"), R("Luyện tập", "Practice"), R("Làm bài →", "Start →"), R("Hỏi AI", "Ask AI"),
  // Practice
  R("Đọc đoạn văn \\(có thể bấm (?:loa|🔊) để nghe\\), rồi trả lời các câu hỏi\\. Đạt từ (\\d+) điểm\\. Điểm cao nhất:", "Read the passage (tap the speaker to listen), then answer the questions. Pass at $1 points. Best score:"),
  R("Chọn đáp án đúng cho mỗi câu\\. Đạt từ (\\d+) điểm\\. Điểm cao nhất:", "Choose the correct answer for each question. Pass at $1 points. Best score:"),
  R("Chọn đáp án đúng cho mỗi câu\\. Thời gian làm bài (\\d+) phút\\. Đạt từ (\\d+) điểm\\. Điểm cao nhất:", "Choose the correct answer for each question. Time limit $1 min. Pass at $2 points. Best score:"),
  R("Gợi ý cách nói: (.+)", "Tip: $1"),
  R("(.+) · Luyện thi (.+)", "$1 · Practice test $2"),
  R("Ghép các từ thành câu đúng với nghĩa tiếng Việt\\. Đạt từ (\\d+) điểm\\. Điểm cao nhất:", "Arrange the words into the sentence that matches the Vietnamese meaning. Pass at $1 points. Best score:"),
  R("Bấm nút Nghe \\(nghe lại bao nhiêu lần cũng được\\) rồi chọn từ bạn nghe thấy\\. Đạt từ (\\d+) điểm\\. Điểm cao nhất:", "Tap Listen (as many times as you like) and choose the word you hear. Pass at $1 points. Best score:"),
  R("Bấm loa để nghe mẫu, rồi bấm micro và đọc to\\. Máy so câu bạn nói với câu mẫu, giống từ 75% là đúng\\. Nên dùng Chrome hoặc Edge\\. Đạt từ (\\d+) điểm\\. Điểm cao nhất:", "Tap the speaker to hear the model, then tap the microphone and read aloud. Your speech is compared with the model; 75% or more counts as correct. Chrome or Edge recommended. Pass at $1 points. Best score:"),
  R("(.+) Đạt từ (\\d+) điểm\\. Điểm cao nhất:", "$1 Pass at $2 points. Best score:"),
  R(`· đã nộp ${N} lần\\.`, "· $1 submissions."), R("\\.", "."),
  R("📌", "📌"), R("Bài giao của lớp\\.", "Class assignment."), R("Kết quả lần nộp sẽ gửi cho giáo viên\\.(.*)", "Your result will be sent to the teacher.$1"), R("Về lớp của tôi", "My classes"),
  R(`Đã ghi lần nộp ${N} cho giáo viên( \\(nộp muộn\\))?\\.`, "Submission $1 recorded for the teacher."),
  R("Chúc mừng, bạn đã đạt bài này!", "Congratulations, you passed!"), R("Chưa đạt, xem lại đáp án và làm lại nhé\\.", "Not passed yet — review the answers and try again."),
  R(`${N}/${N} câu đúng · điểm cao nhất ${N}`, "$1/$2 correct · best score $3"),
  R("Làm lại", "Try again"), R("Bài tiếp theo →", "Next exercise →"), R("Về cấp độ", "Back to level"),
  R("✓ Đúng", "✓ Correct"), R("✗ Đáp án:", "✗ Answer:"), R("💬 Hỏi AI vì sao", "💬 Ask AI why"), R("💬 AI nhận xét phát âm", "💬 AI pronunciation feedback"),
  R("Luyện viết", "Writing practice"), R("Luyện viết chữ", "Character writing"), R("Tô theo chữ mờ trong khung, rồi bấm", "Trace the faint character in the box, then tap"), R("Chấm", "Check"),
  R(`\\. Máy so nét bạn viết với hình chữ \\(không chấm thứ tự nét\\)\\. Đạt từ ${N} điểm\\. Đã đạt ${N}/${N} chữ\\.`, ". The system compares your strokes with the character shape (stroke order is not checked). Pass at $1 points. Passed $2/$3 characters."),
  R("← Chữ trước", "← Previous"), R("Chữ sau →", "Next →"), R("Xóa", "Clear"), R("Hoàn tác nét", "Undo stroke"), R("Hiện chữ mờ", "Show guide"),
  R(`${N} điểm`, "$1 points"), R(`· phủ chữ ${N}% · nét đúng chỗ ${N}%`, "· coverage $1% · accuracy $2%"),
  R(`${N}/${N} chưa đạt · TB ${N}`, "$1/$2 not passed · avg $3"), R(`Điểm là điểm cao nhất mỗi bài; đạt từ ${N} điểm\\. Xanh ≥ 80, vàng 50–79, đỏ < 50\\.`, "Scores are the best score per exercise; pass at $1. Green ≥ 80, amber 50–79, red < 50."),
  R(`${N}/${N}`, "$1/$2"), R("học viên đã học", "students active"), R("điểm trung bình", "average score"), R("Tiến độ từng học viên", "Progress by student"), R("Học viên", "Student"), R("Cấp đã đạt", "Level reached"), R("Bài đạt", "Passed"), R("Điểm TB", "Avg"), R("Hoạt động gần nhất", "Last activity"), R("Chưa làm bài nào", "No exercises yet"), R("Bài cả lớp hay sai", "Exercises the class struggles with"), R("Chưa có bài nào nhiều học viên chưa đạt\\.", "No exercise is causing trouble yet."), R("Lớp chưa có học viên\\.", "The class has no students yet."), R("Học viên trong lớp chưa làm bài ngoại ngữ nào\\.", "No student in this class has done a language exercise yet."),
  R("🔊 Nghe", "🔊 Listen"), R("Nghe", "Listen"), R("Nghe từ vựng mẫu", "Listen to sample word"), R("Nghe và chọn từ bạn nghe được", "Listen and choose the word you hear"),
  R("🎤 Bấm và đọc to câu", "🎤 Tap and read aloud"), R("⏺ Đang nghe… nói ngay", "⏺ Listening… speak now"), R("⏹ Đang nghe… bấm để dừng", "⏹ Listening… tap to stop"), R("Đang nghe… \\(Dừng\\)", "Listening… (Stop)"), R("Tự ngắt khi dứt câu", "Auto-stops after sentence"), R("🎤 Đọc lại", "🎤 Read again"), R(`Đọc một đoạn văn và trả lời ${N} câu hỏi`, "Read a passage and answer $1 questions"), R("Đọc hiểu", "Reading"),
  R(`Giống câu mẫu ${N}%`, "Match $1%"), R("· tốt, có thể nộp", "· good, ready to submit"), R("· thử đọc lại chậm và rõ hơn", "· try again, slower and clearer"),
  R("Bấm các từ bên dưới theo đúng thứ tự", "Tap the words below in the right order"),
  R(`${N}/${N} câu đã trả lời`, "$1/$2 answered"), R("Nộp bài", "Submit"), R("Đang chấm…", "Grading…"),
  R("Nộp bài\\?", "Submit?"), R(`Còn ${N} câu chưa trả lời\\. Câu bỏ trống sẽ tính là sai\\.`, "$1 questions are unanswered and will count as wrong."), R("Vẫn nộp", "Submit anyway"), R("Hủy", "Cancel"),
  R(`Đạt ${N} điểm!`, "Passed with $1 points!"), R(`${N} điểm — chưa đạt`, "$1 points — not passed"),
  // Review
  R("(.+) · ÔN TẬP", "$1 · REVIEW"), R(`Thẻ ${N}/${N}`, "Card $1/$2"),
  R("Nhớ nghĩa trước, rồi bấm lật thẻ để kiểm tra\\. Tự đánh giá thật lòng nhé\\.", "Recall the meaning first, then flip the card to check. Be honest with yourself."),
  R("Bấm vào thẻ để lật", "Tap the card to flip"), R("😕 Chưa nhớ", "😕 Not yet"), R("😀 Nhớ rồi", "😀 Got it"),
  R(`(.+) · (.+) · đã sai ${N} lần`, "$1 · $2 · missed $3 times"),
  R(`Xong lượt ôn: nhớ ${N}/${N} từ`, "Review done: remembered $1/$2 words"), R("Hôm nay không có từ nào cần ôn", "Nothing to review today"),
  R("Từ chưa nhớ sẽ được nhắc lại ngay lần ôn sau; từ đã nhớ sẽ giãn dần 1, 3, 7, 14, 30 ngày\\.", "Words you missed come back next time; remembered words space out to 1, 3, 7, 14, 30 days."),
  R("Làm thêm bài từ vựng, nghe hoặc phiên âm để có từ ôn tập\\.", "Do more vocabulary, listening or reading exercises to get words to review."),
  R("Về trang môn học", "Back to subject"), R("Ôn tiếp", "Keep reviewing"), R("Ôn tập", "Review"),
  // Achievements
  R("(.+) · THÀNH TÍCH", "$1 · ACHIEVEMENTS"), R("Chứng nhận (.+)", "$1 certificates"), R("Bảng xếp hạng (.+)", "$1 leaderboard"), R("Huy hiệu (.+)", "$1 badges"),
  R("Đạt toàn bộ bài tập và bài kiểm tra của một cấp để nhận chứng nhận cấp đó\\.", "Pass every exercise and the test of a level to earn its certificate."),
  R("Đạt toàn bộ exercises và bài kiểm tra của một cấp để nhận chứng nhận cấp đó\\.", "Pass every exercise and the test of a level to earn its certificate."),
  R("Xem chứng nhận", "View certificate"), R("Học tiếp", "Continue"),
  R(`Xếp theo số bài đã đạt \\(từ ${N} điểm\\), bằng nhau thì xét tổng điểm\\.`, "Ranked by exercises passed (from $1 points); ties broken by total score."),
  R(`Đã đạt ${N}/${N} huy hiệu\\.`, "Earned $1/$2 badges."), R("Đã đạt", "Earned"), R("huy hiệu\\.", "badges."),
  R("Bước đầu tiên", "First step"), R("Đạt bài đầu tiên", "Pass your first exercise"), R("Chăm chỉ", "Diligent"), R("Bền bỉ", "Persistent"),
  R(`Đạt ${N} bài`, "Pass $1 exercises"), R(`Đạt ${N} (?:lessons|exercises)`, "Pass $1 exercises"),
  R(`Vốn từ ${N}`, "$1-word vocabulary"), R(`Thuộc ${N} (?:từ vựng|words)`, "Learn $1 words"),
  R("Đôi tai thính", "Sharp ears"), R(`Đạt ${N} bài luyện nghe`, "Pass $1 listening exercises"), R("Tự tin nói", "Confident speaker"), R(`Đạt ${N} bài luyện nói`, "Pass $1 speaking exercises"),
  R("Vững ngữ pháp", "Grammar solid"), R(`Đạt ${N} bài ngữ pháp`, "Pass $1 grammar exercises"), R("Hoàn hảo", "Perfect"), R(`${N} bài đạt ${N} (?:điểm|points)`, "$1 exercises with $2 points"),
  R("Ôn đều tay", "Steady reviewer"), R(`Theo dõi ${N} từ trong thẻ ôn tập`, "Track $1 words in review cards"),
  R(`Chuỗi ${N} (?:ngày|days)`, "$1-day streak"), R(`Học ${N} ngày liên tiếp`, "Study $1 days in a row"),
  R("Hoàn thành (.+)", "Complete $1"), R("Đạt hết bài của (.+)", "Pass every exercise in $1"),
  R("Chưa đủ điều kiện nhận chứng nhận (.+)", "Not yet eligible for the $1 certificate"),
  R(`Cần đạt tất cả ${N} bài của cấp \\(đã đạt ${N}\\)\\.`, "Pass all $1 exercises of the level ($2 passed so far)."),
  R("CHỨNG NHẬN HOÀN THÀNH", "CERTIFICATE OF COMPLETION"), R("Chứng nhận học viên", "This certifies that"),
  R("đã hoàn thành toàn bộ bài học và bài kiểm tra", "has completed all lessons and the level test"),
  R("Theo khung (.+) · Điểm kiểm tra cấp độ:", "Framework: $1 · Level test score:"), R("Ngày cấp: (.+)", "Issued: $1"), R("Mã: (.+)", "Code: $1"),
  R("🖨 In / Lưu PDF", "🖨 Print / Save PDF"), R("Cổng Học Tập", "Learning Portal"),
  // Sidebar, small buttons
  R("Tiến độ (.+)", "$1 progress"), R("Nghe đọc", "Listen"), R("Lật thẻ", "Flip card"), R("Bàn phím ký tự", "Character keyboard"),
  R("Câu máy nghe được \\(có thể gõ nếu không có micro\\)", "What the device heard (you can type if you have no microphone)"), R("Nhập câu trả lời", "Type your answer"),
  R("Đang tải…", "Loading…"), R("Trang chủ", "Home"), R("Kiểm tra cấp độ", "Level test"),
  // Admin
  R("QUẢN TRỊ", "ADMIN"), R("Quản lý Ngoại ngữ", "Language management"), R("Thống kê học viên, bật/tắt khóa và cấp độ, bổ sung bài học mới\\.", "Learner statistics, show/hide courses and levels, add new lessons."),
  R("Câu học viên hay sai", "Most-missed questions"), R("Câu có tỉ lệ sai cao \\(ít nhất 3 lượt trả lời\\)\\. Xem lại đề, đáp án hoặc bổ sung lý thuyết cho bài đó\\.", "Questions with high error rates (at least 3 answers). Review the question, the answer, or add theory for that lesson."),
  R("Chưa đủ dữ liệu\\. Thống kê xuất hiện khi mỗi câu có ít nhất 3 lượt trả lời\\.", "Not enough data yet. Statistics appear once a question has at least 3 answers."),
  R("(\\w+) · (\\w+) · Bài (\\w+)", "$1 · $2 · Lesson $3"), R("Bài", "Exercise"), R("Câu hỏi", "Question"), R("Đáp án", "Answer"), R("Lượt", "Answers"), R("Sai", "Wrong"),
  R("Khóa học và cấp độ", "Courses and levels"), R("Bỏ chọn để ẩn với học viên \\(quản trị viên vẫn thấy để xem trước\\)\\.", "Untick to hide from learners (admins still see them for preview)."),
  R("Lưu hiển thị", "Save visibility"), R("học viên", "learners"), R("lượt nộp", "submissions"), R("bài đạt", "passed"), R("điểm TB", "avg score"),
  R(`${N} bài · ${N} phần`, "$1 lessons · $2 exercises"),
  R("Phân quyền Pro", "Pro access"), R("Chọn từ cấp nào trở lên chỉ dành cho thành viên Pro\\. Cấp thấp hơn miễn phí\\.", "Choose the level from which content is Pro-only. Lower levels are free."),
  R("Lưu phân quyền", "Save access"), R("Miễn phí toàn bộ", "Free for all"), R("Pro từ (.+)", "Pro from $1"),
  R("Nhập từ vựng hàng loạt \\(CSV\\)", "Bulk vocabulary import (CSV)"), R("Mỗi dòng:", "Each line:"), R("\\(Anh/Pháp:", "(English/French:"),
  R("\\)\\. Hệ thống tự chia mỗi 8 từ thành một bài học mới ở cuối cấp đã chọn\\.", "). Every 8 words become a new lesson at the end of the chosen level."),
  R("Tên chủ đề \\(vd: Từ vựng HSK 1\\)", "Topic name (e.g. HSK 1 vocabulary)"), R("Nhập và tạo bài học", "Import and create lessons"),
  R("Bổ sung bài học", "Add a lesson"), R("Bài mới được thêm vào cuối cấp độ, tự sinh 4 dạng bài tập và chấm tự động\\. Dùng lại mã bài để sửa bài đã bổ sung\\.", "New lessons are added at the end of the level with auto-generated, auto-graded exercises. Reuse a lesson id to edit it."),
  R("Lưu bài học", "Save lesson"), R("Sửa", "Edit"), R("Xóa", "Delete"),
  // 5.1.0
  R("Tìm khóa học…", "Search courses…"), R("Tìm khóa học", "Search courses"), R("Nhóm môn", "Subject group"), R("Tất cả", "All"), R("Ngoại ngữ", "Languages"),
  R("Mọi trạng thái", "Any status"), R("Chưa bắt đầu", "Not started"), R("Đã hoàn thành", "Completed"), R("Lọc theo trạng thái", "Filter by status"), R("Sắp xếp", "Sort"),
  R("Sắp xếp: mặc định", "Sort: default"), R("Tiến độ cao nhất", "Most progress"), R("Tên A–Z", "Name A–Z"), R(`${N}/${N} khóa học`, "$1/$2 courses"), R(`${N} cấp Pro`, "$1 Pro levels"),
  R("Tiếp tục học", "Continue"), R("Bắt đầu học", "Start"), R("Không tìm thấy khóa học phù hợp", "No matching courses"), R("Thử từ khóa khác hoặc bỏ bớt bộ lọc.", "Try another keyword or remove a filter."),
  R("Bài trước", "Previous"), R("Bài sau", "Next"), R("Lý thuyết", "Theory"), R("Danh sách bài", "Lesson list"), R("Điều hướng bài", "Lesson navigation"),
  // 4.11.1
  R(`${N} từ vựng · ${N} bài tập`, "$1 words · $2 exercises"), R(`${N} từ vựng · ${N} bài tập · bổ sung`, "$1 words · $2 exercises · added"),
  R("Phòng luyện nói", "Speaking studio"), R("Trò chuyện với AI", "Talk with AI"),
  R("Hội thoại theo tình huống, AI sửa câu và gợi ý câu tiếp theo", "Role-play scenes; the AI corrects you and suggests what to say next"),
  R("Đọc theo từ, câu, đoạn văn của cấp này · chấm từng từ · trò chuyện với AI", "Read along with this level's words, sentences and passage · word-by-word scoring · talk with AI"),
  R("Luyện đọc từ vựng bài này", "Practise saying these words"), R("Đọc theo mẫu câu", "Shadow the sentences"), R("Đọc chậm", "Slow speed"),
];
// 4.11.1: UI stripped emojis from text (replaced with line icons) -> add emoji-free variants of all emoji rules.
{
  const EMO = /\s*(?:[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]\uFE0F?)+\s*/gu;
  const strip = (x) => x.replace(EMO, " ").replace(/\s{2,}/g, " ").replace(/^\^ /, "^").replace(/ \$$/, "$").trim();
  for (const [re, out] of RULES.slice()) { if (re.source !== strip(re.source)) { try { RULES.push([new RegExp(strip(re.source)), strip(out)]); } catch {} } }
}

function tr(text) {
  const t = text.trim();
  if (!t || !/[ăâđêôơưàáảãạèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵằắẳẵặầấẩẫậềếểễệồốổỗộờớởỡợừứửữựĐ]/i.test(t)) return null;
  for (const [re, out] of RULES) if (re.test(t)) return text.replace(t, t.replace(re, out));
  return null;
}
const SKIP = (el) => !el || el.closest(".lx-vi, script, style, textarea, pre, code, [data-i18n='off']");
function pass(root) {
  if (currentLang() !== "en" || !root) return;
  if (root.nodeType === 3) { if (!SKIP(root.parentElement)) { const v = tr(root.nodeValue); if (v != null) root.nodeValue = v; } return; }
  if (root.nodeType !== 1 || SKIP(root)) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n; const todo = [];
  while ((n = w.nextNode())) if (!SKIP(n.parentElement)) todo.push(n);
  for (const x of todo) { const v = tr(x.nodeValue); if (v != null) x.nodeValue = v; }
  const els = [root, ...root.querySelectorAll("[title],[placeholder],[aria-label]")];
  for (const e of els) for (const a of ["title", "placeholder", "aria-label"]) { const v = e.getAttribute && e.getAttribute(a); if (v) { const r = tr(v); if (r != null) e.setAttribute(a, r); } }
}
// Only apply to foreign language regions (lx-* pages, subject bar, progress menu, toasts, dialogs)
const SCOPE = "#crumbs, .lx-hero, .lx-focus-hero, .lx-tabs, .lx-sec, .lx-ex-page, .lx-pro-card, .lx-cert-wrap, .lx-cert-list, .lx-badges, .lx-lb, .lx-subj, .lx-focus-bar, .lx-kpis, .lx-review, .lx-levels, .lx-units, #sbLv, #sbXp, .toasts, .modal, .page-head, .lx-admin-grid, .lx-pro-grid, .lx-admin-form, .lx-custom-list, .lx-theory, .lx-kbd, .lx-write, .lx-report";
function inScope(node) { const el = node.nodeType === 1 ? node : node.parentElement; return !!(el && (el.closest(SCOPE) || el.querySelector && el.querySelector(SCOPE))); }
export function enPass(root = document.body) {
  if (currentLang() !== "en") return;
  root.querySelectorAll ? (root.matches && root.matches(SCOPE) ? pass(root) : root.querySelectorAll(SCOPE).forEach(pass)) : pass(root);
}
const obs = new MutationObserver((muts) => {
  if (currentLang() !== "en") return;
  for (const m of muts) {
    if (m.type === "characterData") { if (inScope(m.target)) pass(m.target); continue; }
    for (const n of m.addedNodes) if (inScope(n)) { if (n.nodeType === 1 && !n.closest(SCOPE)) n.querySelectorAll(SCOPE).forEach(pass); else pass(n); }
  }
});
obs.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
