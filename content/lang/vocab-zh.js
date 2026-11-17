// zh vocabulary expansion: 1000 extra words (200 per level, 4 units per level).
// Format: "word|reading|Vietnamese meaning". Only append units at the END of each level; never change existing IDs.
// Units use IDs v1..v4 so they never collide with base units. Each word is unique within the course.
export default {
  hsk1: [
    { id: "v1", title: "Đồ vật và màu sắc", titleEn: "Objects and colours", words: `灯|dēng|đèn
钟|zhōng|đồng hồ treo tường
镜子|jìngzi|cái gương
毛巾|máojīn|khăn mặt
肥皂|féizào|xà phòng
牙刷|yáshuā|bàn chải răng
雨伞|yǔsǎn|cái ô
钥匙|yàoshi|chìa khóa
电视|diànshì|ti vi
照相机|zhàoxiàngjī|máy ảnh
瓶子|píngzi|cái chai
盘子|pánzi|cái đĩa
勺子|sháozi|cái thìa
叉子|chāzi|cái nĩa
刀|dāo|con dao
锅|guō|cái nồi
平底锅|píngdǐguō|cái chảo
篮子|lánzi|cái giỏ
盒子|hézi|cái hộp
裤子|kùzi|quần dài
袜子|wàzi|tất
眼镜|yǎnjìng|kính mắt
皮带|pídài|thắt lưng
夹克|jiākè|áo khoác
毛衣|máoyī|áo len
大衣|dàyī|áo khoác dài
围巾|wéijīn|khăn quàng cổ
手套|shǒutào|găng tay
衣架|yījià|móc treo quần áo
尺子|chǐzi|thước kẻ
橡皮|xiàngpí|cục tẩy
计算器|jìsuànqì|máy tính bỏ túi
信封|xìnfēng|phong bì
邮票|yóupiào|tem thư
纸|zhǐ|giấy
照片|zhàopiàn|bức ảnh
蜡烛|làzhú|cây nến
花瓶|huāpíng|bình hoa
本子|běnzi|vở
黄色|huángsè|màu vàng
黑色|hēisè|màu đen
白色|báisè|màu trắng
棕色|zōngsè|màu nâu
粉色|fěnsè|màu hồng
灰色|huīsè|màu xám
紫色|zǐsè|màu tím
橙色|chéngsè|màu cam
红色|hóngsè|màu đỏ
桌布|zhuōbù|khăn trải bàn
梳子|shūzi|cái lược` },
    { id: "v2", title: "Thức ăn và đồ uống", titleEn: "Food and drink", words: `肉|ròu|thịt
虾|xiā|con tôm
奶酪|nǎilào|pho mát
黄油|huángyóu|bơ
牛奶|niúnǎi|sữa bò
咖啡|kāfēi|cà phê
果汁|guǒzhī|nước ép
啤酒|píjiǔ|bia
葡萄酒|pútaojiǔ|rượu vang
胡椒|hújiāo|hạt tiêu
沙拉|shālā|rau trộn
面条|miàntiáo|mì sợi
比萨|bǐsà|pizza
三明治|sānmíngzhì|bánh sandwich
蛋糕|dàngāo|bánh ngọt
饼干|bǐnggān|bánh quy
冰淇淋|bīngqílín|kem
香蕉|xiāngjiāo|quả chuối
葡萄|pútao|quả nho
草莓|cǎoméi|dâu tây
柠檬|níngméng|quả chanh
土豆|tǔdòu|khoai tây
西红柿|xīhóngshì|cà chua
胡萝卜|húluóbo|cà rốt
洋葱|yángcōng|hành tây
白菜|báicài|cải thảo
蘑菇|mógu|nấm
玉米|yùmǐ|ngô
蔬菜|shūcài|rau củ
饭馆|fànguǎn|nhà hàng
饱|bǎo|no
做饭|zuòfàn|nấu cơm
烤|kǎo|nướng
炸|zhá|rán
削|xiāo|gọt vỏ
切片|qiēpiàn|thái lát
切碎|qiēsuì|băm nhỏ
辣|là|cay
酸|suān|chua
甜|tián|ngọt
苦|kǔ|đắng
新鲜|xīnxiān|tươi
冷冻|lěngdòng|đông lạnh
碗|wǎn|cái bát
果酱|guǒjiàng|mứt
包子|bāozi|bánh bao
豆腐|dòufu|đậu phụ
面包|miànbāo|bánh mì
西瓜|xīguā|dưa hấu
桃子|táozi|quả đào` },
    { id: "v3", title: "Nơi chốn và đi lại", titleEn: "Places and getting around", words: `路|lù|con đường
桥|qiáo|cây cầu
邮局|yóujú|bưu điện
教堂|jiàotáng|nhà thờ
博物馆|bówùguǎn|bảo tàng
城市|chéngshì|thành phố
村子|cūnzi|ngôi làng
出租车|chūzūchē|taxi
汽车|qìchē|ô tô
摩托车|mótuōchē|xe máy
船|chuán|thuyền
人行横道|rénxíng héngdào|vạch qua đường
红绿灯|hónglǜdēng|đèn giao thông
直走|zhízǒu|đi thẳng
近|jìn|gần
后面|hòumiàn|phía sau
前面|qiánmiàn|phía trước
拐角|guǎijiǎo|góc đường
大楼|dàlóu|tòa nhà
层|céng|tầng
电梯|diàntī|thang máy
楼梯|lóutī|cầu thang
入口|rùkǒu|lối vào
出口|chūkǒu|lối ra
停车场|tíngchēchǎng|bãi đỗ xe
路线|lùxiàn|tuyến đường
离开|líkāi|rời đi
开车|kāichē|lái xe
电车|diànchē|xe điện
人行道|rénxíngdào|vỉa hè
隧道|suìdào|đường hầm
大门|dàmén|cổng lớn
环岛|huándǎo|vòng xuyến
十字路口|shízì lùkǒu|ngã tư
电影院|diànyǐngyuàn|rạp chiếu phim
剧院|jùyuàn|nhà hát
工厂|gōngchǎng|nhà máy
农场|nóngchǎng|trang trại
修车店|xiūchēdiàn|gara sửa xe
加油站|jiāyóuzhàn|trạm xăng
公交车站|gōngjiāo chēzhàn|trạm xe buýt
街道|jiēdào|con phố
公园|gōngyuán|công viên
房子|fángzi|ngôi nhà
警察局|jǐngchájú|đồn cảnh sát
饭店|fàndiàn|nhà hàng
书店|shūdiàn|hiệu sách
玩具店|wánjùdiàn|cửa hàng đồ chơi
洗手间|xǐshǒujiān|nhà vệ sinh
地铁站|dìtiězhàn|ga tàu điện ngầm` },
    { id: "v4", title: "Thời gian và thời tiết", titleEn: "Time and weather", words: `年|nián|năm
小时|xiǎoshí|giờ
分钟|fēnzhōng|phút
秒|miǎo|giây
以后|yǐhòu|sau này
季节|jìjié|mùa
下雨的|xiàyǔ de|có mưa
暖和|nuǎnhuo|ấm
风|fēng|gió
太阳|tàiyáng|mặt trời
月亮|yuèliang|mặt trăng
星星|xīngxing|ngôi sao
天空|tiānkōng|bầu trời
海|hǎi|biển
山|shān|núi
河|hé|sông
森林|sēnlín|rừng
一百|yìbǎi|một trăm
一千|yìqiān|một nghìn
一半|yíbàn|một nửa
四分之一|sìfēn zhī yī|một phần tư
零|líng|số không
二十|èrshí|hai mươi
一百万|yìbǎiwàn|một triệu
夜|yè|ban đêm
中午|zhōngwǔ|buổi trưa
晚上|wǎnshang|buổi tối
半夜|bànyè|nửa đêm
黎明|límíng|bình minh
黄昏|huánghūn|hoàng hôn
日历|rìlì|lịch
日期|rìqī|ngày tháng
时间|shíjiān|thời gian
时间表|shíjiānbiǎo|thời gian biểu
很快|hěn kuài|sắp, nhanh
通常的|tōngcháng de|thông thường
以前|yǐqián|trước đây
之后|zhīhòu|sau khi
期间|qījiān|trong suốt
两个星期|liǎng ge xīngqī|hai tuần
十年|shí nián|thập kỷ
世纪|shìjì|thế kỷ
今晚|jīnwǎn|tối nay
白天|báitiān|ban ngày
午饭时间|wǔfàn shíjiān|giờ ăn trưa
早上|zǎoshang|buổi sáng
冬天|dōngtiān|mùa đông
夏天|xiàtiān|mùa hè
春天|chūntiān|mùa xuân
秋天|qiūtiān|mùa thu` },
  ],
  hsk2: [
    { id: "v1", title: "Nhà cửa và đồ đạc", titleEn: "Home and furniture", words: `浴室|yùshì|phòng tắm
客厅|kètīng|phòng khách
花园|huāyuán|khu vườn
阳台|yángtái|ban công
屋顶|wūdǐng|mái nhà
墙|qiáng|bức tường
地毯|dìtǎn|tấm thảm
沙发|shāfā|ghế sofa
柜子|guìzi|tủ
冰箱|bīngxiāng|tủ lạnh
炉灶|lúzào|bếp
烤箱|kǎoxiāng|lò nướng
洗衣机|xǐyījī|máy giặt
吸尘器|xīchénqì|máy hút bụi
窗帘|chuānglián|rèm cửa
枕头|zhěntou|cái gối
被子|bèizi|chăn
床单|chuángdān|khăn trải giường
架子|jiàzi|kệ
抽屉|chōuti|ngăn kéo
房客|fángkè|người thuê nhà
公寓|gōngyù|căn hộ
暖气|nuǎnqì|hệ thống sưởi
修理|xiūlǐ|sửa chữa
干净|gānjìng|sạch sẽ
整齐|zhěngqí|gọn gàng
脏|zāng|bẩn
舒服|shūfu|thoải mái
装饰|zhuāngshì|trang trí
电费|diànfèi|tiền điện
地址|dìzhǐ|địa chỉ
洗碗机|xǐwǎnjī|máy rửa bát
水槽|shuǐcáo|bồn rửa
水龙头|shuǐlóngtóu|vòi nước
厕所|cèsuǒ|nhà vệ sinh
淋浴|línyù|vòi sen
灯光|dēngguāng|ánh đèn
走廊|zǒuláng|hành lang
阁楼|gélóu|gác mái
地下室|dìxiàshì|tầng hầm
篱笆|líba|hàng rào
门铃|ménlíng|chuông cửa
拖把|tuōbǎ|cây lau nhà
扫帚|sàozhou|cái chổi
垃圾桶|lājītǒng|thùng rác
海绵|hǎimián|miếng bọt biển
水壶|shuǐhú|ấm nước
窗户|chuānghu|cửa sổ
厨房|chúfáng|nhà bếp
卧室|wòshì|phòng ngủ` },
    { id: "v2", title: "Mua sắm và tiền bạc", titleEn: "Shopping and money", words: `售货员|shòuhuòyuán|nhân viên bán hàng
收据|shōujù|biên lai
折扣|zhékòu|giảm giá
价钱|jiàqián|giá tiền
付钱|fùqián|trả tiền
现金|xiànjīn|tiền mặt
卡|kǎ|thẻ
找零|zhǎolíng|tiền thừa
退款|tuìkuǎn|hoàn tiền
换货|huànhuò|đổi hàng
试穿|shìchuān|thử đồ
便宜货|piányi huò|món hời
排队|páiduì|xếp hàng
购物车|gòuwùchē|xe đẩy hàng
产品|chǎnpǐn|sản phẩm
网上的|wǎngshàng de|trực tuyến
送货|sònghuò|giao hàng
硬币|yìngbì|đồng xu
纸币|zhǐbì|tiền giấy
取款机|qǔkuǎnjī|máy rút tiền
花钱|huāqián|tiêu tiền
欠|qiàn|nợ
收入|shōurù|thu nhập
纪念品|jìniànpǐn|quà lưu niệm
礼物|lǐwù|món quà
包裹|bāoguǒ|bưu kiện
百货商店|bǎihuò shāngdiàn|cửa hàng bách hóa
超市|chāoshì|siêu thị
收银员|shōuyínyuán|thu ngân
免费|miǎnfèi|miễn phí
价格标签|jiàgé biāoqiān|nhãn giá
摊位|tānwèi|quầy hàng
优惠券|yōuhuìquàn|phiếu giảm giá
目录|mùlù|danh mục sản phẩm
收银台|shōuyíntái|quầy thanh toán
购物袋|gòuwùdài|túi mua sắm
购物狂|gòuwùkuáng|người nghiện mua sắm
宰客|zǎikè|hét giá
二手的|èrshǒu de|đồ cũ
全新的|quánxīn de|mới toanh
降价的|jiàngjià de|đã giảm giá
有货|yǒu huò|còn hàng
售完|shòuwán|hết hàng
发票|fāpiào|hóa đơn
包装|bāozhuāng|gói quà
保修|bǎoxiū|bảo hành
促销|cùxiāo|khuyến mãi
商场|shāngchǎng|trung tâm thương mại
银行卡|yínhángkǎ|thẻ ngân hàng
网购|wǎnggòu|mua sắm trực tuyến` },
    { id: "v3", title: "Sức khỏe và cơ thể", titleEn: "Health and the body", words: `脸|liǎn|khuôn mặt
耳朵|ěrduo|tai
鼻子|bízi|mũi
嘴|zuǐ|miệng
舌头|shétou|lưỡi
脖子|bózi|cổ
肩膀|jiānbǎng|vai
胳膊|gēbo|cánh tay
手指|shǒuzhǐ|ngón tay
胸|xiōng|ngực
胃|wèi|dạ dày
背|bèi|lưng
腿|tuǐ|chân
膝盖|xīgài|đầu gối
脚|jiǎo|bàn chân
心脏|xīnzàng|tim
血|xiě|máu
药剂师|yàojìshī|dược sĩ
药片|yàopiàn|viên thuốc
流感|liúgǎn|cúm
喉咙痛|hóulong tòng|đau họng
牙疼|yáténg|đau răng
伤口|shāngkǒu|vết thương
绷带|bēngdài|băng gạc
处方|chǔfāng|đơn thuốc
健康的|jiànkāng de|khỏe mạnh
虚弱的|xūruò de|yếu
维生素|wéishēngsù|vitamin
恢复|huīfù|hồi phục
受伤|shòushāng|bị thương
头晕|tóuyūn|chóng mặt
恶心|ěxin|buồn nôn
肿|zhǒng|sưng
淤青|yūqīng|vết bầm
烫伤|tàngshāng|vết bỏng
割伤|gēshāng|vết cắt
X光|X guāng|chụp X-quang
血压|xuèyā|huyết áp
体温计|tǐwēnjì|nhiệt kế
手术|shǒushù|ca phẫu thuật
救护车|jiùhùchē|xe cứu thương
急诊室|jízhěnshì|phòng cấp cứu
轮椅|lúnyǐ|xe lăn
拐杖|guǎizhang|nạng
牙医|yáyī|nha sĩ
眼科医生|yǎnkē yīshēng|bác sĩ mắt
肺|fèi|phổi
肚子|dùzi|bụng
额头|étóu|trán
手臂|shǒubì|cánh tay` },
    { id: "v4", title: "Công việc và nghề nghiệp", titleEn: "Work and jobs", words: `员工|yuángōng|nhân viên
老板|lǎobǎn|sếp
申请表|shēnqǐngbiǎo|đơn xin việc
技能|jìnéng|kỹ năng
培训|péixùn|đào tạo
退休|tuìxiū|nghỉ hưu
失业的|shīyè de|thất nghiệp
农民|nóngmín|nông dân
厨师|chúshī|đầu bếp
警察|jǐngchá|cảnh sát
消防员|xiāofángyuán|lính cứu hỏa
士兵|shìbīng|người lính
飞行员|fēixíngyuán|phi công
记者|jìzhě|nhà báo
设计师|shèjìshī|nhà thiết kế
会计|kuàijì|kế toán
律师|lǜshī|luật sư
秘书|mìshū|thư ký
接待员|jiēdàiyuán|lễ tân
班次|bāncì|ca làm việc
加班|jiābān|làm thêm giờ
项目|xiàngmù|dự án
任务|rènwu|nhiệm vụ
考勤表|kǎoqínbiǎo|bảng chấm công
车间|chējiān|xưởng sản xuất
生意|shēngyi|doanh nghiệp
客户|kèhù|khách hàng doanh nghiệp
成功|chénggōng|thành công
奖金|jiǎngjīn|tiền thưởng
工资单|gōngzīdān|phiếu lương
空缺|kòngquē|vị trí tuyển dụng
事业|shìyè|sự nghiệp
主管|zhǔguǎn|người giám sát
助理|zhùlǐ|trợ lý
实习生|shíxíshēng|thực tập sinh
会议室|huìyìshì|phòng họp
工作场所|gōngzuò chǎngsuǒ|nơi làm việc
职业|zhíyè|nghề nghiệp
作家|zuòjiā|nhà văn
画家|huàjiā|họa sĩ
歌手|gēshǒu|ca sĩ
演员|yǎnyuán|diễn viên
工人|gōngrén|công nhân
工程师|gōngchéngshī|kỹ sư
公务员|gōngwùyuán|công chức
销售员|xiāoshòuyuán|nhân viên bán hàng
工作人员|gōngzuò rényuán|nhân viên
建筑师|jiànzhùshī|kiến trúc sư
理发师|lǐfàshī|thợ cắt tóc
游泳教练|yóuyǒng jiàoliàn|huấn luyện viên bơi` },
  ],
  hsk3: [
    { id: "v1", title: "Du lịch và sân bay", titleEn: "Travel and the airport", words: `行李箱|xínglǐxiāng|va li
登机牌|dēngjīpái|thẻ lên máy bay
航班|hángbān|chuyến bay
出发|chūfā|khởi hành
到达|dàodá|đến nơi
取消|qǔxiāo|hủy bỏ
登机口|dēngjīkǒu|cổng lên máy bay
海关|hǎiguān|hải quan
游客|yóukè|khách du lịch
导游|dǎoyóu|hướng dẫn viên
观光|guānguāng|tham quan
行程|xíngchéng|lịch trình
住宿|zhùsù|chỗ ở
露营地|lùyíngdì|khu cắm trại
度假村|dùjiàcūn|khu nghỉ dưỡng
海滩|hǎitān|bãi biển
岛屿|dǎoyǔ|hòn đảo
山谷|shāngǔ|thung lũng
瀑布|pùbù|thác nước
湖|hú|hồ
沙漠|shāmò|sa mạc
首都|shǒudū|thủ đô
边境|biānjìng|biên giới
货币|huòbì|tiền tệ
汇率|huìlǜ|tỷ giá
保险|bǎoxiǎn|bảo hiểm
紧急情况|jǐnjí qíngkuàng|tình huống khẩn cấp
大使馆|dàshǐguǎn|đại sứ quán
旅游团|lǚyóutuán|đoàn du lịch
风景|fēngjǐng|phong cảnh
旅行|lǚxíng|du lịch
背包客|bēibāokè|người đi bụi
漫步|mànbù|đi dạo
陌生的|mòshēng de|lạ lẫm
当地人|dāngdìrén|người địa phương
外国的|wàiguó de|nước ngoài
航空公司|hángkōng gōngsī|hãng hàng không
座位|zuòwèi|chỗ ngồi
跑道|pǎodào|đường băng
候机楼|hòujīlóu|nhà ga sân bay
安检|ānjiǎn|kiểm tra an ninh
时差|shíchā|lệch múi giờ
防晒霜|fángshàishuāng|kem chống nắng
青年旅舍|qīngnián lǚshè|nhà nghỉ bình dân
徒步|túbù|đi bộ đường dài
寺庙|sìmiào|ngôi đền
城堡|chéngbǎo|lâu đài
车票|chēpiào|vé tàu xe
游览|yóulǎn|du ngoạn
旅馆|lǚguǎn|nhà trọ` },
    { id: "v2", title: "Học tập và thi cử", titleEn: "Study and exams", words: `成绩|chéngjì|kết quả
分数|fēnshù|điểm số
学位|xuéwèi|bằng cấp
大学|dàxué|trường đại học
学院|xuéyuàn|học viện
讲座|jiǎngzuò|bài giảng
学期|xuéqī|học kỳ
论文|lùnwén|luận văn
毕业论文|bìyè lùnwén|luận văn tốt nghiệp
研究|yánjiū|nghiên cứu
实验室|shíyànshì|phòng thí nghiệm
学费|xuéfèi|học phí
课程|kèchéng|khóa học
科目|kēmù|môn học
复习|fùxí|ôn tập
记住|jìzhù|ghi nhớ
集中|jízhōng|tập trung
理解|lǐjiě|hiểu
解释|jiěshì|giải thích
批改|pīgǎi|chấm bài
不及格|bù jígé|trượt
及格|jígé|đỗ
证书|zhèngshū|chứng chỉ
文学|wénxué|văn học
地理|dìlǐ|địa lý
化学|huàxué|hóa học
物理|wùlǐ|vật lý
生物|shēngwù|sinh học
数学|shùxué|toán học
经济学|jīngjìxué|kinh tế học
心理学|xīnlǐxué|tâm lý học
哲学|zhéxué|triết học
翻译|fānyì|dịch
语法|yǔfǎ|ngữ pháp
发音|fāyīn|phát âm
词典|cídiǎn|từ điển
教科书|jiàokēshū|sách giáo khoa
笔记|bǐjì|ghi chú
教学大纲|jiàoxué dàgāng|đề cương môn học
小测验|xiǎo cèyàn|bài kiểm tra ngắn
家庭作业|jiātíng zuòyè|bài tập về nhà
同学|tóngxué|bạn cùng lớp
家教|jiājiào|gia sư
学年|xuénián|năm học
校长|xiàozhǎng|hiệu trưởng
校园|xiàoyuán|khuôn viên trường
讲师|jiǎngshī|giảng viên
作文|zuòwén|bài văn
考卷|kǎojuàn|bài thi
奖学金|jiǎngxuéjīn|học bổng` },
    { id: "v3", title: "Công nghệ và internet", titleEn: "Technology and the internet", words: `智能手机|zhìnéng shǒujī|điện thoại thông minh
笔记本电脑|bǐjìběn diànnǎo|máy tính xách tay
平板电脑|píngbǎn diànnǎo|máy tính bảng
键盘|jiànpán|bàn phím
鼠标|shǔbiāo|chuột
屏幕|píngmù|màn hình
电池|diànchí|pin
充电器|chōngdiànqì|bộ sạc
用户名|yònghùmíng|tên người dùng
登录|dēnglù|đăng nhập
上传|shàngchuán|tải lên
安装|ānzhuāng|cài đặt
更新|gēngxīn|cập nhật
软件|ruǎnjiàn|phần mềm
应用程序|yìngyòng chéngxù|ứng dụng
浏览器|liúlǎnqì|trình duyệt
搜索引擎|sōusuǒ yǐnqíng|công cụ tìm kiếm
电子邮件|diànzǐ yóujiàn|thư điện tử
附件|fùjiàn|tệp đính kèm
通知|tōngzhī|thông báo
视频通话|shìpín tōnghuà|cuộc gọi video
网络|wǎngluò|mạng
无线网|wúxiànwǎng|wifi
信号|xìnhào|tín hiệu
数据库|shùjùkù|cơ sở dữ liệu
加密|jiāmì|mã hóa
黑客|hēikè|tin tặc
病毒|bìngdú|vi-rút
备份|bèifèn|sao lưu
社交媒体|shèjiāo méitǐ|mạng xã hội
博客|bókè|blog
播客|bōkè|podcast
直播|zhíbō|phát trực tiếp
机器人|jīqìrén|người máy
硬件|yìngjiàn|phần cứng
小工具|xiǎo gōngjù|tiện ích
数字的|shùzì de|kỹ thuật số
机器|jīqì|máy móc
自动的|zìdòng de|tự động
程序|chéngxù|chương trình
代码|dàimǎ|mã
错误|cuòwù|lỗi
死机|sǐjī|treo máy
连接|liánjiē|kết nối
充电|chōngdiàn|sạc
删除|shānchú|xóa
网页|wǎngyè|trang mạng
手机号码|shǒujī hàomǎ|số điện thoại
电子|diànzǐ|điện tử
储存|chǔcún|lưu trữ` },
    { id: "v4", title: "Cảm xúc và tính cách", titleEn: "Feelings and personality", words: `高兴的|gāoxìng de|vui vẻ
难过的|nánguò de|buồn
生气的|shēngqì de|tức giận
害怕的|hàipà de|sợ hãi
惊讶的|jīngyà de|ngạc nhiên
紧张的|jǐnzhāng de|hồi hộp
兴奋的|xīngfèn de|háo hức
无聊的|wúliáo de|chán
困惑的|kùnhuò de|bối rối
不好意思|bù hǎoyìsi|xấu hổ
孤独的|gūdú de|cô đơn
嫉妒的|jídù de|ghen tị
感激的|gǎnjī de|biết ơn
平静的|píngjìng de|bình tĩnh
耐心的|nàixīn de|kiên nhẫn
诚实的|chéngshí de|trung thực
慷慨的|kāngkǎi de|hào phóng
勇敢的|yǒnggǎn de|dũng cảm
害羞的|hàixiū de|nhút nhát
礼貌的|lǐmào de|lịch sự
粗鲁的|cūlǔ de|thô lỗ
聪明的|cōngming de|thông minh
懒惰的|lǎnduò de|lười biếng
小心的|xiǎoxīn de|cẩn thận
有创造力的|yǒu chuàngzàolì de|sáng tạo
幽默的|yōumò de|hài hước
认真的|rènzhēn de|nghiêm túc
善良的|shànliáng de|tốt bụng
自私的|zìsī de|ích kỷ
开朗的|kāilǎng de|vui tươi
友好的|yǒuhǎo de|thân thiện
有野心的|yǒu yěxīn de|có tham vọng
谦虚的|qiānxū de|khiêm tốn
好奇的|hàoqí de|tò mò
情绪化的|qíngxù huà de|dễ xúc động
心情|xīnqíng|tâm trạng
性格|xìnggé|tính cách
行为|xíngwéi|hành vi
态度|tàidu|thái độ
关系|guānxì|mối quan hệ
信任|xìnrèn|tin tưởng
原谅|yuánliàng|tha thứ
道歉|dàoqiàn|xin lỗi
鼓励|gǔlì|khuyến khích
钦佩|qīnpèi|ngưỡng mộ
开玩笑|kāi wánxiào|trêu chọc
温柔的|wēnróu de|dịu dàng
体贴的|tǐtiē de|thông cảm
谨慎的|jǐnshèn de|thận trọng
勇气|yǒngqì|dũng khí` },
  ],
  hsk4: [
    { id: "v1", title: "Môi trường và thiên nhiên", titleEn: "Environment and nature", words: `气候|qìhòu|khí hậu
全球变暖|quánqiú biànnuǎn|nóng lên toàn cầu
堆肥|duīféi|phân trộn
垃圾填埋场|lājī tiánmáichǎng|bãi chôn lấp rác
排放|páifàng|khí thải
可再生能源|kě zàishēng néngyuán|năng lượng tái tạo
太阳能|tàiyángnéng|năng lượng mặt trời
化石燃料|huàshí ránliào|nhiên liệu hóa thạch
干旱|gānhàn|hạn hán
洪水|hóngshuǐ|lũ lụt
地震|dìzhèn|động đất
飓风|jùfēng|bão lớn
濒危的|bīnwēi de|bị đe dọa
物种|wùzhǒng|loài
栖息地|qīxīdì|môi trường sống
生态系统|shēngtài xìtǒng|hệ sinh thái
生物多样性|shēngwù duōyàngxìng|đa dạng sinh học
森林砍伐|sēnlín kǎnfá|nạn phá rừng
保存|bǎocún|bảo tồn
生态的|shēngtài de|thuộc sinh thái
环保的|huánbǎo de|thân thiện môi trường
减少|jiǎnshǎo|giảm bớt
再利用|zài lìyòng|tái sử dụng
处理|chǔlǐ|xử lý
有毒的|yǒudú de|độc hại
化学品|huàxuépǐn|hóa chất
灰尘|huīchén|bụi
雾霾|wùmái|sương mù ô nhiễm
氧气|yǎngqì|ô-xy
大气|dàqì|khí quyển
土壤|tǔrǎng|đất
侵蚀|qīnshí|xói mòn
融化|rónghuà|tan chảy
温度|wēndù|nhiệt độ
火山|huǒshān|núi lửa
海洋|hǎiyáng|đại dương
海岸|hǎi'àn|bờ biển
庄稼|zhuāngjia|vụ mùa
收获|shōuhuò|thu hoạch
农业|nóngyè|nông nghiệp
牲畜|shēngchù|gia súc
野生动物|yěshēng dòngwù|động vật hoang dã
灭绝|mièjué|tuyệt chủng
包装材料|bāozhuāng cáiliào|bao bì
污水|wūshuǐ|nước thải
农药|nóngyào|thuốc trừ sâu
植树造林|zhíshù zàolín|trồng rừng
碳|tàn|các-bon
环境保护|huánjìng bǎohù|bảo vệ môi trường
污染源|wūrǎnyuán|nguồn ô nhiễm` },
    { id: "v2", title: "Truyền thông và tin tức", titleEn: "Media and news", words: `新闻|xīnwén|tin tức
播出|bōchū|phát sóng
观众|guānzhòng|khán giả
出版|chūbǎn|xuất bản
编辑|biānjí|biên tập viên
文章|wénzhāng|bài báo
专栏作家|zhuānlán zuòjiā|người viết chuyên mục
审查|shěnchá|kiểm duyệt
谣言|yáoyán|tin đồn
假新闻|jiǎ xīnwén|tin giả
消息来源|xiāoxi láiyuán|nguồn tin
指控|zhǐkòng|cáo buộc
文件|wénjiàn|tài liệu
观点|guāndiǎn|quan điểm
偏见|piānjiàn|thiên kiến
客观的|kèguān de|khách quan
可信的|kěxìn de|đáng tin
核实|héshí|xác minh
调查|diàochá|điều tra
丑闻|chǒuwén|vụ bê bối
名人|míngrén|người nổi tiếng
走红|zǒuhóng|lan truyền
网红|wǎnghóng|người có sức ảnh hưởng
订阅|dìngyuè|đăng ký theo dõi
纪录片|jìlùpiàn|phim tài liệu
新闻发布会|xīnwén fābùhuì|họp báo
公告|gōnggào|thông báo chính thức
声明|shēngmíng|tuyên bố
特派记者|tèpài jìzhě|phóng viên thường trú
杂志|zázhì|tạp chí
频道|píndào|kênh
主持人|zhǔchírén|người dẫn chương trình
评论|pínglùn|bài bình luận
辩论|biànlùn|tranh luận
讨论|tǎolùn|thảo luận
论点|lùndiǎn|lập luận
立场|lìchǎng|lập trường
简讯|jiǎnxùn|bản tin ngắn
口号|kǒuhào|khẩu hiệu
讲台|jiǎngtái|bục phát biểu
耸人听闻的|sǒngrén tīngwén de|gây giật gân
采访|cǎifǎng|phỏng vấn
读者|dúzhě|độc giả
头条|tóutiáo|tiêu đề chính
网络新闻|wǎngluò xīnwén|tin tức mạng
记者会|jìzhěhuì|buổi họp báo
评论员|pínglùnyuán|bình luận viên
广播|guǎngbō|phát thanh
电台|diàntái|đài phát thanh
电视台|diànshìtái|đài truyền hình` },
    { id: "v3", title: "Kinh doanh và kinh tế", titleEn: "Business and economics", words: `通货膨胀|tōnghuò péngzhàng|lạm phát
劳动力市场|láodònglì shìchǎng|thị trường lao động
经济衰退|jīngjì shuāituì|suy thoái nhẹ
增长|zēngzhǎng|tăng trưởng
利润|lìrùn|lợi nhuận
亏损|kuīsǔn|khoản lỗ
营业额|yíngyè'é|doanh thu
开支|kāizhī|chi phí
投资者|tóuzīzhě|nhà đầu tư
股东|gǔdōng|cổ đông
股票|gǔpiào|cổ phiếu
市场份额|shìchǎng fèn'é|thị phần
竞争对手|jìngzhēng duìshǒu|đối thủ cạnh tranh
战略|zhànlüè|chiến lược
讨价还价|tǎojià huánjià|mặc cả
合作关系|hézuò guānxì|quan hệ đối tác
合并|hébìng|sáp nhập
初创企业|chūchuàng qǐyè|công ty khởi nghiệp
企业家|qǐyèjiā|doanh nhân
分公司|fēngōngsī|chi nhánh
总部|zǒngbù|trụ sở chính
供应|gōngyìng|nguồn cung
需求|xūqiú|nhu cầu
进口|jìnkǒu|nhập khẩu
出口贸易|chūkǒu màoyì|xuất khẩu
关税|guānshuì|thuế quan
贸易|màoyì|thương mại
贷款|dàikuǎn|khoản vay
抵押贷款|dǐyā dàikuǎn|khoản thế chấp
负债|fùzhài|khoản nợ phải trả
信用|xìnyòng|tín dụng
利率|lìlǜ|lãi suất
资产|zīchǎn|tài sản
赤字|chìzì|thâm hụt
盈余|yíngyú|thặng dư
生产力|shēngchǎnlì|năng suất
外包|wàibāo|thuê ngoài
解雇|jiěgù|sa thải
辞职|cízhí|từ chức
利益相关者|lìyì xiāngguānzhě|bên liên quan
市场营销|shìchǎng yíngxiāo|tiếp thị
品牌忠诚度|pǐnpái zhōngchéngdù|lòng trung thành thương hiệu
零售|língshòu|bán lẻ
批发|pīfā|bán buôn
产值|chǎnzhí|giá trị sản lượng
财务|cáiwù|tài chính
资金|zījīn|vốn
成本|chéngběn|chi phí
利息|lìxī|tiền lãi
价格战|jiàgézhàn|cuộc chiến giá` },
    { id: "v4", title: "Quan hệ và xã hội", titleEn: "Relationships and society", words: `社区|shèqū|cộng đồng
街区|jiēqū|khu phố
一代人|yídàirén|thế hệ
性别|xìngbié|giới tính
平等|píngděng|bình đẳng
歧视|qíshì|phân biệt đối xử
多样性|duōyàngxìng|sự đa dạng
少数民族|shǎoshù mínzú|thiểu số
多数|duōshù|đa số
文化|wénhuà|văn hóa
身份|shēnfèn|bản sắc
信念|xìnniàn|niềm tin
宗教|zōngjiào|tôn giáo
价值观|jiàzhíguān|giá trị
宽容|kuānróng|khoan dung
和谐|héxié|hài hòa
冲突|chōngtú|xung đột
合作|hézuò|hợp tác
志愿者|zhìyuànzhě|tình nguyện viên
慈善机构|císhàn jīgòu|tổ chức từ thiện
捐赠|juānzèng|quyên góp
自由|zìyóu|tự do
正义|zhèngyì|công lý
犯罪|fànzuì|tội phạm
惩罚|chéngfá|hình phạt
暴力|bàolì|bạo lực
贫困|pínkùn|nghèo đói
无家可归的|wújiā kě guī de|vô gia cư
农村的|nóngcūn de|nông thôn
城市的|chéngshì de|thành thị
移民|yímín|di cư
难民|nànmín|người tị nạn
融入|róngrù|hòa nhập
期望|qīwàng|kỳ vọng
感恩|gǎn'ēn|lòng biết ơn
忠诚|zhōngchéng|sự trung thành
承诺|chéngnuò|cam kết
声誉|shēngyù|danh tiếng
好客|hàokè|lòng hiếu khách
旁观者|pángguānzhě|người đứng ngoài
刻板印象|kèbǎn yìnxiàng|định kiến rập khuôn
失望|shīwàng|thất vọng
公民身份|gōngmín shēnfèn|quyền công dân
合法的|héfǎ de|hợp pháp
社会差距|shèhuì chājù|khoảng cách xã hội
社会阶层|shèhuì jiēcéng|giai cấp xã hội
民族群体|mínzú qúntǐ|nhóm dân tộc
友谊|yǒuyì|tình bạn
亲戚|qīnqi|họ hàng
恋爱|liàn'ài|yêu đương` },
  ],
  hsk5: [
    { id: "v1", title: "Học thuật và nghiên cứu", titleEn: "Academic study and research", words: `分析|fēnxī|phân tích
变量|biànliàng|biến số
评估|pínggū|đánh giá
诠释|quánshì|diễn giải
推论|tuīlùn|suy luận
经验的|jīngyàn de|dựa trên thực nghiệm
现象|xiànxiàng|hiện tượng
范式|fànshì|mô hình tư duy
框架|kuàngjià|khung lý thuyết
摘要|zhāiyào|tóm tắt
引用|yǐnyòng|trích dẫn
参考文献|cānkǎo wénxiàn|thư mục tài liệu
学术期刊|xuéshù qīkān|tạp chí khoa học
论文集|lùnwénjí|luận đề
严格审视|yángé shěnshì|xem xét kỹ lưỡng
严谨的|yánjǐn de|chặt chẽ
系统的|xìtǒng de|có hệ thống
主观的|zhǔguān de|chủ quan
可信度|kěxìndù|tính đáng tin
有效性|yǒuxiàoxìng|tính hợp lệ
可靠性|kěkàoxìng|độ tin cậy
假定|jiǎdìng|giả định
推导|tuīdǎo|suy ra
演绎|yǎnyì|suy diễn
归纳|guīnà|quy nạp
前提|qiántí|tiền đề
假设条件|jiǎshè tiáojiàn|giả định nền tảng
含义|hányì|hệ quả
意义|yìyì|ý nghĩa
异常|yìcháng|điều bất thường
定量的|dìngliàng de|định lượng
定性的|dìngxìng de|định tính
统计数据|tǒngjì shùjù|số liệu thống kê
伦理|lúnlǐ|đạo đức học thuật
探究|tànjiū|sự tìm hiểu
学科|xuékē|ngành học
学者|xuézhě|học giả
学术的|xuéshù de|thuộc học thuật
阐述|chǎnshù|trình bày chi tiết
论证|lùnzhèng|chứng minh
驳斥|bóchì|bác bỏ
证实|zhèngshí|xác nhận
分类学|fēnlèixué|hệ thống phân loại
猜想|cāixiǎng|phỏng đoán
审稿人|shěngǎorén|người bình duyệt
因果关系|yīnguǒ guānxì|quan hệ nhân quả
复现|fùxiàn|tái tạo kết quả
样本群|yàngběn qún|nhóm nghiên cứu
研究员|yánjiūyuán|nhà nghiên cứu
实证|shízhèng|bằng thực chứng` },
    { id: "v2", title: "Chính trị và xã hội", titleEn: "Politics and society", words: `议会|yìhuì|quốc hội
选举|xuǎnjǔ|cuộc bầu cử
候选人|hòuxuǎnrén|ứng cử viên
选票|xuǎnpiào|lá phiếu
授权|shòuquán|nhiệm vụ được ủy thác
法令|fǎlìng|đạo luật
规定|guīdìng|quy định
改革|gǎigé|cải cách
宪法|xiànfǎ|hiến pháp
主权|zhǔquán|chủ quyền
外交|wàijiāo|ngoại giao
条约|tiáoyuē|hiệp ước
联盟|liánméng|liên minh
制裁|zhìcái|lệnh trừng phạt
独裁|dúcái|chế độ độc tài
民主|mínzhǔ|nền dân chủ
权威|quánwēi|quyền lực, thẩm quyền
官僚主义|guānliáo zhǔyì|bộ máy quan liêu
腐败|fǔbài|tham nhũng
透明度|tòumíngdù|tính minh bạch
抗议|kàngyì|cuộc biểu tình
叛乱|pànluàn|cuộc nổi dậy
革命|gémìng|cuộc cách mạng
意识形态|yìshí xíngtài|hệ tư tưởng
民族主义|mínzú zhǔyì|chủ nghĩa dân tộc
不公平|bù gōngpíng|sự bất công
福利|fúlì|phúc lợi
养老金|yǎnglǎojīn|lương hưu
补贴|bǔtiē|khoản trợ cấp
税收|shuìshōu|việc đánh thuế
放松管制|fàngsōng guǎnzhì|sự bãi bỏ quy định
私有化|sīyǒuhuà|tư nhân hóa
垄断|lǒngduàn|độc quyền
游说|yóushuì|vận động hành lang
宣言|xuānyán|tuyên ngôn chính sách
否决权|fǒujuéquán|quyền phủ quyết
修正案|xiūzhèng'àn|sự sửa đổi
管辖权|guǎnxiáquán|thẩm quyền pháp lý
判决|pànjué|phán quyết
上诉|shàngsù|kháng cáo
被告|bèigào|bị cáo
起诉|qǐsù|việc truy tố
证词|zhèngcí|lời khai
豁免权|huōmiǎnquán|quyền miễn trừ
人口普查|rénkǒu pǔchá|cuộc điều tra dân số
人口统计的|rénkǒu tǒngjì de|thuộc nhân khẩu học
部门|bùmén|bộ, cơ quan nhà nước
弹劾|tánhé|sự luận tội
选民|xuǎnmín|cử tri
公投|gōngtóu|trưng cầu dân ý` },
    { id: "v3", title: "Nghệ thuật và văn hóa", titleEn: "Arts and culture", words: `美学|měixué|mỹ học
杰作|jiézuò|kiệt tác
展览|zhǎnlǎn|triển lãm
雕塑|diāosù|điêu khắc
建筑|jiànzhù|kiến trúc
芭蕾|bālěi|ba-lê
管弦乐团|guǎnxián yuètuán|dàn nhạc
交响曲|jiāoxiǎngqǔ|bản giao hưởng
作曲家|zuòqǔjiā|nhà soạn nhạc
诗歌|shīgē|thơ ca
叙事|xùshì|tự sự
主角|zhǔjué|nhân vật chính
反派|fǎnpài|nhân vật phản diện
情节|qíngjié|cốt truyện
主题|zhǔtí|chủ đề
隐喻|yǐnyù|ẩn dụ
象征主义|xiàngzhēng zhǔyì|chủ nghĩa biểu tượng
讽刺|fěngcì|châm biếm
悲剧|bēijù|bi kịch
喜剧|xǐjù|hài kịch
类型|lèixíng|thể loại
民间传说|mínjiān chuánshuō|văn hóa dân gian
仪式|yíshì|nghi lễ
典礼|diǎnlǐ|buổi lễ
工艺|gōngyì|tay nghề thủ công
工匠|gōngjiàng|nghệ nhân
意象|yìxiàng|hình ảnh văn chương
节奏|jiézòu|nhịp điệu
旋律|xuánlǜ|giai điệu
即兴创作|jíxìng chuàngzuò|ứng tác
表演|biǎoyǎn|biểu diễn
试镜|shìjìng|buổi thử giọng
评论家|pínglùnjiā|nhà phê bình
赞助人|zànzhùrén|người bảo trợ
画廊|huàláng|phòng trưng bày
画布|huàbù|vải vẽ tranh
颜料|yánliào|bột màu
笔触|bǐchù|nét cọ
文艺复兴|wényì fùxīng|thời kỳ Phục hưng
巴洛克|bāluòkè|phong cách Ba-rốc
印象派|yìnxiàngpài|trường phái Ấn tượng
现代主义|xiàndài zhǔyì|chủ nghĩa hiện đại
先锋派|xiānfēngpài|tiên phong
文化的|wénhuà de|thuộc văn hóa
俚语|lǐyǔ|tiếng lóng
成语|chéngyǔ|thành ngữ
谚语|yànyǔ|tục ngữ
轶事|yìshì|giai thoại
神话|shénhuà|thần thoại
古代的|gǔdài de|cổ đại` },
    { id: "v4", title: "Lập luận và diễn đạt", titleEn: "Argument and expression", words: `断言|duànyán|khẳng định
主张|zhǔzhāng|cho rằng
争议|zhēngyì|tranh chấp
加强|jiāqiáng|củng cố
强调|qiángdiào|nhấn mạnh
突出|tūchū|làm nổi bật
说明|shuōmíng|minh họa
举例说明|jǔlì shuōmíng|làm ví dụ cho
概述|gàishù|phác thảo
概括|gàikuò|tóm tắt
改写|gǎixiě|diễn đạt lại
模糊的|móhu de|mơ hồ, khó hiểu
清晰的|qīngxī de|rõ ràng, sáng sủa
连贯的|liánguàn de|mạch lạc
简洁的|jiǎnjié de|súc tích
有说服力的|yǒu shuōfúlì de|có sức thuyết phục
富有表现力的|fùyǒu biǎoxiànlì de|biểu cảm
内涵|nèihán|hàm ý
字面意义|zìmiàn yìyì|nghĩa đen
语气|yǔqì|giọng điệu
语域|yǔyù|văn phong
行话|hánghuà|thuật ngữ chuyên ngành
啰嗦的|luōsuo de|dài dòng
简短的|jiǎnduǎn de|cộc lốc
含糊的|hánhu de|mơ hồ, không rõ
精确的|jīngquè de|chính xác
难以捉摸的|nányǐ zhuōmō de|khó nắm bắt
深刻的|shēnkè de|sâu sắc
肤浅的|fūqiǎn de|hời hợt
琐碎的|suǒsuì de|tầm thường
敏锐的|mǐnruì de|sắc sảo
一丝不苟的|yìsī bùgǒu de|tỉ mỉ
不可避免的|bùkě bìmiǎn de|không thể tránh khỏi
似乎合理的|sìhū hélǐ de|có vẻ hợp lý
可疑的|kěyí de|đáng ngờ
表面的|biǎomiàn de|bề ngoài
脆弱的|cuìruò de|mong manh
务实的|wùshí de|thực dụng
教条的|jiàotiáo de|giáo điều
坚韧的|jiānrèn de|kiên cường
巧妙的|qiǎomiào de|khéo léo
虚伪|xūwěi|đạo đức giả
矛盾的|máodùn de|mâu thuẫn trong lòng
中肯的|zhòngkěn de|thích đáng
有力的|yǒulì de|thuyết phục
精明的|jīngmíng de|tinh tường
有形的|yǒuxíng de|hữu hình
削弱|xuēruò|làm yếu đi
含蓄的|hánxù de|kín đáo
直白的|zhíbái de|thẳng thắn` },
  ],
};
