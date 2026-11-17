// JLPT expansion (units 3 and 4 per level). Only append at the end.
export default {
  n5: [
    { id: "3", title: "Mua sắm và số đếm",
      words: `店|みせ/mise|cửa hàng
お金|おかね/okane|tiền
いくら|いくら/ikura|bao nhiêu (tiền)
円|えん/en|yên
買う|かう/kau|mua
大きい|おおきい/ookii|to, lớn
小さい|ちいさい/chiisai|nhỏ
新しい|あたらしい/atarashii|mới`,
      grammar: [
        ["この かばんは ___ ですか。(Cái túi này bao nhiêu tiền?)", ["いくら", "どこ", "だれ", "いつ"], 0, "いくら = bao nhiêu tiền."],
        ["それ ___ ください。(Cho tôi cái đó)", ["を", "に", "で", "が"], 0, "N を ください: cho tôi N."],
        ["あの 店は ___ です。(Cửa hàng kia mới)", ["新しい", "新しく", "新しいな", "新しで"], 0, "Tính từ い + です giữ nguyên."],
        ["りんごを 三つ ___。(Tôi mua ba quả táo)", ["買います", "買いて", "買う です", "買いた"], 0, "Thể lịch sự: 買います."],
      ],
      sentences: [["この シャツは いくら ですか", "Cái áo sơ mi này bao nhiêu tiền?"], ["あの 店で くつを 買いました", "Tôi đã mua giày ở cửa hàng kia."], ["これを ください", "Cho tôi cái này."]] },
    { id: "4", title: "Gia đình và nơi ở",
      words: `家族|かぞく/kazoku|gia đình
父|ちち/chichi|bố (mình)
母|はは/haha|mẹ (mình)
兄|あに/ani|anh trai (mình)
妹|いもうと/imouto|em gái
部屋|へや/heya|phòng
近く|ちかく/chikaku|gần đây
犬|いぬ/inu|con chó`,
      grammar: [
        ["部屋に 犬が ___。(Trong phòng có con chó)", ["います", "あります", "です", "します"], 0, "Sinh vật dùng います."],
        ["机の 上に 本が ___。(Trên bàn có quyển sách)", ["あります", "います", "です", "なります"], 0, "Đồ vật dùng あります."],
        ["家族は 四人 ___。(Gia đình tôi có bốn người)", ["です", "います", "あります", "ます"], 0, "Số người + です."],
        ["駅の 近く ___ 住んでいます。(Tôi sống gần nhà ga)", ["に", "で", "を", "へ"], 0, "住む đi với に."],
      ],
      sentences: [["わたしの 家族は 四人 です", "Gia đình tôi có bốn người."], ["へやに 犬が います", "Trong phòng có con chó."], ["母は 先生 です", "Mẹ tôi là giáo viên."]] },
  ],
  n4: [
    { id: "3", title: "Sở thích và kế hoạch",
      words: `趣味|しゅみ/shumi|sở thích
旅行|りょこう/ryokou|du lịch
写真|しゃしん/shashin|ảnh
音楽|おんがく/ongaku|âm nhạc
予定|よてい/yotei|dự định
週末|しゅうまつ/shuumatsu|cuối tuần
集める|あつめる/atsumeru|sưu tầm
楽しい|たのしい/tanoshii|vui`,
      grammar: [
        ["わたしの 趣味は 写真を 撮る ___ です。(Sở thích của tôi là chụp ảnh)", ["こと", "の が", "もの", "ため"], 0, "V thể từ điển + こと: danh từ hóa."],
        ["週末、京都へ 行く ___ です。(Cuối tuần tôi định đi Kyoto)", ["つもり", "はず", "そう", "ところ"], 0, "〜つもりです: định làm."],
        ["来年 日本へ 行こう ___ 思っています。(Tôi đang nghĩ năm sau sẽ đi Nhật)", ["と", "を", "が", "に"], 0, "Thể ý chí + と思う: định."],
        ["音楽を 聞き ___ 勉強します。(Vừa nghe nhạc vừa học)", ["ながら", "たり", "てから", "ので"], 0, "〜ながら: vừa… vừa…"],
      ],
      sentences: [["しゅみは 切手を 集める ことです", "Sở thích của tôi là sưu tầm tem."], ["週末は 旅行する つもりです", "Cuối tuần tôi định đi du lịch."], ["音楽を 聞きながら 勉強します", "Tôi vừa nghe nhạc vừa học."]] },
    { id: "4", title: "Cho nhận và nhờ vả",
      words: `プレゼント|ぷれぜんと/purezento|quà tặng
貸す|かす/kasu|cho mượn
借りる|かりる/kariru|mượn
手伝う|てつだう/tetsudau|giúp
教える|おしえる/oshieru|dạy, chỉ
もらう|もらう/morau|nhận
あげる|あげる/ageru|cho, tặng
くれる|くれる/kureru|(ai đó) cho mình`,
      grammar: [
        ["友達が わたしに 本を ___。(Bạn đã cho tôi quyển sách)", ["くれました", "あげました", "もらいました", "やりました"], 0, "Người khác cho mình: くれる."],
        ["わたしは 先生に 辞書を ___。(Tôi được thầy cho từ điển)", ["もらいました", "くれました", "あげました", "させました"], 0, "Mình nhận từ người khác: もらう (に)."],
        ["ペンを 貸して ___ ませんか。(Bạn cho tôi mượn bút được không?)", ["くれ", "あげ", "もらい", "やり"], 0, "〜てくれませんか: nhờ ai làm cho mình."],
        ["母に 料理を 教えて ___。(Tôi được mẹ dạy nấu ăn)", ["もらいました", "くれました", "あげました", "いました"], 0, "〜てもらう: được ai làm cho."],
      ],
      sentences: [["友達が プレゼントを くれました", "Bạn đã tặng quà cho tôi."], ["ちょっと 手伝って くれませんか", "Bạn giúp tôi một chút được không?"], ["先生に 日本語を 教えて もらいました", "Tôi được thầy dạy tiếng Nhật."]] },
  ],
  n3: [
    { id: "3", title: "Tin tức và sự kiện",
      words: `事故|じこ/jiko|tai nạn
地震|じしん/jishin|động đất
ニュース|にゅーす/nyuusu|tin tức
原因|げんいん/genin|nguyên nhân
被害|ひがい/higai|thiệt hại
発生|はっせい/hassei|phát sinh
調査|ちょうさ/chousa|điều tra
発表|はっぴょう/happyou|công bố`,
      grammar: [
        ["ニュース ___ よると、事故が あったそうだ。(Theo tin tức, nghe nói có tai nạn)", ["に", "で", "を", "が"], 0, "〜によると: theo…"],
        ["地震の ___、電車が 止まった。(Do động đất, tàu điện đã dừng)", ["ため", "うち", "ところ", "わけ"], 0, "N の ため: do, vì."],
        ["原因は まだ 分かって ___。(Nguyên nhân vẫn chưa rõ)", ["いない", "いる", "ある", "おく"], 0, "まだ〜ていない: vẫn chưa."],
        ["雨が 降り ___ だ。(Trông như sắp mưa)", ["そう", "よう", "らしい", "はず"], 0, "Vます + そうだ: trông như sắp."],
      ],
      sentences: [["ニュースに よると 事故が あった そうです", "Theo tin tức thì nghe nói có tai nạn."], ["地震の ため 電車が 止まりました", "Do động đất nên tàu đã dừng."], ["原因は まだ 分かって いません", "Nguyên nhân vẫn chưa được làm rõ."]] },
    { id: "4", title: "Kính ngữ cơ bản",
      words: `いらっしゃる|いらっしゃる/irassharu|đi, đến, ở (kính ngữ)
召し上がる|めしあがる/meshiagaru|ăn, uống (kính ngữ)
おっしゃる|おっしゃる/ossharu|nói (kính ngữ)
ご覧になる|ごらんになる/goranninaru|xem (kính ngữ)
参る|まいる/mairu|đi, đến (khiêm nhường)
申す|もうす/mousu|nói (khiêm nhường)
いただく|いただく/itadaku|nhận, ăn (khiêm nhường)
拝見する|はいけんする/haikensuru|xem (khiêm nhường)`,
      grammar: [
        ["社長は 何時に ___ か。(Giám đốc mấy giờ đến ạ?)", ["いらっしゃいます", "参ります", "申します", "いただきます"], 0, "Kính ngữ cho hành động của cấp trên."],
        ["わたしは 田中と ___。(Tôi tên là Tanaka)", ["申します", "おっしゃいます", "いらっしゃいます", "召し上がります"], 0, "Khiêm nhường ngữ khi tự giới thiệu."],
        ["先生が お ___ に なりました。(Thầy đã về)", ["帰り", "帰る", "帰って", "帰った"], 0, "お + Vます + になる: kính ngữ."],
        ["資料を お ___ します。(Tôi xin gửi tài liệu)", ["送り", "送る", "送って", "送った"], 0, "お + Vます + する: khiêm nhường."],
      ],
      sentences: [["先生は 何を 召し上がりますか", "Thầy dùng món gì ạ?"], ["わたしは 山田と 申します", "Tôi tên là Yamada."], ["資料を お送り します", "Tôi xin gửi tài liệu."]] },
  ],
  n2: [
    { id: "3", title: "Công nghệ và truyền thông",
      words: `情報|じょうほう/jouhou|thông tin
技術|ぎじゅつ/gijutsu|kỹ thuật
普及|ふきゅう/fukyuu|phổ cập
利用|りよう/riyou|sử dụng
個人|こじん/kojin|cá nhân
保護|ほご/hogo|bảo vệ
便利|べんり/benri|tiện lợi
依存|いぞん/izon|phụ thuộc`,
      grammar: [
        ["スマホの 普及 ___、生活が 便利に なった。(Nhờ smartphone phổ cập, cuộc sống tiện hơn)", ["によって", "にとって", "について", "に対して"], 0, "〜によって: do, nhờ."],
        ["便利な ___、依存の 問題も ある。(Tiện lợi nhưng mặt khác cũng có vấn đề phụ thuộc)", ["反面", "ばかりか", "うえに", "以上"], 0, "〜反面: mặt khác, trái lại."],
        ["個人情報は 守られる ___ だ。(Thông tin cá nhân lẽ ra phải được bảo vệ)", ["べき", "わけ", "もの", "こと"], 0, "〜べきだ: nên, phải."],
        ["技術が 進む ___、新しい 問題も 生まれる。(Kỹ thuật càng tiến bộ, vấn đề mới càng sinh ra)", ["につれて", "に対して", "に関して", "によらず"], 0, "〜につれて: càng… càng…"],
      ],
      sentences: [["技術の 進歩に つれて 生活が 変わった", "Cùng với tiến bộ kỹ thuật, cuộc sống đã thay đổi."], ["個人情報は 保護される べきだ", "Thông tin cá nhân cần được bảo vệ."], ["便利な 反面 問題も ある", "Tiện lợi nhưng mặt khác cũng có vấn đề."]] },
    { id: "4", title: "Công việc và ý kiến",
      words: `提案|ていあん/teian|đề xuất
検討|けんとう/kentou|xem xét
意見|いけん/iken|ý kiến
賛成|さんせい/sansei|tán thành
反対|はんたい/hantai|phản đối
効率|こうりつ/kouritsu|hiệu suất
改善|かいぜん/kaizen|cải thiện
結果|けっか/kekka|kết quả`,
      grammar: [
        ["その 提案 ___ 検討します。(Sẽ xem xét đề xuất đó)", ["について", "にとって", "によって", "に伴って"], 0, "〜について: về."],
        ["この 案には 賛成 ___ 反対だ。(Tôi không những không tán thành mà còn phản đối)", ["どころか", "ばかりに", "からこそ", "ものなら"], 0, "〜どころか: không những không… mà còn."],
        ["結果 ___、計画を 変える。(Tùy kết quả mà thay đổi kế hoạch)", ["次第で", "ついでに", "とおり", "うえで"], 0, "〜次第で: tùy vào."],
        ["話し合った ___ で、決めましょう。(Hãy quyết định sau khi bàn bạc)", ["うえ", "ところ", "あと", "まま"], 0, "〜たうえで: sau khi (làm kỹ)."],
      ],
      sentences: [["その 提案に ついて 検討します", "Chúng tôi sẽ xem xét đề xuất đó."], ["結果 次第で 計画を 変えます", "Tùy kết quả mà chúng tôi thay đổi kế hoạch."], ["仕事の 効率を 改善したい", "Tôi muốn cải thiện hiệu suất công việc."]] },
  ],
  n1: [
    { id: "3", title: "Kinh tế và chính sách",
      words: `財政|ざいせい/zaisei|tài chính (nhà nước)
赤字|あかじ/akaji|thâm hụt
緩和|かんわ/kanwa|nới lỏng
抑制|よくせい/yokusei|kiềm chế
是正|ぜせい/zesei|sửa chữa, điều chỉnh
促進|そくしん/sokushin|thúc đẩy
停滞|ていたい/teitai|trì trệ
打開|だかい/dakai|phá vỡ (bế tắc)`,
      grammar: [
        ["景気の 停滞を ___、新たな 政策が 打ち出された。(Nhân dịp kinh tế trì trệ, chính sách mới được đưa ra)", ["受けて", "めぐって", "もって", "よそに"], 0, "〜を受けて: trước tình hình…, đáp lại."],
        ["反対の 声を ___、法案は 可決された。(Bất chấp tiếng phản đối, dự luật được thông qua)", ["よそに", "皮切りに", "もとに", "限りに"], 0, "〜をよそに: bất chấp, phớt lờ."],
        ["財政問題を ___ 議論が 続いている。(Tranh luận xoay quanh vấn đề tài chính vẫn tiếp diễn)", ["めぐる", "ふまえた", "かねた", "おいた"], 0, "〜をめぐる: xoay quanh."],
        ["本日 ___ 受付を 終了します。(Kết thúc tiếp nhận vào hôm nay)", ["をもって", "にあって", "とあって", "ときたら"], 0, "〜をもって: vào thời điểm (trang trọng)."],
      ],
      sentences: [["政府は 景気の 停滞を 打開しようと している", "Chính phủ đang cố phá vỡ tình trạng trì trệ kinh tế."], ["財政赤字の 是正が 求められている", "Việc điều chỉnh thâm hụt tài chính đang được yêu cầu."], ["反対を よそに 法案が 可決された", "Bất chấp phản đối, dự luật đã được thông qua."]] },
    { id: "4", title: "Biểu hiện trang trọng",
      words: `恐縮|きょうしゅく/kyoushuku|ngại ngùng, xin lỗi (lịch sự)
所存|しょぞん/shozon|ý định (khiêm nhường)
拝察|はいさつ/haisatsu|kính đoán
ご高配|ごこうはい/gokouhai|sự quan tâm (kính)
賜る|たまわる/tamawaru|được ban cho
存じる|ぞんじる/zonjiru|biết, nghĩ (khiêm nhường)
何卒|なにとぞ/nanitozo|kính mong
ご容赦|ごようしゃ/goyousha|sự thứ lỗi`,
      grammar: [
        ["今後とも 努力する ___ でございます。(Chúng tôi dự định sẽ tiếp tục nỗ lực)", ["所存", "所為", "次第", "始末"], 0, "〜所存です: ý định (khiêm nhường, trang trọng)."],
        ["ご迷惑を おかけし、誠に ___ に存じます。(Thành thật xin lỗi vì đã làm phiền)", ["恐縮", "拝察", "賜物", "所存"], 0, "恐縮に存じます: thấy rất ngại, xin lỗi."],
        ["何卒 ご容赦 ___ ますよう お願い申し上げます。(Kính mong quý vị thứ lỗi)", ["ください", "いたし", "申し", "参り"], 0, "〜くださいますよう: kính mong."],
        ["平素より 格別の ご高配を ___、厚く御礼申し上げます。(Xin cảm ơn sự quan tâm đặc biệt)", ["賜り", "差し上げ", "申し上げ", "伺い"], 0, "賜る: được ban cho (kính ngữ cao)."],
      ],
      sentences: [["今後とも 努力する 所存で ございます", "Chúng tôi xin tiếp tục nỗ lực."], ["何卒 よろしく お願い 申し上げます", "Kính mong quý vị giúp đỡ."], ["ご迷惑を おかけして 恐縮です", "Rất xin lỗi vì đã làm phiền."]] },
  ],
};
