// es vocabulary expansion: 1000 extra words (200 per level, 4 units per level).
// Format: "word|Vietnamese meaning". Only append units at the END of each level; never change existing IDs.
// Units use IDs v1..v4 so they never collide with base units. Each word is unique within the course.
export default {
  a1: [
    { id: "v1", title: "Đồ vật và màu sắc", titleEn: "Objects and colours", words: `lámpara|đèn bàn
reloj|đồng hồ treo tường
espejo|cái gương
toalla|khăn tắm
jabón|xà phòng
cepillo de dientes|bàn chải đánh răng
paraguas|cái ô
ordenador|máy tính
televisor|ti vi
cámara|máy ảnh
botella|cái chai
taza|cái tách
cuchara|cái thìa
tenedor|cái nĩa
cuchillo|con dao
olla|cái nồi
sartén|cái chảo
cesta|cái giỏ
caja|cái hộp
pantalones|quần dài
calcetines|tất
gafas|kính mắt
cinturón|thắt lưng
chaqueta|áo khoác
jersey|áo len
abrigo|áo choàng dài
bufanda|khăn quàng cổ
guantes|găng tay
percha|móc treo quần áo
regla|thước kẻ
goma|cục tẩy
calculadora|máy tính bỏ túi
sobre|phong bì
sello|tem thư
papel|giấy
foto|bức ảnh
vela|cây nến
jarrón|bình hoa
cuaderno|vở
mochila|ba lô
amarillo|màu vàng
negro|màu đen
blanco|màu trắng
marrón|màu nâu
rosa|màu hồng
gris|màu xám
morado|màu tím
naranja|màu cam
rojo|màu đỏ
tijeras|cái kéo` },
    { id: "v2", title: "Thức ăn và đồ uống", titleEn: "Food and drink", words: `arroz|cơm, gạo
carne|thịt
gambas|con tôm
huevo|quả trứng
queso|pho mát
mantequilla|bơ
leche|sữa
té|trà
zumo|nước ép
cerveza|bia
vino|rượu vang
pimienta|hạt tiêu
ensalada|rau trộn
pasta|mì ống
pizza|bánh pizza
bocadillo|bánh mì kẹp
tarta|bánh ngọt
galleta|bánh quy
helado|kem
plátano|quả chuối
uva|quả nho
fresa|quả dâu tây
limón|quả chanh
patata|khoai tây
tomate|cà chua
zanahoria|cà rốt
cebolla|hành tây
col|bắp cải
seta|nấm
maíz|ngô
verdura|rau củ
restaurante|nhà hàng
lleno|no bụng
sediento|khát nước
hornear|nướng bánh
asar a la parrilla|nướng trên vỉ
pelar|gọt vỏ
cortar en rodajas|thái lát
picar|băm, thái nhỏ
picante|cay
ácido|chua
dulce|ngọt
amargo|đắng
fresco|tươi
congelado|đông lạnh
cuenco|cái bát
mermelada|mứt
miel|mật ong
yogur|sữa chua
sopa|canh, súp` },
    { id: "v3", title: "Nơi chốn và đi lại", titleEn: "Places and getting around", words: `carretera|con đường
puente|cây cầu
correos|bưu điện
iglesia|nhà thờ
museo|bảo tàng
pueblo|ngôi làng
taxi|xe taxi
coche|ô tô
bicicleta|xe đạp
moto|xe máy
avión|máy bay
barco|thuyền
paso de peatones|lối qua đường
semáforo|đèn giao thông
recto|thẳng phía trước
al lado de|bên cạnh
detrás|phía sau
delante|phía trước
esquina|góc đường
piso|tầng
ascensor|thang máy
escaleras|cầu thang
salida|lối ra
aparcamiento|bãi đỗ xe
itinerario|lộ trình
conducir|lái xe
tranvía|xe điện
metro|tàu điện ngầm
acera|vỉa hè
túnel|đường hầm
rotonda|vòng xuyến
cruce|ngã tư
autopista|đường cao tốc
cine|rạp chiếu phim
teatro|nhà hát
fábrica|nhà máy
granja|trang trại
taller|gara sửa xe
gasolinera|trạm xăng
parada de autobús|trạm xe buýt
panadería|tiệm bánh mì
rascacielos|nhà chọc trời
peluquería|tiệm cắt tóc
tienda de ropa|cửa hàng quần áo
estatua|bức tượng
carril bici|làn xe đạp
peatón|người đi bộ
vía|đường ray
gasolinero|nhân viên trạm xăng
rotonda de tráfico|vòng xuyến giao thông` },
    { id: "v4", title: "Thời gian và thời tiết", titleEn: "Time and weather", words: `año|năm
minuto|phút
segundo|giây
ahora|bây giờ
más tarde|sau này
lluvioso|có mưa
templado|ấm
luna|mặt trăng
estrella|ngôi sao
cielo|bầu trời
mar|biển
montaña|núi
río|sông
bosque|rừng
cien|một trăm
mil|một nghìn
mitad|một nửa
cero|số không
veinte|hai mươi
millón|một triệu
mediodía|buổi trưa
anochecer|buổi tối
medianoche|nửa đêm
amanecer|bình minh
atardecer|hoàng hôn
calendario|lịch
fecha|ngày tháng
tiempo|thời gian
habitual|thông thường
hace|cách đây
después|sau
durante|trong suốt
quincena|hai tuần
década|thập kỷ
siglo|thế kỷ
esta noche|tối nay
hora del almuerzo|giờ ăn trưa
otoño|mùa thu
soleado|có nắng
nublado|có mây
nieve|tuyết
lunes|thứ Hai
martes|thứ Ba
mes|tháng
madrugada|rạng sáng
ocasionalmente|thỉnh thoảng
enseguida|ngay lập tức
casi|gần như
puntual|đúng giờ
anteayer|hôm kia` },
  ],
  a2: [
    { id: "v1", title: "Nhà cửa và đồ đạc", titleEn: "Home and furniture", words: `cuarto de baño|phòng tắm
salón|phòng khách
balcón|ban công
techo|mái nhà
pared|bức tường
alfombra|tấm thảm
sofá|ghế sofa
armario|tủ đựng đồ
nevera|tủ lạnh
horno|lò nướng
lavadora|máy giặt
aspiradora|máy hút bụi
cortina|rèm cửa
almohada|cái gối
manta|cái chăn
sábana|khăn trải giường
estante|cái kệ
cajón|ngăn kéo
inquilino|người thuê nhà
habitación|căn phòng
calefacción|hệ thống sưởi
reparar|sửa chữa
limpio|sạch sẽ
sucio|bẩn
cómodo|thoải mái
muebles|đồ nội thất
decorar|trang trí
electricidad|điện
dirección|địa chỉ
lavavajillas|máy rửa bát
fregadero|bồn rửa
grifo|vòi nước
inodoro|nhà vệ sinh
ducha|vòi sen
luz|đèn, ánh sáng
pasillo|hành lang
desván|gác mái
sótano|tầng hầm
valla|hàng rào
timbre|chuông cửa
fregona|cây lau nhà
escoba|cây chổi
cubo|cái xô
esponja|miếng bọt biển
hervidor|ấm đun nước
escalera|cầu thang
cojín|gối tựa
detergente|bột giặt
persiana|rèm cuốn
bombilla|bóng đèn` },
    { id: "v2", title: "Mua sắm và tiền bạc", titleEn: "Shopping and money", words: `dependiente|nhân viên bán hàng
descuento|giảm giá
rebajas|đợt giảm giá
coste|chi phí
efectivo|tiền mặt
cambio|tiền thừa
reembolso|hoàn tiền
talla|cỡ, kích thước
probarse|thử đồ
ganga|món hời
cola|hàng người xếp hàng
carrito|xe đẩy hàng
producto|sản phẩm
en línea|trực tuyến
entrega|giao hàng
moneda|đồng xu
gastar|tiêu tiền
deber|nợ
ingresos|thu nhập
impuesto|thuế
grandes almacenes|cửa hàng bách hóa
supermercado|siêu thị
cajero de tienda|thu ngân
gratis|miễn phí
etiqueta|nhãn giá
puesto de mercado|quầy hàng chợ
cupón|phiếu giảm giá
catálogo|danh mục sản phẩm
bolsa|túi mua sắm
comprador compulsivo|người nghiện mua sắm
estafa|hàng bị hét giá
de segunda mano|đã qua sử dụng
nuevo a estrenar|mới toanh
rebajado|đã giảm giá
en stock|còn hàng
agotado|hết hàng
factura|hóa đơn
envolver|gói (quà)
promoción|khuyến mãi
comprar|mua
vender|bán
cartera|ví tiền
pedir|đặt hàng
cheque|séc
saldo|số dư
color|màu sắc
tamaño|kích cỡ
tarifa|mức giá
importe|số tiền
recibo de compra|hóa đơn mua hàng` },
    { id: "v3", title: "Sức khỏe và cơ thể", titleEn: "Health and the body", words: `cara|khuôn mặt
oreja|tai
nariz|mũi
boca|miệng
lengua|lưỡi
cuello|cổ
hombro|vai
brazo|cánh tay
dedo|ngón tay
pecho|ngực
estómago|dạ dày
espalda|lưng
pierna|chân
rodilla|đầu gối
pie|bàn chân
corazón|trái tim
sangre|máu
farmacéutico|dược sĩ
pastilla|viên thuốc
gripe|cúm
dolor de garganta|đau họng
dolor de muelas|đau răng
herida|vết thương
venda|băng gạc
receta|đơn thuốc
sano|khỏe mạnh
ejercicio|tập thể dục
dormir|ngủ
débil|yếu
relajarse|thư giãn
vitamina|vitamin
recuperarse|hồi phục
lesionar|làm bị thương
mareo|chóng mặt
náusea|buồn nôn
hinchado|sưng
moratón|vết bầm
quemadura|vết bỏng
corte|vết cắt
radiografía|chụp X-quang
tensión arterial|huyết áp
termómetro|nhiệt kế
operación|ca phẫu thuật
ambulancia|xe cứu thương
urgencias|phòng cấp cứu
silla de ruedas|xe lăn
muletas|nạng
dentista|nha sĩ
óptico|bác sĩ mắt
pulmones|phổi` },
    { id: "v4", title: "Công việc và nghề nghiệp", titleEn: "Work and jobs", words: `empleado|nhân viên
empleador|chủ lao động
solicitud|đơn xin việc
habilidad|kỹ năng
jubilarse|nghỉ hưu
desempleado|thất nghiệp
agricultor|nông dân
conductor|tài xế
cocinero|đầu bếp
policía|cảnh sát
bombero|lính cứu hỏa
soldado|người lính
piloto|phi công
periodista|nhà báo
diseñador|nhà thiết kế
contable|kế toán viên
abogado|luật sư
secretario|thư ký
recepcionista|lễ tân
turno|ca làm việc
horas extra|làm thêm giờ
informe|báo cáo
tarea|nhiệm vụ
hoja de horas|bảng chấm công
fábrica de producción|nhà máy
taller de trabajo|xưởng
negocio|doanh nghiệp
cliente|khách hàng doanh nghiệp
salario por hora|tiền công
prima|tiền thưởng
nómina|phiếu lương
vacante|vị trí tuyển dụng
contratar|tuyển dụng
currículum|sơ yếu lý lịch
supervisor|người giám sát
asistente|trợ lý
becario|thực tập sinh
sala de reuniones|phòng họp
lugar de trabajo|nơi làm việc
profesión|nghề nghiệp
obrero|công nhân
jardinero|người làm vườn
albañil|thợ xây
mecánico|thợ máy
peluquero|thợ cắt tóc
electricista|thợ điện
fontanero|thợ sửa ống nước
arquitecto|kiến trúc sư
banquero|nhân viên ngân hàng
panadero|thợ làm bánh` },
  ],
  b1: [
    { id: "v1", title: "Du lịch và sân bay", titleEn: "Travel and the airport", words: `visado|thị thực
tarjeta de embarque|thẻ lên máy bay
llegada|sự đến nơi
cancelar|hủy bỏ
puerta de embarque|cổng lên máy bay
aduana|hải quan
turista|khách du lịch
guía|hướng dẫn viên
visita turística|tham quan
itinerario de viaje|lịch trình chuyến đi
alojamiento|chỗ ở
camping|khu cắm trại
complejo turístico|khu nghỉ dưỡng
playa|bãi biển
isla|hòn đảo
valle|thung lũng
cascada|thác nước
lago|hồ
desierto|sa mạc
capital|thủ đô
frontera|biên giới
tipo de cambio|tỷ giá
emergencia|tình huống khẩn cấp
embajada|đại sứ quán
excursión|chuyến tham quan có hướng dẫn
vista|quang cảnh
paisaje|phong cảnh
mochilero|người đi bụi
vagar|đi lang thang
desconocido|lạ lẫm
local|người địa phương
extranjero|thuộc nước ngoài
aerolínea|hãng hàng không
asiento|chỗ ngồi
pista|đường băng
terminal|nhà ga sân bay
control de seguridad|kiểm tra an ninh
pasajero|hành khách
desfase horario|lệch múi giờ
protector solar|kem chống nắng
albergue|nhà nghỉ bình dân
senderismo|đi bộ đường dài
templo|ngôi đền
castillo|lâu đài
reserva|đặt chỗ
visita guiada|tham quan có hướng dẫn
autobús|xe buýt
encuentro|cuộc gặp gỡ
azafata|tiếp viên hàng không
conexión|chuyến bay nối chuyến` },
    { id: "v2", title: "Học tập và thi cử", titleEn: "Study and exams", words: `examen|kỳ thi
nota|điểm số
universidad|trường đại học
facultad|trường cao đẳng
conferencia|bài giảng
semestre|học kỳ
trabajo asignado|bài tập được giao
ensayo|bài luận
tesis|luận văn
laboratorio|phòng thí nghiệm
matrícula|học phí
curso|khóa học
asignatura|môn học
repasar|ôn tập
memorizar|ghi nhớ
concentrarse|tập trung
explicar|giải thích
calificar|chấm điểm
suspender|trượt
aprobar|đỗ
certificado|chứng chỉ
literatura|văn học
geografía|địa lý
química|hóa học
física|vật lý
biología|sinh học
matemáticas|toán học
economía|kinh tế học
psicología|tâm lý học
filosofía|triết học
traducción|bản dịch
gramática|ngữ pháp
pronunciación|cách phát âm
libro de texto|sách giáo khoa
apuntes|ghi chú
programa de estudios|đề cương môn học
lección|bài học
prueba|bài kiểm tra ngắn
deberes|bài tập về nhà
compañero de clase|bạn cùng lớp
profesor particular|gia sư
curso académico|năm học
director|hiệu trưởng
campus|khuôn viên trường
profesor universitario|giảng viên
bolígrafo|bút bi
tiza|phấn
pizarra|bảng đen
examen de prueba|bài thi thử
promedio|điểm trung bình` },
    { id: "v3", title: "Công nghệ và internet", titleEn: "Technology and the internet", words: `teléfono inteligente|điện thoại thông minh
portátil|máy tính xách tay
tableta|máy tính bảng
teclado|bàn phím
ratón|chuột máy tính
cargador|bộ sạc
nombre de usuario|tên đăng nhập
inicio de sesión|đăng nhập
descargar|tải xuống
subir|tải lên
instalar|cài đặt
actualizar|cập nhật
programa informático|phần mềm
aplicación|ứng dụng
sitio web|trang web
navegador|trình duyệt
buscador|công cụ tìm kiếm
correo electrónico|thư điện tử
mensaje de texto|tin nhắn văn bản
notificación|thông báo
videollamada|cuộc gọi video
wifi|wifi
señal|tín hiệu
base de datos|cơ sở dữ liệu
cifrado|mã hóa
pirata informático|tin tặc
virus|vi-rút
copia de seguridad|bản sao lưu
redes sociales|mạng xã hội
blog|blog
pódcast|podcast
transmisión en directo|phát trực tuyến
inteligencia artificial|trí tuệ nhân tạo
robot|người máy
hardware|phần cứng
aparato|tiện ích công nghệ
digital|thuộc kỹ thuật số
inventar|phát minh
tecnología|công nghệ
máquina|máy móc
automático|tự động
programa|chương trình máy tính
código|mã lập trình
error|lỗi
bloquearse|treo, sập
conectar|kết nối
recargar|sạc
borrar|xóa
impresora|máy in
altavoz|loa` },
    { id: "v4", title: "Cảm xúc và tính cách", titleEn: "Feelings and personality", words: `feliz|vui vẻ
enfadado|tức giận
asustado|sợ hãi
sorprendido|ngạc nhiên
emocionado|háo hức
aburrido|chán
confundido|bối rối
avergonzado|xấu hổ
solitario|cô đơn
celoso|ghen tị
agradecido|biết ơn
paciente|kiên nhẫn
honesto|trung thực
generoso|hào phóng
valiente|dũng cảm
tímido|nhút nhát
educado|lịch sự
grosero|thô lỗ
listo|thông minh
perezoso|lười biếng
cuidadoso|cẩn thận
creativo|sáng tạo
gracioso|hài hước
serio|nghiêm túc
egoísta|ích kỷ
ambicioso|có tham vọng
modesto|khiêm tốn
curioso|tò mò
emotivo|dễ xúc động
humor|tâm trạng
personalidad|tính cách
comportamiento|hành vi
actitud|thái độ
relación|mối quan hệ
confianza|tin tưởng
discutir|tranh cãi
perdonar|tha thứ
disculparse|xin lỗi
animar|khuyến khích
admirar|ngưỡng mộ
bromear|trêu chọc
dulce persona|dịu dàng
compasivo|thông cảm
prudente|thận trọng
orgulloso|tự hào
deprimido|chán nản
contento|hài lòng
frustrado|thất vọng
sensible|nhạy cảm
ansioso|lo âu` },
  ],
  b2: [
    { id: "v1", title: "Môi trường và thiên nhiên", titleEn: "Environment and nature", words: `patrón climático|kiểu thời tiết
calentamiento global|sự nóng lên toàn cầu
compost|phân trộn hữu cơ
vertedero|bãi chôn lấp rác
emisión|khí thải
energía renovable|năng lượng tái tạo
energía solar|năng lượng mặt trời
combustible fósil|nhiên liệu hóa thạch
sequía|hạn hán
inundación|lũ lụt
terremoto|động đất
huracán|bão lớn
amenazado|bị đe dọa
especie|loài
hábitat|môi trường sống
deforestación|nạn phá rừng
conservación|sự bảo tồn
preservar|gìn giữ
ecológico|thuộc sinh thái
respetuoso con el medio ambiente|thân thiện với môi trường
reducir|cắt giảm
reutilizar|tái sử dụng
eliminar|vứt bỏ, xử lý
tóxico|độc hại
sustancia química|hóa chất
polvo|bụi
smog|sương khói
oxígeno|ô-xy
suelo|đất
erosión|xói mòn
derretirse|tan chảy
temperatura|nhiệt độ
volcán|núi lửa
océano|đại dương
costa|bờ biển
cosecha|vụ mùa
cosechar|thu hoạch
agricultura|nông nghiệp
ganado|vật nuôi, gia súc
fauna|động vật hoang dã
extinción|sự tuyệt chủng
embalaje|bao bì
aguas residuales|nước thải
pesticida|thuốc trừ sâu
repoblación forestal|trồng lại rừng
carbono|các-bon
lluvia ácida|mưa axit
cambio climático|biến đổi khí hậu
contaminar|làm ô nhiễm
arrecife|rạn san hô` },
    { id: "v2", title: "Truyền thông và tin tức", titleEn: "Media and news", words: `noticiario|bản tin
emitir|phát sóng
audiencia|khán giả
publicar|xuất bản
redactor|biên tập viên
artículo|bài báo
columnista|người viết chuyên mục
censura|sự kiểm duyệt
propaganda|tuyên truyền
rumor|tin đồn
noticia falsa|tin giả
acusación|cáo buộc
documento|tài liệu
punto de vista|quan điểm
prejuicio|định kiến
creíble|đáng tin
verificar|xác minh
investigar|điều tra
escándalo|vụ bê bối
famoso|người nổi tiếng
anuncio|quảng cáo
campaña|chiến dịch
viral|lan truyền
influencia|ảnh hưởng
influencer|người có sức ảnh hưởng
suscribirse|đăng ký theo dõi
documental|phim tài liệu
rueda de prensa|họp báo
anuncio oficial|thông báo chính thức
declaración|tuyên bố
corresponsal|phóng viên thường trú
diario|báo
canal|kênh
presentador|người dẫn chương trình
reproche|lời trách móc
boletín|bản tin ngắn
eslogan|khẩu hiệu
tribuna|bục phát biểu
sensacionalista|gây giật gân
entrevista|phỏng vấn
anónimo|ẩn danh
crónica|bài ký sự
agencia de noticias|hãng thông tấn
editorial|xã luận
sondeo|cuộc thăm dò
exagerar|phóng đại
desinformación|thông tin sai lệch
comentario|bình luận
foro|diễn đàn
cibermedio|truyền thông trực tuyến` },
    { id: "v3", title: "Kinh doanh và kinh tế", titleEn: "Business and economics", words: `mercado laboral|thị trường lao động
recesión leve|suy thoái nhẹ
crecimiento|tăng trưởng
beneficios|lợi nhuận
pérdida|khoản lỗ
ingresos totales|doanh thu
gasto|khoản chi phí
inversor|nhà đầu tư
accionista|cổ đông
acción|cổ phiếu
cuota de mercado|thị phần
rivalidad|sự đối đầu cạnh tranh
competidor|đối thủ cạnh tranh
estrategia|chiến lược
regatear|mặc cả, trả giá
asociación|quan hệ đối tác
fusión|sáp nhập
empresa emergente|công ty khởi nghiệp
emprendedor|doanh nhân
sucursal|chi nhánh
sede central|trụ sở chính
suministro|nguồn cung
necesidad|nhu cầu
importar|nhập khẩu
exportar|xuất khẩu
cuota|hạn ngạch
comercio|thương mại
préstamo|khoản vay
hipoteca|khoản thế chấp vay mua nhà
pasivo|khoản nợ phải trả
crédito|tín dụng
tipo de interés|lãi suất
activo|tài sản
superávit|thặng dư
eficiencia|hiệu quả
subcontratar|thầu phụ
despedir|sa thải
dimitir|nghỉ việc, bỏ việc
parte interesada|bên liên quan
marketing|tiếp thị
lealtad a la marca|lòng trung thành với thương hiệu
consumidor|người tiêu dùng
venta al por menor|bán lẻ
venta al por mayor|bán buôn
quiebra|phá sản
clientela|khách hàng tập thể
rentabilidad|khả năng sinh lời
pymes|doanh nghiệp vừa và nhỏ
fondos de inversión|quỹ đầu tư
aranceles|thuế quan` },
    { id: "v4", title: "Quan hệ và xã hội", titleEn: "Relationships and society", words: `comunidad|cộng đồng
generación|thế hệ
género|giới tính
discriminación|sự phân biệt đối xử
minoría|thiểu số
mayoría|đa số
cultura|văn hóa
creencia|niềm tin
religión|tôn giáo
valores|giá trị
tolerancia|sự khoan dung
armonía|sự hài hòa
conflicto|xung đột
cooperar|hợp tác
voluntario|tình nguyện viên
organización benéfica|tổ chức từ thiện
donar|quyên góp
obligación|nghĩa vụ
libertad|tự do
justicia|công lý
delincuencia|tội phạm
castigo|hình phạt
violencia|bạo lực
pobreza|nghèo đói
sin hogar|vô gia cư
rural|thuộc nông thôn
urbano|thuộc thành thị
población|dân số
migración|sự di cư
refugiado|người tị nạn
integración|sự hòa nhập
expectativa|kỳ vọng
gratitud|lòng biết ơn
lealtad|sự trung thành
reputación|danh tiếng
hospitalidad|lòng hiếu khách
espectador pasivo|người đứng ngoài
estereotipo|định kiến rập khuôn
decepción|sự thất vọng
ciudadanía|quyền công dân
legal|hợp pháp
brecha social|khoảng cách xã hội
clase social|giai cấp xã hội
grupo étnico|nhóm dân tộc
compatriota|đồng bào
vecindario|láng giềng
solidaridad|sự đoàn kết
fraternidad|tình anh em
pluralismo|đa nguyên
exclusión|sự loại trừ` },
  ],
  c1: [
    { id: "v1", title: "Học thuật và nghiên cứu", titleEn: "Academic study and research", words: `teoría|lý thuyết
método|phương pháp
variable|biến số
evaluar|đánh giá
interpretar|diễn giải
inferencia|sự suy luận
empírico|dựa trên thực nghiệm
paradigma|mô hình tư duy
marco|khung lý thuyết
resumen|bản tóm tắt
cita|trích dẫn
bibliografía|thư mục tài liệu
revista científica|tạp chí khoa học
tesis doctoral|luận đề
escrutinio|sự xem xét kỹ lưỡng
riguroso|chặt chẽ
sistemático|có hệ thống
subjetivo|chủ quan
credibilidad|tính đáng tin
fiabilidad|độ tin cậy
postular|đề xuất giả định
derivar|suy ra
deducir|suy diễn
inducir|quy nạp
suposición|giả định
importancia|ý nghĩa
anomalía|điều bất thường
cuantitativo|định lượng
cualitativo|định tính
estadística|số liệu thống kê
indagación|sự tìm hiểu
disciplina|ngành học
erudito|học giả
académico|thuộc học thuật
elaborar|trình bày chi tiết
fundamentar|chứng minh
taxonomía|hệ thống phân loại
conjetura|phỏng đoán
evaluador|người bình duyệt
causalidad|quan hệ nhân quả
reproducir|tái tạo kết quả
cohorte|nhóm nghiên cứu
metodología|phương pháp luận
muestra|mẫu
contraprueba|kiểm chứng đối chứng
exigencia|yêu cầu nghiêm ngặt
fuente primaria|nguồn sơ cấp
fuente secundaria|nguồn thứ cấp
hallazgo|phát hiện
replicar|tái lập thí nghiệm` },
    { id: "v2", title: "Chính trị và xã hội", titleEn: "Politics and society", words: `parlamento|quốc hội
elección|cuộc bầu cử
candidato|ứng cử viên
papeleta|lá phiếu
mandato|nhiệm vụ được ủy thác
estatuto|đạo luật
reglamento|quy định
constitución|hiến pháp
soberanía|chủ quyền
diplomacia|ngoại giao
tratado|hiệp ước
sanción|lệnh trừng phạt
dictadura|chế độ độc tài
democracia|nền dân chủ
autoridad|quyền lực, thẩm quyền
burocracia|bộ máy quan liêu
corrupción|tham nhũng
protesta|cuộc biểu tình
rebelión|cuộc nổi dậy
revolución|cuộc cách mạng
ideología|hệ tư tưởng
nacionalismo|chủ nghĩa dân tộc
bienestar social|phúc lợi
pensión|lương hưu
subvención|khoản trợ cấp
desregulación|sự bãi bỏ quy định
privatización|tư nhân hóa
monopolio|độc quyền
cabildeo|vận động hành lang
manifiesto|tuyên ngôn chính sách
veto|quyền phủ quyết
enmienda|sự sửa đổi
jurisdicción|thẩm quyền pháp lý
veredicto|phán quyết
apelación|kháng cáo
acusado|bị cáo
acusación formal|việc truy tố
testimonio|lời khai
inmunidad|quyền miễn trừ
censo|cuộc điều tra dân số
demográfico|thuộc nhân khẩu học
ministerio|bộ, cơ quan nhà nước
destitución|sự luận tội
electorado|cử tri
referéndum|trưng cầu dân ý
gobierno|chính phủ
diputado|đại biểu quốc hội
escrutinio electoral|cuộc bỏ phiếu
coalición|liên minh chính trị
oposición|phe đối lập` },
    { id: "v3", title: "Nghệ thuật và văn hóa", titleEn: "Arts and culture", words: `obra maestra|kiệt tác
exposición|cuộc triển lãm
escultura|điêu khắc
arquitectura|kiến trúc
ballet|ba-lê
orquesta|dàn nhạc
sinfonía|bản giao hưởng
compositor|nhà soạn nhạc
poesía|thơ ca
relato|câu chuyện, tự sự
protagonista|nhân vật chính
antagonista|nhân vật phản diện
simbolismo|chủ nghĩa biểu tượng
sátira|châm biếm
tragedia|bi kịch
comedia|hài kịch
folclore|văn hóa dân gian
ritual|nghi lễ
ceremonia|buổi lễ
artesanía|tay nghề thủ công
artesano|nghệ nhân
imaginería|hình ảnh văn chương
ritmo|nhịp điệu
melodía|giai điệu
improvisar|ứng tác
audición|buổi thử giọng
crítico de arte|nhà phê bình
mecenas|người bảo trợ
galería|phòng trưng bày
lienzo|vải vẽ tranh
pigmento|bột màu
pincelada|nét cọ
Renacimiento|thời kỳ Phục hưng
barroco|phong cách Ba-rốc
impresionismo|trường phái Ấn tượng
modernismo|chủ nghĩa hiện đại
vanguardia|tiên phong
cultural|thuộc văn hóa
jerga|tiếng lóng
modismo|thành ngữ
refrán|tục ngữ
anécdota|giai thoại
leyenda|truyền thuyết
mito|thần thoại
antiguo|cổ đại
medieval|thời trung cổ
contemporáneo|đương đại
auténtico|chân thật
exótico|kỳ lạ, ngoại lai
pintor|họa sĩ` },
    { id: "v4", title: "Lập luận và diễn đạt", titleEn: "Argument and expression", words: `afirmar|khẳng định
sostener|cho rằng, tranh luận
conceder|thừa nhận
disputar|tranh chấp
reforzar|củng cố
enfatizar|nhấn mạnh
ilustrar|minh họa
ejemplificar|làm ví dụ cho
esbozar|phác thảo
parafrasear|diễn đạt lại
oscuro|mơ hồ, khó hiểu
lúcido|rõ ràng, sáng sủa
coherente|mạch lạc
conciso|súc tích
persuasivo|có sức thuyết phục
expresivo|biểu cảm
connotación|hàm ý
denotación|nghĩa đen
tono|giọng điệu
registro|văn phong
jerga profesional|thuật ngữ chuyên ngành
prolijo|dài dòng
escueto|cộc lốc
vago|mơ hồ, không rõ
preciso|chính xác
esquivo|khó nắm bắt
profundo|sâu sắc
superficial|hời hợt
trivial|tầm thường
perspicaz|sắc sảo
minucioso|tỉ mỉ
dudoso|đáng ngờ
aparente|bề ngoài
tenue|mong manh, yếu ớt
dogmático|giáo điều
resistente|dẻo dai, cứng cỏi
ingenioso|khéo léo, tài tình
hipocresía|đạo đức giả
dividido|mâu thuẫn trong lòng
pertinente|thích đáng, liên quan
convincente|thuyết phục
agudo|tinh tường
tangible|hữu hình, rõ ràng
debilitar|làm yếu đi
insinuar|ám chỉ
eludir|lảng tránh
lapidario|ngắn gọn súc tích
sutil|tinh tế
exhaustivo|đầy đủ, toàn diện
lacónico|cộc lốc, ngắn gọn` },
  ],
};
