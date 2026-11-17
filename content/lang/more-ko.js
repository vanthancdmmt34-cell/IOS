// Batch 3 expansion — TOPIK (2 units/level).
export default {
  topik1: [
    { id: "x1", title: "Màu sắc và đồ vật", titleEn: "Colours and objects",
      words: `책|chaek|sách
가방|gabang|cặp, túi
시계|sigye|đồng hồ
의자|uija|cái ghế
빨간색|ppalgansaek|màu đỏ
하얀색|hayansaek|màu trắng
우산|usan|cái ô
연필|yeonpil|bút chì`,
      grammar: [
        ["이것은 무엇___? (Cái này là gì?)", ["이에요", "예요", "있어요", "해요"], 0, "무엇 có patchim → 이에요.", "무엇 ends in a batchim → 이에요."],
        ["책상 위___ 연필이 있어요. (Trên bàn có bút chì)", ["에", "를", "가", "와"], 0, "에 chỉ vị trí với 있다.", "에 marks location with 있다."],
        ["이 가방은 ___ 거예요? (Cái túi này của ai?)", ["누구", "무엇", "어디", "언제"], 0, "누구 거예요 = của ai.", "누구 거예요 = whose is it."],
        ["우산이 ___. (Không có ô)", ["없어요", "아니에요", "안 해요", "있어요"], 0, "없다 = không có.", "없다 = not have / there is no."],
      ],
      sentences: [["이것은 제 책이에요", "Đây là sách của tôi."], ["책상 위에 시계가 있어요", "Trên bàn có đồng hồ."], ["빨간색 가방을 좋아해요", "Tôi thích túi màu đỏ."]] },
    { id: "x2", title: "Sở thích và cuối tuần", titleEn: "Hobbies and weekends",
      words: `영화|yeonghwa|phim
음악|eumak|âm nhạc
듣다|deutda|nghe
보다|boda|xem
운동하다|undonghada|tập thể dục
좋아하다|joahada|thích
공원|gongwon|công viên
산책|sanchaek|đi dạo`,
      grammar: [
        ["저는 음악___ 좋아해요. (Tôi thích âm nhạc)", ["을", "를", "이", "에"], 0, "음악 có patchim → 을.", "음악 has a batchim → 을."],
        ["주말에 공원___ 산책해요. (Cuối tuần tôi đi dạo ở công viên)", ["에서", "에", "을", "와"], 0, "에서 chỉ nơi diễn ra hành động.", "에서 marks where an action happens."],
        ["같이 영화를 ___? (Cùng xem phim nhé?)", ["볼까요", "봐요", "봤어요", "보세요"], 0, "-(으)ㄹ까요: rủ cùng làm.", "-(으)ㄹ까요: shall we?"],
        ["음악을 ___ 운동해요. (Vừa nghe nhạc vừa tập thể dục)", ["들으면서", "듣고서", "들어서", "듣지만"], 0, "듣다 → 들으면서 (bất quy tắc ㄷ).", "듣다 → 들으면서 (ㄷ irregular)."],
      ],
      sentences: [["저는 음악을 좋아해요", "Tôi thích âm nhạc."], ["주말에 공원에서 산책해요", "Cuối tuần tôi đi dạo ở công viên."], ["같이 영화를 볼까요", "Cùng xem phim nhé?"]] },
  ],
  topik2: [
    { id: "x1", title: "Nhà hàng và gọi món", titleEn: "Restaurants and ordering",
      words: `식당|sikdang|nhà hàng
메뉴|menyu|thực đơn
주문|jumun|gọi món
맵다|maepda|cay
맛있다|masitda|ngon
비빔밥|bibimbap|cơm trộn
계산|gyesan|thanh toán
물|mul|nước`,
      grammar: [
        ["비빔밥 하나 ___. (Cho một suất cơm trộn)", ["주세요", "있어요", "해요", "가요"], 0, "N 주세요: cho tôi N.", "N 주세요: please give me N."],
        ["이 음식은 너무 ___. (Món này cay quá)", ["매워요", "맵어요", "매운요", "맵고요"], 0, "맵다 → 매워요 (bất quy tắc ㅂ).", "맵다 → 매워요 (ㅂ irregular)."],
        ["맛있게 ___! (Chúc ăn ngon miệng!)", ["드세요", "먹어요", "먹었어요", "드렸어요"], 0, "드시다: kính ngữ của 먹다.", "드시다: honorific of 먹다."],
        ["여기서 계산___ 돼요? (Thanh toán ở đây được không?)", ["해도", "하면", "하고", "해서"], 0, "-아/어도 되다: được phép.", "-아/어도 되다: may / is allowed."],
      ],
      sentences: [["비빔밥 하나 주세요", "Cho tôi một suất cơm trộn."], ["이 음식은 정말 맛있어요", "Món này thật ngon."], ["여기서 계산해도 돼요", "Thanh toán ở đây được không?"]] },
    { id: "x2", title: "Trường học và học tập", titleEn: "School and studying",
      words: `교실|gyosil|phòng học
숙제|sukje|bài tập về nhà
질문|jilmun|câu hỏi
대답|daedap|câu trả lời
공부하다|gongbuhada|học
알다|alda|biết
모르다|moreuda|không biết
쉽다|swipda|dễ`,
      grammar: [
        ["숙제를 다 ___. (Tôi đã làm xong bài tập)", ["했어요", "해요", "할 거예요", "하세요"], 0, "Quá khứ của 하다: 했어요.", "Past of 하다: 했어요."],
        ["질문이 있으___ 물어보세요. (Có câu hỏi thì hãy hỏi)", ["면", "고", "서", "지만"], 0, "-(으)면: nếu.", "-(으)면: if."],
        ["한국어는 ___ 재미있어요. (Tiếng Hàn khó nhưng thú vị)", ["어렵지만", "어려워서", "어렵고서", "어려우면"], 0, "-지만: nhưng.", "-지만: but."],
        ["저는 그 답을 ___. (Tôi không biết đáp án đó)", ["몰라요", "모르어요", "모라요", "몰르어요"], 0, "모르다 → 몰라요 (bất quy tắc 르).", "모르다 → 몰라요 (르 irregular)."],
      ],
      sentences: [["숙제를 다 했어요", "Tôi đã làm xong bài tập."], ["질문이 있으면 물어보세요", "Có câu hỏi thì hãy hỏi."], ["한국어는 어렵지만 재미있어요", "Tiếng Hàn khó nhưng thú vị."]] },
  ],
  topik3: [
    { id: "x1", title: "Ngân hàng và bưu điện", titleEn: "Banks and post offices",
      words: `은행|eunhaeng|ngân hàng
계좌|gyejwa|tài khoản
송금|songgeum|chuyển tiền
환전|hwanjeon|đổi tiền
우체국|ucheguk|bưu điện
소포|sopo|bưu kiện
보내다|bonaeda|gửi
신분증|sinbunjeung|giấy tờ tùy thân`,
      grammar: [
        ["계좌를 만들___ 신분증이 필요해요. (Để mở tài khoản cần giấy tờ tùy thân)", ["려면", "고서", "는데", "다가"], 0, "-(으)려면: nếu muốn… thì…", "-(으)려면: if you want to…"],
        ["소포를 베트남으로 보내___ 해요. (Tôi định gửi bưu kiện về Việt Nam)", ["려고", "면서", "자마자", "더니"], 0, "-(으)려고 하다: định làm.", "-(으)려고 하다: intend to."],
        ["환전하___ 은행에 갔어요. (Tôi đến ngân hàng để đổi tiền)", ["러", "고", "면", "서"], 0, "-(으)러 가다: đi để làm gì.", "-(으)러 가다: go in order to."],
        ["송금이 끝나___ 문자가 와요. (Chuyển tiền xong thì có tin nhắn)", ["면", "지만", "는데", "도록"], 0, "-(으)면: khi/nếu.", "-(으)면: when / if."],
      ],
      sentences: [["계좌를 만들려면 신분증이 필요해요", "Để mở tài khoản cần giấy tờ tùy thân."], ["소포를 보내러 우체국에 가요", "Tôi đến bưu điện để gửi bưu kiện."], ["은행에서 환전했어요", "Tôi đã đổi tiền ở ngân hàng."]] },
    { id: "x2", title: "Du lịch Hàn Quốc", titleEn: "Travelling in Korea",
      words: `여행지|yeohaengji|điểm du lịch
숙소|sukso|chỗ ở
예약하다|yeyakada|đặt trước
경치|gyeongchi|phong cảnh
구경하다|gugyeonghada|ngắm, tham quan
기념품|ginyeompum|quà lưu niệm
지도|jido|bản đồ
추천하다|chucheonhada|giới thiệu, đề xuất`,
      grammar: [
        ["제주도에 가 ___ 적이 있어요? (Bạn đã từng đến đảo Jeju chưa?)", ["본", "보는", "볼", "봤던가"], 0, "-아/어 본 적이 있다: đã từng.", "-아/어 본 적이 있다: have ever done."],
        ["경치가 정말 아름답___! (Phong cảnh đẹp quá!)", ["네요", "어요", "고요", "는데요"], 0, "-네요: cảm thán khi phát hiện.", "-네요: exclamation on noticing."],
        ["좋은 곳을 추천해 ___? (Bạn giới thiệu cho tôi chỗ hay được không?)", ["주시겠어요", "드릴까요", "할까요", "하세요"], 0, "-아/어 주시겠어요: nhờ lịch sự.", "-아/어 주시겠어요: polite request."],
        ["숙소를 미리 예약하___ 좋아요. (Nên đặt chỗ ở trước)", ["는 게", "니까", "면서", "도록"], 0, "-는 게 좋다: nên.", "-는 게 좋다: it is better to."],
      ],
      sentences: [["제주도에 가 본 적이 있어요", "Tôi đã từng đến đảo Jeju."], ["경치가 정말 아름답네요", "Phong cảnh đẹp quá."], ["숙소를 미리 예약하는 게 좋아요", "Nên đặt chỗ ở trước."]] },
  ],
  topik4: [
    { id: "x1", title: "Sức khỏe và y tế", titleEn: "Health and medicine",
      words: `진료|jillyo|khám chữa bệnh
증상|jeungsang|triệu chứng
처방전|cheobangjeon|đơn thuốc
입원|ibwon|nhập viện
예방|yebang|phòng ngừa
회복|hoebok|hồi phục
건강검진|geonganggeomjin|khám sức khỏe định kỳ
부작용|bujagyong|tác dụng phụ`,
      grammar: [
        ["약을 먹___ 부작용이 생길 수도 있다. (Uống thuốc có thể sinh tác dụng phụ)", ["으면", "는데", "도록", "더니"], 0, "-(으)ㄹ 수도 있다: cũng có thể.", "-(으)ㄹ 수도 있다: may also."],
        ["정기적으로 건강검진을 받___ 한다. (Nên khám sức khỏe định kỳ)", ["아야", "으면", "지만", "고서"], 0, "-아/어야 하다: phải.", "-아/어야 하다: must / should."],
        ["치료를 받___ 빨리 회복되었다. (Nhờ điều trị mà hồi phục nhanh)", ["은 덕분에", "는 바람에", "기 때문에서", "더라도"], 0, "-(으)ㄴ 덕분에: nhờ.", "-(으)ㄴ 덕분에: thanks to."],
        ["감기에 걸리지 않___ 손을 자주 씻으세요. (Hãy rửa tay thường xuyên để không bị cảm)", ["도록", "으면", "지만", "는데"], 0, "-도록: để (mục đích, kết quả).", "-도록: so that."],
      ],
      sentences: [["정기적으로 건강검진을 받아야 한다", "Nên khám sức khỏe định kỳ."], ["치료를 받은 덕분에 빨리 회복되었다", "Nhờ điều trị mà tôi hồi phục nhanh."], ["감기에 걸리지 않도록 손을 자주 씻으세요", "Hãy rửa tay thường xuyên để không bị cảm."]] },
    { id: "x2", title: "Mạng xã hội và truyền thông", titleEn: "Social media and the press",
      words: `언론|eollon|báo chí, truyền thông
기사|gisa|bài báo
댓글|daetgeul|bình luận
가짜 뉴스|gajja nyuseu|tin giả
확산|hwaksan|lan rộng
신뢰|silloe|sự tin cậy
여론|yeoron|dư luận
개인정보|gaeinjeongbo|thông tin cá nhân`,
      grammar: [
        ["가짜 뉴스가 빠르게 확산되___ 있다. (Tin giả đang lan nhanh)", ["고", "어", "게", "기"], 0, "-고 있다: đang (tiến triển).", "-고 있다: is -ing."],
        ["기사를 읽___ 댓글을 남겼다. (Đọc bài báo xong tôi để lại bình luận)", ["고 나서", "는 동안", "기 전에", "자마자도"], 0, "-고 나서: sau khi.", "-고 나서: after doing."],
        ["언론은 사실을 정확하게 전달해야 ___. (Báo chí phải truyền đạt sự thật chính xác)", ["한다", "된다는", "할까", "하자"], 0, "-아/어야 하다: phải.", "-아/어야 하다: must."],
        ["개인정보가 유출될 ___ 조심해야 한다. (Phải cẩn thận vì e thông tin cá nhân bị rò rỉ)", ["까 봐", "수록", "뿐만", "대로"], 0, "-(으)ㄹ까 봐: vì sợ rằng.", "-(으)ㄹ까 봐: for fear that."],
      ],
      sentences: [["가짜 뉴스가 빠르게 확산되고 있다", "Tin giả đang lan rất nhanh."], ["언론은 사실을 정확하게 전달해야 한다", "Báo chí phải truyền đạt sự thật chính xác."], ["개인정보가 유출될까 봐 걱정이다", "Tôi lo thông tin cá nhân bị rò rỉ."]] },
  ],
  topik5: [
    { id: "x1", title: "Giáo dục và thi cử", titleEn: "Education and exams",
      words: `입시|ipsi|thi tuyển sinh
경쟁|gyeongjaeng|cạnh tranh
사교육|sagyoyuk|học thêm tư nhân
교육열|gyoyungnyeol|nhiệt huyết giáo dục
창의력|changuiryeok|năng lực sáng tạo
평가|pyeongga|đánh giá
제도|jedo|chế độ, hệ thống
개선|gaeseon|cải thiện`,
      grammar: [
        ["입시 경쟁이 치열해지___ 사교육비가 늘었다. (Cạnh tranh tuyển sinh gay gắt hơn khiến chi phí học thêm tăng)", ["면서", "더라도", "거나", "든지"], 0, "-(으)면서: cùng với, đồng thời.", "-(으)면서: as / while."],
        ["시험 점수만으로 학생을 평가하___ 어렵다. (Khó mà đánh giá học sinh chỉ bằng điểm thi)", ["기는", "는다면", "더니", "느라"], 0, "-기는 어렵다: khó mà…", "-기는 어렵다: it is hard to…"],
        ["창의력을 키우___ 교육 제도를 개선해야 한다. (Phải cải thiện hệ thống giáo dục để nuôi dưỡng sáng tạo)", ["기 위해서는", "는 탓에", "는 바람에", "다가는"], 0, "-기 위해서는: để mà… thì…", "-기 위해서는: in order to…"],
        ["교육열이 높___ 문제도 생긴다. (Nhiệt huyết giáo dục cao thì vấn đề cũng nảy sinh)", ["다 보면", "더라면", "고서야", "자마자"], 0, "-다 보면: cứ… thì sẽ…", "-다 보면: if one keeps…, eventually…"],
      ],
      sentences: [["입시 경쟁이 갈수록 치열해지고 있다", "Cạnh tranh tuyển sinh ngày càng gay gắt."], ["창의력을 키우는 교육이 필요하다", "Cần nền giáo dục nuôi dưỡng sáng tạo."], ["평가 제도를 개선해야 한다", "Phải cải thiện chế độ đánh giá."]] },
    { id: "x2", title: "Môi trường và năng lượng", titleEn: "Environment and energy",
      words: `기후 변화|gihu byeonhwa|biến đổi khí hậu
탄소|tanso|các-bon
배출|baechul|thải ra
재생 에너지|jaesaeng eneoji|năng lượng tái tạo
일회용품|ilhoeyongpum|đồ dùng một lần
재활용|jaehwaryong|tái chế
절약|jeoryak|tiết kiệm
지속 가능한|jisok ganeunghan|bền vững`,
      grammar: [
        ["탄소 배출을 줄이___ 노력이 필요하다. (Cần nỗ lực giảm thải các-bon)", ["려는", "는다는", "던", "을"], 0, "-(으)려는 + N: N nhằm…", "-(으)려는 + N: N aimed at…"],
        ["일회용품 사용을 줄일 ___ 환경을 보호할 수 있다. (Giảm đồ dùng một lần thì mới bảo vệ được môi trường)", ["때만", "만큼", "뿐", "대로"], 0, "-(으)ㄹ 때만: chỉ khi…", "-(으)ㄹ 때만: only when…"],
        ["재생 에너지의 비중이 점점 커지___ 있다. (Tỷ trọng năng lượng tái tạo ngày càng lớn)", ["고", "어", "게", "기"], 0, "-고 있다: đang (xu hướng).", "-고 있다: is -ing (trend)."],
        ["기후 변화 ___ 여러 나라가 협력하고 있다. (Các nước đang hợp tác để đối phó biến đổi khí hậu)", ["에 대응하기 위해", "에 따르면", "에도 불구하고", "을 비롯해"], 0, "-에 대응하다: ứng phó với.", "-에 대응하다: respond to."],
      ],
      sentences: [["탄소 배출을 줄여야 한다", "Phải giảm lượng khí các-bon thải ra."], ["재활용은 자원을 절약하는 방법이다", "Tái chế là cách tiết kiệm tài nguyên."], ["지속 가능한 발전이 중요하다", "Phát triển bền vững là quan trọng."]] },
  ],
};
