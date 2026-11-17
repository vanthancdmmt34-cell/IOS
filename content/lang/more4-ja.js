// Batch 6: one more speaking unit per level (x7). Correct option is always first; the app shuffles it.
export default {
  n5: [
    {
      id: "x7",
      title: "Mua sắm",
      titleEn: "Shopping",
      words: "店|みせ/mise|cửa hàng\n値段|ねだん/nedan|giá\nお金|おかね/okane|tiền\n安い|やすい/yasui|rẻ\n高い|たかい/takai|đắt\n買う|かう/kau|mua\nサイズ|さいず/saizu|cỡ\n試着|しちゃく/shichaku|thử đồ",
      grammar: [
        ["これは いくら___か。(Cái này bao nhiêu tiền?)", ["です", "ます", "ではない", "でした"], 0, "いくらですか: bao nhiêu tiền?", "いくらですか: bao nhiêu tiền?"],
        ["その 靴を ___たいです。(Tôi muốn mua đôi giày đó)", ["買い", "買う", "買って", "買った"], 0, "買いたい: muốn mua.", "買いたい: muốn mua."],
        ["これは 高すぎ___。(Cái này quá đắt)", ["ます", "る", "て", "た"], 0, "高すぎます: quá đắt.", "高すぎます: quá đắt."],
        ["店は 銀行の ___ です。(Cửa hàng ở gần ngân hàng)", ["近く", "近い", "近さ", "近に"], 0, "銀行の近く: gần ngân hàng.", "銀行の近く: gần ngân hàng."]
      ],
      sentences: [
        ["これは いくら ですか。", "Cái này bao nhiêu tiền?"],
        ["試着 して も いい ですか。", "Tôi thử được không?"],
        ["これは 高すぎます。", "Cái này quá đắt."],
        ["もっと 大きい サイズ は ありますか。", "Có cỡ lớn hơn không?"],
        ["これを ください。", "Cho tôi cái này."],
        ["もっと 安い のは ありますか。", "Có cái nào rẻ hơn không?"]
      ]
    }
  ],
  n4: [
    {
      id: "x7",
      title: "Ở nhà hàng",
      titleEn: "At a restaurant",
      words: "メニュー|めにゅー/menyuu|thực đơn\n店員|てんいん/tenin|nhân viên\n会計|かいけい/kaikei|thanh toán\n席|せき/seki|chỗ ngồi\nスープ|すーぷ/suupu|súp\n鶏肉|とりにく/toriniku|thịt gà\n水|みず/mizu|nước\nおいしい|おいしい/oishii|ngon",
      grammar: [
        ["メニューを ___ もいいですか。(Tôi xem thực đơn được không?)", ["見て", "見る", "見た", "見ない"], 0, "見てもいいですか: xem được không?", "見てもいいですか: xem được không?"],
        ["スープは ご飯より ___です。(Súp nóng hơn cơm)", ["熱い", "熱く", "熱さ", "熱"], 0, "Aより B: B hơn A.", "Aより B: B hơn A."],
        ["昨日 夕ご飯を ___。(Hôm qua tôi đã ăn tối)", ["食べました", "食べます", "食べる", "食べて"], 0, "ました: thì quá khứ lịch sự.", "ました: thì quá khứ lịch sự."],
        ["お会計を ___。(Cho tôi thanh toán)", ["お願いします", "お願いする", "お願いした", "お願い"], 0, "お願いします: xin làm ơn.", "お願いします: xin làm ơn."]
      ],
      sentences: [
        ["席を 予約 したいです。", "Tôi muốn đặt chỗ."],
        ["メニューを 見せて ください。", "Cho tôi xem thực đơn."],
        ["この 料理は とても おいしいです。", "Món này rất ngon."],
        ["鶏肉の スープを ください。", "Cho tôi món súp gà."],
        ["お会計を お願いします。", "Cho tôi xin thanh toán."],
        ["店員さんが 来ました。", "Nhân viên đã đến rồi."]
      ]
    }
  ],
  n3: [
    {
      id: "x7",
      title: "Đi du lịch",
      titleEn: "Travelling",
      words: "切符|きっぷ/kippu|vé\n空港|くうこう/kuukou|sân bay\nホテル|ほてる/hoteru|khách sạn\n地図|ちず/chizu|bản đồ\n遅れる|おくれる/okureru|trễ\n駅|えき/eki|nhà ga\n予約|よやく/yoyaku|đặt trước\nチェックイン|ちぇっくいん/chekkuin|làm thủ tục",
      grammar: [
        ["去年 ベトナムへ ___。(Năm ngoái tôi đã đi Việt Nam)", ["行きました", "行きます", "行く", "行って"], 0, "行きました: đã đi.", "行きました: đã đi."],
        ["電車が 遅れた ___、タクシーに 乗りました。(Vì tàu trễ nên tôi đi taxi)", ["ので", "のに", "けど", "から"], 0, "ので: vì (lý do).", "ので: vì (lý do)."],
        ["もし 雨が ___、家に いましょう。(Nếu mưa, chúng ta ở nhà)", ["降ったら", "降る", "降った", "降って"], 0, "たら: nếu.", "たら: nếu."],
        ["ホテルは 海の 近くに ___。(Khách sạn ở gần biển)", ["あります", "ありません", "いました", "あった"], 0, "あります: có/ở (vật).", "あります: có/ở (vật)."]
      ],
      sentences: [
        ["東京行きの 切符を 予約 したいです。", "Tôi muốn đặt vé đi Tokyo."],
        ["チェックインは どこ ですか。", "Quầy làm thủ tục ở đâu?"],
        ["飛行機は 九時に 出発 します。", "Máy bay khởi hành lúc chín giờ."],
        ["地図で 教えて いただけますか。", "Bạn có thể chỉ cho tôi trên bản đồ không?"],
        ["ホテルは 駅から 近いです。", "Khách sạn gần nhà ga."],
        ["予約は 私の 名前で しました。", "Tôi đã đặt chỗ dưới tên mình."]
      ]
    }
  ],
  n2: [
    {
      id: "x7",
      title: "Sức khỏe",
      titleEn: "Health",
      words: "頭痛|ずつう/zutsuu|đau đầu\n熱|ねつ/netsu|sốt\n咳|せき/seki|ho\n医者|いしゃ/isha|bác sĩ\n薬|くすり/kusuri|thuốc\n休む|やすむ/yasumu|nghỉ\nアレルギー|あれるぎー/arerugii|dị ứng\n疲れる|つかれる/tsukareru|mệt",
      grammar: [
        ["ずっと 頭痛が ___。(Tôi bị đau đầu suốt)", ["続いて います", "続きます", "続けた", "続けて"], 0, "続いています: kéo dài.", "続いています: kéo dài."],
        ["水を もっと ___ 方が いいです。(Nên uống thêm nước)", ["飲んだ", "飲む", "飲んで", "飲め"], 0, "飲んだ方がいい: nên uống.", "飲んだ方がいい: nên uống."],
        ["最近 とても ___。(Gần đây tôi rất mệt)", ["疲れています", "疲れる", "疲れた", "疲れ"], 0, "疲れています: đang mệt.", "疲れています: đang mệt."],
        ["熱が 高い ___、医者に 行って ください。(Nếu sốt cao, hãy đi khám)", ["なら", "ので", "けれど", "のに"], 0, "なら: nếu.", "なら: nếu."]
      ],
      sentences: [
        ["咳と 熱が あって、つらいです。", "Tôi bị ho và sốt, rất khó chịu."],
        ["この 薬は 食後に 飲んで もいいですか。", "Uống thuốc này sau bữa ăn có được không?"],
        ["私は ピーナッツに アレルギーが あります。", "Tôi bị dị ứng đậu phộng."],
        ["数日 休んだ 方が いいです。", "Bạn nên nghỉ vài ngày."],
        ["最近 いつも 疲れて います。", "Gần đây tôi luôn mệt."],
        ["熱が 下がらない なら、すぐ 病院へ 行って ください。", "Nếu sốt không hạ, hãy đến bệnh viện ngay."]
      ]
    }
  ],
  n1: [
    {
      id: "x7",
      title: "Công việc và họp",
      titleEn: "Work and meetings",
      words: "議題|ぎだい/gidai|chương trình họp\n締め切り|しめきり/shimekiri|hạn chót\n報告書|ほうこくしょ/houkokusho|báo cáo\n予算|よさん/yosan|ngân sách\n同意|どうい/doui|đồng ý\n提案|ていあん/teian|đề xuất\nフォロー|ふぉろー/forou|theo dõi\n日程|にってい/nittei|lịch trình",
      grammar: [
        ["別の 方法を ___ たいと 思います。(Tôi muốn đề xuất phương pháp khác)", ["提案し", "提案する", "提案の", "提案に"], 0, "提案したい: muốn đề xuất.", "提案したい: muốn đề xuất."],
        ["まず 議題を ___。(Trước hết hãy xem chương trình họp)", ["確認しましょう", "確認した", "確認する", "確認しません"], 0, "〜ましょう: hãy cùng.", "〜ましょう: hãy cùng."],
        ["報告書は 金曜日までに ___ 必要が あります。(Báo cáo cần được hoàn thành trước thứ Sáu)", ["完成させる", "完成", "完成して", "完成した"], 0, "完成させる必要: cần làm cho hoàn thành.", "完成させる必要: cần làm cho hoàn thành."],
        ["会議の 後で ___ します。(Sau cuộc họp tôi sẽ theo dõi)", ["フォローアップ", "フォロー", "フォローした", "フォロー中"], 0, "フォローアップします: theo dõi.", "フォローアップします: theo dõi."]
      ],
      sentences: [
        ["まず 議題から 始めましょう。", "Trước hết hãy bắt đầu từ chương trình họp."],
        ["締め切りを 金曜日に 延ばす ことを 提案します。", "Tôi đề xuất lùi hạn chót sang thứ Sáu."],
        ["この プロジェクトの 予算は 十分ですか。", "Ngân sách của dự án này có đủ không?"],
        ["あなたの 意見に 同意します。", "Tôi đồng ý với ý kiến của bạn."],
        ["報告書を 明日までに 送って いただけますか。", "Bạn có thể gửi báo cáo trước ngày mai không?"],
        ["会議の 後で チームに フォローアップ します。", "Sau cuộc họp tôi sẽ theo dõi với nhóm."]
      ]
    }
  ]
};
