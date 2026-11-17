// TOPIK expansion (units 3 and 4 per level). Only append at the end.
export default {
  topik1: [
    { id: "3", title: "Mua sắm và số đếm",
      words: `가게|gage|cửa hàng
돈|don|tiền
얼마|eolma|bao nhiêu
원|won|won (tiền)
사과|sagwa|quả táo
옷|ot|quần áo
크다|keuda|to
작다|jakda|nhỏ`,
      grammar: [
        ["이거 ___예요? (Cái này bao nhiêu tiền?)", ["얼마", "어디", "누구", "언제"], 0, "얼마예요 = bao nhiêu tiền."],
        ["사과 두 개 ___. (Cho tôi hai quả táo)", ["주세요", "있어요", "가요", "해요"], 0, "N 주세요: cho tôi N."],
        ["이 옷은 너무 ___. (Áo này to quá)", ["커요", "크요", "커어요", "큰요"], 0, "크다 → 커요 (bỏ ㅡ)."],
        ["가게에 사람이 ___. (Trong cửa hàng có người)", ["있어요", "이에요", "해요", "가요"], 0, "있다: có, ở."],
      ],
      sentences: [["이 사과는 얼마예요", "Táo này bao nhiêu tiền?"], ["물 한 병 주세요", "Cho tôi một chai nước."], ["가게에서 옷을 샀어요", "Tôi đã mua quần áo ở cửa hàng."]] },
    { id: "4", title: "Gia đình và thời gian",
      words: `가족|gajok|gia đình
아버지|abeoji|bố
어머니|eomeoni|mẹ
동생|dongsaeng|em
시간|sigan|thời gian
아침|achim|buổi sáng
주말|jumal|cuối tuần
몇|myeot|mấy`,
      grammar: [
        ["지금 ___ 시예요? (Bây giờ mấy giờ?)", ["몇", "얼마", "무슨", "어느"], 0, "몇 시 = mấy giờ."],
        ["주말___ 뭐 해요? (Cuối tuần bạn làm gì?)", ["에", "을", "이", "와"], 0, "에 + thời gian."],
        ["저는 동생___ 같이 살아요. (Tôi sống cùng em)", ["하고", "에서", "을", "이"], 0, "하고: cùng với."],
        ["우리 가족은 네 명___. (Gia đình tôi có bốn người)", ["이에요", "예요", "있어요", "해요"], 0, "명 có patchim → 이에요."],
      ],
      sentences: [["우리 가족은 네 명이에요", "Gia đình tôi có bốn người."], ["주말에 뭐 해요", "Cuối tuần bạn làm gì?"], ["아침 일곱 시에 일어나요", "Tôi dậy lúc bảy giờ sáng."]] },
  ],
  topik2: [
    { id: "3", title: "Sở thích và kế hoạch",
      words: `취미|chwimi|sở thích
운동|undong|thể thao
여행|yeohaeng|du lịch
사진|sajin|ảnh
노래|norae|bài hát
계획|gyehoek|kế hoạch
같이|gachi|cùng nhau
자주|jaju|thường xuyên`,
      grammar: [
        ["제 취미는 사진을 찍___이에요. (Sở thích của tôi là chụp ảnh)", ["는 것", "고", "어서", "면"], 0, "-는 것: danh từ hóa."],
        ["주말에 같이 영화 볼___? (Cuối tuần xem phim cùng nhé?)", ["까요", "어요", "세요", "니다"], 0, "-(으)ㄹ까요: rủ rê, đề nghị."],
        ["여행을 가___ 싶어요. (Tôi muốn đi du lịch)", ["고", "서", "면", "지"], 0, "-고 싶다: muốn."],
        ["노래를 부르___ 춤을 춰요. (Vừa hát vừa nhảy)", ["면서", "니까", "지만", "어서"], 0, "-(으)면서: vừa… vừa…"],
      ],
      sentences: [["제 취미는 여행하는 것이에요", "Sở thích của tôi là đi du lịch."], ["주말에 같이 운동할까요", "Cuối tuần cùng tập thể dục nhé?"], ["한국에 여행 가고 싶어요", "Tôi muốn đi du lịch Hàn Quốc."]] },
    { id: "4", title: "Nhà cửa và đời sống",
      words: `방|bang|phòng
부엌|bueok|nhà bếp
청소|cheongso|dọn dẹp
빨래|ppallae|giặt giũ
이사|isa|chuyển nhà
깨끗하다|kkaekkeuthada|sạch sẽ
조용하다|joyonghada|yên tĩnh
넓다|neolda|rộng`,
      grammar: [
        ["방이 넓___ 깨끗해요. (Phòng rộng và sạch)", ["고", "서", "면", "지만"], 0, "-고: và (liệt kê)."],
        ["청소를 다 ___. (Tôi đã dọn xong hết)", ["했어요", "해요", "할 거예요", "하세요"], 0, "Quá khứ của 하다: 했어요."],
        ["집이 조용해서 ___. (Nhà yên tĩnh nên tốt)", ["좋아요", "좋고", "좋으면", "좋지만"], 0, "-아/어서 + kết quả."],
        ["다음 달에 이사___ 해요. (Tháng sau tôi phải chuyển nhà)", ["해야", "하면", "하고", "해서"], 0, "-아/어야 하다: phải."],
      ],
      sentences: [["제 방은 넓고 깨끗해요", "Phòng tôi rộng và sạch."], ["주말에 청소하고 빨래해요", "Cuối tuần tôi dọn dẹp và giặt giũ."], ["다음 달에 이사해야 해요", "Tháng sau tôi phải chuyển nhà."]] },
  ],
  topik3: [
    { id: "3", title: "Mua sắm trực tuyến và dịch vụ",
      words: `주문|jumun|đặt hàng
배달|baedal|giao hàng
교환|gyohwan|đổi hàng
환불|hwanbul|hoàn tiền
영수증|yeongsujeung|hóa đơn
할인|harin|giảm giá
불편하다|bulpyeonhada|bất tiện
신청|sincheong|đăng ký`,
      grammar: [
        ["어제 주문했___ 아직 안 왔어요. (Hôm qua đặt mà vẫn chưa tới)", ["는데", "니까", "어서", "면"], 0, "-는데: nhưng (bối cảnh)."],
        ["사이즈가 안 맞으면 교환할 수 ___. (Không vừa size thì có thể đổi)", ["있어요", "없어요", "해요", "돼요"], 0, "-(으)ㄹ 수 있다: có thể."],
        ["영수증을 가져오___ 환불해 드려요. (Mang hóa đơn đến thì hoàn tiền)", ["시면", "셔서", "시고", "시지만"], 0, "-(으)시면: nếu (kính)."],
        ["할인 기간이 끝나___ 전에 사세요. (Mua trước khi hết đợt giảm giá)", ["기", "는", "고", "면"], 0, "-기 전에: trước khi."],
      ],
      sentences: [["영수증이 있으면 환불할 수 있어요", "Nếu có hóa đơn thì có thể hoàn tiền."], ["어제 주문했는데 아직 안 왔어요", "Hôm qua tôi đặt mà vẫn chưa đến."], ["할인이 끝나기 전에 사세요", "Hãy mua trước khi hết giảm giá."]] },
    { id: "4", title: "Sức khỏe và thói quen",
      words: `건강|geongang|sức khỏe
습관|seupgwan|thói quen
스트레스|seuteureseu|căng thẳng
규칙적|gyuchikjeok|đều đặn
담배|dambae|thuốc lá
끊다|kkeunta|bỏ, cắt
살이 찌다|sari jjida|tăng cân
줄이다|jurida|giảm`,
      grammar: [
        ["담배를 끊___ 해요. (Hãy cố bỏ thuốc lá)", ["도록", "니까", "는데", "어서"], 0, "-도록 하다: hãy cố gắng."],
        ["운동을 하___ 스트레스가 풀려요. (Tập thể dục thì giảm căng thẳng)", ["면", "고서", "지만", "자"], 0, "-(으)면: nếu/thì."],
        ["건강을 위해서 규칙적으로 운동하___ 좋아요. (Vì sức khỏe nên tập đều đặn)", ["는 게", "고", "면서", "는데"], 0, "-는 게 좋다: nên."],
        ["요즘 살이 찐 것 ___. (Dạo này hình như tôi tăng cân)", ["같아요", "있어요", "해요", "봐요"], 0, "-(으)ㄴ 것 같다: hình như."],
      ],
      sentences: [["건강을 위해서 담배를 끊었어요", "Vì sức khỏe tôi đã bỏ thuốc lá."], ["규칙적으로 운동하는 게 좋아요", "Nên tập thể dục đều đặn."], ["요즘 스트레스가 많은 것 같아요", "Dạo này hình như căng thẳng nhiều."]] },
  ],
  topik4: [
    { id: "3", title: "Công việc và nghề nghiệp",
      words: `직장|jikjang|nơi làm việc
승진|seungjin|thăng chức
퇴근|toegeun|tan làm
야근|yageun|làm đêm
업무|eommu|nghiệp vụ, công việc
능력|neungnyeok|năng lực
경력|gyeongnyeok|kinh nghiệm làm việc
지원하다|jiwonhada|ứng tuyển`,
      grammar: [
        ["열심히 일한 ___ 승진했다. (Nhờ làm việc chăm chỉ nên được thăng chức)", ["덕분에", "탓에", "대신에", "김에"], 0, "-(으)ㄴ 덕분에: nhờ."],
        ["야근을 하___ 보니 피곤하다. (Làm đêm mãi nên mệt)", ["다", "고", "면", "자"], 0, "-다 보니: làm mãi thì…"],
        ["경력이 없___ 지원할 수 있다. (Dù không có kinh nghiệm vẫn ứng tuyển được)", ["더라도", "다면", "으니", "어서"], 0, "-더라도: dù… cũng."],
        ["퇴근하___ 길에 마트에 들렀다. (Trên đường tan làm tôi ghé siêu thị)", ["는", "던", "ㄴ", "을"], 0, "-는 길에: trên đường đang…"],
      ],
      sentences: [["열심히 일한 덕분에 승진했다", "Nhờ làm việc chăm chỉ nên được thăng chức."], ["경력이 없더라도 지원할 수 있다", "Dù không có kinh nghiệm vẫn có thể ứng tuyển."], ["퇴근하는 길에 친구를 만났다", "Trên đường tan làm tôi đã gặp bạn."]] },
    { id: "4", title: "Truyền thông và công nghệ",
      words: `정보|jeongbo|thông tin
인터넷|inteonet|internet
개인|gaein|cá nhân
보호|boho|bảo vệ
발전|baljeon|phát triển
영향|yeonghyang|ảnh hưởng
편리하다|pyeollihada|tiện lợi
의존|uijon|phụ thuộc`,
      grammar: [
        ["기술이 발전함___ 따라 생활이 편리해졌다. (Cùng với phát triển công nghệ, cuộc sống tiện hơn)", ["에", "을", "과", "이"], 0, "-(으)ㅁ에 따라: theo, cùng với."],
        ["인터넷은 편리한 ___ 문제도 있다. (Internet tiện lợi nhưng cũng có vấn đề)", ["반면에", "덕분에", "김에", "대신에"], 0, "-(으)ㄴ 반면에: trái lại."],
        ["개인 정보를 보호하___ 위해 노력해야 한다. (Phải nỗ lực để bảo vệ thông tin cá nhân)", ["기", "는", "게", "고"], 0, "-기 위해: để."],
        ["스마트폰에 너무 의존하___ 안 된다. (Không được quá phụ thuộc vào smartphone)", ["면", "고", "서", "니"], 0, "-(으)면 안 되다: không được."],
      ],
      sentences: [["인터넷은 편리한 반면에 문제도 있다", "Internet tiện lợi nhưng mặt khác cũng có vấn đề."], ["개인 정보를 보호해야 한다", "Phải bảo vệ thông tin cá nhân."], ["스마트폰에 너무 의존하면 안 된다", "Không được quá phụ thuộc vào điện thoại thông minh."]] },
  ],
  topik5: [
    { id: "3", title: "Xã hội và dân số",
      words: `저출산|jeochulsan|tỉ lệ sinh thấp
고령화|goryeonghwa|già hóa
복지|bokji|phúc lợi
세대|sedae|thế hệ
갈등|galdeung|mâu thuẫn
해결|haegyeol|giải quyết
대책|daechaek|đối sách
심각하다|simgakhada|nghiêm trọng`,
      grammar: [
        ["저출산 문제가 심각해지___ 정부가 대책을 내놓았다. (Vấn đề tỉ lệ sinh thấp trở nên nghiêm trọng nên chính phủ đưa ra đối sách)", ["자", "더니", "도록", "거든"], 0, "-자: ngay khi, vừa… thì."],
        ["세대 간 갈등은 해결하기 ___ 문제이다. (Mâu thuẫn thế hệ là vấn đề khó giải quyết)", ["어려운", "어렵게", "어려워서", "어렵고"], 0, "-기 어렵다: khó làm."],
        ["고령화 사회에서는 복지가 중요할 ___ 없다. (Trong xã hội già hóa, phúc lợi không thể không quan trọng)", ["수밖에", "뿐만", "만큼", "대로"], 0, "-(으)ㄹ 수밖에 없다: không thể không."],
        ["이 문제는 정부___ 해결할 수 없다. (Vấn đề này chỉ chính phủ thì không giải quyết được)", ["만으로는", "조차도는", "마저도", "부터는"], 0, "-만으로는: chỉ với… thì không."],
      ],
      sentences: [["고령화 문제가 점점 심각해지고 있다", "Vấn đề già hóa đang ngày càng nghiêm trọng."], ["정부는 새로운 대책을 내놓았다", "Chính phủ đã đưa ra đối sách mới."], ["세대 간 갈등을 해결해야 한다", "Cần giải quyết mâu thuẫn giữa các thế hệ."]] },
    { id: "4", title: "Văn hóa và nghệ thuật",
      words: `예술|yesul|nghệ thuật
작품|jakpum|tác phẩm
감상|gamsang|thưởng thức
표현|pyohyeon|biểu đạt
창의성|changuiseong|tính sáng tạo
가치|gachi|giá trị
계승|gyeseung|kế thừa
독창적|dokchangjeok|độc đáo`,
      grammar: [
        ["이 작품은 볼수록 감동을 ___. (Tác phẩm này càng xem càng xúc động)", ["준다", "주는", "줘서", "주고"], 0, "-(으)ㄹ수록: càng… càng…"],
        ["전통 문화를 계승할 뿐만 ___ 발전시켜야 한다. (Không chỉ kế thừa mà còn phải phát triển văn hóa truyền thống)", ["아니라", "아니고서", "아니면", "아닌데"], 0, "-(으)ㄹ 뿐만 아니라: không chỉ… mà còn."],
        ["예술은 감정을 표현하는 ___ 수단이다. (Nghệ thuật là một phương tiện để biểu đạt cảm xúc)", ["하나의", "하나를", "한 개의서", "하나로"], 0, "하나의 + N: một (cái)…"],
        ["그 작가는 독창적인 작품으로 ___ 알려져 있다. (Tác giả đó được biết đến với tác phẩm độc đáo)", ["널리", "넓게서", "넓은", "넓이"], 0, "널리 알려지다: được biết đến rộng rãi."],
      ],
      sentences: [["이 작품은 볼수록 감동을 준다", "Tác phẩm này càng xem càng xúc động."], ["전통 문화를 계승해야 한다", "Cần kế thừa văn hóa truyền thống."], ["예술은 창의성을 키워 준다", "Nghệ thuật nuôi dưỡng tính sáng tạo."]] },
  ],
};
