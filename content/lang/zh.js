// Chinese — curriculum aligned with HSK 1 to HSK 5.
// Vocabulary: "Hanzi|pinyin|meaning". Sentence building: words separated by spaces.
// Grammar: [question, 4 choices, correct answer index, explanation].
// Only append new units at the END of each level; do not change existing IDs (scores are keyed by ID).
export default {
  id: "zh", name: "Tiếng Trung", native: "中文", flag: "🇨🇳", color: "#DC2626",
  speech: "zh-CN", framework: "HSK", readingLabel: "pinyin",
  readingHint: "Gõ pinyin, có thể bỏ dấu thanh (vd: ni hao hoặc nǐ hǎo).",
  desc: "Giáo trình chuẩn HSK 1–5: từ vựng, pinyin, ngữ pháp và ghép câu.",
  levels: [
    {
      id: "hsk1", title: "HSK 1", desc: "Khoảng 150 từ cơ bản: chào hỏi, số đếm, gia đình.",
      units: [
        {
          id: "1", title: "Chào hỏi và giới thiệu",
          words: `你好|nǐ hǎo|xin chào
谢谢|xièxie|cảm ơn
再见|zàijiàn|tạm biệt
老师|lǎoshī|giáo viên
学生|xuésheng|học sinh
名字|míngzi|tên
中国|Zhōngguó|Trung Quốc
朋友|péngyou|bạn bè
早上好|zǎo shang hǎo|chào buổi sáng
请|qǐng|mời, làm ơn
对不起|duìbuqǐ|xin lỗi
同学|tóngxué|bạn cùng lớp`,
          grammar: [
            ["我 ___ 学生。(Tôi là học sinh)", ["是", "有", "在", "叫"], 0, "是 (shì) = là, dùng nối chủ ngữ với danh từ."],
            ["你叫什么 ___？(Bạn tên là gì?)", ["名字", "老师", "朋友", "中国"], 0, "你叫什么名字 = Bạn tên là gì."],
            ["他 ___ 是老师。(Anh ấy không phải giáo viên)", ["不", "没", "很", "也"], 0, "Phủ định 是 dùng 不: 不是."],
            ["你好 ___？(Bạn khỏe không?)", ["吗", "呢", "的", "了"], 0, "吗 đặt cuối câu để tạo câu hỏi có/không."],
          ],
          sentences: [
            ["我 是 中国 学生", "Tôi là học sinh Trung Quốc."],
            ["你 叫 什么 名字", "Bạn tên là gì?"],
            ["他 是 我 的 朋友", "Anh ấy là bạn của tôi."],
            ["早上好 老师", "Chào buổi sáng, thưa thầy."],
            ["我 很 高兴 认识 你", "Tôi rất vui được gặp bạn."],
            ["我 是 新 学生", "Tôi là học sinh mới."],
            ["你 是 哪国人", "Bạn là người nước nào?"],
          ],
        },
        {
          id: "2", title: "Số đếm, gia đình, thời gian",
          words: `爸爸|bàba|bố
妈妈|māma|mẹ
今天|jīntiān|hôm nay
明天|míngtiān|ngày mai
多少|duōshao|bao nhiêu
岁|suì|tuổi
家|jiā|nhà
喜欢|xǐhuan|thích
姐姐|jiějie|chị gái
哥哥|gēge|anh trai
午饭|wǔfàn|bữa trưa
晚上|wǎnshang|buổi tối`,
          grammar: [
            ["你今年几 ___？(Năm nay bạn mấy tuổi?)", ["岁", "个", "本", "家"], 0, "几岁 hỏi tuổi (thường với trẻ nhỏ)."],
            ["我家 ___ 四口人。(Nhà tôi có bốn người)", ["有", "是", "在", "去"], 0, "有 (yǒu) = có."],
            ["我 ___ 喝茶。(Tôi thích uống trà)", ["喜欢", "认识", "知道", "回来"], 0, "喜欢 + động từ = thích làm gì."],
            ["今天星期 ___？(Hôm nay thứ mấy?)", ["几", "多", "什么", "哪"], 0, "星期几 = thứ mấy."],
          ],
          sentences: [
            ["我 家 有 三 口 人", "Nhà tôi có ba người."],
            ["今天 是 星期一", "Hôm nay là thứ Hai."],
            ["我 妈妈 喜欢 喝 茶", "Mẹ tôi thích uống trà."],
            ["我 姐姐 喜欢 音乐", "Chị tôi thích âm nhạc."],
            ["我们 中午 吃 午饭", "Chúng tôi ăn trưa lúc giữa trưa."],
            ["我 哥哥 晚上 工作", "Anh tôi làm việc vào buổi tối."],
            ["我 和 家人 吃 晚饭", "Tôi ăn tối cùng gia đình."],
            ["她 早上 六点 起床", "Cô ấy dậy lúc sáu giờ sáng."],
          ],
        },
      ],
    },
    {
      id: "hsk2", title: "HSK 2", desc: "Khoảng 300 từ: mua sắm, đi lại, sức khỏe, thời tiết.",
      units: [
        {
          id: "1", title: "Mua sắm và đi lại",
          words: `便宜|piányi|rẻ
贵|guì|đắt
机场|jīchǎng|sân bay
公共汽车|gōnggòng qìchē|xe buýt
旁边|pángbiān|bên cạnh
离|lí|cách (khoảng cách)
远|yuǎn|xa
卖|mài|bán
商店|shāngdiàn|cửa hàng
衣服|yīfu|quần áo
地铁|dìtiě|tàu điện ngầm
出租车|chūzūchē|xe taxi
票|piào|vé
钱|qián|tiền
颜色|yánsè|màu sắc`,
          grammar: [
            ["学校 ___ 我家很远。(Trường cách nhà tôi rất xa)", ["离", "从", "在", "往"], 0, "A 离 B 远/近: A cách B xa/gần."],
            ["这件衣服 ___ 那件贵。(Áo này đắt hơn áo kia)", ["比", "跟", "和", "像"], 0, "A 比 B + tính từ: so sánh hơn."],
            ["我 ___ 坐公共汽车去。(Tôi đang định đi xe buýt)", ["要", "过", "着", "得"], 0, "要 + động từ: sắp/định làm."],
            ["你去 ___ 北京吗？(Bạn đã từng đến Bắc Kinh chưa?)", ["过", "了", "着", "的"], 0, "Động từ + 过: đã từng."],
          ],
          sentences: [
            ["这 个 比 那 个 便宜", "Cái này rẻ hơn cái kia."],
            ["机场 离 这儿 很 远", "Sân bay cách đây rất xa."],
            ["我 坐 公共汽车 去 学校", "Tôi đi xe buýt đến trường."],            ["我想买一件衣服。", "Tôi muốn mua một cái áo."],
            ["这件衣服多少钱？", "Cái áo này bao nhiêu tiền?"],
            ["地铁站离商店很近。", "Ga tàu điện ngầm cách cửa hàng rất gần."],
            ["我们坐出租车去火车站吧。", "Chúng ta đi taxi đến ga tàu nhé."],
            ["请给我一张去机场的票。", "Làm ơn cho tôi một vé đi sân bay."],
            ["你喜欢什么颜色？", "Bạn thích màu gì?"],
            ["这家商店的东西很便宜。", "Đồ ở cửa hàng này rất rẻ."],

          ],
        },
        {
          id: "2", title: "Sức khỏe và thời tiết",
          words: `身体|shēntǐ|cơ thể, sức khỏe
生病|shēngbìng|bị ốm
医生|yīshēng|bác sĩ
药|yào|thuốc
下雨|xià yǔ|mưa
晴|qíng|trời nắng, quang
冷|lěng|lạnh
休息|xiūxi|nghỉ ngơi
发烧|fāshāo|sốt
感冒|gǎnmào|cảm cúm
头疼|tóuténg|đau đầu
医院|yīyuàn|bệnh viện
天气|tiānqì|thời tiết
热|rè|nóng
雪|xuě|tuyết`,
          grammar: [
            ["外面 ___ 下雨。(Bên ngoài đang mưa)", ["正在", "已经", "就要", "刚才"], 0, "正在 + động từ: đang làm."],
            ["他病 ___，今天不来。(Anh ấy ốm rồi, hôm nay không đến)", ["了", "过", "着", "的"], 0, "了 cuối câu chỉ sự thay đổi trạng thái."],
            ["你 ___ 多休息。(Bạn nên nghỉ ngơi nhiều)", ["应该", "可能", "觉得", "知道"], 0, "应该 = nên."],
            ["今天 ___ 冷 ___ 热。(Hôm nay không lạnh không nóng)", ["不…不…", "又…又…", "越…越…", "也…也…"], 0, "不 A 不 B: không A cũng không B."],
          ],
          sentences: [
            ["医生 说 我 要 多 休息", "Bác sĩ nói tôi phải nghỉ ngơi nhiều."],
            ["明天 可能 会 下雨", "Ngày mai có thể sẽ mưa."],
            ["你 身体 怎么样", "Sức khỏe của bạn thế nào?"],            ["今天天气很好，不冷也不热。", "Hôm nay thời tiết rất đẹp, không lạnh cũng không nóng."],
            ["我感冒了，有点儿发烧。", "Tôi bị cảm cúm, hơi sốt."],
            ["他头疼，去医院看医生了。", "Anh ấy đau đầu, đã đi bệnh viện khám bác sĩ."],
            ["明天会下雪，你要多穿衣服。", "Ngày mai sẽ có tuyết, bạn phải mặc thêm áo."],
            ["你应该多喝水，好好休息。", "Bạn nên uống nhiều nước, nghỉ ngơi cho tốt."],
            ["外面风很大，别出门了。", "Bên ngoài gió rất to, đừng ra ngoài nữa."],
            ["我的身体好多了，谢谢你。", "Sức khỏe của tôi đã khá hơn nhiều, cảm ơn bạn."],

          ],
        },
      ],
    },
    {
      id: "hsk3", title: "HSK 3", desc: "Khoảng 600 từ: học tập, công việc, cảm xúc, sinh hoạt.",
      units: [
        {
          id: "1", title: "Học tập và công việc",
          words: `作业|zuòyè|bài tập về nhà
考试|kǎoshì|kỳ thi
经理|jīnglǐ|giám đốc, quản lý
会议|huìyì|cuộc họp
努力|nǔlì|cố gắng
完成|wánchéng|hoàn thành
认真|rènzhēn|chăm chỉ, nghiêm túc
解决|jiějué|giải quyết
课程|kèchéng|khóa học, môn học
同事|tóngshì|đồng nghiệp
加班|jiābān|làm thêm giờ
成绩|chéngjì|thành tích, điểm số
准备|zhǔnbèi|chuẩn bị
计划|jìhuà|kế hoạch
迟到|chídào|đến muộn`,
          grammar: [
            ["我 ___ 作业做完了。(Tôi đã làm xong bài tập)", ["把", "被", "让", "给"], 0, "Câu chữ 把: 把 + tân ngữ + động từ + bổ ngữ."],
            ["只要你努力，___ 能成功。(Chỉ cần bạn cố gắng thì sẽ thành công)", ["就", "才", "都", "还"], 0, "只要…就…: chỉ cần… thì…"],
            ["这个问题我听 ___ 了。(Tôi nghe hiểu vấn đề này rồi)", ["懂", "到", "好", "完"], 0, "听懂: bổ ngữ kết quả — nghe hiểu."],
            ["会议 ___ 九点开始。(Cuộc họp bắt đầu lúc 9 giờ)", ["在", "从", "对", "向"], 0, "在 + thời điểm: vào lúc."],
          ],
          sentences: [
            ["我 把 作业 做 完 了", "Tôi đã làm xong bài tập."],
            ["经理 让 我 参加 会议", "Giám đốc bảo tôi tham gia cuộc họp."],
            ["只要 努力 就 能 解决", "Chỉ cần cố gắng là có thể giải quyết."],            ["明天上午有一门很重要的课程。", "Sáng mai có một môn học rất quan trọng."],
            ["我的同事们都很认真负责。", "Các đồng nghiệp của tôi đều rất chăm chỉ và có trách nhiệm."],
            ["为了准备考试，我每天学习到很晚。", "Để chuẩn bị cho kỳ thi, mỗi ngày tôi học đến rất khuya."],
            ["这个星期我们要完成工作计划。", "Tuần này chúng ta phải hoàn thành kế hoạch công việc."],
            ["他这次考试的成绩很好。", "Lần thi này điểm số của anh ấy rất tốt."],
            ["对不起，我今天上班迟到了。", "Xin lỗi, hôm nay tôi đi làm muộn."],
            ["最近工作很忙，我常常加班。", "Gần đây công việc rất bận, tôi thường xuyên làm thêm giờ."],

          ],
        },
        {
          id: "2", title: "Cảm xúc và sinh hoạt",
          words: `高兴|gāoxìng|vui mừng
担心|dānxīn|lo lắng
生气|shēngqì|tức giận
满意|mǎnyì|hài lòng
习惯|xíguàn|thói quen
打扫|dǎsǎo|quét dọn
洗澡|xǐzǎo|tắm
锻炼|duànliàn|rèn luyện
紧张|jǐnzhāng|căng thẳng, hồi hộp
放松|fàngsōng|thư giãn
难过|nánguò|buồn
兴奋|xīngfèn|hào hứng, phấn khích
做饭|zuò fàn|nấu ăn
购物|gòuwù|mua sắm
睡觉|shuìjiào|ngủ`,
          grammar: [
            ["他 ___ 妈妈批评了。(Anh ấy bị mẹ phê bình)", ["被", "把", "让", "比"], 0, "Câu bị động: A 被 B + động từ."],
            ["我越学 ___ 喜欢汉语。(Càng học tôi càng thích tiếng Trung)", ["越", "更", "最", "很"], 0, "越…越…: càng… càng…"],
            ["你别 ___ 心，没问题。(Bạn đừng lo, không sao)", ["担", "放", "关", "开"], 0, "别担心 = đừng lo."],
            ["除了跑步 ___，我还游泳。(Ngoài chạy bộ ra, tôi còn bơi)", ["以外", "以后", "以前", "以上"], 0, "除了…以外，还…: ngoài… ra còn…"],
          ],
          sentences: [
            ["我 每天 早上 锻炼 身体", "Mỗi sáng tôi đều rèn luyện thân thể."],
            ["妈妈 对 我 很 满意", "Mẹ rất hài lòng với tôi."],
            ["他 被 老师 批评 了", "Cậu ấy bị thầy giáo phê bình."],            ["考试之前，我有点儿紧张。", "Trước kỳ thi, tôi hơi hồi hộp."],
            ["听到这个好消息，我非常兴奋。", "Nghe được tin tốt này, tôi vô cùng hào hứng."],
            ["周末在家做饭，我觉得很放松。", "Cuối tuần ở nhà nấu ăn, tôi cảm thấy rất thư giãn."],
            ["他今天很难过，因为丢了钱包。", "Hôm nay anh ấy rất buồn vì làm mất ví."],
            ["我习惯每天晚上十一点睡觉。", "Tôi quen ngủ lúc mười một giờ mỗi tối."],
            ["妈妈去市场购物，买了很多菜。", "Mẹ đi chợ mua sắm, mua rất nhiều rau."],
            ["别难过，事情会慢慢好起来的。", "Đừng buồn, mọi chuyện sẽ dần tốt lên thôi."],

          ],
        },
      ],
    },
    {
      id: "hsk4", title: "HSK 4", desc: "Khoảng 1200 từ: xã hội, nghề nghiệp, du lịch, môi trường.",
      units: [
        {
          id: "1", title: "Nghề nghiệp và xã hội",
          words: `招聘|zhāopìn|tuyển dụng
工资|gōngzī|tiền lương
经验|jīngyàn|kinh nghiệm
能力|nénglì|năng lực
责任|zérèn|trách nhiệm
竞争|jìngzhēng|cạnh tranh
专业|zhuānyè|chuyên ngành
提高|tígāo|nâng cao
面试|miànshì|phỏng vấn
简历|jiǎnlì|sơ yếu lý lịch, CV
升职|shēngzhí|thăng chức
辞职|cízhí|nghỉ việc, từ chức
合作|hézuò|hợp tác
压力|yālì|áp lực
成功|chénggōng|thành công`,
          grammar: [
            ["___ 工资不高，___ 他很喜欢这份工作。(Tuy lương không cao nhưng anh ấy rất thích công việc này)", ["虽然…但是…", "因为…所以…", "如果…就…", "不但…而且…"], 0, "虽然…但是…: tuy… nhưng…"],
            ["他 ___ 有经验，___ 很有能力。(Anh ấy không những có kinh nghiệm mà còn rất có năng lực)", ["不但…而且…", "既然…就…", "无论…都…", "即使…也…"], 0, "不但…而且…: không những… mà còn…"],
            ["___ 多忙，他 ___ 坚持学习。(Dù bận đến đâu anh ấy cũng kiên trì học)", ["无论…都…", "只有…才…", "虽然…可是…", "因为…所以…"], 0, "无论…都…: bất kể… đều…"],
            ["这份工作对他来说 ___ 重要。(Công việc này đối với anh ấy vô cùng quan trọng)", ["十分", "差不多", "几乎", "到底"], 0, "十分 + tính từ: vô cùng, rất."],
          ],
          sentences: [
            ["这 家 公司 正在 招聘 新 员工", "Công ty này đang tuyển nhân viên mới."],
            ["我们 应该 提高 自己 的 能力", "Chúng ta nên nâng cao năng lực của bản thân."],
            ["他 对 工作 很 有 责任 心", "Anh ấy rất có tinh thần trách nhiệm với công việc."],            ["下星期一我要去参加面试。", "Thứ Hai tuần sau tôi phải đi phỏng vấn."],
            ["请把你的简历发给我看一下。", "Làm ơn gửi CV của bạn cho tôi xem."],
            ["他工作努力，去年升职了。", "Anh ấy làm việc chăm chỉ, năm ngoái đã được thăng chức."],
            ["在现代社会，工作压力越来越大。", "Trong xã hội hiện đại, áp lực công việc ngày càng lớn."],
            ["我们公司想和他们合作这个项目。", "Công ty chúng tôi muốn hợp tác với họ trong dự án này."],
            ["他辞职以后自己开了一家公司。", "Sau khi nghỉ việc, anh ấy tự mở một công ty."],
            ["只有不断学习，才能取得成功。", "Chỉ có không ngừng học hỏi mới có thể đạt được thành công."],

          ],
        },
        {
          id: "2", title: "Du lịch và môi trường",
          words: `景色|jǐngsè|phong cảnh
护照|hùzhào|hộ chiếu
签证|qiānzhèng|thị thực
污染|wūrǎn|ô nhiễm
保护|bǎohù|bảo vệ
环境|huánjìng|môi trường
垃圾|lājī|rác
节约|jiéyuē|tiết kiệm
旅行|lǚxíng|du lịch, chuyến đi
导游|dǎoyóu|hướng dẫn viên du lịch
酒店|jiǔdiàn|khách sạn
海滩|hǎitān|bãi biển
空气|kōngqì|không khí
气候|qìhòu|khí hậu
回收|huíshōu|tái chế`,
          grammar: [
            ["___ 明天下雨，我们 ___ 不去爬山了。(Nếu mai mưa thì chúng ta không đi leo núi nữa)", ["要是…就…", "虽然…但…", "不仅…还…", "一…就…"], 0, "要是…就…: nếu… thì…"],
            ["我们 ___ 保护环境。(Chúng ta phải bảo vệ môi trường)", ["必须", "不得不说", "差点儿", "恐怕"], 0, "必须 = bắt buộc phải."],
            ["这里的景色美 ___ 了！(Phong cảnh ở đây đẹp quá!)", ["极", "很", "非常", "太"], 0, "Tính từ + 极了: cực kỳ."],
            ["我 ___ 护照忘在酒店了。(Tôi để quên hộ chiếu ở khách sạn)", ["把", "被", "让", "对"], 0, "把 + tân ngữ + 忘在 + nơi chốn."],
          ],
          sentences: [
            ["我们 要 保护 环境 节约 用 水", "Chúng ta phải bảo vệ môi trường, tiết kiệm nước."],
            ["这里 的 景色 美 极 了", "Phong cảnh ở đây đẹp tuyệt vời."],
            ["办 签证 需要 带 护照", "Làm thị thực cần mang hộ chiếu."],            ["今年夏天我们全家去海边旅行。", "Mùa hè năm nay cả nhà chúng tôi đi du lịch biển."],
            ["导游带我们参观了这座古老的城市。", "Hướng dẫn viên đưa chúng tôi đi tham quan thành phố cổ này."],
            ["这家酒店离海滩很近，风景很好。", "Khách sạn này cách bãi biển rất gần, phong cảnh rất đẹp."],
            ["这里的空气很新鲜，气候也很舒服。", "Không khí ở đây rất trong lành, khí hậu cũng rất dễ chịu."],
            ["我们应该把垃圾分类，进行回收。", "Chúng ta nên phân loại rác để tái chế."],
            ["旅行的时候别忘了带上护照和相机。", "Khi đi du lịch đừng quên mang theo hộ chiếu và máy ảnh."],

          ],
        },
      ],
    },
    {
      id: "hsk5", title: "HSK 5", desc: "Khoảng 2500 từ: kinh tế, tin tức, văn hóa, lập luận.",
      units: [
        {
          id: "1", title: "Kinh tế và tin tức",
          words: `经济|jīngjì|kinh tế
投资|tóuzī|đầu tư
市场|shìchǎng|thị trường
趋势|qūshì|xu hướng
影响|yǐngxiǎng|ảnh hưởng
政策|zhèngcè|chính sách
报道|bàodào|đưa tin, bài báo
显著|xiǎnzhù|rõ rệt`,
          grammar: [
            ["___ 政策的变化，市场出现了新的趋势。(Do chính sách thay đổi, thị trường xuất hiện xu hướng mới)", ["由于", "尽管", "何况", "以免"], 0, "由于 = do, bởi vì (văn viết)."],
            ["这项投资 ___ 风险大，___ 回报也高。(Khoản đầu tư này rủi ro lớn nhưng lợi nhuận cũng cao)", ["尽管…却…", "只要…就…", "宁可…也不…", "与其…不如…"], 0, "尽管…却…: mặc dù… nhưng lại…"],
            ["经济增长对就业产生了 ___ 影响。(Tăng trưởng kinh tế tạo ra ảnh hưởng rõ rệt đến việc làm)", ["显著", "陆续", "仿佛", "反而"], 0, "显著的影响 = ảnh hưởng rõ rệt."],
            ["___ 报道，今年出口增加了百分之十。(Theo đưa tin, năm nay xuất khẩu tăng 10%)", ["据", "按", "凭", "趁"], 0, "据报道 = theo đưa tin."],
          ],
          sentences: [
            ["据 报道 今年 经济 增长 显著", "Theo đưa tin, kinh tế năm nay tăng trưởng rõ rệt."],
            ["新 政策 对 市场 产生 了 影响", "Chính sách mới đã tạo ra ảnh hưởng đến thị trường."],
            ["投资 之前 要 了解 市场 趋势", "Trước khi đầu tư cần tìm hiểu xu hướng thị trường."],
          ],
        },
        {
          id: "2", title: "Văn hóa và lập luận",
          words: `传统|chuántǒng|truyền thống
观念|guānniàn|quan niệm
独特|dútè|độc đáo
承认|chéngrèn|thừa nhận
争论|zhēnglùn|tranh luận
理由|lǐyóu|lý do
总之|zǒngzhī|tóm lại
逐渐|zhújiàn|dần dần`,
          grammar: [
            ["___ 在家休息，___ 出去走走。(Thà ra ngoài đi dạo còn hơn ở nhà nghỉ)", ["与其…不如…", "既…又…", "一边…一边…", "连…都…"], 0, "与其 A 不如 B: thay vì A thì B tốt hơn."],
            ["传统观念正在 ___ 改变。(Quan niệm truyền thống đang dần dần thay đổi)", ["逐渐", "曾经", "总之", "毕竟"], 0, "逐渐 = dần dần."],
            ["他 ___ 一句话 ___ 没说就走了。(Anh ta một câu cũng không nói đã bỏ đi)", ["连…都…", "既…也…", "越…越…", "又…又…"], 0, "连…都/也…: ngay cả… cũng…"],
            ["___，这种文化非常独特。(Tóm lại, văn hóa này rất độc đáo)", ["总之", "否则", "何况", "以便"], 0, "总之 = tóm lại."],
          ],
          sentences: [
            ["我们 应该 尊重 不同 的 文化 传统", "Chúng ta nên tôn trọng các truyền thống văn hóa khác nhau."],
            ["他 终于 承认 了 自己 的 错误", "Cuối cùng anh ấy đã thừa nhận sai lầm của mình."],
            ["人们 的 观念 逐渐 发生 了 变化", "Quan niệm của mọi người đã dần thay đổi."],
          ],
        },
      ],
    },
  ],
};
