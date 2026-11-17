// Bài đọc hiểu thêm, tiếng Hàn (mỗi cấp một bài). qs: [câu hỏi, 4 lựa chọn, vị trí đáp án đúng, giải thích tiếng Việt, giải thích tiếng Anh]
export default {
  topik1: [{ title: "Buổi sáng của tôi", titleEn: "My morning",
    text: "저는 아침 일곱 시에 일어납니다. 세수를 하고 아침을 먹습니다. 여덟 시에 집을 나섭니다. 학교까지 걸어서 십 분쯤 걸립니다. 저는 학교에서 한국어를 공부합니다.",
    qs: [
      ["저는 몇 시에 일어납니까?", ["여섯 시", "일곱 시", "여덟 시", "아홉 시"], 1, "Bài viết: 아침 일곱 시에 일어납니다 – dậy lúc 7 giờ.", "I get up at seven."],
      ["학교까지 어떻게 갑니까?", ["버스로", "지하철로", "걸어서", "자전거로"], 2, "Đi bộ đến trường khoảng 10 phút.", "I walk to school."],
      ["학교에서 무엇을 공부합니까?", ["영어", "수학", "한국어", "일본어"], 2, "Học tiếng Hàn ở trường.", "I study Korean at school."],
    ] }],
  topik2: [{ title: "주말 시장", titleEn: "The weekend market",
    text: "토요일에 저는 어머니와 함께 시장에 갔습니다. 사과와 생선을 샀습니다. 생선은 싸고 맛있었습니다. 사과는 조금 비쌌습니다. 집에 와서 우리는 함께 저녁을 만들었습니다.",
    qs: [
      ["토요일에 어디에 갔습니까?", ["학교", "병원", "시장", "공원"], 2, "Đi chợ với mẹ.", "I went to the market with my mother."],
      ["무엇이 쌌습니까?", ["사과", "생선", "빵", "케이크"], 1, "Cá rẻ, táo hơi đắt.", "The fish was cheap."],
      ["집에 와서 무엇을 했습니까?", ["청소를 했습니다", "저녁을 만들었습니다", "잠을 잤습니다", "숙제를 했습니다"], 1, "Về nhà cùng nhau nấu bữa tối.", "We cooked dinner together."],
    ] }],
  topik3: [{ title: "직업을 바꾸다", titleEn: "Changing careers",
    text: "2년 전에 민지 씨는 은행에서 일했습니다. 하지만 일이 너무 지루해서 좋아하지 않았습니다. 작년부터 저녁에 요리 수업을 듣고 있습니다. 지금은 작은 식당에서 일하는데 훨씬 행복하다고 합니다. 민지 씨는 높은 월급보다 좋아하는 일을 하는 것이 더 중요하다고 말합니다.",
    qs: [
      ["민지 씨는 전에 어디에서 일했습니까?", ["식당", "학교", "은행", "병원"], 2, "Trước đây Minji làm ở ngân hàng.", "She used to work at a bank."],
      ["민지 씨는 작년부터 무엇을 배웁니까?", ["요리", "영어", "운전", "그림"], 0, "Năm ngoái cô bắt đầu học nấu ăn.", "She started a cooking class."],
      ["이 글의 중심 생각은 무엇입니까?", ["돈이 제일 중요하다", "은행 일이 가장 좋다", "좋아하는 일이 더 중요하다", "요리는 아주 어렵다"], 2, "Làm việc mình thích quan trọng hơn.", "Doing what you love is more important."],
    ] }],
  topik4: [{ title: "도시의 교통", titleEn: "City traffic",
    text: "요즘 많은 도시에서 스마트 기술로 교통을 관리합니다. 도로의 센서가 차의 수를 세고, 길이 막히면 신호등을 바꿉니다. 그러나 일부에서는 개인 정보를 너무 많이 모은다고 걱정합니다. 반면에 대기 오염을 줄이고 운전자의 시간을 아껴 준다고 말하는 사람도 있습니다.",
    qs: [
      ["도로의 센서는 무엇을 합니까?", ["길을 청소합니다", "차의 수를 세고 신호등을 바꿉니다", "주차권을 팝니다", "비의 양을 잽니다"], 1, "Cảm biến đếm xe và đổi đèn tín hiệu.", "The sensors count cars and change traffic lights."],
      ["반대하는 사람들의 주된 걱정은 무엇입니까?", ["신호등이 너무 밝다", "길이 너무 좁다", "개인 정보를 너무 많이 모은다", "운전자가 너무 느리다"], 2, "Lo ngại thu thập quá nhiều thông tin cá nhân.", "They worry about collecting too much personal information."],
      ["찬성하는 사람들이 말하는 장점은 무엇입니까?", ["차가 싸진다", "대기 오염이 줄어든다", "주차장이 늘어난다", "도로가 줄어든다"], 1, "Người ủng hộ nói giảm ô nhiễm không khí.", "Supporters say air pollution is reduced."],
    ] }],
  topik5: [{ title: "침묵의 가치", titleEn: "The value of silence",
    text: "끊임없이 알림이 울리는 시대에 고요함은 귀한 사치가 되었습니다. 연구자들은 잠깐이라도 소음이 없는 시간이 집중력과 창의력을 높일 수 있다는 것을 발견했습니다. 그런데도 많은 사람들은 혼자 생각에 잠기면 불안해하며 거의 습관처럼 휴대전화에 손을 뻗습니다. 그러므로 고요함을 견디는 능력을 기르는 것은 가치 있는 일입니다.",
    qs: [
      ["연구자들은 고요함에 대해 무엇을 발견했습니까?", ["사람을 졸리게 한다", "집중력을 높일 수 있다", "항상 해롭다", "사람을 화나게 한다"], 1, "Im lặng ngắn có thể tăng tập trung.", "Brief silence can improve concentration."],
      ["많은 사람들이 휴대전화에 손을 뻗는 이유는 무엇입니까?", ["사진을 찍고 싶어서", "혼자 생각하면 불안해서", "시간이 필요해서", "친구가 부탁해서"], 1, "Khi ở một mình họ thấy bất an.", "They feel uneasy when they are alone with their thoughts."],
      ["글쓴이가 권하는 것은 무엇입니까?", ["모든 기술을 피하는 것", "고요함을 견디는 능력을 기르는 것", "더 조용한 휴대전화를 사는 것", "밤에 일하는 것"], 1, "Tác giả khuyên rèn khả năng chịu được sự im lặng.", "The writer recommends learning to tolerate silence."],
    ] }],
};
