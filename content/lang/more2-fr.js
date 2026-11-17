// Batch 4 expansion — DELF (units x3, x4 per level).
export default {
  a1: [
    { id: "x3", title: "Cơ thể và sức khỏe", titleEn: "Body and health",
      words: `tête|đầu
main|bàn tay
ventre|bụng
dos|lưng
fatigué|mệt
santé|sức khỏe
hôpital|bệnh viện
dent|răng`,
      grammar: [
        ["J'ai mal ___ ventre. (Tôi đau bụng)", ["au", "à la", "aux", "de"], 0, "à + le ventre = au ventre.", "à + le ventre = au ventre."],
        ["Elle ___ fatiguée aujourd'hui. (Hôm nay cô ấy mệt)", ["est", "a", "es", "ai"], 0, "être + tính từ (hợp giống cái).", "être + adjective (feminine agreement)."],
        ["J'ai mal ___ dents. (Tôi đau răng)", ["aux", "au", "à la", "à les"], 0, "à + les = aux.", "à + les = aux."],
        ["Tu vas ___ hôpital ? (Bạn đi bệnh viện à?)", ["à l'", "au", "à la", "en"], 0, "Trước nguyên âm/h câm: à l'.", "Before a vowel or mute h: à l'."],
      ],
      sentences: [["J'ai mal au ventre", "Tôi bị đau bụng."], ["Elle est très fatiguée", "Cô ấy rất mệt."], ["Je vais à l'hôpital", "Tôi đi bệnh viện."]] },
    { id: "x4", title: "Thời tiết và mùa", titleEn: "Weather and seasons",
      words: `printemps|mùa xuân
été|mùa hè
automne|mùa thu
hiver|mùa đông
chaud|nóng
neige|tuyết
nuage|mây
vent|gió`,
      grammar: [
        ["Il fait ___ en été. (Mùa hè trời nóng)", ["chaud", "chaude", "chaleur", "du chaud"], 0, "il fait + tính từ: thời tiết.", "il fait + adjective: weather."],
        ["___ hiver, il neige. (Vào mùa đông tuyết rơi)", ["En", "Au", "À", "Dans"], 0, "en été / en automne / en hiver.", "en été / en automne / en hiver."],
        ["___ printemps, les fleurs sortent. (Vào mùa xuân hoa nở)", ["Au", "En", "À", "Le"], 0, "Ngoại lệ: au printemps.", "Exception: au printemps."],
        ["Il y a ___ vent aujourd'hui. (Hôm nay có gió)", ["du", "de la", "des", "un des"], 0, "il y a du vent.", "il y a du vent."],
      ],
      sentences: [["Il fait chaud en été", "Mùa hè trời nóng."], ["En hiver il neige", "Vào mùa đông tuyết rơi."], ["Il y a du vent aujourd'hui", "Hôm nay có gió."]] },
  ],
  a2: [
    { id: "x3", title: "Công việc và nghề nghiệp", titleEn: "Jobs and professions",
      words: `métier|nghề
bureau|văn phòng
collègue|đồng nghiệp
patron|ông chủ
infirmier|y tá (nam)
cuisinier|đầu bếp
horaires|giờ làm việc
salaire|lương`,
      grammar: [
        ["Il travaille ___ cuisinier. (Anh ấy làm đầu bếp)", ["comme", "que", "pour", "en tant"], 0, "travailler comme + nghề.", "travailler comme + job."],
        ["Je travaille ici ___ trois ans. (Tôi làm ở đây đã 3 năm)", ["depuis", "pendant", "il y a", "dans"], 0, "depuis: từ… đến nay.", "depuis: since / for (ongoing)."],
        ["Mes horaires sont ___ 9 h à 17 h. (Giờ làm của tôi từ 9h đến 17h)", ["de", "du", "entre", "par"], 0, "de… à…: từ… đến…", "de… à…: from… to…"],
        ["Elle est ___ infirmière. (Cô ấy là y tá)", ["—", "une", "la", "de"], 0, "Sau être, nghề nghiệp không cần mạo từ.", "After être, professions take no article."],
      ],
      sentences: [["Il travaille comme cuisinier", "Anh ấy làm đầu bếp."], ["Je travaille ici depuis trois ans", "Tôi làm việc ở đây đã ba năm."], ["Elle est infirmière", "Cô ấy là y tá."]] },
    { id: "x4", title: "Lễ hội và ngày nghỉ", titleEn: "Festivals and holidays",
      words: `Noël|lễ Giáng sinh
fête nationale|quốc khánh
feu d'artifice|pháo hoa
cadeau|quà
célébrer|kỷ niệm, ăn mừng
tradition|truyền thống
défilé|cuộc diễu hành
nouvel an|năm mới`,
      grammar: [
        ["À Noël, nous ___ des cadeaux. (Giáng sinh chúng tôi tặng quà nhau)", ["offrons", "offrez", "offre", "offrent"], 0, "offrir với nous: offrons.", "offrir with nous: offrons."],
        ["Le 14 juillet, il y a un ___ à Paris. (Ngày 14/7 có diễu hành ở Paris)", ["défilé", "cadeau", "Noël", "nouvel an"], 0, "défilé = cuộc diễu hành.", "défilé = parade."],
        ["Bonne année et ___ santé ! (Chúc mừng năm mới và sức khỏe!)", ["bonne", "bon", "bien", "bons"], 0, "santé giống cái → bonne.", "santé is feminine → bonne."],
        ["L'année dernière, nous ___ le nouvel an à Lyon. (Năm ngoái chúng tôi đón năm mới ở Lyon)", ["avons fêté", "sommes fêtés", "fêtions", "fêterons"], 0, "Passé composé với avoir.", "Passé composé with avoir."],
      ],
      sentences: [["À Noël nous offrons des cadeaux", "Vào Giáng sinh chúng tôi tặng quà nhau."], ["Bonne année et bonne santé", "Chúc mừng năm mới và sức khỏe."], ["Nous avons regardé le feu d'artifice", "Chúng tôi đã xem pháo hoa."]] },
  ],
  b1: [
    { id: "x3", title: "Nhà ở và hàng xóm", titleEn: "Housing and neighbours",
      words: `voisin|hàng xóm
propriétaire|chủ nhà
locataire|người thuê nhà
bruit|tiếng ồn
déménager|chuyển nhà
immeuble|tòa nhà
chauffage|hệ thống sưởi
se plaindre|phàn nàn`,
      grammar: [
        ["Les voisins font du bruit ___ minuit. (Hàng xóm làm ồn đến tận nửa đêm)", ["jusqu'à", "depuis", "pendant que", "dès"], 0, "jusqu'à: cho đến.", "jusqu'à: until."],
        ["Je me suis plaint ___ propriétaire. (Tôi đã phàn nàn với chủ nhà)", ["au", "le", "du", "par le"], 0, "se plaindre à qqn: phàn nàn với ai.", "se plaindre à qqn: complain to someone."],
        ["Nous ___ le mois prochain. (Tháng sau chúng tôi chuyển nhà)", ["déménageons", "déménagez", "déménagent", "déménage"], 0, "Hiện tại dùng cho tương lai gần chắc chắn.", "Present tense for a planned near future."],
        ["Le chauffage ne marche plus ___ hier. (Hệ thống sưởi hỏng từ hôm qua)", ["depuis", "pendant", "il y a", "pour"], 0, "depuis + mốc thời gian.", "depuis + point in time."],
      ],
      sentences: [["Les voisins font du bruit jusqu'à minuit", "Hàng xóm làm ồn đến tận nửa đêm."], ["Nous déménageons le mois prochain", "Tháng sau chúng tôi chuyển nhà."], ["Le chauffage ne marche plus depuis hier", "Hệ thống sưởi hỏng từ hôm qua."]] },
    { id: "x4", title: "Môi trường hằng ngày", titleEn: "Everyday environment",
      words: `recycler|tái chế
déchets|rác thải
gaspiller|lãng phí
économiser|tiết kiệm
plastique|nhựa
transport en commun|giao thông công cộng
énergie|năng lượng
planète|hành tinh`,
      grammar: [
        ["Il faut ___ les déchets. (Phải tái chế rác thải)", ["recycler", "recycle", "recyclé", "recyclant"], 0, "il faut + động từ nguyên mẫu.", "il faut + infinitive."],
        ["J'essaie de ne pas ___ l'eau. (Tôi cố gắng không lãng phí nước)", ["gaspiller", "gaspille", "gaspillé", "gaspillant"], 0, "ne pas đứng trước động từ nguyên mẫu.", "ne pas goes before an infinitive."],
        ["Si tout le monde prenait les transports en commun, il y ___ moins de pollution. (Nếu ai cũng đi phương tiện công cộng thì ít ô nhiễm hơn)", ["aurait", "a", "aura", "avait"], 0, "Si + imparfait, conditionnel.", "Si + imparfait, conditional."],
        ["On peut économiser de l'énergie ___ éteignant la lumière. (Có thể tiết kiệm năng lượng bằng cách tắt đèn)", ["en", "par", "pour", "à"], 0, "en + V-ant: bằng cách.", "en + present participle: by doing."],
      ],
      sentences: [["Il faut recycler les déchets", "Cần phải tái chế rác thải."], ["J'essaie de ne pas gaspiller l'eau", "Tôi cố gắng không lãng phí nước."], ["On peut économiser de l'énergie en éteignant la lumière", "Có thể tiết kiệm năng lượng bằng cách tắt đèn."]] },
  ],
  b2: [
    { id: "x3", title: "Sức khỏe cộng đồng", titleEn: "Public health",
      words: `prévention|phòng ngừa
vaccin|vắc-xin
épidémie|dịch bệnh
sédentarité|lối sống ít vận động
dépistage|tầm soát
système de santé|hệ thống y tế
alimentation|chế độ ăn
obésité|béo phì`,
      grammar: [
        ["___ prévention, on pourrait éviter de nombreuses maladies. (Nhờ phòng ngừa, có thể tránh nhiều bệnh)", ["Grâce à la", "À cause de la", "Malgré la", "Faute de la"], 0, "grâce à: nhờ.", "grâce à: thanks to."],
        ["Il est indispensable que chacun ___ vacciné. (Mọi người cần được tiêm vắc-xin)", ["soit", "est", "sera", "serait"], 0, "Il est indispensable que + subjonctif.", "Il est indispensable que + subjunctive."],
        ["La sédentarité, ___ touche beaucoup de jeunes, augmente les risques. (Lối sống ít vận động, vốn ảnh hưởng nhiều người trẻ, làm tăng rủi ro)", ["qui", "que", "dont", "où"], 0, "qui làm chủ ngữ trong mệnh đề quan hệ.", "qui is the subject in a relative clause."],
        ["L'obésité progresse, ___ les campagnes de sensibilisation. (Béo phì tăng, bất chấp các chiến dịch nâng cao nhận thức)", ["malgré", "grâce à", "afin de", "quant à"], 0, "malgré + danh từ: bất chấp.", "malgré + noun: despite."],
      ],
      sentences: [["Grâce à la prévention on évite de nombreuses maladies", "Nhờ phòng ngừa mà tránh được nhiều bệnh."], ["Il est indispensable que chacun soit vacciné", "Điều cần thiết là mọi người đều được tiêm vắc-xin."], ["Une alimentation équilibrée protège la santé", "Chế độ ăn cân bằng bảo vệ sức khỏe."]] },
    { id: "x4", title: "Du lịch có trách nhiệm", titleEn: "Responsible tourism",
      words: `tourisme de masse|du lịch đại chúng
écotourisme|du lịch sinh thái
patrimoine naturel|di sản thiên nhiên
population locale|người dân địa phương
empreinte carbone|dấu chân các-bon
surfréquentation|quá tải du khách
respectueux|tôn trọng
dégradation|sự xuống cấp`,
      grammar: [
        ["Le tourisme de masse entraîne la ___ des sites. (Du lịch đại chúng làm xuống cấp các điểm đến)", ["dégradation", "dégrader", "dégradé", "dégradant"], 0, "entraîner + danh từ: dẫn đến.", "entraîner + noun: lead to."],
        ["Il vaudrait mieux que les touristes ___ plus respectueux. (Tốt hơn là du khách tôn trọng hơn)", ["soient", "sont", "seront", "étaient"], 0, "Il vaudrait mieux que + subjonctif.", "Il vaudrait mieux que + subjunctive."],
        ["___ réduire son empreinte carbone, on peut voyager en train. (Để giảm dấu chân các-bon, có thể đi tàu)", ["Pour", "Par", "Afin que", "Bien que"], 0, "pour + nguyên mẫu: để.", "pour + infinitive: in order to."],
        ["La surfréquentation pose problème, ___ dans les petites villes. (Quá tải du khách là vấn đề, nhất là ở các thị trấn nhỏ)", ["notamment", "cependant", "pourtant", "toutefois"], 0, "notamment: đặc biệt là.", "notamment: especially."],
      ],
      sentences: [["Le tourisme de masse entraîne la dégradation des sites", "Du lịch đại chúng gây xuống cấp các điểm đến."], ["Pour réduire son empreinte carbone on peut voyager en train", "Để giảm dấu chân các-bon có thể đi bằng tàu."], ["Il faut respecter la population locale", "Cần tôn trọng người dân địa phương."]] },
  ],
  c1: [
    { id: "x3", title: "Ngôn ngữ và bản sắc", titleEn: "Language and identity",
      words: `identité|bản sắc
plurilinguisme|đa ngôn ngữ
francophonie|cộng đồng Pháp ngữ
appartenance|sự thuộc về
dialecte|phương ngữ
mondialisation|toàn cầu hóa
uniformisation|sự đồng nhất hóa
diversité|sự đa dạng`,
      grammar: [
        ["___ la mondialisation, les langues minoritaires sont menacées. (Trước làn sóng toàn cầu hóa, các ngôn ngữ thiểu số bị đe dọa)", ["Face à", "Grâce à", "Loin de", "Au lieu de"], 0, "face à: đối mặt với.", "face à: faced with."],
        ["Une langue ne disparaît pas sans ___ une part de culture disparaisse avec elle. (Ngôn ngữ biến mất thì một phần văn hóa cũng mất theo)", ["qu'", "que de", "dont", "lequel"], 0, "sans que + subjonctif.", "sans que + subjunctive."],
        ["La diversité linguistique, ___ on parle tant, mérite d'être protégée. (Sự đa dạng ngôn ngữ, điều người ta bàn nhiều, đáng được bảo vệ)", ["dont", "que", "où", "laquelle"], 0, "parler de → dont.", "parler de → dont."],
        ["___ l'uniformisation culturelle progresse, le sentiment d'appartenance s'affaiblit. (Đồng nhất văn hóa càng tăng, cảm giác thuộc về càng yếu)", ["Plus", "Tant", "Autant", "Si"], 0, "Plus…, plus/moins…: càng… càng…", "Plus…, plus/moins…: the more…"],
      ],
      sentences: [["Face à la mondialisation les langues minoritaires sont menacées", "Trước toàn cầu hóa, các ngôn ngữ thiểu số bị đe dọa."], ["La diversité linguistique mérite d'être protégée", "Sự đa dạng ngôn ngữ đáng được bảo vệ."], ["La langue est au cœur de notre identité", "Ngôn ngữ là cốt lõi bản sắc của chúng ta."]] },
    { id: "x4", title: "Lao động và tương lai", titleEn: "Work and the future",
      words: `télétravail|làm việc từ xa
précarité|sự bấp bênh
reconversion|chuyển đổi nghề
épanouissement|sự phát triển bản thân
automatisation|tự động hóa
compétences transversales|kỹ năng mềm
équilibre|sự cân bằng
flexibilité|tính linh hoạt`,
      grammar: [
        ["___ l'automatisation, certains métiers vont disparaître. (Do tự động hóa, một số nghề sẽ biến mất)", ["Sous l'effet de", "En dépit de", "À l'instar de", "Au lieu de"], 0, "sous l'effet de: dưới tác động của.", "sous l'effet de: under the effect of."],
        ["Le télétravail offre de la flexibilité, ___ il peut isoler les salariés. (Làm từ xa linh hoạt, tuy nhiên có thể cô lập người lao động)", ["encore que", "parce que", "puisque", "de sorte que"], 0, "encore que + (subjonctif): mặc dù, tuy vậy.", "encore que: although, mind you."],
        ["Bien qu'elle ___ la sécurité, elle a choisi une reconversion. (Dù có công việc ổn định, cô ấy chọn chuyển nghề)", ["ait", "a", "avait", "aura"], 0, "Bien que + subjonctif.", "Bien que + subjunctive."],
        ["Il s'agit de trouver un ___ entre vie professionnelle et vie privée. (Vấn đề là tìm sự cân bằng giữa công việc và đời tư)", ["équilibre", "équilibré", "équilibrer", "équilibrant"], 0, "il s'agit de + danh từ/nguyên mẫu: vấn đề là.", "il s'agit de: it is a matter of."],
      ],
      sentences: [["Sous l'effet de l'automatisation certains métiers vont disparaître", "Dưới tác động của tự động hóa, một số nghề sẽ biến mất."], ["Il s'agit de trouver un équilibre entre travail et vie privée", "Vấn đề là tìm sự cân bằng giữa công việc và đời tư."], ["La reconversion demande du courage", "Chuyển đổi nghề đòi hỏi lòng can đảm."]] },
  ],
};
