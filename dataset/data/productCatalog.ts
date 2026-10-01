/**
 * Curated product catalog: name templates, brands, descriptions, prices,
 * color palettes, and sizes per category slug.
 *
 * The generator combines templates × brands to produce unique products.
 */

export interface ProductTemplate {
  name: string;
  descriptionVi: string;
  priceRange: [number, number]; // VND
  colors: string[];
  sizes: string[];
}

export interface CategoryCatalog {
  templates: ProductTemplate[];
  brands: string[];
}

export const PRODUCT_CATALOG: Record<string, CategoryCatalog> = {
  'thoi-trang-nam': {
    brands: ['Owen', 'Aristino', 'YODY', 'Routine', 'CANIFA', 'Biluxury', 'Việt Tiến', 'TNG'],
    templates: [
      { name: 'Áo thun cổ tròn', descriptionVi: 'Áo thun nam cổ tròn chất liệu cotton cao cấp, thoáng mát, phù hợp mặc hàng ngày.', priceRange: [150000, 350000], colors: ['Trắng', 'Đen', 'Xanh navy', 'Xám'], sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
      { name: 'Áo polo nam', descriptionVi: 'Áo polo nam thiết kế lịch lãm, chất vải pique mềm mại, co giãn nhẹ.', priceRange: [250000, 550000], colors: ['Trắng', 'Đen', 'Xanh đậm', 'Đỏ đô'], sizes: ['M', 'L', 'XL', 'XXL'] },
      { name: 'Áo sơ mi nam dài tay', descriptionVi: 'Áo sơ mi nam dài tay form regular, chất liệu cotton pha, ít nhăn.', priceRange: [300000, 750000], colors: ['Trắng', 'Xanh nhạt', 'Hồng nhạt', 'Xám'], sizes: ['M', 'L', 'XL'] },
      { name: 'Quần jeans nam slim fit', descriptionVi: 'Quần jeans nam dáng slim fit, co giãn tốt, phong cách trẻ trung.', priceRange: [350000, 800000], colors: ['Xanh đậm', 'Xanh nhạt', 'Đen'], sizes: ['29', '30', '31', '32', '33', '34'] },
      { name: 'Quần short nam', descriptionVi: 'Quần short nam vải kaki nhẹ, thoải mái, thích hợp mùa hè.', priceRange: [200000, 450000], colors: ['Be', 'Xanh rêu', 'Đen', 'Xám'], sizes: ['M', 'L', 'XL'] },
      { name: 'Áo khoác gió nam', descriptionVi: 'Áo khoác gió nam 2 lớp chống nước nhẹ, gọn gàng dễ gấp.', priceRange: [350000, 900000], colors: ['Đen', 'Xanh navy', 'Xám đậm'], sizes: ['M', 'L', 'XL', 'XXL'] },
      { name: 'Áo hoodie nam', descriptionVi: 'Áo hoodie nam chất nỉ bông dày dặn, ấm áp, phong cách streetwear.', priceRange: [300000, 650000], colors: ['Đen', 'Xám', 'Trắng kem', 'Xanh rêu'], sizes: ['M', 'L', 'XL'] },
      { name: 'Quần tây nam', descriptionVi: 'Quần tây nam form regular, vải polyester cao cấp, thanh lịch công sở.', priceRange: [400000, 900000], colors: ['Đen', 'Xám đậm', 'Xanh navy'], sizes: ['29', '30', '31', '32', '33', '34'] },
    ],
  },

  'thoi-trang-nu': {
    brands: ['IVY moda', 'Elise', 'Vera', 'NEM Fashion', 'Thời trang Hạnh', 'GUMAC', 'LYN', 'Juno'],
    templates: [
      { name: 'Váy đầm xòe', descriptionVi: 'Váy đầm xòe nữ thiết kế thanh lịch, phù hợp đi tiệc và dạo phố.', priceRange: [350000, 1200000], colors: ['Đỏ', 'Đen', 'Trắng', 'Hồng pastel'], sizes: ['S', 'M', 'L', 'XL'] },
      { name: 'Áo kiểu nữ', descriptionVi: 'Áo kiểu nữ tay phồng, chất liệu voan mềm mại, nữ tính.', priceRange: [200000, 500000], colors: ['Trắng', 'Hồng', 'Xanh mint', 'Be'], sizes: ['S', 'M', 'L'] },
      { name: 'Quần culottes nữ', descriptionVi: 'Quần culottes ống rộng, chất liệu linen mát mẻ, thoải mái.', priceRange: [280000, 600000], colors: ['Đen', 'Be', 'Nâu nhạt', 'Trắng'], sizes: ['S', 'M', 'L', 'XL'] },
      { name: 'Chân váy bút chì', descriptionVi: 'Chân váy bút chì dáng ôm, thanh lịch cho phong cách công sở.', priceRange: [250000, 550000], colors: ['Đen', 'Xám', 'Hồng đất'], sizes: ['S', 'M', 'L'] },
      { name: 'Áo blazer nữ', descriptionVi: 'Áo blazer nữ form chuẩn, vải tweed cao cấp, sang trọng.', priceRange: [500000, 1500000], colors: ['Đen', 'Trắng kem', 'Be', 'Xanh navy'], sizes: ['S', 'M', 'L', 'XL'] },
      { name: 'Đầm maxi', descriptionVi: 'Đầm maxi dáng suông hoa nhí, bay bổng, thích hợp đi biển.', priceRange: [350000, 900000], colors: ['Hoa xanh', 'Hoa đỏ', 'Trắng', 'Vàng nhạt'], sizes: ['S', 'M', 'L'] },
      { name: 'Set bộ nữ', descriptionVi: 'Set bộ quần áo nữ đồng bộ, tiện lợi phối đồ nhanh chóng.', priceRange: [400000, 900000], colors: ['Đen', 'Nâu', 'Xanh olive'], sizes: ['S', 'M', 'L', 'XL'] },
    ],
  },

  'giay-dep': {
    brands: ['Nike', 'Adidas', 'Puma', 'New Balance', 'Converse', 'Vans', 'Biti\'s', 'Ananas'],
    templates: [
      { name: 'Giày sneaker', descriptionVi: 'Giày sneaker phong cách thể thao năng động, đế êm, phù hợp mọi hoạt động.', priceRange: [800000, 3500000], colors: ['Trắng', 'Đen', 'Xám', 'Xanh navy'], sizes: ['38', '39', '40', '41', '42', '43', '44'] },
      { name: 'Giày chạy bộ', descriptionVi: 'Giày chạy bộ đế cao su chống trượt, đệm khí êm ái, hỗ trợ chạy dài.', priceRange: [1200000, 4500000], colors: ['Đen/Trắng', 'Xanh dương', 'Đỏ/Đen'], sizes: ['39', '40', '41', '42', '43'] },
      { name: 'Dép quai ngang', descriptionVi: 'Dép quai ngang unisex thiết kế tối giản, thoải mái cho ngày hè.', priceRange: [200000, 800000], colors: ['Đen', 'Trắng', 'Be'], sizes: ['38', '39', '40', '41', '42', '43'] },
      { name: 'Giày boot cao cổ', descriptionVi: 'Giày boot cao cổ da PU, phong cách mạnh mẽ, cá tính.', priceRange: [600000, 2000000], colors: ['Đen', 'Nâu', 'Xám'], sizes: ['39', '40', '41', '42', '43'] },
      { name: 'Giày lười nam', descriptionVi: 'Giày lười nam da bò thật, mềm mại, sang trọng phong cách công sở.', priceRange: [500000, 1800000], colors: ['Đen', 'Nâu đậm', 'Nâu bò'], sizes: ['39', '40', '41', '42', '43'] },
      { name: 'Giày cao gót nữ', descriptionVi: 'Giày cao gót nữ 7cm mũi nhọn thanh lịch, phù hợp đi làm và dự tiệc.', priceRange: [350000, 1200000], colors: ['Đen', 'Kem', 'Đỏ', 'Nude'], sizes: ['35', '36', '37', '38', '39'] },
    ],
  },

  'balo-tui-xach': {
    brands: ['Samsonite', 'Herschel', 'Fjällräven', 'Pedro', 'Charles & Keith', 'Vascara', 'Local Brand', 'Laza'],
    templates: [
      { name: 'Balo laptop', descriptionVi: 'Balo laptop 15.6 inch chống sốc, nhiều ngăn, chống nước nhẹ.', priceRange: [350000, 1500000], colors: ['Đen', 'Xám', 'Xanh navy'], sizes: ['15 inch', '15.6 inch'] },
      { name: 'Túi xách nữ', descriptionVi: 'Túi xách nữ da PU cao cấp, thiết kế thời trang, sang trọng.', priceRange: [300000, 2500000], colors: ['Đen', 'Nâu', 'Be', 'Đỏ đô'], sizes: ['Nhỏ', 'Vừa', 'Lớn'] },
      { name: 'Balo du lịch', descriptionVi: 'Balo du lịch dung tích lớn 40L, chống nước, tiện lợi mang vác.', priceRange: [400000, 1800000], colors: ['Đen', 'Xanh rêu', 'Cam'], sizes: ['30L', '40L'] },
      { name: 'Túi đeo chéo', descriptionVi: 'Túi đeo chéo nhỏ gọn, thích hợp đi chơi và dạo phố.', priceRange: [200000, 900000], colors: ['Đen', 'Nâu', 'Xanh', 'Hồng'], sizes: ['Free size'] },
      { name: 'Ví cầm tay', descriptionVi: 'Ví cầm tay da thật, nhiều ngăn đựng thẻ, thiết kế tinh tế.', priceRange: [250000, 1200000], colors: ['Đen', 'Nâu', 'Xanh navy'], sizes: ['Free size'] },
    ],
  },

  'dien-thoai-phu-kien': {
    brands: ['Samsung', 'Apple', 'Xiaomi', 'OPPO', 'Vivo', 'Realme', 'Anker', 'Baseus'],
    templates: [
      { name: 'Điện thoại thông minh', descriptionVi: 'Điện thoại thông minh màn hình AMOLED, camera AI, pin 5000mAh.', priceRange: [3000000, 30000000], colors: ['Đen', 'Trắng', 'Xanh dương', 'Tím'], sizes: ['128GB', '256GB'] },
      { name: 'Ốp lưng điện thoại', descriptionVi: 'Ốp lưng silicon dẻo chống sốc, bảo vệ toàn diện.', priceRange: [50000, 300000], colors: ['Trong suốt', 'Đen', 'Xanh', 'Hồng'], sizes: ['iPhone 15', 'Samsung S24', 'Xiaomi 14'] },
      { name: 'Sạc nhanh USB-C', descriptionVi: 'Bộ sạc nhanh 65W USB-C PD, tương thích đa thiết bị.', priceRange: [200000, 800000], colors: ['Trắng', 'Đen'], sizes: ['20W', '45W', '65W'] },
      { name: 'Cáp sạc Type-C', descriptionVi: 'Cáp sạc Type-C bọc nylon chống đứt, dài 1.5m.', priceRange: [80000, 350000], colors: ['Trắng', 'Đen', 'Đỏ'], sizes: ['1m', '1.5m', '2m'] },
      { name: 'Kính cường lực', descriptionVi: 'Kính cường lực 9H full màn hình, chống vân tay.', priceRange: [30000, 200000], colors: ['Trong suốt'], sizes: ['iPhone 15', 'Samsung S24', 'Xiaomi 14'] },
      { name: 'Pin dự phòng', descriptionVi: 'Pin dự phòng 20000mAh sạc nhanh PD, nhỏ gọn tiện lợi.', priceRange: [300000, 1200000], colors: ['Trắng', 'Đen', 'Xanh'], sizes: ['10000mAh', '20000mAh'] },
    ],
  },

  'may-tinh-laptop': {
    brands: ['Lenovo', 'Dell', 'HP', 'ASUS', 'Acer', 'MSI', 'Apple', 'LG'],
    templates: [
      { name: 'Laptop văn phòng', descriptionVi: 'Laptop văn phòng mỏng nhẹ, màn hình IPS Full HD, pin 10 tiếng.', priceRange: [10000000, 25000000], colors: ['Bạc', 'Xám', 'Xanh'], sizes: ['14 inch', '15.6 inch'] },
      { name: 'Laptop gaming', descriptionVi: 'Laptop gaming cấu hình cao, GPU rời, màn 144Hz, tản nhiệt mạnh.', priceRange: [18000000, 45000000], colors: ['Đen', 'Xám', 'Đen đỏ'], sizes: ['15.6 inch', '17.3 inch'] },
      { name: 'Chuột không dây', descriptionVi: 'Chuột không dây ergonomic, kết nối Bluetooth/USB, pin dùng 12 tháng.', priceRange: [150000, 1500000], colors: ['Đen', 'Trắng', 'Xám'], sizes: ['Free size'] },
      { name: 'Bàn phím cơ', descriptionVi: 'Bàn phím cơ switch Cherry MX, RGB, hot-swap, layout 75%.', priceRange: [800000, 3500000], colors: ['Đen', 'Trắng', 'Xanh dương'], sizes: ['75%', 'TKL', 'Full size'] },
      { name: 'Màn hình máy tính', descriptionVi: 'Màn hình IPS 27 inch 2K, 75Hz, góc nhìn rộng 178°.', priceRange: [4000000, 12000000], colors: ['Đen', 'Trắng'], sizes: ['24 inch', '27 inch', '32 inch'] },
      { name: 'Webcam Full HD', descriptionVi: 'Webcam 1080p tự động lấy nét, micro kép khử ồn, cắm là chạy.', priceRange: [400000, 2000000], colors: ['Đen'], sizes: ['720p', '1080p'] },
    ],
  },

  'thiet-bi-dien-tu': {
    brands: ['Sony', 'JBL', 'Logitech', 'Marshall', 'Edifier', 'SoundPeats', 'Xiaomi', 'Harman Kardon'],
    templates: [
      { name: 'Tai nghe Bluetooth', descriptionVi: 'Tai nghe Bluetooth true wireless chống ồn chủ động, pin 30 giờ.', priceRange: [500000, 5000000], colors: ['Đen', 'Trắng', 'Xanh'], sizes: ['Free size'] },
      { name: 'Loa Bluetooth di động', descriptionVi: 'Loa Bluetooth di động chống nước IPX7, âm bass mạnh mẽ.', priceRange: [500000, 4000000], colors: ['Đen', 'Đỏ', 'Xanh dương', 'Cam'], sizes: ['Mini', 'Vừa'] },
      { name: 'Đồng hồ thông minh', descriptionVi: 'Đồng hồ thông minh đo SpO2, nhịp tim, GPS tích hợp, chống nước 5ATM.', priceRange: [1500000, 10000000], colors: ['Đen', 'Bạc', 'Vàng hồng'], sizes: ['42mm', '46mm'] },
      { name: 'Tai nghe chụp tai', descriptionVi: 'Tai nghe chụp tai over-ear, chống ồn ANC, đệm tai êm ái.', priceRange: [800000, 8000000], colors: ['Đen', 'Trắng', 'Bạc'], sizes: ['Free size'] },
      { name: 'Máy đọc sách điện tử', descriptionVi: 'Máy đọc sách E-Ink 6 inch, chống chói, pin 4 tuần.', priceRange: [2000000, 5000000], colors: ['Đen', 'Xanh denim'], sizes: ['6 inch', '7 inch'] },
      { name: 'Ổ cắm thông minh WiFi', descriptionVi: 'Ổ cắm thông minh WiFi điều khiển từ xa qua app, hẹn giờ tự động.', priceRange: [200000, 600000], colors: ['Trắng'], sizes: ['1 cổng', '3 cổng'] },
    ],
  },

  'do-gia-dung': {
    brands: ['Lock&Lock', 'Sunhouse', 'Panasonic', 'Sharp', 'Philips', 'Electrolux', 'Kangaroo', 'Toshiba'],
    templates: [
      { name: 'Nồi chiên không dầu', descriptionVi: 'Nồi chiên không dầu dung tích 5.5L, 8 chế độ nấu, điều khiển cảm ứng.', priceRange: [1200000, 3500000], colors: ['Đen', 'Trắng'], sizes: ['3.5L', '5.5L', '7L'] },
      { name: 'Máy xay sinh tố', descriptionVi: 'Máy xay sinh tố công suất 1000W, cối thủy tinh, 3 tốc độ xay.', priceRange: [500000, 2000000], colors: ['Đen', 'Đỏ', 'Trắng'], sizes: ['1L', '1.5L'] },
      { name: 'Bình giữ nhiệt', descriptionVi: 'Bình giữ nhiệt inox 304, giữ nóng 12h, giữ lạnh 24h.', priceRange: [150000, 600000], colors: ['Bạc', 'Đen', 'Xanh', 'Hồng'], sizes: ['350ml', '500ml', '750ml'] },
      { name: 'Máy hút bụi cầm tay', descriptionVi: 'Máy hút bụi cầm tay không dây, lực hút 25000Pa, pin 45 phút.', priceRange: [1500000, 5000000], colors: ['Trắng', 'Xám'], sizes: ['Free size'] },
      { name: 'Bộ nồi inox', descriptionVi: 'Bộ nồi inox 5 đáy 3 chiếc, dùng được bếp từ, chống dính.', priceRange: [800000, 3000000], colors: ['Bạc'], sizes: ['Bộ 3', 'Bộ 5'] },
      { name: 'Quạt điều hòa', descriptionVi: 'Quạt điều hòa hơi nước 10L, remote điều khiển, tiết kiệm điện.', priceRange: [1500000, 4000000], colors: ['Trắng', 'Xám'], sizes: ['8L', '10L', '15L'] },
    ],
  },

  'nha-cua-doi-song': {
    brands: ['IKEA Style', 'Homeway', 'Index Living', 'Nội thất Hòa Phát', 'Đại Thành', 'Cozy Home', 'Liva', 'Urban Living'],
    templates: [
      { name: 'Bộ chăn ga gối', descriptionVi: 'Bộ chăn ga gối cotton 100%, mềm mại, thoáng khí, hoa văn hiện đại.', priceRange: [500000, 2000000], colors: ['Trắng', 'Xám', 'Xanh nhạt', 'Hồng'], sizes: ['1m6', '1m8', '2m'] },
      { name: 'Kệ sách gỗ', descriptionVi: 'Kệ sách gỗ công nghiệp MDF phủ melamine, 5 tầng, chịu lực tốt.', priceRange: [400000, 1500000], colors: ['Vân gỗ sáng', 'Vân gỗ tối', 'Trắng'], sizes: ['60cm', '80cm', '120cm'] },
      { name: 'Thảm trải sàn', descriptionVi: 'Thảm trải sàn sợi len mềm, chống trượt, dễ vệ sinh.', priceRange: [300000, 1200000], colors: ['Xám', 'Be', 'Nâu', 'Ghi sáng'], sizes: ['60x90cm', '120x170cm', '160x230cm'] },
      { name: 'Gối tựa lưng', descriptionVi: 'Gối tựa lưng memory foam chống đau lưng, phù hợp ghế văn phòng.', priceRange: [200000, 800000], colors: ['Xám', 'Đen', 'Xanh navy'], sizes: ['Free size'] },
      { name: 'Đèn bàn LED', descriptionVi: 'Đèn bàn LED chống cận 3 chế độ ánh sáng, điều chỉnh độ sáng.', priceRange: [250000, 900000], colors: ['Trắng', 'Đen'], sizes: ['Free size'] },
    ],
  },

  'sac-dep': {
    brands: ['L\'Oreal', 'Maybelline', 'Innisfree', 'The Face Shop', 'Bioderma', 'La Roche-Posay', 'Some By Mi', 'Cocoon'],
    templates: [
      { name: 'Kem chống nắng', descriptionVi: 'Kem chống nắng SPF50+ PA++++ nhẹ mặt, không bết dính, kiềm dầu.', priceRange: [150000, 600000], colors: ['Tone sáng', 'Tone tự nhiên'], sizes: ['30ml', '50ml'] },
      { name: 'Sữa rửa mặt', descriptionVi: 'Sữa rửa mặt dịu nhẹ chiết xuất thiên nhiên, không chứa sulfate.', priceRange: [100000, 400000], colors: ['Xanh', 'Trắng'], sizes: ['100ml', '200ml'] },
      { name: 'Serum dưỡng da', descriptionVi: 'Serum vitamin C làm sáng da, mờ thâm, chống oxy hóa mạnh mẽ.', priceRange: [200000, 800000], colors: ['Trong suốt'], sizes: ['20ml', '30ml'] },
      { name: 'Son môi lì', descriptionVi: 'Son môi lì mịn mượt, lên màu chuẩn, bám màu lâu đến 12h.', priceRange: [100000, 500000], colors: ['Đỏ', 'Hồng đất', 'Cam đất', 'Nude', 'Berry'], sizes: ['3.5g'] },
      { name: 'Nước tẩy trang', descriptionVi: 'Nước tẩy trang micellar dịu nhẹ, làm sạch sâu, không cần rửa lại.', priceRange: [120000, 400000], colors: ['Hồng', 'Xanh'], sizes: ['250ml', '400ml'] },
      { name: 'Mặt nạ dưỡng da', descriptionVi: 'Mặt nạ giấy cấp ẩm chuyên sâu, tinh chất hyaluronic acid.', priceRange: [15000, 80000], colors: ['Xanh', 'Trắng', 'Vàng'], sizes: ['Gói 1 miếng', 'Hộp 10 miếng'] },
    ],
  },

  'cham-soc-suc-khoe': {
    brands: ['Omron', 'Listerine', 'Oral-B', 'Colgate', 'DHC', 'Blackmores', 'Nature\'s Way', 'Kirkland'],
    templates: [
      { name: 'Máy đo huyết áp', descriptionVi: 'Máy đo huyết áp điện tử bắp tay tự động, màn hình LCD, nhớ 60 kết quả.', priceRange: [500000, 2000000], colors: ['Trắng'], sizes: ['Free size'] },
      { name: 'Bàn chải điện', descriptionVi: 'Bàn chải điện sóng âm 5 chế độ, chống nước IPX7, sạc USB-C.', priceRange: [300000, 1500000], colors: ['Trắng', 'Đen', 'Hồng'], sizes: ['Free size'] },
      { name: 'Viên uống vitamin tổng hợp', descriptionVi: 'Viên uống vitamin tổng hợp bổ sung dưỡng chất thiết yếu hàng ngày.', priceRange: [200000, 800000], colors: ['Vàng', 'Xanh'], sizes: ['60 viên', '120 viên'] },
      { name: 'Máy massage cầm tay', descriptionVi: 'Máy massage cầm tay 6 đầu, 30 tốc độ, giảm đau cơ hiệu quả.', priceRange: [500000, 2500000], colors: ['Xám', 'Đen', 'Trắng'], sizes: ['Free size'] },
      { name: 'Nhiệt kế điện tử', descriptionVi: 'Nhiệt kế hồng ngoại đo trán không tiếp xúc, kết quả 1 giây.', priceRange: [300000, 1000000], colors: ['Trắng'], sizes: ['Free size'] },
    ],
  },

  'the-thao-du-lich': {
    brands: ['Decathlon', 'Nike', 'Adidas', 'Under Armour', 'The North Face', 'Columbia', 'Naturehike', 'Gym Shark'],
    templates: [
      { name: 'Quần áo tập gym', descriptionVi: 'Bộ quần áo tập gym nam nữ, chất liệu thể thao co giãn 4 chiều.', priceRange: [200000, 800000], colors: ['Đen', 'Xám', 'Xanh navy', 'Đỏ'], sizes: ['S', 'M', 'L', 'XL'] },
      { name: 'Thảm tập yoga', descriptionVi: 'Thảm yoga TPE 6mm chống trượt, kháng khuẩn, kèm túi đựng.', priceRange: [200000, 800000], colors: ['Tím', 'Xanh mint', 'Hồng', 'Xám'], sizes: ['6mm', '8mm'] },
      { name: 'Bình nước thể thao', descriptionVi: 'Bình nước thể thao 750ml nhựa Tritan BPA-free, nắp bật tiện lợi.', priceRange: [100000, 350000], colors: ['Đen', 'Xanh', 'Hồng', 'Tím'], sizes: ['500ml', '750ml', '1L'] },
      { name: 'Dây nhảy thể thao', descriptionVi: 'Dây nhảy thể thao có đếm số, tay cầm chống trượt, điều chỉnh dài.', priceRange: [80000, 300000], colors: ['Đen', 'Đỏ', 'Xanh'], sizes: ['Free size'] },
      { name: 'Vali kéo du lịch', descriptionVi: 'Vali kéo du lịch nhựa PC cứng, 4 bánh xoay 360°, khóa TSA.', priceRange: [800000, 3000000], colors: ['Đen', 'Bạc', 'Xanh navy', 'Hồng'], sizes: ['20 inch', '24 inch', '28 inch'] },
      { name: 'Lều cắm trại', descriptionVi: 'Lều cắm trại 3-4 người chống nước 3000mm, lắp đặt nhanh 5 phút.', priceRange: [800000, 3000000], colors: ['Xanh lá', 'Cam', 'Xám'], sizes: ['2 người', '3-4 người'] },
    ],
  },

  'sach-van-phong-pham': {
    brands: ['Fahasa', 'Alpha Books', 'Nhã Nam', 'Kim Đồng', 'Thiên Long', 'Deli', 'Staedtler', 'Faber-Castell'],
    templates: [
      { name: 'Sách kỹ năng sống', descriptionVi: 'Sách kỹ năng sống bestseller giúp phát triển bản thân và tư duy tích cực.', priceRange: [80000, 250000], colors: ['Bìa cứng', 'Bìa mềm'], sizes: ['Free size'] },
      { name: 'Sách lập trình', descriptionVi: 'Sách lập trình từ cơ bản đến nâng cao, có bài tập thực hành.', priceRange: [120000, 400000], colors: ['Bìa cứng', 'Bìa mềm'], sizes: ['Free size'] },
      { name: 'Bút bi cao cấp', descriptionVi: 'Bút bi cao cấp thân kim loại, mực êm trượt, phù hợp làm quà tặng.', priceRange: [50000, 500000], colors: ['Đen', 'Bạc', 'Vàng gold'], sizes: ['0.5mm', '0.7mm'] },
      { name: 'Sổ tay bìa da', descriptionVi: 'Sổ tay bìa da PU 200 trang, giấy ngà chống lóa, đường kẻ ô vuông.', priceRange: [80000, 350000], colors: ['Đen', 'Nâu', 'Xanh navy', 'Đỏ đô'], sizes: ['A5', 'A4'] },
      { name: 'Bộ bút chì màu', descriptionVi: 'Bộ bút chì màu 48 cây, màu tươi sáng, thân gỗ thân thiện môi trường.', priceRange: [100000, 500000], colors: ['Hộp thiếc', 'Hộp giấy'], sizes: ['24 cây', '36 cây', '48 cây'] },
      { name: 'Máy tính casio', descriptionVi: 'Máy tính khoa học Casio FX-580VN, phù hợp học sinh THPT và đại học.', priceRange: [400000, 800000], colors: ['Đen', 'Trắng'], sizes: ['Free size'] },
    ],
  },

  'me-va-be': {
    brands: ['Bobby', 'Huggies', 'Pigeon', 'Fisher-Price', 'Pampers', 'Similac', 'Enfa', 'Mamypoko'],
    templates: [
      { name: 'Tã dán em bé', descriptionVi: 'Tã dán em bé siêu thấm hút, mềm mại, chống hăm, dùng ban đêm.', priceRange: [150000, 400000], colors: ['Trắng xanh', 'Trắng hồng'], sizes: ['Newborn', 'S', 'M', 'L', 'XL'] },
      { name: 'Bình sữa chống sặc', descriptionVi: 'Bình sữa chống sặc cổ rộng, nhựa PPSU an toàn, van thông khí.', priceRange: [100000, 400000], colors: ['Trong suốt', 'Hồng', 'Xanh'], sizes: ['150ml', '240ml', '330ml'] },
      { name: 'Đồ chơi xếp hình', descriptionVi: 'Bộ đồ chơi xếp hình lắp ráp 100 mảnh, phát triển tư duy sáng tạo.', priceRange: [150000, 600000], colors: ['Nhiều màu'], sizes: ['50 mảnh', '100 mảnh', '200 mảnh'] },
      { name: 'Xe đẩy em bé', descriptionVi: 'Xe đẩy em bé gấp gọn một tay, phanh an toàn, có mái che UV.', priceRange: [1500000, 5000000], colors: ['Xám', 'Đen', 'Xanh navy', 'Hồng'], sizes: ['0-36 tháng'] },
      { name: 'Sữa bột trẻ em', descriptionVi: 'Sữa bột dinh dưỡng cho trẻ từ 1-3 tuổi, bổ sung DHA và canxi.', priceRange: [300000, 800000], colors: ['Hộp vàng', 'Hộp xanh'], sizes: ['400g', '800g', '1.7kg'] },
    ],
  },

  'phu-kien-thoi-trang': {
    brands: ['Daniel Wellington', 'Casio', 'Ray-Ban', 'Fossil', 'Calvin Klein', 'Tommy Hilfiger', 'Local Brand', 'Titan'],
    templates: [
      { name: 'Đồng hồ đeo tay', descriptionVi: 'Đồng hồ đeo tay classic mặt tròn, dây da thật, chống nước 3ATM.', priceRange: [500000, 5000000], colors: ['Đen', 'Nâu', 'Bạc'], sizes: ['38mm', '40mm', '42mm'] },
      { name: 'Kính mát thời trang', descriptionVi: 'Kính mát thời trang gọng kim loại, tròng polarized chống UV400.', priceRange: [200000, 2000000], colors: ['Đen', 'Vàng gold', 'Bạc', 'Nâu rùa'], sizes: ['Free size'] },
      { name: 'Thắt lưng da', descriptionVi: 'Thắt lưng da bò thật, khóa kim loại bền đẹp, phong cách lịch lãm.', priceRange: [200000, 1200000], colors: ['Đen', 'Nâu'], sizes: ['105cm', '110cm', '115cm', '120cm'] },
      { name: 'Nón bucket', descriptionVi: 'Nón bucket vải canvas, chống nắng tốt, phong cách đường phố.', priceRange: [100000, 400000], colors: ['Đen', 'Be', 'Trắng', 'Xanh rêu'], sizes: ['M', 'L'] },
      { name: 'Tất/Vớ cao cấp', descriptionVi: 'Set 5 đôi tất cotton thoáng khí, co giãn tốt, phù hợp đi giày.', priceRange: [80000, 250000], colors: ['Đen', 'Trắng', 'Xám', 'Mix màu'], sizes: ['Free size'] },
      { name: 'Khăn quàng cổ', descriptionVi: 'Khăn quàng cổ len cashmere mềm mại, giữ ấm mùa đông.', priceRange: [150000, 800000], colors: ['Đen', 'Xám', 'Be', 'Đỏ đô', 'Xanh navy'], sizes: ['Free size'] },
    ],
  },
};
