// Batch 6: one more speaking unit per level (x7). Correct option is always first; the app shuffles it.
export default {
  topik1: [
    {
      id: "x7",
      title: "Mua sắm",
      titleEn: "Shopping",
      words: "가게|gage|cửa hàng\n가격|gagyeok|giá\n돈|don|tiền\n싸다|ssada|rẻ\n비싸다|bissada|đắt\n사다|sada|mua\n사이즈|saijeu|cỡ\n입어 보다|ibeo boda|thử đồ",
      grammar: [
        ["이거 얼마___?(Cái này bao nhiêu tiền?)", ["예요", "이에요", "입니다", "을까요"], 0, "얼마예요: bao nhiêu tiền?", "얼마예요: bao nhiêu tiền?"],
        ["이 신발을 ___ 싶어요. (Tôi muốn mua đôi giày này)", ["사고", "사다", "사는", "산"], 0, "-고 싶어요: muốn làm gì.", "-고 싶어요: muốn làm gì."],
        ["이 바지는 너무 ___. (Cái quần này quá đắt)", ["비싸요", "비싸다", "비싼요", "비싸는요"], 0, "너무 + tính từ: quá.", "너무 + tính từ: quá."],
        ["가게는 은행 ___ 있어요. (Cửa hàng ở bên cạnh ngân hàng)", ["옆에", "옆을", "옆이", "옆과"], 0, "옆에 있어요: ở bên cạnh.", "옆에 있어요: ở bên cạnh."]
      ],
      sentences: [
        ["이거 얼마예요?", "Cái này bao nhiêu tiền?"],
        ["입어 봐도 돼요?", "Tôi thử được không?"],
        ["너무 비싸요.", "Quá đắt."],
        ["더 큰 사이즈 있어요?", "Có cỡ lớn hơn không?"],
        ["이걸로 할게요.", "Tôi lấy cái này."],
        ["더 싼 것 있어요?", "Có cái nào rẻ hơn không?"]
      ]
    }
  ],
  topik2: [
    {
      id: "x7",
      title: "Ở nhà hàng",
      titleEn: "At a restaurant",
      words: "메뉴|menyu|thực đơn\n직원|jigwon|nhân viên\n계산서|gyesanseo|hóa đơn\n자리|jari|chỗ ngồi\n수프|supeu|súp\n닭고기|dakgogi|thịt gà\n물|mul|nước\n맛있다|masitda|ngon",
      grammar: [
        ["메뉴 좀 ___ 주세요. (Cho tôi xem thực đơn)", ["보여", "보는", "본", "보고"], 0, "보여 주세요: cho tôi xem.", "보여 주세요: cho tôi xem."],
        ["이 수프가 밥보다 ___. (Súp này nóng hơn cơm)", ["뜨거워요", "뜨겁다", "뜨거운", "뜨거워서"], 0, "A보다 B: B hơn A.", "A보다 B: B hơn A."],
        ["어제 저녁을 ___. (Hôm qua tôi đã ăn tối)", ["먹었어요", "먹어요", "먹을", "먹고"], 0, "-었어요: thì quá khứ.", "-었어요: thì quá khứ."],
        ["계산서 ___. (Cho tôi hóa đơn)", ["주세요", "주다", "주는", "줬어요"], 0, "-주세요: xin hãy cho.", "-주세요: xin hãy cho."]
      ],
      sentences: [
        ["자리를 예약하고 싶어요.", "Tôi muốn đặt chỗ."],
        ["메뉴 좀 보여 주세요.", "Cho tôi xem thực đơn."],
        ["이 음식은 정말 맛있어요.", "Món ăn này thật ngon."],
        ["닭고기 수프 하나 주세요.", "Cho tôi một phần súp gà."],
        ["계산서 주세요.", "Cho tôi hóa đơn."],
        ["직원이 와요.", "Nhân viên đang đến."]
      ]
    }
  ],
  topik3: [
    {
      id: "x7",
      title: "Đi du lịch",
      titleEn: "Travelling",
      words: "표|pyo|vé\n공항|gonghang|sân bay\n호텔|hotel|khách sạn\n지도|jido|bản đồ\n늦다|neutda|muộn\n역|yeok|nhà ga\n예약|yeyak|đặt chỗ\n체크인|chekeuin|làm thủ tục",
      grammar: [
        ["작년에 베트남에 ___. (Năm ngoái tôi đã đến Việt Nam)", ["갔어요", "가요", "갈", "가고"], 0, "갔어요: đã đi.", "갔어요: đã đi."],
        ["기차가 늦어서 택시를 ___. (Vì tàu trễ nên tôi đi taxi)", ["탔어요", "타요", "타는", "탈"], 0, "-어서: vì.", "-어서: vì."],
        ["비가 ___ 집에 있어요. (Nếu trời mưa thì ở nhà)", ["오면", "오고", "왔고", "오는데"], 0, "-면: nếu.", "-면: nếu."],
        ["호텔은 바닷가 ___. (Khách sạn ở gần bãi biển)", ["근처에 있어요", "근처예요", "근처가 있어요", "근처를"], 0, "근처에 있어요: ở gần.", "근처에 있어요: ở gần."]
      ],
      sentences: [
        ["표를 예약하고 싶어요.", "Tôi muốn đặt vé."],
        ["체크인은 어디에서 해요?", "Làm thủ tục ở đâu?"],
        ["비행기는 아홉 시에 출발해요.", "Máy bay khởi hành lúc chín giờ."],
        ["지도에서 보여 주시겠어요?", "Bạn có thể chỉ trên bản đồ được không?"],
        ["호텔은 역에서 가까워요.", "Khách sạn gần nhà ga."],
        ["예약은 제 이름으로 했어요.", "Tôi đã đặt chỗ dưới tên mình."]
      ]
    }
  ],
  topik4: [
    {
      id: "x7",
      title: "Sức khỏe",
      titleEn: "Health",
      words: "두통|dutong|đau đầu\n열|yeol|sốt\n기침|gichim|ho\n의사|uisa|bác sĩ\n약|yak|thuốc\n쉬다|swida|nghỉ\n알레르기|allereugi|dị ứng\n피곤하다|pigonhada|mệt",
      grammar: [
        ["사흘 동안 계속 ___. (Tôi bị đau đầu suốt ba ngày)", ["두통이 있어요", "두통이 있다", "두통을", "두통하고"], 0, "두통이 있어요: bị đau đầu.", "두통이 있어요: bị đau đầu."],
        ["물을 더 ___ 좋아요. (Nên uống thêm nước)", ["마시는", "마신", "마셔", "마시고"], 0, "-는 게 좋아요: nên làm gì.", "-는 게 좋아요: nên làm gì."],
        ["요즘 많이 ___. (Gần đây tôi rất mệt)", ["피곤해요", "피곤하다", "피곤한", "피곤했다"], 0, "피곤해요: mệt.", "피곤해요: mệt."],
        ["열이 계속 나면 병원에 ___. (Nếu sốt mãi thì hãy đi bệnh viện)", ["가세요", "가요", "간", "갈"], 0, "-세요: hãy (lịch sự).", "-세요: hãy (lịch sự)."]
      ],
      sentences: [
        ["기침이 심하고 열도 있어요.", "Tôi ho nhiều và còn sốt."],
        ["이 약은 식후에 먹어도 돼요?", "Uống thuốc này sau bữa ăn được không?"],
        ["저는 땅콩 알레르기가 있어요.", "Tôi bị dị ứng đậu phộng."],
        ["며칠 동안 쉬어야 해요.", "Bạn cần nghỉ ngơi vài ngày."],
        ["요즘 자주 피곤해요.", "Gần đây tôi hay mệt."],
        ["열이 내리지 않으면 바로 병원에 가세요.", "Nếu sốt không hạ, hãy đến bệnh viện ngay."]
      ]
    }
  ],
  topik5: [
    {
      id: "x7",
      title: "Công việc và họp",
      titleEn: "Work and meetings",
      words: "안건|angeon|chương trình họp\n마감|magam|hạn chót\n보고서|bogoseo|báo cáo\n예산|yesan|ngân sách\n동의하다|dongeihada|đồng ý\n제안하다|jeanhada|đề xuất\n후속 조치|husok jochi|theo dõi\n일정|iljeong|lịch trình",
      grammar: [
        ["다른 방법을 ___ 싶습니다. (Tôi muốn đề xuất phương pháp khác)", ["제안하고", "제안", "제안한", "제안할"], 0, "-고 싶습니다: muốn làm gì.", "-고 싶습니다: muốn làm gì."],
        ["먼저 안건을 ___. (Trước hết hãy xem chương trình họp)", ["확인합시다", "확인했어요", "확인하는", "확인해서"], 0, "-ㅂ시다: hãy cùng.", "-ㅂ시다: hãy cùng."],
        ["보고서는 금요일까지 ___. (Báo cáo phải hoàn thành trước thứ Sáu)", ["완성해야 합니다", "완성했습니다", "완성하는", "완성하지"], 0, "-해야 합니다: phải làm.", "-해야 합니다: phải làm."],
        ["회의 후에 팀과 ___. (Sau cuộc họp tôi sẽ theo dõi với nhóm)", ["후속 조치를 하겠습니다", "후속 조치했습니다", "후속 조치하는", "후속 조치를"], 0, "-겠습니다: sẽ làm.", "-겠습니다: sẽ làm."]
      ],
      sentences: [
        ["먼저 안건부터 보겠습니다.", "Trước hết chúng ta xem chương trình họp."],
        ["마감을 금요일로 미루자고 제안합니다.", "Tôi đề xuất lùi hạn chót sang thứ Sáu."],
        ["이 프로젝트 예산은 충분합니까?", "Ngân sách của dự án này có đủ không?"],
        ["당신의 의견에 동의합니다.", "Tôi đồng ý với ý kiến của bạn."],
        ["내일까지 보고서를 보내 주시겠어요?", "Bạn có thể gửi báo cáo trước ngày mai không?"],
        ["회의 후에 팀과 후속 조치를 하겠습니다.", "Sau cuộc họp tôi sẽ theo dõi với nhóm."]
      ]
    }
  ]
};
