// HSK expansion (units 3 and 4 per level). Only append at the end.
export default {
  hsk1: [
    { id: "3", title: "Ăn uống và mua đồ",
      words: `吃|chī|ăn
喝|hē|uống
米饭|mǐfàn|cơm
水果|shuǐguǒ|hoa quả
茶|chá|trà
钱|qián|tiền
买|mǎi|mua
块|kuài|đồng (tiền)`,
      grammar: [
        ["这个苹果多少 ___？(Quả táo này bao nhiêu tiền?)", ["钱", "个", "岁", "点"], 0, "多少钱 = bao nhiêu tiền."],
        ["我 ___ 吃米饭。(Tôi muốn ăn cơm)", ["想", "会", "能", "是"], 0, "想 + động từ = muốn làm gì."],
        ["你喝茶 ___ 喝咖啡？(Bạn uống trà hay cà phê?)", ["还是", "和", "也", "都"], 0, "还是 dùng trong câu hỏi lựa chọn."],
        ["我买三 ___ 杯子。(Tôi mua ba cái cốc)", ["个", "口", "本", "岁"], 0, "个 là lượng từ chung."],
      ],
      sentences: [["我 想 喝 一 杯 茶", "Tôi muốn uống một cốc trà."], ["这 个 多少 钱", "Cái này bao nhiêu tiền?"], ["我们 去 饭店 吃 饭", "Chúng ta đi nhà hàng ăn cơm."]] },
    { id: "4", title: "Nơi chốn và thời gian",
      words: `学校|xuéxiào|trường học
医院|yīyuàn|bệnh viện
商店|shāngdiàn|cửa hàng
现在|xiànzài|bây giờ
点|diǎn|giờ
上午|shàngwǔ|buổi sáng
下午|xiàwǔ|buổi chiều
哪儿|nǎr|ở đâu`,
      grammar: [
        ["你 ___ 哪儿？(Bạn ở đâu?)", ["在", "是", "有", "去了"], 0, "在 + nơi chốn = ở."],
        ["现在几 ___？(Bây giờ mấy giờ?)", ["点", "岁", "个", "天"], 0, "几点 = mấy giờ."],
        ["我下午 ___ 商店。(Chiều tôi đi cửa hàng)", ["去", "在", "是", "叫"], 0, "去 + nơi = đi đến."],
        ["他 ___ 医院工作。(Anh ấy làm việc ở bệnh viện)", ["在", "去", "有", "和"], 0, "在 + nơi + động từ."],
      ],
      sentences: [["我 在 学校 学习 汉语", "Tôi học tiếng Trung ở trường."], ["现在 是 下午 三 点", "Bây giờ là ba giờ chiều."], ["你 想 去 哪儿", "Bạn muốn đi đâu?"]] },
  ],
  hsk2: [
    { id: "3", title: "Sở thích và thể thao",
      words: `运动|yùndòng|vận động, thể thao
游泳|yóuyǒng|bơi
跑步|pǎobù|chạy bộ
唱歌|chànggē|hát
跳舞|tiàowǔ|nhảy múa
踢足球|tī zúqiú|đá bóng
旅游|lǚyóu|du lịch
觉得|juéde|cảm thấy`,
      grammar: [
        ["他跑 ___ 很快。(Anh ấy chạy rất nhanh)", ["得", "的", "地", "了"], 0, "Động từ + 得 + bổ ngữ trạng thái."],
        ["我 ___ 游泳。(Tôi biết bơi)", ["会", "要", "想", "得"], 0, "会 = biết (kỹ năng học được)."],
        ["我们一起去踢足球 ___！(Chúng ta cùng đi đá bóng nhé!)", ["吧", "吗", "呢", "的"], 0, "吧 cuối câu: đề nghị."],
        ["你 ___ 这个电影怎么样？(Bạn thấy phim này thế nào?)", ["觉得", "知道", "认识", "希望"], 0, "觉得 = cảm thấy, nghĩ."],
      ],
      sentences: [["她 唱歌 唱 得 很 好", "Cô ấy hát rất hay."], ["我 每天 早上 跑步", "Mỗi sáng tôi chạy bộ."], ["我们 一起 去 旅游 吧", "Chúng ta cùng đi du lịch nhé."]] },
    { id: "4", title: "Nhà cửa và công việc nhà",
      words: `房间|fángjiān|phòng
桌子|zhuōzi|cái bàn
椅子|yǐzi|cái ghế
门|mén|cửa
洗|xǐ|rửa, giặt
帮助|bāngzhù|giúp đỡ
准备|zhǔnbèi|chuẩn bị
已经|yǐjīng|đã`,
      grammar: [
        ["我 ___ 洗完衣服了。(Tôi đã giặt xong quần áo rồi)", ["已经", "正在", "还", "就要"], 0, "已经…了 = đã… rồi."],
        ["请你 ___ 我一下。(Làm ơn giúp tôi một chút)", ["帮", "给", "对", "跟"], 0, "帮 + người + động từ."],
        ["桌子上 ___ 一本书。(Trên bàn có một quyển sách)", ["有", "是", "在", "着有"], 0, "Nơi chốn + 有 + vật: câu tồn tại."],
        ["门开 ___。(Cửa đang mở)", ["着", "过", "得", "吧"], 0, "Động từ + 着: trạng thái duy trì."],
      ],
      sentences: [["我 的 房间 很 干净", "Phòng của tôi rất sạch."], ["妈妈 已经 准备 好 晚饭 了", "Mẹ đã chuẩn bị xong bữa tối."], ["你 能 帮助 我 吗", "Bạn có thể giúp tôi không?"]] },
  ],
  hsk3: [
    { id: "3", title: "Đi lại và chỉ đường",
      words: `地铁|dìtiě|tàu điện ngầm
站|zhàn|ga, trạm
附近|fùjìn|gần đây
经过|jīngguò|đi qua
向|xiàng|về phía
马上|mǎshàng|ngay lập tức
迟到|chídào|đến muộn
方便|fāngbiàn|tiện lợi`,
      grammar: [
        ["一直 ___ 前走就到了。(Cứ đi thẳng về phía trước là tới)", ["往", "在", "从", "给"], 0, "往 + phương hướng: đi về phía."],
        ["地铁站离这儿 ___ 远？(Ga tàu cách đây bao xa?)", ["多", "几", "怎么", "什么"], 0, "多 + tính từ: bao nhiêu (mức độ)."],
        ["你 ___ 坐地铁 ___ 坐出租车？(Bạn đi tàu điện hay taxi?)", ["是…还是…", "又…又…", "越…越…", "不…不…"], 0, "是…还是…: câu hỏi lựa chọn."],
        ["快点儿，___ 要迟到了！(Nhanh lên, sắp muộn rồi!)", ["就", "才", "都", "还"], 0, "就要…了: sắp… rồi."],
      ],
      sentences: [["请问 附近 有 地铁站 吗", "Xin hỏi gần đây có ga tàu điện ngầm không?"], ["坐 地铁 很 方便", "Đi tàu điện ngầm rất tiện."], ["我们 马上 就 要 到 了", "Chúng ta sắp đến ngay rồi."]] },
    { id: "4", title: "Kế hoạch và quyết định",
      words: `计划|jìhuà|kế hoạch
决定|juédìng|quyết định
打算|dǎsuan|dự định
机会|jīhuì|cơ hội
重要|zhòngyào|quan trọng
同意|tóngyì|đồng ý
需要|xūyào|cần
一定|yídìng|nhất định`,
      grammar: [
        ["你 ___ 什么时候回国？(Bạn dự định khi nào về nước?)", ["打算", "觉得", "认为", "同意"], 0, "打算 + động từ: dự định."],
        ["这是一个 ___ 好的机会。(Đây là một cơ hội rất tốt)", ["非常", "太", "最", "更加了"], 0, "非常 + tính từ: rất."],
        ["我 ___ 要完成这个计划。(Tôi nhất định phải hoàn thành kế hoạch này)", ["一定", "一共", "一起", "一样"], 0, "一定 = nhất định."],
        ["先做作业，___ 再看电视。(Làm bài trước rồi mới xem TV)", ["然后", "所以", "但是", "因为"], 0, "先…然后/再…: trước… sau đó…"],
      ],
      sentences: [["我 决定 明年 去 中国 留学", "Tôi quyết định năm sau đi du học Trung Quốc."], ["这 个 机会 对 我 很 重要", "Cơ hội này rất quan trọng với tôi."], ["你 同意 我 的 计划 吗", "Bạn có đồng ý với kế hoạch của tôi không?"]] },
  ],
  hsk4: [
    { id: "3", title: "Mạng và công nghệ",
      words: `网站|wǎngzhàn|trang web
密码|mìmǎ|mật khẩu
信息|xìnxī|thông tin
下载|xiàzài|tải xuống
联系|liánxì|liên lạc
功能|gōngnéng|chức năng
方法|fāngfǎ|phương pháp
准确|zhǔnquè|chính xác`,
      grammar: [
        ["___ 网上买东西，___ 方便 ___ 便宜。(Mua đồ trên mạng vừa tiện vừa rẻ)", ["在…既…又…", "从…越…越…", "对…不…不…", "把…又…也…"], 0, "既…又…: vừa… vừa…"],
        ["密码忘了，___ 登录不了。(Quên mật khẩu nên không đăng nhập được)", ["所以", "但是", "而且", "可是"], 0, "所以: cho nên."],
        ["这个软件的功能 ___ 越多。(Chức năng phần mềm này ngày càng nhiều)", ["越来", "更加", "最", "太"], 0, "越来越 + tính từ: ngày càng."],
        ["有问题可以随时 ___ 我联系。(Có vấn đề cứ liên hệ với tôi bất cứ lúc nào)", ["跟", "对", "给", "向着"], 0, "跟 + người + 联系: liên lạc với."],
      ],
      sentences: [["请 输入 你 的 密码", "Vui lòng nhập mật khẩu của bạn."], ["网上 的 信息 不 一定 准确", "Thông tin trên mạng chưa chắc đã chính xác."], ["这 个 方法 越来越 流行", "Phương pháp này ngày càng phổ biến."]] },
    { id: "4", title: "Sức khỏe và lối sống",
      words: `健康|jiànkāng|khỏe mạnh
减肥|jiǎnféi|giảm cân
压力|yālì|áp lực
营养|yíngyǎng|dinh dưỡng
睡眠|shuìmián|giấc ngủ
坚持|jiānchí|kiên trì
放松|fàngsōng|thư giãn
适合|shìhé|phù hợp`,
      grammar: [
        ["只有坚持锻炼，___ 能保持健康。(Chỉ có kiên trì rèn luyện mới giữ được sức khỏe)", ["才", "就", "都", "也"], 0, "只有…才…: chỉ có… mới…"],
        ["___ 工作压力大，他经常失眠。(Vì áp lực công việc lớn, anh ấy hay mất ngủ)", ["由于", "虽然", "即使", "无论"], 0, "由于 = do, vì."],
        ["这种运动 ___ 老年人。(Môn này phù hợp với người già)", ["适合", "合适", "符合着", "适应于"], 0, "适合 + tân ngữ; 合适 không mang tân ngữ."],
        ["___ 很累，也要坚持。(Cho dù rất mệt cũng phải kiên trì)", ["即使", "因为", "所以", "并且"], 0, "即使…也…: cho dù… cũng…"],
      ],
      sentences: [["我们 应该 注意 营养 和 睡眠", "Chúng ta nên chú ý dinh dưỡng và giấc ngủ."], ["只有 坚持 才 能 成功", "Chỉ có kiên trì mới có thể thành công."], ["周末 我 喜欢 在家 放松", "Cuối tuần tôi thích thư giãn ở nhà."]] },
  ],
  hsk5: [
    { id: "3", title: "Giáo dục và nghề nghiệp",
      words: `培养|péiyǎng|bồi dưỡng
素质|sùzhì|tố chất
就业|jiùyè|việc làm
专家|zhuānjiā|chuyên gia
领域|lǐngyù|lĩnh vực
创造|chuàngzào|sáng tạo
目标|mùbiāo|mục tiêu
实现|shíxiàn|thực hiện`,
      grammar: [
        ["___ 实现目标，他每天学习到深夜。(Để đạt mục tiêu, ngày nào anh ấy cũng học đến khuya)", ["为了", "因为", "由于", "既然"], 0, "为了: để (mục đích)."],
        ["___ 你已经决定了，就好好干吧。(Đã quyết định rồi thì làm cho tốt)", ["既然", "虽然", "尽管", "哪怕"], 0, "既然…就…: đã… thì…"],
        ["他在这个领域 ___ 专家。(Anh ấy được coi là chuyên gia trong lĩnh vực này)", ["算是", "仿佛", "似乎于", "毕竟了"], 0, "算是 = được coi là."],
        ["教育的目的 ___ 培养人的素质。(Mục đích giáo dục là bồi dưỡng tố chất con người)", ["在于", "关于", "对于", "至于"], 0, "在于 = nằm ở, là ở."],
      ],
      sentences: [["为了 实现 目标 他 非常 努力", "Để thực hiện mục tiêu, anh ấy rất nỗ lực."], ["学校 应该 培养 学生 的 创造 能力", "Nhà trường nên bồi dưỡng năng lực sáng tạo của học sinh."], ["他 是 这 个 领域 的 专家", "Ông ấy là chuyên gia trong lĩnh vực này."]] },
    { id: "4", title: "Môi trường và xã hội",
      words: `资源|zīyuán|tài nguyên
能源|néngyuán|năng lượng
浪费|làngfèi|lãng phí
措施|cuòshī|biện pháp
人口|rénkǒu|dân số
城市化|chéngshìhuà|đô thị hóa
平衡|pínghéng|cân bằng
意识|yìshí|ý thức`,
      grammar: [
        ["___ 不采取措施，问题会更严重。(Nếu không có biện pháp, vấn đề sẽ nghiêm trọng hơn)", ["如果", "虽然", "尽管", "宁可"], 0, "如果…会…: nếu… sẽ…"],
        ["我们 ___ 少用一点，也不要浪费。(Thà dùng ít còn hơn lãng phí)", ["宁可", "与其", "何况", "况且"], 0, "宁可…也不…: thà… chứ không…"],
        ["城市化带来了发展，___ 带来了问题。(Đô thị hóa mang lại phát triển, đồng thời cũng mang lại vấn đề)", ["同时也", "反而", "否则", "从而不"], 0, "同时也: đồng thời cũng."],
        ["要提高人们的环保 ___。(Phải nâng cao ý thức bảo vệ môi trường)", ["意识", "意义", "意见", "意思"], 0, "环保意识 = ý thức bảo vệ môi trường."],
      ],
      sentences: [["我们 要 节约 能源 不 能 浪费", "Chúng ta phải tiết kiệm năng lượng, không được lãng phí."], ["政府 采取 了 新 的 措施", "Chính phủ đã áp dụng biện pháp mới."], ["发展 和 环境 要 保持 平衡", "Phát triển và môi trường phải giữ cân bằng."]] },
  ],
};
