// CEFR expansion (units 3 and 4 per level). Only append at the end.
export default {
  a1: [
    { id: "3", title: "Đồ ăn và mua sắm",
      words: `bread|bánh mì
water|nước
apple|quả táo
shop|cửa hàng
price|giá
money|tiền
want|muốn
some|một ít`,
      grammar: [
        ["How ___ is this shirt?", ["much", "many", "long", "old"], 0, "How much hỏi giá tiền."],
        ["There ___ some apples on the table.", ["are", "is", "be", "am"], 0, "Danh từ số nhiều: there are."],
        ["I would like ___ water, please.", ["some", "a", "many", "an"], 0, "water không đếm được → some."],
        ["Can I ___ this bag?", ["buy", "buys", "buying", "to buy"], 0, "can + động từ nguyên mẫu."],
      ],
      sentences: [["How much is this bag", "Cái túi này bao nhiêu tiền?"], ["I would like some bread", "Tôi muốn một ít bánh mì."], ["There are two apples on the table", "Có hai quả táo trên bàn."]] },
    { id: "4", title: "Thời gian và ngày tháng",
      words: `today|hôm nay
tomorrow|ngày mai
week|tuần
month|tháng
o'clock|giờ đúng
weekend|cuối tuần
birthday|sinh nhật
early|sớm`,
      grammar: [
        ["My birthday is ___ May.", ["in", "on", "at", "by"], 0, "in + tháng."],
        ["The class starts ___ Monday.", ["on", "in", "at", "to"], 0, "on + thứ trong tuần."],
        ["What time ___ it?", ["is", "are", "does", "do"], 0, "What time is it? = Mấy giờ rồi?"],
        ["I ___ go to school at the weekend.", ["don't", "doesn't", "not", "am not"], 0, "Phủ định hiện tại đơn với I."],
      ],
      sentences: [["What time is it now", "Bây giờ là mấy giờ?"], ["My birthday is in May", "Sinh nhật tôi vào tháng Năm."], ["I get up early every day", "Tôi dậy sớm mỗi ngày."]] },
  ],
  a2: [
    { id: "3", title: "Sở thích và thời gian rảnh",
      words: `hobby|sở thích
music|âm nhạc
football|bóng đá
swimming|bơi lội
painting|vẽ tranh
enjoy|thích, tận hưởng
free time|thời gian rảnh
often|thường`,
      grammar: [
        ["I enjoy ___ football.", ["playing", "play", "to play", "played"], 0, "enjoy + V-ing."],
        ["She is good ___ painting.", ["at", "in", "on", "for"], 0, "good at: giỏi về."],
        ["How often ___ you go swimming?", ["do", "does", "are", "is"], 0, "Câu hỏi hiện tại đơn với you."],
        ["We are going ___ watch a film tonight.", ["to", "for", "at", "-ing"], 0, "be going to + V: dự định."],
      ],
      sentences: [["I enjoy listening to music", "Tôi thích nghe nhạc."], ["She is good at swimming", "Cô ấy bơi giỏi."], ["We are going to play football", "Chúng tôi sắp đi đá bóng."]] },
    { id: "4", title: "Nhà ở và thành phố",
      words: `apartment|căn hộ
neighbour|hàng xóm
street|đường phố
library|thư viện
crowded|đông đúc
quiet|yên tĩnh
between|ở giữa
opposite|đối diện`,
      grammar: [
        ["The bank is ___ the post office and the café.", ["between", "among", "opposite to", "next"], 0, "between A and B."],
        ["There ___ a library near my house.", ["is", "are", "have", "has"], 0, "Danh từ số ít: there is."],
        ["My town is ___ than yours.", ["quieter", "more quiet than", "quietest", "quiet"], 0, "quiet → quieter."],
        ["We used ___ live in a small village.", ["to", "for", "-", "at"], 0, "used to + V: đã từng (thói quen cũ)."],
      ],
      sentences: [["The library is opposite the park", "Thư viện ở đối diện công viên."], ["My street is very quiet", "Con phố của tôi rất yên tĩnh."], ["We used to live in the city", "Chúng tôi từng sống ở thành phố."]] },
  ],
  b1: [
    { id: "3", title: "Du lịch và trải nghiệm",
      words: `journey|chuyến đi
destination|điểm đến
luggage|hành lý
abroad|ở nước ngoài
delay|sự chậm trễ
book|đặt (chỗ)
recommend|giới thiệu, khuyên
explore|khám phá`,
      grammar: [
        ["Have you ever ___ abroad?", ["been", "gone to", "went", "be"], 0, "Have you ever been…? = Bạn đã từng…?"],
        ["The flight was delayed ___ the storm.", ["because of", "because", "although", "so"], 0, "because of + danh từ."],
        ["I'd recommend ___ a hotel early.", ["booking", "to book", "book", "booked"], 0, "recommend + V-ing."],
        ["While we ___ the city, it started to rain.", ["were exploring", "explored", "explore", "have explored"], 0, "Quá khứ tiếp diễn với while."],
      ],
      sentences: [["Have you ever been abroad", "Bạn đã từng ra nước ngoài chưa?"], ["Our flight was delayed because of the storm", "Chuyến bay bị hoãn vì bão."], ["I recommend booking the hotel early", "Tôi khuyên nên đặt khách sạn sớm."]] },
    { id: "4", title: "Học tập và kỹ năng",
      words: `knowledge|kiến thức
skill|kỹ năng
practise|luyện tập
progress|sự tiến bộ
mistake|lỗi sai
goal|mục tiêu
achieve|đạt được
fluent|lưu loát`,
      grammar: [
        ["I have been learning English ___ two years.", ["for", "since", "during", "ago"], 0, "for + khoảng thời gian."],
        ["You will improve ___ you practise every day.", ["if", "unless", "although", "but"], 0, "Câu điều kiện loại 1."],
        ["It's important ___ from your mistakes.", ["to learn", "learning", "learn", "learned"], 0, "It's important + to V."],
        ["She speaks English ___.", ["fluently", "fluent", "fluency", "more fluent"], 0, "Trạng từ bổ nghĩa cho động từ."],
      ],
      sentences: [["I have been learning English for two years", "Tôi đã học tiếng Anh được hai năm."], ["You will improve if you practise", "Bạn sẽ tiến bộ nếu luyện tập."], ["Making mistakes is part of learning", "Mắc lỗi là một phần của việc học."]] },
  ],
  b2: [
    { id: "3", title: "Sức khỏe và lối sống",
      words: `wellbeing|sức khỏe tinh thần
stress|căng thẳng
balance|cân bằng
diet|chế độ ăn
habit|thói quen
cope with|đối phó với
benefit|lợi ích
lifestyle|lối sống`,
      grammar: [
        ["She managed ___ her stress by exercising.", ["to cope with", "coping with", "cope", "coped"], 0, "manage + to V."],
        ["I wish I ___ more time to relax.", ["had", "have", "will have", "having"], 0, "wish + quá khứ đơn: ước ở hiện tại."],
        ["You'd better ___ less sugar.", ["eat", "to eat", "eating", "ate"], 0, "had better + V nguyên mẫu."],
        ["Regular exercise ___ many benefits.", ["has", "have", "is having", "are"], 0, "exercise (không đếm được) → has."],
      ],
      sentences: [["Regular exercise has many benefits", "Tập thể dục đều đặn có nhiều lợi ích."], ["It is hard to keep a healthy balance", "Thật khó để giữ sự cân bằng lành mạnh."], ["I wish I had more free time", "Ước gì tôi có nhiều thời gian rảnh hơn."]] },
    { id: "4", title: "Kinh doanh và tiêu dùng",
      words: `customer|khách hàng
profit|lợi nhuận
brand|thương hiệu
competition|cạnh tranh
launch|ra mắt
demand|nhu cầu
affordable|giá phải chăng
advertise|quảng cáo`,
      grammar: [
        ["The product ___ next month.", ["will be launched", "will launch", "launches by", "is launching by"], 0, "Bị động tương lai: will be + V3."],
        ["The company, ___ was founded in 1990, is very successful.", ["which", "that", "who", "what"], 0, "Mệnh đề không xác định dùng which."],
        ["Demand has risen ___ 20 percent.", ["by", "with", "at", "of"], 0, "rise by + mức tăng."],
        ["They need to make products more ___.", ["affordable", "afford", "affordably", "affordability"], 0, "make + O + tính từ."],
      ],
      sentences: [["The new product will be launched next month", "Sản phẩm mới sẽ ra mắt vào tháng tới."], ["Customers want affordable products", "Khách hàng muốn sản phẩm giá phải chăng."], ["Competition between brands is increasing", "Cạnh tranh giữa các thương hiệu đang tăng."]] },
  ],
  c1: [
    { id: "3", title: "Chính sách và xã hội",
      words: `legislation|pháp luật
inequality|bất bình đẳng
advocate|ủng hộ, người bênh vực
implement|thực thi
controversial|gây tranh cãi
widespread|lan rộng
tackle|giải quyết
accountability|trách nhiệm giải trình`,
      grammar: [
        ["Only by working together ___ tackle inequality.", ["can we", "we can", "we could", "can"], 0, "Đảo ngữ sau Only by…"],
        ["The policy, ___ controversial, was implemented.", ["albeit", "despite", "however", "whereas"], 0, "albeit + tính từ: mặc dù."],
        ["It is essential that the law ___ fairly.", ["be applied", "is applying", "applies to", "applying"], 0, "Giả định cách: that + S + be + V3."],
        ["Under no circumstances ___ this rule be ignored.", ["should", "it should", "shall it", "must it"], 0, "Đảo ngữ sau Under no circumstances."],
      ],
      sentences: [["Only by working together can we tackle inequality", "Chỉ bằng cách hợp tác chúng ta mới giải quyết được bất bình đẳng."], ["The new legislation proved highly controversial", "Luật mới hóa ra gây tranh cãi lớn."], ["Governments must ensure accountability", "Chính phủ phải bảo đảm trách nhiệm giải trình."]] },
    { id: "4", title: "Thành ngữ và diễn đạt",
      words: `in the long run|về lâu dài
take for granted|coi là đương nhiên
bear in mind|ghi nhớ
by and large|nhìn chung
come to terms with|chấp nhận
far-reaching|sâu rộng
on the verge of|sắp, bên bờ
in the wake of|sau, trong bối cảnh`,
      grammar: [
        ["We often take good health ___.", ["for granted", "granted for", "as granted", "to grant"], 0, "take something for granted."],
        ["___ in mind that prices may change.", ["Bear", "Keep on", "Hold", "Take"], 0, "Bear in mind: hãy nhớ rằng."],
        ["The company is on the ___ of collapse.", ["verge", "edge to", "point to", "border"], 0, "on the verge of: bên bờ."],
        ["It took her years to come to ___ with the loss.", ["terms", "term", "agreement", "peace"], 0, "come to terms with: chấp nhận."],
      ],
      sentences: [["In the long run this will save money", "Về lâu dài điều này sẽ tiết kiệm tiền."], ["By and large the project was a success", "Nhìn chung dự án đã thành công."], ["We should not take freedom for granted", "Chúng ta không nên coi tự do là đương nhiên."]] },
  ],
};
