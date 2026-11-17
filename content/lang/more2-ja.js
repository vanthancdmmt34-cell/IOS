// Batch 4 expansion — JLPT (units x3, x4 per level).
export default {
  n5: [
    { id: "x3", title: "Cơ thể và sức khỏe", titleEn: "Body and health",
      words: `頭|あたま/atama|đầu
目|め/me|mắt
手|て/te|tay
足|あし/ashi|chân
痛い|いたい/itai|đau
病気|びょうき/byouki|bệnh
元気|げんき/genki|khỏe
医者|いしゃ/isha|bác sĩ`,
      grammar: [
        ["頭 ___ 痛いです。(Tôi đau đầu)", ["が", "を", "に", "で"], 0, "N が 痛い: N đau.", "N が 痛い: N hurts."],
        ["お元気 ___ か。(Bạn khỏe không?)", ["です", "ます", "でした", "だ"], 0, "お元気ですか: hỏi thăm sức khỏe.", "お元気ですか: How are you?"],
        ["病気 ___ 、学校を 休みました。(Vì ốm nên tôi nghỉ học)", ["で", "に", "を", "が"], 0, "N で: vì N (nguyên nhân).", "N で: because of N."],
        ["医者に ___ ください。(Hãy đi khám bác sĩ)", ["行って", "行く", "行き", "行った"], 0, "〜てください: hãy làm.", "〜てください: please do."],
      ],
      sentences: [["頭が 痛い です", "Tôi bị đau đầu."], ["病気で 学校を 休みました", "Vì ốm nên tôi nghỉ học."], ["お元気 ですか", "Bạn có khỏe không?"]] },
    { id: "x4", title: "Thời tiết và mùa", titleEn: "Weather and seasons",
      words: `天気|てんき/tenki|thời tiết
春|はる/haru|mùa xuân
夏|なつ/natsu|mùa hè
冬|ふゆ/fuyu|mùa đông
暑い|あつい/atsui|nóng
寒い|さむい/samui|lạnh
雨|あめ/ame|mưa
雪|ゆき/yuki|tuyết`,
      grammar: [
        ["今日は いい 天気 ___ ね。(Hôm nay trời đẹp nhỉ)", ["です", "ます", "でした", "だった"], 0, "N + ですね: …nhỉ.", "N + ですね: isn't it."],
        ["夏は 冬 ___ 暑いです。(Mùa hè nóng hơn mùa đông)", ["より", "ほど", "まで", "から"], 0, "A は B より + tính từ: A hơn B.", "A は B より + adjective: A is more… than B."],
        ["きのうは 寒 ___ 。(Hôm qua lạnh)", ["かったです", "いでした", "いです", "くないでした"], 0, "Quá khứ tính từ い: 〜かったです.", "Past of i-adjective: 〜かったです."],
        ["雪が ___ います。(Tuyết đang rơi)", ["降って", "降る", "降り", "降った"], 0, "〜ている: đang diễn ra.", "〜ている: is happening."],
      ],
      sentences: [["今日は いい 天気 ですね", "Hôm nay trời đẹp nhỉ."], ["夏は 冬より 暑い です", "Mùa hè nóng hơn mùa đông."], ["雪が 降って います", "Tuyết đang rơi."]] },
  ],
  n4: [
    { id: "x3", title: "Công việc làm thêm", titleEn: "Part-time jobs",
      words: `アルバイト|あるばいと/arubaito|việc làm thêm
店長|てんちょう/tenchou|cửa hàng trưởng
時給|じきゅう/jikyuu|lương theo giờ
働く|はたらく/hataraku|làm việc
休み|やすみ/yasumi|ngày nghỉ
遅刻|ちこく/chikoku|đến muộn
連絡|れんらく/renraku|liên lạc
頑張る|がんばる/ganbaru|cố gắng`,
      grammar: [
        ["コンビニで アルバイトを して ___ 。(Tôi đang làm thêm ở cửa hàng tiện lợi)", ["います", "あります", "おきます", "みます"], 0, "〜ている: thói quen/trạng thái hiện tại.", "〜ている: ongoing situation."],
        ["遅刻する ___ 、店長に 連絡して ください。(Nếu đến muộn thì hãy liên lạc với cửa hàng trưởng)", ["なら", "のに", "ので", "けど"], 0, "〜なら: nếu (giả định).", "〜なら: if (that's the case)."],
        ["明日、休ませて ___ か。(Cho tôi nghỉ ngày mai được không?)", ["もらえません", "あげません", "くれます", "いただきます"], 0, "〜させてもらえませんか: xin phép cho tôi được làm…", "〜させてもらえませんか: may I please…?"],
        ["日本語が 上手に なる ___ 、頑張ります。(Tôi sẽ cố để giỏi tiếng Nhật)", ["ように", "ために", "そうに", "みたいに"], 0, "〜ように: để (đạt trạng thái).", "〜ように: so that (reach a state)."],
      ],
      sentences: [["コンビニで アルバイトを して います", "Tôi đang làm thêm ở cửa hàng tiện lợi."], ["遅刻するなら 連絡して ください", "Nếu đến muộn thì hãy liên lạc."], ["日本語が 上手に なるように 頑張ります", "Tôi sẽ cố gắng để giỏi tiếng Nhật."]] },
    { id: "x4", title: "Lễ hội và quà tặng", titleEn: "Festivals and gifts",
      words: `お祭り|おまつり/omatsuri|lễ hội
花火|はなび/hanabi|pháo hoa
浴衣|ゆかた/yukata|áo yukata
お正月|おしょうがつ/oshougatsu|Tết
お土産|おみやげ/omiyage|quà lưu niệm
誕生日|たんじょうび/tanjoubi|sinh nhật
招待|しょうたい/shoutai|mời
楽しみ|たのしみ/tanoshimi|háo hức mong chờ`,
      grammar: [
        ["お祭りに 行く のが 楽しみ ___ 。(Tôi háo hức được đi lễ hội)", ["です", "ます", "でした", "ました"], 0, "〜のが楽しみです: mong chờ…", "〜のが楽しみです: look forward to…"],
        ["友達に お土産を ___ 。(Tôi tặng quà cho bạn)", ["あげました", "くれました", "もらいました", "いただきました"], 0, "Mình cho người khác: あげる.", "I give to someone: あげる."],
        ["誕生日パーティーに 招待 ___ 。(Tôi được mời dự tiệc sinh nhật)", ["されました", "しました", "させました", "します"], 0, "Bị động: 招待される.", "Passive: 招待される."],
        ["花火を 見 ___ ことが ありますか。(Bạn đã từng xem pháo hoa chưa?)", ["た", "る", "て", "ない"], 0, "〜たことがある: đã từng.", "〜たことがある: have ever."],
      ],
      sentences: [["お祭りに 行くのが 楽しみ です", "Tôi háo hức được đi lễ hội."], ["誕生日パーティーに 招待されました", "Tôi được mời dự tiệc sinh nhật."], ["友達に お土産を あげました", "Tôi đã tặng quà cho bạn."]] },
  ],
  n3: [
    { id: "x3", title: "Nhà ở và hàng xóm", titleEn: "Housing and neighbours",
      words: `家賃|やちん/yachin|tiền thuê nhà
引っ越し|ひっこし/hikkoshi|chuyển nhà
近所|きんじょ/kinjo|hàng xóm, khu lân cận
騒音|そうおん/souon|tiếng ồn
ゴミ|ごみ/gomi|rác
分別|ぶんべつ/bunbetsu|phân loại
迷惑|めいわく/meiwaku|phiền hà
挨拶|あいさつ/aisatsu|chào hỏi`,
      grammar: [
        ["ゴミは 分別して 出す ___ なっています。(Quy định là rác phải phân loại rồi mới đổ)", ["ことに", "ように", "ために", "はずに"], 0, "〜ことになっている: quy định là…", "〜ことになっている: it is the rule that…"],
        ["夜 遅く 騒ぐ と、近所の 人に 迷惑 ___ 。(Ồn ào lúc khuya sẽ làm phiền hàng xóm)", ["を かける", "に なる", "が する", "で ある"], 0, "迷惑をかける: gây phiền.", "迷惑をかける: cause trouble."],
        ["引っ越した ___ 、近所に 挨拶に 行った。(Ngay sau khi chuyển nhà tôi đi chào hàng xóm)", ["ばかりで", "とたん", "ところ", "うちに"], 0, "〜たばかり: vừa mới.", "〜たばかり: have just."],
        ["家賃が 高い ___ 、駅から 遠い。(Tiền nhà đã đắt, lại còn xa ga)", ["うえに", "わりに", "ものの", "せいで"], 0, "〜うえに: không những… mà còn.", "〜うえに: on top of…"],
      ],
      sentences: [["ゴミは 分別して 出す ことに なって います", "Quy định là rác phải phân loại rồi mới đổ."], ["引っ越した ばかりで 近所に 挨拶に 行った", "Vừa chuyển nhà xong tôi đi chào hàng xóm."], ["家賃が 高い うえに 駅から 遠い", "Tiền nhà đã đắt lại còn xa ga."]] },
    { id: "x4", title: "Ẩm thực Nhật Bản", titleEn: "Japanese cuisine",
      words: `和食|わしょく/washoku|ẩm thực Nhật
味噌汁|みそしる/misoshiru|canh miso
刺身|さしみ/sashimi|sashimi
新鮮|しんせん/shinsen|tươi
材料|ざいりょう/zairyou|nguyên liệu
栄養|えいよう/eiyou|dinh dưỡng
季節|きせつ/kisetsu|mùa
伝統的|でんとうてき/dentouteki|mang tính truyền thống`,
      grammar: [
        ["和食は 季節の 材料を 大切に する ___ 。(Ẩm thực Nhật coi trọng nguyên liệu theo mùa)", ["そうだ", "ことだ", "ものだ", "はずだ"], 0, "Thể thường + そうだ: nghe nói.", "Plain form + そうだ: I hear that."],
        ["刺身は 新鮮 ___ ないと おいしくない。(Sashimi không tươi thì không ngon)", ["で", "に", "な", "の"], 0, "な-adj + でないと: nếu không…", "na-adjective + でないと: unless…"],
        ["味噌汁は 栄養が ある ___ 、毎日 飲む。(Vì canh miso bổ nên ngày nào tôi cũng uống)", ["ので", "のに", "ほど", "まま"], 0, "〜ので: vì.", "〜ので: because."],
        ["日本に 来て ___ 、和食が 好きに なった。(Từ khi đến Nhật tôi thích món Nhật)", ["から", "ので", "まで", "ほど"], 0, "〜てから: từ khi, sau khi.", "〜てから: since, after."],
      ],
      sentences: [["和食は 季節の 材料を 大切に する", "Ẩm thực Nhật coi trọng nguyên liệu theo mùa."], ["日本に 来てから 和食が 好きに なった", "Từ khi đến Nhật tôi đã thích món Nhật."], ["刺身は 新鮮で ないと おいしくない", "Sashimi không tươi thì không ngon."]] },
  ],
  n2: [
    { id: "x3", title: "Học tập và nghiên cứu", titleEn: "Study and research",
      words: `論文|ろんぶん/ronbun|luận văn
研究|けんきゅう/kenkyuu|nghiên cứu
資格|しかく/shikaku|chứng chỉ
専門|せんもん/senmon|chuyên ngành
留学|りゅうがく/ryuugaku|du học
提出|ていしゅつ/teishutsu|nộp
指導|しどう/shidou|hướng dẫn
分析|ぶんせき/bunseki|phân tích`,
      grammar: [
        ["論文を 書く ___ 、データを 分析した。(Để viết luận văn tôi đã phân tích dữ liệu)", ["にあたって", "について", "にしては", "にかけて"], 0, "〜にあたって: khi tiến hành…", "〜にあたって: when undertaking…"],
        ["先生の 指導 ___ 、研究が 進んだ。(Nhờ sự hướng dẫn của thầy, nghiên cứu tiến triển)", ["のもとで", "のせいで", "のくせに", "のわりに"], 0, "〜のもとで: dưới sự…", "〜のもとで: under (guidance)."],
        ["締め切り ___ に 提出しなければならない。(Phải nộp trước hạn chót)", ["まで", "までに", "から", "ほど"], 0, "〜までに: trước (hạn).", "〜までに: by (deadline)."],
        ["資格を 取った ___ 、仕事が 見つからない。(Dù đã có chứng chỉ vẫn không tìm được việc)", ["ところで", "からこそ", "ばかりか", "ように"], 0, "〜たところで: dù có… cũng.", "〜たところで: even if…"],
      ],
      sentences: [["論文を 書くに あたって データを 分析した", "Khi viết luận văn tôi đã phân tích dữ liệu."], ["締め切りまでに 提出しなければ ならない", "Phải nộp trước hạn chót."], ["先生の 指導の もとで 研究が 進んだ", "Dưới sự hướng dẫn của thầy, nghiên cứu đã tiến triển."]] },
    { id: "x4", title: "Mua sắm và tiêu dùng", titleEn: "Shopping and consumption",
      words: `消費|しょうひ/shouhi|tiêu dùng
節約|せつやく/setsuyaku|tiết kiệm
値上げ|ねあげ/neage|tăng giá
品質|ひんしつ/hinshitsu|chất lượng
購入|こうにゅう/kounyuu|mua
比較|ひかく/hikaku|so sánh
評判|ひょうばん/hyouban|tiếng tăm, đánh giá
衝動買い|しょうどうがい/shoudougai|mua bốc đồng`,
      grammar: [
        ["値上げ ___ 、消費が 減っている。(Do tăng giá, tiêu dùng đang giảm)", ["のせいで", "のおかげで", "のために", "のかわりに"], 0, "〜せいで: tại vì (kết quả xấu).", "〜せいで: because of (bad result)."],
        ["品質 ___ 、値段が 安い。(So với chất lượng thì giá rẻ)", ["のわりに", "に比べて", "をこめて", "に沿って"], 0, "〜わりに: so với… thì (ngoài dự đoán).", "〜わりに: considering…"],
        ["衝動買いを しない ___ 、リストを 作る。(Để không mua bốc đồng, tôi lập danh sách)", ["ように", "ために", "そうに", "うちに"], 0, "Phủ định + ように: để không…", "Negative + ように: so as not to…"],
        ["評判が いい ___ 、買う 価値が ある。(Đánh giá tốt nên đáng mua)", ["だけあって", "にしては", "くせに", "どころか"], 0, "〜だけあって: đúng là… nên…", "〜だけあって: as expected of…"],
      ],
      sentences: [["値上げの せいで 消費が 減っている", "Do tăng giá nên tiêu dùng đang giảm."], ["品質の わりに 値段が 安い", "So với chất lượng thì giá rẻ."], ["衝動買いを しないように リストを 作る", "Tôi lập danh sách để không mua bốc đồng."]] },
  ],
  n1: [
    { id: "x3", title: "Triết học và tư tưởng", titleEn: "Philosophy and thought",
      words: `哲学|てつがく/tetsugaku|triết học
本質|ほんしつ/honshitsu|bản chất
存在|そんざい/sonzai|tồn tại
価値|かち/kachi|giá trị
倫理|りんり/rinri|luân lý
自由|じゆう/jiyuu|tự do
思索|しさく/shisaku|suy tư
普遍的|ふへんてき/fuhenteki|phổ quát`,
      grammar: [
        ["人間の 本質 ___ 、多くの 哲学者が 論じてきた。(Về bản chất con người, nhiều triết gia đã bàn luận)", ["をめぐって", "をもって", "をよそに", "を限りに"], 0, "〜をめぐって: xoay quanh.", "〜をめぐって: concerning."],
        ["自由 ___ 、責任が 伴う。(Có tự do thì kèm trách nhiệm)", ["には", "とは", "では", "へは"], 0, "N には: đối với N thì…", "N には: for / with N…"],
        ["価値観は 時代 ___ 変わる。(Giá trị quan thay đổi theo thời đại)", ["とともに", "ながらも", "をおいて", "にひきかえ"], 0, "〜とともに: cùng với.", "〜とともに: along with."],
        ["倫理的に 許される ___ 。(Không thể được chấp nhận về mặt đạo đức)", ["ものではない", "ことはない", "わけがある", "べきだ"], 0, "〜ものではない: không nên, không thể (đạo lý).", "〜ものではない: one should not."],
      ],
      sentences: [["人間の 本質を めぐって 議論が 続く", "Tranh luận về bản chất con người vẫn tiếp diễn."], ["価値観は 時代と ともに 変わる", "Giá trị quan thay đổi cùng thời đại."], ["自由には 責任が 伴う", "Tự do luôn đi kèm trách nhiệm."]] },
    { id: "x4", title: "Truyền thống và hiện đại", titleEn: "Tradition and modernity",
      words: `伝統工芸|でんとうこうげい/dentoukougei|nghề thủ công truyền thống
継承|けいしょう/keishou|kế thừa
後継者|こうけいしゃ/koukeisha|người kế nghiệp
衰退|すいたい/suitai|suy thoái
融合|ゆうごう/yuugou|dung hợp
革新|かくしん/kakushin|đổi mới
職人|しょくにん/shokunin|thợ thủ công
廃れる|すたれる/sutareru|mai một`,
      grammar: [
        ["後継者が いない ___ 、伝統工芸は 廃れつつある。(Vì không có người kế nghiệp, nghề truyền thống đang mai một)", ["ばかりに", "からして", "ともなると", "とあって"], 0, "〜ばかりに: chỉ vì… (kết quả xấu).", "〜ばかりに: just because… (bad result)."],
        ["伝統と 革新の 融合 ___ 、新しい 文化が 生まれた。(Từ sự dung hợp truyền thống và đổi mới, văn hóa mới ra đời)", ["によって", "について", "に対して", "にかけて"], 0, "〜によって: nhờ, bởi.", "〜によって: through, by."],
        ["職人の 技術は 一朝一夕に 身につく ___ 。(Kỹ thuật thợ thủ công không thể học trong một sớm một chiều)", ["ものではない", "わけだ", "ことにする", "はずだ"], 0, "〜ものではない: không phải là việc có thể…", "〜ものではない: is not something that…"],
        ["衰退 ___ 一方の 産業を 守りたい。(Muốn bảo vệ ngành nghề đang ngày càng suy thoái)", ["する", "した", "して", "しよう"], 0, "V thể từ điển + 一方: ngày càng…", "Dictionary form + 一方: keeps…"],
      ],
      sentences: [["後継者が いない ばかりに 伝統工芸が 廃れつつある", "Chỉ vì không có người kế nghiệp mà nghề truyền thống đang mai một."], ["伝統と 革新の 融合に よって 新しい 文化が 生まれた", "Từ sự dung hợp truyền thống và đổi mới, một nền văn hóa mới đã ra đời."], ["職人の 技術は 一朝一夕に 身に つく ものではない", "Kỹ thuật của người thợ không thể học trong một sớm một chiều."]] },
  ],
};
