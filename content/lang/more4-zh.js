// Batch 6: one more speaking unit per level (x7). Correct option is always first; the app shuffles it.
export default {
  hsk1: [
    {
      id: "x7",
      title: "Mua sắm",
      titleEn: "Shopping",
      words: "商店|shāngdiàn|cửa hàng\n价格|jiàgé|giá\n钱|qián|tiền\n便宜|piányi|rẻ\n贵|guì|đắt\n买|mǎi|mua\n大小|dàxiǎo|kích cỡ\n试|shì|thử",
      grammar: [
        ["这个多少___？(Cái này bao nhiêu tiền?)", ["钱", "个", "吗", "都"], 0, "多少钱: bao nhiêu tiền.", "多少钱: bao nhiêu tiền."],
        ["我想___一个包。(Tôi muốn mua một cái túi)", ["买", "买了", "买吗", "买的"], 0, "想 + động từ: muốn làm gì.", "想 + động từ: muốn làm gì."],
        ["这双鞋太___了。(Đôi giày này quá to)", ["大", "大的", "大吗", "大了的"], 0, "太……了: quá.", "太……了: quá."],
        ["商店___银行旁边。(Cửa hàng ở bên cạnh ngân hàng)", ["在", "是", "有", "到"], 0, "在: ở.", "在: ở."]
      ],
      sentences: [
        ["这个 多少 钱？", "Cái này bao nhiêu tiền?"],
        ["我 可以 试 一下 吗？", "Tôi thử một chút được không?"],
        ["这个 太 贵 了。", "Cái này quá đắt."],
        ["有 大 一点 的 吗？", "Có cái cỡ lớn hơn không?"],
        ["我 要 这个。", "Tôi lấy cái này."],
        ["有 便宜 一点 的 吗？", "Có cái nào rẻ hơn không?"]
      ]
    }
  ],
  hsk2: [
    {
      id: "x7",
      title: "Ở nhà hàng",
      titleEn: "At a restaurant",
      words: "菜单|càidān|thực đơn\n服务员|fúwùyuán|phục vụ\n账单|zhàngdān|hóa đơn\n桌子|zhuōzi|bàn\n汤|tāng|canh\n鸡肉|jīròu|thịt gà\n水|shuǐ|nước\n好吃|hǎochī|ngon",
      grammar: [
        ["请给我___。(Cho tôi xem thực đơn)", ["菜单", "看菜单了", "菜单吗", "菜单们"], 0, "给我 + danh từ: cho tôi cái gì.", "给我 + danh từ: cho tôi cái gì."],
        ["这个汤比那个___。(Canh này ngon hơn cái kia)", ["好吃", "好吃的", "好吃了吗", "好吃过"], 0, "比 + …… + tính từ: hơn.", "比 + …… + tính từ: hơn."],
        ["昨天我们___晚饭。(Hôm qua chúng tôi đã ăn tối)", ["吃了", "吃", "要吃", "吃着"], 0, "了: đánh dấu hành động đã xảy ra.", "了: đánh dấu hành động đã xảy ra."],
        ["请给我___。(Cho tôi hóa đơn)", ["账单", "账单了", "账单吗", "账单的"], 0, "账单: hóa đơn.", "账单: hóa đơn."]
      ],
      sentences: [
        ["我 想 看 一下 菜单。", "Tôi muốn xem thực đơn."],
        ["请 给 我 两 个 人 的 位子。", "Cho tôi chỗ cho hai người."],
        ["这个 菜 很 好吃。", "Món này rất ngon."],
        ["我 要 一 碗 鸡 汤。", "Tôi muốn một bát canh gà."],
        ["请 结 账。", "Cho tôi thanh toán."],
        ["服务员 来 了。", "Nhân viên phục vụ đến rồi."]
      ]
    }
  ],
  hsk3: [
    {
      id: "x7",
      title: "Đi du lịch",
      titleEn: "Travelling",
      words: "机票|jīpiào|vé máy bay\n机场|jīchǎng|sân bay\n酒店|jiǔdiàn|khách sạn\n地图|dìtú|bản đồ\n迟到|chídào|đến muộn\n车站|chēzhàn|nhà ga\n预订|yùdìng|đặt trước\n办理|bànlǐ|làm thủ tục",
      grammar: [
        ["我去年___越南。(Năm ngoái tôi đã đến Việt Nam)", ["去了", "去", "去过", "要去"], 0, "去了: đã đi.", "去了: đã đi."],
        ["你___了机票吗？(Bạn đã đặt vé máy bay chưa?)", ["订", "订好", "订的", "订着"], 0, "订了机票吗: đã đặt vé chưa?", "订了机票吗: đã đặt vé chưa?"],
        ["我们___坐出租车。(Chúng tôi sẽ đi taxi)", ["会", "了", "过", "吗"], 0, "会 + động từ: sẽ.", "会 + động từ: sẽ."],
        ["酒店___海边附近。(Khách sạn ở gần bãi biển)", ["在", "是", "有", "去"], 0, "在: ở.", "在: ở."]
      ],
      sentences: [
        ["我 想 预订 一 张 去 河内 的 机票。", "Tôi muốn đặt một vé máy bay đi Hà Nội."],
        ["办理 登机 手续 在 哪里？", "Làm thủ tục lên máy bay ở đâu?"],
        ["我们 的 航班 九 点 起飞。", "Chuyến bay của chúng tôi cất cánh lúc chín giờ."],
        ["请 你 在 地图 上 给 我 看 一下。", "Bạn chỉ cho tôi xem trên bản đồ được không?"],
        ["酒店 在 车站 附近。", "Khách sạn ở gần nhà ga."],
        ["我 已经 预订 了 房间。", "Tôi đã đặt phòng rồi."]
      ]
    }
  ],
  hsk4: [
    {
      id: "x7",
      title: "Sức khỏe",
      titleEn: "Health",
      words: "头疼|tóuténg|đau đầu\n发烧|fāshāo|sốt\n咳嗽|késou|ho\n医生|yīshēng|bác sĩ\n药|yào|thuốc\n休息|xiūxi|nghỉ ngơi\n过敏|guòmǐn|dị ứng\n累|lèi|mệt",
      grammar: [
        ["我___三天了，一直很累。(Tôi mệt ba ngày rồi)", ["累了", "累", "累吗", "累的"], 0, "了: đánh dấu thời gian đã trôi qua.", "了: đánh dấu thời gian đã trôi qua."],
        ["你应该多___水。(Bạn nên uống nhiều nước)", ["喝", "喝了", "喝过", "喝吗"], 0, "应该 + động từ: nên làm gì.", "应该 + động từ: nên làm gì."],
        ["我对花生___。(Tôi bị dị ứng đậu phộng)", ["过敏", "过敏的", "过敏了吗", "过敏着"], 0, "对…过敏: dị ứng với.", "对…过敏: dị ứng với."],
        ["如果病得更严重，___去看医生。(Nếu bệnh nặng hơn, hãy đi khám bác sĩ)", ["请", "了", "吗", "过"], 0, "请 + động từ: xin/hãy.", "请 + động từ: xin/hãy."]
      ],
      sentences: [
        ["我 咳嗽 得 很 厉害，还 发烧。", "Tôi ho nhiều và còn sốt."],
        ["这 个 药 饭 后 吃，可以 吗？", "Uống thuốc này sau bữa ăn có được không?"],
        ["我 对 花生 过敏。", "Tôi bị dị ứng đậu phộng."],
        ["你 需要 休息 几 天。", "Bạn cần nghỉ ngơi vài ngày."],
        ["我 最近 总是 很 累。", "Gần đây tôi luôn thấy mệt."],
        ["如果 发烧 更 严重，请 马上 去 医院。", "Nếu sốt nặng hơn, hãy đến bệnh viện ngay."]
      ]
    }
  ],
  hsk5: [
    {
      id: "x7",
      title: "Công việc và họp",
      titleEn: "Work and meetings",
      words: "议程|yìchéng|chương trình họp\n截止日期|jiézhǐ rìqī|hạn chót\n报告|bàogào|báo cáo\n预算|yùsuàn|ngân sách\n同意|tóngyì|đồng ý\n建议|jiànyì|đề xuất\n跟进|gēnjìn|theo dõi\n安排|ānpái|sắp xếp",
      grammar: [
        ["我___提出一个新的方案。(Tôi muốn đưa ra một phương án mới)", ["想", "了", "过", "吗"], 0, "想 + động từ: muốn làm gì.", "想 + động từ: muốn làm gì."],
        ["我们先___议程。(Trước hết hãy xem chương trình họp)", ["看看", "看了看过", "看的", "看着吗"], 0, "看看: xem thử.", "看看: xem thử."],
        ["这份报告___在周五以前完成。(Báo cáo này phải hoàn thành trước thứ Sáu)", ["必须", "了", "吗", "过"], 0, "必须: phải.", "必须: phải."],
        ["会后我会___大家。(Sau cuộc họp tôi sẽ theo dõi mọi người)", ["跟进", "跟进了吗", "跟进过", "跟进的"], 0, "跟进: theo sát.", "跟进: theo sát."]
      ],
      sentences: [
        ["我们 先 看 一下 议程。", "Chúng ta xem qua chương trình họp trước."],
        ["我 建议 把 截止 日期 推迟 到 周五。", "Tôi đề xuất lùi hạn chót sang thứ Sáu."],
        ["这个 项目 的 预算 够 吗？", "Ngân sách của dự án này có đủ không?"],
        ["我 同意 你 的 看法。", "Tôi đồng ý với quan điểm của bạn."],
        ["你 能 明天 把 报告 发 给 我 吗？", "Ngày mai bạn gửi báo cáo cho tôi được không?"],
        ["会 后 我 会 跟进 这 件 事。", "Sau cuộc họp tôi sẽ theo dõi việc này."]
      ]
    }
  ]
};
