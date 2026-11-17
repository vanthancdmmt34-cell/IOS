// Japanese — curriculum aligned with JLPT N5 to N1.
// Vocabulary: "word|reading (kana/romaji, multiple separated by /)|meaning".
// Sentence building: chunks separated by spaces. Only append new units at the end of each level.
export default {
  id: "ja", name: "Tiếng Nhật", native: "日本語", flag: "🇯🇵", color: "#BE185D",
  speech: "ja-JP", framework: "JLPT", readingLabel: "cách đọc",
  readingHint: "Gõ hiragana hoặc romaji (vd: すし hoặc sushi).",
  desc: "Giáo trình chuẩn JLPT N5 → N1: từ vựng, cách đọc kanji, ngữ pháp, ghép câu.",
  levels: [
    {
      id: "n5", title: "JLPT N5", desc: "Khoảng 800 từ, 100 kanji: chào hỏi, giới thiệu, sinh hoạt.",
      units: [
        {
          id: "1", title: "Chào hỏi và giới thiệu",
          words: `学生|がくせい/gakusei|học sinh, sinh viên
先生|せんせい/sensei|giáo viên
名前|なまえ/namae|tên
友達|ともだち/tomodachi|bạn bè
日本|にほん/nihon|Nhật Bản
会社員|かいしゃいん/kaishain|nhân viên công ty
ありがとう|ありがとう/arigatou|cảm ơn
国|くに/kuni|đất nước
おはよう|おはよう/ohayou|chào buổi sáng
すみません|すみません/sumimasen|xin lỗi
はじめまして|はじめまして/hajimemashite|rất vui được gặp bạn
どうぞ|どうぞ/douzo|mời, làm ơn`,
          grammar: [
            ["わたし ___ 学生です。(Tôi là sinh viên)", ["は", "を", "に", "で"], 0, "は đánh dấu chủ đề: AはBです = A là B."],
            ["これは わたし ___ 本です。(Đây là sách của tôi)", ["の", "が", "と", "へ"], 0, "の nối hai danh từ: của."],
            ["田中さんは 先生では ___。(Anh Tanaka không phải giáo viên)", ["ありません", "います", "あります", "でした"], 0, "Phủ định của です: ではありません."],
            ["お名前は 何です ___？(Tên bạn là gì?)", ["か", "ね", "よ", "も"], 0, "か cuối câu tạo câu hỏi."],
          ],
          sentences: [
            ["わたしは ベトナム人 です", "Tôi là người Việt Nam."],
            ["これは わたしの 本 です", "Đây là sách của tôi."],
            ["あの人は 先生 ですか", "Người kia là giáo viên phải không?"],
            ["おはようございます 先生", "Chào buổi sáng, thưa thầy."],
            ["はじめまして どうぞ よろしく", "Rất vui được gặp bạn, mong được giúp đỡ."],
            ["わたしは 新しい 学生 です", "Tôi là học sinh mới."],
            ["あの人は わたしの 友達 です", "Người kia là bạn tôi."],
          ],
        },
        {
          id: "2", title: "Thời gian và sinh hoạt",
          words: `今日|きょう/kyou|hôm nay
明日|あした/ashita|ngày mai
毎朝|まいあさ/maiasa|mỗi sáng
食べる|たべる/taberu|ăn
飲む|のむ/nomu|uống
行く|いく/iku|đi
水|みず/mizu|nước
時間|じかん/jikan|thời gian
姉|あね/ane|chị gái
兄|あに/ani|anh trai
昼ごはん|ひるごはん/hirugohan|bữa trưa
夜|よる/yoru|buổi tối`,
          grammar: [
            ["毎朝 パン ___ 食べます。(Mỗi sáng tôi ăn bánh mì)", ["を", "は", "に", "が"], 0, "を đánh dấu tân ngữ trực tiếp."],
            ["明日 東京 ___ 行きます。(Ngày mai tôi đi Tokyo)", ["へ", "を", "で", "の"], 0, "へ/に chỉ hướng di chuyển."],
            ["7時 ___ 起きます。(Tôi dậy lúc 7 giờ)", ["に", "で", "を", "が"], 0, "に đi sau thời điểm cụ thể."],
            ["きのう 映画を ___。(Hôm qua tôi đã xem phim)", ["見ました", "見ます", "見ません", "見て"], 0, "Quá khứ lịch sự: ます → ました."],
          ],
          sentences: [
            ["毎朝 コーヒーを 飲みます", "Mỗi sáng tôi uống cà phê."],
            ["あした 学校へ 行きます", "Ngày mai tôi đi đến trường."],
            ["きのう すしを 食べました", "Hôm qua tôi đã ăn sushi."],
            ["わたしの 姉は 音楽が 好きです", "Chị tôi thích âm nhạc."],
            ["昼ごはんは 12時に 食べます", "Tôi ăn trưa lúc 12 giờ."],
            ["わたしの 兄は 夜 働きます", "Anh tôi làm việc vào buổi tối."],
            ["家族と 晩ごはんを 食べます", "Tôi ăn tối cùng gia đình."],
            ["彼女は 朝 6時に 起きます", "Cô ấy dậy lúc sáu giờ sáng."],
          ],
        },
      ],
    },
    {
      id: "n4", title: "JLPT N4", desc: "Khoảng 1500 từ, 300 kanji: thể て, thể ない, khả năng, kinh nghiệm.",
      units: [
        {
          id: "1", title: "Mua sắm và đi lại",
          words: `駅|えき/eki|nhà ga
電車|でんしゃ/densha|tàu điện
切符|きっぷ/kippu|vé
安い|やすい/yasui|rẻ
高い|たかい/takai|đắt, cao
買う|かう/kau|mua
近い|ちかい/chikai|gần
地図|ちず/chizu|bản đồ
バス|バス/basu|xe buýt
値段|ねだん/nedan|giá cả
売り場|うりば/uriba|quầy hàng
支払う|しはらう/shiharau|trả tiền
乗る|のる/noru|lên xe
降りる|おりる/oriru|xuống xe
信号|しんごう/shingou|đèn giao thông`,
          grammar: [
            ["写真を 撮って ___ いいですか。(Tôi chụp ảnh có được không?)", ["も", "は", "が", "を"], 0, "〜てもいいですか: làm… có được không."],
            ["ここで たばこを 吸っては ___。(Không được hút thuốc ở đây)", ["いけません", "いいです", "あります", "なります"], 0, "〜てはいけません: không được làm."],
            ["日本語が 少し 話せ ___。(Tôi có thể nói một chút tiếng Nhật)", ["ます", "ません", "ました", "ましょう"], 0, "話せる: thể khả năng của 話す."],
            ["富士山に 登った ___ が あります。(Tôi đã từng leo núi Phú Sĩ)", ["こと", "もの", "ところ", "はず"], 0, "〜たことがある: đã từng."],
          ],
          sentences: [
            ["駅まで 電車で 行きます", "Tôi đi tàu điện đến nhà ga."],
            ["この 靴は 安くて いいです", "Đôi giày này rẻ mà tốt."],
            ["日本へ 行った ことが あります", "Tôi đã từng đến Nhật Bản."],            ["バスで 学校へ 行きます", "Tôi đi xe buýt đến trường."],
            ["この カバンの 値段は いくらですか", "Giá của chiếc túi này là bao nhiêu?"],
            ["売り場は 3階に あります", "Quầy hàng ở tầng 3."],
            ["現金で 支払います", "Tôi trả bằng tiền mặt."],
            ["次の 駅で 降ります", "Tôi xuống ở ga tiếp theo."],
            ["信号が 赤ですから 止まります", "Vì đèn đỏ nên tôi dừng lại."],
            ["コンビニで お金を 払います", "Tôi trả tiền ở cửa hàng tiện lợi."],

          ],
        },
        {
          id: "2", title: "Sức khỏe và thời tiết",
          words: `病院|びょういん/byouin|bệnh viện
薬|くすり/kusuri|thuốc
風邪|かぜ/kaze|cảm lạnh
熱|ねつ/netsu|sốt
雨|あめ/ame|mưa
寒い|さむい/samui|lạnh
休む|やすむ/yasumu|nghỉ
天気|てんき/tenki|thời tiết
体調|たいちょう/taichou|tình trạng sức khỏe
頭痛|ずつう/zutsuu|đau đầu
咳|せき/seki|ho
晴れ|はれ/hare|trời nắng
曇り|くもり/kumori|trời nhiều mây
暑い|あつい/atsui|nóng
運動|うんどう/undou|vận động`,
          grammar: [
            ["熱が あるので、学校を 休ま ___ なりません。(Vì sốt nên phải nghỉ học)", ["なければ", "なくて", "ないで", "ない"], 0, "〜なければなりません: phải làm."],
            ["明日は 雨が 降る ___ です。(Nghe nói mai trời mưa)", ["そう", "よう", "らしい", "みたい"], 0, "Thể thường + そうです: nghe nói (truyền đạt)."],
            ["薬を 飲んだ ___ がいいですよ。(Bạn nên uống thuốc)", ["ほう", "こと", "まま", "ため"], 0, "〜たほうがいい: nên làm."],
            ["寒い ___、窓を 閉めてください。(Vì lạnh, hãy đóng cửa sổ)", ["から", "けど", "のに", "まで"], 0, "から: vì (nêu lý do)."],
          ],
          sentences: [
            ["風邪を ひいたので 病院へ 行きます", "Vì bị cảm nên tôi đi bệnh viện."],
            ["今日は 寒いから コートを 着ます", "Hôm nay lạnh nên tôi mặc áo khoác."],
            ["ゆっくり 休んだ ほうが いいです", "Bạn nên nghỉ ngơi thong thả."],            ["今日は 体調が よくないです", "Hôm nay sức khỏe tôi không tốt."],
            ["頭が 痛いので 早く 寝ます", "Vì đau đầu nên tôi đi ngủ sớm."],
            ["咳が 出るので マスクを します", "Vì bị ho nên tôi đeo khẩu trang."],
            ["明日は 晴れるそうです", "Nghe nói ngày mai trời nắng."],
            ["今日は 曇りで 涼しいです", "Hôm nay trời nhiều mây và mát mẻ."],
            ["夏は 暑いので 水を よく 飲みます", "Mùa hè nóng nên tôi uống nhiều nước."],
            ["健康の ために 毎日 運動します", "Tôi vận động mỗi ngày vì sức khỏe."],

          ],
        },
      ],
    },
    {
      id: "n3", title: "JLPT N3", desc: "Khoảng 3700 từ, 650 kanji: bị động, sai khiến, kính ngữ cơ bản.",
      units: [
        {
          id: "1", title: "Công việc và học tập",
          words: `会議|かいぎ/kaigi|cuộc họp
資料|しりょう/shiryou|tài liệu
準備|じゅんび/junbi|chuẩn bị
経験|けいけん/keiken|kinh nghiệm
説明|せつめい/setsumei|giải thích
締め切り|しめきり/shimekiri|hạn chót
努力|どりょく/doryoku|nỗ lực
責任|せきにん/sekinin|trách nhiệm
残業|ざんぎょう/zangyou|làm thêm giờ
出張|しゅっちょう/shucchou|đi công tác
提出|ていしゅつ/teishutsu|nộp
採用|さいよう/saiyou|tuyển dụng
研修|けんしゅう/kenshuu|đào tạo
進学|しんがく/shingaku|học lên cao
奨学金|しょうがくきん/shougakukin|học bổng`,
          grammar: [
            ["部長に 資料を 作ら ___ ました。(Tôi bị trưởng phòng bắt làm tài liệu)", ["され", "せ", "れ", "させ"], 0, "Bị động sai khiến 作らされる: bị bắt phải làm."],
            ["先生に 褒め ___ ました。(Tôi được thầy khen)", ["られ", "させ", "させられ", "て"], 0, "Bị động nhóm 2: 褒める → 褒められる."],
            ["締め切りに 間に合う ___ に、急いでいます。(Tôi đang vội để kịp hạn chót)", ["よう", "ため", "こと", "わけ"], 0, "Động từ khả năng/nguyên dạng + ように: để (đạt trạng thái)."],
            ["経験 ___、この仕事は 難しいです。(Đối với người không có kinh nghiệm, việc này khó)", ["がないと", "があって", "にとって", "について"], 0, "〜がないと: nếu không có…"],
          ],
          sentences: [
            ["会議の 資料を 準備して おきます", "Tôi sẽ chuẩn bị sẵn tài liệu cho cuộc họp."],
            ["先生に 作文を 褒められました", "Tôi được thầy khen bài văn."],
            ["日本語が 話せる ように 毎日 練習します", "Tôi luyện tập mỗi ngày để có thể nói tiếng Nhật."],            ["今日は 残業が あるので 遅く 帰ります", "Hôm nay tôi làm thêm giờ nên về muộn."],
            ["来週 東京へ 出張します", "Tuần sau tôi đi công tác ở Tokyo."],
            ["レポートを 明日までに 提出します", "Tôi sẽ nộp báo cáo trước ngày mai."],
            ["新しい 社員を 採用しました", "Công ty đã tuyển nhân viên mới."],
            ["新人研修で ビジネスマナーを 学びます", "Tôi học lễ nghi kinh doanh trong khóa đào tạo nhân viên mới."],
            ["大学に 進学する ために 勉強しています", "Tôi đang học để thi lên đại học."],
            ["奨学金を もらって 留学したいです", "Tôi muốn nhận học bổng để đi du học."],

          ],
        },
        {
          id: "2", title: "Cảm xúc và quan hệ",
          words: `感謝|かんしゃ/kansha|biết ơn
心配|しんぱい/shinpai|lo lắng
恥ずかしい|はずかしい/hazukashii|xấu hổ
約束|やくそく/yakusoku|lời hứa
相談|そうだん/soudan|bàn bạc, tư vấn
関係|かんけい/kankei|quan hệ
気持ち|きもち/kimochi|cảm xúc, tâm trạng
信じる|しんじる/shinjiru|tin tưởng
嬉しい|うれしい/ureshii|vui mừng
寂しい|さびしい/sabishii|buồn, cô đơn
仲良し|なかよし/nakayoshi|thân thiết
喧嘩|けんか/kenka|cãi nhau
謝る|あやまる/ayamaru|xin lỗi
励ます|はげます/hagemasu|động viên
尊敬|そんけい/sonkei|tôn trọng`,
          grammar: [
            ["約束した ___、行かなければならない。(Vì đã hứa nên phải đi)", ["以上", "ばかり", "ところ", "うちに"], 0, "〜以上: một khi đã… thì…"],
            ["若い ___ に、いろいろな 経験を したい。(Muốn trải nghiệm nhiều thứ khi còn trẻ)", ["うち", "あいだ", "まえ", "あと"], 0, "〜うちに: trong lúc còn…"],
            ["彼は 怒っている ___ だ。(Có vẻ anh ấy đang giận)", ["よう", "そう", "はず", "べき"], 0, "〜ようだ: có vẻ như (suy đoán)."],
            ["友達に 相談 ___ どうですか。(Bạn thử bàn với bạn bè xem sao?)", ["したら", "すれば", "しても", "しながら"], 0, "〜たらどうですか: thử… xem sao."],
          ],
          sentences: [
            ["家族に 感謝の 気持ちを 伝えたい", "Tôi muốn bày tỏ lòng biết ơn với gia đình."],
            ["困った ときは 友達に 相談します", "Khi gặp khó khăn tôi bàn với bạn bè."],
            ["若い うちに 外国へ 行きたい", "Tôi muốn đi nước ngoài khi còn trẻ."],            ["合格して とても 嬉しいです", "Tôi rất vui vì đã đỗ."],
            ["家族と 離れて 寂しいです", "Tôi thấy buồn vì xa gia đình."],
            ["彼女とは 子どもの ころから 仲良しです", "Tôi thân thiết với cô ấy từ nhỏ."],
            ["友達と 喧嘩して しまいました", "Tôi đã cãi nhau với bạn."],
            ["遅れて すみませんと 謝りました", "Tôi đã xin lỗi vì đến muộn."],
            ["友達が 落ち込んでいたので 励ましました", "Bạn tôi đang buồn nên tôi đã động viên bạn ấy."],
            ["先生を 尊敬しています", "Tôi tôn trọng thầy giáo."],

          ],
        },
      ],
    },
    {
      id: "n2", title: "JLPT N2", desc: "Khoảng 6000 từ, 1000 kanji: văn viết, tin tức, biểu hiện trang trọng.",
      units: [
        {
          id: "1", title: "Xã hội và kinh tế",
          words: `景気|けいき/keiki|tình hình kinh tế
就職|しゅうしょく/shuushoku|tìm được việc làm
少子化|しょうしか/shoushika|giảm tỉ lệ sinh
環境|かんきょう/kankyou|môi trường
増加|ぞうか/zouka|gia tăng
減少|げんしょう/genshou|suy giảm
影響|えいきょう/eikyou|ảnh hưởng
対策|たいさく/taisaku|biện pháp đối phó
失業|しつぎょう/shitsugyou|thất nghiệp
物価|ぶっか/bukka|giá cả hàng hóa
税金|ぜいきん/zeikin|thuế
格差|かくさ/kakusa|chênh lệch
消費|しょうひ/shouhi|tiêu dùng
賃金|ちんぎん/chingin|tiền lương
景気回復|けいきかいふく/keikikaifuku|phục hồi kinh tế`,
          grammar: [
            ["人口の 減少 ___、労働者が 不足している。(Cùng với sự giảm dân số, lao động đang thiếu)", ["に伴って", "に対して", "について", "にとって"], 0, "〜に伴って: cùng với, kéo theo."],
            ["景気が 悪い ___、就職は 難しい。(Chính vì kinh tế xấu nên khó tìm việc)", ["だけに", "わりに", "くせに", "ものの"], 0, "〜だけに: chính vì… nên (càng)."],
            ["この 問題 ___、政府は 対策を 発表した。(Về vấn đề này, chính phủ đã công bố biện pháp)", ["に関して", "によって", "に比べて", "に加えて"], 0, "〜に関して: liên quan đến."],
            ["努力した ___、合格できなかった。(Dù đã cố gắng nhưng vẫn không đỗ)", ["ものの", "からには", "おかげで", "せいで"], 0, "〜ものの: mặc dù… nhưng."],
          ],
          sentences: [
            ["少子化に 伴って 労働力が 減少している", "Cùng với giảm tỉ lệ sinh, lực lượng lao động đang suy giảm."],
            ["政府は 環境問題に 対する 対策を 発表した", "Chính phủ đã công bố biện pháp đối với vấn đề môi trường."],
            ["景気の 影響で 就職が 難しく なった", "Do ảnh hưởng của kinh tế, việc tìm việc trở nên khó khăn."],            ["失業率が 上がって いる", "Tỉ lệ thất nghiệp đang tăng."],
            ["物価が 上がり 生活が 苦しく なった", "Giá cả tăng khiến cuộc sống trở nên khó khăn."],
            ["税金を 払うのは 国民の 義務だ", "Nộp thuế là nghĩa vụ của công dân."],
            ["都市と 地方の 格差が 問題に なっている", "Chênh lệch giữa thành thị và nông thôn đang trở thành vấn đề."],
            ["消費を 増やす ために 給付金が 出された", "Để tăng tiêu dùng, chính phủ đã phát tiền hỗ trợ."],
            ["賃金が 上がれば 消費も 増えるだろう", "Nếu tiền lương tăng thì tiêu dùng cũng sẽ tăng."],
            ["景気回復には 時間が かかる", "Việc phục hồi kinh tế cần thời gian."],

          ],
        },
        {
          id: "2", title: "Văn hóa và lối sống",
          words: `伝統|でんとう/dentou|truyền thống
習慣|しゅうかん/shuukan|tập quán
価値観|かちかん/kachikan|giá trị quan
地域|ちいき/chiiki|khu vực
交流|こうりゅう/kouryuu|giao lưu
維持|いじ/iji|duy trì
重視|じゅうし/juushi|coi trọng
異なる|ことなる/kotonaru|khác nhau
多様性|たようせい/tayousei|sự đa dạng
共生|きょうせい/kyousei|cùng chung sống
価値|かち/kachi|giá trị
消費文化|しょうひぶんか/shouhibunka|văn hóa tiêu dùng
伝承|でんしょう/denshou|truyền lại
風習|ふうしゅう/fuushuu|phong tục
郷土|きょうど/kyoudo|quê hương`,
          grammar: [
            ["国 ___ 習慣が 異なる。(Tập quán khác nhau tùy theo quốc gia)", ["によって", "にかけて", "に沿って", "をこめて"], 0, "〜によって: tùy theo."],
            ["日本に 来た ___、日本の 文化を 学びたい。(Một khi đã đến Nhật thì muốn học văn hóa Nhật)", ["からには", "ばかりに", "とたんに", "あげく"], 0, "〜からには: một khi đã… thì."],
            ["伝統を 守る ___、新しい ことにも 挑戦する。(Vừa giữ truyền thống, vừa thử thách cái mới)", ["一方で", "あまり", "かわりに", "とおりに"], 0, "〜一方で: mặt khác, đồng thời."],
            ["この 祭りは 地域の 人々 ___ 守られてきた。(Lễ hội này được người dân địa phương gìn giữ)", ["によって", "に対して", "として", "をはじめ"], 0, "Bị động + によって: bởi (chủ thể hành động)."],
          ],
          sentences: [
            ["国に よって 価値観が 異なる", "Giá trị quan khác nhau tùy theo quốc gia."],
            ["地域の 伝統を 維持する ことが 大切だ", "Việc duy trì truyền thống của địa phương là quan trọng."],
            ["外国人との 交流を 重視している", "Tôi coi trọng giao lưu với người nước ngoài."],            ["多様性を 認める 社会を 目指している", "Chúng ta đang hướng tới một xã hội tôn trọng sự đa dạng."],
            ["外国人との 共生が 進んでいる", "Việc cùng chung sống với người nước ngoài đang tiến triển."],
            ["お金では 測れない 価値が ある", "Có những giá trị không thể đo bằng tiền."],
            ["消費文化が 若者の 生活に 影響を 与えている", "Văn hóa tiêu dùng đang ảnh hưởng đến lối sống của giới trẻ."],
            ["この 祭りの 風習は 何百年も 伝承されてきた", "Phong tục của lễ hội này đã được truyền lại hàng trăm năm."],
            ["郷土の 料理を 守り 伝えたい", "Tôi muốn gìn giữ và truyền lại món ăn quê hương."],

          ],
        },
      ],
    },
    {
      id: "n1", title: "JLPT N1", desc: "Khoảng 10000 từ, 2000 kanji: văn chương, luận thuyết, biểu hiện cao cấp.",
      units: [
        {
          id: "1", title: "Lập luận và học thuật",
          words: `概念|がいねん/gainen|khái niệm
論理|ろんり/ronri|logic
根拠|こんきょ/konkyo|căn cứ
矛盾|むじゅん/mujun|mâu thuẫn
妥当|だとう/datou|thỏa đáng
顕著|けんちょ/kencho|rõ rệt
懸念|けねん/kenen|lo ngại
把握|はあく/haaku|nắm bắt`,
          grammar: [
            ["彼の 発言は 失礼 ___。(Phát ngôn của anh ta vô lễ hết mức)", ["極まりない", "に足りない", "ずくめだ", "めいている"], 0, "〜極まりない: cực kỳ, hết mức."],
            ["専門家 ___、この 問題は 難しい。(Ngay cả chuyên gia cũng thấy vấn đề này khó)", ["といえども", "ならでは", "ともなると", "をもって"], 0, "〜といえども: dù là… đi nữa."],
            ["この 計画は 実現する ___。(Kế hoạch này không thể thực hiện được)", ["べくもない", "までもない", "にかたくない", "に越したことはない"], 0, "〜べくもない: không thể nào."],
            ["彼の 苦労は 想像 ___。(Nỗi vất vả của anh ấy không khó để tưởng tượng)", ["にかたくない", "に堪えない", "を禁じ得ない", "には及ばない"], 0, "〜にかたくない: không khó để…"],
          ],
          sentences: [
            ["その 主張には 論理的な 矛盾が ある", "Lập luận đó có mâu thuẫn về mặt logic."],
            ["現状を 正確に 把握する 必要が ある", "Cần nắm bắt chính xác hiện trạng."],
            ["環境への 影響が 懸念されている", "Ảnh hưởng đến môi trường đang bị lo ngại."],
          ],
        },
        {
          id: "2", title: "Văn chương và cảm xúc tinh tế",
          words: `郷愁|きょうしゅう/kyoushuu|nỗi nhớ quê
儚い|はかない/hakanai|mong manh, phù du
潔い|いさぎよい/isagiyoi|thẳng thắn, dứt khoát
趣|おもむき/omomuki|nét thú vị, phong vị
戸惑う|とまどう/tomadou|bối rối
慈しむ|いつくしむ/itsukushimu|yêu thương, trân trọng
佇む|たたずむ/tatazumu|đứng lặng
滲む|にじむ/nijimu|thấm, nhòe`,
          grammar: [
            ["故郷の 写真を 見て、涙を ___。(Nhìn ảnh quê nhà, tôi không cầm được nước mắt)", ["禁じ得なかった", "余儀なくされた", "免れなかった", "皮切りにした"], 0, "〜を禁じ得ない: không kìm được (cảm xúc)."],
            ["京都 ___ の 趣が ある。(Có phong vị chỉ Kyoto mới có)", ["ならでは", "ながら", "なりに", "なくして"], 0, "〜ならでは: chỉ… mới có."],
            ["努力 ___ 成功は ありえない。(Không có nỗ lực thì không thể thành công)", ["なくして", "ならでは", "であれ", "ともなく"], 0, "〜なくして(は): nếu không có…"],
            ["雨の 中、彼女は 駅に 佇んで いた。「佇む」の 意味は？", ["đứng lặng", "chạy vội", "ngồi khóc", "gọi điện"], 0, "佇む: đứng lặng một chỗ."],
          ],
          sentences: [
            ["桜の 花は 儚い からこそ 美しい", "Hoa anh đào đẹp chính vì nó mong manh."],
            ["故郷を 思うと 郷愁を 禁じ得ない", "Nghĩ về quê nhà, tôi không kìm được nỗi nhớ."],
            ["この 町には 京都ならではの 趣が ある", "Thị trấn này có phong vị chỉ Kyoto mới có."],
          ],
        },
      ],
    },
  ],
};
