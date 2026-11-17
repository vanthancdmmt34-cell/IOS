// Bài đọc hiểu thêm, tiếng Trung (mỗi cấp một bài). qs: [câu hỏi, 4 lựa chọn, vị trí đáp án đúng, giải thích tiếng Việt, giải thích tiếng Anh]
export default {
  hsk1: [{ title: "Buổi sáng của tôi", titleEn: "My morning",
    text: "我叫小红。我每天早上七点起床。我先喝一杯水，然后吃早饭。我八点去学校。我的老师很好。",
    qs: [
      ["小红几点起床？", ["六点", "七点", "八点", "九点"], 1, "Bài viết: 我每天早上七点起床 – Xiaohong dậy lúc 7 giờ.", "Xiaohong gets up at seven."],
      ["小红几点去学校？", ["七点", "七点半", "八点", "九点"], 2, "Cô ấy đi học lúc 8 giờ.", "She goes to school at eight."],
      ["小红早上先做什么？", ["吃早饭", "喝一杯水", "去学校", "睡觉"], 1, "Cô ấy uống một cốc nước trước.", "She drinks a glass of water first."],
    ] }],
  hsk2: [{ title: "周末去超市", titleEn: "Going to the supermarket",
    text: "星期六我和妈妈去超市。超市里人很多。我们买了苹果、牛奶和面包。苹果很贵，牛奶很便宜。我想买蛋糕，但是妈妈说今天不买。",
    qs: [
      ["他们星期几去超市？", ["星期日", "星期六", "星期五", "星期一"], 1, "Bài viết nói thứ Bảy.", "They went on Saturday."],
      ["什么东西很贵？", ["牛奶", "面包", "苹果", "蛋糕"], 2, "Táo đắt, sữa rẻ.", "The apples were expensive."],
      ["“我”想买什么？", ["苹果", "牛奶", "面包", "蛋糕"], 3, "Tôi muốn mua bánh ngọt nhưng mẹ không đồng ý.", "I wanted to buy a cake."],
    ] }],
  hsk3: [{ title: "换工作", titleEn: "Changing jobs",
    text: "两年前，小李在银行工作。他觉得工作太无聊，所以去年晚上他开始学习做饭。现在他在一家小饭店工作，他比以前高兴多了。他说：“做自己喜欢的事情，比赚很多钱更重要。”",
    qs: [
      ["小李以前在哪里工作？", ["饭店", "学校", "银行", "医院"], 2, "Trước đây anh ấy làm ở ngân hàng.", "He used to work at a bank."],
      ["去年小李开始学习什么？", ["学习英语", "学习做饭", "学习开车", "学习画画"], 1, "Năm ngoái anh bắt đầu học nấu ăn.", "He started learning to cook."],
      ["这篇文章的主要意思是什么？", ["钱最重要", "做喜欢的事更重要", "银行工作很好", "做饭很难"], 1, "Làm việc mình thích quan trọng hơn kiếm nhiều tiền.", "Doing what you like matters more than earning lots of money."],
    ] }],
  hsk4: [{ title: "城市的交通", titleEn: "City traffic",
    text: "很多城市现在用智能系统管理交通。路边的传感器可以计算车的数量，堵车的时候它会自动改变红绿灯。有人担心这些系统收集太多个人信息；也有人认为它们能减少污染，帮助司机节省时间。这个讨论可能还会持续很多年。",
    qs: [
      ["路边的传感器有什么作用？", ["清理街道", "计算车辆并改变红绿灯", "卖停车票", "测量雨量"], 1, "Cảm biến đếm xe và đổi đèn giao thông.", "The sensors count cars and change traffic lights."],
      ["反对者主要担心什么？", ["灯太亮", "路太窄", "收集太多个人信息", "司机太慢"], 2, "Người phản đối lo ngại thu thập quá nhiều thông tin cá nhân.", "They worry about collecting too much personal information."],
      ["支持者认为系统的一个好处是什么？", ["汽车更便宜", "减少污染", "停车位更多", "道路更少"], 1, "Người ủng hộ nói giảm ô nhiễm.", "Supporters say it reduces pollution."],
    ] }],
  hsk5: [{ title: "沉默的价值", titleEn: "The value of silence",
    text: "在消息不断的时代，安静已经成了一种稀缺的奢侈。研究人员发现，即使是短暂的安静，也能提高注意力和创造力。然而，很多人一个人独处、面对自己的想法时会感到不安，几乎本能地去拿手机。因此，学会忍受安静，或许是一项值得培养的能力。",
    qs: [
      ["研究人员发现安静有什么好处？", ["让人困", "提高注意力", "总是有害", "让人生气"], 1, "Im lặng ngắn giúp tăng sự tập trung.", "Brief silence can improve concentration."],
      ["很多人为什么去拿手机？", ["想拍照", "一个人时感到不安", "朋友要求", "需要时间"], 1, "Khi ở một mình với suy nghĩ, họ thấy bất an.", "They feel uneasy when alone with their thoughts."],
      ["作者建议做什么？", ["完全不用科技", "买更安静的手机", "学会忍受安静", "晚上工作"], 2, "Tác giả khuyên học cách chịu được sự im lặng.", "The writer recommends learning to tolerate silence."],
    ] }],
};
