// Batch 3 expansion — JLPT (2 units/level).
export default {
  n5: [
    { id: "x1", title: "Màu sắc và đồ vật", titleEn: "Colours and objects",
      words: `赤い|あかい/akai|màu đỏ
白い|しろい/shiroi|màu trắng
本|ほん/hon|sách
かばん|かばん/kaban|cái cặp, túi
時計|とけい/tokei|đồng hồ
机|つくえ/tsukue|cái bàn
傘|かさ/kasa|cái ô
新しい|あたらしい/atarashii|mới`,
      grammar: [
        ["これは ___ の 本ですか。(Đây là sách của ai?)", ["だれ", "なに", "どこ", "いつ"], 0, "だれの = của ai.", "だれの = whose."],
        ["その かばんは ___ です。(Cái túi đó màu đỏ)", ["赤い", "赤", "赤く", "赤くて"], 0, "Tính từ い + です.", "i-adjective + です."],
        ["机の 上に 時計が ___ 。(Trên bàn có đồng hồ)", ["あります", "います", "です", "あるです"], 0, "Đồ vật dùng あります.", "Objects use あります."],
        ["あの 傘は ___ ですか。(Cái ô kia bao nhiêu tiền?)", ["いくら", "いくつ", "なん", "どれ"], 0, "いくら hỏi giá.", "いくら asks the price."],
      ],
      sentences: [["これは わたしの 本 です", "Đây là sách của tôi."], ["机の 上に 時計が あります", "Trên bàn có cái đồng hồ."], ["あの 赤い かばんは いくら ですか", "Cái túi đỏ kia bao nhiêu tiền?"]] },
    { id: "x2", title: "Cuối tuần và sở thích", titleEn: "Weekends and hobbies",
      words: `週末|しゅうまつ/shuumatsu|cuối tuần
映画|えいが/eiga|phim
音楽|おんがく/ongaku|âm nhạc
聞く|きく/kiku|nghe
見る|みる/miru|xem
好き|すき/suki|thích
公園|こうえん/kouen|công viên
散歩|さんぽ/sanpo|đi dạo`,
      grammar: [
        ["わたしは 音楽 ___ 好きです。(Tôi thích âm nhạc)", ["が", "を", "に", "で"], 0, "N が 好きです: thích N.", "N が 好きです: I like N."],
        ["週末、公園 ___ 散歩します。(Cuối tuần tôi đi dạo ở công viên)", ["で", "に", "を", "へ"], 0, "で chỉ nơi diễn ra hành động.", "で marks where an action happens."],
        ["いっしょに 映画を 見 ___ 。(Cùng xem phim nhé)", ["ましょう", "ます", "ません", "ました"], 0, "〜ましょう: rủ cùng làm.", "〜ましょう: let's do."],
        ["映画を 見 ___ か。(Bạn có muốn xem phim không?)", ["ません", "ましょう", "ます", "でした"], 0, "〜ませんか: mời, rủ lịch sự.", "〜ませんか: polite invitation."],
      ],
      sentences: [["わたしは 音楽が 好き です", "Tôi thích âm nhạc."], ["週末 公園で 散歩します", "Cuối tuần tôi đi dạo ở công viên."], ["いっしょに 映画を 見ませんか", "Cùng đi xem phim nhé?"]] },
  ],
  n4: [
    { id: "x1", title: "Nấu ăn và nhà hàng", titleEn: "Cooking and restaurants",
      words: `料理|りょうり/ryouri|món ăn, nấu ăn
作る|つくる/tsukuru|làm, nấu
味|あじ/aji|vị
甘い|あまい/amai|ngọt
辛い|からい/karai|cay
予約|よやく/yoyaku|đặt trước
注文|ちゅうもん/chuumon|gọi món
野菜|やさい/yasai|rau`,
      grammar: [
        ["母は 料理が 上手 ___ 。(Mẹ tôi nấu ăn giỏi)", ["です", "ます", "でした", "あります"], 0, "N が 上手です: giỏi N.", "N が 上手です: good at N."],
        ["この カレーは 辛 ___ 食べられません。(Món cà ri này cay quá không ăn được)", ["すぎて", "くて", "そう", "ので"], 0, "〜すぎる: quá…", "〜すぎる: too…"],
        ["レストランを 予約して ___ 。(Tôi đặt nhà hàng sẵn rồi)", ["おきました", "いました", "ありました", "みました"], 0, "〜ておく: làm sẵn.", "〜ておく: do in advance."],
        ["野菜を 食べた ___ がいいですよ。(Nên ăn rau)", ["ほう", "こと", "もの", "ため"], 0, "〜たほうがいい: nên.", "〜たほうがいい: you should."],
      ],
      sentences: [["母は 料理が 上手 です", "Mẹ tôi nấu ăn giỏi."], ["レストランを 予約して おきました", "Tôi đã đặt nhà hàng sẵn."], ["この カレーは 辛すぎます", "Món cà ri này cay quá."]] },
    { id: "x2", title: "Tàu xe và chỉ đường", titleEn: "Transport and directions",
      words: `乗る|のる/noru|lên (xe)
降りる|おりる/oriru|xuống (xe)
乗り換える|のりかえる/norikaeru|đổi tàu
まっすぐ|まっすぐ/massugu|thẳng
曲がる|まがる/magaru|rẽ
信号|しんごう/shingou|đèn giao thông
角|かど/kado|góc phố
遅れる|おくれる/okureru|trễ`,
      grammar: [
        ["次の 駅で 電車 ___ 降ります。(Xuống tàu ở ga tới)", ["を", "に", "で", "が"], 0, "降りる đi với を (rời khỏi).", "降りる takes を (get off)."],
        ["バス ___ 乗ります。(Lên xe buýt)", ["に", "を", "で", "へ"], 0, "乗る đi với に.", "乗る takes に."],
        ["二つ目の 角を 右に 曲がる ___ 、駅が あります。(Rẽ phải ở góc thứ hai thì thấy ga)", ["と", "ば", "から", "ので"], 0, "〜と: hễ… thì (kết quả tất yếu).", "〜と: when… (natural result)."],
        ["電車が 遅れた ___ 、会議に 間に合いませんでした。(Vì tàu trễ nên không kịp họp)", ["ので", "のに", "けど", "まで"], 0, "〜ので: vì (lý do khách quan).", "〜ので: because (objective reason)."],
      ],
      sentences: [["次の 駅で 乗り換えます", "Tôi đổi tàu ở ga tới."], ["信号を 左に 曲がって ください", "Hãy rẽ trái ở đèn giao thông."], ["電車が 遅れたので 遅刻しました", "Vì tàu trễ nên tôi đến muộn."]] },
  ],
  n3: [
    { id: "x1", title: "Mua sắm trực tuyến", titleEn: "Online shopping",
      words: `通販|つうはん/tsuuhan|mua hàng qua mạng
届く|とどく/todoku|được giao tới
返品|へんぴん/henpin|trả hàng
送料|そうりょう/souryou|phí vận chuyển
割引|わりびき/waribiki|giảm giá
在庫|ざいこ/zaiko|hàng tồn kho
支払い|しはらい/shiharai|thanh toán
確認|かくにん/kakunin|xác nhận`,
      grammar: [
        ["注文した 商品が まだ 届いて ___ 。(Hàng đã đặt vẫn chưa tới)", ["いません", "あります", "おきます", "しまいます"], 0, "まだ〜ていない: vẫn chưa.", "まだ〜ていない: not yet."],
        ["サイズが 合わない ___ 、返品できます。(Nếu cỡ không vừa thì có thể trả hàng)", ["場合は", "ために", "ように", "ところ"], 0, "〜場合は: trong trường hợp…", "〜場合は: in case…"],
        ["在庫が ない ___ 、注文できません。(Vì hết hàng nên không đặt được)", ["ため", "うち", "まま", "ほど"], 0, "〜ため: do, vì.", "〜ため: due to."],
        ["支払いの 前に 内容を 確認して ___ 。(Hãy xác nhận nội dung trước khi thanh toán)", ["ください", "しまう", "おく", "ある"], 0, "〜てください: yêu cầu lịch sự.", "〜てください: polite request."],
      ],
      sentences: [["注文した 商品が まだ 届いて いません", "Hàng đã đặt vẫn chưa tới."], ["サイズが 合わない 場合は 返品できます", "Nếu không vừa cỡ thì có thể trả hàng."], ["今日は 送料が 無料 です", "Hôm nay miễn phí vận chuyển."]] },
    { id: "x2", title: "Thiên tai và an toàn", titleEn: "Disasters and safety",
      words: `台風|たいふう/taifuu|bão
避難|ひなん/hinan|sơ tán
停電|ていでん/teiden|mất điện
備える|そなえる/sonaeru|chuẩn bị, phòng bị
危険|きけん/kiken|nguy hiểm
安全|あんぜん/anzen|an toàn
非常口|ひじょうぐち/hijouguchi|lối thoát hiểm
警報|けいほう/keihou|cảnh báo`,
      grammar: [
        ["台風に ___ 、水を 買って おきました。(Để phòng bão, tôi đã mua sẵn nước)", ["備えて", "ついて", "よって", "対して"], 0, "〜に備えて: để phòng…", "〜に備えて: in preparation for…"],
        ["警報が 出た ___ 、すぐ 避難して ください。(Nếu có cảnh báo, hãy sơ tán ngay)", ["ら", "ので", "のに", "まで"], 0, "〜たら: nếu/khi…", "〜たら: if / when…"],
        ["危険な ___ 、近づかないで ください。(Vì nguy hiểm nên đừng lại gần)", ["ので", "ように", "ために", "ほど"], 0, "な-adj + なので: vì…", "na-adjective + なので: because…"],
        ["地震の とき、エレベーターを 使わない ___ して ください。(Khi động đất, hãy cố không dùng thang máy)", ["よう", "ため", "こと", "はず"], 0, "〜ようにする: cố gắng (để)…", "〜ようにする: make an effort to…"],
      ],
      sentences: [["台風に 備えて 水を 買いました", "Tôi đã mua nước để phòng bão."], ["警報が 出たら すぐ 避難して ください", "Có cảnh báo thì hãy sơ tán ngay."], ["非常口は あちら です", "Lối thoát hiểm ở đằng kia."]] },
  ],
  n2: [
    { id: "x1", title: "Y tế và chăm sóc", titleEn: "Healthcare and care",
      words: `診察|しんさつ/shinsatsu|khám bệnh
症状|しょうじょう/shoujou|triệu chứng
処方|しょほう/shohou|kê đơn
入院|にゅういん/nyuuin|nhập viện
介護|かいご/kaigo|chăm sóc người già
予防|よぼう/yobou|phòng ngừa
回復|かいふく/kaifuku|hồi phục
高齢者|こうれいしゃ/koureisha|người cao tuổi`,
      grammar: [
        ["症状 ___ 、薬を 変える 必要が ある。(Tùy triệu chứng mà cần đổi thuốc)", ["によっては", "にとっては", "に対しては", "にしては"], 0, "〜によっては: tùy theo (trường hợp)…", "〜によっては: depending on…"],
        ["高齢者が 増える ___ 、介護の 問題が 深刻に なっている。(Cùng với người cao tuổi tăng, vấn đề chăm sóc nghiêm trọng hơn)", ["につれて", "に反して", "に加えて", "にかけて"], 0, "〜につれて: càng… càng…", "〜につれて: as… (progressively)."],
        ["手術は 成功した ___ 、回復には 時間が かかる。(Ca mổ thành công nhưng hồi phục cần thời gian)", ["ものの", "からには", "おかげで", "ばかりか"], 0, "〜ものの: tuy… nhưng.", "〜ものの: although…"],
        ["病気は 治療 ___ 予防が 大切だ。(Phòng bệnh quan trọng hơn chữa bệnh)", ["より", "ほど", "まで", "だけ"], 0, "A より B: B hơn A.", "A より B: B rather than A."],
      ],
      sentences: [["症状に よっては 入院が 必要 です", "Tùy triệu chứng có thể cần nhập viện."], ["病気は 治療より 予防が 大切 だ", "Phòng bệnh quan trọng hơn chữa bệnh."], ["高齢者の 介護が 社会問題に なっている", "Chăm sóc người cao tuổi đang trở thành vấn đề xã hội."]] },
    { id: "x2", title: "Nghệ thuật và giải trí", titleEn: "Arts and entertainment",
      words: `作品|さくひん/sakuhin|tác phẩm
展覧会|てんらんかい/tenrankai|triển lãm
演奏|えんそう/ensou|biểu diễn (nhạc)
観客|かんきゃく/kankyaku|khán giả
感動|かんどう/kandou|cảm động
評価|ひょうか/hyouka|đánh giá
作者|さくしゃ/sakusha|tác giả
鑑賞|かんしょう/kanshou|thưởng thức`,
      grammar: [
        ["この 映画は 子ども ___ 大人まで 楽しめる。(Phim này từ trẻ con đến người lớn đều xem được)", ["から", "より", "まで", "を"], 0, "A から B まで: từ A đến B.", "A から B まで: from A to B."],
        ["彼の 演奏は 観客を 感動 ___ 。(Màn biểu diễn của anh ấy làm khán giả cảm động)", ["させた", "された", "している", "しそうだ"], 0, "Thể sai khiến: làm cho ai đó…", "Causative: make someone…"],
        ["作品の 評価は 人 ___ 異なる。(Đánh giá tác phẩm khác nhau tùy người)", ["によって", "について", "として", "にとって"], 0, "〜によって: tùy theo.", "〜によって: depending on."],
        ["展覧会に 行った ___ 、作者に 会えた。(Đi triển lãm, nhân tiện gặp được tác giả)", ["ついでに", "かわりに", "とおりに", "ように"], 0, "〜ついでに: nhân tiện.", "〜ついでに: while (doing), incidentally."],
      ],
      sentences: [["彼の 演奏は 観客を 感動させた", "Màn biểu diễn của anh ấy làm khán giả cảm động."], ["作品の 評価は 人に よって 異なる", "Đánh giá tác phẩm khác nhau tùy người."], ["週末に 展覧会を 鑑賞した", "Cuối tuần tôi đã đi xem triển lãm."]] },
  ],
  n1: [
    { id: "x1", title: "Pháp luật và xã hội", titleEn: "Law and society",
      words: `法律|ほうりつ/houritsu|pháp luật
規制|きせい/kisei|quy chế, hạn chế
施行|しこう/shikou|thi hành (luật)
違反|いはん/ihan|vi phạm
権利|けんり/kenri|quyền lợi
義務|ぎむ/gimu|nghĩa vụ
是非|ぜひ/zehi|đúng sai
訴訟|そしょう/soshou|tố tụng`,
      grammar: [
        ["法律が 施行される ___ 、準備が 進められた。(Hướng tới việc luật được thi hành, công tác chuẩn bị được đẩy mạnh)", ["に先立って", "にもまして", "をよそに", "とあって"], 0, "〜に先立って: trước khi (một sự kiện).", "〜に先立って: prior to."],
        ["規制の 是非 ___ 、議論が 続いている。(Tranh luận về việc có nên quy chế hay không vẫn tiếp diễn)", ["をめぐって", "をもって", "をおいて", "をよそに"], 0, "〜をめぐって: xoay quanh.", "〜をめぐって: concerning, over."],
        ["権利を 主張する ___ 、義務も 果たすべきだ。(Đã đòi quyền lợi thì cũng phải làm tròn nghĩa vụ)", ["からには", "ばかりに", "とたんに", "ものなら"], 0, "〜からには: một khi đã… thì…", "〜からには: since / now that…"],
        ["違反者には 厳しい 処分が 下される ___ 。(Người vi phạm chắc chắn bị xử lý nghiêm)", ["に違いない", "にすぎない", "に越したことはない", "に足りない"], 0, "〜に違いない: chắc chắn là…", "〜に違いない: must be, surely."],
      ],
      sentences: [["新しい 法律の 施行に 先立って 説明会が 開かれた", "Trước khi luật mới có hiệu lực, buổi giải thích đã được tổ chức."], ["規制の 是非を めぐって 議論が 続いている", "Tranh luận về việc có nên quy chế vẫn tiếp diễn."], ["権利を 主張する からには 義務も 果たすべきだ", "Đã đòi quyền lợi thì cũng phải làm tròn nghĩa vụ."]] },
    { id: "x2", title: "Thiên nhiên và môi trường", titleEn: "Nature and environment",
      words: `生態系|せいたいけい/seitaikei|hệ sinh thái
絶滅|ぜつめつ/zetsumetsu|tuyệt chủng
温暖化|おんだんか/ondanka|nóng lên toàn cầu
資源|しげん/shigen|tài nguyên
循環|じゅんかん/junkan|tuần hoàn
排出|はいしゅつ/haishutsu|thải ra
保全|ほぜん/hozen|bảo tồn
持続可能|じぞくかのう/jizokukanou|bền vững`,
      grammar: [
        ["温暖化の 影響は 深刻 ___ 。(Ảnh hưởng của nóng lên toàn cầu nghiêm trọng hết mức)", ["極まりない", "にすぎない", "までもない", "ことはない"], 0, "〜極まりない: cực kỳ.", "〜極まりない: extremely."],
        ["一人ひとりの 努力 ___ 、環境は 守れない。(Không có nỗ lực của từng người thì không bảo vệ được môi trường)", ["なくしては", "ならでは", "にしては", "とあれば"], 0, "〜なくしては: nếu không có…", "〜なくしては: without…"],
        ["絶滅の 危機に ある 動物は 増える ___ 。(Động vật có nguy cơ tuyệt chủng ngày càng tăng)", ["一方だ", "ばかりだ", "ことだ", "ものだ"], 0, "〜一方だ: ngày càng (xu hướng một chiều).", "〜一方だ: keep -ing (one-way trend)."],
        ["資源は 限られている ___ 、大切に 使うべきだ。(Chính vì tài nguyên có hạn nên phải dùng tiết kiệm)", ["だけに", "わりに", "くせに", "ものの"], 0, "〜だけに: chính vì… nên càng…", "〜だけに: precisely because…"],
      ],
      sentences: [["温暖化の 影響は 深刻 極まりない", "Ảnh hưởng của nóng lên toàn cầu nghiêm trọng hết mức."], ["絶滅の 危機に ある 動物は 増える 一方だ", "Động vật có nguy cơ tuyệt chủng ngày càng tăng."], ["持続可能な 社会を 目指す べきだ", "Chúng ta nên hướng tới một xã hội bền vững."]] },
  ],
};
