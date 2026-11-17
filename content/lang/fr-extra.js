// DELF expansion (units 3 and 4 per level). Only append at the end.
export default {
  a1: [
    { id: "3", title: "Số đếm, giờ và ngày",
      words: `heure|giờ
jour|ngày
semaine|tuần
lundi|thứ Hai
matin|buổi sáng
soir|buổi tối
demain|ngày mai
quel|nào, gì`,
      grammar: [
        ["Il est ___ heures. (Bây giờ là 3 giờ)", ["trois", "troisième", "tiers", "trente"], 0, "Il est + số + heures."],
        ["___ jour sommes-nous ? (Hôm nay thứ mấy?)", ["Quel", "Quelle", "Quels", "Qui"], 0, "jour giống đực → quel."],
        ["Je travaille ___ lundi au vendredi. (Tôi làm từ thứ Hai đến thứ Sáu)", ["du", "de", "le", "au"], 0, "du… au…: từ… đến…"],
        ["Le cours commence ___ huit heures. (Lớp bắt đầu lúc 8 giờ)", ["à", "en", "dans", "sur"], 0, "à + giờ: vào lúc."],
      ],
      sentences: [["Il est huit heures du matin", "Bây giờ là tám giờ sáng."], ["Je travaille du lundi au vendredi", "Tôi làm việc từ thứ Hai đến thứ Sáu."], ["Quel jour sommes-nous aujourd'hui", "Hôm nay là thứ mấy?"]] },
    { id: "4", title: "Ăn uống và nhà hàng",
      words: `pain|bánh mì
eau|nước
fromage|phô mai
restaurant|nhà hàng
addition|hóa đơn
vouloir|muốn
pomme|quả táo
poisson|cá`,
      grammar: [
        ["Je ___ un café, s'il vous plaît. (Tôi muốn một cà phê)", ["voudrais", "veux bien de", "vouloir", "voulons"], 0, "Je voudrais: lối lịch sự."],
        ["Je mange ___ pain. (Tôi ăn bánh mì)", ["du", "de la", "des", "le de"], 0, "Mạo từ bộ phận giống đực: du."],
        ["Elle boit ___ eau. (Cô ấy uống nước)", ["de l'", "du", "de la", "des"], 0, "Trước nguyên âm: de l'."],
        ["L'addition, s'il vous ___ ! (Cho xin hóa đơn!)", ["plaît", "plais", "plaire", "plaisez"], 0, "s'il vous plaît: làm ơn."],
      ],
      sentences: [["Je voudrais un verre d'eau", "Tôi muốn một ly nước."], ["Nous mangeons du poisson ce soir", "Tối nay chúng tôi ăn cá."], ["L'addition s'il vous plaît", "Làm ơn cho xin hóa đơn."]] },
  ],
  a2: [
    { id: "3", title: "Nhà ở và thành phố",
      words: `appartement|căn hộ
quartier|khu phố
loyer|tiền thuê nhà
chambre|phòng ngủ
cuisine|nhà bếp
louer|thuê
près|gần
loin|xa`,
      grammar: [
        ["J'habite ___ Lyon. (Tôi sống ở Lyon)", ["à", "en", "au", "dans le"], 0, "à + tên thành phố."],
        ["Elle habite ___ France. (Cô ấy sống ở Pháp)", ["en", "à", "au", "aux"], 0, "en + nước giống cái."],
        ["L'appartement ___ je loue est petit. (Căn hộ tôi thuê thì nhỏ)", ["que", "qui", "dont", "où"], 0, "que thay cho tân ngữ."],
        ["Le quartier ___ j'habite est calme. (Khu phố tôi sống yên tĩnh)", ["où", "que", "qui", "dont"], 0, "où thay cho nơi chốn."],
      ],
      sentences: [["Le loyer est trop cher", "Tiền thuê nhà quá đắt."], ["J'habite près de la gare", "Tôi sống gần nhà ga."], ["Le quartier où j'habite est calme", "Khu phố nơi tôi sống rất yên tĩnh."]] },
    { id: "4", title: "Nghỉ lễ và kỷ niệm",
      words: `vacances|kỳ nghỉ
plage|bãi biển
montagne|núi
souvenir|kỷ niệm
fête|lễ hội, bữa tiệc
anniversaire|sinh nhật
cadeau|quà
inviter|mời`,
      grammar: [
        ["L'été dernier, nous ___ à la plage. (Hè năm ngoái chúng tôi đi biển)", ["sommes allés", "avons allé", "allons", "irons"], 0, "aller dùng être ở passé composé."],
        ["Quand j'étais enfant, je ___ à la montagne. (Hồi nhỏ tôi hay lên núi)", ["allais", "suis allé", "irai", "vais"], 0, "Imparfait: thói quen quá khứ."],
        ["Je ___ ai offert un cadeau. (Tôi đã tặng anh ấy một món quà)", ["lui", "le", "la", "leur"], 0, "offrir à qqn → đại từ gián tiếp lui."],
        ["Tu viens ___ fête ce soir ? (Tối nay bạn đến dự tiệc chứ?)", ["à la", "au", "en", "dans"], 0, "venir à la fête."],
      ],
      sentences: [["Nous sommes allés à la plage en août", "Chúng tôi đã đi biển vào tháng Tám."], ["Je lui ai offert un cadeau", "Tôi đã tặng anh ấy một món quà."], ["Elle m'a invité à son anniversaire", "Cô ấy đã mời tôi dự sinh nhật."]] },
  ],
  b1: [
    { id: "3", title: "Truyền thông và văn hóa",
      words: `journal|tờ báo
article|bài báo
émission|chương trình (TV)
lecture|việc đọc
roman|tiểu thuyết
spectacle|buổi biểu diễn
critique|bài phê bình
auteur|tác giả`,
      grammar: [
        ["C'est le roman ___ je t'ai parlé. (Đây là cuốn tiểu thuyết tôi đã kể)", ["dont", "que", "où", "qui"], 0, "parler de → dont."],
        ["Je lis le journal ___ m'informer. (Tôi đọc báo để cập nhật tin)", ["pour", "par", "afin", "sans"], 0, "pour + nguyên mẫu: để."],
        ["Le film ___ hier était excellent. (Bộ phim xem hôm qua rất hay)", ["vu", "voir", "voyant", "vue"], 0, "Phân từ quá khứ làm tính từ, hợp với film (đực)."],
        ["Cet auteur est ___ connu en France. (Tác giả này rất nổi tiếng ở Pháp)", ["très", "beaucoup", "trop de", "plein"], 0, "très + tính từ."],
      ],
      sentences: [["C'est le livre dont tout le monde parle", "Đây là cuốn sách mà ai cũng nói đến."], ["J'ai lu un article intéressant ce matin", "Sáng nay tôi đọc một bài báo thú vị."], ["Le spectacle commence dans dix minutes", "Buổi diễn bắt đầu sau mười phút."]] },
    { id: "4", title: "Kế hoạch tương lai",
      words: `avenir|tương lai
projet|dự định
devenir|trở thành
étranger|nước ngoài
s'installer|định cư
carrière|sự nghiệp
rêve|giấc mơ
bientôt|sắp, sớm`,
      grammar: [
        ["L'année prochaine, je ___ en Belgique. (Năm sau tôi sẽ đi Bỉ)", ["partirai", "partais", "suis parti", "parte"], 0, "Futur simple: partirai."],
        ["Quand je ___ mon diplôme, je chercherai un emploi. (Khi có bằng tôi sẽ tìm việc)", ["aurai", "ai", "avais", "aie"], 0, "Sau quand dùng futur nếu hành động ở tương lai."],
        ["Mon rêve, c'est ___ médecin. (Ước mơ của tôi là trở thành bác sĩ)", ["de devenir", "devenir de", "à devenir", "que devenir"], 0, "c'est de + nguyên mẫu."],
        ["Je compte ___ installer à Montréal. (Tôi định định cư ở Montréal)", ["m'", "me s'", "se", "t'"], 0, "Động từ phản thân: m'installer."],
      ],
      sentences: [["Je voudrais travailler à l'étranger", "Tôi muốn làm việc ở nước ngoài."], ["Mon rêve est de devenir médecin", "Ước mơ của tôi là trở thành bác sĩ."], ["Quand j'aurai le temps je voyagerai", "Khi có thời gian tôi sẽ đi du lịch."]] },
  ],
  b2: [
    { id: "3", title: "Giáo dục và lao động",
      words: `formation|đào tạo
compétence|năng lực
diplôme|bằng cấp
stage|thực tập
embauche|tuyển dụng
inégalité|bất bình đẳng
réussite|thành công
exigence|yêu cầu`,
      grammar: [
        ["Il a trouvé un emploi ___ son stage. (Anh ấy tìm được việc nhờ đợt thực tập)", ["grâce à", "à cause de", "malgré", "faute de"], 0, "grâce à: nhờ."],
        ["___ que le diplôme soit important, l'expérience compte aussi. (Dù bằng cấp quan trọng, kinh nghiệm cũng có giá trị)", ["Bien", "Pour", "Puisque", "Alors"], 0, "Bien que + subjonctif."],
        ["Il faut se former ___ trouver un bon emploi. (Phải học để có việc tốt)", ["afin de", "afin que", "à cause", "parce de"], 0, "afin de + nguyên mẫu."],
        ["Les inégalités ___ l'accès à l'éducation persistent. (Bất bình đẳng trong tiếp cận giáo dục vẫn còn)", ["dans", "sur", "par", "chez"], 0, "inégalités dans + lĩnh vực."],
      ],
      sentences: [["La formation continue est essentielle", "Đào tạo liên tục là thiết yếu."], ["Il a été embauché grâce à son stage", "Anh ấy được tuyển nhờ đợt thực tập."], ["Les exigences du marché évoluent vite", "Yêu cầu của thị trường thay đổi nhanh."]] },
    { id: "4", title: "Tranh luận và thuyết phục",
      words: `argument|lập luận
convaincre|thuyết phục
soutenir|ủng hộ
s'opposer|phản đối
point de vue|quan điểm
en effet|thật vậy
cependant|tuy nhiên
par conséquent|do đó`,
      grammar: [
        ["Je suis convaincu ___ cette mesure est nécessaire. (Tôi tin chắc biện pháp này cần thiết)", ["que", "de", "à", "dont"], 0, "être convaincu que + indicatif."],
        ["Il s'oppose ___ ce projet. (Anh ấy phản đối dự án này)", ["à", "de", "contre de", "sur"], 0, "s'opposer à."],
        ["Les prix augmentent ; ___, les gens consomment moins. (Giá tăng; do đó người ta tiêu ít hơn)", ["par conséquent", "cependant", "pourtant", "en revanche"], 0, "par conséquent: do đó."],
        ["Je doute qu'il ___ raison. (Tôi nghi ngờ là anh ấy đúng)", ["ait", "a", "aura", "avait"], 0, "douter que + subjonctif."],
      ],
      sentences: [["Cet argument ne me convainc pas", "Lập luận này không thuyết phục tôi."], ["Je comprends votre point de vue cependant je ne suis pas d'accord", "Tôi hiểu quan điểm của bạn, tuy nhiên tôi không đồng ý."], ["Par conséquent il faut agir vite", "Do đó phải hành động nhanh."]] },
  ],
  c1: [
    { id: "3", title: "Khoa học và đạo đức",
      words: `enjeu éthique|vấn đề đạo đức
recherche|nghiên cứu
découverte|khám phá
progrès|tiến bộ
dérive|sự trượt dốc, lệch lạc
encadrer|kiểm soát, đặt khuôn khổ
susciter|gợi lên, gây ra
controversé|gây tranh cãi`,
      grammar: [
        ["Loin ___ résoudre le problème, cette loi l'aggrave. (Thay vì giải quyết, luật này làm vấn đề tệ hơn)", ["de", "à", "pour", "que"], 0, "loin de + nguyên mẫu: thay vì, chẳng những không."],
        ["___ prometteuse qu'elle soit, cette découverte suscite des craintes. (Dù hứa hẹn đến đâu, khám phá này vẫn gây lo ngại)", ["Si", "Tant", "Aussi bien", "Autant"], 0, "Si + tính từ + que + subjonctif: dù… đến đâu."],
        ["Il importe que la recherche ___ encadrée. (Quan trọng là nghiên cứu phải được kiểm soát)", ["soit", "est", "sera", "était"], 0, "Il importe que + subjonctif."],
        ["Ce sujet, ___ controversé, mérite un débat. (Chủ đề này, dù gây tranh cãi, đáng được tranh luận)", ["quoique", "parce que", "puisque", "lorsque"], 0, "quoique + tính từ (lược): mặc dù."],
      ],
      sentences: [["Il importe que la recherche soit encadrée", "Điều quan trọng là nghiên cứu phải được kiểm soát."], ["Cette découverte suscite de nombreuses questions", "Khám phá này gợi lên nhiều câu hỏi."], ["Le progrès scientifique comporte des dérives", "Tiến bộ khoa học kéo theo những lệch lạc."]] },
    { id: "4", title: "Viết luận và tổng hợp",
      words: `problématique|vấn đề đặt ra
synthèse|tổng hợp
en somme|tóm lại
par ailleurs|ngoài ra
certes|đành rằng
en outre|hơn nữa
nuance|sắc thái
conclure|kết luận`,
      grammar: [
        ["___, ce choix a des avantages ; il présente toutefois des limites. (Đành rằng lựa chọn này có ưu điểm; tuy vậy nó có giới hạn)", ["Certes", "Ainsi", "Donc", "Car"], 0, "Certes…, toutefois…: nhượng bộ."],
        ["Il ressort de cette analyse ___ la situation s'améliore. (Từ phân tích này có thể thấy tình hình đang cải thiện)", ["que", "dont", "où", "lequel"], 0, "il ressort de… que…"],
        ["___ de conclure, rappelons les points essentiels. (Trước khi kết luận, hãy nhắc lại các điểm chính)", ["Avant", "Après", "Afin", "Lors"], 0, "avant de + nguyên mẫu."],
        ["Le texte aborde la question ___ un angle original. (Văn bản tiếp cận vấn đề từ góc độ độc đáo)", ["sous", "par", "dans", "avec de"], 0, "sous un angle: dưới góc độ."],
      ],
      sentences: [["En somme le bilan est plutôt positif", "Tóm lại, kết quả khá tích cực."], ["Par ailleurs il convient de nuancer ce propos", "Ngoài ra cần làm rõ sắc thái nhận định này."], ["Avant de conclure rappelons la problématique", "Trước khi kết luận, hãy nhắc lại vấn đề đặt ra."]] },
  ],
};
