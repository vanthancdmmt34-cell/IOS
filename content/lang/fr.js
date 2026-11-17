// French — curriculum aligned with CEFR/DELF A1 to C1.
// Vocabulary: "word|meaning" (spelling exercise: see meaning, type word; unaccented input accepted).
// Sentence building: words separated by spaces. Only append new units at the end of each level.
export default {
  id: "fr", name: "Tiếng Pháp", native: "Français", flag: "🇫🇷", color: "#2563EB",
  speech: "fr-FR", framework: "DELF", typeMode: "word", readingLabel: "từ tiếng Pháp",
  readingHint: "Gõ từ tiếng Pháp; được phép gõ thiếu dấu (é, è, ç…).",
  desc: "Giáo trình chuẩn DELF A1 → C1: từ vựng, chính tả, ngữ pháp, ghép câu.",
  levels: [
    {
      id: "a1", title: "DELF A1", desc: "Giao tiếp cơ bản: chào hỏi, giới thiệu, số đếm, gia đình.",
      units: [
        {
          id: "1", title: "Chào hỏi và giới thiệu",
          words: `bonjour|xin chào
merci|cảm ơn
au revoir|tạm biệt
étudiant|sinh viên (nam)
professeur|giáo viên
ami|bạn (nam)
pays|đất nước
nom|tên, họ
bonsoir|chào buổi tối
s'il vous plaît|làm ơn
pardon|xin lỗi
camarade|bạn cùng lớp`,
          grammar: [
            ["Je ___ étudiant. (Tôi là sinh viên)", ["suis", "es", "est", "sommes"], 0, "être chia với je: je suis."],
            ["Tu ___ comment ? (Bạn tên là gì?)", ["t'appelles", "m'appelle", "s'appelle", "appelles"], 0, "s'appeler với tu: tu t'appelles."],
            ["Elle ___ vingt ans. (Cô ấy 20 tuổi)", ["a", "est", "as", "ai"], 0, "Tiếng Pháp nói tuổi bằng avoir: elle a 20 ans."],
            ["Je suis ___ Vietnam. (Tôi đến từ Việt Nam)", ["du", "de la", "des", "de l'"], 0, "le Vietnam (giống đực) → de + le = du."],
          ],
          sentences: [
            ["Je m'appelle Marie et je suis étudiante", "Tôi tên là Marie và tôi là sinh viên."],
            ["Il est professeur de français", "Anh ấy là giáo viên tiếng Pháp."],
            ["Nous sommes amis", "Chúng tôi là bạn bè."],
            ["Bonjour Madame", "Chào buổi sáng, thưa cô."],
            ["Enchanté de vous rencontrer", "Rất vui được gặp bạn."],
            ["Je suis un nouvel étudiant", "Tôi là sinh viên mới."],
            ["Elle est ma meilleure amie", "Cô ấy là bạn thân của tôi."],
          ],
        },
        {
          id: "2", title: "Gia đình và sinh hoạt",
          words: `famille|gia đình
père|bố
mère|mẹ
frère|anh/em trai
maison|ngôi nhà
manger|ăn
boire|uống
aujourd'hui|hôm nay
sœur|chị gái, em gái
déjeuner|bữa trưa
soir|buổi tối
dîner|bữa tối`,
          grammar: [
            ["J'___ deux frères. (Tôi có hai anh em trai)", ["ai", "as", "a", "avons"], 0, "avoir với je: j'ai."],
            ["Nous ___ du pain. (Chúng tôi ăn bánh mì)", ["mangeons", "mangez", "mange", "mangent"], 0, "manger với nous: mangeons (giữ e trước o)."],
            ["C'est ___ maison. (Đây là ngôi nhà của tôi)", ["ma", "mon", "mes", "me"], 0, "maison giống cái → ma."],
            ["Je ne mange ___ de viande. (Tôi không ăn thịt)", ["pas", "plus", "rien", "jamais"], 0, "Phủ định cơ bản: ne… pas."],
          ],
          sentences: [
            ["Ma mère boit du café le matin", "Mẹ tôi uống cà phê vào buổi sáng."],
            ["J'ai un frère et une sœur", "Tôi có một anh trai và một chị gái."],
            ["Aujourd'hui nous mangeons à la maison", "Hôm nay chúng tôi ăn ở nhà."],
            ["Ma sœur aime la musique", "Chị tôi thích âm nhạc."],
            ["Nous déjeunons à midi", "Chúng tôi ăn trưa lúc giữa trưa."],
            ["Mon frère travaille le soir", "Anh tôi làm việc vào buổi tối."],
            ["Je dîne avec ma famille", "Tôi ăn tối cùng gia đình."],
            ["Elle se lève à six heures du matin", "Cô ấy dậy lúc sáu giờ sáng."],
          ],
        },
      ],
    },
    {
      id: "a2", title: "DELF A2", desc: "Đời sống hằng ngày: mua sắm, đi lại, quá khứ gần.",
      units: [
        {
          id: "1", title: "Mua sắm và đi lại",
          words: `magasin|cửa hàng
prix|giá
cher|đắt
gare|nhà ga
billet|vé
voyager|đi du lịch
acheter|mua
vêtement|quần áo
vendeur|người bán hàng
client|khách hàng
payer|trả tiền
choisir|chọn, lựa
taille|cỡ, kích thước (quần áo)
bagage|hành lý
horaire|giờ giấc, lịch trình (tàu xe)`,
          grammar: [
            ["Hier, j'___ acheté un billet. (Hôm qua tôi đã mua vé)", ["ai", "suis", "avais", "étais"], 0, "Passé composé của acheter dùng trợ động từ avoir."],
            ["Elle est ___ à Paris. (Cô ấy đã đi Paris)", ["allée", "allé", "aller", "allés"], 0, "aller dùng être, phân từ hợp giống cái: allée."],
            ["Je vais ___ le train. (Tôi sẽ đi tàu)", ["prendre", "pris", "prends", "prenant"], 0, "Tương lai gần: aller + động từ nguyên mẫu."],
            ["Ce pantalon est ___ cher que l'autre. (Quần này đắt hơn cái kia)", ["plus", "très", "trop", "aussi bien"], 0, "So sánh hơn: plus + tính từ + que."],
          ],
          sentences: [
            ["Je vais prendre le train demain", "Ngày mai tôi sẽ đi tàu."],
            ["Elle est allée au magasin", "Cô ấy đã đi đến cửa hàng."],
            ["Ce billet est plus cher que l'autre", "Vé này đắt hơn vé kia."],            ["Combien coûte ce sac ?", "Cái túi này giá bao nhiêu?"],
            ["Je voudrais essayer cette chemise.", "Tôi muốn thử chiếc áo sơ mi này."],
            ["Le train part à huit heures du matin.", "Tàu khởi hành lúc tám giờ sáng."],
            ["Où est l'arrêt de bus le plus proche ?", "Trạm xe buýt gần nhất ở đâu?"],
            ["Je cherche un cadeau pour ma mère.", "Tôi đang tìm một món quà cho mẹ tôi."],
            ["Ce magasin est ouvert jusqu'à neuf heures du soir.", "Cửa hàng này mở cửa đến chín giờ tối."],
            ["J'ai oublié mon bagage dans le train.", "Tôi đã quên hành lý của mình trên tàu."],

          ],
        },
        {
          id: "2", title: "Sức khỏe và thời tiết",
          words: `médecin|bác sĩ
malade|bị ốm
fièvre|sốt
pluie|mưa
froid|lạnh
soleil|mặt trời
se reposer|nghỉ ngơi
pharmacie|hiệu thuốc
toux|cơn ho
rhume|cảm lạnh, sổ mũi
douleur|cơn đau
santé|sức khỏe
nuageux|nhiều mây, âm u
vent|gió
se sentir|cảm thấy (sức khỏe)`,
          grammar: [
            ["Il fait ___ aujourd'hui. (Hôm nay trời lạnh)", ["froid", "pluie", "soleil", "neige"], 0, "Thời tiết: il fait + tính từ (froid, chaud, beau)."],
            ["J'ai mal ___ tête. (Tôi bị đau đầu)", ["à la", "au", "aux", "de la"], 0, "avoir mal à + bộ phận: à la tête."],
            ["Tu ___ te reposer. (Bạn nên nghỉ ngơi)", ["devrais", "dois être", "doit", "devons"], 0, "Lời khuyên: tu devrais + nguyên mẫu."],
            ["Quand j'étais petit, je ___ souvent malade. (Hồi nhỏ tôi hay ốm)", ["étais", "suis", "serai", "ai été"], 0, "Imparfait diễn tả thói quen trong quá khứ."],
          ],
          sentences: [
            ["Il pleut beaucoup en automne", "Mùa thu trời mưa nhiều."],
            ["Je dois aller chez le médecin", "Tôi phải đi khám bác sĩ."],
            ["Tu devrais te reposer un peu", "Bạn nên nghỉ ngơi một chút."],            ["J'ai mal à la gorge depuis hier.", "Tôi bị đau họng từ hôm qua."],
            ["Il fait beau aujourd'hui, allons nous promener.", "Hôm nay trời đẹp, chúng ta hãy đi dạo."],
            ["N'oublie pas ton parapluie, il va pleuvoir.", "Đừng quên ô của bạn, trời sắp mưa."],
            ["Je me sens fatigué, je vais me coucher tôt.", "Tôi cảm thấy mệt, tôi sẽ đi ngủ sớm."],
            ["Il neige en hiver dans cette région.", "Mùa đông ở vùng này có tuyết rơi."],
            ["Prends ce médicament trois fois par jour.", "Hãy uống thuốc này ba lần một ngày."],
            ["Le vent est très fort ce soir.", "Tối nay gió rất mạnh."],

          ],
        },
      ],
    },
    {
      id: "b1", title: "DELF B1", desc: "Trình bày ý kiến, công việc, kế hoạch, điều kiện.",
      units: [
        {
          id: "1", title: "Công việc và học tập",
          words: `entreprise|doanh nghiệp
emploi|việc làm
salaire|tiền lương
réunion|cuộc họp
expérience|kinh nghiệm
réussir|thành công, thi đỗ
examen|kỳ thi
projet|dự án
candidature|đơn ứng tuyển
entretien|buổi phỏng vấn
collègue|đồng nghiệp
congé|ngày nghỉ phép
formation|khóa đào tạo
diplôme|bằng cấp
embaucher|tuyển dụng`,
          grammar: [
            ["Si j'avais le temps, je ___ un cours. (Nếu có thời gian, tôi sẽ học một khóa)", ["suivrais", "suis", "suivrai", "suivais"], 0, "Si + imparfait, conditionnel présent."],
            ["Il faut que tu ___ cet examen. (Bạn phải thi đỗ kỳ thi này)", ["réussisses", "réussis", "réussiras", "réussir"], 0, "Il faut que + subjonctif."],
            ["C'est le projet ___ je travaille. (Đây là dự án mà tôi đang làm)", ["sur lequel", "que", "dont", "où"], 0, "travailler sur → sur lequel."],
            ["J'ai trouvé un emploi ___ deux mois de recherche. (Tôi tìm được việc sau hai tháng)", ["après", "pendant", "depuis", "avant"], 0, "après + khoảng thời gian: sau."],
          ],
          sentences: [
            ["Il faut que je finisse ce projet", "Tôi phải hoàn thành dự án này."],
            ["Si j'avais plus d'expérience je changerais d'emploi", "Nếu có nhiều kinh nghiệm hơn, tôi sẽ đổi việc."],
            ["La réunion commence à neuf heures", "Cuộc họp bắt đầu lúc chín giờ."],            ["J'ai envoyé ma candidature hier matin.", "Tôi đã gửi đơn ứng tuyển sáng hôm qua."],
            ["Mon entretien d'embauche est demain à dix heures.", "Buổi phỏng vấn xin việc của tôi là ngày mai lúc mười giờ."],
            ["Je travaille avec des collègues très sympathiques.", "Tôi làm việc với những đồng nghiệp rất dễ mến."],
            ["Je voudrais prendre un congé la semaine prochaine.", "Tôi muốn xin nghỉ phép vào tuần tới."],
            ["Cette formation m'a beaucoup aidé dans mon travail.", "Khóa đào tạo này đã giúp ích rất nhiều cho công việc của tôi."],
            ["Il a obtenu son diplôme l'année dernière.", "Anh ấy đã lấy bằng tốt nghiệp năm ngoái."],
            ["Notre entreprise embauche de nouveaux employés.", "Công ty chúng tôi đang tuyển nhân viên mới."],

          ],
        },
        {
          id: "2", title: "Ý kiến và cảm xúc",
          words: `penser|nghĩ
croire|tin
d'accord|đồng ý
inquiet|lo lắng
heureux|hạnh phúc
avis|ý kiến
déçu|thất vọng
espérer|hy vọng
point de vue|quan điểm
convaincre|thuyết phục
fier|tự hào
triste|buồn
surpris|ngạc nhiên
rassurer|trấn an, làm yên lòng
impression|cảm nhận, ấn tượng`,
          grammar: [
            ["Je ne pense pas qu'il ___ raison. (Tôi không nghĩ anh ấy đúng)", ["ait", "a", "aura", "avait"], 0, "Phủ định của penser + que → subjonctif."],
            ["À mon ___, c'est une bonne idée. (Theo ý tôi, đó là ý hay)", ["avis", "idée", "pensée", "opinion de"], 0, "À mon avis = theo ý kiến của tôi."],
            ["Je suis content ___ te voir. (Tôi vui được gặp bạn)", ["de", "à", "pour", "que"], 0, "être content de + nguyên mẫu."],
            ["J'espère qu'il ___ demain. (Tôi hy vọng mai anh ấy đến)", ["viendra", "vienne", "venir", "venu"], 0, "espérer que + indicatif (thường tương lai)."],
          ],
          sentences: [
            ["À mon avis c'est une bonne idée", "Theo ý tôi đó là một ý hay."],
            ["Je ne crois pas qu'il vienne", "Tôi không tin là anh ấy sẽ đến."],
            ["Nous sommes très heureux de vous voir", "Chúng tôi rất vui được gặp các bạn."],            ["De mon point de vue, cette décision est juste.", "Theo quan điểm của tôi, quyết định này là đúng."],
            ["Je suis fier de mon équipe.", "Tôi tự hào về đội của mình."],
            ["Cette nouvelle m'a rendu très triste.", "Tin này làm tôi rất buồn."],
            ["J'ai été surpris par sa réaction.", "Tôi đã ngạc nhiên trước phản ứng của anh ấy."],
            ["Ne t'inquiète pas, tout va bien se passer.", "Đừng lo lắng, mọi chuyện sẽ ổn thôi."],
            ["J'ai l'impression qu'il est fatigué.", "Tôi có cảm giác là anh ấy đang mệt."],
            ["Il a réussi à convaincre tout le monde.", "Anh ấy đã thuyết phục được mọi người."],

          ],
        },
      ],
    },
    {
      id: "b2", title: "DELF B2", desc: "Lập luận, tranh luận, xã hội, môi trường.",
      units: [
        {
          id: "1", title: "Xã hội và môi trường",
          words: `environnement|môi trường
pollution|ô nhiễm
chômage|thất nghiệp
société|xã hội
développement|sự phát triển
enjeu|vấn đề then chốt
améliorer|cải thiện
réduire|giảm
durabilité|sự bền vững
gaspillage|sự lãng phí
inégalité|bất bình đẳng
citoyen|công dân
sensibiliser|nâng cao nhận thức
biodiversité|đa dạng sinh học
engagement|sự cam kết, dấn thân`,
          grammar: [
            ["___ la pollution augmente, le gouvernement agit peu. (Mặc dù ô nhiễm tăng, chính phủ ít hành động)", ["Bien que", "Parce que", "Puisque", "Dès que"], 0, "Bien que + subjonctif: mặc dù."],
            ["Il faut agir ___ qu'il soit trop tard. (Phải hành động trước khi quá muộn)", ["avant", "après", "pendant", "depuis"], 0, "avant que + subjonctif."],
            ["Le chômage a baissé ___ aux nouvelles mesures. (Thất nghiệp giảm nhờ biện pháp mới)", ["grâce", "à cause", "malgré", "faute"], 0, "grâce à: nhờ vào (nghĩa tích cực)."],
            ["Les déchets ___ recyclés. (Rác thải được tái chế)", ["sont", "ont", "font", "vont"], 0, "Bị động: être + phân từ quá khứ."],
          ],
          sentences: [
            ["Il faut réduire la pollution des villes", "Cần giảm ô nhiễm ở các thành phố."],
            ["Bien que la situation soit difficile nous restons optimistes", "Mặc dù tình hình khó khăn, chúng tôi vẫn lạc quan."],
            ["Le chômage a baissé grâce aux réformes", "Thất nghiệp đã giảm nhờ các cải cách."],            ["La durabilité doit être au cœur de nos choix.", "Tính bền vững phải là trọng tâm trong các lựa chọn của chúng ta."],
            ["Le gaspillage alimentaire est un problème grave.", "Lãng phí thực phẩm là một vấn đề nghiêm trọng."],
            ["Il faut lutter contre les inégalités sociales.", "Cần đấu tranh chống lại bất bình đẳng xã hội."],
            ["Chaque citoyen peut contribuer à protéger l'environnement.", "Mỗi công dân đều có thể góp phần bảo vệ môi trường."],
            ["Cette campagne vise à sensibiliser les jeunes au recyclage.", "Chiến dịch này nhằm nâng cao nhận thức của giới trẻ về tái chế."],
            ["La biodiversité est menacée par la déforestation.", "Đa dạng sinh học đang bị đe dọa bởi nạn phá rừng."],
            ["Son engagement en faveur du climat est admirable.", "Sự dấn thân của anh ấy vì khí hậu thật đáng ngưỡng mộ."],

          ],
        },
        {
          id: "2", title: "Truyền thông và công nghệ",
          words: `médias|truyền thông
information|thông tin
réseau social|mạng xã hội
outil|công cụ
données|dữ liệu
avantage|lợi thế
inconvénient|bất lợi
dépendance|sự phụ thuộc
algorithme|thuật toán
désinformation|thông tin sai lệch
vie privée|đời sống riêng tư
écran|màn hình
partager|chia sẻ (trên mạng)
vérifier|kiểm chứng, xác minh
influenceur|người có ảnh hưởng (trên mạng)`,
          grammar: [
            ["D'une part… d'___ part… (Một mặt… mặt khác…)", ["autre", "une", "la", "même"], 0, "D'une part…, d'autre part…: cấu trúc lập luận."],
            ["___ ses avantages, Internet présente des risques. (Bên cạnh lợi ích, Internet có rủi ro)", ["Malgré", "Grâce à", "Afin de", "Selon"], 0, "Malgré + danh từ: bất chấp, mặc dù."],
            ["Selon les experts, les jeunes ___ trop de temps en ligne. (Theo chuyên gia, giới trẻ dành quá nhiều thời gian online)", ["passeraient", "passer", "passé", "passant"], 0, "Conditionnel dùng để đưa tin chưa kiểm chứng."],
            ["Il utilise son téléphone ___ s'informer. (Anh ấy dùng điện thoại để cập nhật thông tin)", ["pour", "par", "sans", "dont"], 0, "pour + nguyên mẫu: để."],
          ],
          sentences: [
            ["Les réseaux sociaux créent une forte dépendance", "Mạng xã hội tạo ra sự phụ thuộc lớn."],
            ["Malgré ses avantages Internet présente des risques", "Bất chấp những lợi ích, Internet tiềm ẩn rủi ro."],
            ["Il faut protéger les données personnelles", "Cần bảo vệ dữ liệu cá nhân."],            ["Il faut vérifier une information avant de la partager.", "Cần kiểm chứng một thông tin trước khi chia sẻ nó."],
            ["La désinformation se propage vite sur les réseaux sociaux.", "Thông tin sai lệch lan truyền nhanh trên mạng xã hội."],
            ["Les algorithmes influencent ce que nous voyons en ligne.", "Các thuật toán ảnh hưởng đến những gì chúng ta thấy trên mạng."],
            ["Protéger sa vie privée en ligne est essentiel.", "Bảo vệ đời sống riêng tư trên mạng là điều thiết yếu."],
            ["Les jeunes passent trop de temps devant les écrans.", "Giới trẻ dành quá nhiều thời gian trước màn hình."],
            ["Certains influenceurs ont des millions d'abonnés.", "Một số người có ảnh hưởng có hàng triệu người theo dõi."],

          ],
        },
      ],
    },
    {
      id: "c1", title: "DALF C1", desc: "Văn phong học thuật, sắc thái và biểu đạt tinh tế.",
      units: [
        {
          id: "1", title: "Lập luận học thuật",
          words: `hypothèse|giả thuyết
nuancer|làm rõ sắc thái
remettre en cause|đặt lại vấn đề
néanmoins|tuy nhiên
en revanche|ngược lại
d'ores et déjà|ngay từ bây giờ
souligner|nhấn mạnh
démontrer|chứng minh`,
          grammar: [
            ["___ que soient les difficultés, il faut continuer. (Dù khó khăn thế nào cũng phải tiếp tục)", ["Quelles", "Quels", "Quoi", "Comme"], 0, "Quel(le)s que soient + danh từ: dù… thế nào."],
            ["Cette étude, ___ résultats sont surprenants, mérite attention. (Nghiên cứu này, có kết quả bất ngờ, đáng chú ý)", ["dont les", "que les", "où les", "auxquels"], 0, "dont thay cho de + danh từ: kết quả của nghiên cứu."],
            ["Il aurait réussi s'il ___ davantage. (Anh ấy đã thành công nếu học nhiều hơn)", ["avait travaillé", "travaillait", "a travaillé", "travaillera"], 0, "Si + plus-que-parfait, conditionnel passé."],
            ["Les résultats sont bons ; ___, des questions demeurent. (Kết quả tốt; tuy nhiên vẫn còn câu hỏi)", ["néanmoins", "ainsi", "donc", "car"], 0, "néanmoins: tuy nhiên (đối lập)."],
          ],
          sentences: [
            ["Cette hypothèse mérite d'être nuancée", "Giả thuyết này cần được làm rõ sắc thái."],
            ["Il convient de souligner l'importance de ce débat", "Cần nhấn mạnh tầm quan trọng của cuộc tranh luận này."],
            ["Les résultats remettent en cause les théories anciennes", "Kết quả đặt lại vấn đề với các lý thuyết cũ."],
          ],
        },
        {
          id: "2", title: "Văn hóa và biểu đạt",
          words: `patrimoine|di sản
mœurs|phong tục
épanouissement|sự phát triển trọn vẹn
nostalgie|nỗi hoài niệm
éphémère|phù du
s'accommoder|thích nghi, chấp nhận
foisonner|phong phú, dồi dào
désormais|từ nay trở đi`,
          grammar: [
            ["Il a beau essayer, il ___ pas. (Dù cố mấy anh ấy cũng không thành)", ["n'y arrive", "y arrive", "n'arrive", "arrive"], 0, "avoir beau + nguyên mẫu: dù có… cũng không."],
            ["Pour peu qu'on ___ attention, on remarque les détails. (Chỉ cần chú ý một chút là thấy chi tiết)", ["fasse", "fait", "fera", "faisait"], 0, "Pour peu que + subjonctif."],
            ["___ la nuit tombée, la ville s'illumine. (Khi màn đêm buông xuống, thành phố bừng sáng)", ["Une fois", "Dès lors", "Quant à", "Faute de"], 0, "Une fois + phân từ: một khi đã."],
            ["Le patrimoine ___ nous avons hérité est fragile. (Di sản mà chúng ta thừa hưởng rất mong manh)", ["dont", "que", "lequel", "où"], 0, "hériter de → dont."],
          ],
          sentences: [
            ["Il faut préserver le patrimoine culturel", "Cần gìn giữ di sản văn hóa."],
            ["La beauté de ce moment est éphémère", "Vẻ đẹp của khoảnh khắc này là phù du."],
            ["Désormais nous devons nous accommoder de ces changements", "Từ nay chúng ta phải thích nghi với những thay đổi này."],
          ],
        },
      ],
    },
  ],
};
