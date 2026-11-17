// Spanish — curriculum aligned with DELE A1 to C1 (60 units: 12 per level).
// Vocabulary: "word|meaning" (unaccented input accepted in typing exercises).
// Sentence building: words separated by spaces, no trailing punctuation.
export default {
  id: "es", name: "Tiếng Tây Ban Nha", native: "Español", flag: "🇪🇸", color: "#EA580C",
  speech: "es-ES", framework: "DELE", typeMode: "word", readingLabel: "từ tiếng Tây Ban Nha",
  readingHint: "Gõ từ tiếng Tây Ban Nha; được phép gõ thiếu dấu (á, é, í, ó, ú, ñ…).",
  desc: "Giáo trình chuẩn DELE A1 → C1: từ vựng, chính tả, ngữ pháp, ghép câu.",
  levels: [
    {
      id: "a1", title: "DELE A1", desc: "Giao tiếp cơ bản: chào hỏi, giới thiệu, gia đình, sinh hoạt.",
      units: [
        {
          id: "1", title: "Chào hỏi và giới thiệu", titleEn: "Greetings and introductions",
          words: `hola|xin chào
gracias|cảm ơn
adiós|tạm biệt
estudiante|sinh viên, học sinh
profesor|giáo viên (nam)
amigo|bạn (nam)
país|đất nước
nombre|tên
buenos días|chào buổi sáng
por favor|làm ơn
perdón|xin lỗi
compañero|bạn cùng lớp`,
          grammar: [
            ["Yo ___ estudiante. (Tôi là sinh viên)", ["soy", "eres", "es", "somos"], 0, "Động từ ser (bản chất) chia với yo: yo soy.", "The verb ser with yo is yo soy."],
            ["¿Cómo te ___? (Bạn tên là gì?)", ["llamas", "llamo", "llama", "llamamos"], 0, "llamarse với tú: tú te llamas.", "llamarse with tú: tú te llamas."],
            ["Ella ___ veinte años. (Cô ấy 20 tuổi)", ["tiene", "es", "está", "tengo"], 0, "Tiếng Tây Ban Nha nói tuổi bằng tener: ella tiene 20 años.", "Spanish uses tener for age: ella tiene 20 años."],
            ["Soy ___ Vietnam. (Tôi đến từ Việt Nam)", ["de", "en", "a", "con"], 0, "Chỉ nguồn gốc dùng giới từ de: soy de Vietnam.", "Origin uses de: soy de Vietnam."],
          ],
          sentences: [
            ["Me llamo Ana y soy estudiante", "Tôi tên là Ana và tôi là sinh viên."],
            ["Él es profesor de español", "Anh ấy là giáo viên tiếng Tây Ban Nha."],
            ["Nosotros somos buenos amigos", "Chúng tôi là những người bạn tốt."],
            ["Buenos días profesor", "Chào buổi sáng, thưa thầy."],
            ["Mucho gusto", "Rất vui được gặp bạn."],
            ["Soy un estudiante nuevo", "Tôi là sinh viên mới."],
            ["Ella es mi mejor amiga", "Cô ấy là bạn thân của tôi."],
          ],
        },
        {
          id: "2", title: "Gia đình và sinh hoạt", titleEn: "Family and daily life",
          words: `familia|gia đình
padre|bố
madre|mẹ
hermano|anh, em trai
casa|ngôi nhà
comer|ăn
beber|uống
hoy|hôm nay
hermana|chị gái, em gái
almuerzo|bữa trưa
noche|buổi tối, đêm
cena|bữa tối`,
          grammar: [
            ["___ dos hermanos. (Tôi có hai anh em trai)", ["Tengo", "Tienes", "Tiene", "Tenemos"], 0, "tener với yo: tengo.", "tener with yo: tengo."],
            ["Nosotros ___ pan. (Chúng tôi ăn bánh mì)", ["comemos", "comes", "come", "comen"], 0, "comer chia với nosotros: comemos.", "comer with nosotros: comemos."],
            ["Esta es ___ casa. (Đây là ngôi nhà của tôi)", ["mi", "mis", "tu", "su"], 0, "Danh từ số ít dùng mi: mi casa.", "Singular noun takes mi: mi casa."],
            ["Hoy ___ en casa. (Hôm nay chúng tôi ở nhà)", ["estamos", "somos", "eres", "tienen"], 0, "Vị trí dùng động từ estar: estamos en casa.", "Location uses estar: estamos en casa."],
          ],
          sentences: [
            ["Mi madre bebe café cada mañana", "Mẹ tôi uống cà phê mỗi sáng."],
            ["Tengo un hermano y una hermana", "Tôi có một anh trai và một chị gái."],
            ["Hoy comemos juntos en casa", "Hôm nay chúng tôi ăn cùng nhau ở nhà."],
            ["A mi hermana le gusta la música", "Chị tôi thích âm nhạc."],
            ["Almorzamos al mediodía", "Chúng tôi ăn trưa lúc giữa trưa."],
            ["Mi hermano trabaja por la noche", "Anh tôi làm việc vào buổi tối."],
            ["Ceno con mi familia", "Tôi ăn tối cùng gia đình."],
            ["Ella se levanta a las seis de la mañana", "Cô ấy dậy lúc sáu giờ sáng."],
          ],
        },
        {
          id: "3", title: "Số đếm, giờ và ngày", titleEn: "Numbers, time and days",
          words: `uno|số một
dos|số hai
hora|giờ
día|ngày
semana|tuần
mañana|ngày mai, buổi sáng
tarde|buổi chiều
noche|buổi tối, đêm
tres|số ba
cuatro|số bốn
minuto|phút
mes|tháng
año|năm`,
          grammar: [
            ["¿Qué hora ___? (Mấy giờ rồi?)", ["es", "son", "está", "tiene"], 0, "Hỏi giờ luôn dùng số ít: ¿Qué hora es?", "Asking the time uses singular: ¿Qué hora es?"],
            ["___ las tres de la tarde. (Bây giờ là 3 giờ chiều)", ["Son", "Es", "Están", "Hay"], 0, "Từ 2 giờ trở lên dùng số nhiều: Son las tres.", "From 2 o'clock onward use plural: Son las tres."],
            ["El lunes voy ___ trabajo. (Thứ Hai tôi đi làm)", ["al", "a la", "del", "en la"], 0, "a + el rút gọn thành al: al trabajo.", "a + el contracts to al: al trabajo."],
            ["La clase empieza ___ las ocho. (Lớp học bắt đầu lúc 8 giờ)", ["a", "en", "de", "por"], 0, "Giờ cụ thể dùng a + las: a las ocho.", "Clock times take a + las: a las ocho."],
          ],
          sentences: [
            ["Son las ocho de la mañana", "Bây giờ là tám giờ sáng."],
            ["Trabajo de lunes a viernes", "Tôi làm việc từ thứ Hai đến thứ Sáu."],
            ["Mañana por la tarde descanso", "Chiều mai tôi nghỉ ngơi."],            ["Son las tres y media de la tarde", "Bây giờ là ba giờ rưỡi chiều."],
            ["La clase empieza a las nueve de la mañana", "Lớp học bắt đầu lúc chín giờ sáng."],
            ["Hoy es miércoles", "Hôm nay là thứ Tư."],
            ["Mi cumpleaños es en mayo", "Sinh nhật của tôi vào tháng Năm."],
            ["Tengo treinta años", "Tôi ba mươi tuổi."],

          ],
        },
        {
          id: "4", title: "Ăn uống và nhà hàng", titleEn: "Eating and restaurants",
          words: `agua|nước
café|cà phê
pan|bánh mì
fruta|trái cây
mesa|cái bàn
camarero|nhân viên phục vụ
cuenta|hóa đơn
rico|ngon
leche|sữa
queso|phô mai
ensalada|món salad
menú|thực đơn
postre|món tráng miệng`,
          grammar: [
            ["¿Me trae un vaso ___ agua? (Cho tôi một ly nước nhé?)", ["de", "con", "en", "para"], 0, "un vaso de agua: một ly nước.", "un vaso de agua: a glass of water."],
            ["La comida ___ muy rica. (Món ăn rất ngon)", ["está", "son", "tiene", "hay"], 0, "Nhận xét hương vị món ăn hiện tại dùng estar.", "Tasting/current food quality uses estar."],
            ["Queremos ___ mesa cerca de la ventana. (Chúng tôi muốn một bàn gần cửa sổ)", ["una", "un", "unos", "el"], 0, "mesa giống cái số ít → una mesa.", "mesa is feminine singular → una mesa."],
            ["Yo ___ un café con leche. (Tôi muốn một cà phê sữa)", ["quiero", "quieres", "quiere", "queremos"], 0, "querer chia với yo: quiero.", "querer with yo: quiero."],
          ],
          sentences: [
            ["Quisiera una taza de café caliente", "Tôi muốn một tách cà phê nóng."],
            ["Esta fruta fresca está muy dulce", "Trái cây tươi này rất ngọt."],
            ["Por favor traiga la cuenta", "Làm ơn mang hóa đơn giúp tôi."],            ["Quiero una ensalada y un vaso de leche", "Tôi muốn một đĩa salad và một ly sữa."],
            ["El menú del día es muy bueno", "Thực đơn hôm nay rất ngon."],
            ["¿Me trae el postre, por favor?", "Làm ơn mang món tráng miệng giúp tôi."],
            ["El queso de este restaurante es delicioso", "Phô mai ở nhà hàng này rất ngon."],

          ],
        },
        {
          id: "x1", title: "Mua sắm và giá cả", titleEn: "Shopping and prices",
          words: `tienda|cửa hàng
precio|giá cả
dinero|tiền
barato|rẻ
caro|đắt
camisa|áo sơ mi
zapato|giày
pagar|thanh toán
mercado|chợ
oferta|khuyến mãi, giảm giá
talla|cỡ (quần áo)
probar|thử (quần áo)`,
          grammar: [
            ["¿Cuánto ___ esta camisa? (Chiếc áo này giá bao nhiêu?)", ["cuesta", "cuestan", "vale", "es"], 0, "camisa số ít → ¿Cuánto cuesta?", "Singular subject → ¿Cuánto cuesta?"],
            ["Estos zapatos son muy ___. (Đôi giày này rất đẹp/rẻ)", ["baratos", "barato", "barata", "baratas"], 0, "zapatos giống đực số nhiều → baratos.", "zapatos is masculine plural → baratos."],
            ["Quiero pagar ___ tarjeta. (Tôi muốn trả bằng thẻ)", ["con", "por", "de", "a"], 0, "Phương thức thanh toán dùng con: pagar con tarjeta.", "Payment method uses con: pagar con tarjeta."],
            ["___ zapatos son caros. (Những đôi giày này đắt)", ["Estos", "Este", "Esta", "Estas"], 0, "zapatos là giống đực số nhiều nên dùng estos.", "zapatos is masculine plural, so use estos."],
          ],
          sentences: [
            ["Esta tienda abre temprano", "Cửa hàng này mở cửa sớm."],
            ["El vestido azul es barato", "Chiếc váy màu xanh rất rẻ."],
            ["Prefiero pagar en efectivo", "Tôi thích trả bằng tiền mặt hơn."],            ["¿Cuánto cuesta este pantalón?", "Chiếc quần này giá bao nhiêu?"],
            ["Hay una oferta en el mercado hoy", "Hôm nay ở chợ có chương trình giảm giá."],
            ["Busco una camisa de mi talla", "Tôi đang tìm một chiếc áo sơ mi đúng cỡ của mình."],
            ["¿Puedo probar estos zapatos?", "Tôi có thể thử đôi giày này không?"],

          ],
        },
        {
          id: "x2", title: "Nơi chốn và chỉ đường", titleEn: "Places and directions",
          words: `calle|con đường
plaza|quảng trường
estación|nhà ga
banco|ngân hàng
cerca|gần
lejos|xa
izquierda|bên trái
derecha|bên phải
museo|bảo tàng
puente|cây cầu
semáforo|đèn giao thông
mapa|bản đồ`,
          grammar: [
            ["La estación ___ cerca de aquí. (Nhà ga ở gần đây)", ["está", "es", "tiene", "hay"], 0, "Vị trí địa điểm luôn dùng estar.", "Locations always use estar."],
            ["¿___ un banco por aquí? (Có ngân hàng nào quanh đây không?)", ["Hay", "Está", "Es", "Tiene"], 0, "Hỏi sự tồn tại dùng hay: ¿Hay un banco?", "Existence uses hay: ¿Hay un banco?"],
            ["Gire ___ la derecha. (Hãy rẽ sang phải)", ["a", "en", "de", "con"], 0, "Chỉ hướng rẽ dùng a: girar a la derecha.", "Direction uses a: girar a la derecha."],
            ["Voy ___ banco a pie. (Tôi đi bộ đến ngân hàng)", ["al", "a la", "del", "en el"], 0, "a + el rút gọn thành al: voy al banco.", "a + el contracts to al: voy al banco."],
          ],
          sentences: [
            ["El banco está delante del parque", "Ngân hàng ở phía trước công viên."],
            ["Camina recto hasta la esquina", "Hãy đi thẳng tới góc đường."],
            ["La farmacia queda a la izquierda", "Hiệu thuốc nằm ở phía bên trái."],            ["El museo está detrás del banco", "Bảo tàng nằm phía sau ngân hàng."],
            ["Cruza el puente y sigue recto", "Đi qua cầu rồi đi thẳng."],
            ["El semáforo está en rojo", "Đèn giao thông đang đỏ."],
            ["Necesito un mapa de la ciudad", "Tôi cần một tấm bản đồ thành phố."],

          ],
        },
        {
          id: "x3", title: "Sở thích và cuối tuần", titleEn: "Hobbies and weekends",
          words: `música|âm nhạc
libro|quyển sách
deporte|thể thao
nadar|bơi lội
correr|chạy bộ
bailar|nhảy múa
película|bộ phim
jardín|khu vườn
cantar|hát
cocinar|nấu ăn
guitarra|đàn ghi-ta
dibujar|vẽ`,
          grammar: [
            ["A mí me ___ mucho la música. (Tôi rất thích âm nhạc)", ["gusta", "gustan", "gusto", "quiero"], 0, "música số ít → me gusta.", "Singular subject → me gusta."],
            ["¿Te ___ las películas? (Bạn có thích phim ảnh không?)", ["gustan", "gusta", "gustas", "tienes"], 0, "películas số nhiều → te gustan.", "Plural subject → te gustan."],
            ["El sábado vamos ___ nadar. (Thứ Bảy chúng tôi đi bơi)", ["a", "en", "de", "para"], 0, "ir + a + động từ nguyên mẫu.", "ir + a + infinitive expresses near future."],
            ["Me gusta ___ en el parque. (Tôi thích chạy bộ trong công viên)", ["correr", "corro", "corres", "corriendo"], 0, "Sau gustar dùng động từ nguyên mẫu: me gusta correr.", "gustar is followed by an infinitive: me gusta correr."],
          ],
          sentences: [
            ["Me gusta leer libros por la noche", "Tôi thích đọc sách vào buổi tối."],
            ["Ellos juegan al fútbol los domingos", "Họ chơi bóng đá vào Chủ nhật."],
            ["Voy al cine con mis amigos", "Tôi đi xem phim cùng bạn bè."],            ["Me gusta cantar en el coro los sábados", "Tôi thích hát trong dàn hợp xướng vào thứ Bảy."],
            ["Mi hermana toca la guitarra muy bien", "Em gái tôi chơi ghi-ta rất giỏi."],
            ["Los fines de semana cocino con mi familia", "Cuối tuần tôi nấu ăn cùng gia đình."],
            ["Me encanta dibujar en mi tiempo libre", "Tôi rất thích vẽ trong thời gian rảnh."],

          ],
        },
        {
          id: "x4", title: "Thời tiết và mùa", titleEn: "Weather and seasons",
          words: `sol|mặt trời
lluvia|cơn mưa
calor|nóng
frío|lạnh
viento|gió
verano|mùa hè
invierno|mùa đông
primavera|mùa xuân
nube|đám mây
nieve|tuyết
otoño|mùa thu
tormenta|cơn bão`,
          grammar: [
            ["Hoy ___ mucho calor. (Hôm nay trời rất nóng)", ["hace", "está", "es", "hay"], 0, "Thời tiết dùng hacer: hace calor / hace frío.", "Weather expressions use hacer: hace calor."],
            ["___ lloviendo mucho afuera. (Bên ngoài trời đang mưa to)", ["Está", "Es", "Hace", "Tiene"], 0, "Thì hiện tại tiếp diễn: está + V-ndo.", "Present continuous uses estar + gerund."],
            ["Mi estación favorita ___ la primavera. (Mùa yêu thích của tôi là mùa xuân)", ["es", "está", "hace", "hay"], 0, "Định nghĩa dùng ser: es la primavera.", "Identification uses ser."],
            ["Mañana ___ a llover. (Ngày mai trời sẽ mưa)", ["va", "voy", "vas", "van"], 0, "Tương lai gần: ir a + nguyên mẫu; thời tiết dùng ngôi ba số ít: va a llover.", "Near future: ir a + infinitive; weather uses third person singular: va a llover."],
          ],
          sentences: [
            ["Hoy hace buen tiempo en Madrid", "Hôm nay thời tiết ở Madrid rất đẹp."],
            ["En invierno nieva en las montañas", "Vào mùa đông có tuyết rơi trên núi."],
            ["Llevo un paraguas porque llueve", "Tôi mang theo ô vì trời đang mưa."],            ["Hoy hay muchas nubes en el cielo", "Hôm nay trên trời có nhiều mây."],
            ["En otoño las hojas caen de los árboles", "Vào mùa thu, lá rơi khỏi cây."],
            ["Hace frío y hay tormenta esta noche", "Trời lạnh và tối nay có bão."],
            ["Me gusta la nieve en invierno", "Tôi thích tuyết vào mùa đông."],

          ],
        },
        {
          id: "x5", title: "Sức khỏe và cơ thể", titleEn: "Health and body",
          words: `cabeza|cái đầu
mano|bàn tay
ojo|mắt
médico|bác sĩ
farmacia|hiệu thuốc
dolor|cơn đau
descansar|nghỉ ngơi
enfermo|bị ốm
pierna|chân
boca|miệng
garganta|cổ họng
fiebre|sốt`,
          grammar: [
            ["Me ___ la cabeza. (Tôi bị đau đầu)", ["duele", "duelen", "tengo", "hace"], 0, "doler hoạt động như gustar; cabeza số ít → me duele.", "doler agrees with the body part: me duele la cabeza."],
            ["Ella ___ un poco enferma hoy. (Hôm nay cô ấy hơi mệt)", ["está", "es", "tiene", "hace"], 0, "Trạng thái sức khỏe tạm thời dùng estar.", "Temporary health state uses estar."],
            ["Tienes que ___ más agua. (Bạn cần uống thêm nước)", ["beber", "bebes", "bebiendo", "bebido"], 0, "tener que + động từ nguyên mẫu.", "tener que + infinitive."],
            ["Me ___ los ojos. (Tôi đau mắt)", ["duelen", "duele", "duelo", "dueles"], 0, "doler chia theo thứ bị đau; los ojos số nhiều nên dùng duelen.", "doler agrees with what hurts; los ojos is plural, so duelen."],
          ],
          sentences: [
            ["Necesito ver al médico pronto", "Tôi cần gặp bác sĩ sớm."],
            ["Debo dormir ocho horas diarias", "Tôi phải ngủ tám tiếng mỗi ngày."],
            ["Toma este jarabe después de comer", "Hãy uống thuốc này sau khi ăn."],            ["Me duele la pierna después de correr", "Tôi bị đau chân sau khi chạy."],
            ["Tengo fiebre y me duele la garganta", "Tôi bị sốt và đau họng."],
            ["Abre la boca y di «ah»", "Hãy há miệng ra và nói «a»."],
            ["El médico me da una medicina para la tos", "Bác sĩ cho tôi thuốc trị ho."],

          ],
        },
        {
          id: "x6", title: "Phòng ốc và đồ dùng", titleEn: "Rooms and furniture",
          words: `cuarto|phòng
cocina|nhà bếp
baño|phòng tắm
cama|giường
silla|ghế
ventana|cửa sổ
puerta|cửa ra vào
llave|chìa khóa
lámpara|đèn bàn
espejo|gương
armario|tủ quần áo
alfombra|thảm`,
          grammar: [
            ["La silla está ___ de la mesa. (Cái ghế ở cạnh cái bàn)", ["al lado", "encima", "entre", "lejos"], 0, "al lado de: bên cạnh.", "al lado de means next to."],
            ["El apartamento ___ tres cuartos. (Căn hộ có ba phòng)", ["tiene", "es", "está", "hay"], 0, "Sở hữu đặc điểm dùng tener.", "Possession uses tener."],
            ["Abre ___ ventana por favor. (Làm ơn mở cửa sổ ra)", ["la", "el", "los", "unas"], 0, "ventana giống cái số ít xác định → la.", "ventana is feminine singular definite → la."],
            ["Las llaves ___ en la mesa. (Chìa khóa ở trên bàn)", ["están", "son", "hay", "tienen"], 0, "Vị trí của vật xác định dùng estar: las llaves están.", "Location of a specific thing uses estar: las llaves están."],
          ],
          sentences: [
            ["Mi habitación es luminosa y tranquila", "Phòng của tôi sáng sủa và yên tĩnh."],
            ["Las llaves están encima del escritorio", "Chìa khóa đang nằm trên mặt bàn."],
            ["La cocina está junto al salón", "Nhà bếp nằm ngay cạnh phòng khách."],            ["La lámpara está sobre la mesa del salón", "Đèn bàn nằm trên bàn ở phòng khách."],
            ["El espejo del baño es muy grande", "Gương trong phòng tắm rất lớn."],
            ["Mi ropa está en el armario", "Quần áo của tôi ở trong tủ."],
            ["Hay una alfombra roja en el cuarto", "Trong phòng có một tấm thảm đỏ."],

          ],
        },
        {
          id: "x7", title: "Giao tiếp lớp học", titleEn: "Classroom communication",
          words: `pregunta|câu hỏi
respuesta|câu trả lời
diccionario|từ điển
palabra|từ vựng
frase|câu
escribir|viết
repetir|nhắc lại
entender|hiểu
tarea|bài tập về nhà
examen|bài kiểm tra
pizarra|bảng
cuaderno|vở`,
          grammar: [
            ["¿Puede ___ más despacio? (Bạn có thể nói chậm hơn không?)", ["hablar", "habla", "hablo", "hablando"], 0, "poder + động từ nguyên mẫu: ¿Puede hablar?", "poder + infinitive."],
            ["No ___ esta palabra nueva. (Tôi không hiểu từ mới này)", ["entiendo", "entiendes", "entiende", "entendemos"], 0, "entender biến âm e→ie với yo: entiendo.", "Stem-changing verb entender: yo entiendo."],
            ["¿Cómo se ___ esto en español? (Cái này nói bằng tiếng Tây Ban Nha thế nào?)", ["dice", "habla", "llama", "pone"], 0, "Cách diễn đạt cố định: ¿Cómo se dice?", "Fixed phrase: ¿Cómo se dice?"],
            ["Tengo ___ pregunta. (Em có một câu hỏi)", ["una", "un", "unas", "unos"], 0, "pregunta là giống cái số ít nên dùng una.", "pregunta is feminine singular, so use una."],
          ],
          sentences: [
            ["No comprendo bien esta frase", "Tôi chưa hiểu rõ câu này lắm."],
            ["Por favor repita la última palabra", "Làm ơn nhắc lại từ cuối cùng."],
            ["Necesito un diccionario para leer", "Tôi cần một cuốn từ điển để đọc."],
            ["Escribo notas nuevas cada clase", "Tôi viết ghi chú mới vào mỗi buổi học."],
            ["Muchas gracias por su ayuda", "Cảm ơn rất nhiều vì sự giúp đỡ của bạn."],
            ["Nos vemos en la próxima lección", "Hẹn gặp lại ở bài học tiếp theo."],            ["Tengo mucha tarea para mañana", "Tôi có nhiều bài tập về ngày mai."],
            ["El examen de español es el viernes", "Bài kiểm tra tiếng Tây Ban Nha vào thứ Sáu."],
            ["Escribe la respuesta en tu cuaderno", "Hãy viết câu trả lời vào vở của em."],
            ["La profesora escribe en la pizarra", "Cô giáo viết lên bảng."],

          ],
        },
        {
          id: "x8", title: "Từ vựng cơ bản", titleEn: "Basic vocabulary",
          words: `hola|xin chào
gracias|cảm ơn
por favor|làm ơn
sí|vâng, có
no|không
amigo|bạn bè
familia|gia đình
madre|mẹ
padre|bố
gato|con mèo
perro|con chó
bueno|tốt
grande|lớn
pequeño|nhỏ`,
          sentences: [
            ["Hola, ¿cómo estás?", "Xin chào, bạn khỏe không?"],
            ["Mi perro es grande y bueno", "Con chó của tôi to và hiền."],
            ["Tengo un gato pequeño", "Tôi có một con mèo nhỏ."],
            ["Gracias, hasta mañana", "Cảm ơn, hẹn gặp lại ngày mai."],
          ],
        },
      ],
    },
    {
      id: "a2", title: "DELE A2", desc: "Đời sống hằng ngày: quá khứ đơn giản, so sánh, kế hoạch.",
      units: [
        {
          id: "1", title: "Kể về ngày hôm qua", titleEn: "Talking about yesterday",
          words: `ayer|hôm qua
pasado|đã qua
viaje|chuyến đi
tren|tàu hỏa
llegar|đến nơi
salir|ra ngoài, khởi hành
volver|trở về
temprano|sớm`,
          grammar: [
            ["Ayer ___ al museo con Ana. (Hôm qua tôi đã đi bảo tàng cùng Ana)", ["fui", "voy", "iba", "iré"], 0, "ir ở quá khứ đơn (indefinido) với yo: fui.", "Preterite of ir for yo: fui."],
            ["¿A qué hora ___ el tren? (Tàu đến lúc mấy giờ?)", ["llegó", "llegaste", "llegaron", "llegué"], 0, "Chủ ngữ el tren (ngôi 3 số ít) → llegó.", "3rd person singular preterite of llegar: llegó."],
            ["La semana pasada ___ mucho trabajo. (Tuần trước tôi có rất nhiều việc)", ["tuve", "tengo", "tenía", "tendré"], 0, "tener bất quy tắc ở indefinido: tuve.", "Irregular preterite of tener: tuve."],
            ["Anoche ___ muy tarde a casa. (Tối qua tôi về nhà rất muộn)", ["volví", "volvió", "vuelvo", "volvía"], 0, "Hành động đã xong trong quá khứ, ngôi yo: volví.", "A completed past action with yo: volví."],
          ],
          sentences: [
            ["Ayer llegué temprano a la oficina", "Hôm qua tôi đã đến văn phòng sớm."],
            ["El domingo visitamos a nuestros abuelos", "Chủ nhật chúng tôi đã đi thăm ông bà."],
            ["Compré este abrigo el mes pasado", "Tôi đã mua chiếc áo khoác này tháng trước."],
          ],
        },
        {
          id: "2", title: "So sánh và lựa chọn", titleEn: "Comparisons and choices",
          words: `mejor|tốt hơn
peor|tệ hơn
rápido|nhanh
lento|chậm
fácil|dễ
difícil|khó
igual|bằng nhau
diferente|khác biệt`,
          grammar: [
            ["El avión es ___ rápido que el autobús. (Máy bay nhanh hơn xe buýt)", ["más", "muy", "mucho", "tan"], 0, "So sánh hơn: más + tính từ + que.", "Comparative: más + adjective + que."],
            ["Esta ciudad es ___ grande como Madrid. (Thành phố này lớn ngang Madrid)", ["tan", "más", "tanto", "muy"], 0, "So sánh bằng với tính từ: tan + tính từ + como.", "Equality with adjectives: tan + adj + como."],
            ["Este hotel es ___ que el otro. (Khách sạn này tốt hơn cái kia)", ["mejor", "bueno", "más bueno", "mejores"], 0, "Không dùng más bueno; dùng mejor.", "Use mejor instead of más bueno."],
            ["Es la ciudad ___ grande del país. (Đó là thành phố lớn nhất nước)", ["más", "tan", "muy", "mucho"], 0, "So sánh nhất: el/la + danh từ + más + tính từ + de.", "Superlative: el/la + noun + más + adjective + de."],
          ],
          sentences: [
            ["El tren es más cómodo que el coche", "Tàu hỏa thoải mái hơn ô tô."],
            ["Este ejercicio resulta mucho más fácil", "Bài tập này dễ hơn nhiều."],
            ["Prefiero la camisa verde a la roja", "Tôi thích chiếc áo xanh hơn chiếc đỏ."],
          ],
        },
        {
          id: "3", title: "Dự định gần và mời mọc", titleEn: "Near plans and invitations",
          words: `plan|kế hoạch
fiesta|bữa tiệc
regalo|món quà
invitar|mời
reservar|đặt trước
entrada|vé vào cửa
pronto|sớm thôi
seguro|chắc chắn`,
          grammar: [
            ["Esta noche ___ a cenar fuera. (Tối nay tôi sẽ đi ăn ngoài)", ["voy", "fui", "iba", "estoy"], 0, "Tương lai gần: ir (voy) + a + nguyên mẫu.", "Near future: ir + a + infinitive."],
            ["¿___ venir a mi fiesta el viernes? (Bạn có muốn đến tiệc thứ Sáu không?)", ["Quieres", "Quiere", "Querer", "Quisiste"], 0, "Mời bạn bè thân mật dùng tú: ¿Quieres venir?", "Friendly invitation: ¿Quieres venir?"],
            ["Debemos ___ mesa antes de las siete. (Chúng ta phải đặt bàn trước 7 giờ)", ["reservar", "reservamos", "reservando", "reservado"], 0, "deber + động từ nguyên mẫu.", "deber + infinitive."],
            ["¿Por qué no ___ al cine mañana? (Sao mai chúng ta không đi xem phim?)", ["vamos", "va", "voy", "van"], 0, "Rủ rê bằng ¿Por qué no + nosotros?: vamos.", "Suggest with ¿Por qué no + nosotros form?: vamos."],
          ],
          sentences: [
            ["Voy a estudiar español todo este año", "Năm nay tôi sẽ học tiếng Tây Ban Nha."],
            ["Vamos a celebrar tu cumpleaños juntos", "Chúng ta hãy cùng nhau mừng sinh nhật bạn."],
            ["¿Puedes ayudarme con estas cajas pesadas", "Bạn có thể giúp tôi bê mấy thùng nặng này không?"],
          ],
        },
        {
          id: "4", title: "Kinh nghiệm sống (Pretérito perfecto)", titleEn: "Life experiences",
          words: `nunca|chưa bao giờ
siempre|luôn luôn
todavía|vẫn chưa
ya|đã rồi
alguna vez|đã từng
probar|thử
conocer|quen biết
visitar|thăm`,
          grammar: [
            ["¿Has ___ alguna vez a España? (Bạn đã từng đến Tây Ban Nha chưa?)", ["viajado", "viajas", "viajar", "viajó"], 0, "Thì hiện tại hoàn thành: haber + phân từ (-ado/-ido).", "Present perfect uses haber + past participle."],
            ["Todavía no he ___ la paella. (Tôi vẫn chưa ăn thử cơm paella)", ["probado", "probar", "probé", "pruebo"], 0, "Chưa làm gì đến hiện tại dùng haber + probado.", "todavía no + present perfect."],
            ["Ya ___ terminado mi informe. (Tôi đã làm xong báo cáo rồi)", ["he", "has", "ha", "hemos"], 0, "Ngôi yo dùng trợ động từ he.", "First person auxiliary: he."],
            ["___ he estado en México. (Tôi chưa bao giờ đến Mexico)", ["Nunca", "Ya", "Siempre", "Todavía"], 0, "Chưa bao giờ = nunca, đứng trước động từ thì không cần no.", "Never = nunca; before the verb it needs no extra no."],
          ],
          sentences: [
            ["He visitado varios países europeos", "Tôi đã đi thăm vài nước châu Âu."],
            ["Nunca he visto tanta nieve aquí", "Tôi chưa bao giờ thấy nhiều tuyết ở đây như vậy."],
            ["¿Ya has leído las noticias de hoy", "Bạn đã đọc tin tức hôm nay chưa?"],
          ],
        },
        {
          id: "x1", title: "Thời thơ ấu và thói quen cũ", titleEn: "Childhood and past habits",
          words: `infancia|tuổi thơ
abuelo|ông
juguete|đồ chơi
colegio|trường học
antes|trước đây
recuerdo|kỷ niệm
vivir|sống
jugar|chơi`,
          grammar: [
            ["Cuando era niño, ___ al parque todos los días. (Hồi nhỏ tôi đi công viên mỗi ngày)", ["iba", "fui", "voy", "iré"], 0, "Thói quen quá khứ dùng thì chưa hoàn thành (imperfecto): iba.", "Past habit uses imperfect: iba."],
            ["Mi abuelo ___ en un pueblo tranquilo. (Ông tôi từng sống ở một ngôi làng yên bình)", ["vivía", "vivió", "vive", "vivirá"], 0, "Mô tả bối cảnh quá khứ dùng vivía.", "Ongoing past description uses imperfect."],
            ["Antes nosotros no ___ internet. (Trước đây chúng tôi không có internet)", ["teníamos", "tuvimos", "tenemos", "tendremos"], 0, "Trạng thái kéo dài trong quá khứ: teníamos.", "Continuous state in past: teníamos."],
            ["De pequeña, ella ___ con muñecas. (Hồi nhỏ, cô ấy thường chơi búp bê)", ["jugaba", "jugó", "juega", "jugará"], 0, "Thói quen trong quá khứ dùng pretérito imperfecto: jugaba.", "Past habits use the imperfect: jugaba."],
          ],
          sentences: [
            ["De pequeño jugaba mucho en el jardín", "Hồi bé tôi hay chơi ngoài vườn lắm."],
            ["Mi colegio estaba cerca del río", "Trường học cũ của tôi nằm gần con sông."],
            ["Siempre pasábamos el verano en el pueblo", "Chúng tôi luôn nghỉ hè ở quê."],
          ],
        },
        {
          id: "x2", title: "Giao thông và du lịch", titleEn: "Transport and travel",
          words: `aeropuerto|sân bay
equipaje|hành lý
maleta|va li
pasaporte|hộ chiếu
billete|vé
vuelo|chuyến bay
hotel|khách sạn
mapa|bản đồ`,
          grammar: [
            ["El vuelo ___ con veinte minutos de retraso. (Chuyến bay cất cánh muộn 20 phút)", ["salió", "sale", "salía", "saldrá"], 0, "Hành động đơn lẻ đã qua dùng salió.", "Single completed event uses preterite."],
            ["Olvidé ___ pasaporte en la habitación. (Tôi quên hộ chiếu ở trong phòng)", ["mi", "mío", "me", "mis"], 0, "Tính từ sở hữu đứng trước danh từ: mi pasaporte.", "Possessive adjective before noun: mi."],
            ["Necesitamos llegar ___ aeropuerto dos horas antes. (Ta cần tới sân bay sớm 2 tiếng)", ["al", "en el", "del", "por"], 0, "llegar + a + el = llegar al.", "llegar + a + el contracts to al."],
            ["¿Cuánto ___ el billete de ida y vuelta? (Vé khứ hồi giá bao nhiêu?)", ["cuesta", "cuestan", "costar", "cuesto"], 0, "el billete số ít nên dùng cuesta.", "el billete is singular, so use cuesta."],
          ],
          sentences: [
            ["Mi maleta pesa menos de veinte kilos", "Va li của tôi nặng dưới hai mươi cân."],
            ["Buscamos el andén del próximo tren", "Chúng tôi đang tìm sân ga của chuyến tàu tiếp theo."],
            ["Reservamos una habitación doble con vista", "Chúng tôi đã đặt một phòng đôi có view đẹp."],
          ],
        },
        {
          id: "x3", title: "Công việc nhà và sinh hoạt", titleEn: "Housework and routines",
          words: `limpiar|dọn dẹp
cocinar|nấu ăn
lavar|giặt, rửa
ropa|quần áo
plato|cái đĩa
basura|rác
ordenado|gọn gàng
temprano|sớm`,
          grammar: [
            ["Todos los días ___ la cama al levantarme. (Mỗi ngày tôi dọn giường khi thức dậy)", ["hago", "haces", "hace", "hacemos"], 0, "hacer với yo bất quy tắc: hago.", "Irregular yo form of hacer: hago."],
            ["¿Puedes ___ los platos hoy? (Hôm nay bạn rửa bát được không?)", ["lavar", "lavas", "lavando", "lavado"], 0, "Sau poder dùng nguyên mẫu lavar.", "Use infinitive after poder."],
            ["La ropa limpia ya ___ en el armario. (Quần áo sạch đã ở trong tủ)", ["está", "es", "tiene", "hay"], 0, "Vị trí vật dụng dùng estar.", "Location uses estar."],
            ["Tengo ___ sacar la basura esta noche. (Tối nay tôi phải đổ rác)", ["que", "de", "a", "para"], 0, "Phải làm gì: tener que + nguyên mẫu.", "Obligation: tener que + infinitive."],
          ],
          sentences: [
            ["Me ducho rápido antes de desayunar", "Tôi tắm nhanh trước khi ăn sáng."],
            ["Cada domingo limpio todo mi apartamento", "Mỗi Chủ nhật tôi dọn sạch cả căn hộ."],
            ["Saco la basura después de cenar", "Tôi đi đổ rác sau bữa tối."],
          ],
        },
        {
          id: "x4", title: "Cảm xúc và tính cách", titleEn: "Feelings and personality",
          words: `alegre|vui vẻ
triste|buồn
cansado|mệt mỏi
nervioso|hồi hộp
tranquilo|bình tĩnh
amable|thân thiện
simpático|dễ mến
preocupado|lo lắng`,
          grammar: [
            ["Estoy muy ___ por las vacaciones. (Tôi rất háo hức/vui vì kỳ nghỉ)", ["contento", "contenta", "ser", "contentos"], 0, "Tâm trạng lúc nói (người nói nam) dùng estar contento.", "Temporary emotion uses estar."],
            ["Mi compañero ___ una persona muy amable. (Đồng nghiệp tôi là người rất thân thiện)", ["es", "está", "tiene", "hace"], 0, "Tính cách lâu dài dùng ser.", "Permanent trait uses ser."],
            ["¿Por qué estás tan ___ hoy? (Sao hôm nay bạn lo lắng thế?)", ["preocupado", "preocupar", "preocupa", "preocupación"], 0, "estar + tính từ miêu tả trạng thái.", "estar + adjective."],
            ["Me ___ nervioso antes de los exámenes. (Tôi thấy hồi hộp trước các kỳ thi)", ["pongo", "pone", "pones", "ponen"], 0, "ponerse + tính từ (trở nên), ngôi yo: me pongo.", "ponerse + adjective (to become), with yo: me pongo."],
          ],
          sentences: [
            ["Hoy me siento tranquilo y optimista", "Hôm nay tôi cảm thấy bình tĩnh và lạc quan."],
            ["Ella siempre sonríe y ayuda mucho", "Cô ấy luôn mỉm cười và giúp đỡ nhiệt tình."],
            ["Estaba nervioso antes de la entrevista", "Tôi đã hơi hồi hộp trước buổi phỏng vấn."],
          ],
        },
        {
          id: "x5", title: "Dịch vụ và ngân hàng", titleEn: "Services and banking",
          words: `correo|bưu điện, thư từ
paquete|bưu kiện
cuenta|tài khoản
tarjeta|thẻ
cajero|cây ATM
horario|giờ làm việc
firma|chữ ký
recibo|biên lai`,
          grammar: [
            ["Necesito enviar ___ paquete urgente. (Tôi cần gửi một bưu kiện hỏa tốc)", ["un", "una", "unos", "la"], 0, "paquete giống đực số ít → un paquete.", "paquete is masculine singular."],
            ["¿Dónde ___ sacar dinero aquí? (Ở đây tôi có thể rút tiền ở đâu?)", ["puedo", "puedes", "puede", "podemos"], 0, "Ngôi yo của poder biến âm o→ue: puedo.", "poder in yo form: puedo."],
            ["Guarda el recibo ___ si hay problemas. (Giữ biên lai phòng khi có vấn đề)", ["por", "para", "de", "con"], 0, "Cụm cố định: por si (phòng trường hợp).", "Fixed phrase: por si."],
            ["Quisiera ___ una cuenta. (Tôi muốn mở một tài khoản)", ["abrir", "abro", "abre", "abierto"], 0, "Sau quisiera dùng động từ nguyên mẫu: quisiera abrir.", "quisiera is followed by an infinitive: quisiera abrir."],
          ],
          sentences: [
            ["Quiero abrir una cuenta bancaria hoy", "Hôm nay tôi muốn mở một tài khoản ngân hàng."],
            ["El paquete llegará mañana por la mañana", "Bưu kiện sẽ tới vào sáng mai."],
            ["Firme aquí abajo por favor", "Vui lòng ký tên vào phía dưới đây."],
          ],
        },
        {
          id: "x6", title: "Công nghệ và liên lạc", titleEn: "Tech and communication",
          words: `móvil|điện thoại di động
mensaje|tin nhắn
pantalla|màn hình
contraseña|mật khẩu
correo|email
batería|pin
llamar|gọi điện
enviar|gửi`,
          grammar: [
            ["Te ___ un mensaje hace diez minutos. (Tôi đã nhắn cho bạn 10 phút trước)", ["envié", "envío", "enviaba", "enviaré"], 0, "hace diez minutos → dùng quá khứ đơn envié.", "Specific past time uses preterite."],
            ["Mi móvil ___ poca batería ahora. (Điện thoại tôi giờ còn ít pin)", ["tiene", "es", "está", "hay"], 0, "Có pin/dung lượng dùng tener.", "Uses tener for battery level."],
            ["No olvides cambiar tu ___. (Đừng quên đổi mật khẩu nhé)", ["contraseña", "pantallas", "mensaje", "baterías"], 0, "Nghĩa phù hợp là contraseña (mật khẩu).", "Context requires contraseña."],
            ["Ayer te ___ tres veces. (Hôm qua tôi gọi cho bạn ba lần)", ["llamé", "llamo", "llamó", "llamaba"], 0, "Số lần cụ thể trong quá khứ dùng pretérito indefinido, ngôi yo: llamé.", "A counted past action uses the preterite; with yo: llamé."],
          ],
          sentences: [
            ["Te llamo cuando salga del trabajo", "Tôi sẽ gọi cho bạn khi tôi tan làm."],
            ["He perdido la conexión de internet", "Tôi bị mất kết nối internet rồi."],
            ["Descarga el archivo adjunto en tu correo", "Hãy tải tệp đính kèm trong email của bạn."],
          ],
        },
        {
          id: "x7", title: "Kể chuyện quá khứ xen nhau", titleEn: "Intertwined past events",
          words: `mientras|trong khi
cuando|khi
de repente|bỗng nhiên
entonces|sau đó, lúc ấy
luego|tiếp theo
finalmente|cuối cùng
sonar|reo, vang lên
empezar|bắt đầu`,
          grammar: [
            ["Mientras yo ___ la cena, sonó el teléfono. (Trong khi tôi đang nấu bữa tối thì điện thoại reo)", ["preparaba", "preparé", "preparo", "prepararé"], 0, "Hành động nền đang diễn ra dùng imperfecto: preparaba.", "Background ongoing action uses imperfect."],
            ["Estábamos caminando cuando ___ a llover. (Chúng tôi đang đi bộ thì trời bắt đầu mưa)", ["empezó", "empezaba", "empieza", "empezará"], 0, "Hành động xen ngang đột ngột dùng indefinido: empezó.", "Interrupting action uses preterite."],
            ["Al final ___ encontrar la dirección correcta. (Cuối cùng tôi cũng tìm được đúng địa chỉ)", ["pude", "podía", "puedo", "podré"], 0, "Kết quả đạt được xong xuôi ở quá khứ dùng indefinido: pude.", "Completed success in past uses preterite."],
            ["De repente ___ un ruido muy fuerte. (Đột nhiên chúng tôi nghe một tiếng động rất lớn)", ["oímos", "oíamos", "oír", "oyendo"], 0, "de repente báo hiệu hành động bất ngờ, dùng pretérito indefinido: oímos.", "de repente signals a sudden event, so use the preterite: oímos."],
          ],
          sentences: [
            ["Mientras leía empezó a caer nieve", "Trong khi tôi đang đọc sách thì tuyết bắt đầu rơi."],
            ["Cuando llegamos la tienda ya cerraba", "Khi chúng tôi tới thì cửa hàng vừa đóng cửa."],
            ["Llovía fuerte pero decidimos salir", "Trời mưa to nhưng chúng tôi vẫn quyết định ra ngoài."],
            ["De repente oímos un ruido extraño", "Bỗng nhiên chúng tôi nghe thấy một tiếng động lạ."],
            ["Primero cenamos y luego dimos un paseo", "Đầu tiên chúng tôi ăn tối rồi đi dạo."],
            ["Al final todo salió muy bien", "Cuối cùng mọi chuyện đều diễn ra tốt đẹp."],
          ],
        },
        {
          id: "x8", title: "Từ vựng sinh hoạt", titleEn: "Daily life vocabulary",
          words: `desayuno|bữa sáng
clima|thời tiết
biblioteca|thư viện
vacaciones|kỳ nghỉ
importante|quan trọng
difícil|khó khăn
recuerdo|kỷ niệm
vecino|hàng xóm
atasco|tắc đường
barrio|khu phố`,
        },
      ],
    },
    {
      id: "b1", title: "DELE B1", desc: "Trình bày ý kiến, công việc, giả định và nối câu mạch lạc.",
      units: [
        {
          id: "1", title: "Nêu ý kiến và tranh luận nhẹ", titleEn: "Opinions and discussion",
          words: `opinión|ý kiến
acuerdo|đồng ý
ventaja|ưu điểm
desventaja|nhược điểm
razón|lý do
ejemplo|ví dụ
cambiar|thay đổi
mejorar|cải thiện`,
          grammar: [
            ["Creo que estudiar idiomas ___ muy útil. (Tôi nghĩ học ngoại ngữ rất hữu ích)", ["es", "sea", "esté", "son"], 0, "Khẳng định với Creo que dùng chỉ định (indicativo): es.", "Affirmative Creo que takes indicative."],
            ["No creo que ___ una mala idea. (Tôi không nghĩ đó là ý kiến tồi)", ["sea", "es", "está", "son"], 0, "Phủ định No creo que kéo theo subjuntivo: sea.", "Negative No creo que triggers subjunctive."],
            ["Estoy completamente ___ acuerdo contigo. (Tôi hoàn toàn đồng ý với bạn)", ["de", "en", "con", "por"], 0, "estar de acuerdo con alguien: đồng ý với ai.", "Fixed expression: estar de acuerdo."],
            ["En mi opinión, hay más ventajas ___ desventajas. (Theo tôi, ưu điểm nhiều hơn nhược điểm)", ["que", "de", "como", "a"], 0, "So sánh hơn: más + danh từ + que.", "Comparative: más + noun + que."],
          ],
          sentences: [
            ["En mi opinión este plan funciona mejor", "Theo ý kiến tôi kế hoạch này hiệu quả hơn."],
            ["No estoy seguro de que venga hoy", "Tôi không chắc hôm nay cậu ấy có tới không."],
            ["Debemos analizar tanto ventajas como riesgos", "Chúng ta phải phân tích cả ưu điểm lẫn rủi ro."],
          ],
        },
        {
          id: "2", title: "Công việc và kinh nghiệm", titleEn: "Work and experience",
          words: `empresa|công ty
equipo|đội nhóm
reunión|cuộc họp
proyecto|dự án
experiencia|kinh nghiệm
salario|tiền lương
contrato|hợp đồng
éxito|thành công`,
          grammar: [
            ["Llevo tres años ___ en esta empresa. (Tôi đã làm ở công ty này được 3 năm)", ["trabajando", "trabajar", "trabajo", "trabajado"], 0, "llevar + khoảng thời gian + V-ndo diễn tả hành động kéo dài đến hiện tại.", "llevar + time + gerund expresses duration."],
            ["El gerente pidió que ___ el informe hoy. (Quản lý yêu cầu chúng tôi gửi báo cáo hôm nay)", ["enviemos", "enviamos", "enviar", "enviaremos"], 0, "pedir que + subjuntivo: enviemos.", "pedir que triggers subjunctive."],
            ["Para este puesto se ___ experiencia previa. (Vị trí này yêu cầu kinh nghiệm trước đó)", ["requiere", "requieren", "necesitas", "pide"], 0, "Bị động vô nhân xưng se + động từ ngôi 3.", "Impersonal se + 3rd person singular."],
            ["Ayer ___ el contrato con la empresa. (Hôm qua tôi đã ký hợp đồng với công ty)", ["firmé", "firmaba", "firmo", "firmaré"], 0, "ayer đi với pretérito indefinido, ngôi yo: firmé.", "ayer takes the preterite; with yo: firmé."],
          ],
          sentences: [
            ["Mi equipo colabora bien bajo presión", "Nhóm tôi phối hợp tốt dưới áp lực."],
            ["Mañana presentaremos el proyecto al cliente", "Ngày mai chúng tôi sẽ trình bày dự án cho khách hàng."],
            ["Busco oportunidades para crecer profesionalmente", "Tôi tìm kiếm cơ hội để phát triển nghề nghiệp."],
          ],
        },
        {
          id: "3", title: "Mục đích và nguyên nhân (Por vs Para)", titleEn: "Purpose and cause (Por vs Para)",
          words: `objetivo|mục tiêu
motivo|nguyên nhân
resultado|kết quả
esfuerzo|nỗ lực
plazo|thời hạn
lograr|đạt được
decidir|quyết định
consejo|lời khuyên`,
          grammar: [
            ["Estudio mucho ___ aprobar el examen DELE. (Tôi học nhiều để đỗ kỳ thi DELE)", ["para", "por", "de", "con"], 0, "Mục đích hành động dùng para.", "Purpose uses para."],
            ["Llegué tarde ___ culpa del tráfico. (Tôi đến muộn vì kẹt xe)", ["por", "para", "de", "desde"], 0, "Nguyên nhân dùng por (por culpa de).", "Cause uses por."],
            ["Este regalo es ___ mi hermana menor. (Món quà này dành cho em gái tôi)", ["para", "por", "a", "hacia"], 0, "Người nhận dùng para.", "Recipient uses para."],
            ["Gracias ___ tu consejo. (Cảm ơn vì lời khuyên của bạn)", ["por", "para", "de", "a"], 0, "Cảm ơn vì điều gì: gracias por (nguyên nhân).", "Thanking for something: gracias por (cause)."],
          ],
          sentences: [
            ["Gracias por responder mi correo tan rápido", "Cảm ơn vì đã trả lời email của tôi nhanh như vậy."],
            ["Necesitamos tiempo para revisar cada detalle", "Chúng ta cần thời gian để rà soát từng chi tiết."],
            ["Lo logramos gracias al esfuerzo colectivo", "Chúng tôi đạt được điều đó nhờ nỗ lực chung."],
          ],
        },
        {
          id: "4", title: "Lời khuyên và giả định (Condicional)", titleEn: "Advice and conditionals",
          words: `situación|tình huống
solución|giải pháp
problema|vấn đề
duda|nghi ngờ
ayudar|giúp đỡ
aceptar|chấp nhận
elegir|lựa chọn
posible|khả thi`,
          grammar: [
            ["Si tuviera tiempo, ___ más libros. (Nếu có thời gian, tôi sẽ đọc nhiều sách hơn)", ["leería", "leo", "leí", "leeré"], 0, "Điều kiện loại 2: Si + imperfecto de subjuntivo, condicional.", "2nd conditional uses conditional simple."],
            ["Yo en tu lugar ___ esa oferta. (Nếu ở vị trí bạn tôi sẽ nhận đề nghị đó)", ["aceptaría", "acepto", "acepté", "acepte"], 0, "Khuyên nhủ lịch sự/giả định dùng condicional: aceptaría.", "Polite advice uses conditional."],
            ["¿___ abrir la puerta un momento? (Bạn vui lòng mở cửa một chút được không?)", ["Podrías", "Puedes", "Pudiste", "Podrás"], 0, "Yêu cầu lịch sự dùng condicional: ¿Podrías...?", "Polite request uses conditional."],
            ["Si ___ más dinero, viajaría por todo el mundo. (Nếu tôi có nhiều tiền hơn, tôi sẽ đi khắp thế giới)", ["tuviera", "tengo", "tendría", "tuve"], 0, "Giả định không có thật: si + imperfecto de subjuntivo, vế kia condicional.", "Unreal condition: si + imperfect subjunctive, then conditional."],
          ],
          sentences: [
            ["Deberías hablar con él cuanto antes", "Bạn nên nói chuyện với anh ấy càng sớm càng tốt."],
            ["Si viviera cerca vendría en bicicleta", "Nếu sống gần hơn tôi sẽ đi xe đạp."],
            ["Me gustaría trabajar en un entorno creativo", "Tôi muốn làm việc trong một môi trường sáng tạo."],
          ],
        },
        {
          id: "x1", title: "Thức giả định hiện tại (Subjuntivo)", titleEn: "Present subjunctive",
          words: `esperar|hy vọng
desear|mong muốn
recomendar|gợi ý
necesario|cần thiết
ojalá|mong sao
prohibir|cấm
permitir|cho phép
cumplir|hoàn thành`,
          grammar: [
            ["Espero que ___ un buen viaje. (Chúc/hy vọng bạn có chuyến đi vui vẻ)", ["tengas", "tienes", "tendrás", "tuviste"], 0, "Espero que + subjuntivo: tengas.", "Espero que triggers subjunctive."],
            ["Es importante que todos ___ puntuales. (Điều quan trọng là mọi người đều đúng giờ)", ["sean", "son", "están", "serán"], 0, "Es importante que + subjuntivo của ser: sean.", "Impersonal value statement + subjunctive."],
            ["Ojalá ___ buen tiempo mañana. (Ước gì ngày mai trời đẹp)", ["haga", "hace", "hará", "hizo"], 0, "Ojalá luôn đi với subjuntivo: haga.", "Ojalá always takes subjunctive."],
            ["Te recomiendo que ___ este libro. (Tôi khuyên bạn đọc cuốn sách này)", ["leas", "lees", "leer", "leerás"], 0, "recomendar que + subjuntivo: que leas.", "recomendar que + subjunctive: que leas."],
          ],
          sentences: [
            ["Te recomiendo que practiques diez minutos diarios", "Tôi khuyên bạn nên luyện tập mười phút mỗi ngày."],
            ["Quiero que me expliques esa regla", "Tôi muốn bạn giải thích cho tôi quy tắc đó."],
            ["Es mejor que salgas ahora mismo", "Tốt hơn là bạn nên đi ngay bây giờ."],
          ],
        },
        {
          id: "x2", title: "Đại từ quan hệ và mô tả", titleEn: "Relative clauses",
          words: `lugar|địa điểm
persona|con người
historia|câu chuyện
tema|chủ đề
autor|tác giả
edificio|tòa nhà
ciudad|thành phố
idioma|ngôn ngữ`,
          grammar: [
            ["La ciudad ___ nací ha cambiado mucho. (Thành phố nơi tôi sinh ra đã đổi khác nhiều)", ["donde", "que", "quien", "cual"], 0, "Chỉ nơi chốn dùng đại từ quan hệ donde.", "Place relative pronoun: donde."],
            ["El libro ___ estoy leyendo es fascinante. (Cuốn sách tôi đang đọc rất cuốn hút)", ["que", "quien", "donde", "cuyo"], 0, "Chỉ vật làm tân ngữ dùng que.", "Object relative pronoun: que."],
            ["La compañera con ___ trabajo es muy eficaz. (Đồng nghiệp tôi làm cùng rất hiệu quả)", ["quien", "que", "cual", "donde"], 0, "Sau giới từ chỉ người dùng quien.", "Person after preposition uses quien."],
            ["Ese es el autor ___ libros me encantan. (Đó là tác giả mà sách của ông ấy tôi rất thích)", ["cuyos", "que", "quien", "donde"], 0, "cuyo chỉ sở hữu và hợp giống số với danh từ sau nó: cuyos libros.", "cuyo shows possession and agrees with the following noun: cuyos libros."],
          ],
          sentences: [
            ["El restaurante donde cenamos sirve comida casera", "Nhà hàng nơi chúng tôi ăn tối phục vụ món nhà làm."],
            ["Busco alguien que hable dos idiomas", "Tôi đang tìm ai đó nói được hai thứ tiếng."],
            ["La película que vimos ayer ganó premios", "Bộ phim chúng tôi xem hôm qua đã giành nhiều giải thưởng."],
          ],
        },
        {
          id: "x3", title: "Môi trường và thói quen xanh", titleEn: "Environment and green habits",
          words: `reciclar|tái chế
contaminación|ô nhiễm
energía|năng lượng
naturaleza|thiên nhiên
transporte|giao thông
plástico|nhựa
ahorrar|tiết kiệm
proteger|bảo vệ`,
          grammar: [
            ["Si reciclamos más, ___ menos basura. (Nếu tái chế nhiều hơn, ta sẽ tạo ít rác hơn)", ["generaremos", "generamos", "generaríamos", "generemos"], 0, "Điều kiện loại 1 (có thật): Si + presente, futuro.", "1st conditional: Si + present, future."],
            ["Hay que reducir el uso ___ plástico. (Cần giảm việc sử dụng đồ nhựa)", ["de", "por", "a", "con"], 0, "el uso de + danh từ.", "Noun complement uses de."],
            ["Apaga la luz antes ___ salir. (Tắt đèn trước khi ra ngoài)", ["de", "que", "a", "por"], 0, "antes de + nguyên mẫu khi cùng chủ ngữ.", "antes de + infinitive."],
            ["Es necesario que ___ la naturaleza. (Chúng ta cần bảo vệ thiên nhiên)", ["protejamos", "protegemos", "proteger", "protegeremos"], 0, "es necesario que + subjuntivo; proteger đổi g thành j: protejamos.", "es necesario que + subjunctive; proteger changes g to j: protejamos."],
          ],
          sentences: [
            ["Prefiero usar transporte público cada día", "Tôi thích dùng phương tiện công cộng mỗi ngày."],
            ["Separar residuos ayuda a cuidar la ciudad", "Phân loại rác giúp bảo vệ thành phố."],
            ["Debemos ahorrar agua y electricidad", "Chúng ta phải tiết kiệm nước và điện."],
          ],
        },
        {
          id: "x4", title: "Truyền thông và tin tức", titleEn: "Media and news",
          words: `noticia|tin tức
periódico|tờ báo
revista|tạp chí
red|mạng lưới
fuente|nguồn tin
informar|thông báo
compartir|chia sẻ
público|công chúng`,
          grammar: [
            ["El artículo fue ___ por una periodista joven. (Bài báo được viết bởi một nữ phóng viên trẻ)", ["escrito", "escribió", "escribir", "escribiendo"], 0, "Bị động với ser: fue + phân từ bất quy tắc escrito.", "Passive voice uses irregular participle escrito."],
            ["Según las noticias, la economía ___ creciendo. (Theo tin tức, kinh tế đang tăng trưởng)", ["sigue", "siguió", "seguirá", "seguir"], 0, "seguir + V-ndo: tiếp tục làm gì.", "seguir + gerund means keep doing."],
            ["Es clave verificar la fuente ___ compartir. (Rất quan trọng là kiểm chứng nguồn trước khi chia sẻ)", ["antes de", "después", "mientras", "aunque"], 0, "antes de + nguyên mẫu: trước khi.", "antes de + infinitive."],
            ["La noticia ___ publicada ayer. (Tin này được đăng hôm qua)", ["fue", "estaba", "ha", "había"], 0, "Bị động: ser + phân từ, quá khứ đã xong dùng fue.", "Passive: ser + participle; a completed past event takes fue."],
          ],
          sentences: [
            ["Leo prensa digital cada mañana temprano", "Tôi đọc báo điện tử vào mỗi sáng sớm."],
            ["Muchos jóvenes se informan por redes", "Nhiều bạn trẻ cập nhật tin tức qua mạng xã hội."],
            ["Conviene comparar varias fuentes fiables", "Nên đối chiếu nhiều nguồn tin đáng tin cậy."],
          ],
        },
        {
          id: "x5", title: "Kế hoạch tương lai (Futuro)", titleEn: "Future plans",
          words: `futuro|tương lai
carrera|sự nghiệp
título|bằng cấp
ahorros|tiền tiết kiệm
alquilar|thuê
mudarse|chuyển nhà
logro|thành tựu
meta|mục tiêu`,
          grammar: [
            ["El año que viene ___ a otra ciudad. (Năm tới tôi sẽ chuyển sang thành phố khác)", ["me mudaré", "me mudo", "me mudaba", "me mudé"], 0, "Thì tương lai đơn (futuro simple): me mudaré.", "Future simple of mudarse: me mudaré."],
            ["Cuando ___ la carrera, buscaré prácticas. (Khi học xong đại học, tôi sẽ tìm nơi thực tập)", ["termine", "termino", "terminaré", "terminaba"], 0, "Cuando + tương lai dùng subjuntivo: cuando termine.", "Cuando referring to future takes subjunctive."],
            ["Tendremos que ___ con paciencia. (Chúng ta sẽ phải chờ đợi kiên nhẫn)", ["esperar", "esperamos", "esperaremos", "esperando"], 0, "tener que + nguyên mẫu.", "tener que + infinitive."],
            ["Dentro de dos años ___ mi título. (Hai năm nữa tôi sẽ nhận bằng)", ["obtendré", "obtuve", "obtenía", "obtenido"], 0, "dentro de + thời gian chỉ tương lai: obtendré (gốc bất quy tắc obtendr-).", "dentro de + time points to the future: obtendré (irregular stem obtendr-)."],
          ],
          sentences: [
            ["Dentro de poco aprenderé otro idioma", "Chẳng bao lâu nữa tôi sẽ học thêm ngoại ngữ khác."],
            ["Ahorraré dinero para viajar el verano próximo", "Tôi sẽ tiết kiệm tiền để du lịch hè tới."],
            ["Cuando llegues te contaré las novedades", "Khi bạn tới nơi tôi sẽ kể tin mới cho nghe."],
          ],
        },
        {
          id: "x6", title: "Nhượng bộ và đối lập", titleEn: "Concession and contrast",
          words: `aunque|mặc dù
sin embargo|tuy nhiên
mientras que|trong khi đó
a pesar de|bất chấp
diferencia|sự khác biệt
esfuerzo|nỗ lực
dificultad|khó khăn
seguir|tiếp tục`,
          grammar: [
            ["___ llueve fuerte, saldremos puntual. (Mặc dù trời đang mưa to, ta vẫn sẽ ra ngoài đúng giờ)", ["Aunque", "Sin embargo", "Porque", "Por eso"], 0, "aunque đứng đầu mệnh đề nhượng bộ sự thật hiển nhiên.", "aunque introduces a concessive clause."],
            ["Tiene poco tiempo; ___, siempre responde amable. (Anh ấy ít thời gian; tuy vậy luôn trả lời niềm nở)", ["sin embargo", "aunque", "porque", "además"], 0, "Đứng đầu câu thứ hai diễn tả tương phản dùng sin embargo.", "sin embargo connects contrasting sentences."],
            ["A pesar ___ cansancio, terminó el trabajo. (Bất chấp mệt mỏi, anh ấy đã xong việc)", ["del", "al", "con", "por"], 0, "a pesar de + el = a pesar del.", "a pesar de + el contracts to del."],
            ["Mi hermano es muy hablador, ___ yo soy tranquilo. (Anh tôi nói nhiều, trong khi tôi thì trầm tính)", ["mientras que", "aunque", "a pesar de", "porque"], 0, "Đối chiếu hai chủ thể dùng mientras que.", "Contrast two subjects with mientras que."],
          ],
          sentences: [
            ["Aunque sea difícil vale la pena intentarlo", "Dù có khó nhưng rất đáng để thử."],
            ["El plan es caro pero muy duradero", "Kế hoạch tuy đắt nhưng bền vững lâu dài."],
            ["A pesar de la lluvia fueron todos", "Bất chấp cơn mưa mọi người đều có mặt."],
          ],
        },
        {
          id: "x7", title: "Thư tín và đề nghị lịch sự", titleEn: "Emails and polite requests",
          words: `saludo|lời chào
adjunto|đính kèm
consulta|thắc mắc
confirmar|xác nhận
disculpa|lời xin lỗi
horario|lịch trình
disponible|rảnh, sẵn sàng
atentamente|trân trọng`,
          grammar: [
            ["Le escribo ___ confirmar nuestra cita. (Tôi viết thư để xác nhận lịch hẹn)", ["para", "por", "de", "en"], 0, "Mục đích thư tín dùng para confirmar.", "Purpose uses para."],
            ["¿___ enviarme el documento actualizado? (Bạn có thể gửi tôi tài liệu mới nhất không?)", ["Podría", "Puede", "Pudo", "Pueda"], 0, "Hỏi trang trọng ngôi usted dùng Podría.", "Formal polite request uses conditional Podría."],
            ["Agradezco ___ antemano su amable respuesta. (Tôi cảm ơn trước phản hồi thiện chí của quý vị)", ["de", "por", "con", "en"], 0, "Cụm trang trọng cố định: de antemano (trước).", "Fixed formal phrase: de antemano."],
            ["Le ___ un cordial saludo. (Tôi xin gửi quý vị lời chào trân trọng)", ["envío", "envía", "envías", "enviamos"], 0, "Người viết là yo: envío (có dấu trên í).", "The writer is yo: envío (with an accent on í)."],
          ],
          sentences: [
            ["Adjunto el informe mensual en este correo", "Tôi đính kèm báo cáo tháng trong email này."],
            ["Quedo disponible para cualquier aclaración", "Tôi luôn sẵn sàng giải đáp nếu có thắc mắc."],
            ["Disculpe las molestias por este retraso", "Xin lỗi vì sự bất tiện do chậm trễ này."],
            ["Agradezco mucho su rápida colaboración", "Tôi rất cảm ơn sự phối hợp nhanh chóng của bạn."],
            ["Confirme su asistencia antes del viernes", "Vui lòng xác nhận tham dự trước thứ Sáu."],
            ["Espero tener noticias suyas muy pronto", "Hy vọng sớm nhận được hồi âm của quý vị."],
          ],
        },
        {
          id: "x8", title: "Từ vựng giao tiếp", titleEn: "Communication vocabulary",
          words: `lograr|đạt được
mejorar|cải thiện
experiencia|kinh nghiệm
oportunidad|cơ hội
responsable|có trách nhiệm
medio ambiente|môi trường
comunicar|giao tiếp
aconsejar|khuyên bảo
seguro|tự tin, chắc chắn
agenda|lịch làm việc`,
        },
      ],
    },
    {
      id: "b2", title: "DELE B2", desc: "Lập luận sâu, văn phong trang trọng, xã hội và kinh tế.",
      units: [
        {
          id: "1", title: "Giáo dục và thị trường lao động", titleEn: "Education and labor market",
          words: `formación|đào tạo
empleo|việc làm
competencia|năng lực
demanda|nhu cầu
flexibilidad|tính linh hoạt
teletrabajo|làm việc từ xa
desempleo|thất nghiệp
especialista|chuyên gia`,
          grammar: [
            ["Es fundamental que las universidades ___ sus programas. (Điều cốt lõi là đại học cập nhật chương trình)", ["actualicen", "actualizan", "actualizarán", "actualizaban"], 0, "Es fundamental que + subjuntivo: actualicen (c→qu→c→z→c).", "Triggers present subjunctive actualicen."],
            ["Cuanto más practiques, ___ fluidez ganarás. (Càng luyện nhiều bạn càng trôi chảy hơn)", ["más", "menos", "mejor", "tanto"], 0, "Cấu trúc càng... càng: cuanto más..., más...", "Correlative comparison: cuanto más..., más..."],
            ["Muchos jóvenes optan ___ formarse en línea. (Nhiều bạn trẻ chọn học trực tuyến)", ["por", "a", "de", "en"], 0, "optar por + nguyên mẫu: lựa chọn điều gì.", "optar takes preposition por."],
            ["El teletrabajo permite ___ la vida laboral y la personal. (Làm việc từ xa cho phép cân bằng công việc và đời sống riêng)", ["conciliar", "concilia", "conciliando", "conciliado"], 0, "permitir + nguyên mẫu: permite conciliar.", "permitir + infinitive: permite conciliar."],
          ],
          sentences: [
            ["El teletrabajo exige organización y disciplina", "Làm việc từ xa đòi hỏi tính tổ chức và kỷ luật."],
            ["La formación continua amplía salidas laborales", "Đào tạo liên tục mở rộng cơ hội việc làm."],
            ["Conviene equilibrar teoría y práctica real", "Nên cân bằng giữa lý thuyết và thực hành thực tế."],
          ],
        },
        {
          id: "2", title: "Tranh luận và thuyết phục", titleEn: "Debate and persuasion",
          words: `argumento|lập luận
postura|lập trường
evidencia|bằng chứng
matiz|sắc thái
impacto|tác động
reforma|cải cách
debate|tranh luận
conclusión|kết luận`,
          grammar: [
            ["No cabe ___ de que la medida tuvo efecto. (Không còn nghi ngờ gì biện pháp này có hiệu quả)", ["duda", "razón", "caso", "parte"], 0, "Thành ngữ lập luận: no cabe duda de que.", "Idiom: no cabe duda de que."],
            ["Por un lado reduce costes; por ___, exige inversión. (Một mặt giảm chi phí; mặt khác đòi hỏi đầu tư)", ["otro", "lados", "parte", "demás"], 0, "Cặp liên kết: por un lado..., por otro...", "Correlative pair: por un lado..., por otro..."],
            ["Dicho proyecto fue aprobado ___ unanimidad. (Dự án đó được thông qua với sự nhất trí tuyệt đối)", ["por", "con", "en", "de"], 0, "por unanimidad: nhất trí hoàn toàn.", "Fixed phrase: por unanimidad."],
            ["Es evidente ___ la reforma ha generado debate. (Rõ ràng cuộc cải cách đã gây tranh luận)", ["que", "de que", "lo que", "cual"], 0, "es evidente que + indicativo, không thêm de.", "es evidente que + indicative, with no de."],
          ],
          sentences: [
            ["Los datos respaldan claramente nuestra propuesta", "Số liệu ủng hộ rõ ràng đề xuất của chúng tôi."],
            ["Conviene abordar este debate sin prejuicios", "Nên tiếp cận cuộc tranh luận này không định kiến."],
            ["Una reforma gradual evita tensiones innecesarias", "Cải cách từng bước giúp tránh căng thẳng không cần thiết."],
          ],
        },
        {
          id: "3", title: "Kinh tế và tiêu dùng bền vững", titleEn: "Economy and sustainability",
          words: `consumo|tiêu dùng
presupuesto|ngân sách
inversión|đầu tư
rentable|sinh lời
recurso|tài nguyên
sostenible|bền vững
mercado|thị trường
ahorro|tiết kiệm`,
          grammar: [
            ["Si hubiéramos invertido antes, ahora ___ beneficios. (Giá như đầu tư sớm hơn thì giờ đã có lãi)", ["tendríamos", "tendremos", "tenemos", "hayamos tenido"], 0, "Điều kiện hỗn hợp (quá khứ → hiện tại): Si + pluscuamperfecto subjuntivo, condicional simple.", "Mixed conditional: past condition with present result."],
            ["La empresa busca crecer sin ___ el entorno. (Công ty tìm cách tăng trưởng mà không hủy hoại môi trường)", ["dañar", "daña", "dañando", "dañado"], 0, "Sau giới từ sin dùng động từ nguyên mẫu.", "Preposition sin + infinitive."],
            ["El ahorro energético supone ___ ventaja competitiva. (Tiết kiệm năng lượng mang lại lợi thế cạnh tranh)", ["una", "un", "unas", "el"], 0, "ventaja giống cái số ít → una.", "ventaja is feminine singular."],
            ["Hay que gastar menos ___ lo que se gana. (Phải tiêu ít hơn số mình kiếm được)", ["de", "que", "como", "a"], 0, "So sánh với một mệnh đề: menos de lo que.", "Comparing with a clause: menos de lo que."],
          ],
          sentences: [
            ["El consumo responsable transforma las industrias locales", "Tiêu dùng có trách nhiệm làm thay đổi các ngành địa phương."],
            ["Debemos gestionar cada recurso con prudencia", "Chúng ta phải quản lý mọi nguồn lực một cách thận trọng."],
            ["La inversión verde genera valor a largo plazo", "Đầu tư xanh tạo ra giá trị về lâu dài."],
          ],
        },
        {
          id: "4", title: "Văn hóa và xã hội đô thị", titleEn: "Culture and urban society",
          words: `sociedad|xã hội
ciudadano|công dân
igualdad|bình đẳng
convivencia|chung sống hài hòa
tradición|truyền thống
patrimonio|di sản
diversidad|sự đa dạng
participación|sự tham gia`,
          grammar: [
            ["Hace falta fomentar la ___ ciudadana. (Cần thúc đẩy sự tham gia của người dân)", ["participación", "participar", "participado", "participe"], 0, "Mạo từ la đi với danh từ participación.", "Article la requires the noun."],
            ["No solo protege el patrimonio, ___ que dinamiza el barrio. (Không chỉ bảo vệ di sản mà còn làm khu phố sôi động)", ["sino", "pero", "aunque", "sino de"], 0, "no solo..., sino que... (khi vế sau có động từ chia ngôi).", "no solo..., sino que + conjugated verb."],
            ["A medida que crece la urbe, ___ los retos. (Khi đô thị mở rộng, các thách thức cũng tăng)", ["aumentan", "aumenta", "aumente", "aumentando"], 0, "Chủ ngữ số nhiều los retos → aumentan.", "Plural subject los retos takes plural verb."],
            ["La convivencia mejora cuando los vecinos se ___. (Đời sống chung tốt hơn khi hàng xóm tôn trọng nhau)", ["respetan", "respeta", "respeten", "respetar"], 0, "cuando chỉ thói quen dùng indicativo, chủ ngữ số nhiều: se respetan.", "cuando for habits takes the indicative; plural subject: se respetan."],
          ],
          sentences: [
            ["La diversidad cultural enriquece la vida urbana", "Sự đa dạng văn hóa làm phong phú đời sống đô thị."],
            ["Conservar edificios históricos fortalece nuestra identidad", "Bảo tồn công trình lịch sử củng cố bản sắc của chúng ta."],
            ["El respeto mutuo sostiene una convivencia sana", "Sự tôn trọng lẫn nhau duy trì cộng đồng lành mạnh."],
          ],
        },
        {
          id: "x1", title: "Khoa học và chuyển đổi số", titleEn: "Science and digital shift",
          words: `investigación|nghiên cứu
avance|bước tiến
algoritmo|thuật toán
privacidad|quyền riêng tư
seguridad|an toàn, bảo mật
datos|dữ liệu
automatizar|tự động hóa
innovación|đổi mới`,
          grammar: [
            ["El algoritmo ___ para detectar patrones rápidos. (Thuật toán được thiết kế để phát hiện mẫu nhanh)", ["sirve", "sirven", "sirviendo", "servir"], 0, "Chủ ngữ số ít El algoritmo → sirve.", "Singular subject takes sirve."],
            ["Conviene proteger los datos personales antes de ___ la aplicación. (Nên bảo vệ dữ liệu trước khi dùng ứng dụng)", ["instalar", "instalas", "instalado", "instales"], 0, "antes de + nguyên mẫu.", "antes de + infinitive."],
            ["Cuanto más dependemos de redes, más ___ resulta la seguridad. (Càng phụ thuộc mạng, bảo mật càng cấp thiết)", ["crucial", "cruciales", "mayor", "mejor"], 0, "Chủ ngữ số ít la seguridad → tính từ số ít crucial.", "Singular noun takes singular adjective."],
            ["Gracias ___ los avances, el diagnóstico es más rápido. (Nhờ các tiến bộ, việc chẩn đoán nhanh hơn)", ["a", "por", "de", "con"], 0, "Nhờ vào = gracias a.", "Thanks to = gracias a."],
          ],
          sentences: [
            ["La innovación tecnológica exige marcos éticos claros", "Đổi mới công nghệ đòi hỏi khung đạo đức rõ ràng."],
            ["Los algoritmos optimizan tareas repetitivas diarias", "Thuật toán tối ưu hóa các công việc lặp đi lặp lại hằng ngày."],
            ["La privacidad digital requiere atención constante", "Quyền riêng tư số đòi hỏi sự chú ý thường xuyên."],
          ],
        },
        {
          id: "x2", title: "Tường thuật gián tiếp nâng cao", titleEn: "Advanced reported speech",
          words: `declarar|tuyên bố
asegurar|khẳng định
advertir|cảnh báo
mencionar|nhắc tới
proponer|đề xuất
negar|phủ nhận
añadir|nói thêm
resumir|tóm tắt`,
          grammar: [
            ["La directora aseguró que el plan ___ listo pronto. (Giám đốc khẳng định kế hoạch sẽ sớm xong)", ["estaría", "está", "estuvo", "esté"], 0, "Tường thuật tương lai từ mốc quá khứ dùng condicional: estaría.", "Reported future from past verb uses conditional."],
            ["Nos advirtieron que no ___ tarde al acto. (Họ cảnh báo chúng tôi đừng đến sự kiện muộn)", ["llegáramos", "llegamos", "llegaremos", "lleguemos"], 0, "Mệnh lệnh gián tiếp quá khứ dùng imperfecto de subjuntivo: llegáramos.", "Past reported command uses imperfect subjunctive."],
            ["El portavoz negó ___ recibido dicha carta. (Người phát ngôn phủ nhận việc đã nhận bức thư đó)", ["haber", "tener", "ser", "estar"], 0, "negar + nguyên mẫu hoàn thành (haber + phân từ) khi cùng chủ ngữ.", "Same-subject denial with perfect infinitive: haber recibido."],
            ["Me preguntó si ___ asistir a la reunión. (Anh ấy hỏi tôi có thể dự họp không)", ["podía", "puedo", "pueda", "podré"], 0, "Tường thuật câu hỏi ở quá khứ: lùi thì, puedo thành podía.", "Reported question in the past: backshift puedo to podía."],
          ],
          sentences: [
            ["El informe señaló varias mejoras urgentes", "Báo cáo đã chỉ ra nhiều điểm cần cải thiện khẩn cấp."],
            ["Propusieron revisar el calendario la semana siguiente", "Họ đề xuất xem lại lịch trình vào tuần sau đó."],
            ["Añadió que mantendrían la calidad actual", "Ông nói thêm rằng họ sẽ duy trì chất lượng hiện tại."],
          ],
        },
        {
          id: "x3", title: "Điều kiện quá khứ và hối tiếc", titleEn: "Past conditionals and regrets",
          words: `arrepentirse|hối hận
ocasión|dịp, cơ hội
retraso|sự chậm trễ
fallo|sai sót
prevenir|phòng ngừa
evitar|tránh
aprovechar|tận dụng
consecuencia|hệ quả`,
          grammar: [
            ["Si ___ avisado antes, lo habríamos evitado. (Nếu báo trước thì chúng ta đã tránh được rồi)", ["hubieras", "has", "habrás", "tuvieras"], 0, "Điều kiện loại 3: Si + pluscuamperfecto subjuntivo (hubieras avisado).", "3rd conditional condition clause uses pluperfect subjunctive."],
            ["Ojalá ___ aprovechado aquella oportunidad. (Giá mà hồi đó tôi đã tận dụng cơ hội ấy)", ["hubiera", "he", "haya", "habré"], 0, "Tiếc nuối quá khứ: Ojalá + pluscuamperfecto de subjuntivo.", "Past regret with Ojalá uses pluperfect subjunctive."],
            ["De haberlo sabido, no ___ venido. (Biết thế tôi đã không tới)", ["habría", "he", "habré", "haya"], 0, "De + nguyên mẫu hoàn thành tương đương điều kiện loại 3.", "De + perfect infinitive pairs with conditional perfect."],
            ["Me arrepiento de no ___ estudiado más. (Tôi hối hận vì đã không học nhiều hơn)", ["haber", "he", "había", "habiendo"], 0, "Sau giới từ de dùng nguyên mẫu hoàn thành: haber estudiado.", "After the preposition de use the perfect infinitive: haber estudiado."],
          ],
          sentences: [
            ["Si hubiéramos salido antes evitaríamos atascos", "Giá mà xuất phát sớm hơn thì đã tránh được tắc đường."],
            ["Habría sido mejor verificar cada cifra", "Lẽ ra kiểm tra lại từng con số thì tốt hơn."],
            ["Afortunadamente prevenimos el fallo a tiempo", "May mắn là chúng ta đã phòng ngừa lỗi kịp thời."],
          ],
        },
        {
          id: "x4", title: "Báo chí và dư luận", titleEn: "Press and public opinion",
          words: `titular|tiêu đề báo
reportaje|phóng sự
encuesta|khảo sát
tendencia|xu hướng
fenómeno|hiện tượng
polémica|tranh cãi
análisis|phân tích
portavoz|người phát ngôn`,
          grammar: [
            ["La encuesta revela ___ cambio de tendencia notable. (Khảo sát cho thấy một sự chuyển dịch xu hướng rõ rệt)", ["un", "una", "unos", "la"], 0, "cambio giống đực số ít → un cambio.", "cambio is masculine singular."],
            ["El reportaje trata ___ el envejecimiento rural. (Phóng sự bàn về tình trạng già hóa ở nông thôn)", ["sobre", "para", "a", "por"], 0, "tratar sobre / de: đề cập về chủ đề.", "tratar sobre means to deal with."],
            ["Se espera que las medidas ___ aprobadas mañana. (Dự kiến các biện pháp sẽ được thông qua ngày mai)", ["sean", "son", "están", "fueron"], 0, "se espera que + subjuntivo: sean.", "se espera que triggers subjunctive."],
            ["Según el titular, la polémica ___ lejos de terminar. (Theo tít báo, cuộc tranh cãi còn lâu mới kết thúc)", ["está", "es", "hay", "tiene"], 0, "Cụm cố định estar lejos de + nguyên mẫu.", "Fixed phrase: estar lejos de + infinitive."],
          ],
          sentences: [
            ["El titular resume bien el problema central", "Tiêu đề tóm tắt rất đúng vấn đề trọng tâm."],
            ["Un análisis serio evita conclusiones precipitadas", "Phân tích nghiêm túc giúp tránh kết luận vội vàng."],
            ["El fenómeno despertó un intenso debate nacional", "Hiện tượng này đã khơi dậy cuộc tranh luận sôi nổi."],
          ],
        },
        {
          id: "x5", title: "Đàm phán và hợp tác", titleEn: "Negotiation and cooperation",
          words: `negociación|đàm phán
acuerdo|thỏa thuận
condición|điều kiện
compromiso|sự nhượng bộ, cam kết
prioridad|ưu tiên
alianza|liên minh
garantía|bảo đảm
equilibrio|cân bằng`,
          grammar: [
            ["Firmaremos el trato siempre que ___ esa cláusula. (Chúng tôi sẽ ký miễn là sửa điều khoản đó)", ["modifiquen", "modifican", "modificarán", "modificaron"], 0, "siempre que (miễn là) luôn đi với subjuntivo.", "Conditional connector siempre que takes subjunctive."],
            ["Ambas partes cedieron con el fin de ___ un acuerdo. (Hai bên nhượng bộ để đạt thỏa thuận)", ["alcanzar", "alcanzan", "alcancen", "alcanzado"], 0, "con el fin de + nguyên mẫu (cùng chủ ngữ).", "Same-subject purpose phrase + infinitive."],
            ["Es imprescindible mantener ___ mutua confianza. (Thiết yếu là giữ niềm tin lẫn nhau)", ["la", "el", "los", "un"], 0, "confianza giống cái số ít → la.", "confianza is feminine singular."],
            ["Aceptaremos la oferta a condición de que nos ___ una garantía. (Chúng tôi nhận đề nghị với điều kiện họ cho một bảo đảm)", ["den", "dan", "darán", "dieron"], 0, "a condición de que + subjuntivo: den.", "a condición de que + subjunctive: den."],
          ],
          sentences: [
            ["Buscamos soluciones justas para ambas partes", "Chúng tôi tìm giải pháp công bằng cho cả hai bên."],
            ["La negociación avanzó pese a las diferencias", "Cuộc đàm phán vẫn tiến triển bất chấp khác biệt."],
            ["Cumplir cada compromiso refuerza nuestra alianza", "Giữ đúng từng cam kết giúp củng cố liên minh."],
          ],
        },
        {
          id: "x6", title: "Văn học và diễn đạt cảm xúc", titleEn: "Literature and nuance",
          words: `metáfora|ẩn dụ
atmósfera|bầu không khí
silencio|sự im lặng
nostalgia|hoài niệm
esperanza|hy vọng
mirada|ánh nhìn
memoria|ký ức
huella|dấu ấn`,
          grammar: [
            ["Sus palabras dejaron ___ profunda huella en mí. (Lời cô ấy để lại dấu ấn sâu đậm trong tôi)", ["una", "un", "unas", "el"], 0, "huella giống cái số ít → una huella.", "huella is feminine singular."],
            ["El relato evoca recuerdos que ___ olvidados. (Câu chuyện gợi lại những ký ức tưởng chừng bị lãng quên)", ["parecían", "parecieron", "parecen", "parezcan"], 0, "Miêu tả trạng thái nền quá khứ dùng imperfecto.", "Descriptive background in past uses imperfect."],
            ["Aquel paisaje transmitía una calma ___. (Phong cảnh ấy mang lại sự tĩnh lặng khó tả)", ["serena", "sereno", "serenas", "serenos"], 0, "calma giống cái số ít → serena.", "Agreement with feminine singular noun calma."],
            ["Lo leí como si ___ mi propia historia. (Tôi đọc như thể đó là câu chuyện của chính mình)", ["fuera", "es", "sea", "será"], 0, "como si luôn đi với imperfecto de subjuntivo: fuera.", "como si always takes the imperfect subjunctive: fuera."],
          ],
          sentences: [
            ["El silencio decía más que mil palabras", "Sự im lặng nói lên nhiều hơn ngàn lời nói."],
            ["Cada recuerdo guarda una emoción distinta", "Mỗi ký ức lưu giữ một cảm xúc riêng biệt."],
            ["La novela mezcla humor y fina nostalgia", "Cuốn tiểu thuyết hòa trộn hài hước và nỗi hoài niệm tinh tế."],
          ],
        },
        {
          id: "x7", title: "Liên từ mạch lạc văn viết", titleEn: "Written discourse connectors",
          words: `asimismo|ngoài ra
no obstante|tuy nhiên
puesto que|bởi vì
en cambio|ngược lại
por consiguiente|do đó
en resumen|tóm lại
destacar|làm nổi bật
plantear|đặt ra`,
          grammar: [
            ["___ no asistió al acto, envió sus propuestas. (Dù không dự lễ, anh ấy vẫn gửi đề xuất)", ["Pese a que", "Puesto que", "Por lo tanto", "En cambio"], 0, "Pese a que: mặc dù.", "Concessive connector pese a que."],
            ["Faltan recursos; ___, debemos priorizar metas. (Thiếu nguồn lực; do đó ta phải ưu tiên mục tiêu)", ["por consiguiente", "en cambio", "no obstante", "puesto que"], 0, "por consiguiente chỉ hệ quả hợp lý.", "por consiguiente expresses consequence."],
            ["Conviene distinguir lo urgente ___ lo importante. (Cần phân biệt việc gấp với việc quan trọng)", ["de", "a", "con", "en"], 0, "distinguir X de Y.", "distinguir takes de."],
            ["No vino a la reunión ___ estaba enfermo. (Anh ấy không đến họp vì bị ốm)", ["puesto que", "no obstante", "en cambio", "asimismo"], 0, "Nêu nguyên nhân trong văn viết: puesto que.", "Give a reason in formal writing: puesto que."],
          ],
          sentences: [
            ["No obstante las cifras muestran otra realidad", "Tuy nhiên các con số cho thấy một thực tế khác."],
            ["Puesto que llueve aplazaremos el evento", "Vì trời mưa nên chúng ta sẽ hoãn sự kiện."],
            ["Asimismo conviene revisar las normas vigentes", "Ngoài ra cũng nên rà soát lại các quy định hiện hành."],
            ["En resumen el balance anual fue positivo", "Tóm lại kết quả tổng kết năm khá tích cực."],
            ["Conviene plantear preguntas claras desde el inicio", "Nên đặt ra câu hỏi rõ ràng ngay từ đầu."],
            ["Por consiguiente ajustaremos nuestro plan inicial", "Do đó chúng ta sẽ điều chỉnh kế hoạch ban đầu."],
          ],
        },
        {
          id: "x8", title: "Từ vựng nâng cao", titleEn: "Advanced vocabulary",
          words: `sostenible|bền vững
crítica|phê bình
negociar|đàm phán
perspectiva|góc nhìn
eficaz|hiệu quả
contribuir|đóng góp
dudar|do dự
fiable|đáng tin cậy
ambiguo|mơ hồ
consecuencia|hệ quả`,
        },
      ],
    },
    {
      id: "c1", title: "DELE C1", desc: "Văn phong học thuật, sắc thái tinh tế, thành ngữ và viết luận.",
      units: [
        {
          id: "1", title: "Lập luận học thuật", titleEn: "Academic argument",
          words: `hipótesis|giả thuyết
premisa|tiền đề
criterio|tiêu chí
rigor|sự chặt chẽ
síntesis|tổng hợp
sesgo|thiên kiến
correlación|tương quan
validez|tính xác thực`,
          grammar: [
            ["Los resultados distan mucho de ___ concluyentes. (Kết quả còn lâu mới mang tính kết luận)", ["ser", "estar", "haber", "tener"], 0, "distar de + nguyên mẫu: còn xa mới...", "distar de + infinitive means to be far from."],
            ["Cabe subrayar que ningún estudio ___ libre de sesgos. (Cần nhấn mạnh rằng không nghiên cứu nào hoàn toàn hết thiên kiến)", ["está", "es", "sea", "haya"], 0, "estar libre de: thoát khỏi (trạng thái).", "estar libre de is the standard collocation."],
            ["A tenor ___ los datos, urge replantear el método. (Căn cứ theo dữ liệu, cần xem lại phương pháp)", ["de", "a", "por", "con"], 0, "Cụm học thuật: a tenor de (căn cứ theo).", "Formal prepositional phrase: a tenor de."],
            ["De ___ la hipótesis, habría que repetir el ensayo. (Nếu giả thuyết được xác nhận thì phải lặp lại thử nghiệm)", ["confirmarse", "confirmada", "se confirma", "confirmando"], 0, "de + nguyên mẫu thay cho mệnh đề điều kiện: de confirmarse.", "de + infinitive replaces an if-clause: de confirmarse."],
          ],
          sentences: [
            ["La hipótesis exige verificación empírica rigurosa", "Giả thuyết đòi hỏi kiểm chứng thực nghiệm chặt chẽ."],
            ["Conviene evitar sesgos en la muestra", "Cần tránh thiên kiến trong việc chọn mẫu."],
            ["Esta síntesis integra diversas corrientes teóricas", "Bản tổng hợp này kết nối nhiều dòng lý thuyết khác nhau."],
          ],
        },
        {
          id: "2", title: "Chính sách công và quản trị", titleEn: "Public policy and governance",
          words: `normativa|quy chuẩn
transparencia|minh bạch
regulación|điều tiết
consenso|đồng thuận
fiscalidad|chính sách thuế
infraestructura|hạ tầng
desigualdad|bất bình đẳng
cohesión|gắn kết`,
          grammar: [
            ["Sea cual ___ la decisión, habrá que justificarla. (Dù quyết định thế nào cũng phải giải trình)", ["fuere", "sea", "era", "es"], 0, "Công thức trang trọng hoặc sea cual sea / fuere.", "Formal reduplicative expression sea cual fuere/sea."],
            ["Urge aprobar una normativa que ___ la transparencia. (Cần gấp quy chuẩn bảo đảm tính minh bạch)", ["garantice", "garantiza", "garantizó", "garantizará"], 0, "Tìm danh từ chưa xác định tính chất → subjuntivo: garantice.", "Unknown/desired antecedent takes subjunctive."],
            ["La falta de consenso ___ la ejecución del plan. (Thiếu đồng thuận làm đình trệ thực thi kế hoạch)", ["frena", "frenan", "frenar", "frenando"], 0, "Chủ ngữ số ít La falta → động từ số ít frena.", "Singular head noun la falta takes singular verb."],
            ["La medida fue aprobada sin que ___ consenso. (Biện pháp được thông qua mà không có đồng thuận)", ["hubiera", "había", "hay", "habría"], 0, "sin que + subjuntivo; ngữ cảnh quá khứ dùng hubiera.", "sin que + subjunctive; a past context takes hubiera."],
          ],
          sentences: [
            ["La transparencia institucional fortalece la confianza pública", "Minh bạch thể chế củng cố niềm tin công chúng."],
            ["Toda regulación eficaz requiere seguimiento continuo", "Mọi quy định hiệu quả đều cần giám sát liên tục."],
            ["Invertir en infraestructura reduce brechas regionales", "Đầu tư hạ tầng giúp thu hẹp khoảng cách vùng miền."],
          ],
        },
        {
          id: "3", title: "Văn phong uyển chuyển và tu từ", titleEn: "Rhetoric and subtle phrasing",
          words: `elocuencia|tài hùng biện
paradoja|nghịch lý
sutileza|sự tinh tế
ironía|châm biếm nhẹ
eufemismo|uyển ngữ
implicación|hàm ý
verosímil|có sức thuyết phục
ambigüedad|tính đa nghĩa`,
          grammar: [
            ["Lejos de ___ el conflicto, aquel discurso lo avivó. (Thay vì xoa dịu xung đột, bài phát biểu lại làm bùng lên)", ["aplacar", "aplaca", "aplacado", "aplaque"], 0, "lejos de + động từ nguyên mẫu.", "lejos de + infinitive."],
            ["No es que ___ desacuerdo, sino que faltan plazos. (Không phải là bất đồng mà là thiếu lộ trình thời hạn)", ["haya", "hay", "hubo", "habrá"], 0, "no es que + subjuntivo, sino que + indicativo.", "no es que triggers subjunctive."],
            ["Resulta paradójico que ___ más recursos y menos tiempo. (Thật nghịch lý khi có nhiều nguồn lực hơn nhưng ít thời gian hơn)", ["existan", "existen", "existirán", "existieron"], 0, "Đánh giá chủ quan resulta paradójico que + subjuntivo.", "Value judgment triggers subjunctive."],
            ["Su ironía era tan sutil ___ pocos la captaron. (Lối mỉa mai của ông ấy tinh tế đến mức ít người nhận ra)", ["que", "como", "cual", "de"], 0, "Hệ quả: tan + tính từ + que.", "Result clause: tan + adjective + que."],
          ],
          sentences: [
            ["Su discurso combinó firmeza con admirable sutileza", "Bài diễn văn của bà kết hợp sự cứng rắn với nét tinh tế đáng nể."],
            ["La paradoja invita a cuestionar supuestos cómodos", "Nghịch lý thôi thúc ta đặt câu hỏi với những giả định quen thuộc."],
            ["Cada matiz modifica sutilmente la intención", "Từng sắc thái nhỏ đều làm đổi nhẹ dụng ý câu nói."],
          ],
        },
        {
          id: "4", title: "Thành ngữ và quán dụng ngữ", titleEn: "Idioms and proverbs",
          words: `costumbre|phong tục
proverbio|tục ngữ
matizar|nói giảm, điều chỉnh sắc thái
desenlace|kết cục
iniciativa|sáng kiến
audacia|sự táo bạo
prudencia|sự thận trọng
acierto|nước đi đúng`,
          grammar: [
            ["Más vale prevenir que ___. (Phòng bệnh hơn chữa bệnh)", ["curar", "sanar", "tratar", "ver"], 0, "Tục ngữ tiếng Tây Ban Nha: Más vale prevenir que curar.", "Proverb: Better safe than sorry."],
            ["El proyecto salió ___ pedir de boca. (Dự án diễn ra suôn sẻ như ý muốn)", ["a", "de", "por", "con"], 0, "Thành ngữ: salir a pedir de boca.", "Idiom: a pedir de boca (go swimmingly)."],
            ["Decidieron cortar ___ lo sano antes de perder más. (Họ quyết định cắt bỏ dứt khoát trước khi lỗ thêm)", ["por", "con", "de", "en"], 0, "Thành ngữ: cortar por lo sano (giải quyết dứt điểm).", "Idiom: cortar por lo sano."],
            ["No hay mal que por bien no ___. (Trong cái rủi có cái may)", ["venga", "viene", "vendrá", "vino"], 0, "Tục ngữ cố định, mệnh đề quan hệ sau phủ định dùng subjuntivo: venga.", "A fixed proverb; the relative clause after a negative takes the subjunctive: venga."],
          ],
          sentences: [
            ["Quien mucho abarca poco aprieta dice el refrán", "Tục ngữ có câu tham thì thâm, ôm đồm khó tinh."],
            ["Supo dar en el clavo enseguida", "Cô ấy đã đánh trúng trọng tâm vấn đề ngay lập tức."],
            ["Entre dicho y hecho hay gran trecho", "Nói và làm luôn có một khoảng cách không nhỏ."],
          ],
        },
        {
          id: "x1", title: "Sinh thái học và chuyển dịch năng lượng", titleEn: "Ecology and energy transition",
          words: `descarbonización|giảm phát thải carbon
renovable|tái tạo
biodiversidad|đa dạng sinh học
ecosistema|hệ sinh thái
resiliencia|khả năng chống chịu
mitigación|giảm nhẹ
huella hídrica|dấu chân nước
transición|chuyển dịch`,
          grammar: [
            ["A menos que ___ las emisiones, el calentamiento proseguirá. (Trừ phi giảm phát thải, nóng lên toàn cầu sẽ tiếp diễn)", ["se reduzcan", "se reducen", "reducirán", "reducen"], 0, "a menos que luôn đòi hỏi subjuntivo.", "a menos que always takes subjunctive."],
            ["La biodiversidad depende de ecosistemas ___. (Đa dạng sinh học phụ thuộc vào các hệ sinh thái khỏe mạnh)", ["sanos", "sano", "sana", "sanas"], 0, "ecosistemas giống đực số nhiều → sanos.", "Agreement with masculine plural noun."],
            ["Urge acelerar la transición ___ fuentes limpias. (Cần đẩy nhanh chuyển dịch sang nguồn sạch)", ["hacia", "sobre", "entre", "sin"], 0, "Chuyển hướng sang nguồn mới dùng hacia.", "Direction of transition uses hacia."],
            ["Con tal de que ___ en renovables, la transición será viable. (Miễn là có đầu tư vào năng lượng tái tạo, quá trình chuyển dịch sẽ khả thi)", ["se invierta", "se invierte", "se invertirá", "invertir"], 0, "con tal de que + subjuntivo: se invierta.", "con tal de que + subjunctive: se invierta."],
          ],
          sentences: [
            ["La resiliencia urbana requiere infraestructuras verdes adaptadas", "Khả năng chống chịu đô thị đòi hỏi hạ tầng xanh thích ứng."],
            ["Mitigar daños climáticos resulta más rentable hoy", "Giảm nhẹ thiệt hại khí hậu hiệu quả chi phí hơn ngay từ hôm nay."],
            ["Cada ecosistema cumple funciones insustituibles en equilibrio", "Mỗi hệ sinh thái giữ vai trò không thể thay thế trong thế cân bằng."],
          ],
        },
        {
          id: "x2", title: "Kinh tế vĩ mô và toàn cầu hóa", titleEn: "Macroeconomics and globalization",
          words: `inflación|lạm phát
arancel|thuế quan
cadena|chuỗi cung ứng
competitividad|năng lực cạnh tranh
productividad|năng suất
déficit|thâm hụt
estabilidad|ổn định
divisa|ngoại tệ`,
          grammar: [
            ["De persistir la inflación, ___ el poder adquisitivo. (Nếu lạm phát kéo dài, sức mua sẽ giảm)", ["caerá", "cae", "caiga", "caía"], 0, "De + nguyên mẫu chỉ điều kiện có thể xảy ra → futuro.", "De + infinitive conditional."],
            ["La productividad crece conforme se ___ las cadenas. (Năng suất tăng khi các chuỗi được hiện đại hóa)", ["modernizan", "moderniza", "modernicen", "modernizar"], 0, "Hành động song hành thực tế dùng indicativo số nhiều modernizan.", "Real concurrent habit takes indicative."],
            ["Conviene diversificar proveedores ante posibles ___. (Nên đa dạng nhà cung ứng trước các rủi ro gián đoạn)", ["crisis", "crises", "crisises", "critic"], 0, "Danh từ crisis giữ nguyên dạng ở cả số ít và số nhiều.", "crisis has identical singular and plural forms."],
            ["El déficit se redujo ___ las exportaciones aumentaron. (Thâm hụt giảm nhờ xuất khẩu tăng)", ["gracias a que", "a pesar de que", "a fin de que", "sin que"], 0, "Nguyên nhân tích cực: gracias a que + indicativo.", "A positive cause: gracias a que + indicative."],
          ],
          sentences: [
            ["La estabilidad monetaria favorece inversiones a largo plazo", "Ổn định tiền tệ khuyến khích các khoản đầu tư dài hạn."],
            ["Cadenas globales resilientes amortiguan choques externos imprevistos", "Chuỗi cung ứng toàn cầu vững vàng giúp giảm sốc từ bên ngoài."],
            ["La competitividad nace de educación e innovación", "Năng lực cạnh tranh bắt nguồn từ giáo dục và đổi mới."],
          ],
        },
        {
          id: "x3", title: "Tâm lý học và hành vi con người", titleEn: "Psychology and human behavior",
          words: `percepción|nhận thức
empatía|thấu cảm
resiliencia|sức bật tinh thần
hábito|thói quen
impulso|xung động
reflexión|tự chiêm nghiệm
bienestar|sức khỏe tinh thần
autodisciplina|tự kỷ luật`,
          grammar: [
            ["Cuanto más reflexionamos, mejor ___ nuestras reacciones. (Càng chiêm nghiệm, ta càng hiểu phản ứng của mình hơn)", ["comprendemos", "comprendamos", "comprendíamos", "comprendimos"], 0, "Quy luật chung với cuanto más..., mejor + indicativo.", "General truth with correlative takes indicative."],
            ["La empatía permite ponerse en ___ del otro. (Thấu cảm giúp đặt mình vào vị trí người khác)", ["el lugar", "la zona", "el punto", "la parte"], 0, "Thành ngữ: ponerse en el lugar del otro.", "Idiom: put oneself in someone else's shoes."],
            ["No basta con querer cambiar; hace falta ___. (Muốn thay đổi thôi chưa đủ; cần phải kiên trì)", ["constancia", "constante", "constar", "constantemente"], 0, "hace falta + danh từ: constancia.", "hace falta takes a noun."],
            ["Se dio cuenta ___ que necesitaba ayuda. (Anh ấy nhận ra mình cần giúp đỡ)", ["de", "en", "a", "con"], 0, "darse cuenta de que: không được bỏ de.", "darse cuenta de que: the de cannot be dropped."],
          ],
          sentences: [
            ["La percepción selectiva moldea nuestros juicios cotidianos", "Nhận thức chọn lọc định hình các phán đoán hằng ngày của ta."],
            ["Cultivar hábitos saludables protege el bienestar mental", "Nuôi dưỡng thói quen lành mạnh bảo vệ sức khỏe tinh thần."],
            ["La reflexión serena frena impulsos poco meditados", "Suy ngẫm điềm tĩnh kìm hãm những bốc đồng thiếu cân nhắc."],
          ],
        },
        {
          id: "x4", title: "Khoa học, đạo đức và AI", titleEn: "Science, ethics and AI",
          words: `ética|đạo đức
responsabilidad|trách nhiệm
algorítmico|thuộc thuật toán
sesgado|bị thiên lệch
supervisión|giám sát
autonomía|tính tự chủ
dilema|tiến thoái lưỡng nan
consentimiento|sự đồng thuận`,
          grammar: [
            ["Es imperativo que toda decisión automatizada ___ auditable. (Bắt buộc mọi quyết định tự động đều phải kiểm toán được)", ["sea", "es", "está", "será"], 0, "Es imperativo que + subjuntivo: sea.", "Es imperativo que triggers subjunctive."],
            ["Por avanzada que ___ la máquina, no sustituye el criterio humano. (Dù máy móc tiên tiến đến đâu cũng không thay được phán đoán con người)", ["sea", "es", "fuera", "será"], 0, "Cấu trúc nhượng bộ Por + tính từ + que + subjuntivo.", "Concessive por + adj + que takes subjunctive."],
            ["Sin supervisión humana, los errores ___ multiplicarse. (Không có giám sát của người, lỗi có nguy cơ nhân lên)", ["tienden a", "tienden de", "tienden en", "tienden por"], 0, "tender a + nguyên mẫu: có xu hướng.", "tender takes preposition a."],
            ["No se trata de prohibir la IA, ___ de regularla. (Vấn đề không phải cấm AI mà là quản lý nó)", ["sino", "pero", "sin", "si no"], 0, "Sau phủ định, sửa lại ý bằng sino (viết liền).", "After a negative, correct the idea with sino (one word)."],
          ],
          sentences: [
            ["La ética tecnológica orienta diseños centrados en personas", "Đạo đức công nghệ định hướng thiết kế lấy con người làm trung tâm."],
            ["Ningún sistema autónomo debe eludir responsabilidad legal", "Không hệ thống tự động nào được né tránh trách nhiệm pháp lý."],
            ["El consentimiento informado garantiza confianza digital duradera", "Sự đồng thuận có hiểu biết bảo đảm niềm tin số lâu dài."],
          ],
        },
        {
          id: "x5", title: "Triết luận và nghệ thuật", titleEn: "Philosophy and arts",
          words: `estética|mỹ học
belleza|cái đẹp
contemplación|sự chiêm ngưỡng
efímero|phù du, thoáng qua
trascendencia|tính siêu việt
identidad|bản sắc
diálogo|đối thoại
legado|di sản`,
          grammar: [
            ["Pocas obras logran captar lo ___ del instante. (Ít tác phẩm nắm bắt được nét thoáng qua của khoảnh khắc)", ["efímero", "efímera", "efímeros", "efímeras"], 0, "Mạo từ trung tính lo + tính từ giống đực số ít: lo efímero.", "Neuter article lo + masculine singular adjective."],
            ["El arte nos invita a mirar más ___ de lo obvio. (Nghệ thuật mời gọi ta nhìn vượt khỏi điều hiển nhiên)", ["allá", "aquí", "cerca", "lejos"], 0, "más allá de: vượt ra ngoài.", "Prepositional phrase más allá de."],
            ["Sin diálogo abierto, cualquier tradición ___ en rutina. (Thiếu đối thoại cởi mở, mọi truyền thống sẽ hóa thành lối mòn)", ["deviene", "devenir", "devenga", "devino"], 0, "Sự thật chung dùng hiện tại đơn deviene.", "Present simple for general statement."],
            ["Por ___ que parezca, la obra encierra un gran dilema. (Dù có vẻ đơn giản đến đâu, tác phẩm vẫn chứa một nan đề lớn)", ["simple", "simpleza", "simplemente", "simplificar"], 0, "por + tính từ + que + subjuntivo: por simple que parezca.", "por + adjective + que + subjunctive: por simple que parezca."],
          ],
          sentences: [
            ["La belleza habita a menudo en detalles discretos", "Cái đẹp thường trú ngụ trong những chi tiết khiêm nhường."],
            ["Todo legado cultural se renueva mediante diálogo vivo", "Mọi di sản văn hóa đều tự làm mới qua đối thoại sống động."],
            ["La contemplación pausada revela significados antes ocultos", "Sự chiêm ngưỡng thong thả hé lộ những tầng nghĩa từng ẩn giấu."],
          ],
        },
        {
          id: "x6", title: "Đảo ngữ và cấu trúc tinh xảo", titleEn: "Inversion and refined style",
          words: `apenas|vừa mới, hầu như không
jamás|chưa từng bao giờ
siempre y cuando|với điều kiện là
dado que|xét rằng
por ende|vì vậy
a raíz de|bắt nguồn từ
conllevar|kéo theo
plasmar|thể hiện lên`,
          grammar: [
            ["Apenas ___ terminado la exposición, estallaron los aplausos. (Bài thuyết trình vừa dứt, tràng pháo tay liền vang lên)", ["hubo", "ha", "había", "haya"], 0, "apenas + pretérito anterior (hubo + phân từ) trong văn phong trang trọng.", "Literary temporal clause: apenas + preterite perfect."],
            ["A raíz ___ aquel hallazgo se revisó todo el archivo. (Bắt nguồn từ phát hiện đó, cả kho lưu trữ được xem lại)", ["de", "a", "en", "por"], 0, "Cụm giới từ cố định: a raíz de.", "Fixed phrase: a raíz de."],
            ["Tal decisión conlleva riesgos; ___, exige cautela. (Quyết định ấy kéo theo rủi ro; vì thế cần thận trọng)", ["por ende", "a pesar", "en vano", "por fin"], 0, "por ende (trang trọng) = vì vậy.", "Formal consequence connector: por ende."],
            ["Jamás ___ visto una ejecución tan impecable. (Tôi chưa từng thấy màn trình diễn nào hoàn hảo đến vậy)", ["había", "hube", "habré", "haber"], 0, "Jamás đứng đầu câu, trải nghiệm tính đến một mốc quá khứ dùng pluscuamperfecto: había visto.", "With fronted jamás, experience up to a past point takes the pluperfect: había visto."],
          ],
          sentences: [
            ["Jamás había presenciado un consenso tan amplio", "Tôi chưa từng chứng kiến một sự đồng thuận rộng rãi đến vậy."],
            ["Dado que cambian los hechos ajustaremos criterios", "Xét rằng thực tế thay đổi, chúng ta sẽ điều chỉnh tiêu chí."],
            ["Tales medidas conllevan esfuerzos sostenidos a largo plazo", "Những biện pháp đó kéo theo nỗ lực bền bỉ dài hạn."],
          ],
        },
        {
          id: "x7", title: "Tổng hợp học thuật & nghị luận", titleEn: "Academic synthesis",
          words: `concluir|kết luận
refutar|bác bỏ
corroborar|xác nhận thêm
discrepancia|sự sai lệch
alcance|tầm vóc, phạm vi
pertinencia|tính phù hợp
encaminar|định hướng
respaldar|hậu thuẫn`,
          grammar: [
            ["Los nuevos ensayos corroboran lo ___ en la primera fase. (Các thử nghiệm mới xác nhận lại điều được nêu ở giai đoạn đầu)", ["expuesto", "exponiendo", "exponer", "expuso"], 0, "lo + phân từ động từ exponer (bất quy tắc): lo expuesto.", "Neuter lo + irregular participle expuesto."],
            ["Resulta imprescindible acotar el ___ del informe. (Cần thiết phải khoanh vùng phạm vi của báo cáo)", ["alcance", "alcanzar", "alcanzado", "alcances"], 0, "el alcance: phạm vi tác động/nghiên cứu.", "el alcance means scope."],
            ["Conviene refutar con datos y nunca ___ descalificaciones. (Nên phản bác bằng số liệu chứ không công kích)", ["mediante", "sin", "según", "hacia"], 0, "mediante: thông qua, bằng.", "mediante means by means of."],
            ["Los datos no hacen ___ respaldar la tesis inicial. (Dữ liệu chỉ càng củng cố luận điểm ban đầu)", ["sino", "pero", "más", "solo"], 0, "no hacer sino + nguyên mẫu = chỉ làm một việc.", "no hacer sino + infinitive = to do nothing but."],
          ],
          sentences: [
            ["Los datos corroboran plenamente la tendencia observada", "Số liệu xác nhận hoàn toàn xu hướng đã quan sát."],
            ["Conviene señalar discrepancias sin perder rigor crítico", "Nên chỉ ra các sai lệch mà vẫn giữ chuẩn mực phản biện."],
            ["Del análisis conjunto se desprende una conclusión clara", "Từ phân tích tổng thể toát lên một kết luận rõ ràng."],
            ["Toda crítica constructiva orienta mejoras futuras sólidas", "Mọi phản biện xây dựng đều định hướng cải tiến vững chắc."],
            ["En definitiva la claridad conceptual sostiene buenas decisiones", "Sau cùng, sự minh bạch khái niệm làm nền cho quyết định đúng."],
            ["El progreso duradero nace de cooperación responsable", "Tiến bộ bền vững sinh ra từ sự hợp tác có trách nhiệm."],
          ],
        },
        {
          id: "x8", title: "Từ vựng chuyên sâu", titleEn: "Expert vocabulary",
          words: `meticuloso|tỉ mỉ
omnipresente|có mặt khắp nơi
pragmático|thực tế
resiliente|kiên cường
articular|diễn đạt rõ ràng
ambivalente|lưỡng lự
elocuente|hùng hồn
inevitable|không thể tránh
matiz|sắc thái
empatía|sự thấu cảm`,
        },
      ],
    },
  ],
};
