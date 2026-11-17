// Bài đọc hiểu thêm, tiếng Nhật (mỗi cấp một bài). qs: [câu hỏi, 4 lựa chọn, vị trí đáp án đúng, giải thích tiếng Việt, giải thích tiếng Anh]
export default {
  n5: [{ title: "Một ngày của tôi", titleEn: "My day",
    text: "わたしは 毎朝 七時に おきます。あさごはんを たべて、八時に うちを でます。がっこうまで あるいて 十分です。ひるごはんは ともだちと たべます。よる 十時に ねます。",
    qs: [
      ["この人は 何時に うちを でますか。", ["七時", "八時", "九時", "十時"], 1, "Bài viết: 八時に うちを でます – ra khỏi nhà lúc 8 giờ.", "They leave home at eight."],
      ["がっこうまで どう いきますか。", ["バスで", "でんしゃで", "あるいて", "くるまで"], 2, "Đi bộ đến trường mất 10 phút.", "They walk to school."],
      ["ひるごはんは だれと たべますか。", ["かぞくと", "ともだちと", "せんせいと", "ひとりで"], 1, "Ăn trưa với bạn bè.", "They eat lunch with friends."],
    ] }],
  n4: [{ title: "週末の買い物", titleEn: "Weekend shopping",
    text: "週末に、わたしは 駅の 近くの スーパーに 行きました。野菜と 魚を 買いました。魚は 高かったですが、野菜は 安かったです。家に 帰ってから、りょうりを して、家族と いっしょに 食べました。",
    qs: [
      ["どこに 行きましたか。", ["びょういん", "スーパー", "がっこう", "えき"], 1, "Đi siêu thị gần ga.", "Went to the supermarket."],
      ["何が 高かったですか。", ["野菜", "魚", "パン", "くだもの"], 1, "Cá đắt, rau rẻ.", "The fish was expensive."],
      ["家で 何を しましたか。", ["そうじを しました", "りょうりを しました", "ねました", "べんきょうを しました"], 1, "Về nhà nấu ăn.", "Cooked at home."],
    ] }],
  n3: [{ title: "仕事を かえる", titleEn: "Changing jobs",
    text: "二年前、わたしは 銀行で はたらいて いました。しごとは たいくつで、あまり 楽しくなかったです。去年から、よるに りょうりの 学校に かよって います。今は 小さな レストランで はたらいて いて、とても 幸せです。お金より、好きな ことを する ほうが 大切だと 思います。",
    qs: [
      ["どうして 銀行の しごとを やめましたか。", ["お金が 少なかったから", "たいくつだったから", "家から 遠かったから", "病気だったから"], 1, "Công việc nhàm chán nên không thích.", "The job was boring."],
      ["去年から 何を はじめましたか。", ["ぎんこうの れんしゅう", "りょうりの 学校", "えいごの 学校", "うんてんの 学校"], 1, "Năm ngoái học trường nấu ăn buổi tối.", "A cooking school."],
      ["この 文の 主な 考えは 何ですか。", ["お金が いちばん 大切だ", "銀行は よくない", "好きな ことを するのが 大切だ", "りょうりは むずかしい"], 2, "Làm điều mình thích quan trọng hơn tiền.", "Doing what you love matters most."],
    ] }],
  n2: [{ title: "スマートシティ", titleEn: "The smart city",
    text: "最近、多くの 都市が 交通を かんりする ために、さまざまな スマート技術を 使って います。道路の センサーは 車の 数を かぞえ、渋滞が 起きると 信号を 切り替えます。しかし、個人の データを 集めすぎるという 批判も あります。一方で、大気汚染を 減らし、運転手の 時間を 節約できると 支持する 人も います。",
    qs: [
      ["道路の センサーは 何を しますか。", ["道を そうじする", "車の 数を かぞえ、信号を 切り替える", "駐車券を 売る", "雨の 量を はかる"], 1, "Cảm biến đếm xe và đổi đèn tín hiệu.", "They count cars and switch traffic lights."],
      ["批判する 人の 主な 心配は 何ですか。", ["信号が まぶしすぎる", "個人の データを 集めすぎる", "道が 狭すぎる", "運転手が 遅すぎる"], 1, "Người phản đối lo ngại thu thập quá nhiều dữ liệu cá nhân.", "They worry about collecting too much personal data."],
      ["支持する 人は どんな 利点を 挙げて いますか。", ["大気汚染が 減る", "車が 安くなる", "駐車場が 増える", "道路が 減る"], 0, "Người ủng hộ nói giảm ô nhiễm không khí.", "They say it reduces air pollution."],
    ] }],
  n1: [{ title: "沈黙の価値", titleEn: "The value of silence",
    text: "絶え間ない通知が届く現代において、静寂はめったに得られない贅沢になった。研究者たちは、わずかな時間でも騒音のない環境に身を置くだけで、集中力や創造性が高まることを明らかにしている。それでも多くの人は、一人で自分の思考と向き合うことに不安を覚え、ほとんど無意識にスマートフォンへ手を伸ばしてしまう。沈黙に耐える力を養うことは、だからこそ価値のある技能と言えるだろう。",
    qs: [
      ["研究者たちは 静寂について 何を 明らかにしましたか。", ["人を 眠くさせる", "集中力を 高めうる", "いつも 有害だ", "人を 怒らせる"], 1, "Sự im lặng ngắn có thể giúp tăng tập trung.", "Brief silence can raise concentration."],
      ["多くの人が スマートフォンに 手を 伸ばすのは なぜですか。", ["写真を 撮りたいから", "一人で 思考と 向き合うのが 不安だから", "時間が 必要だから", "友人に 頼まれるから"], 1, "Khi ở một mình với suy nghĩ, họ bất an nên với tay lấy điện thoại.", "They feel uneasy facing their own thoughts alone."],
      ["筆者は 何を 勧めて いますか。", ["すべての 技術を 避けること", "静寂に 耐える 力を 養うこと", "静かな 携帯を 買うこと", "夜に 働くこと"], 1, "Tác giả khuyên nên rèn khả năng chịu đựng sự im lặng.", "The writer recommends cultivating the ability to tolerate silence."],
    ] }],
};
