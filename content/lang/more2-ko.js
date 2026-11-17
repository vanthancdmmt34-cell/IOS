// Batch 4 expansion — TOPIK (units x3, x4 per level).
export default {
  topik1: [
    { id: "x3", title: "Cơ thể và sức khỏe", titleEn: "Body and health",
      words: `머리|meori|đầu
눈|nun|mắt
손|son|tay
배|bae|bụng
아프다|apeuda|đau
피곤하다|pigonhada|mệt
괜찮다|gwaenchanta|ổn, không sao
병원|byeongwon|bệnh viện`,
      grammar: [
        ["머리___ 아파요. (Tôi đau đầu)", ["가", "를", "에", "은"], 0, "머리 không có patchim → 가.", "머리 has no batchim → 가."],
        ["오늘 너무 ___. (Hôm nay mệt quá)", ["피곤해요", "피곤하요", "피곤해서요", "피곤한요"], 0, "하다 → 해요.", "하다 → 해요."],
        ["배가 아프___ 병원에 가요. (Đau bụng nên tôi đi viện)", ["서", "고", "지만", "면서"], 0, "-아/어서: vì… nên…", "-아/어서: because… so…"],
        ["___? (Bạn không sao chứ?)", ["괜찮아요", "괜찮어요", "괜찮해요", "괜찮이에요"], 0, "괜찮다 → 괜찮아요.", "괜찮다 → 괜찮아요."],
      ],
      sentences: [["머리가 아파요", "Tôi bị đau đầu."], ["배가 아파서 병원에 가요", "Đau bụng nên tôi đi bệnh viện."], ["괜찮아요", "Không sao đâu."]] },
    { id: "x4", title: "Thời tiết và mùa", titleEn: "Weather and seasons",
      words: `날씨|nalssi|thời tiết
봄|bom|mùa xuân
여름|yeoreum|mùa hè
겨울|gyeoul|mùa đông
덥다|deopda|nóng
춥다|chupda|lạnh
눈|nun|tuyết
따뜻하다|ttatteuthada|ấm áp`,
      grammar: [
        ["여름은 ___. (Mùa hè nóng)", ["더워요", "덥어요", "더운요", "덥요"], 0, "덥다 → 더워요 (bất quy tắc ㅂ).", "덥다 → 더워요 (ㅂ irregular)."],
        ["겨울에 눈이 ___. (Mùa đông tuyết rơi)", ["와요", "가요", "해요", "있어요"], 0, "눈이 오다: tuyết rơi.", "눈이 오다: it snows."],
        ["봄은 날씨가 ___. (Mùa xuân thời tiết ấm áp)", ["따뜻해요", "따뜻하요", "따뜻이에요", "따뜻어요"], 0, "-하다 → 해요.", "-하다 → 해요."],
        ["오늘은 어제___ 추워요. (Hôm nay lạnh hơn hôm qua)", ["보다", "처럼", "마다", "부터"], 0, "N보다: so với N.", "N보다: than N."],
      ],
      sentences: [["여름은 정말 더워요", "Mùa hè thật nóng."], ["겨울에 눈이 와요", "Mùa đông có tuyết rơi."], ["오늘은 어제보다 추워요", "Hôm nay lạnh hơn hôm qua."]] },
  ],
  topik2: [
    { id: "x3", title: "Điện thoại và hẹn gặp", titleEn: "Phone calls and appointments",
      words: `전화|jeonhwa|điện thoại
번호|beonho|số
약속|yaksok|cuộc hẹn
만나다|mannada|gặp
늦다|neutda|muộn
기다리다|gidarida|đợi
문자|munja|tin nhắn
시간|sigan|thời gian`,
      grammar: [
        ["전화번호가 ___예요? (Số điện thoại là bao nhiêu?)", ["몇 번", "얼마", "누구", "어디"], 0, "몇 번: số mấy.", "몇 번: what number."],
        ["조금 늦을 것 ___. (Có lẽ tôi đến muộn một chút)", ["같아요", "있어요", "해요", "봐요"], 0, "-(으)ㄹ 것 같다: có lẽ.", "-(으)ㄹ 것 같다: probably."],
        ["도착하면 문자 ___. (Đến nơi thì nhắn tin nhé)", ["보내세요", "보내요", "보낸요", "보내고요"], 0, "-(으)세요: lời đề nghị lịch sự.", "-(으)세요: polite request."],
        ["여기서 기다리___ 있을게요. (Tôi sẽ đợi ở đây)", ["고", "어", "게", "기"], 0, "-고 있다: đang (duy trì).", "-고 있다: be -ing."],
      ],
      sentences: [["전화번호가 몇 번이에요", "Số điện thoại của bạn là bao nhiêu?"], ["조금 늦을 것 같아요", "Có lẽ tôi đến muộn một chút."], ["도착하면 문자 보내세요", "Đến nơi thì nhắn tin cho tôi nhé."]] },
    { id: "x4", title: "Quần áo và mua sắm", titleEn: "Clothes and shopping",
      words: `옷|ot|quần áo
치마|chima|váy
바지|baji|quần
신발|sinbal|giày
입다|ipda|mặc
신다|sinta|đi (giày)
크기|keugi|kích cỡ
어울리다|eoullida|hợp`,
      grammar: [
        ["이 옷을 입어 ___ 돼요? (Tôi mặc thử được không?)", ["봐도", "보면", "보고", "봐서"], 0, "-아/어 보다: thử; -아/어도 되다: được phép.", "-아/어 보다: try; -아/어도 되다: may."],
        ["그 치마가 정말 잘 ___. (Váy đó rất hợp với bạn)", ["어울려요", "어울리요", "어울린요", "어울리어요"], 0, "어울리다 → 어울려요.", "어울리다 → 어울려요."],
        ["신발이 좀 ___. (Giày hơi chật)", ["작아요", "작어요", "작은요", "작이에요"], 0, "작다 → 작아요.", "작다 → 작아요."],
        ["더 큰 ___ 있어요? (Có cỡ to hơn không?)", ["거", "게요", "건가", "걸로요"], 0, "거 = 것 (cái).", "거 = 것 (one, thing)."],
      ],
      sentences: [["이 옷을 입어 봐도 돼요", "Tôi mặc thử bộ này được không?"], ["그 치마가 정말 잘 어울려요", "Chiếc váy đó rất hợp với bạn."], ["더 큰 거 있어요", "Có cỡ to hơn không?"]] },
  ],
  topik3: [
    { id: "x3", title: "Nhà ở và chuyển nhà", titleEn: "Housing and moving",
      words: `월세|wolse|tiền thuê tháng
전세|jeonse|thuê nhà đặt cọc lớn
집주인|jipjuin|chủ nhà
계약|gyeyak|hợp đồng
이사|isa|chuyển nhà
교통|gyotong|giao thông
편리하다|pyeollihada|tiện lợi
조용하다|joyonghada|yên tĩnh`,
      grammar: [
        ["교통이 편리한 곳으로 이사하___ 해요. (Tôi định chuyển đến nơi giao thông tiện lợi)", ["려고", "면서", "지만", "는데"], 0, "-(으)려고 하다: định.", "-(으)려고 하다: plan to."],
        ["월세가 비싸___ 집이 넓어요. (Tiền thuê đắt nhưng nhà rộng)", ["지만", "어서", "면", "고서"], 0, "-지만: nhưng.", "-지만: but."],
        ["계약하기 전에 집을 꼭 봐야 ___. (Trước khi ký hợp đồng nhất định phải xem nhà)", ["해요", "돼요", "있어요", "봐요"], 0, "-아/어야 하다: phải.", "-아/어야 하다: must."],
        ["조용한 집을 찾___ 있어요. (Tôi đang tìm nhà yên tĩnh)", ["고", "어", "게", "는"], 0, "-고 있다: đang.", "-고 있다: be -ing."],
      ],
      sentences: [["교통이 편리한 곳으로 이사하려고 해요", "Tôi định chuyển đến nơi giao thông tiện lợi."], ["월세가 비싸지만 집이 넓어요", "Tiền thuê đắt nhưng nhà rộng."], ["계약하기 전에 집을 꼭 봐야 해요", "Trước khi ký hợp đồng nhất định phải xem nhà."]] },
    { id: "x4", title: "Ẩm thực Hàn Quốc", titleEn: "Korean food",
      words: `김치|gimchi|kimchi
불고기|bulgogi|thịt nướng bulgogi
반찬|banchan|món ăn kèm
요리하다|yorihada|nấu ăn
재료|jaeryo|nguyên liệu
맛|mat|vị
짜다|jjada|mặn
달다|dalda|ngọt`,
      grammar: [
        ["김치를 만드는 방법을 ___ 주세요. (Hãy dạy tôi cách làm kimchi)", ["가르쳐", "가르치어요", "가르친", "가르치고"], 0, "-아/어 주세요: làm ơn làm gì cho tôi.", "-아/어 주세요: please do for me."],
        ["이 반찬은 조금 ___. (Món ăn kèm này hơi mặn)", ["짜요", "짜어요", "짠요", "짜이에요"], 0, "짜다 → 짜요 (ㅏ + 아요 rút gọn).", "짜다 → 짜요 (contracted)."],
        ["불고기를 먹어 본 ___ 있어요? (Bạn đã từng ăn bulgogi chưa?)", ["적이", "것이요", "수가", "줄이"], 0, "-아/어 본 적이 있다: đã từng.", "-아/어 본 적이 있다: have ever tried."],
        ["요리를 잘하___ 부러워요. (Bạn nấu giỏi nên tôi ngưỡng mộ)", ["니까", "는데도", "자마자", "다가"], 0, "-(으)니까: vì.", "-(으)니까: because."],
      ],
      sentences: [["김치 만드는 방법을 가르쳐 주세요", "Hãy dạy tôi cách làm kimchi."], ["불고기를 먹어 본 적이 있어요", "Tôi đã từng ăn bulgogi."], ["이 반찬은 조금 짜요", "Món ăn kèm này hơi mặn."]] },
  ],
  topik4: [
    { id: "x3", title: "Tiêu dùng và kinh tế gia đình", titleEn: "Consumption and household finance",
      words: `소비|sobi|tiêu dùng
절약하다|jeoryakada|tiết kiệm
물가|mulga|vật giá
가계부|gagyebu|sổ chi tiêu gia đình
저축|jeochuk|tiết kiệm (gửi)
충동구매|chungdonggumae|mua bốc đồng
할부|halbu|trả góp
지출|jichul|chi tiêu`,
      grammar: [
        ["물가가 오르___ 생활비가 늘었다. (Vật giá tăng nên chi phí sinh hoạt tăng)", ["면서", "더라도", "든지", "거나"], 0, "-(으)면서: cùng với.", "-(으)면서: as / along with."],
        ["가계부를 쓰___ 지출을 줄일 수 있다. (Ghi sổ chi tiêu thì có thể giảm chi)", ["면", "는데", "지만", "도록"], 0, "-(으)면: nếu/khi.", "-(으)면: if."],
        ["충동구매를 하지 않___ 조심한다. (Cẩn thận để không mua bốc đồng)", ["도록", "니까", "는데", "다가"], 0, "-도록: để.", "-도록: so that."],
        ["할부로 사___ 결국 더 비싸다. (Mua trả góp thì cuối cùng lại đắt hơn)", ["다 보면", "더라면", "자마자", "고서야"], 0, "-다 보면: cứ… thì sẽ…", "-다 보면: if you keep…"],
      ],
      sentences: [["물가가 오르면서 생활비가 늘었다", "Vật giá tăng nên chi phí sinh hoạt tăng."], ["가계부를 쓰면 지출을 줄일 수 있다", "Ghi sổ chi tiêu thì có thể giảm chi."], ["충동구매를 하지 않도록 조심한다", "Tôi cẩn thận để không mua bốc đồng."]] },
    { id: "x4", title: "Tình nguyện và cộng đồng", titleEn: "Volunteering and community",
      words: `봉사|bongsa|tình nguyện
기부|gibu|quyên góp
이웃|iut|hàng xóm
지역|jiyeok|khu vực
참여하다|chamyeohada|tham gia
돕다|dopda|giúp đỡ
보람|boram|ý nghĩa, đáng công
나누다|nanuda|chia sẻ`,
      grammar: [
        ["봉사 활동에 참여하___ 보람을 느꼈다. (Tham gia tình nguyện xong tôi thấy ý nghĩa)", ["고 나서", "기 전에", "는 동안에도", "자마자도"], 0, "-고 나서: sau khi.", "-고 나서: after."],
        ["어려운 이웃을 도와야 ___. (Phải giúp hàng xóm khó khăn)", ["한다", "된다는", "할까", "하자"], 0, "-아/어야 하다: phải.", "-아/어야 하다: must."],
        ["작은 기부___ 큰 도움이 된다. (Dù là quyên góp nhỏ cũng giúp ích nhiều)", ["라도", "부터", "마저도", "에서"], 0, "N(이)라도: dù chỉ là N.", "N(이)라도: even just N."],
        ["나누면 나눌___ 행복해진다. (Càng chia sẻ càng hạnh phúc)", ["수록", "만큼", "뿐", "대로"], 0, "-(으)면 -(으)ㄹ수록: càng… càng…", "-(으)면 -(으)ㄹ수록: the more… the more…"],
      ],
      sentences: [["봉사 활동에 참여하고 나서 보람을 느꼈다", "Sau khi tham gia tình nguyện tôi thấy rất ý nghĩa."], ["작은 기부라도 큰 도움이 된다", "Dù là quyên góp nhỏ cũng giúp ích nhiều."], ["나누면 나눌수록 행복해진다", "Càng chia sẻ càng hạnh phúc."]] },
  ],
  topik5: [
    { id: "x3", title: "Công nghệ và tương lai", titleEn: "Technology and the future",
      words: `인공지능|ingongjineung|trí tuệ nhân tạo
자동화|jadonghwa|tự động hóa
일자리|iljari|việc làm
혁신|hyeoksin|đổi mới
윤리|yulli|luân lý
의존|uijon|phụ thuộc
대체하다|daechehada|thay thế
도입하다|doipada|đưa vào áp dụng`,
      grammar: [
        ["인공지능이 사람의 일자리를 대체할 ___ 우려가 있다. (Có lo ngại AI sẽ thay thế việc làm của con người)", ["것이라는", "것이라면", "것이니까", "것이지만"], 0, "-(으)ㄹ 것이라는 + N: N rằng sẽ…", "-(으)ㄹ 것이라는 + N: N that it will…"],
        ["자동화를 도입함___ 생산성이 높아졌다. (Nhờ áp dụng tự động hóa, năng suất tăng)", ["으로써", "에도", "보다", "처럼"], 0, "-(으)ㅁ으로써: bằng việc…", "-(으)ㅁ으로써: by doing…"],
        ["기술이 발전할수록 윤리 문제를 고려하지 않을 ___. (Công nghệ càng phát triển càng không thể không xét vấn đề đạo đức)", ["수 없다", "수 있다", "리가 있다", "뿐이다"], 0, "-지 않을 수 없다: không thể không.", "-지 않을 수 없다: cannot help but."],
        ["기술에 지나치게 의존하___ 안 된다. (Không được quá phụ thuộc vào công nghệ)", ["면", "고", "서", "니"], 0, "-(으)면 안 되다: không được.", "-(으)면 안 되다: must not."],
      ],
      sentences: [["인공지능이 일자리를 대체할 것이라는 우려가 있다", "Có lo ngại rằng AI sẽ thay thế việc làm."], ["자동화를 도입함으로써 생산성이 높아졌다", "Nhờ áp dụng tự động hóa, năng suất đã tăng."], ["기술에 지나치게 의존하면 안 된다", "Không được quá phụ thuộc vào công nghệ."]] },
    { id: "x4", title: "Văn học và nghệ thuật", titleEn: "Literature and art",
      words: `문학|munhak|văn học
소설|soseol|tiểu thuyết
시|si|thơ
작가|jakga|tác giả
표현|pyohyeon|biểu đạt
상징|sangjing|biểu tượng
감동|gamdong|cảm động
해석|haeseok|giải thích, diễn giải`,
      grammar: [
        ["이 소설은 읽으면 읽___ 감동적이다. (Tiểu thuyết này càng đọc càng cảm động)", ["을수록", "는데도", "더라도", "자마자"], 0, "-(으)ㄹ수록: càng… càng…", "-(으)ㄹ수록: the more… the more…"],
        ["작품에 대한 해석은 독자___ 다르다. (Cách hiểu tác phẩm khác nhau tùy độc giả)", ["마다", "부터", "까지", "처럼"], 0, "N마다: mỗi N.", "N마다: each N."],
        ["이 시는 자연을 통해 삶을 표현하___ 있다. (Bài thơ này đang biểu đạt cuộc sống qua thiên nhiên)", ["고", "어", "게", "기"], 0, "-고 있다: đang.", "-고 있다: is -ing."],
        ["작가가 무엇을 상징하려고 했는지 생각해 ___. (Hãy thử nghĩ tác giả muốn biểu tượng điều gì)", ["보자", "주자", "두자", "놓자"], 0, "-아/어 보다: thử; -자: hãy cùng.", "-아/어 보다: try; -자: let's."],
      ],
      sentences: [["이 소설은 읽을수록 감동적이다", "Tiểu thuyết này càng đọc càng cảm động."], ["작품의 해석은 독자마다 다르다", "Cách hiểu tác phẩm khác nhau tùy độc giả."], ["작가가 무엇을 상징했는지 생각해 보자", "Hãy thử nghĩ tác giả đã muốn biểu tượng điều gì."]] },
  ],
};
