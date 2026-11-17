// Korean — curriculum aligned with TOPIK levels 1 to 5.
// Vocabulary: "word|romanization (multiple separated by /)|meaning".
export default {
  id: "ko", name: "Tiếng Hàn", native: "한국어", flag: "🇰🇷", color: "#7C3AED",
  speech: "ko-KR", framework: "TOPIK", readingLabel: "phiên âm",
  readingHint: "Gõ phiên âm La-tinh theo cách đọc (vd: annyeonghaseyo) hoặc gõ lại chữ Hangul.",
  desc: "Giáo trình TOPIK 1 → 5: từ vựng, phiên âm, ngữ pháp, ghép câu.",
  levels: [
    {
      id: "topik1", title: "TOPIK 1", desc: "Sơ cấp 1: chào hỏi, giới thiệu, sinh hoạt cơ bản.",
      units: [
        {
          id: "1", title: "Chào hỏi và giới thiệu",
          words: `안녕하세요|annyeonghaseyo|xin chào
감사합니다|gamsahamnida|cảm ơn
학생|haksaeng|học sinh
선생님|seonsaengnim|giáo viên
친구|chingu|bạn bè
이름|ireum|tên
나라|nara|đất nước
회사원|hoesawon|nhân viên công ty
반갑습니다|bangapseumnida|rất vui được gặp bạn
죄송합니다|joesonghamnida|xin lỗi
제발|jebal|làm ơn
반 친구|ban chingu|bạn cùng lớp`,
          grammar: [
            ["저는 학생___. (Tôi là học sinh)", ["이에요", "예요", "있어요", "해요"], 0, "Danh từ có patchim + 이에요."],
            ["저는 의사가 ___. (Tôi không phải bác sĩ)", ["아니에요", "없어요", "안 해요", "있어요"], 0, "N이/가 아니에요: không phải là."],
            ["이름___ 뭐예요? (Tên bạn là gì?)", ["이", "을", "에", "와"], 0, "이름 có patchim → 이 (chủ ngữ)."],
            ["저___ 베트남 사람이에요. (Tôi là người Việt Nam)", ["는", "은", "를", "에"], 0, "저 không có patchim → 는 (chủ đề)."],
          ],
          sentences: [
            ["저는 베트남 사람이에요", "Tôi là người Việt Nam."],
            ["이 사람은 제 친구예요", "Người này là bạn tôi."],
            ["선생님 이름이 뭐예요", "Tên thầy giáo là gì?"],
            ["좋은 아침이에요 선생님", "Chào buổi sáng, thưa thầy."],
            ["만나서 반갑습니다", "Rất vui được gặp bạn."],
            ["저는 새 학생이에요", "Tôi là học sinh mới."],
            ["저 사람은 제 가장 친한 친구예요", "Người kia là bạn thân của tôi."],
          ],
        },
        {
          id: "2", title: "Sinh hoạt hằng ngày",
          words: `밥|bap|cơm
물|mul|nước
먹다|meokda|ăn
마시다|masida|uống
가다|gada|đi
오늘|oneul|hôm nay
내일|naeil|ngày mai
집|jip|nhà
언니|eonni|chị gái
오빠|oppa|anh trai
점심|jeomsim|bữa trưa
저녁|jeonyeok|buổi tối`,
          grammar: [
            ["밥___ 먹어요. (Tôi ăn cơm)", ["을", "를", "이", "에"], 0, "Tân ngữ có patchim → 을."],
            ["학교___ 가요. (Tôi đi đến trường)", ["에", "을", "는", "와"], 0, "에 chỉ nơi đến với 가다."],
            ["어제 친구를 ___. (Hôm qua tôi gặp bạn)", ["만났어요", "만나요", "만날 거예요", "만나세요"], 0, "Quá khứ: -았/었어요."],
            ["내일 영화를 볼 ___. (Mai tôi sẽ xem phim)", ["거예요", "있어요", "했어요", "주세요"], 0, "-(으)ㄹ 거예요: sẽ."],
          ],
          sentences: [
            ["저는 아침에 커피를 마셔요", "Buổi sáng tôi uống cà phê."],
            ["내일 친구 집에 가요", "Ngày mai tôi đến nhà bạn."],
            ["어제 학교에서 밥을 먹었어요", "Hôm qua tôi ăn cơm ở trường."],
            ["언니는 음악을 좋아해요", "Chị tôi thích âm nhạc."],
            ["점심은 열두 시에 먹어요", "Tôi ăn trưa lúc 12 giờ."],
            ["오빠는 저녁에 일해요", "Anh tôi làm việc vào buổi tối."],
            ["가족과 함께 저녁을 먹어요", "Tôi ăn tối cùng gia đình."],
            ["그녀는 아침 여섯 시에 일어나요", "Cô ấy dậy lúc sáu giờ sáng."],
          ],
        },
      ],
    },
    {
      id: "topik2", title: "TOPIK 2", desc: "Sơ cấp 2: mua sắm, đi lại, sức khỏe, thời tiết.",
      units: [
        {
          id: "1", title: "Mua sắm và đi lại",
          words: `가격|gagyeok|giá cả
싸다|ssada|rẻ
비싸다|bissada|đắt
지하철|jihacheol|tàu điện ngầm
역|yeok|nhà ga
표|pyo|vé
사다|sada|mua
가깝다|gakkapda|gần
가게|gage|cửa hàng
물건|mulgeon|hàng hóa, đồ vật
계산하다|gyesanhada|tính tiền
버스|beoseu|xe buýt
택시|taeksi|taxi
길|gil|đường
멀다|meolda|xa`,
          grammar: [
            ["지하철___ 가요. (Tôi đi bằng tàu điện ngầm)", ["로", "을", "에", "와"], 0, "(으)로: bằng phương tiện."],
            ["이것보다 저것이 더 ___. (Cái kia rẻ hơn cái này)", ["싸요", "싼", "싸고", "싸서"], 0, "N보다 더 + tính từ: hơn."],
            ["이거 좀 보여 ___. (Cho tôi xem cái này với)", ["주세요", "있어요", "봐요", "하세요"], 0, "-아/어 주세요: làm ơn làm gì cho tôi."],
            ["역이 가까워___ 걸어가요. (Vì ga gần nên tôi đi bộ)", ["서", "고", "지만", "면"], 0, "-아/어서: vì… nên…"],
          ],
          sentences: [
            ["이 옷은 너무 비싸요", "Bộ quần áo này đắt quá."],
            ["지하철로 회사에 가요", "Tôi đi làm bằng tàu điện ngầm."],
            ["표를 두 장 주세요", "Cho tôi hai vé."],            ["이 가게에서 물건을 샀어요", "Tôi đã mua đồ ở cửa hàng này."],
            ["버스 정류장이 어디예요?", "Trạm xe buýt ở đâu?"],
            ["택시로 집에 가요", "Tôi về nhà bằng taxi."],
            ["이 길이 멀어서 버스를 타요", "Vì đường này xa nên tôi đi xe buýt."],
            ["계산은 카드로 할게요", "Tôi sẽ thanh toán bằng thẻ."],
            ["이 물건은 얼마예요?", "Đồ này bao nhiêu tiền?"],
            ["지하철역은 여기서 가까워요", "Ga tàu điện ngầm ở gần đây."],

          ],
        },
        {
          id: "2", title: "Sức khỏe và thời tiết",
          words: `병원|byeongwon|bệnh viện
약|yak|thuốc
감기|gamgi|cảm lạnh
아프다|apeuda|đau, ốm
비|bi|mưa
날씨|nalssi|thời tiết
춥다|chupda|lạnh
쉬다|swida|nghỉ
몸살|momsal|đau nhức mình mẩy
두통|dutong|đau đầu
운동|undong|tập thể dục, vận động
건강|geongang|sức khỏe
덥다|deopda|nóng
눈|nun|tuyết
바람|baram|gió`,
          grammar: [
            ["감기에 ___ 병원에 갔어요. (Bị cảm nên tôi đi viện)", ["걸려서", "걸리고", "걸리면", "걸리지만"], 0, "감기에 걸리다: bị cảm; -어서: vì."],
            ["약을 먹___ 돼요. (Phải uống thuốc)", ["어야", "으면", "지만", "고"], 0, "-아/어야 돼요: phải."],
            ["날씨가 추우___ 옷을 많이 입으세요. (Nếu trời lạnh hãy mặc nhiều áo)", ["면", "서", "고", "니까요"], 0, "-(으)면: nếu."],
            ["비가 올 것 ___. (Có vẻ trời sẽ mưa)", ["같아요", "있어요", "봐요", "해요"], 0, "-(으)ㄹ 것 같아요: có lẽ, hình như."],
          ],
          sentences: [
            ["머리가 아파서 약을 먹었어요", "Đau đầu nên tôi đã uống thuốc."],
            ["오늘은 날씨가 정말 추워요", "Hôm nay trời thật sự lạnh."],
            ["집에서 푹 쉬어야 돼요", "Bạn phải nghỉ ngơi thật kỹ ở nhà."],            ["몸살이 나서 병원에 갔어요", "Tôi bị đau nhức mình mẩy nên đã đi bệnh viện."],
            ["두통이 심해서 약을 먹었어요", "Tôi bị đau đầu dữ dội nên đã uống thuốc."],
            ["매일 아침 운동을 해요", "Mỗi sáng tôi tập thể dục."],
            ["건강을 위해서 일찍 자요", "Để giữ sức khỏe, tôi đi ngủ sớm."],
            ["오늘은 바람이 세게 불어요", "Hôm nay gió thổi mạnh."],
            ["눈이 와서 길이 미끄러워요", "Tuyết rơi nên đường trơn trượt."],
            ["날씨가 더우면 물을 많이 마셔요", "Khi trời nóng, tôi uống nhiều nước."],

          ],
        },
      ],
    },
    {
      id: "topik3", title: "TOPIK 3", desc: "Trung cấp 1: công việc, học tập, kinh nghiệm.",
      units: [
        {
          id: "1", title: "Công việc và học tập",
          words: `회의|hoeui/hoeeui|cuộc họp
자료|jaryo|tài liệu
준비|junbi|chuẩn bị
경험|gyeongheom|kinh nghiệm
시험|siheom|kỳ thi
노력|noryeok|nỗ lực
면접|myeonjeop|phỏng vấn
월급|wolgeup|lương tháng
직장|jikjang|nơi làm việc
동료|dongnyo|đồng nghiệp
과제|gwaje|bài tập, nhiệm vụ
성적|seongjeok|điểm số, thành tích học tập
졸업|joreop|tốt nghiệp
실습|silseup|thực tập
능력|neungnyeok|năng lực`,
          grammar: [
            ["한국에 가 본 ___이 있어요. (Tôi đã từng đi Hàn Quốc)", ["적", "것", "수", "줄"], 0, "-아/어 본 적이 있다: đã từng."],
            ["시험에 합격하___ 열심히 공부해요. (Học chăm để thi đỗ)", ["기 위해서", "니까", "는데", "자마자"], 0, "-기 위해서: để."],
            ["회의가 끝나___ 연락할게요. (Họp xong tôi sẽ liên lạc)", ["면", "서", "지만", "는데"], 0, "-(으)면: khi/nếu."],
            ["한국어를 할 ___ 있어요. (Tôi có thể nói tiếng Hàn)", ["수", "적", "줄 알", "것"], 0, "-(으)ㄹ 수 있다: có thể."],
          ],
          sentences: [
            ["회의 자료를 미리 준비했어요", "Tôi đã chuẩn bị trước tài liệu cuộc họp."],
            ["저는 한국에서 일해 본 적이 있어요", "Tôi đã từng làm việc ở Hàn Quốc."],
            ["시험에 합격하기 위해서 노력해요", "Tôi nỗ lực để thi đỗ."],            ["동료들과 함께 과제를 했어요", "Tôi đã làm bài tập cùng các đồng nghiệp."],
            ["졸업 후에 직장을 구할 거예요", "Sau khi tốt nghiệp, tôi sẽ tìm việc làm."],
            ["성적을 올리기 위해서 매일 공부해요", "Tôi học mỗi ngày để cải thiện điểm số."],
            ["실습을 하면서 능력을 키웠어요", "Tôi đã nâng cao năng lực qua thực tập."],
            ["월요일에 동료들과 회의를 해요", "Thứ Hai tôi họp cùng đồng nghiệp."],
            ["과제를 제출하기 전에 다시 확인해요", "Tôi kiểm tra lại trước khi nộp bài tập."],
            ["이 일을 하려면 한국어 능력이 필요해요", "Để làm công việc này cần có năng lực tiếng Hàn."],

          ],
        },
        {
          id: "2", title: "Cảm xúc và quan hệ",
          words: `걱정|geokjeong|lo lắng
기쁘다|gippeuda|vui
화나다|hwanada|tức giận
약속|yaksok|lời hẹn, lời hứa
관계|gwangye|quan hệ
고민|gomin|trăn trở, phiền muộn
믿다|mitda|tin
상담|sangdam|tư vấn
슬프다|seulpeuda|buồn
행복하다|haengbokhada|hạnh phúc
미안하다|mianhada|xin lỗi, áy náy
고맙다|gomapda|biết ơn
친하다|chinhada|thân thiết
싸우다|ssauda|cãi nhau
화해하다|hwahaehada|làm hòa`,
          grammar: [
            ["친구가 화가 난 것 ___. (Hình như bạn tôi giận)", ["같아요", "있어요", "해요", "보여요"], 0, "-(으)ㄴ 것 같다: hình như (quá khứ/trạng thái)."],
            ["약속을 지키___ 해요. (Phải giữ lời hứa)", ["도록", "니까", "지만", "던"], 0, "-도록 하다: hãy cố gắng làm."],
            ["고민이 있으___ 저한테 말하세요. (Có phiền muộn thì nói với tôi)", ["면", "서", "고", "데"], 0, "-(으)면: nếu."],
            ["그 소식을 듣___ 기뻤어요. (Nghe tin đó tôi vui)", ["고", "면", "도록", "지만"], 0, "-고: sau khi/và (nối hành động)."],
          ],
          sentences: [
            ["걱정하지 마세요", "Đừng lo lắng."],
            ["친구와의 약속을 꼭 지켜요", "Tôi nhất định giữ lời hẹn với bạn."],
            ["고민이 있으면 상담을 받으세요", "Nếu có phiền muộn hãy nhận tư vấn."],            ["친구와 싸워서 슬펐어요", "Tôi buồn vì đã cãi nhau với bạn."],
            ["가족과 함께 있으면 행복해요", "Ở bên gia đình tôi cảm thấy hạnh phúc."],
            ["미안해요, 약속을 지키지 못했어요", "Xin lỗi, tôi đã không giữ được lời hẹn."],
            ["도와줘서 정말 고마워요", "Cảm ơn bạn rất nhiều vì đã giúp tôi."],
            ["그 친구와는 어릴 때부터 친해요", "Tôi thân với bạn ấy từ nhỏ."],
            ["싸운 뒤에 서로 화해했어요", "Sau khi cãi nhau, chúng tôi đã làm hòa với nhau."],
            ["힘들 때는 친구에게 이야기해요", "Khi khó khăn, tôi tâm sự với bạn bè."],

          ],
        },
      ],
    },
    {
      id: "topik4", title: "TOPIK 4", desc: "Trung cấp 2: xã hội, môi trường, văn viết.",
      units: [
        {
          id: "1", title: "Xã hội và môi trường",
          words: `환경|hwangyeong|môi trường
오염|oyeom|ô nhiễm
보호|boho|bảo vệ
사회|sahoe|xã hội
문제|munje|vấn đề
증가|jeungga|gia tăng
감소|gamso|suy giảm
정책|jeongchaek|chính sách
재활용|jaehwaryong|tái chế
쓰레기|sseuregi|rác
에너지|eneoji|năng lượng
기후|gihu|khí hậu
자원|jawon|tài nguyên
복지|bokji|phúc lợi
시민|simin|công dân`,
          grammar: [
            ["인구가 감소함___ 따라 문제가 생겼다. (Cùng với dân số giảm, vấn đề phát sinh)", ["에", "을", "이", "과"], 0, "-(으)ㅁ에 따라: theo, cùng với."],
            ["환경을 보호하___ 위해 노력해야 한다. (Phải nỗ lực để bảo vệ môi trường)", ["기", "는", "고", "면"], 0, "-기 위해: để."],
            ["정책이 바뀌___ 사람들이 반대했다. (Chính sách vừa đổi thì mọi người phản đối)", ["자", "고서", "다가", "지만"], 0, "-자: vừa… thì…"],
            ["오염이 심해지___ 있다. (Ô nhiễm đang trở nên nghiêm trọng)", ["고", "어", "게", "기"], 0, "-고 있다: đang (tiến triển)."],
          ],
          sentences: [
            ["환경 오염 문제가 점점 심각해지고 있다", "Vấn đề ô nhiễm môi trường ngày càng nghiêm trọng."],
            ["정부는 새로운 정책을 발표했다", "Chính phủ đã công bố chính sách mới."],
            ["환경을 보호하기 위해 노력해야 한다", "Chúng ta phải nỗ lực để bảo vệ môi trường."],            ["쓰레기를 분리해서 재활용해야 한다", "Chúng ta phải phân loại rác để tái chế."],
            ["기후 변화는 전 세계의 문제이다", "Biến đổi khí hậu là vấn đề của toàn thế giới."],
            ["자원이 부족해지면서 에너지 문제가 심각해졌다", "Khi tài nguyên khan hiếm, vấn đề năng lượng trở nên nghiêm trọng."],
            ["정부는 시민의 복지를 위해 노력하고 있다", "Chính phủ đang nỗ lực vì phúc lợi của người dân."],
            ["환경을 지키는 것은 우리 모두의 책임이다", "Bảo vệ môi trường là trách nhiệm của tất cả chúng ta."],
            ["대중교통을 이용하면 오염을 줄일 수 있다", "Sử dụng phương tiện công cộng có thể giảm ô nhiễm."],
            ["새로운 정책이 사회에 큰 변화를 가져왔다", "Chính sách mới đã mang lại thay đổi lớn cho xã hội."],

          ],
        },
        {
          id: "2", title: "Văn hóa và truyền thống",
          words: `전통|jeontong|truyền thống
문화|munhwa|văn hóa
명절|myeongjeol|ngày lễ tết
풍습|pungseup|phong tục
유지|yuji|duy trì
교류|gyoryu|giao lưu
차이|chai|sự khác biệt
존중|jonjung|tôn trọng
축제|chukje|lễ hội
음식|eumsik|món ăn, ẩm thực
의상|uisang|trang phục
예절|yejeol|lễ nghi, phép tắc
역사|yeoksa|lịch sử
언어|eoneo|ngôn ngữ
예술|yesul|nghệ thuật`,
          grammar: [
            ["나라마다 풍습이 다르___ 마련이다. (Mỗi nước phong tục khác nhau là đương nhiên)", ["기", "게", "는", "고"], 0, "-기 마련이다: lẽ đương nhiên."],
            ["전통을 지키___ 새로운 것도 받아들인다. (Vừa giữ truyền thống vừa đón nhận cái mới)", ["면서", "니까", "다면", "더니"], 0, "-(으)면서: vừa… vừa…"],
            ["문화 차이를 이해할 ___ 알아야 한다. (Phải biết cách hiểu khác biệt văn hóa)", ["줄", "수", "적", "뿐"], 0, "-(으)ㄹ 줄 알다: biết cách."],
            ["명절___ 가족들이 모인다. (Vào dịp lễ, gia đình tụ họp)", ["에는", "을", "으로", "와"], 0, "에는: vào (thời điểm, nhấn mạnh)."],
          ],
          sentences: [
            ["명절에는 가족들이 모두 모인다", "Vào ngày lễ cả gia đình đều tụ họp."],
            ["서로의 문화를 존중해야 한다", "Chúng ta phải tôn trọng văn hóa của nhau."],
            ["전통을 유지하는 것이 중요하다", "Việc duy trì truyền thống là quan trọng."],            ["축제에서 전통 의상을 입고 춤을 췄다", "Tại lễ hội, mọi người mặc trang phục truyền thống và nhảy múa."],
            ["각 나라의 음식에는 그 나라의 역사가 담겨 있다", "Ẩm thực mỗi nước chứa đựng lịch sử của nước đó."],
            ["예절을 지키는 것은 문화를 존중하는 것이다", "Giữ lễ nghi chính là tôn trọng văn hóa."],
            ["언어를 배우면 다른 문화를 이해할 수 있다", "Học ngôn ngữ giúp hiểu được văn hóa khác."],
            ["전통 예술을 보존하기 위해 많은 노력이 필요하다", "Cần nhiều nỗ lực để bảo tồn nghệ thuật truyền thống."],
            ["명절마다 가족이 모여 전통 음식을 먹는다", "Mỗi dịp lễ, gia đình tụ họp và ăn món ăn truyền thống."],

          ],
        },
      ],
    },
    {
      id: "topik5", title: "TOPIK 5", desc: "Cao cấp 1: kinh tế, học thuật, biểu đạt trang trọng.",
      units: [
        {
          id: "1", title: "Kinh tế và tin tức",
          words: `경제|gyeongje|kinh tế
투자|tuja|đầu tư
시장|sijang|thị trường
영향|yeonghyang|ảnh hưởng
추세|chuse|xu hướng
발표|balpyo|công bố
현상|hyeonsang|hiện tượng
불황|bulhwang|suy thoái`,
          grammar: [
            ["경기가 나빠짐___ 불구하고 투자가 늘었다. (Mặc dù kinh tế xấu đi, đầu tư vẫn tăng)", ["에도", "으로", "에서", "과"], 0, "-(으)ㅁ에도 불구하고: mặc dù."],
            ["보도에 ___ 수출이 증가했다. (Theo đưa tin, xuất khẩu tăng)", ["따르면", "의하여서", "대하면", "관하면"], 0, "N에 따르면: theo…"],
            ["불황이 계속되___ 실업률이 높아졌다. (Suy thoái kéo dài nên thất nghiệp tăng)", ["면서", "더라도", "든지", "거나"], 0, "-(으)면서: đồng thời/cùng với."],
            ["이 현상은 앞으로도 계속될 ___으로 보인다. (Hiện tượng này dường như sẽ tiếp diễn)", ["것", "수", "줄", "뿐"], 0, "-(으)ㄹ 것으로 보인다: được cho là sẽ."],
          ],
          sentences: [
            ["보도에 따르면 경제가 회복되고 있다", "Theo đưa tin, kinh tế đang phục hồi."],
            ["불황에도 불구하고 투자가 증가했다", "Mặc dù suy thoái nhưng đầu tư đã tăng."],
            ["이 현상은 시장에 큰 영향을 미쳤다", "Hiện tượng này đã gây ảnh hưởng lớn đến thị trường."],
          ],
        },
        {
          id: "2", title: "Lập luận và học thuật",
          words: `주장|jujang|chủ trương, lập luận
근거|geungeo|căn cứ
논리|nolli|logic
모순|mosun|mâu thuẫn
가설|gaseol|giả thuyết
분석|bunseok|phân tích
결론|gyeollon|kết luận
타당하다|tadanghada|thỏa đáng`,
          grammar: [
            ["근거가 없는 ___ 주장은 설득력이 없다. (Lập luận không căn cứ thì không thuyết phục)", ["한", "데", "지", "만큼"], 0, "-는 한: chừng nào còn…"],
            ["분석 결과를 바탕___ 결론을 내렸다. (Đưa ra kết luận dựa trên kết quả phân tích)", ["으로", "에", "을", "과"], 0, "N을/를 바탕으로: dựa trên."],
            ["그의 주장은 논리적이___ 하다. (Lập luận của anh ấy có tính logic)", ["기도", "지도", "고도", "든지"], 0, "-기도 하다: cũng (có mặt)…"],
            ["이 가설이 타당한지 검증할 필요가 ___. (Cần kiểm chứng giả thuyết này có thỏa đáng không)", ["있다", "없다", "된다", "한다"], 0, "-(으)ㄹ 필요가 있다: cần phải."],
          ],
          sentences: [
            ["그 주장에는 논리적 모순이 있다", "Lập luận đó có mâu thuẫn logic."],
            ["분석 결과를 바탕으로 결론을 내렸다", "Đã đưa ra kết luận dựa trên kết quả phân tích."],
            ["이 가설을 검증할 필요가 있다", "Cần kiểm chứng giả thuyết này."],
          ],
        },
      ],
    },
  ],
};
