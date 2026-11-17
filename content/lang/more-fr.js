// Batch 3 expansion — DELF (2 units/level).
export default {
  a1: [
    { id: "x1", title: "Màu sắc và quần áo", titleEn: "Colours and clothes",
      words: `rouge|màu đỏ
bleu|màu xanh dương
blanc|màu trắng
noir|màu đen
chemise|áo sơ mi
pantalon|quần dài
chaussures|giày
robe|váy liền`,
      grammar: [
        ["J'aime la robe ___. (Tôi thích chiếc váy màu đỏ)", ["rouge", "rouges", "rougee", "en rouge"], 0, "Tính từ màu thường đứng sau danh từ; rouge giữ nguyên ở giống cái.", "Colour adjectives usually follow the noun; rouge is the same in the feminine."],
        ["Il porte une chemise ___. (Anh ấy mặc áo sơ mi trắng)", ["blanche", "blanc", "blancs", "blanches"], 0, "blanc → blanche (giống cái).", "blanc → blanche (feminine)."],
        ["Ces chaussures sont ___. (Đôi giày này màu đen)", ["noires", "noir", "noire", "noirs"], 0, "Hợp giống cái số nhiều: noires.", "Feminine plural agreement: noires."],
        ["___ est ton pantalon ? (Quần của bạn màu gì?)", ["De quelle couleur", "Quelle", "Comment", "Combien"], 0, "De quelle couleur… ? = màu gì?", "De quelle couleur… ? = what colour?"],
      ],
      sentences: [["J'aime la robe rouge", "Tôi thích chiếc váy đỏ."], ["Il porte une chemise blanche", "Anh ấy mặc áo sơ mi trắng."], ["De quelle couleur est ton pantalon", "Quần của bạn màu gì?"]] },
    { id: "x2", title: "Sở thích và thời gian rảnh", titleEn: "Hobbies and free time",
      words: `lire|đọc
nager|bơi
danser|nhảy
chanter|hát
musique|âm nhạc
sport|thể thao
cinéma|rạp chiếu phim
week-end|cuối tuần`,
      grammar: [
        ["J'aime ___ des livres. (Tôi thích đọc sách)", ["lire", "lis", "lit", "lisant"], 0, "aimer + động từ nguyên mẫu.", "aimer + infinitive."],
        ["Le week-end, je vais ___ cinéma. (Cuối tuần tôi đi xem phim)", ["au", "à la", "à le", "en"], 0, "à + le = au.", "à + le = au."],
        ["Tu fais ___ sport ? (Bạn có chơi thể thao không?)", ["du", "de la", "des", "le"], 0, "faire du + môn thể thao (giống đực).", "faire du + sport (masculine)."],
        ["Elle ___ très bien. (Cô ấy hát rất hay)", ["chante", "chanter", "chantes", "chantons"], 0, "Động từ -er với il/elle: -e.", "-er verbs with il/elle end in -e."],
      ],
      sentences: [["J'aime lire des livres", "Tôi thích đọc sách."], ["Le week-end je vais au cinéma", "Cuối tuần tôi đi xem phim."], ["Elle chante très bien", "Cô ấy hát rất hay."]] },
  ],
  a2: [
    { id: "x1", title: "Công việc nhà và thói quen", titleEn: "Housework and routines",
      words: `ménage|việc nhà
cuisine|nấu ăn, nhà bếp
laver|rửa, giặt
ranger|dọn dẹp, sắp xếp
se lever|thức dậy
se coucher|đi ngủ
d'habitude|thường thì
parfois|thỉnh thoảng`,
      grammar: [
        ["Je ___ lève à six heures. (Tôi dậy lúc 6 giờ)", ["me", "se", "te", "nous"], 0, "Động từ phản thân với je: me.", "Reflexive verb with je: me."],
        ["D'habitude, nous ___ la vaisselle après le dîner. (Thường chúng tôi rửa bát sau bữa tối)", ["faisons", "faites", "font", "fais"], 0, "faire với nous: faisons.", "faire with nous: faisons."],
        ["Hier, elle ___ couchée tard. (Hôm qua cô ấy đi ngủ muộn)", ["s'est", "a", "se", "est"], 0, "Động từ phản thân dùng être ở passé composé.", "Reflexive verbs use être in the passé composé."],
        ["Range ta chambre, ___ ! (Dọn phòng đi, làm ơn!)", ["s'il te plaît", "s'il vous plaît", "merci", "de rien"], 0, "s'il te plaît: làm ơn (thân mật).", "s'il te plaît: please (informal)."],
      ],
      sentences: [["Je me lève à six heures", "Tôi thức dậy lúc sáu giờ."], ["Nous faisons le ménage le samedi", "Chúng tôi làm việc nhà vào thứ Bảy."], ["Elle s'est couchée tard hier", "Hôm qua cô ấy đi ngủ muộn."]] },
    { id: "x2", title: "Điện thoại và hẹn gặp", titleEn: "Phone calls and appointments",
      words: `rendez-vous|cuộc hẹn
appeler|gọi điện
rappeler|gọi lại
libre|rảnh
occupé|bận
annuler|hủy
message|tin nhắn
disponible|có thể (gặp), sẵn sàng`,
      grammar: [
        ["Est-ce que tu es ___ demain ? (Mai bạn rảnh không?)", ["libre", "libres", "liberté", "librement"], 0, "être libre: rảnh.", "être libre: be free."],
        ["Je ___ rappellerai ce soir. (Tối nay tôi sẽ gọi lại cho bạn)", ["te", "toi", "tu", "ton"], 0, "Đại từ tân ngữ te đứng trước động từ.", "The object pronoun te goes before the verb."],
        ["Je dois ___ notre rendez-vous. (Tôi phải hủy cuộc hẹn của chúng ta)", ["annuler", "annule", "annulé", "annulant"], 0, "devoir + động từ nguyên mẫu.", "devoir + infinitive."],
        ["On se voit ___ trois heures ? (Gặp nhau lúc 3 giờ nhé?)", ["à", "en", "dans", "pour"], 0, "à + giờ.", "à + time."],
      ],
      sentences: [["Est-ce que tu es libre demain", "Mai bạn có rảnh không?"], ["Je te rappellerai ce soir", "Tối nay tôi sẽ gọi lại cho bạn."], ["On se voit à trois heures", "Gặp nhau lúc ba giờ nhé."]] },
  ],
  b1: [
    { id: "x1", title: "Du lịch và khách sạn", titleEn: "Travel and hotels",
      words: `réserver|đặt trước
chambre|phòng
séjour|kỳ lưu trú
valise|vali
accueil|lễ tân
réclamation|khiếu nại
inclus|bao gồm
annulation|sự hủy`,
      grammar: [
        ["J'aimerais réserver une chambre ___ deux nuits. (Tôi muốn đặt phòng hai đêm)", ["pour", "pendant que", "depuis", "il y a"], 0, "pour + khoảng thời gian dự kiến.", "pour + intended duration."],
        ["Le petit-déjeuner est-il ___ ? (Bữa sáng có bao gồm không?)", ["inclus", "incluse", "inclue", "incluant"], 0, "petit-déjeuner giống đực → inclus.", "petit-déjeuner is masculine → inclus."],
        ["Si j'avais su, j'___ une autre chambre. (Nếu biết trước, tôi đã chọn phòng khác)", ["aurais choisi", "ai choisi", "avais choisi", "choisirais"], 0, "Si + plus-que-parfait, conditionnel passé.", "Si + pluperfect, past conditional."],
        ["Je voudrais faire une ___ concernant le bruit. (Tôi muốn khiếu nại về tiếng ồn)", ["réclamation", "réservation", "annulation", "valise"], 0, "faire une réclamation: khiếu nại.", "faire une réclamation: make a complaint."],
      ],
      sentences: [["J'aimerais réserver une chambre pour deux nuits", "Tôi muốn đặt một phòng cho hai đêm."], ["Le petit-déjeuner est inclus", "Bữa sáng đã bao gồm."], ["Je voudrais faire une réclamation", "Tôi muốn khiếu nại."]] },
    { id: "x2", title: "Sức khỏe và thể thao", titleEn: "Health and sport",
      words: `en forme|khỏe khoắn
s'entraîner|tập luyện
blessure|chấn thương
régime|chế độ ăn
équilibré|cân bằng
sommeil|giấc ngủ
courir|chạy
se sentir|cảm thấy`,
      grammar: [
        ["Depuis que je cours, je ___ sens mieux. (Từ khi chạy bộ tôi thấy khỏe hơn)", ["me", "se", "te", "le"], 0, "se sentir với je: je me sens.", "se sentir with je: je me sens."],
        ["Pour rester en forme, il faut ___ régulièrement. (Để khỏe phải tập đều đặn)", ["s'entraîner", "s'entraîne", "entraîné", "s'entraînant"], 0, "il faut + động từ nguyên mẫu.", "il faut + infinitive."],
        ["Il s'est blessé ___ courant. (Anh ấy bị thương khi đang chạy)", ["en", "à", "par", "pour"], 0, "en + V-ant (gérondif): trong khi.", "en + present participle (gerund): while."],
        ["Un régime ___ est important. (Chế độ ăn cân bằng là quan trọng)", ["équilibré", "équilibrée", "équilibrer", "équilibrant"], 0, "régime giống đực → équilibré.", "régime is masculine → équilibré."],
      ],
      sentences: [["Depuis que je cours je me sens mieux", "Từ khi chạy bộ tôi cảm thấy khỏe hơn."], ["Il s'est blessé en courant", "Anh ấy bị thương khi đang chạy."], ["Le sommeil est essentiel pour la santé", "Giấc ngủ rất cần cho sức khỏe."]] },
  ],
  b2: [
    { id: "x1", title: "Kinh tế và tiêu dùng", titleEn: "Economy and consumption",
      words: `consommation|tiêu dùng
pouvoir d'achat|sức mua
inflation|lạm phát
crise|khủng hoảng
croissance|tăng trưởng
entreprise|doanh nghiệp
concurrence|cạnh tranh
dépense|chi tiêu`,
      grammar: [
        ["___ l'inflation, le pouvoir d'achat baisse. (Do lạm phát, sức mua giảm)", ["À cause de", "Grâce à", "Malgré", "Afin de"], 0, "à cause de: do (nghĩa tiêu cực).", "à cause de: because of (negative)."],
        ["Il est possible que la croissance ___ l'an prochain. (Có thể tăng trưởng sẽ chậm lại năm tới)", ["ralentisse", "ralentit", "ralentira", "ralentir"], 0, "Il est possible que + subjonctif.", "Il est possible que + subjunctive."],
        ["Les dépenses ont augmenté ___ 10 %. (Chi tiêu đã tăng 10%)", ["de", "à", "par", "avec"], 0, "augmenter de + mức tăng.", "augmenter de + amount."],
        ["La concurrence oblige les entreprises ___ innover. (Cạnh tranh buộc doanh nghiệp đổi mới)", ["à", "de", "pour", "en"], 0, "obliger qqn à + nguyên mẫu.", "obliger qqn à + infinitive."],
      ],
      sentences: [["À cause de l'inflation le pouvoir d'achat baisse", "Do lạm phát, sức mua giảm."], ["La concurrence oblige les entreprises à innover", "Cạnh tranh buộc doanh nghiệp phải đổi mới."], ["Les dépenses ont augmenté de dix pour cent", "Chi tiêu đã tăng mười phần trăm."]] },
    { id: "x2", title: "Nghệ thuật và văn hóa", titleEn: "Arts and culture",
      words: `exposition|triển lãm
œuvre|tác phẩm
chef-d'œuvre|kiệt tác
peintre|họa sĩ
spectacle|buổi biểu diễn
critique|nhà phê bình, lời phê bình
émouvant|cảm động
patrimoine|di sản`,
      grammar: [
        ["C'est l'œuvre ___ je préfère. (Đây là tác phẩm tôi thích nhất)", ["que", "qui", "dont", "où"], 0, "que thay cho tân ngữ.", "que replaces the object."],
        ["Le peintre ___ on parle beaucoup expose à Paris. (Họa sĩ được nói đến nhiều đang triển lãm ở Paris)", ["dont", "que", "qui", "lequel"], 0, "parler de → dont.", "parler de → dont."],
        ["Ce spectacle était ___ émouvant que j'ai pleuré. (Buổi diễn cảm động đến mức tôi khóc)", ["si", "très", "trop", "tant"], 0, "si + tính từ + que: đến mức mà.", "si + adjective + que: so… that."],
        ["Il faut protéger le patrimoine ___ qu'il disparaisse. (Phải bảo vệ di sản trước khi nó biến mất)", ["avant", "après", "pendant", "sans"], 0, "avant que + subjonctif.", "avant que + subjunctive."],
      ],
      sentences: [["C'est l'œuvre que je préfère", "Đây là tác phẩm tôi thích nhất."], ["Ce spectacle était si émouvant que j'ai pleuré", "Buổi diễn cảm động đến mức tôi đã khóc."], ["Il faut protéger le patrimoine", "Cần bảo vệ di sản."]] },
  ],
  c1: [
    { id: "x1", title: "Chính trị và công dân", titleEn: "Politics and citizenship",
      words: `citoyen|công dân
démocratie|dân chủ
engagement|sự dấn thân, cam kết
débat|cuộc tranh luận
légitime|chính đáng
réforme|cải cách
abstention|sự bỏ phiếu trắng, không đi bầu
enjeu|vấn đề then chốt`,
      grammar: [
        ["___ que soit son avis, il doit respecter la loi. (Dù ý kiến thế nào, anh ta phải tôn trọng luật)", ["Quel", "Quoi", "Quelle", "Comme"], 0, "avis giống đực → quel que soit.", "avis is masculine → quel que soit."],
        ["La réforme, ___ légitime, suscite des critiques. (Cải cách, dù chính đáng, vẫn gây chỉ trích)", ["quoique", "parce que", "puisque", "dès que"], 0, "quoique + tính từ (lược): mặc dù.", "quoique + adjective (elliptical): although."],
        ["À supposer que l'abstention ___, la démocratie s'affaiblirait. (Giả sử tỉ lệ không đi bầu tăng, dân chủ sẽ suy yếu)", ["augmente", "augmentera", "augmentait", "augmenter"], 0, "À supposer que + subjonctif.", "À supposer que + subjunctive."],
        ["Le débat porte ___ les enjeux de la réforme. (Cuộc tranh luận xoay quanh các vấn đề của cải cách)", ["sur", "de", "à", "pour"], 0, "porter sur: liên quan đến, về.", "porter sur: be about."],
      ],
      sentences: [["Le débat porte sur les enjeux de la réforme", "Cuộc tranh luận xoay quanh các vấn đề then chốt của cải cách."], ["Chaque citoyen a un rôle à jouer", "Mỗi công dân đều có vai trò của mình."], ["La démocratie exige un engagement constant", "Dân chủ đòi hỏi sự dấn thân liên tục."]] },
    { id: "x2", title: "Công nghệ và đạo đức số", titleEn: "Technology and digital ethics",
      words: `algorithme|thuật toán
intelligence artificielle|trí tuệ nhân tạo
données|dữ liệu
vie privée|đời tư
transparence|sự minh bạch
dérive|sự trượt dốc
encadrement|sự quản lý, khuôn khổ
biais|thiên lệch`,
      grammar: [
        ["Il convient que les algorithmes ___ transparents. (Các thuật toán nên minh bạch)", ["soient", "sont", "seront", "étaient"], 0, "Il convient que + subjonctif.", "Il convient que + subjunctive."],
        ["___ les avantages qu'elle offre, l'IA comporte des risques. (Bên cạnh lợi ích, AI có rủi ro)", ["Outre", "Faute de", "Quant à", "Au lieu de"], 0, "Outre + danh từ: ngoài… ra.", "Outre + noun: besides."],
        ["Sans un encadrement strict, des dérives ___ apparaître. (Không có khuôn khổ chặt chẽ, sai lệch có thể xuất hiện)", ["pourraient", "peuvent être", "pourront être", "pouvaient"], 0, "Conditionnel diễn tả khả năng.", "The conditional expresses possibility."],
        ["Les données personnelles doivent être protégées ___ la vie privée. (Dữ liệu cá nhân phải được bảo vệ để tôn trọng đời tư)", ["afin de respecter", "pour que respecter", "à respecter", "en respectant que"], 0, "afin de + nguyên mẫu: nhằm.", "afin de + infinitive: in order to."],
      ],
      sentences: [["Il convient que les algorithmes soient transparents", "Các thuật toán cần phải minh bạch."], ["Outre ses avantages l'intelligence artificielle comporte des risques", "Ngoài lợi ích, trí tuệ nhân tạo còn tiềm ẩn rủi ro."], ["Les données personnelles doivent être protégées", "Dữ liệu cá nhân phải được bảo vệ."]] },
  ],
};
