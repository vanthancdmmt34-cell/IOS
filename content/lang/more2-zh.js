// Batch 4 expansion — HSK (units x3, x4 per level).
export default {
  hsk1: [
    { id: "x3", title: "Cơ thể và cảm giác", titleEn: "Body and feelings",
      words: `头|tóu|đầu
手|shǒu|tay
眼睛|yǎnjing|mắt
累|lèi|mệt
饿|è|đói
渴|kě|khát
高兴|gāoxìng|vui
不好|bù hǎo|không tốt`,
      grammar: [
        ["我很 ___ ，想吃饭。(Tôi rất đói, muốn ăn cơm)", ["饿", "渴", "累", "高兴"], 0, "饿 = đói.", "饿 = hungry."],
        ["你 ___ 了吗？(Bạn mệt rồi à?)", ["累", "大", "红", "冷水"], 0, "Tính từ + 了: đã chuyển sang trạng thái mới.", "Adjective + 了: has become."],
        ["他的眼睛 ___ 大。(Mắt anh ấy rất to)", ["很", "是", "有", "在"], 0, "很 + tính từ làm vị ngữ.", "很 + adjective as predicate."],
        ["我 ___ 渴，不喝水。(Tôi không khát, không uống nước)", ["不", "没", "别", "很"], 0, "不 phủ định tính từ.", "不 negates adjectives."],
      ],
      sentences: [["我 很 饿 想 吃 饭", "Tôi rất đói, muốn ăn cơm."], ["你 累 了 吗", "Bạn mệt rồi à?"], ["今天 我 很 高兴", "Hôm nay tôi rất vui."]] },
    { id: "x4", title: "Gọi điện và hẹn gặp", titleEn: "Phone calls and meeting up",
      words: `打电话|dǎ diànhuà|gọi điện thoại
手机|shǒujī|điện thoại di động
号|hào|số
见面|jiànmiàn|gặp mặt
等|děng|đợi
下午|xiàwǔ|buổi chiều
时候|shíhou|lúc, khi
一点|yìdiǎn|một chút`,
      grammar: [
        ["我给你 ___ 电话。(Tôi gọi điện cho bạn)", ["打", "做", "看", "说"], 0, "给 + người + 打电话: gọi điện cho ai.", "给 + person + 打电话: call someone."],
        ["你的手机 ___ 是多少？(Số điện thoại của bạn là bao nhiêu?)", ["号", "个", "岁", "点"], 0, "手机号 = số điện thoại.", "手机号 = phone number."],
        ["我们什么 ___ 见面？(Khi nào chúng ta gặp nhau?)", ["时候", "地方", "名字", "东西"], 0, "什么时候 = khi nào.", "什么时候 = when."],
        ["请等我 ___ 。(Xin đợi tôi một chút)", ["一下", "一个", "一本", "一些儿"], 0, "Động từ + 一下: một chút.", "Verb + 一下: briefly."],
      ],
      sentences: [["我 下午 给 你 打 电话", "Chiều tôi gọi điện cho bạn."], ["我们 什么 时候 见面", "Khi nào chúng ta gặp nhau?"], ["请 等 我 一下", "Xin đợi tôi một chút."]] },
  ],
  hsk2: [
    { id: "x3", title: "Công việc và đồng nghiệp", titleEn: "Work and colleagues",
      words: `公司|gōngsī|công ty
上班|shàngbān|đi làm
下班|xiàbān|tan làm
同事|tóngshì|đồng nghiệp
忙|máng|bận
介绍|jièshào|giới thiệu
开始|kāishǐ|bắt đầu
已经|yǐjīng|đã`,
      grammar: [
        ["我每天八点 ___ 上班。(Mỗi ngày tôi đi làm lúc 8 giờ)", ["去", "在了", "得", "过"], 0, "去上班 = đi làm.", "去上班 = go to work."],
        ["他 ___ 下班了。(Anh ấy đã tan làm rồi)", ["已经", "正在", "还没", "就要"], 0, "已经…了 = đã… rồi.", "已经…了 = already."],
        ["我来 ___ 一下，这是我的同事。(Để tôi giới thiệu, đây là đồng nghiệp tôi)", ["介绍", "开始", "上班", "认识了"], 0, "介绍一下 = giới thiệu một chút.", "介绍一下 = let me introduce."],
        ["今天工作 ___ 忙。(Hôm nay công việc bận quá)", ["太…了", "很…了", "越…越", "又…"], 0, "太 + tính từ + 了: quá…", "太 + adjective + 了: too…"],
      ],
      sentences: [["我 每天 八 点 去 上班", "Mỗi ngày tôi đi làm lúc tám giờ."], ["这 是 我 的 同事", "Đây là đồng nghiệp của tôi."], ["今天 工作 太 忙 了", "Hôm nay công việc bận quá."]] },
    { id: "x4", title: "Du lịch và khách sạn", titleEn: "Travel and hotels",
      words: `旅游|lǚyóu|du lịch
宾馆|bīnguǎn|khách sạn
房间|fángjiān|phòng
票|piào|vé
飞机|fēijī|máy bay
火车站|huǒchēzhàn|ga tàu hỏa
左边|zuǒbian|bên trái
右边|yòubian|bên phải`,
      grammar: [
        ["我想 ___ 一个房间。(Tôi muốn đặt một phòng)", ["要", "做", "看见", "说"], 0, "要 + danh từ: muốn có.", "要 + noun: want."],
        ["我们坐 ___ 去北京。(Chúng tôi đi máy bay đến Bắc Kinh)", ["飞机", "火车站", "宾馆", "票"], 0, "坐 + phương tiện: đi bằng.", "坐 + vehicle: travel by."],
        ["火车站在宾馆的 ___ 。(Ga tàu ở bên trái khách sạn)", ["左边", "上边了", "里面们", "前面儿们"], 0, "N 的 + phương vị: ở phía…", "N 的 + direction: on the … side."],
        ["你去 ___ 中国吗？(Bạn đã từng đến Trung Quốc chưa?)", ["过", "了", "着", "得"], 0, "Động từ + 过: đã từng.", "Verb + 过: have ever."],
      ],
      sentences: [["我 想 要 一 个 房间", "Tôi muốn một phòng."], ["我们 坐 飞机 去 北京", "Chúng tôi đi máy bay đến Bắc Kinh."], ["火车站 在 宾馆 的 左边", "Ga tàu ở bên trái khách sạn."]] },
  ],
  hsk3: [
    { id: "x3", title: "Bệnh viện và sức khỏe", titleEn: "Hospital and health",
      words: `感冒|gǎnmào|cảm cúm
发烧|fāshāo|sốt
检查|jiǎnchá|kiểm tra
打针|dǎzhēn|tiêm
健康|jiànkāng|khỏe mạnh
疼|téng|đau
注意|zhùyì|chú ý
需要|xūyào|cần`,
      grammar: [
        ["我感冒了，还有点儿 ___ 。(Tôi bị cảm, còn hơi sốt)", ["发烧", "健康", "注意", "检查"], 0, "有点儿 + tính từ/động từ (tiêu cực): hơi…", "有点儿 + negative adjective: a bit…"],
        ["医生给我 ___ 了一下。(Bác sĩ khám cho tôi)", ["检查", "感冒", "疼", "需要"], 0, "给 + người + động từ: làm cho ai.", "给 + person + verb: do for someone."],
        ["你要 ___ 身体。(Bạn phải chú ý sức khỏe)", ["注意", "发烧", "打针", "疼"], 0, "注意身体 = chú ý sức khỏe.", "注意身体 = take care of your health."],
        ["头疼 ___ 厉害，我去医院了。(Đau đầu dữ quá nên tôi đi viện)", ["得", "的", "地", "了"], 0, "Tính từ + 得 + bổ ngữ mức độ.", "Adjective + 得 + degree complement."],
      ],
      sentences: [["我 感冒 了 还 有点儿 发烧", "Tôi bị cảm, còn hơi sốt."], ["医生 给 我 检查 了 一下", "Bác sĩ đã khám cho tôi."], ["你 要 注意 身体", "Bạn phải chú ý sức khỏe."]] },
    { id: "x4", title: "Mua sắm và trả giá", titleEn: "Shopping and bargaining",
      words: `打折|dǎzhé|giảm giá
质量|zhìliàng|chất lượng
颜色|yánsè|màu sắc
换|huàn|đổi
试|shì|thử
合适|héshì|vừa vặn, phù hợp
一共|yígòng|tổng cộng
刷卡|shuākǎ|quẹt thẻ`,
      grammar: [
        ["这件衣服打八 ___ 。(Bộ quần áo này giảm 20%)", ["折", "块", "个", "号"], 0, "打八折 = bán 80% giá (giảm 20%).", "打八折 = 20% off (pay 80%)."],
        ["我可以 ___ 一下吗？(Tôi thử được không?)", ["试", "换", "买了", "穿过"], 0, "可以 + động từ: được phép.", "可以 + verb: may."],
        ["这个颜色不太 ___ 我。(Màu này không hợp với tôi lắm)", ["适合", "合适", "一共", "质量"], 0, "适合 mang tân ngữ.", "适合 takes an object."],
        ["___ 多少钱？(Tổng cộng bao nhiêu tiền?)", ["一共", "一起", "一定", "一样"], 0, "一共 = tổng cộng.", "一共 = in total."],
      ],
      sentences: [["这 件 衣服 打 八 折", "Bộ quần áo này giảm hai mươi phần trăm."], ["我 可以 试 一下 吗", "Tôi thử một chút được không?"], ["一共 多少 钱", "Tổng cộng bao nhiêu tiền?"]] },
  ],
  hsk4: [
    { id: "x3", title: "Phỏng vấn xin việc", titleEn: "Job interviews",
      words: `应聘|yìngpìn|ứng tuyển
简历|jiǎnlì|sơ yếu lý lịch
面试|miànshì|phỏng vấn
优点|yōudiǎn|ưu điểm
缺点|quēdiǎn|khuyết điểm
适应|shìyìng|thích nghi
负责|fùzé|phụ trách
信心|xìnxīn|tự tin`,
      grammar: [
        ["面试的时候要 ___ 信心。(Khi phỏng vấn phải có tự tin)", ["有", "是", "对", "让"], 0, "有信心 = tự tin.", "有信心 = be confident."],
        ["他 ___ 这个项目。(Anh ấy phụ trách dự án này)", ["负责", "适应", "应聘", "面试"], 0, "负责 + việc: phụ trách.", "负责 + task: be in charge of."],
        ["我很快就 ___ 了新环境。(Tôi nhanh chóng thích nghi môi trường mới)", ["适应", "适合", "合适", "负责"], 0, "适应 + môi trường: thích nghi.", "适应 + environment: adapt to."],
        ["请 ___ 你的优点和缺点。(Hãy nói về ưu và khuyết điểm của bạn)", ["谈谈", "看看了", "走走着", "想过了"], 0, "Lặp động từ: làm thử, làm một chút.", "Reduplicated verb: do a little."],
      ],
      sentences: [["我 想 应聘 这 个 职位", "Tôi muốn ứng tuyển vị trí này."], ["面试 的 时候 要 有 信心", "Khi phỏng vấn phải tự tin."], ["他 负责 这 个 项目", "Anh ấy phụ trách dự án này."]] },
    { id: "x4", title: "Giao thông thành phố", titleEn: "City traffic",
      words: `堵车|dǔchē|tắc đường
高速公路|gāosù gōnglù|đường cao tốc
交通|jiāotōng|giao thông
安全|ānquán|an toàn
司机|sījī|tài xế
乘客|chéngkè|hành khách
准时|zhǔnshí|đúng giờ
速度|sùdù|tốc độ`,
      grammar: [
        ["___ 堵车，我迟到了。(Vì tắc đường nên tôi đến muộn)", ["因为", "虽然", "如果", "而且"], 0, "因为…所以…: vì… nên…", "因为…所以…: because…"],
        ["开车要注意 ___ 。(Lái xe phải chú ý an toàn)", ["安全", "乘客们", "准时地", "速度得"], 0, "注意安全 = chú ý an toàn.", "注意安全 = mind your safety."],
        ["这趟车 ___ 准时到了。(Chuyến xe này đã đến đúng giờ)", ["很", "太了", "最好", "更加的"], 0, "很 + tính từ/trạng từ.", "很 + adjective."],
        ["速度 ___ 快，越危险。(Tốc độ càng nhanh càng nguy hiểm)", ["越", "更", "最", "太"], 0, "越…越…: càng… càng…", "越…越…: the more… the more…"],
      ],
      sentences: [["因为 堵车 我 迟到 了", "Vì tắc đường nên tôi đến muộn."], ["开车 要 注意 安全", "Lái xe phải chú ý an toàn."], ["速度 越 快 越 危险", "Tốc độ càng nhanh càng nguy hiểm."]] },
  ],
  hsk5: [
    { id: "x3", title: "Lịch sử và văn minh", titleEn: "History and civilisation",
      words: `历史|lìshǐ|lịch sử
朝代|cháodài|triều đại
古代|gǔdài|cổ đại
文明|wénmíng|văn minh
遗产|yíchǎn|di sản
记载|jìzǎi|ghi chép
传说|chuánshuō|truyền thuyết
影响深远|yǐngxiǎng shēnyuǎn|ảnh hưởng sâu rộng`,
      grammar: [
        ["___ 史书记载，这座城已有两千年历史。(Theo sử sách, thành này đã có 2000 năm)", ["据", "凭", "趁", "朝"], 0, "据 + nguồn: theo…", "据 + source: according to…"],
        ["这一发明对后世的影响 ___ 深远。(Phát minh này ảnh hưởng sâu rộng đến hậu thế)", ["十分", "差点", "未必", "随便"], 0, "十分 + tính từ: vô cùng.", "十分 + adjective: extremely."],
        ["长城 ___ 世界文化遗产之一。(Vạn Lý Trường Thành là một trong các di sản văn hóa thế giới)", ["是", "有", "成", "为了"], 0, "是…之一: là một trong…", "是…之一: is one of…"],
        ["这个传说 ___ 是真的，___ 很有意义。(Truyền thuyết này chưa chắc có thật nhưng rất ý nghĩa)", ["未必…却…", "不但…而且…", "既然…就…", "只要…就…"], 0, "未必: chưa chắc.", "未必: not necessarily."],
      ],
      sentences: [["据 记载 这 座 城 已 有 两千 年 历史", "Theo ghi chép, thành này đã có hai nghìn năm lịch sử."], ["长城 是 世界 文化 遗产 之一", "Vạn Lý Trường Thành là một trong các di sản văn hóa thế giới."], ["古代 文明 对 后世 影响 深远", "Văn minh cổ đại ảnh hưởng sâu rộng đến hậu thế."]] },
    { id: "x4", title: "Truyền thông và quảng cáo", titleEn: "Media and advertising",
      words: `广告|guǎnggào|quảng cáo
媒体|méitǐ|truyền thông
品牌|pǐnpái|thương hiệu
消费者|xiāofèizhě|người tiêu dùng
吸引|xīyǐn|thu hút
宣传|xuānchuán|tuyên truyền, quảng bá
夸张|kuāzhāng|phóng đại
真实|zhēnshí|chân thực`,
      grammar: [
        ["广告的目的 ___ 吸引消费者。(Mục đích của quảng cáo là thu hút người tiêu dùng)", ["在于", "关于", "对于", "至于"], 0, "在于: nằm ở, là.", "在于: lies in."],
        ["有些广告内容 ___ 夸张。(Một số quảng cáo nội dung quá phóng đại)", ["过于", "过去", "通过", "超过"], 0, "过于 + tính từ: quá mức.", "过于 + adjective: overly."],
        ["媒体应该 ___ 真实地报道新闻。(Truyền thông nên đưa tin chân thực)", ["如实", "其实", "确实", "实在"], 0, "如实 = đúng như sự thật.", "如实 = truthfully."],
        ["品牌 ___ 好，消费者 ___ 信任。(Thương hiệu càng tốt người tiêu dùng càng tin)", ["越…越…", "又…又…", "既…也…", "不…不…"], 0, "越…越…: càng… càng…", "越…越…: the more… the more…"],
      ],
      sentences: [["广告 的 目的 在于 吸引 消费者", "Mục đích của quảng cáo là thu hút người tiêu dùng."], ["有些 广告 过于 夸张", "Một số quảng cáo quá phóng đại."], ["媒体 应该 如实 报道 新闻", "Truyền thông nên đưa tin đúng sự thật."]] },
  ],
};
