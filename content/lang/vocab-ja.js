// ja vocabulary expansion: 1000 extra words (200 per level, 4 units per level).
// Format: "word|reading|Vietnamese meaning". Only append units at the END of each level; never change existing IDs.
// Units use IDs v1..v4 so they never collide with base units. Each word is unique within the course.
export default {
  n5: [
    { id: "v1", title: "Đồ vật và màu sắc", titleEn: "Objects and colours", words: `ランプ|ランプ/ranpu|đèn bàn
鏡|かがみ/kagami|cái gương
タオル|タオル/taoru|khăn tắm
石けん|せっけん/sekken|xà phòng
歯ブラシ|はぶらし/haburashi|bàn chải đánh răng
鍵|かぎ/kagi|chìa khóa
パソコン|パソコン/pasokon|máy tính
テレビ|テレビ/terebi|ti vi
カメラ|カメラ/kamera|máy ảnh
びん|びん/bin|cái chai
コップ|コップ/koppu|cái cốc
お皿|おさら/osara|cái đĩa
スプーン|スプーン/supūn|cái thìa
フォーク|フォーク/fōku|cái nĩa
ナイフ|ナイフ/naifu|con dao
鍋|なべ/nabe|cái nồi
フライパン|フライパン/furaipan|cái chảo
かご|かご/kago|cái giỏ
箱|はこ/hako|cái hộp
ズボン|ズボン/zubon|quần dài
靴下|くつした/kutsushita|tất
眼鏡|めがね/megane|kính mắt
ベルト|ベルト/beruto|thắt lưng
上着|うわぎ/uwagi|áo khoác
セーター|セーター/sētā|áo len
コート|コート/kōto|áo khoác dài
マフラー|マフラー/mafurā|khăn quàng cổ
手袋|てぶくろ/tebukuro|găng tay
ハンガー|ハンガー/hangā|móc treo quần áo
定規|じょうぎ/jōgi|thước kẻ
消しゴム|けしゴム/keshigomu|cục tẩy
電卓|でんたく/dentaku|máy tính bỏ túi
封筒|ふうとう/fūtō|phong bì
切手|きって/kitte|tem thư
紙|かみ/kami|giấy
ろうそく|ろうそく/rōsoku|cây nến
花瓶|かびん/kabin|bình hoa
ノート|ノート/nōto|vở
リュック|リュック/ryukku|ba lô
黄色|きいろ/kiiro|màu vàng
黒|くろ/kuro|màu đen
白|しろ/shiro|màu trắng
茶色|ちゃいろ/chairo|màu nâu
ピンク|ピンク/pinku|màu hồng
灰色|はいいろ/haiiro|màu xám
紫|むらさき/murasaki|màu tím
オレンジ|オレンジ/orenji|màu cam
赤|あか/aka|màu đỏ
ハサミ|ハサミ/hasami|cái kéo
ティッシュ|ティッシュ/tisshu|khăn giấy` },
    { id: "v2", title: "Thức ăn và đồ uống", titleEn: "Food and drink", words: `ご飯|ごはん/gohan|cơm
肉|にく/niku|thịt
エビ|エビ/ebi|con tôm
卵|たまご/tamago|quả trứng
チーズ|チーズ/chīzu|pho mát
バター|バター/batā|bơ
牛乳|ぎゅうにゅう/gyūnyū|sữa bò
コーヒー|コーヒー/kōhī|cà phê
お茶|おちゃ/ocha|trà
ジュース|ジュース/jūsu|nước ép
ビール|ビール/bīru|bia
ワイン|ワイン/wain|rượu vang
こしょう|こしょう/koshō|hạt tiêu
サラダ|サラダ/sarada|rau trộn
スパゲッティ|スパゲッティ/supagetti|mì ống
ピザ|ピザ/piza|bánh pizza
サンドイッチ|サンドイッチ/sandoicchi|bánh sandwich
ケーキ|ケーキ/kēki|bánh ngọt
クッキー|クッキー/kukkī|bánh quy
アイスクリーム|アイスクリーム/aisukurīmu|kem
バナナ|バナナ/banana|quả chuối
ぶどう|ぶどう/budō|quả nho
いちご|いちご/ichigo|dâu tây
レモン|レモン/remon|quả chanh
じゃがいも|じゃがいも/jagaimo|khoai tây
トマト|トマト/tomato|cà chua
にんじん|にんじん/ninjin|cà rốt
たまねぎ|たまねぎ/tamanegi|hành tây
キャベツ|キャベツ/kyabetsu|bắp cải
きのこ|きのこ/kinoko|nấm
とうもろこし|とうもろこし/tōmorokoshi|ngô
果物|くだもの/kudamono|trái cây
レストラン|レストラン/resutoran|nhà hàng
おなかがいっぱい|おなかがいっぱい/onaka ga ippai|no bụng
のどがかわいた|のどがかわいた/nodo ga kawaita|khát nước
料理する|りょうりする/ryōri suru|nấu ăn
焼く|やく/yaku|nướng
揚げる|あげる/ageru|rán
むく|むく/muku|gọt vỏ
切る|きる/kiru|cắt, thái
酸っぱい|すっぱい/suppai|chua
苦い|にがい/nigai|đắng
新鮮な|しんせんな/shinsen na|tươi
冷凍|れいとう/reitō|đông lạnh
茶碗|ちゃわん/chawan|cái bát
ジャム|ジャム/jamu|mứt
パン|パン/pan|bánh mì
ご馳走|ごちそう/gochisō|bữa tiệc, món ngon
ミルク|ミルク/miruku|sữa
ハム|ハム/hamu|giăm bông` },
    { id: "v3", title: "Nơi chốn và đi lại", titleEn: "Places and getting around", words: `道|みち/michi|con đường
橋|はし/hashi|cây cầu
市場|いちば/ichiba|chợ
郵便局|ゆうびんきょく/yūbinkyoku|bưu điện
教会|きょうかい/kyōkai|nhà thờ
博物館|はくぶつかん/hakubutsukan|bảo tàng
町|まち/machi|thành phố
村|むら/mura|ngôi làng
タクシー|タクシー/takushī|xe taxi
車|くるま/kuruma|ô tô
自転車|じてんしゃ/jitensha|xe đạp
バイク|バイク/baiku|xe máy
飛行機|ひこうき/hikōki|máy bay
船|ふね/fune|thuyền
横断歩道|おうだんほどう/ōdan hodō|lối qua đường
左|ひだり/hidari|bên trái
右|みぎ/migi|bên phải
遠い|とおい/tōi|xa
となり|となり/tonari|bên cạnh
後ろ|うしろ/ushiro|phía sau
前|まえ/mae|phía trước
建物|たてもの/tatemono|tòa nhà
階|かい/kai|tầng
エレベーター|エレベーター/erebētā|thang máy
階段|かいだん/kaidan|cầu thang
入口|いりぐち/iriguchi|lối vào
出口|でぐち/deguchi|lối ra
駐車場|ちゅうしゃじょう/chūshajō|bãi đỗ xe
道順|みちじゅん/michijun|lộ trình
運転する|うんてんする/unten suru|lái xe
路面電車|ろめんでんしゃ/romen densha|xe điện
地下鉄|ちかてつ/chikatetsu|tàu điện ngầm
歩道|ほどう/hodō|vỉa hè
トンネル|トンネル/tonneru|đường hầm
門|もん/mon|cổng
ロータリー|ロータリー/rōtarī|vòng xuyến
交差点|こうさてん/kōsaten|ngã tư
高速道路|こうそくどうろ/kōsoku dōro|đường cao tốc
映画館|えいがかん/eigakan|rạp chiếu phim
劇場|げきじょう/gekijō|nhà hát
工場|こうじょう/kōjō|nhà máy
農場|のうじょう/nōjō|trang trại
整備工場|せいびこうじょう/seibi kōjō|gara sửa xe
ガソリンスタンド|ガソリンスタンド/gasorin sutando|trạm xăng
バス停|バスてい/basu tei|trạm xe buýt
郵便|ゆうびん/yūbin|bưu chính
交番|こうばん/kōban|đồn cảnh sát
港|みなと/minato|bến cảng
河原|かわら/kawara|bờ sông
市役所|しやくしょ/shiyakusho|tòa thị chính` },
    { id: "v4", title: "Thời gian và thời tiết", titleEn: "Time and weather", words: `年|とし/toshi|năm
分|ふん/fun|phút
秒|びょう/byō|giây
今|いま/ima|bây giờ
後で|あとで/ato de|sau này
雨の|あめの/ame no|có mưa
暖かい|あたたかい/atatakai|ấm
風|かぜ/kaze|gió
太陽|たいよう/taiyō|mặt trời
月|つき/tsuki|mặt trăng
星|ほし/hoshi|ngôi sao
空|そら/sora|bầu trời
海|うみ/umi|biển
山|やま/yama|núi
川|かわ/kawa|sông
森|もり/mori|rừng
百|ひゃく/hyaku|một trăm
千|せん/sen|một nghìn
半分|はんぶん/hanbun|một nửa
四分の一|よんぶんのいち/yonbun no ichi|một phần tư
零|れい/rei|số không
二十|にじゅう/nijū|hai mươi
百万|ひゃくまん/hyakuman|một triệu
夜|よる/yoru|ban đêm
昼|ひる/hiru|buổi trưa
午後|ごご/gogo|buổi chiều
晩|ばん/ban|buổi tối
真夜中|まよなか/mayonaka|nửa đêm
夜明け|よあけ/yoake|bình minh
夕暮れ|ゆうぐれ/yūgure|hoàng hôn
カレンダー|カレンダー/karendā|lịch
日付|ひづけ/hiduke|ngày tháng
時|とき/toki|thời gian
時間割|じかんわり/jikanwari|thời gian biểu
すぐに|すぐに/sugu ni|sớm thôi
もう|もう/mō|đã rồi
まだ|まだ/mada|vẫn còn
いつもの|いつもの/itsumo no|thông thường
前に|まえに/mae ni|cách đây
後|あと/ato|sau
間|あいだ/aida|trong suốt
二週間|にしゅうかん/nishūkan|hai tuần
十年|じゅうねん/jūnen|thập kỷ
世紀|せいき/seiki|thế kỷ
今夜|こんや/konya|tối nay
日中|にっちゅう/nicchū|ban ngày
昼食時|ちゅうしょくじ/chūshokuji|giờ ăn trưa
朝|あさ/asa|buổi sáng
秋|あき/aki|mùa thu
霧|きり/kiri|sương mù` },
  ],
  n4: [
    { id: "v1", title: "Nhà cửa và đồ đạc", titleEn: "Home and furniture", words: `玄関|げんかん/genkan|lối vào
浴室|よくしつ/yokushitsu|phòng tắm
居間|いま/ima|phòng khách
ベランダ|ベランダ/beranda|ban công
屋根|やね/yane|mái nhà
壁|かべ/kabe|bức tường
カーペット|カーペット/kāpetto|tấm thảm
ソファ|ソファ/sofa|ghế sofa
戸棚|とだな/todana|tủ đựng đồ
冷蔵庫|れいぞうこ/reizōko|tủ lạnh
コンロ|コンロ/konro|bếp nấu
オーブン|オーブン/ōbun|lò nướng
洗濯機|せんたくき/sentakuki|máy giặt
掃除機|そうじき/sōjiki|máy hút bụi
カーテン|カーテン/kāten|rèm cửa
枕|まくら/makura|cái gối
毛布|もうふ/mōfu|cái chăn
シーツ|シーツ/shītsu|khăn trải giường
棚|たな/tana|cái kệ
引き出し|ひきだし/hikidashi|ngăn kéo
借り手|かりて/karite|người thuê nhà
マンション|マンション/manshon|căn hộ
暖房|だんぼう/danbō|hệ thống sưởi
直す|なおす/naosu|sửa chữa
きれいな|きれいな/kirei na|sạch sẽ
片づいた|かたづいた/katazuita|gọn gàng
汚い|きたない/kitanai|bẩn
快適な|かいてきな/kaiteki na|thoải mái
家具|かぐ/kagu|đồ nội thất
飾る|かざる/kazaru|trang trí
電気代|でんきだい/denkidai|tiền điện
住所|じゅうしょ/jūsho|địa chỉ
食洗機|しょくせんき/shokusenki|máy rửa bát
流し|ながし/nagashi|bồn rửa
蛇口|じゃぐち/jaguchi|vòi nước
トイレ|トイレ/toire|nhà vệ sinh
シャワー|シャワー/shawā|vòi sen
明かり|あかり/akari|đèn, ánh sáng
廊下|ろうか/rōka|hành lang
屋根裏部屋|やねうらべや/yaneurabeya|gác mái
地下室|ちかしつ/chikashitsu|tầng hầm
垣根|かきね/kakine|hàng rào
玄関のベル|げんかんのべる/genkan no beru|chuông cửa
モップ|モップ/moppu|cây lau nhà
ほうき|ほうき/hōki|cái chổi
ごみ箱|ごみばこ/gomibako|thùng rác
スポンジ|スポンジ/suponji|miếng bọt biển
やかん|やかん/yakan|ấm đun nước
寝室|しんしつ/shinshitsu|phòng ngủ
床|ゆか/yuka|sàn nhà` },
    { id: "v2", title: "Mua sắm và tiền bạc", titleEn: "Shopping and money", words: `レシート|レシート/reshīto|biên lai
セール|セール/sēru|đợt giảm giá
払う|はらう/harau|trả tiền
現金|げんきん/genkin|tiền mặt
カード|カード/kādo|thẻ
お釣り|おつり/otsuri|tiền thừa
返金|へんきん/henkin|hoàn tiền
交換|こうかん/kōkan|đổi hàng
掘り出し物|ほりだしもの/horidashimono|món hời
行列|ぎょうれつ/gyōretsu|hàng người xếp hàng
ショッピングカート|ショッピングカート/shoppingu kāto|xe đẩy hàng
製品|せいひん/seihin|sản phẩm
オンラインの|オンラインの/onrain no|trực tuyến
配達|はいたつ/haitatsu|giao hàng
硬貨|こうか/kōka|đồng xu
お札|おさつ/osatsu|tờ tiền
自動預け払い機|じどうあずけはらいき/jidō azukebaraiki|máy rút tiền
使う|つかう/tsukau|tiêu tiền
借金|しゃっきん/shakkin|nợ
収入|しゅうにゅう/shūnyū|thu nhập
税金|ぜいきん/zeikin|thuế
荷物|にもつ/nimotsu|gói hàng
デパート|デパート/depāto|cửa hàng bách hóa
スーパー|スーパー/sūpā|siêu thị
レジ係|レジがかり/rejigakari|thu ngân
無料|むりょう/muryō|miễn phí
値札|ねふだ/nefuda|nhãn giá
露店|ろてん/roten|quầy hàng
クーポン|クーポン/kūpon|phiếu giảm giá
カタログ|カタログ/katarogu|danh mục sản phẩm
レジ|レジ/reji|quầy thanh toán
買い物袋|かいものぶくろ/kaimono bukuro|túi mua sắm
中古の|ちゅうこの/chūko no|đã qua sử dụng
新品の|しんぴんの/shinpin no|mới toanh
割引の|わりびきの/waribiki no|đã giảm giá
在庫あり|ざいこあり/zaiko ari|còn hàng
売り切れ|うりきれ/urikire|hết hàng
領収書|りょうしゅうしょ/ryōshūsho|hóa đơn
包む|つつむ/tsutsumu|gói (quà)
保証|ほしょう/hoshō|bảo hành
セール品|セールひん/sēru hin|hàng giảm giá
財布|さいふ/saifu|ví tiền
小銭|こぜに/kozeni|tiền lẻ
割り勘|わりかん/warikan|chia tiền
売り場|うりば/uriba|quầy bán
お買い得|おかいどく/okaidoku|hời
ポイントカード|ポイントカード/pointo kādo|thẻ tích điểm
割引券|わりびきけん/waribikiken|phiếu giảm giá
値段表|ねだんひょう/nedanhyō|bảng giá
お金持ち|おかねもち/okanemochi|người giàu` },
    { id: "v3", title: "Sức khỏe và cơ thể", titleEn: "Health and the body", words: `顔|かお/kao|khuôn mặt
耳|みみ/mimi|tai
鼻|はな/hana|mũi
口|くち/kuchi|miệng
舌|した/shita|lưỡi
首|くび/kubi|cổ
肩|かた/kata|vai
腕|うで/ude|cánh tay
指|ゆび/yubi|ngón tay
胸|むね/mune|ngực
おなか|おなか/onaka|bụng
背中|せなか/senaka|lưng
脚|あし/ashi|chân
ひざ|ひざ/hiza|đầu gối
足首|あしくび/ashikubi|mắt cá chân
心臓|しんぞう/shinzō|tim
血|ち/chi|máu
薬剤師|やくざいし/yakuzaishi|dược sĩ
錠剤|じょうざい/jōzai|viên thuốc
インフルエンザ|インフルエンザ/infuruenza|cúm
のどが痛い|のどがいたい/nodo ga itai|đau họng
歯が痛い|はがいたい/ha ga itai|đau răng
けが|けが/kega|vết thương
包帯|ほうたい/hōtai|băng gạc
処方箋|しょほうせん/shohōsen|đơn thuốc
健康な|けんこうな/kenkō na|khỏe mạnh
運動|うんどう/undō|tập thể dục
眠る|ねむる/nemuru|ngủ
弱い|よわい/yowai|yếu
くつろぐ|くつろぐ/kutsurogu|thư giãn
ビタミン|ビタミン/bitamin|vitamin
回復する|かいふくする/kaifuku suru|hồi phục
けがをする|けがをする/kega o suru|bị thương
めまい|めまい/memai|chóng mặt
吐き気|はきけ/hakike|buồn nôn
はれる|はれる/hareru|sưng
あざ|あざ/aza|vết bầm
やけど|やけど/yakedo|vết bỏng
切り傷|きりきず/kirikizu|vết cắt
レントゲン|レントゲン/rentogen|chụp X-quang
血圧|けつあつ/ketsuatsu|huyết áp
体温計|たいおんけい/taionkei|nhiệt kế
手術|しゅじゅつ/shujutsu|ca phẫu thuật
救急車|きゅうきゅうしゃ/kyūkyūsha|xe cứu thương
救急室|きゅうきゅうしつ/kyūkyūshitsu|phòng cấp cứu
車いす|くるまいす/kuruma isu|xe lăn
松葉づえ|まつばづえ/matsubazue|nạng
歯医者|はいしゃ/haisha|nha sĩ
眼科医|がんかい/ganka'i|bác sĩ mắt
肺|はい/hai|phổi` },
    { id: "v4", title: "Công việc và nghề nghiệp", titleEn: "Work and jobs", words: `社員|しゃいん/shain|nhân viên
雇い主|やといぬし/yatoinushi|chủ lao động
応募書類|おうぼしょるい/ōbo shorui|đơn xin việc
契約|けいやく/keiyaku|hợp đồng
技能|ぎのう/ginō|kỹ năng
研修|けんしゅう/kenshū|đào tạo
定年退職|ていねんたいしょく/teinen taishoku|nghỉ hưu
失業中|しつぎょうちゅう/shitsugyōchū|thất nghiệp
農家|のうか/nōka|nông dân
運転手|うんてんしゅ/untenshu|tài xế
コック|コック/kokku|đầu bếp
警察官|けいさつかん/keisatsukan|cảnh sát
消防士|しょうぼうし/shōbōshi|lính cứu hỏa
兵士|へいし/heishi|người lính
パイロット|パイロット/pairotto|phi công
記者|きしゃ/kisha|nhà báo
デザイナー|デザイナー/dezainā|nhà thiết kế
会計士|かいけいし/kaikeishi|kế toán viên
弁護士|べんごし/bengoshi|luật sư
秘書|ひしょ/hisho|thư ký
受付|うけつけ/uketsuke|lễ tân
シフト|シフト/shifuto|ca làm việc
残業|ざんぎょう/zangyō|làm thêm giờ
プロジェクト|プロジェクト/purojekuto|dự án
仕事|しごと/shigoto|nhiệm vụ
勤務表|きんむひょう/kinmuhyō|bảng chấm công
会社|かいしゃ/kaisha|công ty
作業場|さぎょうば/sagyōba|xưởng
商売|しょうばい/shōbai|doanh nghiệp
取引先|とりひきさき/torihikisaki|khách hàng doanh nghiệp
成し遂げる|なしとげる/nashitogeru|hoàn thành
成功|せいこう/seikō|thành công
賃金|ちんぎん/chingin|tiền công
ボーナス|ボーナス/bōnasu|tiền thưởng
給与明細|きゅうよめいさい/kyūyo meisai|phiếu lương
空き|あき/aki|vị trí tuyển dụng
採用する|さいようする/saiyō suru|tuyển dụng
履歴書|りれきしょ/rirekisho|sơ yếu lý lịch
キャリア|キャリア/kyaria|sự nghiệp
上司|じょうし/jōshi|người giám sát
アシスタント|アシスタント/ashisutanto|trợ lý
研修生|けんしゅうせい/kenshūsei|thực tập sinh
会議室|かいぎしつ/kaigishitsu|phòng họp
職場|しょくば/shokuba|nơi làm việc
職業|しょくぎょう/shokugyō|nghề nghiệp
社長|しゃちょう/shachō|giám đốc
部長|ぶちょう/buchō|trưởng phòng
同僚|どうりょう/dōryō|đồng nghiệp
面接|めんせつ/mensetsu|phỏng vấn
仕事場|しごとば/shigotoba|chỗ làm việc` },
  ],
  n3: [
    { id: "v1", title: "Du lịch và sân bay", titleEn: "Travel and the airport", words: `パスポート|パスポート/pasupōto|hộ chiếu
ビザ|ビザ/biza|thị thực
スーツケース|スーツケース/sūtsukēsu|va li
搭乗券|とうじょうけん/tōjōken|thẻ lên máy bay
便|びん/bin|chuyến bay
出発|しゅっぱつ/shuppatsu|sự khởi hành
到着|とうちゃく/tōchaku|sự đến nơi
キャンセル|キャンセル/kyanseru|hủy bỏ
搭乗口|とうじょうぐち/tōjōguchi|cổng lên máy bay
税関|ぜいかん/zeikan|hải quan
観光客|かんこうきゃく/kankōkyaku|khách du lịch
ガイド|ガイド/gaido|hướng dẫn viên
観光|かんこう/kankō|tham quan
宿泊|しゅくはく/shukuhaku|chỗ ở
キャンプ場|キャンプじょう/kyampu jō|khu cắm trại
リゾート|リゾート/rizōto|khu nghỉ dưỡng
浜辺|はまべ/hamabe|bãi biển
島|しま/shima|hòn đảo
谷|たに/tani|thung lũng
滝|たき/taki|thác nước
湖|みずうみ/mizuumi|hồ
砂漠|さばく/sabaku|sa mạc
首都|しゅと/shuto|thủ đô
国境|こっきょう/kokkyō|biên giới
通貨|つうか/tsūka|tiền tệ
為替レート|かわせレート/kawase rēto|tỷ giá
保険|ほけん/hoken|bảo hiểm
緊急|きんきゅう/kinkyū|khẩn cấp
大使館|たいしかん/taishikan|đại sứ quán
ツアー|ツアー/tsuā|chuyến tham quan
景色|けしき/keshiki|quang cảnh
風景|ふうけい/fūkei|phong cảnh
旅|たび/tabi|chuyến đi
バックパッカー|バックパッカー/bakkupakkā|người đi bụi
ぶらぶらする|ぶらぶらする/burabura suru|đi lang thang
不慣れな|ふなれな/funare na|lạ lẫm
地元の人|じもとのひと/jimoto no hito|người địa phương
外国の|がいこくの/gaikoku no|nước ngoài
航空会社|こうくうがいしゃ/kōkū gaisha|hãng hàng không
座席|ざせき/zaseki|chỗ ngồi
滑走路|かっそうろ/kassōro|đường băng
ターミナル|ターミナル/tāminaru|nhà ga sân bay
保安検査|ほあんけんさ/hoan kensa|kiểm tra an ninh
乗客|じょうきゃく/jōkyaku|hành khách
時差ぼけ|じさぼけ/jisaboke|lệch múi giờ
日焼け止め|ひやけどめ/hiyakedome|kem chống nắng
ユースホステル|ユースホステル/yūsu hosuteru|nhà nghỉ bình dân
ハイキング|ハイキング/haikingu|đi bộ đường dài
寺|てら/tera|ngôi đền
城|しろ/shiro|lâu đài` },
    { id: "v2", title: "Học tập và thi cử", titleEn: "Study and exams", words: `試験|しけん/shiken|kỳ thi
成績|せいせき/seiseki|kết quả
点数|てんすう/tensū|điểm số
学位|がくい/gakui|bằng cấp
大学|だいがく/daigaku|trường đại học
短大|たんだい/tandai|trường cao đẳng
講義|こうぎ/kōgi|bài giảng
学期|がっき/gakki|học kỳ
課題|かだい/kadai|bài tập được giao
レポート|レポート/repōto|bài luận
研究室|けんきゅうしつ/kenkyūshitsu|phòng thí nghiệm
授業料|じゅぎょうりょう/jugyōryō|học phí
科目|かもく/kamoku|môn học
復習|ふくしゅう/fukushū|ôn tập
暗記|あんき/anki|ghi nhớ
集中|しゅうちゅう/shūchū|tập trung
理解|りかい/rikai|hiểu
質問|しつもん/shitsumon|câu hỏi
採点|さいてん/saiten|chấm điểm
落ちる|おちる/ochiru|trượt
受かる|うかる/ukaru|đỗ
文学|ぶんがく/bungaku|văn học
歴史|れきし/rekishi|lịch sử
地理|ちり/chiri|địa lý
化学|かがく/kagaku|hóa học
物理|ぶつり/butsuri|vật lý
生物|せいぶつ/seibutsu|sinh học
数学|すうがく/sūgaku|toán học
経済学|けいざいがく/keizaigaku|kinh tế học
心理学|しんりがく/shinrigaku|tâm lý học
翻訳|ほんやく/honyaku|bản dịch
文法|ぶんぽう/bunpō|ngữ pháp
発音|はつおん/hatsuon|cách phát âm
辞書|じしょ/jisho|từ điển
教科書|きょうかしょ/kyōkasho|sách giáo khoa
注釈|ちゅうしゃく/chūshaku|chú thích
授業計画|じゅぎょうけいかく/jugyō keikaku|đề cương môn học
授業|じゅぎょう/jugyō|bài học
小テスト|しょうテスト/shō tesuto|bài kiểm tra ngắn
宿題|しゅくだい/shukudai|bài tập về nhà
クラスメート|クラスメート/kurasumēto|bạn cùng lớp
家庭教師|かていきょうし/kateikyōshi|gia sư
学年|がくねん/gakunen|năm học
校長|こうちょう/kōchō|hiệu trưởng
キャンパス|キャンパス/kyanpasu|khuôn viên trường
講師|こうし/kōshi|giảng viên
作文|さくぶん/sakubun|bài văn
答案|とうあん/tōan|bài làm
奨学金|しょうがくきん/shōgakukin|học bổng
卒業|そつぎょう/sotsugyō|tốt nghiệp` },
    { id: "v3", title: "Công nghệ và internet", titleEn: "Technology and the internet", words: `スマートフォン|スマートフォン/sumāto fon|điện thoại thông minh
ノートパソコン|ノートパソコン/nōto pasokon|máy tính xách tay
タブレット|タブレット/taburetto|máy tính bảng
キーボード|キーボード/kībōdo|bàn phím
マウス|マウス/mausu|chuột máy tính
画面|がめん/gamen|màn hình
電池|でんち/denchi|pin
充電器|じゅうでんき/jūdenki|bộ sạc
パスワード|パスワード/pasuwādo|mật khẩu
ユーザー名|ユーザーめい/yūzā mei|tên đăng nhập
ログイン|ログイン/roguin|đăng nhập
ダウンロード|ダウンロード/daunrōdo|tải xuống
アップロード|アップロード/appurōdo|tải lên
インストール|インストール/insutōru|cài đặt
アップデート|アップデート/appudēto|cập nhật
ソフトウェア|ソフトウェア/sofutowea|phần mềm
アプリ|アプリ/apuri|ứng dụng
ウェブサイト|ウェブサイト/webusaito|trang web
ブラウザ|ブラウザ/burauza|trình duyệt
検索エンジン|けんさくエンジン/kensaku enjin|công cụ tìm kiếm
メール|メール/mēru|thư điện tử
添付ファイル|てんぷファイル/tenpu fairu|tệp đính kèm
ショートメッセージ|ショートメッセージ/shōto messēji|tin nhắn văn bản
通知|つうち/tsūchi|thông báo
ビデオ通話|ビデオつうわ/bideo tsūwa|cuộc gọi video
ネットワーク|ネットワーク/nettowāku|mạng
無線LAN|むせんラン/musen ran|wifi
データベース|データベース/dētabēsu|cơ sở dữ liệu
暗号化|あんごうか/angōka|mã hóa
ハッカー|ハッカー/hakkā|tin tặc
ウイルス|ウイルス/uirusu|vi-rút
バックアップ|バックアップ/bakkuappu|bản sao lưu
ソーシャルメディア|ソーシャルメディア/sōsharu media|mạng xã hội
ブログ|ブログ/burogu|blog
ポッドキャスト|ポッドキャスト/poddokyasuto|podcast
配信|はいしん/haishin|phát trực tuyến
人工知能|じんこうちのう/jinkō chinō|trí tuệ nhân tạo
ロボット|ロボット/robotto|người máy
ハードウェア|ハードウェア/hādowea|phần cứng
ガジェット|ガジェット/gajetto|tiện ích công nghệ
デジタルの|デジタルの/dejitaru no|kỹ thuật số
発明する|はつめいする/hatsumei suru|phát minh
機械|きかい/kikai|máy móc
自動の|じどうの/jidō no|tự động
プログラム|プログラム/puroguramu|chương trình máy tính
コード|コード/kōdo|mã lập trình
エラー|エラー/erā|lỗi
フリーズ|フリーズ/furīzu|treo máy
接続する|せつぞくする/setsuzoku suru|kết nối
充電する|じゅうでんする/jūden suru|sạc` },
    { id: "v4", title: "Cảm xúc và tính cách", titleEn: "Feelings and personality", words: `うれしい|うれしい/ureshii|vui vẻ
悲しい|かなしい/kanashii|buồn
怒っている|おこっている/okotte iru|tức giận
こわい|こわい/kowai|sợ hãi
驚いた|おどろいた/odoroita|ngạc nhiên
緊張した|きんちょうした/kinchō shita|hồi hộp
わくわくする|わくわくする/wakuwaku suru|háo hức
退屈な|たいくつな/taikutsu na|chán
寂しい|さびしい/sabishii|cô đơn
嫉妬する|しっとする/shitto suru|ghen tị
感謝している|かんしゃしている/kansha shite iru|biết ơn
落ち着いた|おちついた/ochitsuita|bình tĩnh
辛抱強い|しんぼうづよい/shinbōzuyoi|kiên nhẫn
正直な|しょうじきな/shōjiki na|trung thực
寛大な|かんだいな/kandai na|hào phóng
勇敢な|ゆうかんな/yūkan na|dũng cảm
内気な|うちきな/uchiki na|nhút nhát
礼儀正しい|れいぎただしい/reigi tadashii|lịch sự
無礼な|ぶれいな/burei na|thô lỗ
賢い|かしこい/kashikoi|thông minh
怠け者|なまけもの/namakemono|lười biếng
慎重な|しんちょうな/shinchō na|cẩn thận
創造的な|そうぞうてきな/sōzōteki na|sáng tạo
ユーモアのある|ユーモアのある/yūmoa no aru|hài hước
真面目な|まじめな/majime na|nghiêm túc
親切な|しんせつな/shinsetsu na|tốt bụng
利己的な|りこてきな/rikoteki na|ích kỷ
陽気な|ようきな/yōki na|vui tươi
親しみやすい|したしみやすい/shitashimiyasui|thân thiện
野心的な|やしんてきな/yashinteki na|có tham vọng
謙虚な|けんきょな/kenkyo na|khiêm tốn
好奇心の強い|こうきしんのつよい/kōkishin no tsuyoi|tò mò
感情的な|かんじょうてきな/kanjōteki na|dễ xúc động
気分|きぶん/kibun|tâm trạng
性格|せいかく/seikaku|tính cách
振る舞い|ふるまい/furumai|hành vi
態度|たいど/taido|thái độ
言い争う|いいあらそう/iiarasō|tranh cãi
許す|ゆるす/yurusu|tha thứ
謝る|あやまる/ayamaru|xin lỗi
励ます|はげます/hagemasu|khuyến khích
尊敬する|そんけいする/sonkei suru|ngưỡng mộ
からかう|からかう/karakau|trêu chọc
優しい|やさしい/yasashii|dịu dàng
思いやりのある|おもいやりのある/omoiyari no aru|thông cảm
用心深い|ようじんぶかい/yōjinbukai|thận trọng
勇気|ゆうき/yūki|dũng khí
誇り|ほこり/hokori|tự hào
心配な|しんぱいな/shinpai na|lo lắng
正しい|ただしい/tadashii|đúng` },
  ],
  n2: [
    { id: "v1", title: "Môi trường và thiên nhiên", titleEn: "Environment and nature", words: `汚染|おせん/osen|ô nhiễm
気候|きこう/kikō|khí hậu
地球温暖化|ちきゅうおんだんか/chikyū ondanka|nóng lên toàn cầu
堆肥|たいひ/taihi|phân trộn
埋め立て地|うめたてち/umetatechi|bãi chôn lấp rác
再生可能エネルギー|さいせいかのうエネルギー/saisei kanō enerugī|năng lượng tái tạo
太陽光|たいようこう/taiyōkō|năng lượng mặt trời
化石燃料|かせきねんりょう/kaseki nenryō|nhiên liệu hóa thạch
干ばつ|かんばつ/kanbatsu|hạn hán
洪水|こうずい/kōzui|lũ lụt
絶滅危惧の|ぜつめついぐの/zetsumetsu iguno|bị đe dọa
種|しゅ/shu|loài
生息地|せいそくち/seisokuchi|môi trường sống
生物多様性|せいぶつたようせい/seibutsu tayōsei|đa dạng sinh học
森林破壊|しんりんはかい/shinrin hakai|nạn phá rừng
保存|ほぞん/hozon|bảo tồn
環境にやさしい|かんきょうにやさしい/kankyō ni yasashii|thân thiện môi trường
削減する|さくげんする/sakugen suru|cắt giảm
再利用する|さいりようする/sairiyō suru|tái sử dụng
処分する|しょぶんする/shobun suru|vứt bỏ, xử lý
有害な|ゆうがいな/yūgai na|độc hại
化学物質|かがくぶっしつ/kagaku busshitsu|hóa chất
ほこり|ほこり/hokori|bụi
スモッグ|スモッグ/sumoggu|sương khói
酸素|さんそ/sanso|ô-xy
大気|たいき/taiki|khí quyển
土|つち/tsuchi|đất
浸食|しんしょく/shinshoku|xói mòn
溶ける|とける/tokeru|tan chảy
気温|きおん/kion|nhiệt độ
火山|かざん/kazan|núi lửa
海洋|かいよう/kaiyō|đại dương
海岸|かいがん/kaigan|bờ biển
作物|さくもつ/sakumotsu|vụ mùa
収穫|しゅうかく/shūkaku|thu hoạch
農業|のうぎょう/nōgyō|nông nghiệp
家畜|かちく/kachiku|gia súc
野生動物|やせいどうぶつ/yasei dōbutsu|động vật hoang dã
包装材|ほうそうざい/hōsōzai|bao bì
排水|はいすい/haisui|nước thải
農薬|のうやく/nōyaku|thuốc trừ sâu
植林|しょくりん/shokurin|trồng rừng
炭素|たんそ/tanso|các-bon
風力|ふうりょく/fūryoku|năng lượng gió
水質|すいしつ/suishitsu|chất lượng nước
大量|たいりょう/tairyō|lượng lớn
絶滅危機|ぜつめつきき/zetsumetsu kiki|nguy cơ tuyệt chủng
生き物|いきもの/ikimono|sinh vật
沿岸|えんがん/engan|ven biển
森林資源|しんりんしげん/shinrin shigen|tài nguyên rừng` },
    { id: "v2", title: "Truyền thông và tin tức", titleEn: "Media and news", words: `放送する|ほうそうする/hōsō suru|phát sóng
視聴者|しちょうしゃ/shichōsha|khán giả
出版する|しゅっぱんする/shuppan suru|xuất bản
編集者|へんしゅうしゃ/henshūsha|biên tập viên
記事|きじ/kiji|bài báo
コラムニスト|コラムニスト/koramunisuto|người viết chuyên mục
検閲|けんえつ/ken'etsu|kiểm duyệt
宣伝|せんでん/senden|tuyên truyền
うわさ|うわさ/uwasa|tin đồn
フェイクニュース|フェイクニュース/feiku nyūsu|tin giả
情報源|じょうほうげん/jōhōgen|nguồn tin
告発|こくはつ/kokuhatsu|cáo buộc
見解|けんかい/kenkai|quan điểm
偏見|へんけん/henken|thiên kiến
客観的な|きゃっかんてきな/kyakkanteki na|khách quan
検証する|けんしょうする/kenshō suru|xác minh
調査する|ちょうさする/chōsa suru|điều tra
スキャンダル|スキャンダル/sukyandaru|vụ bê bối
有名人|ゆうめいじん/yūmeijin|người nổi tiếng
広告|こうこく/kōkoku|quảng cáo
キャンペーン|キャンペーン/kyanpēn|chiến dịch
流行|りゅうこう/ryūkō|xu hướng
拡散する|かくさんする/kakusan suru|lan truyền
インフルエンサー|インフルエンサー/infuruensā|người có sức ảnh hưởng
購読する|こうどくする/kōdoku suru|đăng ký theo dõi
ドキュメンタリー|ドキュメンタリー/dokyumentarī|phim tài liệu
記者会見|きしゃかいけん/kishakaiken|họp báo
声明|せいめい/seimei|tuyên bố
特派員|とくはいん/tokuhain|phóng viên thường trú
通信員|つうしんいん/tsūshin'in|phóng viên
雑誌|ざっし/zasshi|tạp chí
チャンネル|チャンネル/channeru|kênh
司会者|しかいしゃ/shikaisha|người dẫn chương trình
批評|ひひょう/hihyō|bài phê bình
非難|ひなん/hinan|lời trách móc
討論|とうろん/tōron|tranh luận
議論する|ぎろんする/giron suru|thảo luận
論拠|ろんきょ/ronkyo|lập luận
立場|たちば/tachiba|lập trường
簡単な報道|かんたんなほうどう/kantan na hōdō|bản tin ngắn
スローガン|スローガン/surōgan|khẩu hiệu
演壇|えんだん/endan|bục phát biểu
扇情的な|せんじょうてきな/senjōteki na|gây giật gân
速報|そくほう/sokuhō|tin nhanh
特集|とくしゅう/tokushū|chuyên đề
論説|ろんせつ/ronsetsu|bài xã luận
信憑|しんぴょう/shinpyō|sự đáng tin
誤報|ごほう/gohō|tin sai
報告|ほうこく/hōkoku|báo cáo
取材|しゅざい/shuzai|thu thập tin` },
    { id: "v3", title: "Kinh doanh và kinh tế", titleEn: "Business and economics", words: `インフレ|インフレ/infure|lạm phát
労働市場|ろうどうしじょう/rōdō shijō|thị trường lao động
景気後退|けいきこうたい/keiki kōtai|suy thoái nhẹ
成長|せいちょう/seichō|tăng trưởng
利益|りえき/rieki|lợi nhuận
損失|そんしつ/sonshitsu|khoản lỗ
売上高|うりあげだか/uriagedaka|doanh thu
経費|けいひ/keihi|khoản chi phí
投資|とうし/tōshi|đầu tư
投資家|とうしか/tōshika|nhà đầu tư
株主|かぶぬし/kabunushi|cổ đông
株式|かぶしき/kabushiki|cổ phiếu
市場シェア|しじょうシェア/shijō shea|thị phần
競争|きょうそう/kyōsō|cạnh tranh
ライバル|ライバル/raibaru|đối thủ cạnh tranh
戦略|せんりゃく/senryaku|chiến lược
交渉する|こうしょうする/kōshō suru|đàm phán
協定|きょうてい/kyōtei|hiệp định
提携|ていけい/teikei|quan hệ đối tác
合併|がっぺい/gappei|sáp nhập
ベンチャー企業|ベンチャーきぎょう/benchā kigyō|công ty khởi nghiệp
起業家|きぎょうか/kigyōka|doanh nhân
支店|してん/shiten|chi nhánh
本社|ほんしゃ/honsha|trụ sở chính
供給|きょうきゅう/kyōkyū|nguồn cung
需要|じゅよう/juyō|nhu cầu
輸入|ゆにゅう/yunyū|nhập khẩu
輸出|ゆしゅつ/yushutsu|xuất khẩu
関税|かんぜい/kanzei|thuế quan
貿易|ぼうえき/bōeki|thương mại
融資|ゆうし/yūshi|khoản vay
住宅ローン|じゅうたくローン/jūtaku rōn|khoản thế chấp
負債|ふさい/fusai|khoản nợ phải trả
信用|しんよう/shin'yō|tín dụng
金利|きんり/kinri|lãi suất
資産|しさん/shisan|tài sản
黒字|くろじ/kuroji|thặng dư
生産性|せいさんせい/seisansei|năng suất
外注する|がいちゅうする/gaichū suru|thuê ngoài
解雇する|かいこする/kaiko suru|sa thải
辞職する|じしょくする/jishoku suru|từ chức
利害関係者|りがいかんけいしゃ/rigai kankeisha|bên liên quan
マーケティング|マーケティング/māketingu|tiếp thị
ブランドロイヤルティ|ブランドロイヤルティ/burando roiyaruti|lòng trung thành thương hiệu
消費者|しょうひしゃ/shōhisha|người tiêu dùng
小売り|こうり/kōri|bán lẻ
卸売り|おろしうり/oroshiuri|bán buôn
減益|げんえき/gen'eki|giảm lợi nhuận
出資|しゅっし/isshi|góp vốn
税率|ぜいりつ/zeiritsu|thuế suất` },
    { id: "v4", title: "Quan hệ và xã hội", titleEn: "Relationships and society", words: `地域社会|ちいきしゃかい/chiiki shakai|cộng đồng
世代|せだい/sedai|thế hệ
性別|せいべつ/seibetsu|giới tính
平等|びょうどう/byōdō|bình đẳng
差別|さべつ/sabetsu|phân biệt đối xử
多様性|たようせい/tayōsei|sự đa dạng
少数派|しょうすうは/shōsūha|thiểu số
多数派|たすうは/tasūha|đa số
文化|ぶんか/bunka|văn hóa
アイデンティティ|アイデンティティ/aidentiti|bản sắc
信念|しんねん/shinnen|niềm tin
宗教|しゅうきょう/shūkyō|tôn giáo
寛容|かんよう/kan'yō|khoan dung
調和|ちょうわ/chōwa|hài hòa
衝突|しょうとつ/shōtotsu|xung đột
協力する|きょうりょくする/kyōryoku suru|hợp tác
ボランティア|ボランティア/borantia|tình nguyện viên
慈善団体|じぜんだんたい/jizen dantai|tổ chức từ thiện
寄付する|きふする/kifu suru|quyên góp
正義|せいぎ/seigi|công lý
犯罪|はんざい/hanzai|tội phạm
罰|ばつ/batsu|hình phạt
暴力|ぼうりょく/bōryoku|bạo lực
貧困|ひんこん/hinkon|nghèo đói
ホームレス|ホームレス/hōmuresu|vô gia cư
農村の|のうそんの/nōson no|thuộc nông thôn
都市の|としの/toshi no|thuộc thành thị
人口|じんこう/jinkō|dân số
移住|いじゅう/ijū|di cư
難民|なんみん/nanmin|người tị nạn
融和|ゆうわ/yūwa|hòa nhập
期待|きたい/kitai|kỳ vọng
忠誠|ちゅうせい/chūsei|sự trung thành
責任感|せきにんかん/sekinin kan|cam kết
おもてなし|おもてなし/omotenashi|lòng hiếu khách
傍観者|ぼうかんしゃ/bōkansha|người đứng ngoài
固定観念|こていかんねん/kotei kannen|định kiến rập khuôn
失望|しつぼう/shitsubō|thất vọng
市民権|しみんけん/shiminken|quyền công dân
合法の|ごうほうの/gōhō no|hợp pháp
社会格差|しゃかいかくさ/shakai kakusa|khoảng cách xã hội
階級|かいきゅう/kaikyū|giai cấp xã hội
民族集団|みんぞくしゅうだん/minzoku shūdan|nhóm dân tộc
慣習|かんしゅう/kanshū|tập quán
宗派|しゅうは/shūha|tông phái
多文化|たぶんか/tabunka|đa văn hóa
不平等|ふびょうどう/fubyōdō|bất bình đẳng
差異|さい/sai|sự khác biệt
連帯|れんたい/rentai|liên đới
孤立|こりつ/koritsu|cô lập` },
  ],
  n1: [
    { id: "v1", title: "Học thuật và nghiên cứu", titleEn: "Academic study and research", words: `理論|りろん/riron|lý thuyết
方法|ほうほう/hōhō|phương pháp
変数|へんすう/hensū|biến số
評価する|ひょうかする/hyōka suru|đánh giá
解釈する|かいしゃくする/kaishaku suru|diễn giải
推論|すいろん/suiron|suy luận
経験的な|けいけんてきな/keikenteki na|dựa trên thực nghiệm
現象|げんしょう/genshō|hiện tượng
パラダイム|パラダイム/paradaimu|mô hình tư duy
枠組み|わくぐみ/wakugumi|khung lý thuyết
要旨|ようし/yōshi|bản tóm tắt
引用|いんよう/in'yō|trích dẫn
参考文献|さんこうぶんけん/sankō bunken|thư mục tài liệu
学術誌|がくじゅつし/gakujutsushi|tạp chí khoa học
学位論文|がくいろんぶん/gakui ronbun|luận đề
精査|せいさ/seisa|sự xem xét kỹ lưỡng
厳密な|げんみつな/genmitsu na|chặt chẽ
体系的な|たいけいてきな/taikeiteki na|có hệ thống
主観的な|しゅかんてきな/shukanteki na|chủ quan
信憑性|しんぴょうせい/shinpyōsei|tính đáng tin
妥当性|だとうせい/datōsei|tính hợp lệ
信頼性|しんらいせい/shinraisei|độ tin cậy
仮定する|かていする/katei suru|đề xuất giả định
導く|みちびく/michibiku|suy ra
演繹する|えんえきする/en'eki suru|suy diễn
帰納する|きのうする/kinō suru|quy nạp
前提|ぜんてい/zentei|tiền đề
想定|そうてい/sōtei|giả định
含意|がんい/gan'i|hệ quả
意義|いぎ/igi|ý nghĩa
異常値|いじょうち/ijōchi|điều bất thường
定量的な|ていりょうてきな/teiryōteki na|định lượng
定性的な|ていせいてきな/teiseiteki na|định tính
統計|とうけい/tōkei|số liệu thống kê
研究倫理|けんきゅうりんり/kenkyū rinri|đạo đức học thuật
探究|たんきゅう/tankyū|sự tìm hiểu
専門分野|せんもんぶんや/senmon bunya|ngành học
学者|がくしゃ/gakusha|học giả
学術の|がくじゅつの/gakujutsu no|thuộc học thuật
詳述する|しょうじゅつする/shōjutsu suru|trình bày chi tiết
立証する|りっしょうする/risshō suru|chứng minh
反証する|はんしょうする/hanshō suru|bác bỏ
裏付ける|うらづける/urazukeru|xác nhận
分類学|ぶんるいがく/bunruigaku|hệ thống phân loại
推測|すいそく/suisoku|phỏng đoán
査読者|さどくしゃ/sadokusha|người bình duyệt
因果関係|いんがかんけい/inga kankei|quan hệ nhân quả
再現する|さいげんする/saigen suru|tái tạo kết quả
標本群|ひょうほんぐん/hyōhongun|nhóm nghiên cứu
対照実験|たいしょうじっけん/taishō jikken|thí nghiệm đối chứng` },
    { id: "v2", title: "Chính trị và xã hội", titleEn: "Politics and society", words: `議会|ぎかい/gikai|quốc hội
選挙|せんきょ/senkyo|cuộc bầu cử
候補者|こうほしゃ/kōhosha|ứng cử viên
投票用紙|とうひょうようし/tōhyō yōshi|lá phiếu
委任|いにん/inin|nhiệm vụ được ủy thác
法令|ほうれい/hōrei|đạo luật
規則|きそく/kisoku|quy định
改革|かいかく/kaikaku|cải cách
憲法|けんぽう/kenpō|hiến pháp
主権|しゅけん/shuken|chủ quyền
外交|がいこう/gaikō|ngoại giao
条約|じょうやく/jōyaku|hiệp ước
同盟|どうめい/dōmei|liên minh
制裁|せいさい/seisai|lệnh trừng phạt
独裁|どくさい/dokusai|chế độ độc tài
民主主義|みんしゅしゅぎ/minshu shugi|nền dân chủ
権威|けんい/ken'i|quyền lực, thẩm quyền
官僚制|かんりょうせい/kanryōsei|bộ máy quan liêu
汚職|おしょく/oshoku|tham nhũng
透明性|とうめいせい/tōmeisei|tính minh bạch
抗議運動|こうぎうんどう/kōgi undō|cuộc biểu tình
反乱|はんらん/hanran|cuộc nổi dậy
革命|かくめい/kakumei|cuộc cách mạng
イデオロギー|イデオロギー/ideorogī|hệ tư tưởng
民族主義|みんぞくしゅぎ/minzoku shugi|chủ nghĩa dân tộc
不公正|ふこうせい/fukōsei|sự bất công
福祉|ふくし/fukushi|phúc lợi
年金|ねんきん/nenkin|lương hưu
補助金|ほじょきん/hojokin|khoản trợ cấp
課税|かぜい/kazei|việc đánh thuế
規制緩和|きせいかんわ/kisei kanwa|sự bãi bỏ quy định
民営化|みんえいか/min'eika|tư nhân hóa
独占|どくせん/dokusen|độc quyền
ロビー活動|ロビーかつどう/robī katsudō|vận động hành lang
宣言書|せんげんしょ/sengensho|tuyên ngôn chính sách
拒否権|きょひけん/kyohiken|quyền phủ quyết
修正|しゅうせい/shūsei|sự sửa đổi
管轄|かんかつ/kankatsu|thẩm quyền pháp lý
判決|はんけつ/hanketsu|phán quyết
控訴|こうそ/kōso|kháng cáo
被告|ひこく/hikoku|bị cáo
起訴|きそ/kiso|việc truy tố
証言|しょうげん/shōgen|lời khai
免責特権|めんせきとっけん/menseki tokken|quyền miễn trừ
国勢調査|こくせいちょうさ/kokusei chōsa|cuộc điều tra dân số
人口統計の|じんこうとうけいの/jinkō tōkei no|thuộc nhân khẩu học
省|しょう/shō|bộ, cơ quan nhà nước
弾劾|だんがい/dangai|sự luận tội
有権者|ゆうけんしゃ/yūkensha|cử tri
国民投票|こくみんとうひょう/kokumin tōhyō|trưng cầu dân ý` },
    { id: "v3", title: "Nghệ thuật và văn hóa", titleEn: "Arts and culture", words: `美学|びがく/bigaku|mỹ học
傑作|けっさく/kessaku|kiệt tác
彫刻|ちょうこく/chōkoku|điêu khắc
建築|けんちく/kenchiku|kiến trúc
バレエ|バレエ/baree|ba-lê
オーケストラ|オーケストラ/ōkesutora|dàn nhạc
交響曲|こうきょうきょく/kōkyōkyoku|bản giao hưởng
作曲家|さっきょくか/sakkyokuka|nhà soạn nhạc
詩歌|しいか/shika|thơ ca
物語|ものがたり/monogatari|tự sự
主人公|しゅじんこう/shujinkō|nhân vật chính
敵役|かたきやく/katakiyaku|nhân vật phản diện
筋|すじ/suji|cốt truyện
テーマ|テーマ/tēma|chủ đề
隠喩|いんゆ/in'yu|ẩn dụ
象徴主義|しょうちょうしゅぎ/shōchō shugi|chủ nghĩa biểu tượng
風刺|ふうし/fūshi|châm biếm
悲劇|ひげき/higeki|bi kịch
喜劇|きげき/kigeki|hài kịch
ジャンル|ジャンル/janru|thể loại
民俗|みんぞく/minzoku|văn hóa dân gian
儀式|ぎしき/gishiki|nghi lễ
式典|しきてん/shikiten|buổi lễ
工芸|こうげい/kōgei|tay nghề thủ công
イメージ|イメージ/imēji|hình ảnh văn chương
リズム|リズム/rizumu|nhịp điệu
メロディー|メロディー/merodī|giai điệu
即興で演じる|そっきょうでえんじる/sokkyō de enjiru|ứng tác
演奏する|えんそうする/ensō suru|biểu diễn
オーディション|オーディション/ōdishon|buổi thử giọng
批評家|ひひょうか/hihyōka|nhà phê bình
後援者|こうえんしゃ/kōensha|người bảo trợ
画廊|がろう/garō|phòng trưng bày
キャンバス|キャンバス/kyanbasu|vải vẽ tranh
顔料|がんりょう/ganryō|bột màu
筆致|ひっち/hitchi|nét cọ
ルネサンス|ルネサンス/runesansu|thời kỳ Phục hưng
バロック|バロック/barokku|phong cách Ba-rốc
印象派|いんしょうは/inshōha|trường phái Ấn tượng
近代主義|きんだいしゅぎ/kindai shugi|chủ nghĩa hiện đại
前衛|ぜんえい/zen'ei|tiên phong
文化的な|ぶんかてきな/bunkateki na|thuộc văn hóa
俗語|ぞくご/zokugo|tiếng lóng
慣用句|かんようく/kan'yōku|thành ngữ
ことわざ|ことわざ/kotowaza|tục ngữ
逸話|いつわ/itsuwa|giai thoại
伝説|でんせつ/densetsu|truyền thuyết
神話|しんわ/shinwa|thần thoại
古代の|こだいの/kodai no|cổ đại
中世の|ちゅうせいの/chūsei no|thời trung cổ` },
    { id: "v4", title: "Lập luận và diễn đạt", titleEn: "Argument and expression", words: `主張する|しゅちょうする/shuchō suru|khẳng định
唱える|となえる/tonaeru|cho rằng
譲歩する|じょうほする/jōho suru|thừa nhận
論争|ろんそう/ronsō|tranh chấp
補強する|ほきょうする/hokyō suru|củng cố
強調する|きょうちょうする/kyōchō suru|nhấn mạnh
際立たせる|きわだたせる/kiwadatae ru|làm nổi bật
例証する|れいしょうする/reishō suru|minh họa
例示する|れいじする/reiji suru|làm ví dụ cho
概略を示す|がいりゃくをしめす/gairyaku o shimesu|phác thảo
要約する|ようやくする/yōyaku suru|tóm tắt
言い換える|いいかえる/iikaeru|diễn đạt lại
あいまいな|あいまいな/aimai na|mơ hồ, khó hiểu
明快な|めいかいな/meikai na|rõ ràng, sáng sủa
一貫した|いっかんした/ikkan shita|mạch lạc
簡潔な|かんけつな/kanketsu na|súc tích
説得力のある|せっとくりょくのある/settokuryoku no aru|có sức thuyết phục
表現力のある|ひょうげんりょくのある/hyōgenryoku no aru|biểu cảm
ニュアンス|ニュアンス/nyuansu|sắc thái
含み|ふくみ/fukumi|hàm ý
字義|じぎ/jigi|nghĩa đen
語調|ごちょう/gochō|giọng điệu
語域|ごいき/goiki|văn phong
専門用語|せんもんようご/senmon yōgo|thuật ngữ chuyên ngành
冗長な|じょうちょうな/jōchō na|dài dòng
簡素な|かんそな/kanso na|cộc lốc
漠然とした|ばくぜんとした/bakuzen to shita|mơ hồ, không rõ
正確な|せいかくな/seikaku na|chính xác
捉えどころのない|とらえどころのない/toraedokoro no nai|khó nắm bắt
深遠な|しんえんな/shin'en na|sâu sắc
表面的な|ひょうめんてきな/hyōmenteki na|hời hợt
ささいな|ささいな/sasai na|tầm thường
鋭い|するどい/surudoi|sắc sảo
綿密な|めんみつな/menmitsu na|tỉ mỉ
避けられない|さけられない/sakerarenai|không thể tránh khỏi
もっともらしい|もっともらしい/mottomorashii|có vẻ hợp lý
疑わしい|うたがわしい/utagawashii|đáng ngờ
表向きの|おもてむきの/omotemuki no|bề ngoài
もろい|もろい/moroi|mong manh
実用的な|じつようてきな/jitsuyōteki na|thực dụng
教条的な|きょうじょうてきな/kyōjōteki na|giáo điều
粘り強い|ねばりづよい/nebari zuyoi|kiên cường
巧みな|たくみな/takumi na|khéo léo
偽善|ぎぜん/gizen|đạo đức giả
葛藤している|かっとうしている/kattō shite iru|mâu thuẫn trong lòng
的確な|てきかくな/tekikaku na|thích đáng
説得的な|せっとくてきな/settokuteki na|thuyết phục
聡明な|そうめいな/sōmei na|tinh tường
実在する|じつざいする/jitsuzai suru|hữu hình
弱める|よわめる/yowameru|làm yếu đi` },
  ],
};
