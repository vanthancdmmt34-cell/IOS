// Batch 6: one more speaking unit per level (x7). Correct option is always first; the app shuffles it.
export default {
  a1: [
    {
      id: "x7",
      title: "Faire les courses",
      titleEn: "Shopping",
      words: "magasin|cửa hàng\nprix|giá\nargent|tiền\nbon marché|rẻ\ncher|đắt\nacheter|mua\ntaille|cỡ\nessayer|thử",
      grammar: [
        ["Combien ___ ce pull ?", ["coûte", "coûtes", "coûter", "coûtent"], 0, "coûter: giá bao nhiêu (ngôi thứ ba số ít).", "coûter: giá bao nhiêu (ngôi thứ ba số ít)."],
        ["Je ___ acheter une veste.", ["voudrais", "voudrait", "voulez", "veut"], 0, "Je voudrais: tôi muốn (lịch sự).", "Je voudrais: tôi muốn (lịch sự)."],
        ["Ces chaussures sont ___ pour moi.", ["trop grandes", "trop grand", "trop grande de", "très grands de"], 0, "trop + tính từ: quá; giống với danh từ số nhiều.", "trop + tính từ: quá; giống với danh từ số nhiều."],
        ["Le magasin est ___ de la banque.", ["à côté de", "au côté", "côté à", "près à"], 0, "à côté de: bên cạnh.", "à côté de: bên cạnh."]
      ],
      sentences: [
        ["Combien coûte ce pantalon ?", "Cái quần này giá bao nhiêu?"],
        ["Puis-je l'essayer ?", "Tôi thử được không?"],
        ["C'est trop cher.", "Nó quá đắt."],
        ["Avez-vous une taille plus grande ?", "Bạn có cỡ lớn hơn không?"],
        ["Je le prends.", "Tôi lấy cái này."],
        ["Y a-t-il un modèle moins cher ?", "Có mẫu nào rẻ hơn không?"]
      ]
    }
  ],
  a2: [
    {
      id: "x7",
      title: "Au restaurant",
      titleEn: "At a restaurant",
      words: "carte|thực đơn\nserveur|người phục vụ\naddition|hóa đơn\ntable|bàn\nsoupe|súp\npoulet|gà\neau|nước\ndélicieux|ngon",
      grammar: [
        ["Je voudrais ___ la carte, s'il vous plaît.", ["voir", "voit", "vois", "voient"], 0, "voir: xem; sau voudrais là động từ nguyên mẫu.", "voir: xem; sau voudrais là động từ nguyên mẫu."],
        ["La soupe est ___ que le riz.", ["plus chaude", "plus chaud que", "chaude que", "plus chaudement"], 0, "plus + tính từ + que: hơn.", "plus + tính từ + que: hơn."],
        ["Nous ___ le dîner hier soir.", ["avons pris", "prenons", "prendre", "prenez"], 0, "Passé composé: avons pris.", "Passé composé: avons pris."],
        ["Pouvons-nous avoir ___ , s'il vous plaît ?", ["l'addition", "les additions", "l'additionné", "addition la"], 0, "l'addition: hóa đơn.", "l'addition: hóa đơn."]
      ],
      sentences: [
        ["Je peux voir la carte, s'il vous plaît ?", "Cho tôi xem thực đơn được không?"],
        ["Une table pour deux, s'il vous plaît.", "Cho một bàn hai người."],
        ["Le plat est délicieux.", "Món ăn rất ngon."],
        ["Je voudrais la soupe de poulet.", "Tôi muốn món súp gà."],
        ["L'addition, s'il vous plaît.", "Cho tôi xin hóa đơn."],
        ["Le serveur arrive.", "Người phục vụ đang đến."]
      ]
    }
  ],
  b1: [
    {
      id: "x7",
      title: "En voyage",
      titleEn: "Travelling",
      words: "billet|vé\naéroport|sân bay\nhôtel|khách sạn\ncarte|bản đồ\nen retard|muộn\nquai|sân ga\nréservation|đặt chỗ\nenregistrer|làm thủ tục",
      grammar: [
        ["Je ___ à Hué l'année dernière.", ["suis allé", "vais", "allais", "irai"], 0, "Passé composé với être: je suis allé.", "Passé composé với être: je suis allé."],
        ["As-tu ___ ton billet ?", ["réservé", "réserve", "réservant", "réservée"], 0, "avoir + participe passé: réservé.", "avoir + participe passé: réservé."],
        ["Si le train est en retard, nous ___ un taxi.", ["prendrons", "prenons", "prendrions", "pris"], 0, "Si + présent, futur: câu điều kiện thực.", "Si + présent, futur: câu điều kiện thực."],
        ["L'hôtel ___ près de la plage.", ["est", "sont", "être", "étant"], 0, "L'hôtel là số ít nên dùng est.", "L'hôtel là số ít nên dùng est."]
      ],
      sentences: [
        ["Je voudrais réserver un billet pour Hué.", "Tôi muốn đặt vé đi Huế."],
        ["Où se trouve le comptoir d'enregistrement ?", "Quầy làm thủ tục ở đâu?"],
        ["Notre vol part à neuf heures.", "Chuyến bay của chúng tôi khởi hành lúc chín giờ."],
        ["Pouvez-vous me montrer sur la carte ?", "Bạn có thể chỉ cho tôi trên bản đồ không?"],
        ["L'hôtel est près de la gare.", "Khách sạn ở gần nhà ga."],
        ["J'ai une réservation à mon nom.", "Tôi đã đặt chỗ dưới tên mình."]
      ]
    }
  ],
  b2: [
    {
      id: "x7",
      title: "Santé",
      titleEn: "Health",
      words: "mal de tête|đau đầu\nfièvre|sốt\ntoux|ho\nmédecin|bác sĩ\nmédicament|thuốc\nrepos|nghỉ ngơi\nallergie|dị ứng\nfatigué|mệt",
      grammar: [
        ["J'ai ___ depuis hier.", ["mal à la tête", "mal de la tête", "mal au tête", "mal à tête"], 0, "avoir mal à la tête: đau đầu.", "avoir mal à la tête: đau đầu."],
        ["Vous devriez ___ plus d'eau.", ["boire", "boit", "buvez", "bu"], 0, "devoir + động từ nguyên mẫu.", "devoir + động từ nguyên mẫu."],
        ["Je suis ___ depuis trois jours.", ["malade", "malades", "maladie", "malader"], 0, "être + tính từ: malade (ốm).", "être + tính từ: malade (ốm)."],
        ["Si vous vous sentez plus mal, ___ un médecin.", ["consultez", "consultes", "consulter", "consultent"], 0, "Câu mệnh lệnh ở ngôi vous.", "Câu mệnh lệnh ở ngôi vous."]
      ],
      sentences: [
        ["J'ai une mauvaise toux et de la fièvre.", "Tôi bị ho nặng và sốt."],
        ["Dois-je prendre ce médicament après les repas ?", "Tôi có nên uống thuốc này sau bữa ăn không?"],
        ["Je suis allergique aux arachides.", "Tôi bị dị ứng đậu phộng."],
        ["Vous devez vous reposer quelques jours.", "Bạn cần nghỉ ngơi vài ngày."],
        ["Je me sens fatigué ces derniers temps.", "Gần đây tôi thấy mệt."],
        ["Appelez-moi si la fièvre augmente.", "Hãy gọi cho tôi nếu cơn sốt tăng."]
      ]
    }
  ],
  c1: [
    {
      id: "x7",
      title: "Travail et réunions",
      titleEn: "Work and meetings",
      words: "ordre du jour|chương trình họp\néchéance|hạn chót\nrapport|báo cáo\nbudget|ngân sách\nêtre d'accord|đồng ý\nproposer|đề xuất\nsuivre|theo dõi\nplanning|lịch trình",
      grammar: [
        ["Je ___ proposer une autre méthode.", ["voudrais", "voudrait", "voulons", "veut"], 0, "Je voudrais proposer: tôi muốn đề xuất.", "Je voudrais proposer: tôi muốn đề xuất."],
        ["Commençons par ___ l'ordre du jour.", ["examiner", "examine", "examiné", "examinons"], 0, "commencer par + động từ nguyên mẫu.", "commencer par + động từ nguyên mẫu."],
        ["Le rapport ___ être terminé d'ici vendredi.", ["doit", "doivent", "devons", "dois"], 0, "Le rapport là số ít nên dùng doit.", "Le rapport là số ít nên dùng doit."],
        ["Je ___ l'équipe après la réunion.", ["recontacterai", "recontacte", "recontacter", "recontacté"], 0, "Thì tương lai: je recontacterai.", "Thì tương lai: je recontacterai."]
      ],
      sentences: [
        ["Commençons par l'ordre du jour.", "Hãy bắt đầu bằng chương trình họp."],
        ["Je propose de repousser l'échéance à vendredi.", "Tôi đề xuất dời hạn chót sang thứ Sáu."],
        ["Avons-nous assez de budget pour ce projet ?", "Chúng ta có đủ ngân sách cho dự án này không?"],
        ["Je suis d'accord avec votre point de vue.", "Tôi đồng ý với quan điểm của bạn."],
        ["Pouvez-vous m'envoyer le rapport demain ?", "Bạn có thể gửi cho tôi báo cáo vào ngày mai không?"],
        ["Je recontacterai l'équipe après la réunion.", "Tôi sẽ liên hệ lại với nhóm sau cuộc họp."]
      ]
    }
  ]
};
