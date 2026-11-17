// English — curriculum aligned with CEFR A1 to C1.
// Vocabulary: "word|meaning". Sentence building: words separated by spaces.
export default {
  id: "en", name: "Tiếng Anh", native: "English", flag: "🇬🇧", color: "#0EA5E9",
  speech: "en-US", framework: "CEFR", typeMode: "word", readingLabel: "từ tiếng Anh",
  readingHint: "Gõ từ tiếng Anh đúng chính tả.",
  desc: "Giáo trình CEFR A1 → C1: từ vựng, chính tả, ngữ pháp, ghép câu. Có trung tâm luyện thi TOEIC: học 7 Part và đề thi thử theo giờ.",
  levels: [
    {
      id: "a1", title: "CEFR A1", desc: "Chào hỏi, giới thiệu, gia đình, thói quen hằng ngày.",
      units: [
        {
          id: "1", title: "Chào hỏi và giới thiệu",
          words: `hello|xin chào
name|tên
student|học sinh
teacher|giáo viên
friend|bạn bè
country|đất nước
thank you|cảm ơn
goodbye|tạm biệt
good morning|chào buổi sáng
please|làm ơn
sorry|xin lỗi
classmate|bạn cùng lớp`,
          grammar: [
            ["I ___ a student.", ["am", "is", "are", "be"], 0, "Chủ ngữ I đi với am."],
            ["She ___ from Japan.", ["is", "am", "are", "be"], 0, "Ngôi thứ ba số ít dùng is."],
            ["___ is your name?", ["What", "Who", "Where", "How"], 0, "What is your name? = Bạn tên gì?"],
            ["They ___ my friends.", ["are", "is", "am", "be"], 0, "They đi với are."],
          ],
          sentences: [
            ["My name is Anna", "Tên tôi là Anna."],
            ["He is my teacher", "Ông ấy là giáo viên của tôi."],
            ["Where are you from", "Bạn đến từ đâu?"],
            ["Good morning everyone", "Chào buổi sáng mọi người."],
            ["Nice to meet you", "Rất vui được gặp bạn."],
            ["I am a new student", "Tôi là học sinh mới."],
            ["She is my best friend", "Cô ấy là bạn thân của tôi."],
          ],
        },
        {
          id: "2", title: "Gia đình và thói quen",
          words: `family|gia đình
mother|mẹ
father|bố
breakfast|bữa sáng
always|luôn luôn
usually|thường xuyên
work|làm việc
morning|buổi sáng
sister|chị gái, em gái
brother|anh trai, em trai
lunch|bữa trưa
evening|buổi tối`,
          grammar: [
            ["She ___ coffee every morning.", ["drinks", "drink", "drinking", "drank"], 0, "Hiện tại đơn, ngôi ba số ít thêm -s."],
            ["I ___ like fish.", ["don't", "doesn't", "isn't", "not"], 0, "Phủ định với I: don't + động từ."],
            ["___ your father work in a bank?", ["Does", "Do", "Is", "Are"], 0, "Câu hỏi ngôi ba số ít dùng Does."],
            ["We have breakfast ___ seven o'clock.", ["at", "in", "on", "by"], 0, "at + giờ cụ thể."],
          ],
          sentences: [
            ["My mother always gets up early", "Mẹ tôi luôn dậy sớm."],
            ["I usually have breakfast at seven", "Tôi thường ăn sáng lúc bảy giờ."],
            ["Does your father work on Sunday", "Bố bạn có làm việc vào Chủ nhật không?"],
            ["My sister likes music", "Chị tôi thích âm nhạc."],
            ["We eat lunch at noon", "Chúng tôi ăn trưa lúc giữa trưa."],
            ["My brother works in the evening", "Anh tôi làm việc vào buổi tối."],
            ["I have dinner with my family", "Tôi ăn tối cùng gia đình."],
            ["She gets up at six in the morning", "Cô ấy dậy lúc sáu giờ sáng."],
          ],
        },
      ],
    },
    {
      id: "a2", title: "CEFR A2", desc: "Mua sắm, du lịch, quá khứ đơn, so sánh.",
      units: [
        {
          id: "1", title: "Mua sắm và du lịch",
          words: `cheap|rẻ
expensive|đắt
ticket|vé
airport|sân bay
hotel|khách sạn
travel|du lịch
buy|mua
yesterday|hôm qua
shop|cửa hàng
price|giá cả
discount|giảm giá
souvenir|quà lưu niệm
suitcase|vali
passport|hộ chiếu
bargain|món hời`,
          grammar: [
            ["I ___ a new phone yesterday.", ["bought", "buy", "buys", "buying"], 0, "Quá khứ đơn của buy là bought."],
            ["This hotel is ___ than that one.", ["cheaper", "cheap", "cheapest", "more cheap"], 0, "Tính từ ngắn so sánh hơn thêm -er."],
            ["___ you go to Paris last year?", ["Did", "Do", "Were", "Have"], 0, "Câu hỏi quá khứ đơn dùng Did."],
            ["It is the ___ expensive ticket.", ["most", "more", "much", "very"], 0, "Tính từ dài so sánh nhất: the most."],
          ],
          sentences: [
            ["We went to the airport by taxi", "Chúng tôi đi taxi đến sân bay."],
            ["This bag is cheaper than that one", "Cái túi này rẻ hơn cái kia."],
            ["Did you buy the tickets", "Bạn đã mua vé chưa?"],            ["How much is this shirt?", "Chiếc áo này giá bao nhiêu?"],
            ["I want to buy a souvenir for my friend.", "Tôi muốn mua một món quà lưu niệm cho bạn tôi."],
            ["The hotel is near the beach.", "Khách sạn ở gần bãi biển."],
            ["We travelled by train last summer.", "Mùa hè năm ngoái chúng tôi đi du lịch bằng tàu hỏa."],
            ["Can I pay by card?", "Tôi có thể trả bằng thẻ không?"],
            ["This shop has a big discount today.", "Hôm nay cửa hàng này giảm giá nhiều."],
            ["Don't forget your passport before the trip.", "Đừng quên hộ chiếu trước chuyến đi."],

          ],
        },
        {
          id: "2", title: "Sức khỏe và thời tiết",
          words: `headache|đau đầu
doctor|bác sĩ
medicine|thuốc
rain|mưa
cold|lạnh
sunny|nắng
rest|nghỉ ngơi
weather|thời tiết
fever|sốt
cough|ho
healthy|khỏe mạnh
cloudy|nhiều mây
windy|nhiều gió
umbrella|ô, dù
hospital|bệnh viện`,
          grammar: [
            ["You ___ see a doctor.", ["should", "shouldn't to", "must to", "can to"], 0, "should + động từ nguyên mẫu: nên."],
            ["It ___ raining now.", ["is", "does", "has", "was being"], 0, "Hiện tại tiếp diễn: is + V-ing."],
            ["I ___ a headache.", ["have", "am", "do", "make"], 0, "have a headache: bị đau đầu."],
            ["It will ___ sunny tomorrow.", ["be", "is", "being", "been"], 0, "will + động từ nguyên mẫu."],
          ],
          sentences: [
            ["You should take some medicine", "Bạn nên uống thuốc."],
            ["It is very cold today", "Hôm nay trời rất lạnh."],
            ["I think it will rain tomorrow", "Tôi nghĩ ngày mai trời sẽ mưa."],            ["I have a fever and a cough.", "Tôi bị sốt và ho."],
            ["You should drink lots of water.", "Bạn nên uống nhiều nước."],
            ["It is cloudy and windy today.", "Hôm nay trời nhiều mây và nhiều gió."],
            ["Take an umbrella, it may rain.", "Hãy mang theo ô, trời có thể mưa."],
            ["She goes to the hospital when she is sick.", "Cô ấy đến bệnh viện khi bị ốm."],
            ["Eating vegetables keeps you healthy.", "Ăn rau giúp bạn khỏe mạnh."],
            ["The weather will be sunny at the weekend.", "Thời tiết cuối tuần sẽ nắng."],

          ],
        },
      ],
    },
    {
      id: "b1", title: "CEFR B1", desc: "Công việc, kinh nghiệm, hiện tại hoàn thành, câu điều kiện.",
      units: [
        {
          id: "1", title: "Công việc và kinh nghiệm",
          words: `interview|phỏng vấn
experience|kinh nghiệm
salary|tiền lương
colleague|đồng nghiệp
deadline|hạn chót
manager|quản lý
apply|nộp đơn
improve|cải thiện
promotion|thăng chức
overtime|làm thêm giờ
teamwork|làm việc nhóm
skill|kỹ năng
contract|hợp đồng
resign|từ chức, nghỉ việc
training|đào tạo`,
          grammar: [
            ["I ___ worked here since 2020.", ["have", "has", "am", "was"], 0, "Hiện tại hoàn thành: have + V3, với since."],
            ["If I ___ more time, I would learn Japanese.", ["had", "have", "will have", "having"], 0, "Câu điều kiện loại 2: If + quá khứ, would + V."],
            ["She has ___ finished the report.", ["already", "yet", "ever", "since"], 0, "already đứng giữa has và V3 trong câu khẳng định."],
            ["I'm looking forward to ___ from you.", ["hearing", "hear", "heard", "be heard"], 0, "look forward to + V-ing."],
          ],
          sentences: [
            ["I have worked here for three years", "Tôi đã làm việc ở đây được ba năm."],
            ["She applied for the job last week", "Cô ấy đã nộp đơn xin việc tuần trước."],
            ["If I had more time I would travel", "Nếu có nhiều thời gian hơn, tôi sẽ đi du lịch."],            ["I have just finished my training.", "Tôi vừa hoàn thành khóa đào tạo."],
            ["Our team works well together.", "Nhóm chúng tôi làm việc cùng nhau rất tốt."],
            ["She got a promotion last month.", "Cô ấy được thăng chức tháng trước."],
            ["I often work overtime on Fridays.", "Tôi thường làm thêm giờ vào thứ Sáu."],
            ["He signed a new contract yesterday.", "Anh ấy đã ký hợp đồng mới hôm qua."],
            ["I would like to improve my English for work.", "Tôi muốn cải thiện tiếng Anh cho công việc."],
            ["If I were the manager, I would listen more.", "Nếu tôi là quản lý, tôi sẽ lắng nghe nhiều hơn."],

          ],
        },
        {
          id: "2", title: "Cảm xúc và ý kiến",
          words: `opinion|ý kiến
agree|đồng ý
worried|lo lắng
proud|tự hào
disappointed|thất vọng
believe|tin tưởng
suggest|gợi ý
reason|lý do
nervous|lo lắng, hồi hộp
excited|hào hứng
confident|tự tin
disagree|không đồng ý
honest|trung thực
patient|kiên nhẫn
attitude|thái độ`,
          grammar: [
            ["I'm worried ___ the exam.", ["about", "of", "with", "for"], 0, "worried about: lo lắng về."],
            ["I suggest ___ earlier.", ["leaving", "to leave", "leave", "left"], 0, "suggest + V-ing."],
            ["She is proud ___ her son.", ["of", "about", "with", "on"], 0, "proud of: tự hào về."],
            ["In my ___, it is a good idea.", ["opinion", "think", "mind of", "view of"], 0, "In my opinion: theo ý tôi."],
          ],
          sentences: [
            ["In my opinion this is a good idea", "Theo ý tôi đây là một ý hay."],
            ["I am very proud of you", "Tôi rất tự hào về bạn."],
            ["She was disappointed with the result", "Cô ấy thất vọng với kết quả."],            ["I feel nervous before the exam.", "Tôi cảm thấy hồi hộp trước kỳ thi."],
            ["I strongly disagree with that idea.", "Tôi hoàn toàn không đồng ý với ý đó."],
            ["She is excited about her new job.", "Cô ấy hào hứng với công việc mới."],
            ["Please be honest with me.", "Hãy trung thực với tôi."],
            ["He is confident about the result.", "Anh ấy tự tin về kết quả."],
            ["You need to be patient with children.", "Bạn cần kiên nhẫn với trẻ em."],
            ["A positive attitude helps at work.", "Thái độ tích cực giúp ích trong công việc."],

          ],
        },
      ],
    },
    {
      id: "b2", title: "CEFR B2", desc: "Xã hội, môi trường, bị động, câu tường thuật.",
      units: [
        {
          id: "1", title: "Xã hội và môi trường",
          words: `pollution|ô nhiễm
environment|môi trường
unemployment|thất nghiệp
government|chính phủ
reduce|giảm
issue|vấn đề
sustainable|bền vững
policy|chính sách
awareness|nhận thức
recycle|tái chế
poverty|nghèo đói
equality|bình đẳng
climate change|biến đổi khí hậu
charity|từ thiện
urban|thuộc đô thị, thành thị`,
          grammar: [
            ["Plastic waste ___ recycled in many countries.", ["is", "has", "does", "are being to"], 0, "Bị động hiện tại: is + V3."],
            ["He said that he ___ tired.", ["was", "is", "will be", "has"], 0, "Câu tường thuật lùi thì: is → was."],
            ["___ the rain, we went out.", ["Despite", "Although", "Because", "Unless"], 0, "Despite + danh từ: mặc dù."],
            ["The government should ___ pollution.", ["reduce", "reducing", "to reduce", "reduced"], 0, "should + V nguyên mẫu."],
          ],
          sentences: [
            ["The new policy was introduced last year", "Chính sách mới được đưa ra năm ngoái."],
            ["We need to find sustainable solutions", "Chúng ta cần tìm giải pháp bền vững."],
            ["Despite the problems they kept working", "Bất chấp khó khăn, họ vẫn tiếp tục làm việc."],            ["We should raise awareness about climate change.", "Chúng ta nên nâng cao nhận thức về biến đổi khí hậu."],
            ["Many people recycle paper and plastic.", "Nhiều người tái chế giấy và nhựa."],
            ["The charity helps children in poverty.", "Tổ chức từ thiện giúp đỡ trẻ em nghèo."],
            ["Education promotes equality in society.", "Giáo dục thúc đẩy bình đẳng trong xã hội."],
            ["Urban life is busy but full of opportunities.", "Cuộc sống đô thị bận rộn nhưng đầy cơ hội."],
            ["The government introduced a plan to cut pollution.", "Chính phủ đã đưa ra kế hoạch cắt giảm ô nhiễm."],
            ["Protecting the environment is everyone's duty.", "Bảo vệ môi trường là trách nhiệm của mọi người."],

          ],
        },
        {
          id: "2", title: "Công nghệ và truyền thông",
          words: `device|thiết bị
data|dữ liệu
privacy|quyền riêng tư
advantage|lợi thế
drawback|nhược điểm
rely on|phụ thuộc vào
access|truy cập
content|nội dung
artificial intelligence|trí tuệ nhân tạo
algorithm|thuật toán
cyberbullying|bắt nạt trên mạng
influence|ảnh hưởng
addiction|nghiện
update|cập nhật
password|mật khẩu`,
          grammar: [
            ["If I had known, I ___ told you.", ["would have", "will have", "would", "had"], 0, "Điều kiện loại 3: would have + V3."],
            ["Many people rely ___ their phones.", ["on", "in", "at", "to"], 0, "rely on: phụ thuộc vào."],
            ["The data, ___ was collected online, is private.", ["which", "what", "who", "that"], 0, "Mệnh đề không xác định dùng which, không dùng that."],
            ["It's high time we ___ action.", ["took", "take", "taking", "taken"], 0, "It's high time + chủ ngữ + quá khứ đơn."],
          ],
          sentences: [
            ["Many people rely on social media for news", "Nhiều người phụ thuộc vào mạng xã hội để đọc tin."],
            ["We must protect our privacy online", "Chúng ta phải bảo vệ quyền riêng tư trên mạng."],
            ["If I had known I would have helped", "Nếu tôi biết thì tôi đã giúp rồi."],            ["Artificial intelligence is changing our daily life.", "Trí tuệ nhân tạo đang thay đổi cuộc sống hằng ngày của chúng ta."],
            ["Social media can influence young people strongly.", "Mạng xã hội có thể ảnh hưởng mạnh đến giới trẻ."],
            ["You should update your password regularly.", "Bạn nên cập nhật mật khẩu thường xuyên."],
            ["Many teenagers suffer from phone addiction.", "Nhiều thanh thiếu niên bị nghiện điện thoại."],
            ["Schools teach students to stop cyberbullying.", "Các trường học dạy học sinh ngăn chặn bắt nạt trên mạng."],
            ["The new algorithm shows you better content.", "Thuật toán mới cho bạn xem nội dung tốt hơn."],

          ],
        },
      ],
    },
    {
      id: "c1", title: "CEFR C1", desc: "Văn phong học thuật, đảo ngữ, sắc thái nghĩa.",
      units: [
        {
          id: "1", title: "Lập luận học thuật",
          words: `hypothesis|giả thuyết
evidence|bằng chứng
significant|đáng kể
nevertheless|tuy nhiên
undermine|làm suy yếu
consequently|do đó
comprehensive|toàn diện
subsequently|sau đó`,
          grammar: [
            ["Not only ___ the results surprising, but they were also reliable.", ["were", "was", "did", "had"], 0, "Đảo ngữ sau Not only: were + chủ ngữ."],
            ["___ had I arrived than the meeting began.", ["No sooner", "Hardly", "As soon", "Never"], 0, "No sooner… than…: vừa mới… thì…"],
            ["The evidence ___ to support the hypothesis.", ["seems", "seem", "seeming", "is seemed"], 0, "evidence là danh từ không đếm được → seems."],
            ["Little ___ he know about the plan.", ["did", "does he", "had", "was"], 0, "Đảo ngữ với Little: did + chủ ngữ + V."],
          ],
          sentences: [
            ["There is significant evidence to support this view", "Có bằng chứng đáng kể ủng hộ quan điểm này."],
            ["Nevertheless the results remain uncertain", "Tuy nhiên kết quả vẫn chưa chắc chắn."],
            ["No sooner had we arrived than it started to rain", "Chúng tôi vừa đến thì trời bắt đầu mưa."],
          ],
        },
        {
          id: "2", title: "Văn hóa và sắc thái",
          words: `heritage|di sản
nostalgia|hoài niệm
ephemeral|phù du
resilience|sự kiên cường
subtle|tinh tế
embrace|đón nhận
profound|sâu sắc
intricate|phức tạp, tinh xảo`,
          grammar: [
            ["Were I in your position, I ___ accept the offer.", ["would", "will", "had", "am"], 0, "Đảo ngữ điều kiện loại 2: Were I…, I would…"],
            ["The novel had a ___ impact on readers.", ["profound", "profoundly", "profundity", "profounder"], 0, "Cần tính từ bổ nghĩa cho danh từ impact."],
            ["Should you need help, ___ me.", ["call", "calling", "to call", "called"], 0, "Should you… = If you should…, mệnh đề sau là mệnh lệnh."],
            ["She has a ___ sense of humour.", ["subtle", "subtly", "subtlety", "subtler of"], 0, "Tính từ đứng trước danh từ."],
          ],
          sentences: [
            ["We should embrace our cultural heritage", "Chúng ta nên trân trọng di sản văn hóa của mình."],
            ["The beauty of the moment was ephemeral", "Vẻ đẹp của khoảnh khắc ấy thật phù du."],
            ["Were I in your position I would accept", "Nếu ở vào vị trí của bạn, tôi sẽ chấp nhận."],
          ],
        },
      ],
    },
  ],
};
