// en vocabulary expansion: 1000 extra words (200 per level, 4 units per level).
// Format: "word|Vietnamese meaning". Only append units at the END of each level; never change existing IDs.
// Units use IDs v1..v4 so they never collide with base units. Each word is unique within the course.
export default {
  a1: [
    { id: "v1", title: "Đồ vật và màu sắc", titleEn: "Objects and colours", words: `lamp|đèn bàn
clock|đồng hồ treo tường
mirror|cái gương
towel|khăn tắm
soap|xà phòng
toothbrush|bàn chải đánh răng
umbrella|cái ô
key|chìa khóa
computer|máy tính
television|ti vi
camera|máy ảnh
bottle|cái chai
cup|cái cốc
plate|cái đĩa
spoon|cái thìa
fork|cái nĩa
knife|con dao
pot|cái nồi
pan|cái chảo
basket|cái giỏ
box|cái hộp
trousers|quần dài
socks|tất
glasses|kính mắt
belt|thắt lưng
jacket|áo khoác
sweater|áo len
coat|áo choàng dài
scarf|khăn quàng cổ
gloves|găng tay
hanger|móc treo quần áo
ruler|thước kẻ
eraser|cục tẩy
calculator|máy tính bỏ túi
envelope|phong bì
stamp|tem thư
paper|giấy
photo|bức ảnh
candle|cây nến
vase|bình hoa
notebook|vở, sổ tay
backpack|ba lô
yellow|màu vàng
black|màu đen
white|màu trắng
brown|màu nâu
pink|màu hồng
grey|màu xám
purple|màu tím
orange|màu cam` },
    { id: "v2", title: "Thức ăn và đồ uống", titleEn: "Food and drink", words: `rice|cơm, gạo
meat|thịt
shrimp|con tôm
egg|quả trứng
cheese|pho mát
butter|bơ
milk|sữa
coffee|cà phê
tea|trà
juice|nước ép
beer|bia
wine|rượu vang
pepper|hạt tiêu
salad|rau trộn
pasta|mì ống
pizza|bánh pizza
sandwich|bánh sandwich
cake|bánh ngọt
biscuit|bánh quy
ice cream|kem
banana|quả chuối
grape|quả nho
strawberry|quả dâu tây
lemon|quả chanh
potato|khoai tây
tomato|cà chua
carrot|cà rốt
onion|hành tây
cabbage|bắp cải
mushroom|nấm
corn|ngô
vegetable|rau củ
fruit|trái cây
restaurant|nhà hàng
full|no bụng
thirsty|khát
cook|nấu ăn
bake|nướng bánh
grill|nướng trên vỉ
peel|gọt vỏ
slice|thái lát
chop|băm, thái nhỏ
spicy|cay
sour|chua
sweet|ngọt
bitter|đắng
fresh|tươi
frozen|đông lạnh
bowl|cái bát
jam|mứt` },
    { id: "v3", title: "Nơi chốn và đi lại", titleEn: "Places and getting around", words: `road|con đường
bridge|cây cầu
market|chợ
post office|bưu điện
church|nhà thờ
museum|bảo tàng
city|thành phố
village|ngôi làng
taxi|xe taxi
car|ô tô
bicycle|xe đạp
motorbike|xe máy
plane|máy bay
boat|thuyền
crossing|lối qua đường
traffic light|đèn giao thông
left|bên trái
upstairs|tầng trên
straight ahead|thẳng phía trước
near|gần
far|xa
next to|bên cạnh
behind|phía sau
in front of|phía trước
corner|góc đường
building|tòa nhà
floor|tầng
lift|thang máy
stairs|cầu thang
entrance|lối vào
exit|lối ra
parking|chỗ đỗ xe
route|tuyến đường
leave|rời đi
drive|lái xe
tram|xe điện
subway|tàu điện ngầm
pavement|vỉa hè
tunnel|đường hầm
luggage hall|sảnh nhận hành lý
roundabout|vòng xuyến
junction|ngã ba, ngã tư
highway|đường cao tốc
cinema|rạp chiếu phim
theatre|nhà hát
plant|nhà máy công nghiệp
farm|trang trại
garage|gara sửa xe
petrol station|trạm xăng
bus stop|trạm xe buýt` },
    { id: "v4", title: "Thời gian và thời tiết", titleEn: "Time and weather", words: `year|năm
hour|giờ
minute|phút
second|giây
now|bây giờ
later|sau này
season|mùa
rainy|có mưa
warm|ấm
wind|gió
sun|mặt trời
moon|mặt trăng
star|ngôi sao
sky|bầu trời
sea|biển
mountain|núi
river|sông
forest|rừng
hundred|một trăm
thousand|một nghìn
half|một nửa
quarter|một phần tư
zero|số không
twenty|hai mươi
million|một triệu
night|ban đêm
noon|buổi trưa
afternoon|buổi chiều
evening|buổi tối
midnight|nửa đêm
dawn|bình minh
dusk|hoàng hôn
calendar|lịch
date|ngày tháng
time|thời gian
timetable|thời gian biểu
soon|sớm thôi
already|đã rồi
still|vẫn còn
usual|thông thường
ago|cách đây
before|trước
after|sau
during|trong suốt
fortnight|hai tuần
decade|thập kỷ
century|thế kỷ
tonight|tối nay
daytime|ban ngày
lunchtime|giờ ăn trưa` },
  ],
  a2: [
    { id: "v1", title: "Nhà cửa và đồ đạc", titleEn: "Home and furniture", words: `bathroom|phòng tắm
living room|phòng khách
garden|khu vườn
balcony|ban công
roof|mái nhà
wall|bức tường
carpet|tấm thảm
sofa|ghế sofa
cupboard|tủ đựng đồ
fridge|tủ lạnh
cooker|bếp nấu
oven|lò nướng
washing machine|máy giặt
vacuum cleaner|máy hút bụi
curtain|rèm cửa
pillow|cái gối
blanket|cái chăn
sheet|khăn trải giường
shelf|cái kệ
drawer|ngăn kéo
tenant|người thuê nhà
flat|căn hộ
room|căn phòng
heating|hệ thống sưởi
repair|sửa chữa
clean|sạch sẽ
tidy|gọn gàng
dirty|bẩn
comfortable|thoải mái
furniture|đồ nội thất
paint|sơn tường
electricity|điện
address|địa chỉ
dishwasher|máy rửa bát
sink|bồn rửa
tap|vòi nước
toilet|nhà vệ sinh
shower|vòi sen
light|đèn, ánh sáng
lounge|phòng khách (Anh)
hallway|hành lang
attic|gác mái
basement|tầng hầm
fence|hàng rào
doorbell|chuông cửa
mop|cây lau nhà
broom|cây chổi
bin|thùng rác
sponge|miếng bọt biển
kettle|ấm đun nước` },
    { id: "v2", title: "Mua sắm và tiền bạc", titleEn: "Shopping and money", words: `shop assistant|nhân viên bán hàng
receipt|biên lai
discount|giảm giá
sale|đợt giảm giá
cost|chi phí
pay|trả tiền
cash|tiền mặt
card|thẻ
change|tiền thừa
refund|hoàn tiền
exchange|đổi hàng
fit|vừa vặn
try on|thử đồ
bargain|món hời
queue|hàng người xếp hàng
trolley|xe đẩy hàng
product|sản phẩm
online|trực tuyến
delivery|giao hàng
coin|đồng xu
note|tờ tiền
cashpoint|máy rút tiền
spend|tiêu tiền
owe|nợ
income|thu nhập
cheque|séc
keepsake|vật kỷ niệm
gift|món quà
package|gói hàng
department store|cửa hàng bách hóa
supermarket|siêu thị
cashier|thu ngân
free|miễn phí
price tag|nhãn giá
market stall|quầy hàng chợ
coupon|phiếu giảm giá
brochure|tờ rơi quảng cáo
catalogue|danh mục sản phẩm
vending machine|máy bán hàng tự động
checkout|quầy thanh toán
shopping bag|túi mua sắm
shopaholic|người nghiện mua sắm
rip-off|hàng bị hét giá
second-hand|đã qua sử dụng
brand-new|mới toanh
reduced|đã giảm giá
in stock|còn hàng
out of stock|hết hàng
invoice|hóa đơn
wrap|gói (quà)` },
    { id: "v3", title: "Sức khỏe và cơ thể", titleEn: "Health and the body", words: `face|khuôn mặt
ear|tai
nose|mũi
mouth|miệng
tongue|lưỡi
neck|cổ
shoulder|vai
arm|cánh tay
finger|ngón tay
chest|ngực
stomach|dạ dày
back|lưng
leg|chân
knee|đầu gối
foot|bàn chân
heart|trái tim
blood|máu
pharmacist|dược sĩ
pill|viên thuốc
flu|cúm
sore throat|đau họng
toothache|đau răng
injury|vết thương
bandage|băng gạc
prescription|đơn thuốc
healthy|khỏe mạnh
exercise|tập thể dục
sleep|ngủ
weak|yếu
relax|thư giãn
vitamin|vitamin
recover|hồi phục
injure|làm bị thương
dizzy|chóng mặt
nausea|buồn nôn
swollen|sưng
bruise|vết bầm
burn|vết bỏng
cut|vết cắt
X-ray|chụp X-quang
blood pressure|huyết áp
thermometer|nhiệt kế
operation|ca phẫu thuật
ambulance|xe cứu thương
emergency room|phòng cấp cứu
wheelchair|xe lăn
crutches|nạng
dentist|nha sĩ
optician|bác sĩ mắt
lungs|phổi` },
    { id: "v4", title: "Công việc và nghề nghiệp", titleEn: "Work and jobs", words: `employee|nhân viên
employer|chủ lao động
meeting|cuộc họp
application|đơn xin việc
contract|hợp đồng
expertise|chuyên môn
training|đào tạo
retire|nghỉ hưu
unemployed|thất nghiệp
farmer|nông dân
driver|tài xế
chef|đầu bếp
police officer|cảnh sát
firefighter|lính cứu hỏa
soldier|người lính
pilot|phi công
journalist|nhà báo
designer|nhà thiết kế
accountant|kế toán viên
lawyer|luật sư
secretary|thư ký
receptionist|lễ tân
shift|ca làm việc
overtime|làm thêm giờ
briefing|buổi báo cáo ngắn
project|dự án
task|nhiệm vụ
timesheet|bảng chấm công
company|công ty
factory|nhà máy
workshop|xưởng
business|doanh nghiệp
client|khách hàng doanh nghiệp
responsibility|trách nhiệm
accomplish|hoàn thành
success|thành công
wage|tiền công
bonus|tiền thưởng
pay slip|phiếu lương
vacancy|vị trí tuyển dụng
recruit|tuyển dụng
resume|sơ yếu lý lịch
career|sự nghiệp
supervisor|người giám sát
assistant|trợ lý
trainee|thực tập sinh
intern|thực tập sinh
meeting room|phòng họp
workplace|nơi làm việc
profession|nghề nghiệp` },
  ],
  b1: [
    { id: "v1", title: "Du lịch và sân bay", titleEn: "Travel and the airport", words: `passport|hộ chiếu
visa|thị thực
suitcase|va li
boarding pass|thẻ lên máy bay
flight|chuyến bay
departure|sự khởi hành
arrival|sự đến nơi
cancel|hủy bỏ
gate|cổng lên máy bay
customs|hải quan
tourist|khách du lịch
guide|hướng dẫn viên
sightseeing|tham quan
itinerary|lịch trình chuyến đi
accommodation|chỗ ở
campsite|khu cắm trại
resort|khu nghỉ dưỡng
beach|bãi biển
island|hòn đảo
valley|thung lũng
waterfall|thác nước
lake|hồ
desert|sa mạc
capital|thủ đô
border|biên giới
currency|tiền tệ
exchange rate|tỷ giá
insurance|bảo hiểm
emergency|tình huống khẩn cấp
embassy|đại sứ quán
tour|chuyến tham quan có hướng dẫn
view|quang cảnh
scenery|phong cảnh
trip|chuyến đi
backpacker|người đi bụi
wander|đi lang thang
unfamiliar|lạ lẫm
local|người địa phương
foreign|thuộc nước ngoài
custom|phong tục
airline|hãng hàng không
seat|chỗ ngồi
runway|đường băng
terminal|nhà ga sân bay
security check|kiểm tra an ninh
passenger|hành khách
jet lag|lệch múi giờ
sunscreen|kem chống nắng
hostel|nhà nghỉ bình dân
hiking|đi bộ đường dài` },
    { id: "v2", title: "Học tập và thi cử", titleEn: "Study and exams", words: `exam|kỳ thi
result|kết quả
grade|điểm số
qualification|bằng cấp, trình độ
university|trường đại học
college|trường cao đẳng
lecture|bài giảng
semester|học kỳ
assignment|bài tập được giao
essay|bài luận
dissertation|luận văn
research|nghiên cứu
laboratory|phòng thí nghiệm
tuition|học phí
course|khóa học
subject|môn học
revise|ôn tập
memorise|ghi nhớ
concentrate|tập trung
understand|hiểu
explain|giải thích
question|câu hỏi
mark|chấm điểm
fail|trượt
pass|đỗ
certificate|chứng chỉ
diploma|bằng tốt nghiệp
literature|văn học
history|lịch sử
geography|địa lý
chemistry|hóa học
physics|vật lý
biology|sinh học
mathematics|toán học
economics|kinh tế học
psychology|tâm lý học
philosophy|triết học
translation|bản dịch
grammar|ngữ pháp
pronunciation|cách phát âm
dictionary|từ điển
textbook|sách giáo khoa
notes|ghi chú
syllabus|đề cương môn học
lesson|bài học
quiz|bài kiểm tra ngắn
homework|bài tập về nhà
classmate|bạn cùng lớp
tutor|gia sư
academic year|năm học` },
    { id: "v3", title: "Công nghệ và internet", titleEn: "Technology and the internet", words: `smartphone|điện thoại thông minh
laptop|máy tính xách tay
tablet|máy tính bảng
keyboard|bàn phím
mouse|chuột máy tính
screen|màn hình
battery|pin
charger|bộ sạc
password|mật khẩu
username|tên đăng nhập
login|đăng nhập
download|tải xuống
upload|tải lên
install|cài đặt
update|cập nhật
software|phần mềm
plugin|tiện ích mở rộng
website|trang web
browser|trình duyệt
search engine|công cụ tìm kiếm
email|thư điện tử
attachment|tệp đính kèm
text message|tin nhắn văn bản
notification|thông báo
video call|cuộc gọi video
network|mạng
wifi|wifi
signal|tín hiệu
database|cơ sở dữ liệu
encryption|mã hóa
security|an ninh, bảo mật
hacker|tin tặc
virus|vi-rút
backup|bản sao lưu
social media|mạng xã hội
blog|blog
podcast|podcast
streaming|phát trực tuyến
artificial intelligence|trí tuệ nhân tạo
robot|người máy
hardware|phần cứng
gadget|tiện ích công nghệ
digital|thuộc kỹ thuật số
invent|phát minh
technology|công nghệ
machine|máy móc
automatic|tự động
program|chương trình máy tính
code|mã lập trình
error|lỗi` },
    { id: "v4", title: "Cảm xúc và tính cách", titleEn: "Feelings and personality", words: `happy|vui vẻ
sad|buồn
angry|tức giận
afraid|sợ hãi
surprised|ngạc nhiên
nervous|hồi hộp
excited|háo hức
bored|chán
confused|bối rối
embarrassed|xấu hổ
lonely|cô đơn
jealous|ghen tị
grateful|biết ơn
calm|bình tĩnh
patient|kiên nhẫn
honest|trung thực
generous|hào phóng
brave|dũng cảm
shy|nhút nhát
polite|lịch sự
rude|thô lỗ
clever|thông minh
lazy|lười biếng
careful|cẩn thận
creative|sáng tạo
funny|hài hước
serious|nghiêm túc
kind|tốt bụng
selfish|ích kỷ
cheerful|vui tươi
friendly|thân thiện
ambitious|có tham vọng
modest|khiêm tốn
curious|tò mò
emotional|dễ xúc động
mood|tâm trạng
personality|tính cách
behaviour|hành vi
attitude|thái độ
relationship|mối quan hệ
trust|tin tưởng
argue|tranh cãi
forgive|tha thứ
apologise|xin lỗi
encourage|khuyến khích
admire|ngưỡng mộ
tease|trêu chọc
gentle|dịu dàng
sympathetic|thông cảm
cautious|thận trọng` },
  ],
  b2: [
    { id: "v1", title: "Môi trường và thiên nhiên", titleEn: "Environment and nature", words: `contamination|sự nhiễm bẩn
weather pattern|kiểu thời tiết
global warming|sự nóng lên toàn cầu
compost|phân trộn hữu cơ
landfill|bãi chôn lấp rác
emission|khí thải
renewable energy|năng lượng tái tạo
solar power|năng lượng mặt trời
fossil fuel|nhiên liệu hóa thạch
drought|hạn hán
flood|lũ lụt
earthquake|động đất
hurricane|bão lớn
threatened|bị đe dọa
species|loài
habitat|môi trường sống
ecosystem|hệ sinh thái
biodiversity|đa dạng sinh học
deforestation|nạn phá rừng
conservation|sự bảo tồn
protect|bảo vệ
preserve|gìn giữ
resource|tài nguyên
ecological|thuộc sinh thái
environmentally friendly|thân thiện với môi trường
cut down|cắt giảm
reuse|tái sử dụng
dispose|vứt bỏ, xử lý
toxic|độc hại
chemical|hóa chất
dust|bụi
smog|sương khói
oxygen|ô-xy
atmosphere|khí quyển
soil|đất
erosion|xói mòn
melt|tan chảy
temperature|nhiệt độ
volcano|núi lửa
ocean|đại dương
coast|bờ biển
crop|vụ mùa
harvest|thu hoạch
agriculture|nông nghiệp
livestock|vật nuôi, gia súc
wildlife|động vật hoang dã
extinction|sự tuyệt chủng
packaging|bao bì
sewage|nước thải
pesticide|thuốc trừ sâu` },
    { id: "v2", title: "Truyền thông và tin tức", titleEn: "Media and news", words: `news bulletin|bản tin
broadcast|phát sóng
audience|khán giả
publish|xuất bản
editor|biên tập viên
article|bài báo
columnist|người viết chuyên mục
censorship|sự kiểm duyệt
propaganda|tuyên truyền
rumour|tin đồn
fake news|tin giả
tip-off|tin mật báo cho báo chí
allegation|cáo buộc
document|tài liệu
viewpoint|quan điểm
prejudice|định kiến
objective|khách quan
credible|đáng tin
verify|xác minh
investigate|điều tra
scandal|vụ bê bối
celebrity|người nổi tiếng
advertisement|quảng cáo
campaign|chiến dịch
trend|xu hướng
viral|lan truyền
influence|ảnh hưởng
influencer|người có sức ảnh hưởng
subscribe|đăng ký theo dõi
documentary|phim tài liệu
press conference|họp báo
announcement|thông báo chính thức
statement|tuyên bố
correspondent|phóng viên thường trú
reporter|phóng viên
newspaper|báo
magazine|tạp chí
channel|kênh
host|người dẫn chương trình
critique|bài phê bình
reproach|lời trách móc
debate|tranh luận
discuss|thảo luận
argument|lập luận
standpoint|lập trường
bulletin|bản tin ngắn
slogan|khẩu hiệu
podium|bục phát biểu
sensational|gây giật gân
mainstream|xu hướng chủ đạo` },
    { id: "v3", title: "Kinh doanh và kinh tế", titleEn: "Business and economics", words: `economy|nền kinh tế
inflation|lạm phát
labour market|thị trường lao động
downturn|suy thoái nhẹ
growth|tăng trưởng
earnings|thu nhập lợi nhuận
loss|khoản lỗ
revenue|doanh thu
expense|khoản chi phí
investment|đầu tư
investor|nhà đầu tư
shareholder|cổ đông
stock|cổ phiếu
market share|thị phần
rivalry|sự đối đầu cạnh tranh
competitor|đối thủ cạnh tranh
strategy|chiến lược
haggle|mặc cả, trả giá
accord|hiệp định
partnership|quan hệ đối tác
merger|sáp nhập
startup|công ty khởi nghiệp
entrepreneur|doanh nhân
branch|chi nhánh
headquarters|trụ sở chính
supply|nguồn cung
requirement|yêu cầu, nhu cầu
import|nhập khẩu
export|xuất khẩu
quota|hạn ngạch
trade|thương mại
loan|khoản vay
mortgage|khoản thế chấp vay mua nhà
liability|khoản nợ phải trả
credit|tín dụng
interest rate|lãi suất
asset|tài sản
deficit|thâm hụt
surplus|thặng dư
productivity|năng suất
efficiency|hiệu quả
subcontract|thầu phụ
dismiss|sa thải
quit|nghỉ việc, bỏ việc
stakeholder|bên liên quan
marketing|tiếp thị
brand loyalty|lòng trung thành với thương hiệu
consumer|người tiêu dùng
retail|bán lẻ
wholesale|bán buôn` },
    { id: "v4", title: "Quan hệ và xã hội", titleEn: "Relationships and society", words: `community|cộng đồng
neighbourhood|khu phố
tradition|truyền thống
generation|thế hệ
gender|giới tính
equality|bình đẳng
discrimination|sự phân biệt đối xử
diversity|sự đa dạng
minority|thiểu số
majority|đa số
culture|văn hóa
identity|bản sắc
belief|niềm tin
religion|tôn giáo
values|giá trị
tolerance|sự khoan dung
harmony|sự hài hòa
conflict|xung đột
cooperate|hợp tác
volunteer|tình nguyện viên
charity|tổ chức từ thiện
donate|quyên góp
obligation|nghĩa vụ
freedom|tự do
justice|công lý
crime|tội phạm
punishment|hình phạt
violence|bạo lực
poverty|nghèo đói
homeless|vô gia cư
rural|thuộc nông thôn
urban|thuộc thành thị
population|dân số
migration|sự di cư
refugee|người tị nạn
integration|sự hòa nhập
expectation|kỳ vọng
gratitude|lòng biết ơn
loyalty|sự trung thành
commitment|sự cam kết
reputation|danh tiếng
hospitality|lòng hiếu khách
bystander|người đứng ngoài
stereotype|định kiến rập khuôn
disappointment|sự thất vọng
citizenship|quyền công dân
legal|hợp pháp
gap|khoảng cách xã hội
social class|giai cấp xã hội
ethnic group|nhóm dân tộc` },
  ],
  c1: [
    { id: "v1", title: "Học thuật và nghiên cứu", titleEn: "Academic study and research", words: `theory|lý thuyết
analysis|sự phân tích
method|phương pháp
variable|biến số
evaluate|đánh giá
interpret|diễn giải
conclude|kết luận
inference|sự suy luận
empirical|dựa trên thực nghiệm
phenomenon|hiện tượng
paradigm|mô hình tư duy
framework|khung lý thuyết
abstract|bản tóm tắt
citation|trích dẫn
bibliography|thư mục tài liệu
journal|tạp chí khoa học
thesis|luận đề
scrutiny|sự xem xét kỹ lưỡng
rigorous|chặt chẽ
systematic|có hệ thống
subjective|chủ quan
credibility|tính đáng tin
validity|tính hợp lệ
reliability|độ tin cậy
postulate|đề xuất giả định
derive|suy ra
deduce|suy diễn
induce|quy nạp
premise|tiền đề
assumption|giả định
implication|hệ quả
significance|ý nghĩa
anomaly|điều bất thường
quantitative|định lượng
qualitative|định tính
statistic|số liệu thống kê
ethics|đạo đức học thuật
inquiry|sự tìm hiểu
discipline|ngành học
scholar|học giả
academic|thuộc học thuật
elaborate|trình bày chi tiết
substantiate|chứng minh
refute|bác bỏ
corroborate|xác nhận
taxonomy|hệ thống phân loại
conjecture|phỏng đoán
referee|người bình duyệt
causality|quan hệ nhân quả
reproduce|tái tạo kết quả` },
    { id: "v2", title: "Chính trị và xã hội", titleEn: "Politics and society", words: `parliament|quốc hội
election|cuộc bầu cử
candidate|ứng cử viên
ballot|lá phiếu
mandate|nhiệm vụ được ủy thác
statute|đạo luật
regulation|quy định
reform|cải cách
constitution|hiến pháp
sovereignty|chủ quyền
diplomacy|ngoại giao
treaty|hiệp ước
alliance|liên minh
sanction|lệnh trừng phạt
dictatorship|chế độ độc tài
democracy|nền dân chủ
authority|quyền lực, thẩm quyền
bureaucracy|bộ máy quan liêu
corruption|tham nhũng
transparency|tính minh bạch
protest|cuộc biểu tình
rebellion|cuộc nổi dậy
revolution|cuộc cách mạng
ideology|hệ tư tưởng
nationalism|chủ nghĩa dân tộc
inequity|sự bất công
welfare|phúc lợi
pension|lương hưu
subsidy|khoản trợ cấp
taxation|việc đánh thuế
deregulation|sự bãi bỏ quy định
privatisation|tư nhân hóa
monopoly|độc quyền
lobby|vận động hành lang
manifesto|tuyên ngôn chính sách
veto|quyền phủ quyết
amendment|sự sửa đổi
jurisdiction|thẩm quyền pháp lý
verdict|phán quyết
appeal|kháng cáo
defendant|bị cáo
prosecution|việc truy tố
testimony|lời khai
immunity|quyền miễn trừ
census|cuộc điều tra dân số
demographic|thuộc nhân khẩu học
ministry|bộ, cơ quan nhà nước
impeachment|sự luận tội
electorate|cử tri
referendum|trưng cầu dân ý` },
    { id: "v3", title: "Nghệ thuật và văn hóa", titleEn: "Arts and culture", words: `aesthetics|mỹ học
masterpiece|kiệt tác
exhibition|cuộc triển lãm
sculpture|điêu khắc
architecture|kiến trúc
ballet|ba-lê
orchestra|dàn nhạc
symphony|bản giao hưởng
composer|nhà soạn nhạc
poetry|thơ ca
narrative|câu chuyện, tự sự
protagonist|nhân vật chính
antagonist|nhân vật phản diện
storyline|mạch truyện
theme|chủ đề
metaphor|ẩn dụ
symbolism|chủ nghĩa biểu tượng
satire|châm biếm
tragedy|bi kịch
comedy|hài kịch
genre|thể loại
folklore|văn hóa dân gian
ritual|nghi lễ
ceremony|buổi lễ
craftsmanship|tay nghề thủ công
artisan|nghệ nhân
imagery|hình ảnh văn chương
rhythm|nhịp điệu
melody|giai điệu
improvise|ứng tác
perform|biểu diễn
audition|buổi thử giọng
critic|nhà phê bình
patron|người bảo trợ
gallery|phòng trưng bày
canvas|vải vẽ tranh
pigment|bột màu
brushstroke|nét cọ
renaissance|thời kỳ Phục hưng
baroque|phong cách Ba-rốc
impressionism|trường phái Ấn tượng
modernism|chủ nghĩa hiện đại
avant-garde|tiên phong
cultural|thuộc văn hóa
slang|tiếng lóng
idiom|thành ngữ
proverb|tục ngữ
anecdote|giai thoại
legend|truyền thuyết
myth|thần thoại` },
    { id: "v4", title: "Lập luận và diễn đạt", titleEn: "Argument and expression", words: `assert|khẳng định
contend|cho rằng, tranh luận
concede|thừa nhận
dispute|tranh chấp
reinforce|củng cố
emphasise|nhấn mạnh
highlight|làm nổi bật
illustrate|minh họa
exemplify|làm ví dụ cho
outline|phác thảo
summarise|tóm tắt
paraphrase|diễn đạt lại
obscure|mơ hồ, khó hiểu
lucid|rõ ràng, sáng sủa
coherent|mạch lạc
concise|súc tích
persuasive|có sức thuyết phục
expressive|biểu cảm
subtlety|sự tinh tế
connotation|hàm ý
denotation|nghĩa đen
tone|giọng điệu
register|văn phong
jargon|thuật ngữ chuyên ngành
verbose|dài dòng
terse|cộc lốc
vague|mơ hồ, không rõ
precise|chính xác
elusive|khó nắm bắt
deep-rooted|ăn sâu
superficial|hời hợt
trivial|tầm thường
incisive|sắc sảo
thorough|kỹ lưỡng
unavoidable|không thể tránh khỏi
plausible|có vẻ hợp lý
dubious|đáng ngờ
ostensible|bề ngoài
tenuous|mong manh, yếu ớt
practical|thiết thực
dogmatic|giáo điều
tough|dẻo dai, cứng cỏi
ingenious|khéo léo, tài tình
hypocrisy|đạo đức giả
conflicted|mâu thuẫn trong lòng
pertinent|thích đáng, liên quan
cogent|thuyết phục
astute|tinh tường
tangible|hữu hình, rõ ràng
weaken|làm yếu đi` },
  ],
};
