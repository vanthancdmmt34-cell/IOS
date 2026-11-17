// Batch 3 expansion — HSK (2 units/level). Unit IDs use "x1", "x2" to avoid colliding with admin-created units.
// Grammar: [sentence, choices, answer index, VI explanation, EN explanation].
export default {
  hsk1: [
    { id: "x1", title: "Màu sắc và đồ vật", titleEn: "Colours and objects",
      words: `红|hóng|màu đỏ
白|bái|màu trắng
黑|hēi|màu đen
书|shū|sách
杯子|bēizi|cái cốc
电脑|diànnǎo|máy tính
衣服|yīfu|quần áo
大|dà|to, lớn`,
      grammar: [
        ["这 ___ 书很好。(Quyển sách này rất hay)", ["本", "个", "杯", "口"], 0, "本 là lượng từ cho sách.", "本 is the measure word for books."],
        ["我的杯子 ___ 红的。(Cốc của tôi màu đỏ)", ["是", "有", "在", "很"], 0, "是…的: miêu tả đặc điểm.", "是…的 describes a characteristic."],
        ["那件衣服 ___ 大。(Bộ quần áo kia rất to)", ["很", "是", "的", "吗"], 0, "Tính từ làm vị ngữ thường có 很 đứng trước.", "Adjective predicates usually take 很 before them."],
        ["这是 ___ 的电脑？(Đây là máy tính của ai?)", ["谁", "什么", "哪", "几"], 0, "谁的 = của ai.", "谁的 = whose."],
      ],
      sentences: [["这 本 书 是 我 的", "Quyển sách này là của tôi."], ["我 喜欢 红 色", "Tôi thích màu đỏ."], ["那 是 谁 的 电脑", "Kia là máy tính của ai?"]] },
    { id: "x2", title: "Thời tiết và cuối tuần", titleEn: "Weather and weekends",
      words: `天气|tiānqì|thời tiết
热|rè|nóng
冷|lěng|lạnh
下雨|xià yǔ|mưa
周末|zhōumò|cuối tuần
看|kàn|xem
电影|diànyǐng|phim
睡觉|shuìjiào|ngủ`,
      grammar: [
        ["今天天气 ___ ？(Hôm nay thời tiết thế nào?)", ["怎么样", "什么", "哪儿", "多少"], 0, "怎么样 hỏi tình trạng, ý kiến.", "怎么样 asks how something is."],
        ["周末我 ___ 看电影。(Cuối tuần tôi đi xem phim)", ["去", "在", "是", "有"], 0, "去 + động từ: đi làm gì.", "去 + verb: go and do something."],
        ["太热 ___ ！(Nóng quá!)", ["了", "吗", "呢", "的"], 0, "太…了: quá…", "太…了: too / so…"],
        ["你 ___ 睡觉吗？(Bạn có muốn ngủ không?)", ["想", "是", "很", "在"], 0, "想 + động từ: muốn.", "想 + verb: want to."],
      ],
      sentences: [["今天 天气 很 热", "Hôm nay trời rất nóng."], ["周末 我们 去 看 电影", "Cuối tuần chúng ta đi xem phim."], ["明天 会 下雨 吗", "Ngày mai có mưa không?"]] },
  ],
  hsk2: [
    { id: "x1", title: "Nhà hàng và gọi món", titleEn: "Restaurants and ordering",
      words: `菜单|càidān|thực đơn
服务员|fúwùyuán|nhân viên phục vụ
点菜|diǎn cài|gọi món
羊肉|yángròu|thịt cừu
鸡蛋|jīdàn|trứng gà
好吃|hǎochī|ngon
一起|yìqǐ|cùng nhau
等|děng|đợi`,
      grammar: [
        ["服务员，我们要 ___ 菜。(Phục vụ ơi, chúng tôi muốn gọi món)", ["点", "吃", "做", "买"], 0, "点菜 = gọi món.", "点菜 = order food."],
        ["这个菜 ___ 好吃。(Món này thật ngon)", ["真", "太了", "多", "最了"], 0, "真 + tính từ: thật là…", "真 + adjective: really…"],
        ["请 ___ 一下。(Xin đợi một chút)", ["等", "看", "走", "说"], 0, "Động từ + 一下: làm một chút.", "Verb + 一下: do briefly."],
        ["我们 ___ 去吃饭吧。(Chúng ta cùng đi ăn nhé)", ["一起", "一共", "一样", "一点"], 0, "一起 = cùng nhau.", "一起 = together."],
      ],
      sentences: [["请 给 我 看看 菜单", "Cho tôi xem thực đơn."], ["这 个 菜 真 好吃", "Món này thật ngon."], ["我们 一起 去 吃饭 吧", "Chúng ta cùng đi ăn nhé."]] },
    { id: "x2", title: "Trường học và lớp học", titleEn: "School and class",
      words: `教室|jiàoshì|phòng học
问题|wèntí|câu hỏi, vấn đề
回答|huídá|trả lời
题|tí|đề, bài
懂|dǒng|hiểu
课|kè|bài học, tiết học
考试|kǎoshì|thi
准备|zhǔnbèi|chuẩn bị`,
      grammar: [
        ["你听 ___ 了吗？(Bạn nghe hiểu chưa?)", ["懂", "到", "好", "完"], 0, "听懂: nghe hiểu.", "听懂: hear and understand."],
        ["老师问了一个 ___ 。(Thầy hỏi một câu hỏi)", ["问题", "回答", "教室", "课"], 0, "问题 = câu hỏi.", "问题 = question."],
        ["我们 ___ 准备考试。(Chúng tôi đang chuẩn bị thi)", ["在", "了", "过", "得"], 0, "在 + động từ: đang làm.", "在 + verb: in progress."],
        ["这个题 ___ 难。(Bài này không khó)", ["不", "没", "别", "很不"], 0, "不 phủ định tính từ.", "不 negates adjectives."],
      ],
      sentences: [["老师 的 问题 我 听懂 了", "Câu hỏi của thầy tôi nghe hiểu rồi."], ["我们 在 教室 上课", "Chúng tôi học ở phòng học."], ["明天 有 考试 要 准备", "Mai có thi, phải chuẩn bị."]] },
  ],
  hsk3: [
    { id: "x1", title: "Ngân hàng và tiền bạc", titleEn: "Banks and money",
      words: `银行|yínháng|ngân hàng
换钱|huàn qián|đổi tiền
信用卡|xìnyòngkǎ|thẻ tín dụng
花|huā|tiêu (tiền)
借|jiè|vay, mượn
还|huán|trả lại
存|cún|gửi (tiền)
护照|hùzhào|hộ chiếu`,
      grammar: [
        ["我想 ___ 银行换钱。(Tôi muốn đến ngân hàng đổi tiền)", ["去", "在", "从", "对"], 0, "去 + nơi + làm gì.", "去 + place + purpose."],
        ["这个月我花 ___ 很多钱。(Tháng này tôi tiêu nhiều tiền)", ["了", "过", "着", "的"], 0, "了 sau động từ: hành động đã hoàn thành.", "了 after a verb: completed action."],
        ["你可以 ___ 信用卡付钱。(Bạn có thể trả bằng thẻ)", ["用", "给", "跟", "被"], 0, "用 + công cụ: dùng.", "用 + tool: use."],
        ["借的书要 ___ 。(Sách mượn phải trả)", ["还", "借", "买", "存"], 0, "还 (huán) = trả lại.", "还 (huán) = return."],
      ],
      sentences: [["我 去 银行 换 钱", "Tôi đến ngân hàng đổi tiền."], ["可以 用 信用卡 吗", "Có thể dùng thẻ tín dụng không?"], ["借 的 钱 要 早点 还", "Tiền vay phải trả sớm."]] },
    { id: "x2", title: "Thể thao và sở thích", titleEn: "Sports and hobbies",
      words: `比赛|bǐsài|trận đấu
赢|yíng|thắng
输|shū|thua
爬山|pá shān|leo núi
骑|qí|cưỡi, đạp (xe)
自行车|zìxíngchē|xe đạp
兴趣|xìngqù|hứng thú
练习|liànxí|luyện tập`,
      grammar: [
        ["我 ___ 游泳很感兴趣。(Tôi rất hứng thú với bơi lội)", ["对", "给", "向", "跟"], 0, "对…感兴趣: hứng thú với…", "对…感兴趣: be interested in…"],
        ["他们 ___ 了比赛。(Họ đã thắng trận đấu)", ["赢", "输", "比", "爬"], 0, "赢 = thắng.", "赢 = win."],
        ["我每天 ___ 自行车上班。(Ngày nào tôi cũng đạp xe đi làm)", ["骑", "坐", "开", "走"], 0, "骑 dùng cho xe đạp, xe máy.", "骑 is used for bikes and motorbikes."],
        ["多 ___ 才能进步。(Luyện nhiều mới tiến bộ)", ["练习", "比赛", "兴趣", "输"], 0, "多 + động từ: làm nhiều.", "多 + verb: do more."],
      ],
      sentences: [["我 对 爬山 很 感 兴趣", "Tôi rất hứng thú với leo núi."], ["他 每天 骑 自行车 上班", "Anh ấy đạp xe đi làm mỗi ngày."], ["我们 队 赢 了 比赛", "Đội chúng tôi đã thắng trận."]] },
  ],
  hsk4: [
    { id: "x1", title: "Thuê nhà và chuyển nhà", titleEn: "Renting and moving",
      words: `房租|fángzū|tiền thuê nhà
搬家|bānjiā|chuyển nhà
房东|fángdōng|chủ nhà
押金|yājīn|tiền đặt cọc
合同|hétong|hợp đồng
家具|jiājù|đồ nội thất
安静|ānjìng|yên tĩnh
交通|jiāotōng|giao thông`,
      grammar: [
        ["这里的房租 ___ 便宜 ___ 安静。(Ở đây tiền thuê vừa rẻ vừa yên tĩnh)", ["又…又…", "越…越…", "不…不…", "一…就…"], 0, "又…又…: vừa… vừa…", "又…又…: both… and…"],
        ["签合同 ___ 要看清楚。(Trước khi ký hợp đồng phải đọc kỹ)", ["以前", "以后", "以上", "以外"], 0, "…以前: trước khi…", "…以前: before…"],
        ["我们下个月 ___ 搬家了。(Tháng sau chúng tôi sắp chuyển nhà)", ["就要", "已经", "曾经", "刚刚"], 0, "就要…了: sắp…", "就要…了: about to…"],
        ["___ 交通方便，我选了这里。(Vì giao thông thuận tiện nên tôi chọn đây)", ["因为", "虽然", "如果", "即使"], 0, "因为…所以…: vì… nên…", "因为…所以…: because… so…"],
      ],
      sentences: [["这里 的 房租 又 便宜 又 安静", "Tiền thuê ở đây vừa rẻ vừa yên tĩnh."], ["签 合同 以前 要 看 清楚", "Trước khi ký hợp đồng phải đọc kỹ."], ["我们 下 个 月 就要 搬家 了", "Tháng sau chúng tôi sắp chuyển nhà."]] },
    { id: "x2", title: "Lễ tết và phong tục", titleEn: "Festivals and customs",
      words: `春节|Chūnjié|Tết Nguyên Đán
红包|hóngbāo|bao lì xì
饺子|jiǎozi|sủi cảo
放鞭炮|fàng biānpào|đốt pháo
团圆|tuányuán|đoàn tụ
祝福|zhùfú|chúc phúc
习俗|xísú|phong tục
月饼|yuèbing|bánh trung thu`,
      grammar: [
        ["春节的时候，家人都要 ___ 。(Dịp Tết, cả nhà đều phải đoàn tụ)", ["团圆", "习俗", "祝福", "红包"], 0, "团圆 = đoàn tụ.", "团圆 = family reunion."],
        ["___ 春节，孩子们都很高兴。(Mỗi khi đến Tết, trẻ con đều vui)", ["每到", "每次都", "到底", "终于"], 0, "每到 + dịp: mỗi khi đến…", "每到 + occasion: whenever it is…"],
        ["吃饺子 ___ 中国北方的习俗。(Ăn sủi cảo là phong tục miền Bắc Trung Quốc)", ["是", "有", "在", "对"], 0, "是: là.", "是: is."],
        ["我 ___ 你新年快乐！(Chúc bạn năm mới vui vẻ)", ["祝", "让", "叫", "请"], 0, "祝 + người + lời chúc.", "祝 + person + wish."],
      ],
      sentences: [["春节 的 时候 家人 都 要 团圆", "Dịp Tết cả nhà đều đoàn tụ."], ["孩子们 收到 了 很多 红包", "Bọn trẻ nhận được nhiều lì xì."], ["祝 你 新年 快乐", "Chúc bạn năm mới vui vẻ."]] },
  ],
  hsk5: [
    { id: "x1", title: "Sức khỏe tinh thần", titleEn: "Mental well-being",
      words: `焦虑|jiāolǜ|lo âu
情绪|qíngxù|cảm xúc
调整|tiáozhěng|điều chỉnh
心态|xīntài|tâm thái
失眠|shīmián|mất ngủ
倾诉|qīngsù|tâm sự
缓解|huǎnjiě|giảm bớt
积极|jījí|tích cực`,
      grammar: [
        ["适当运动可以 ___ 压力。(Vận động vừa phải giúp giảm áp lực)", ["缓解", "失眠", "焦虑", "倾诉"], 0, "缓解压力 = giảm áp lực.", "缓解压力 = relieve stress."],
        ["___ 遇到什么困难，都要保持积极的心态。(Dù gặp khó khăn gì cũng phải giữ thái độ tích cực)", ["不管", "既然", "只要", "除非"], 0, "不管…都…: bất kể… đều…", "不管…都…: no matter… still…"],
        ["有烦恼时，可以向朋友 ___ 。(Khi phiền muộn có thể tâm sự với bạn)", ["倾诉", "调整", "缓解", "积极"], 0, "向 + người + 倾诉: tâm sự với ai.", "向 + person + 倾诉: confide in someone."],
        ["他 ___ 压力太大而失眠。(Anh ấy mất ngủ vì áp lực quá lớn)", ["因为", "为了", "尽管", "何况"], 0, "因为…而…: vì… mà…", "因为…而…: because of… (result)."],
      ],
      sentences: [["适当 运动 可以 缓解 压力", "Vận động vừa phải có thể giảm áp lực."], ["我们 要 学会 调整 情绪", "Chúng ta phải học cách điều chỉnh cảm xúc."], ["保持 积极 的 心态 很 重要", "Giữ thái độ tích cực rất quan trọng."]] },
    { id: "x2", title: "Khoa học và phát minh", titleEn: "Science and inventions",
      words: `发明|fāmíng|phát minh
科学家|kēxuéjiā|nhà khoa học
实验|shíyàn|thí nghiệm
理论|lǐlùn|lý thuyết
发现|fāxiàn|phát hiện
技术|jìshù|kỹ thuật, công nghệ
人工智能|réngōng zhìnéng|trí tuệ nhân tạo
改变|gǎibiàn|thay đổi`,
      grammar: [
        ["人工智能正在 ___ 我们的生活。(AI đang thay đổi cuộc sống của chúng ta)", ["改变", "发现", "实验", "理论"], 0, "改变 + đối tượng: thay đổi.", "改变 + object: change."],
        ["经过多次实验，科学家 ___ 成功了。(Sau nhiều lần thí nghiệm, nhà khoa học cuối cùng đã thành công)", ["终于", "到底", "究竟", "居然"], 0, "终于: cuối cùng (sau nỗ lực).", "终于: finally (after effort)."],
        ["这个理论 ___ 实验证明了。(Lý thuyết này đã được thí nghiệm chứng minh)", ["被", "把", "让", "给了"], 0, "Câu bị động: 被 + tác nhân + động từ.", "Passive: 被 + agent + verb."],
        ["___ 技术的发展，生活越来越方便。(Cùng với sự phát triển kỹ thuật, cuộc sống ngày càng tiện)", ["随着", "按照", "根据", "通过"], 0, "随着: cùng với, theo đà.", "随着: along with, as… develops."],
      ],
      sentences: [["人工智能 正在 改变 我们 的 生活", "Trí tuệ nhân tạo đang thay đổi cuộc sống của chúng ta."], ["科学家 终于 发现 了 原因", "Nhà khoa học cuối cùng đã phát hiện ra nguyên nhân."], ["随着 技术 的 发展 生活 越来越 方便", "Cùng với sự phát triển kỹ thuật, cuộc sống ngày càng tiện lợi."]] },
  ],
};
