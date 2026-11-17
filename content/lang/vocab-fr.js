// fr vocabulary expansion: 1000 extra words (200 per level, 4 units per level).
// Format: "word|Vietnamese meaning". Only append units at the END of each level; never change existing IDs.
// Units use IDs v1..v4 so they never collide with base units. Each word is unique within the course.
export default {
  a1: [
    { id: "v1", title: "Đồ vật và màu sắc", titleEn: "Objects and colours", words: `lampe|đèn bàn
horloge|đồng hồ treo tường
miroir|cái gương
serviette|khăn tắm
savon|xà phòng
brosse à dents|bàn chải đánh răng
parapluie|cái ô
clé|chìa khóa
ordinateur|máy tính
télévision|ti vi
appareil photo|máy ảnh
bouteille|cái chai
tasse|cái tách
assiette|cái đĩa
cuillère|cái thìa
fourchette|cái nĩa
couteau|con dao
casserole|cái nồi
poêle|cái chảo
panier|cái giỏ
boîte|cái hộp
chaussettes|tất
lunettes|kính mắt
ceinture|thắt lưng
veste|áo khoác
pull|áo len
manteau|áo choàng dài
écharpe|khăn quàng cổ
gants|găng tay
cintre|móc treo quần áo
règle|thước kẻ
gomme|cục tẩy
calculatrice|máy tính bỏ túi
enveloppe|phong bì
timbre|tem thư
papier|giấy
photo|bức ảnh
bougie|cây nến
vase|bình hoa
cahier|vở
sac à dos|ba lô
jaune|màu vàng
marron|màu nâu
rose|màu hồng
gris|màu xám
violet|màu tím
orange|màu cam
lunettes de soleil|kính râm
réveil|đồng hồ báo thức
sac à main|túi xách tay` },
    { id: "v2", title: "Thức ăn và đồ uống", titleEn: "Food and drink", words: `riz|cơm, gạo
viande|thịt
crevette|con tôm
œuf|quả trứng
beurre|bơ
lait|sữa
café|cà phê
thé|trà
jus|nước ép
bière|bia
vin|rượu vang
poivre|hạt tiêu
salade|rau trộn
pâtes|mì ống
pizza|bánh pizza
sandwich|bánh sandwich
gâteau|bánh ngọt
biscuit|bánh quy
glace|kem
banane|quả chuối
raisin|quả nho
fraise|quả dâu tây
citron|quả chanh
pomme de terre|khoai tây
tomate|cà chua
carotte|cà rốt
oignon|hành tây
chou|bắp cải
champignon|nấm
maïs|ngô
légume|rau củ
fruit|trái cây
rassasié|no bụng
assoiffé|khát nước
cuisiner|nấu ăn
cuire au four|nướng bánh
griller|nướng trên vỉ
éplucher|gọt vỏ
couper en tranches|thái lát
hacher|băm, thái nhỏ
épicé|cay
aigre|chua
sucré|ngọt
amer|đắng
frais|tươi
surgelé|đông lạnh
bol|cái bát
confiture|mứt
gâteau au chocolat|bánh sô-cô-la
omelette|trứng tráng` },
    { id: "v3", title: "Nơi chốn và đi lại", titleEn: "Places and getting around", words: `route|con đường
pont|cây cầu
marché|chợ
poste|bưu điện
église|nhà thờ
musée|bảo tàng
ville|thành phố
village|ngôi làng
taxi|xe taxi
voiture|ô tô
vélo|xe đạp
moto|xe máy
avion|máy bay
bateau|thuyền
passage piéton|lối qua đường
feu rouge|đèn đỏ
gauche|bên trái
droite|bên phải
tout droit|thẳng phía trước
à côté de|bên cạnh
derrière|phía sau
devant|phía trước
au coin|ở góc đường
bâtiment|tòa nhà
étage|tầng
ascenseur|thang máy
escalier|cầu thang
entrée|lối vào
sortie|lối ra
parking|bãi đỗ xe
itinéraire|lộ trình
partir|rời đi
conduire|lái xe
tramway|xe điện
métro|tàu điện ngầm
trottoir|vỉa hè
tunnel|đường hầm
portail|cổng
rond-point|vòng xuyến
carrefour|ngã tư
autoroute|đường cao tốc
théâtre|nhà hát
usine|nhà máy
ferme|trang trại
garage|gara sửa xe
station-service|trạm xăng
arrêt de bus|trạm xe buýt
place|quảng trường
boulangerie|tiệm bánh mì
école|trường học` },
    { id: "v4", title: "Thời gian và thời tiết", titleEn: "Time and weather", words: `année|năm
minute|phút
seconde|giây
maintenant|bây giờ
plus tard|sau này
saison|mùa
pluvieux|có mưa
lune|mặt trăng
étoile|ngôi sao
ciel|bầu trời
mer|biển
rivière|sông
forêt|rừng
cent|một trăm
mille|một nghìn
moitié|một nửa
quart|một phần tư
zéro|số không
vingt|hai mươi
million|một triệu
nuit|ban đêm
midi|buổi trưa
après-midi|buổi chiều
minuit|nửa đêm
aube|bình minh
crépuscule|hoàng hôn
calendrier|lịch
date|ngày tháng
temps|thời gian
déjà|đã rồi
habituel|thông thường
il y a|cách đây
avant|trước
après|sau
pendant|trong suốt
quinzaine|hai tuần
décennie|thập kỷ
siècle|thế kỷ
ce soir|tối nay
journée|ban ngày
heure du déjeuner|giờ ăn trưa
ensoleillé|có nắng
nuageux|có mây
mardi|thứ Ba
mois|tháng
hier|hôm qua
mercredi|thứ Tư
jeudi|thứ Năm
vendredi|thứ Sáu
dimanche|Chủ nhật` },
  ],
  a2: [
    { id: "v1", title: "Nhà cửa và đồ đạc", titleEn: "Home and furniture", words: `salle de bain|phòng tắm
salon|phòng khách
jardin|khu vườn
balcon|ban công
toit|mái nhà
mur|bức tường
tapis|tấm thảm
canapé|ghế sofa
placard|tủ đựng đồ
réfrigérateur|tủ lạnh
cuisinière|bếp nấu
four|lò nướng
machine à laver|máy giặt
aspirateur|máy hút bụi
rideau|rèm cửa
oreiller|cái gối
couverture|cái chăn
drap|khăn trải giường
étagère|cái kệ
tiroir|ngăn kéo
pièce|căn phòng
réparer|sửa chữa
propre|sạch sẽ
rangé|gọn gàng
sale|bẩn
confortable|thoải mái
meubles|đồ nội thất
décorer|trang trí
électricité|điện
adresse|địa chỉ
lave-vaisselle|máy rửa bát
évier|bồn rửa
robinet|vòi nước
toilettes|nhà vệ sinh
douche|vòi sen
lumière|đèn, ánh sáng
couloir|hành lang
grenier|gác mái
sous-sol|tầng hầm
clôture|hàng rào
sonnette|chuông cửa
balai|cây chổi
seau|cái xô
éponge|miếng bọt biển
bouilloire|ấm đun nước
coussin|gối tựa
poubelle|thùng rác
lessive|bột giặt
fenêtre|cửa sổ
porte|cửa ra vào` },
    { id: "v2", title: "Mua sắm và tiền bạc", titleEn: "Shopping and money", words: `vendeur|nhân viên bán hàng
reçu|biên lai
réduction|giảm giá
soldes|đợt giảm giá
coût|chi phí
payer|trả tiền
espèces|tiền mặt
monnaie|tiền thừa
rembourser|hoàn tiền
échanger|đổi hàng
bonne affaire|món hời
file d'attente|hàng người xếp hàng
caddie|xe đẩy hàng
produit|sản phẩm
en ligne|trực tuyến
livraison|giao hàng
distributeur|máy rút tiền
dépenser|tiêu tiền
revenu|thu nhập
colis|gói hàng
grand magasin|cửa hàng bách hóa
supermarché|siêu thị
caissier|thu ngân
gratuit|miễn phí
étiquette de prix|nhãn giá
étal|quầy hàng chợ
coupon|phiếu giảm giá
catalogue|danh mục sản phẩm
caisse|quầy thanh toán
sac de courses|túi mua sắm
accro aux achats|người nghiện mua sắm
arnaque|hàng bị hét giá
d'occasion|đã qua sử dụng
neuf|mới toanh
en promotion|đã giảm giá
en stock|còn hàng
épuisé|hết hàng
facture|hóa đơn
emballer|gói (quà)
vendre|bán
portefeuille|ví tiền
commander|đặt hàng
chèque|séc
solde|số dư
couleur|màu sắc
tenue|trang phục
caisse enregistreuse|máy tính tiền
promotion|khuyến mãi
garantie|bảo hành
ticket de caisse|hóa đơn mua hàng` },
    { id: "v3", title: "Sức khỏe và cơ thể", titleEn: "Health and the body", words: `visage|khuôn mặt
oreille|tai
nez|mũi
bouche|miệng
langue|lưỡi
cou|cổ
épaule|vai
bras|cánh tay
doigt|ngón tay
poitrine|ngực
estomac|dạ dày
jambe|chân
genou|đầu gối
pied|bàn chân
cœur|trái tim
sang|máu
pharmacien|dược sĩ
comprimé|viên thuốc
grippe|cúm
mal de gorge|đau họng
mal aux dents|đau răng
pansement|băng gạc
ordonnance|đơn thuốc
en bonne santé|khỏe mạnh
exercice|tập thể dục
dormir|ngủ
faible|yếu
vitamine|vitamin
guérir|hồi phục
blesser|làm bị thương
vertige|chóng mặt
nausée|buồn nôn
gonflé|sưng
brûlure|vết bỏng
coupure|vết cắt
radio|chụp X-quang
tension artérielle|huyết áp
thermomètre|nhiệt kế
opération|ca phẫu thuật
ambulance|xe cứu thương
urgences|phòng cấp cứu
fauteuil roulant|xe lăn
béquilles|nạng
dentiste|nha sĩ
opticien|bác sĩ mắt
poumons|phổi
menton|cằm
front|trán
cheveux|tóc
sourcil|lông mày` },
    { id: "v4", title: "Công việc và nghề nghiệp", titleEn: "Work and jobs", words: `employé|nhân viên
employeur|chủ lao động
candidature|đơn xin việc
contrat|hợp đồng
prendre sa retraite|nghỉ hưu
au chômage|thất nghiệp
agriculteur|nông dân
chauffeur|tài xế
policier|cảnh sát
pompier|lính cứu hỏa
soldat|người lính
pilote|phi công
journaliste|nhà báo
designer|nhà thiết kế
comptable|kế toán viên
avocat|luật sư
secrétaire|thư ký
réceptionniste|lễ tân
heures supplémentaires|làm thêm giờ
tâche|nhiệm vụ
feuille de temps|bảng chấm công
atelier|xưởng
affaires|doanh nghiệp
client|khách hàng doanh nghiệp
responsabilité|trách nhiệm
succès|thành công
salaire horaire|tiền công
prime|tiền thưởng
fiche de paie|phiếu lương
poste vacant|vị trí tuyển dụng
recruter|tuyển dụng
CV|sơ yếu lý lịch
superviseur|người giám sát
assistant|trợ lý
stagiaire|thực tập sinh
salle de réunion|phòng họp
lieu de travail|nơi làm việc
ouvrier|công nhân
jardinier|người làm vườn
maçon|thợ xây
mécanicien|thợ máy
coiffeur|thợ cắt tóc
électricien|thợ điện
plombier|thợ sửa ống nước
informaticien|kỹ sư tin học
architecte|kiến trúc sư
banquier|nhân viên ngân hàng
boulanger|thợ làm bánh
médecin généraliste|bác sĩ đa khoa
avocate|nữ luật sư` },
  ],
  b1: [
    { id: "v1", title: "Du lịch và sân bay", titleEn: "Travel and the airport", words: `passeport|hộ chiếu
visa|thị thực
carte d'embarquement|thẻ lên máy bay
vol|chuyến bay
départ|sự khởi hành
arrivée|sự đến nơi
porte d'embarquement|cổng lên máy bay
douane|hải quan
touriste|khách du lịch
guide|hướng dẫn viên
visite touristique|tham quan
hébergement|chỗ ở
camping|khu cắm trại
station balnéaire|khu nghỉ dưỡng
île|hòn đảo
vallée|thung lũng
cascade|thác nước
lac|hồ
désert|sa mạc
capitale|thủ đô
frontière|biên giới
taux de change|tỷ giá
assurance|bảo hiểm
urgence|tình huống khẩn cấp
ambassade|đại sứ quán
circuit|chuyến tham quan có hướng dẫn
vue|quang cảnh
paysage|phong cảnh
voyage|chuyến đi
routard|người đi bụi
flâner|đi lang thang
inconnu|lạ lẫm
local|người địa phương
coutume|phong tục
compagnie aérienne|hãng hàng không
siège|chỗ ngồi
piste|đường băng
terminal|nhà ga sân bay
contrôle de sécurité|kiểm tra an ninh
passager|hành khách
décalage horaire|lệch múi giờ
crème solaire|kem chống nắng
auberge de jeunesse|nhà nghỉ bình dân
randonnée|đi bộ đường dài
temple|ngôi đền
château|lâu đài
bagage|hành lý
excursion|chuyến đi chơi
rencontre|cuộc gặp gỡ
visite guidée|tham quan có hướng dẫn` },
    { id: "v2", title: "Học tập và thi cử", titleEn: "Study and exams", words: `résultat|kết quả
note|điểm số
université|trường đại học
faculté|trường cao đẳng
cours magistral|bài giảng
semestre|học kỳ
dissertation|bài luận
mémoire|luận văn
laboratoire|phòng thí nghiệm
frais de scolarité|học phí
cours|khóa học
matière|môn học
réviser|ôn tập
mémoriser|ghi nhớ
se concentrer|tập trung
comprendre|hiểu
expliquer|giải thích
question|câu hỏi
noter|chấm điểm
échouer|trượt
certificat|chứng chỉ
littérature|văn học
histoire|lịch sử
géographie|địa lý
chimie|hóa học
physique|vật lý
biologie|sinh học
mathématiques|toán học
économie|kinh tế học
psychologie|tâm lý học
philosophie|triết học
traduction|bản dịch
grammaire|ngữ pháp
prononciation|cách phát âm
dictionnaire|từ điển
manuel|sách giáo khoa
notes de cours|ghi chú
programme|chương trình học
leçon|bài học
quiz|bài kiểm tra ngắn
devoirs|bài tập về nhà
camarade de classe|bạn cùng lớp
tuteur|gia sư
année scolaire|năm học
directeur|hiệu trưởng
campus|khuôn viên trường
enseignant-chercheur|giảng viên
craie|phấn
tableau noir|bảng đen
examen blanc|bài thi thử` },
    { id: "v3", title: "Công nghệ và internet", titleEn: "Technology and the internet", words: `smartphone|điện thoại thông minh
ordinateur portable|máy tính xách tay
tablette|máy tính bảng
clavier|bàn phím
souris|chuột máy tính
écran|màn hình
batterie|pin
chargeur|bộ sạc
mot de passe|mật khẩu
nom d'utilisateur|tên đăng nhập
connexion|đăng nhập
télécharger|tải xuống
téléverser|tải lên
installer|cài đặt
mettre à jour|cập nhật
logiciel|phần mềm
application|ứng dụng
site web|trang web
navigateur|trình duyệt
moteur de recherche|công cụ tìm kiếm
courriel|thư điện tử
pièce jointe|tệp đính kèm
SMS|tin nhắn văn bản
notification|thông báo
appel vidéo|cuộc gọi video
réseau|mạng
wifi|wifi
signal|tín hiệu
base de données|cơ sở dữ liệu
chiffrement|mã hóa
sécurité|an ninh, bảo mật
pirate|tin tặc
virus|vi-rút
sauvegarde|bản sao lưu
réseaux sociaux|mạng xã hội
blog|blog
podcast|podcast
diffusion en continu|phát trực tuyến
robot|người máy
matériel|phần cứng
gadget|tiện ích công nghệ
numérique|thuộc kỹ thuật số
inventer|phát minh
technologie|công nghệ
machine|máy móc
automatique|tự động
code|mã lập trình
erreur|lỗi
planter|treo, sập
connecter|kết nối` },
    { id: "v4", title: "Cảm xúc và tính cách", titleEn: "Feelings and personality", words: `triste|buồn
en colère|tức giận
effrayé|sợ hãi
surpris|ngạc nhiên
nerveux|hồi hộp
excité|háo hức
ennuyé|chán
confus|bối rối
gêné|xấu hổ
seul|cô đơn
jaloux|ghen tị
reconnaissant|biết ơn
calme|bình tĩnh
patient|kiên nhẫn
honnête|trung thực
généreux|hào phóng
courageux|dũng cảm
timide|nhút nhát
poli|lịch sự
impoli|thô lỗ
intelligent|thông minh
paresseux|lười biếng
prudent|cẩn thận
créatif|sáng tạo
drôle|hài hước
sérieux|nghiêm túc
gentil|tốt bụng
égoïste|ích kỷ
joyeux|vui tươi
amical|thân thiện
ambitieux|có tham vọng
modeste|khiêm tốn
curieux|tò mò
émotif|dễ xúc động
humeur|tâm trạng
personnalité|tính cách
comportement|hành vi
attitude|thái độ
relation|mối quan hệ
confiance|tin tưởng
se disputer|tranh cãi
pardonner|tha thứ
s'excuser|xin lỗi
encourager|khuyến khích
admirer|ngưỡng mộ
taquiner|trêu chọc
doux|dịu dàng
compatissant|thông cảm
attentif|chu đáo
fier|tự hào` },
  ],
  b2: [
    { id: "v1", title: "Môi trường và thiên nhiên", titleEn: "Environment and nature", words: `contamination|sự nhiễm bẩn
régime climatique|kiểu thời tiết
réchauffement climatique|sự nóng lên toàn cầu
compost|phân trộn hữu cơ
décharge|bãi chôn lấp rác
énergie renouvelable|năng lượng tái tạo
énergie solaire|năng lượng mặt trời
énergie fossile|nhiên liệu hóa thạch
sécheresse|hạn hán
inondation|lũ lụt
tremblement de terre|động đất
ouragan|bão lớn
menacé|bị đe dọa
espèce|loài
habitat|môi trường sống
écosystème|hệ sinh thái
biodiversité|đa dạng sinh học
déforestation|nạn phá rừng
conservation|sự bảo tồn
protéger|bảo vệ
préserver|gìn giữ
ressource|tài nguyên
écologique|thuộc sinh thái
respectueux de l'environnement|thân thiện với môi trường
réutiliser|tái sử dụng
éliminer|vứt bỏ, xử lý
toxique|độc hại
produit chimique|hóa chất
poussière|bụi
smog|sương khói
oxygène|ô-xy
atmosphère|khí quyển
sol|đất
érosion|xói mòn
fondre|tan chảy
température|nhiệt độ
volcan|núi lửa
océan|đại dương
côte|bờ biển
récolte|vụ mùa
moisson|thu hoạch
agriculture|nông nghiệp
bétail|vật nuôi, gia súc
faune|động vật hoang dã
extinction|sự tuyệt chủng
emballage|bao bì
eaux usées|nước thải
pesticide|thuốc trừ sâu
reboisement|trồng lại rừng
carbone|các-bon` },
    { id: "v2", title: "Truyền thông và tin tức", titleEn: "Media and news", words: `journal télévisé|bản tin
diffuser|phát sóng
éditer|xuất bản
rédacteur|biên tập viên
chroniqueur|người viết chuyên mục
censure|sự kiểm duyệt
propagande|tuyên truyền
rumeur|tin đồn
fausse information|tin giả
allégation|cáo buộc
document|tài liệu
préjugé|định kiến
objectif|khách quan
crédible|đáng tin
vérifier|xác minh
enquêter|điều tra
scandale|vụ bê bối
célébrité|người nổi tiếng
publicité|quảng cáo
campagne|chiến dịch
tendance|xu hướng
viral|lan truyền
influence|ảnh hưởng
influenceur|người có sức ảnh hưởng
s'abonner|đăng ký theo dõi
documentaire|phim tài liệu
conférence de presse|họp báo
annonce|thông báo chính thức
déclaration|tuyên bố
correspondant|phóng viên thường trú
magazine|tạp chí
chaîne|kênh
présentateur|người dẫn chương trình
reproche|lời trách móc
discuter|thảo luận
slogan|khẩu hiệu
tribune|bục phát biểu
sensationnel|gây giật gân
agence de presse|hãng thông tấn
éditorial|xã luận
sondage|cuộc thăm dò
interview|phỏng vấn
anonyme|ẩn danh
exagérer|phóng đại
désinformation|thông tin sai lệch
bulletin|bản tin ngắn
sujet|chủ đề
commentaire|bình luận
forum|diễn đàn
actualité|tin tức` },
    { id: "v3", title: "Kinh doanh và kinh tế", titleEn: "Business and economics", words: `marché du travail|thị trường lao động
ralentissement|suy thoái nhẹ
bénéfices|lợi nhuận
perte|khoản lỗ
chiffre d'affaires|doanh thu
investissement|đầu tư
investisseur|nhà đầu tư
actionnaire|cổ đông
action|cổ phiếu
part de marché|thị phần
rivalité|sự đối đầu cạnh tranh
concurrent|đối thủ cạnh tranh
stratégie|chiến lược
marchander|mặc cả, trả giá
partenariat|quan hệ đối tác
fusion|sáp nhập
start-up|công ty khởi nghiệp
entrepreneur|doanh nhân
succursale|chi nhánh
siège social|trụ sở chính
approvisionnement|nguồn cung
besoin|nhu cầu
importer|nhập khẩu
exporter|xuất khẩu
quota|hạn ngạch
commerce|thương mại
prêt|khoản vay
hypothèque|khoản thế chấp vay mua nhà
passif|khoản nợ phải trả
crédit|tín dụng
taux d'intérêt|lãi suất
actif|tài sản
déficit|thâm hụt
excédent|thặng dư
productivité|năng suất
efficacité|hiệu quả
sous-traiter|thầu phụ
licencier|sa thải
démissionner|nghỉ việc, bỏ việc
partie prenante|bên liên quan
marketing|tiếp thị
fidélité à la marque|lòng trung thành với thương hiệu
consommateur|người tiêu dùng
vente au détail|bán lẻ
vente en gros|bán buôn
faillite|phá sản
clientèle|khách hàng tập thể
produit intérieur brut|tổng sản phẩm quốc nội
bourse|thị trường chứng khoán
rentabilité|khả năng sinh lời` },
    { id: "v4", title: "Quan hệ và xã hội", titleEn: "Relationships and society", words: `communauté|cộng đồng
génération|thế hệ
genre|giới tính
égalité|bình đẳng
discrimination|sự phân biệt đối xử
minorité|thiểu số
majorité|đa số
culture|văn hóa
croyance|niềm tin
religion|tôn giáo
valeurs|giá trị
tolérance|sự khoan dung
harmonie|sự hài hòa
conflit|xung đột
coopérer|hợp tác
bénévole|tình nguyện viên
association caritative|tổ chức từ thiện
faire un don|quyên góp
obligation|nghĩa vụ
liberté|tự do
justice|công lý
criminalité|tội phạm
punition|hình phạt
violence|bạo lực
pauvreté|nghèo đói
sans-abri|vô gia cư
rural|thuộc nông thôn
urbain|thuộc thành thị
population|dân số
migration|sự di cư
réfugié|người tị nạn
intégration|sự hòa nhập
attente|kỳ vọng
gratitude|lòng biết ơn
loyauté|sự trung thành
réputation|danh tiếng
hospitalité|lòng hiếu khách
témoin passif|người đứng ngoài
stéréotype|định kiến rập khuôn
déception|sự thất vọng
citoyenneté|quyền công dân
légal|hợp pháp
fossé social|khoảng cách xã hội
classe sociale|giai cấp xã hội
groupe ethnique|nhóm dân tộc
compatriote|đồng bào
voisinage|láng giềng
solidarité|sự đoàn kết
fraternité|tình anh em
pluralisme|đa nguyên` },
  ],
  c1: [
    { id: "v1", title: "Học thuật và nghiên cứu", titleEn: "Academic study and research", words: `théorie|lý thuyết
analyse|sự phân tích
méthode|phương pháp
variable|biến số
évaluer|đánh giá
interpréter|diễn giải
inférence|sự suy luận
empirique|dựa trên thực nghiệm
phénomène|hiện tượng
paradigme|mô hình tư duy
cadre|khung lý thuyết
résumé|bản tóm tắt
citation|trích dẫn
bibliographie|thư mục tài liệu
revue scientifique|tạp chí khoa học
thèse|luận đề
examen minutieux|sự xem xét kỹ lưỡng
rigoureux|chặt chẽ
systématique|có hệ thống
subjectif|chủ quan
crédibilité|tính đáng tin
validité|tính hợp lệ
fiabilité|độ tin cậy
postuler|đề xuất giả định
dériver|suy ra
déduire|suy diễn
induire|quy nạp
prémisse|tiền đề
implication|hệ quả
importance|ý nghĩa
anomalie|điều bất thường
quantitatif|định lượng
qualitatif|định tính
statistique|số liệu thống kê
éthique|đạo đức học thuật
enquête|sự tìm hiểu
discipline|ngành học
érudit|học giả
universitaire|thuộc học thuật
élaborer|trình bày chi tiết
étayer|chứng minh
réfuter|bác bỏ
corroborer|xác nhận
taxonomie|hệ thống phân loại
conjecture|phỏng đoán
évaluateur|người bình duyệt
causalité|quan hệ nhân quả
cohorte|nhóm nghiên cứu
méthodologie|phương pháp luận
corrélation|tương quan` },
    { id: "v2", title: "Chính trị và xã hội", titleEn: "Politics and society", words: `parlement|quốc hội
élection|cuộc bầu cử
candidat|ứng cử viên
bulletin de vote|lá phiếu
mandat|nhiệm vụ được ủy thác
règlement|quy định
constitution|hiến pháp
souveraineté|chủ quyền
diplomatie|ngoại giao
traité|hiệp ước
alliance|liên minh
sanction|lệnh trừng phạt
dictature|chế độ độc tài
autorité|quyền lực, thẩm quyền
bureaucratie|bộ máy quan liêu
corruption|tham nhũng
manifestation|cuộc biểu tình
rébellion|cuộc nổi dậy
révolution|cuộc cách mạng
idéologie|hệ tư tưởng
nationalisme|chủ nghĩa dân tộc
iniquité|sự bất công
protection sociale|phúc lợi
retraite|lương hưu
subvention|khoản trợ cấp
fiscalité|việc đánh thuế
déréglementation|sự bãi bỏ quy định
privatisation|tư nhân hóa
monopole|độc quyền
lobbying|vận động hành lang
manifeste|tuyên ngôn chính sách
veto|quyền phủ quyết
amendement|sự sửa đổi
juridiction|thẩm quyền pháp lý
verdict|phán quyết
accusé|bị cáo
poursuite|việc truy tố
témoignage|lời khai
immunité|quyền miễn trừ
recensement|cuộc điều tra dân số
démographique|thuộc nhân khẩu học
ministère|bộ, cơ quan nhà nước
destitution|sự luận tội
électorat|cử tri
référendum|trưng cầu dân ý
gouvernement|chính phủ
député|đại biểu quốc hội
scrutin|cuộc bỏ phiếu
campagne électorale|chiến dịch bầu cử
opposition|phe đối lập` },
    { id: "v3", title: "Nghệ thuật và văn hóa", titleEn: "Arts and culture", words: `esthétique|mỹ học
sculpture|điêu khắc
architecture|kiến trúc
ballet|ba-lê
orchestre|dàn nhạc
symphonie|bản giao hưởng
compositeur|nhà soạn nhạc
poésie|thơ ca
récit|câu chuyện, tự sự
protagoniste|nhân vật chính
antagoniste|nhân vật phản diện
intrigue|cốt truyện
thème|chủ đề
métaphore|ẩn dụ
symbolisme|chủ nghĩa biểu tượng
satire|châm biếm
tragédie|bi kịch
comédie|hài kịch
folklore|văn hóa dân gian
rituel|nghi lễ
cérémonie|buổi lễ
artisanat|tay nghề thủ công
artisan|nghệ nhân
imagerie|hình ảnh văn chương
rythme|nhịp điệu
mélodie|giai điệu
improviser|ứng tác
audition|buổi thử giọng
critique d'art|nhà phê bình
mécène|người bảo trợ
galerie|phòng trưng bày
toile|vải vẽ tranh
pigment|bột màu
coup de pinceau|nét cọ
Renaissance|thời kỳ Phục hưng
baroque|phong cách Ba-rốc
impressionnisme|trường phái Ấn tượng
modernisme|chủ nghĩa hiện đại
avant-garde|tiên phong
culturel|thuộc văn hóa
argot|tiếng lóng
expression idiomatique|thành ngữ
proverbe|tục ngữ
anecdote|giai thoại
légende|truyền thuyết
mythe|thần thoại
antique|cổ đại
médiéval|thời trung cổ
contemporain|đương đại
authentique|chân thật` },
    { id: "v4", title: "Lập luận và diễn đạt", titleEn: "Argument and expression", words: `affirmer|khẳng định
concéder|thừa nhận
contester|tranh chấp
renforcer|củng cố
mettre en lumière|làm nổi bật
illustrer|minh họa
exemplifier|làm ví dụ cho
esquisser|phác thảo
résumer|tóm tắt
paraphraser|diễn đạt lại
obscur|mơ hồ, khó hiểu
limpide|rõ ràng, sáng sủa
cohérent|mạch lạc
concis|súc tích
persuasif|có sức thuyết phục
expressif|biểu cảm
connotation|hàm ý
dénotation|nghĩa đen
ton|giọng điệu
registre|văn phong
jargon|thuật ngữ chuyên ngành
verbeux|dài dòng
laconique|cộc lốc
vague|mơ hồ, không rõ
précis|chính xác
insaisissable|khó nắm bắt
profond|sâu sắc
superficiel|hời hợt
insignifiant|tầm thường
perspicace|sắc sảo
minutieux|kỹ lưỡng
plausible|có vẻ hợp lý
douteux|đáng ngờ
apparent|bề ngoài
ténu|mong manh, yếu ớt
dogmatique|giáo điều
résistant|dẻo dai, cứng cỏi
ingénieux|khéo léo, tài tình
hypocrisie|đạo đức giả
partagé|mâu thuẫn trong lòng
pertinent|thích đáng, liên quan
convaincant|thuyết phục
tangible|hữu hình, rõ ràng
affaiblir|làm yếu đi
insinuer|ám chỉ
éluder|lảng tránh
lapidaire|ngắn gọn súc tích
exhaustif|đầy đủ, toàn diện
clair|rõ ràng
subtil|tinh tế` },
  ],
};
