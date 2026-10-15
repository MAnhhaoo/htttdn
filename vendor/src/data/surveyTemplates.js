/**
 * Real Survey Templates for Vendor Portal (Shop Surveys).
 * Synchronized with backend and dataset generator.
 */

export const VENDOR_TOPICS = [
  'Chất lượng sản phẩm',
  'Sản phẩm có đúng mô tả không',
  'Giá cả sản phẩm',
  'Chất lượng đóng gói',
  'Màu sắc, kích thước',
  'Mức độ hài lòng',
  'Trải nghiệm mua hàng tại shop',
  'Khả năng mua lại',
  'Nhu cầu sản phẩm mới',
  'Khác (Tự nhập chủ đề)'
];

export const SHOP_TEMPLATES = [
  {
    topic: 'Chất lượng sản phẩm',
    title: 'Đánh giá chất lượng sản phẩm & độ hài lòng của khách hàng',
    description: 'Shop trân trọng cảm ơn bạn đã tin tưởng mua sắm! Vui lòng dành 1 phút đánh giá sản phẩm để Shop hoàn thiện hơn nhé.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    scope: 'vendor',
    audienceType: 'vendor_completed_buyers',
    triggerType: 'after_order_completed',
    questions: [
      {
        id: '1',
        question: 'Bạn đánh giá chất lượng sản phẩm nhận được bao nhiêu sao?',
        type: 'rating',
        required: true,
        options: []
      },
      {
        id: '2',
        question: 'Sản phẩm thực tế có giống như hình ảnh và thông số Shop mô tả trên gian hàng không?',
        type: 'single_choice',
        required: true,
        options: [
          'Hoàn toàn chính xác, đúng 100% như mô tả',
          'Cơ bản giống, chỉ khác biệt nhỏ về ánh sáng chụp',
          'Hơi khác so với hình dung',
          'Không giống với thông tin quảng cáo'
        ]
      },
      {
        id: '3',
        question: 'Điểm bạn ưng ý nhất ở sản phẩm của Shop là gì?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Chất liệu dày dặn, hoàn thiện tỉ mỉ',
          'Màu sắc sắc nét, mẫu mã đẹp mắt',
          'Đóng gói bọc hàng cẩn thận, nguyên vẹn',
          'Giá thành hợp lý so với chất lượng',
          'Có quà tặng kèm và thư cảm ơn chu đáo'
        ]
      },
      {
        id: '4',
        question: 'Khả năng bạn tiếp tục mua sắm tại gian hàng chúng mình trong lần tới?',
        type: 'single_choice',
        required: true,
        options: [
          'Chắc chắn sẽ ủng hộ tiếp',
          'Có thể sẽ mua lại khi có nhu cầu',
          'Cần cân nhắc thêm',
          'Chưa có ý định'
        ]
      },
      {
        id: '5',
        question: 'Chia sẻ thêm cảm nhận hoặc đóng góp ý kiến để Shop phục vụ bạn tốt hơn:',
        type: 'text',
        required: false,
        options: []
      }
    ]
  },
  {
    topic: 'Sản phẩm có đúng mô tả không',
    title: 'Khảo sát tính chuẩn xác của thông tin sản phẩm và hình ảnh gian hàng',
    description: 'Ý kiến của bạn giúp Shop hoàn thiện mô tả, bảng size và hình ảnh sản phẩm chuẩn xác nhất.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    scope: 'vendor',
    audienceType: 'vendor_completed_buyers',
    triggerType: 'after_order_completed',
    questions: [
      {
        id: '1',
        question: 'Mức độ chuẩn xác của mô tả sản phẩm so với thực tế nhận được?',
        type: 'rating',
        required: true,
        options: []
      },
      {
        id: '2',
        question: 'Bảng hướng dẫn kích thước (Size Chart) của Shop có chuẩn với bạn không?',
        type: 'single_choice',
        required: true,
        options: [
          'Vừa vặn hoàn hảo, size rất chuẩn',
          'Hơi chật một chút',
          'Hơi rộng một chút',
          'Sai lệch nhiều so với bảng kích thước'
        ]
      },
      {
        id: '3',
        question: 'Yếu tố nào Shop cần bổ sung thêm trong phần mô tả sản phẩm?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Mô tả đã rất chi tiết và đầy đủ',
          'Cần thêm ảnh chụp thật cận cảnh chất liệu',
          'Thêm video quay sản phẩm thực tế',
          'Ghi rõ hướng dẫn giặt ủi và bảo quản',
          'Ghi chú rõ ràng hơn về nguồn gốc xuất xứ'
        ]
      },
      {
        id: '4',
        question: 'Góp ý thêm về hình ảnh hoặc thông tin sản phẩm của gian hàng:',
        type: 'text',
        required: false,
        options: []
      }
    ]
  },
  {
    topic: 'Giá cả sản phẩm',
    title: 'Khảo sát mức giá và độ tương xứng với chất lượng sản phẩm',
    description: 'Shop mong muốn tham khảo ý kiến để cân đối mức giá và đưa ra các chương trình ưu đãi tốt nhất.',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
    scope: 'vendor',
    audienceType: 'vendor_buyers',
    triggerType: 'manual',
    questions: [
      {
        id: '1',
        question: 'Bạn đánh giá độ tương xứng giữa mức giá và chất lượng sản phẩm nhận được như thế nào?',
        type: 'rating',
        required: true,
        options: []
      },
      {
        id: '2',
        question: 'Theo bạn, mức giá hiện tại của sản phẩm này trên thị trường là:',
        type: 'single_choice',
        required: true,
        options: [
          'Rất hời so với chất lượng cao cấp',
          'Mức giá hợp lý, xứng đáng với số tiền bỏ ra',
          'Hơi cao một chút so với mặt bằng chung',
          'Giá khá đắt'
        ]
      },
      {
        id: '3',
        question: 'Hình thức khuyến mãi nào Shop nên tổ chức thường xuyên hơn?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Mã giảm giá trực tiếp theo giá trị đơn hàng',
          'Mua kèm deal sốc / Quà tặng hấp dẫn',
          'Miễn phí vận chuyển toàn quốc',
          'Combo tiết kiệm khi mua từ 2 sản phẩm',
          'Ưu đãi tri ân khách hàng cũ'
        ]
      },
      {
        id: '4',
        question: 'Bạn mong muốn mức giá hoặc chương trình ưu đãi thế nào cho đợt mua sắm tiếp theo?',
        type: 'text',
        required: false,
        options: []
      }
    ]
  },
  {
    topic: 'Chất lượng đóng gói',
    title: 'Khảo sát quy cách đóng gói và bảo vệ kiện hàng khi vận chuyển',
    description: 'Đóng gói an toàn là ưu tiên số 1 của Shop. Hãy chia sẻ tình trạng kiện hàng khi tới tay bạn nhé!',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    scope: 'vendor',
    audienceType: 'vendor_completed_buyers',
    triggerType: 'after_order_completed',
    questions: [
      {
        id: '1',
        question: 'Mức độ hài lòng của bạn về quy cách đóng gói bọc hàng của Shop?',
        type: 'rating',
        required: true,
        options: []
      },
      {
        id: '2',
        question: 'Tình trạng kiện hàng khi bạn nhận từ tay nhân viên giao hàng:',
        type: 'single_choice',
        required: true,
        options: [
          'Hộp carton vuông vắn, dán băng keo kỹ, bọc chống sốc dày',
          'Hộp hơi móp méo bên ngoài nhưng sản phẩm bên trong nguyên vẹn',
          'Bao bì bị rách hoặc ướt nhẹ',
          'Hàng hóa bên trong bị ảnh hưởng do đóng gói sơ sài'
        ]
      },
      {
        id: '3',
        question: 'Chi tiết nào trong gói hàng làm bạn ấn tượng nhất?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Có dán tem niêm phong và tem cảnh báo hàng dễ vỡ',
          'Bọc xốp khí chống va đập nhiều lớp',
          'Có túi zip/túi chống bụi đựng sản phẩm bên trong',
          'Thư cảm ơn viết tay & voucher giảm giá cho lần sau',
          'Đóng gói tối giản, thân thiện với môi trường'
        ]
      },
      {
        id: '4',
        question: 'Góp ý giúp Shop cải thiện quy trình đóng gói và bao bì sản phẩm:',
        type: 'text',
        required: false,
        options: []
      }
    ]
  },
  {
    topic: 'Màu sắc, kích thước',
    title: 'Khảo sát độ chuẩn xác về màu sắc và kích cỡ sản phẩm',
    description: 'Khảo sát nhằm ghi nhận tỷ lệ sai lệch màu sắc do màn hình và tư vấn kích cỡ phù hợp nhất.',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    scope: 'vendor',
    audienceType: 'vendor_completed_buyers',
    triggerType: 'after_order_completed',
    questions: [
      {
        id: '1',
        question: 'Mức độ hài lòng về màu sắc và kích thước sản phẩm bạn nhận được?',
        type: 'rating',
        required: true,
        options: []
      },
      {
        id: '2',
        question: 'Màu sắc thực tế của sản phẩm so với hình ảnh hiển thị trên màn hình:',
        type: 'single_choice',
        required: true,
        options: [
          'Màu sắc y hệt hình ảnh trên gian hàng',
          'Thực tế đẹp và đậm nét hơn trong ảnh',
          'Hơi lệch một chút do ánh sáng chụp',
          'Khác biệt rõ rệt so với hình ảnh'
        ]
      },
      {
        id: '3',
        question: 'Bạn mong muốn Shop mở rộng thêm các tùy chọn nào?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Thêm các tông màu xu hướng mới (pastel, trung tính...)',
          'Bổ sung thêm size lớn (Plus size: XL, 2XL, 3XL)',
          'Bổ sung thêm size nhỏ (XS, S chuẩn dáng)',
          'Thêm phiên bản theo mùa (hè thoáng mát, thu đông giữ nhiệt)'
        ]
      },
      {
        id: '4',
        question: 'Màu sắc hoặc kích cỡ nào bạn mong muốn Shop ra mắt trong bộ sưu tập tiếp theo?',
        type: 'text',
        required: false,
        options: []
      }
    ]
  },
  {
    topic: 'Mức độ hài lòng',
    title: 'Khảo sát mức độ hài lòng và trải nghiệm mua hàng tại gian hàng',
    description: 'Đóng góp của bạn là động lực to lớn giúp đội ngũ của Shop hoàn thiện dịch vụ mỗi ngày.',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80',
    scope: 'vendor',
    audienceType: 'vendor_buyers',
    triggerType: 'manual',
    questions: [
      {
        id: '1',
        question: 'Tổng quan mức độ hài lòng của bạn đối với toàn bộ trải nghiệm mua sắm tại Shop?',
        type: 'rating',
        required: true,
        options: []
      },
      {
        id: '2',
        question: 'Tốc độ phản hồi tin nhắn chat và tư vấn của nhân viên Shop:',
        type: 'single_choice',
        required: true,
        options: [
          'Phản hồi siêu nhanh trong vài phút, tư vấn rất có tâm',
          'Phản hồi trong ngày, nhiệt tình',
          'Phản hồi hơi chậm',
          'Shop chưa phản hồi tin nhắn của mình'
        ]
      },
      {
        id: '3',
        question: 'Lý do chính khiến bạn lựa chọn mua hàng của Shop chúng mình:',
        type: 'multiple_choice',
        required: false,
        options: [
          'Sản phẩm đẹp, đúng sở thích',
          'Giá cả hợp lý & nhiều ưu đãi',
          'Xem review đánh giá tích cực của khách mua trước',
          'Shop có dịch vụ hỗ trợ đổi trả nhanh chóng',
          'Bạn bè hoặc người quen giới thiệu'
        ]
      },
      {
        id: '4',
        question: 'Lời nhắn nhủ hoặc điều gì Shop có thể làm tốt hơn nữa cho bạn?',
        type: 'text',
        required: false,
        options: []
      }
    ]
  },
  {
    topic: 'Trải nghiệm mua hàng tại shop',
    title: 'Khảo sát hành trình mua sắm từ lúc chọn hàng đến khi nhận sản phẩm',
    description: 'Chia sẻ với Shop cảm nhận của bạn trong suốt quá trình đặt mua đơn hàng này nhé.',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
    scope: 'vendor',
    audienceType: 'vendor_completed_buyers',
    triggerType: 'after_order_completed',
    questions: [
      {
        id: '1',
        question: 'Bạn đánh giá trải nghiệm mua sắm tại gian hàng bao nhiêu điểm?',
        type: 'rating',
        required: true,
        options: []
      },
      {
        id: '2',
        question: 'Thời gian từ lúc bạn đặt đơn đến khi Shop chuẩn bị hàng và bàn giao vận chuyển:',
        type: 'single_choice',
        required: true,
        options: [
          'Siêu nhanh, chuẩn bị hàng trong ngày',
          'Đúng hẹn trong vòng 24 giờ',
          'Hơi lâu hơn một chút so với kỳ vọng',
          'Giao hàng bị chậm do kho thiếu hàng'
        ]
      },
      {
        id: '3',
        question: 'Bạn cảm thấy hài lòng nhất ở khâu nào trong đơn hàng này?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Khâu tư vấn chọn mẫu và size',
          'Khâu đóng gói kiện hàng đẹp mắt',
          'Khâu vận chuyển nhận hàng nhanh chóng',
          'Chất lượng sản phẩm khi bóc hộp'
        ]
      },
      {
        id: '4',
        question: 'Chia sẻ trải nghiệm chân thật nhất của bạn khi mua sắm tại Shop:',
        type: 'text',
        required: false,
        options: []
      }
    ]
  },
  {
    topic: 'Khả năng mua lại',
    title: 'Khảo sát sự gắn bó và ý định tiếp tục ủng hộ gian hàng',
    description: 'Shop luôn trân quý những khách hàng đồng hành. Hãy cho Shop biết mức độ gắn kết của bạn nhé!',
    imageUrl: 'https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?w=800&auto=format&fit=crop&q=80',
    scope: 'vendor',
    audienceType: 'vendor_buyers',
    triggerType: 'manual',
    questions: [
      {
        id: '1',
        question: 'Mức độ tin cậy của bạn dành cho các sản phẩm của gian hàng?',
        type: 'rating',
        required: true,
        options: []
      },
      {
        id: '2',
        question: 'Khả năng bạn quay lại mua sắm các sản phẩm khác của Shop trong tương lai:',
        type: 'single_choice',
        required: true,
        options: [
          'Rất cao, đã lưu Shop vào danh sách yêu thích',
          'Chắc chắn sẽ mua nếu có nhu cầu phát sinh',
          'Đang cân nhắc, tùy thuộc vào giá và mẫu mới',
          'Khó có khả năng mua lại'
        ]
      },
      {
        id: '3',
        question: 'Yếu tố nào sẽ giữ chân bạn tiếp tục mua hàng tại Shop dài lâu?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Chất lượng sản phẩm luôn ổn định qua các lần mua',
          'Nhiều ưu đãi tri ân độc quyền cho khách hàng thân thiết',
          'Liên tục cập nhật mẫu mã mới bắt trend',
          'Hỗ trợ bảo hành và đổi hàng chu đáo'
        ]
      },
      {
        id: '4',
        question: 'Điều gì sẽ khiến bạn sẵn sàng giới thiệu Shop cho người thân và bạn bè?',
        type: 'text',
        required: false,
        options: []
      }
    ]
  },
  {
    topic: 'Nhu cầu sản phẩm mới',
    title: 'Khảo sát nhu cầu dòng sản phẩm mới & xu hướng tiêu dùng',
    description: 'Shop đang lên kế hoạch phát triển bộ sưu tập mới. Ý kiến của bạn sẽ là kim chỉ nam cho sản phẩm tiếp theo!',
    imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&auto=format&fit=crop&q=80',
    scope: 'vendor',
    audienceType: 'vendor_buyers',
    triggerType: 'manual',
    questions: [
      {
        id: '1',
        question: 'Độ phù hợp của các sản phẩm hiện tại của Shop với phong cách / nhu cầu của bạn?',
        type: 'rating',
        required: true,
        options: []
      },
      {
        id: '2',
        question: 'Bạn mong muốn Shop mở rộng thêm dòng sản phẩm nào trong thời gian tới?',
        type: 'multiple_choice',
        required: true,
        options: [
          'Dòng sản phẩm cao cấp (Premium Collection)',
          'Dòng sản phẩm tiết kiệm / combo gia đình',
          'Phụ kiện đi kèm đồng bộ',
          'Dòng sản phẩm phiên bản giới hạn (Limited Edition)',
          'Dòng sản phẩm thân thiện môi trường / tái chế'
        ]
      },
      {
        id: '3',
        question: 'Mức giá bạn sẵn sàng chi trả cho các mẫu sản phẩm mới chất lượng cao:',
        type: 'single_choice',
        required: false,
        options: [
          'Dưới 200.000 VNĐ',
          'Từ 200.000 VNĐ - 500.000 VNĐ',
          'Từ 500.000 VNĐ - 1.000.000 VNĐ',
          'Trên 1.000.000 VNĐ nếu chất lượng xứng đáng'
        ]
      },
      {
        id: '4',
        question: 'Hãy mô tả sản phẩm mà bạn đang tìm kiếm nhưng chưa thấy bán trên Shop:',
        type: 'text',
        required: false,
        options: []
      }
    ]
  }
];

export function getShopPresetByTopic(topic) {
  return SHOP_TEMPLATES.find(t => t.topic === topic);
}
