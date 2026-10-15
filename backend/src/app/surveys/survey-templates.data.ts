/**
 * Real Vietnamese Survey Templates Data for Backend API.
 */

export interface QuestionTemplate {
  question: string;
  type: 'rating' | 'single_choice' | 'multiple_choice' | 'text';
  required: boolean;
  options?: string[];
}

export interface SurveyTemplateItem {
  topic: string;
  title: string;
  description: string;
  imageUrl: string;
  scope: 'platform' | 'vendor';
  audienceType: string;
  triggerType: string;
  questions: QuestionTemplate[];
}

export const CLIENT_TEMPLATES: SurveyTemplateItem[] = [
  {
    topic: 'Trải nghiệm mua sắm trên MIVA',
    title: 'Khảo sát trải nghiệm mua sắm và giao diện sàn MIVA',
    description: 'MIVA trân trọng lắng nghe ý kiến của bạn về giao diện, tính năng và trải nghiệm mua sắm chung để nâng cấp nền tảng ngày một tốt hơn.',
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_users',
    triggerType: 'manual',
    questions: [
      {
        question: 'Mức độ hài lòng chung của bạn khi trải nghiệm mua sắm trên ứng dụng/website MIVA?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Giao diện và công cụ tìm kiếm sản phẩm trên MIVA có dễ dàng thao tác không?',
        type: 'single_choice',
        required: true,
        options: [
          'Rất dễ dùng & trực quan',
          'Khá thuận tiện, tìm kiếm nhanh',
          'Còn đôi chút giật lag hoặc rối mắt',
          'Khó tìm thấy sản phẩm mong muốn'
        ],
      },
      {
        question: 'Yếu tố nào khiến bạn yêu thích nhất khi mua hàng trên sàn MIVA?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Nhiều mã giảm giá và voucher freeship',
          'Đa dạng ngành hàng và sản phẩm chính hãng',
          'Tốc độ xử lý đơn và giao hàng nhanh',
          'Chính sách đổi trả minh bạch',
          'Nhân viên hỗ trợ CSKH nhiệt tình'
        ],
      },
      {
        question: 'Bạn mong muốn MIVA bổ sung hoặc nâng cấp thêm tính năng nào?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Tìm kiếm bằng hình ảnh AI',
          'Tích điểm thành viên VIP & đổi quà',
          'Tính năng xem video / livestream bán hàng',
          'Mua trước trả sau (BNPL) 0% lãi suất',
          'Theo dõi vị trí shipper trên bản đồ thời gian thực'
        ],
      },
      {
        question: 'Đóng góp ý kiến hoặc đề xuất khác của bạn để MIVA cải thiện chất lượng dịch vụ:',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    topic: 'Mức độ hài lòng',
    title: 'Khảo sát mức độ hài lòng khách hàng định kỳ (CSAT & NPS)',
    description: 'Đóng góp của bạn giúp chúng tôi đánh giá chất lượng phục vụ và không ngừng nỗ lực mang lại trải nghiệm tốt nhất.',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_users',
    triggerType: 'manual',
    questions: [
      {
        question: 'Bạn đánh giá mức độ hài lòng tổng quan đối với nền tảng MIVA như thế nào?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Khả năng bạn giới thiệu sàn thương mại điện tử MIVA cho người thân hoặc bạn bè?',
        type: 'single_choice',
        required: true,
        options: [
          'Chắc chắn sẽ giới thiệu (Rất nhiệt tình)',
          'Có thể sẽ giới thiệu khi có dịp',
          'Chưa chắc chắn, cần trải nghiệm thêm',
          'Sẽ không giới thiệu'
        ],
      },
      {
        question: 'Điểm nào trên MIVA làm bạn cảm thấy an tâm nhất khi mua sắm?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Bảo mật thông tin tài khoản & thanh toán',
          'Cam kết 100% hàng chính hãng',
          'Thời gian nhận hàng đúng cam kết',
          'Hỗ trợ khiếu nại và hoàn tiền nhanh chóng'
        ],
      },
      {
        question: 'Điều gì MIVA có thể làm tốt hơn để đạt điểm 10 tuyệt đối trong mắt bạn?',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    topic: 'Quy trình thanh toán',
    title: 'Khảo sát quy trình thanh toán và cổng giao dịch điện tử',
    description: 'Khảo sát nhằm ghi nhận các trải nghiệm, sự thuận tiện và các trở ngại trong các bước thanh toán trên MIVA.',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_users',
    triggerType: 'after_checkout',
    questions: [
      {
        question: 'Mức độ hài lòng của bạn về tốc độ và sự tiện lợi khi thanh toán đơn hàng?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Phương thức thanh toán bạn ưa chuộng và sử dụng nhiều nhất trên MIVA là gì?',
        type: 'single_choice',
        required: true,
        options: [
          'Thanh toán khi nhận hàng (COD)',
          'Ví điện tử VNPAY (QR Code ngân hàng)',
          'Ví điện tử MoMo',
          'Ví ZaloPay',
          'Thẻ tín dụng / Ghi nợ quốc tế (Visa, Mastercard)'
        ],
      },
      {
        question: 'Bạn có từng gặp phải bất kỳ trở ngại nào trong quá trình thanh toán không?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Không gặp vấn đề gì, thanh toán rất mượt mà',
          'Lỗi mạng hoặc tải chậm tại trang thanh toán',
          'Mã OTP xác thực gửi về điện thoại chậm',
          'Khó khăn khi nhập hoặc áp dụng mã giảm giá voucher',
          'Tiền bị trừ nhưng trạng thái đơn hàng cập nhật chậm'
        ],
      },
      {
        question: 'Bạn có mong muốn MIVA tích hợp thêm phương thức thanh toán mới nào không?',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    topic: 'Trải nghiệm giao hàng',
    title: 'Khảo sát chất lượng dịch vụ giao hàng và đơn vị vận chuyển',
    description: 'Ý kiến của bạn là cơ sở để MIVA giám sát và nâng cao tiêu chuẩn phục vụ của các đối tác vận chuyển.',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_users',
    triggerType: 'after_checkout',
    questions: [
      {
        question: 'Đánh giá chung của bạn về tốc độ giao hàng của các đơn hàng gần đây?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Thời gian bạn nhận được hàng thực tế so với thời gian dự kiến hiển thị trên app?',
        type: 'single_choice',
        required: true,
        options: [
          'Giao nhanh hơn dự kiến',
          'Giao đúng ngày dự kiến',
          'Giao trễ 1-2 ngày so với dự kiến',
          'Giao trễ nhiều ngày hoặc bị dời lịch'
        ],
      },
      {
        question: 'Thái độ và sự chuyên nghiệp của tài xế giao hàng (Shipper):',
        type: 'multiple_choice',
        required: false,
        options: [
          'Gọi điện thông báo trước khi đến giao',
          'Thái độ niềm nở, lịch sự',
          'Kiện hàng nguyên vẹn, không móp rách',
          'Hỗ trợ đồng kiểm ngoại quan hàng hóa',
          'Tài xế giao hàng cẩu thả hoặc không liên hệ trước'
        ],
      },
      {
        question: 'Chia sẻ thêm trải nghiệm hoặc khiếu nại của bạn về khâu giao nhận hàng hóa:',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    topic: 'Chăm sóc khách hàng',
    title: 'Khảo sát chất lượng hỗ trợ và chăm sóc khách hàng MIVA Care',
    description: 'MIVA mong muốn tìm hiểu cảm nhận của bạn khi liên hệ bộ phận hỗ trợ khách hàng và giải quyết khiếu nại.',
    imageUrl: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_users',
    triggerType: 'manual',
    questions: [
      {
        question: 'Mức độ hài lòng của bạn về thái độ phục vụ của chuyên viên chăm sóc khách hàng?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Vấn đề của bạn đã được giải quyết triệt để sau khi liên hệ chưa?',
        type: 'single_choice',
        required: true,
        options: [
          'Được giải quyết nhanh chóng ngay lần đầu liên hệ',
          'Được giải quyết sau 1-2 ngày làm việc',
          'Mất nhiều thời gian xử lý qua lại',
          'Vấn đề chưa được xử lý thỏa đáng'
        ],
      },
      {
        question: 'Kênh liên hệ hỗ trợ bạn cảm thấy tiện lợi nhất:',
        type: 'multiple_choice',
        required: false,
        options: [
          'Chat trực tuyến trên website/ứng dụng MIVA',
          'Tổng đài Hotline trực tiếp 1900xxxx',
          'Gửi email khiếu nại & hỗ trợ',
          'Nhắn tin qua fanpage MIVA chính thức'
        ],
      },
      {
        question: 'Đóng góp ý kiến để đội ngũ CSKH MIVA phục vụ bạn chuyên nghiệp và tận tâm hơn:',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    topic: 'Chất lượng dịch vụ',
    title: 'Khảo sát chất lượng dịch vụ & độ tin cậy của sàn MIVA',
    description: 'Thu thập ý kiến về chất lượng sản phẩm bày bán, tính minh bạch và uy tín các gian hàng trên MIVA.',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_users',
    triggerType: 'manual',
    questions: [
      {
        question: 'Đánh giá mức độ tin cậy và chất lượng dịch vụ tổng thể của sàn MIVA?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Bạn đánh giá thế nào về tính trung thực của các gian hàng và sản phẩm bán trên sàn?',
        type: 'single_choice',
        required: true,
        options: [
          'Rất uy tín, sản phẩm đúng như cam kết',
          'Khá tin cậy, đa số sản phẩm đạt chuẩn',
          'Thỉnh thoảng có gian hàng đăng thông tin chưa chuẩn',
          'Nhiều sản phẩm chưa đúng như hình ảnh'
        ],
      },
      {
        question: 'Các chính sách hỗ trợ người mua bạn đánh giá cao nhất:',
        type: 'multiple_choice',
        required: false,
        options: [
          'Chính sách hoàn tiền 100% khi phát hiện hàng giả',
          'Đổi trả miễn phí trong vòng 7 ngày',
          'Chương trình bảo hiểm hàng hóa khi vận chuyển',
          'Chương trình ưu đãi ngày đôi & Flash sale'
        ],
      },
      {
        question: 'Góp ý giúp MIVA nâng cao uy tín và độ tin cậy của cộng đồng mua sắm:',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    topic: 'Đề xuất tính năng mới',
    title: 'Khảo sát nhu cầu tính năng mới và cải tiến công nghệ MIVA',
    description: 'Hãy cùng chúng tôi định hình tương lai của MIVA bằng những ý tưởng và nhu cầu mua sắm thiết thực của bạn.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_users',
    triggerType: 'manual',
    questions: [
      {
        question: 'Mức độ hiện đại và mượt mà của ứng dụng/website MIVA hiện tại?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Những tính năng mới nào bạn mong muốn được trải nghiệm sớm nhất?',
        type: 'multiple_choice',
        required: true,
        options: [
          'Trợ lý mua sắm AI gợi ý quà tặng & kích thước chuẩn xác',
          'Phòng thử đồ ảo (AR / Virtual Try-On) cho quần áo & giày dép',
          'Tính năng gom đơn nhiều shop chung 1 lượt vận chuyển',
          'Ví điện tử MIVA Pay với nhiều ưu đãi hoàn tiền',
          'Diễn đàn cộng đồng review và chia sẻ mẹo mua sắm'
        ],
      },
      {
        question: 'Tần suất bạn muốn nhận thông báo ưu đãi và khảo sát từ MIVA?',
        type: 'single_choice',
        required: false,
        options: [
          'Chỉ khi có sự kiện siêu sale lớn',
          '1-2 lần mỗi tuần',
          'Hàng ngày với deal chớp nhoáng',
          'Chỉ gửi khi có đơn hàng liên quan'
        ],
      },
      {
        question: 'Mô tả chi tiết ý tưởng hoặc tính năng bạn muốn MIVA phát triển:',
        type: 'text',
        required: false,
      },
    ],
  },
];

export const VENDOR_TEMPLATES: SurveyTemplateItem[] = [
  {
    topic: 'Trải nghiệm quản lý cửa hàng',
    title: 'Khảo sát trải nghiệm sử dụng Cổng quản trị đối tác bán hàng (Vendor Portal)',
    description: 'Thu thập ý kiến đóng góp của Quý đối tác về giao diện, sự tiện lợi và hiệu năng của công cụ quản lý bán hàng MIVA.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_vendors',
    triggerType: 'manual',
    questions: [
      {
        question: 'Mức độ hài lòng của Đối tác về sự tiện lợi và tốc độ của Vendor Portal?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Giao diện và thao tác quản lý gian hàng hàng ngày như thế nào?',
        type: 'single_choice',
        required: true,
        options: [
          'Rất trực quan, dễ thao tác cho nhân viên',
          'Đầy đủ chức năng, ổn định',
          'Giao diện còn nhiều tab rườm rà',
          'Khó sử dụng, thiếu hướng dẫn cụ thể'
        ],
      },
      {
        question: 'Tính năng quản trị nào Quý Shop sử dụng nhiều nhất?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Đăng bán & chỉnh sửa sản phẩm',
          'Xử lý & in phiếu đơn hàng',
          'Theo dõi tồn kho & biến thể',
          'Xem báo cáo doanh số & đối soát tài chính',
          'Cài đặt chương trình khuyến mãi & mã giảm giá'
        ],
      },
      {
        question: 'Góp ý của Shop để hoàn thiện cổng quản trị đối tác bán hàng:',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    topic: 'Quản lý sản phẩm',
    title: 'Khảo sát công cụ đăng tải và quản lý sản phẩm / tồn kho',
    description: 'Đánh giá sự thuận tiện trong việc đăng bán sản phẩm, phân loại kích cỡ/màu sắc và đồng bộ kho hàng.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_vendors',
    triggerType: 'manual',
    questions: [
      {
        question: 'Đánh giá tốc độ và độ tiện lợi của công cụ đăng bán sản phẩm?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Quy trình kiểm duyệt sản phẩm mới đăng của sàn diễn ra như thế nào?',
        type: 'single_choice',
        required: true,
        options: [
          'Duyệt tự động cực nhanh trong vài giờ',
          'Duyệt trong ngày, đúng cam kết',
          'Thỉnh thoảng bị từ chối mà chưa rõ lý do',
          'Thời gian duyệt sản phẩm quá lâu'
        ],
      },
      {
        question: 'Khó khăn lớn nhất Shop gặp phải khi quản lý danh mục sản phẩm:',
        type: 'multiple_choice',
        required: false,
        options: [
          'Không gặp khó khăn',
          'Đăng tải nhiều hình ảnh cùng lúc bị chậm',
          'Cài đặt thuộc tính màu sắc/size phức tạp',
          'Chưa hỗ trợ nhập xuất file Excel danh mục hàng loạt',
          'Quản lý tồn kho đa chi nhánh còn hạn chế'
        ],
      },
      {
        question: 'Đề xuất tính năng bổ sung cho mô-đun quản lý sản phẩm:',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    topic: 'Quản lý đơn hàng',
    title: 'Khảo sát quy trình tiếp nhận, xử lý và in đơn hàng',
    description: 'MIVA lắng nghe khó khăn trong các bước từ lúc nhận đơn mới đến khi đóng gói sẵn sàng giao.',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_vendors',
    triggerType: 'manual',
    questions: [
      {
        question: 'Mức độ mượt mà khi xử lý đơn hàng phát sinh trên hệ thống?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Tốc độ thông báo đơn hàng mới đến Shop qua app/email/hệ thống?',
        type: 'single_choice',
        required: true,
        options: [
          'Thông báo tức thì, chuông báo rõ ràng',
          'Thông báo nhanh trong 1-2 phút',
          'Thỉnh thoảng trễ thông báo nếu không F5',
          'Hay bị bỏ sót đơn nếu không canh máy'
        ],
      },
      {
        question: 'Các tiện ích in ấn và đóng gói Shop cần cải tiến:',
        type: 'multiple_choice',
        required: false,
        options: [
          'In phiếu gửi hàng khổ A6/A7 nhiệt tự động',
          'Gộp nhiều đơn hàng để in tem hàng loạt',
          'Cảnh báo tự động khi sản phẩm trong đơn sắp hết hàng',
          'Phân chia quyền cho nhân viên kho xử lý đơn'
        ],
      },
      {
        question: 'Ý kiến đóng góp của Shop về luồng xử lý đơn hàng:',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    topic: 'Quy trình đóng gói và bàn giao',
    title: 'Khảo sát quy trình bàn giao hàng hóa cho bưu tá / đơn vị vận chuyển',
    description: 'Ghi nhận phản hồi về lịch lấy hàng, thái độ bưu tá và biên bản bàn giao tại kho Shop.',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_vendors',
    triggerType: 'manual',
    questions: [
      {
        question: 'Đánh giá độ đúng hẹn và chuyên nghiệp của bưu tá đến kho lấy hàng?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Thời gian bưu tá đến lấy hàng sau khi Shop bấm "Sẵn sàng giao"?',
        type: 'single_choice',
        required: true,
        options: [
          'Lấy rất nhanh trong ca sáng/chiều cùng ngày',
          'Lấy đúng hẹn vào khung giờ cố định',
          'Thường xuyên bị dời lịch sang ngày hôm sau',
          'Bưu tá không đến lấy, Shop phải đem ra bưu cục'
        ],
      },
      {
        question: 'Những vấn đề Shop thường gặp khi bàn giao bọc hàng:',
        type: 'multiple_choice',
        required: false,
        options: [
          'Không gặp vấn đề nào',
          'Lỗi quét mã vạch tracking trên bưu kiện',
          'Thiếu biên bản hoặc chữ ký xác nhận bàn giao',
          'Quy cách đóng gói của sàn khắt khe so với chi phí',
          'Bưu tá từ chối lấy hàng cồng kềnh'
        ],
      },
      {
        question: 'Đề xuất cải tiến khâu bàn giao và kết nối vận chuyển:',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    topic: 'Chính sách nền tảng',
    title: 'Khảo sát chính sách chiết khấu, phí sàn và quyền lợi đối tác MIVA',
    description: 'Thu thập ý kiến đóng góp xây dựng về cơ chế phí hoa hồng, hỗ trợ phí ship và bảo vệ nhà bán hàng.',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_vendors',
    triggerType: 'manual',
    questions: [
      {
        question: 'Mức độ cạnh tranh và hợp lý của mức phí sàn MIVA so với các nền tảng khác?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Tính rõ ràng và minh bạch trong các khoản phí khấu trừ đơn hàng?',
        type: 'single_choice',
        required: true,
        options: [
          'Rất rõ ràng, có bảng kê chi tiết từng đơn',
          'Dễ hiểu, khấu trừ đúng tỷ lệ cam kết',
          'Đôi khi có khoản phí phát sinh chưa rõ',
          'Bảng kê đối soát tài chính còn phức tạp'
        ],
      },
      {
        question: 'Chính sách nào Shop mong muốn MIVA hỗ trợ thêm?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Giảm phí sàn cho Shop có doanh số cao & đánh giá tốt',
          'Gói hỗ trợ mã freeship đồng tài trợ',
          'Chính sách đền bù khi khách boom hàng hoặc hàng thất lạc',
          'Bảo vệ Shop trước các đánh giá 1 sao ác ý / cạnh tranh bẩn',
          'Hỗ trợ vốn kinh doanh và thanh toán tiền hàng nhanh trong 24h'
        ],
      },
      {
        question: 'Ý kiến thẳng thắn của Shop về các chính sách hiện tại của MIVA:',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    topic: 'Hiệu quả kinh doanh',
    title: 'Khảo sát tăng trưởng doanh thu và hiệu quả bán hàng trên sàn MIVA',
    description: 'Tìm hiểu mức độ tăng trưởng doanh số và hỗ trợ Shop tối ưu hóa chi phí vận hành.',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_vendors',
    triggerType: 'manual',
    questions: [
      {
        question: 'Mức độ hài lòng của Shop về doanh số đạt được trên MIVA?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Tỷ lệ tăng trưởng đơn hàng trên MIVA trong 3 tháng qua của Shop:',
        type: 'single_choice',
        required: true,
        options: [
          'Tăng trưởng mạnh (> 30%)',
          'Tăng trưởng đều đặn (10% - 30%)',
          'Ổn định, tương đương các tháng trước',
          'Có dấu hiệu chững lại hoặc giảm'
        ],
      },
      {
        question: 'Kênh mang lại lượng truy cập và khách hàng nhiều nhất cho Shop:',
        type: 'multiple_choice',
        required: false,
        options: [
          'Tham gia các chiến dịch Mega Sale / Flash Sale của sàn',
          'Khách tự tìm kiếm từ khóa trên thanh tìm kiếm',
          'Được sàn gợi ý trên trang chủ / trang ngành hàng',
          'Shop tự chạy quảng cáo và kéo khách từ mạng xã hội'
        ],
      },
      {
        question: 'Shop có đề xuất gì để MIVA giúp các nhà bán hàng bùng nổ doanh số hơn?',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    topic: 'Hỗ trợ từ MIVA',
    title: 'Khảo sát chất lượng hỗ trợ của đội ngũ quản lý ngành hàng (KAM) & Support',
    description: 'Đánh giá chất lượng tư vấn, hỗ trợ tham gia chiến dịch và giải quyết vướng mắc của MIVA dành cho Shop.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_vendors',
    triggerType: 'manual',
    questions: [
      {
        question: 'Đánh giá sự nhiệt tình và chuyên nghiệp của chuyên viên hỗ trợ nhà bán hàng?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Khi Shop gặp sự cố kỹ thuật hoặc khiếu nại, thời gian phản hồi của MIVA như thế nào?',
        type: 'single_choice',
        required: true,
        options: [
          'Phản hồi ngay tức thì trong 15 phút',
          'Phản hồi trong 2-4 giờ làm việc',
          'Phải nhắc lại nhiều lần mới được xử lý',
          'Chậm trễ, ảnh hưởng đến tiến độ bán hàng'
        ],
      },
      {
        question: 'Nội dung đào tạo và hỗ trợ Shop mong muốn MIVA tổ chức thêm:',
        type: 'multiple_choice',
        required: false,
        options: [
          'Khóa học chụp ảnh & quay video sản phẩm chuẩn SEO',
          'Chiến lược tối ưu giá & chạy quảng cáo nội sàn',
          'Kỹ năng tư vấn chốt đơn & xử lý khiếu nại khách hàng',
          'Cập nhật xu hướng tiêu dùng theo mùa'
        ],
      },
      {
        question: 'Nhận xét hoặc lời nhắn gửi của Shop tới ban quản trị sàn MIVA:',
        type: 'text',
        required: false,
      },
    ],
  },
  {
    topic: 'Đề xuất cải thiện hệ thống',
    title: 'Khảo sát đề xuất nâng cấp tính năng hệ thống quản trị Vendor 2.0',
    description: 'Tổng hợp các đề xuất kỹ thuật từ các đối tác nhằm xây dựng phiên bản quản trị bán hàng ưu việt hơn.',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
    scope: 'platform',
    audienceType: 'all_vendors',
    triggerType: 'manual',
    questions: [
      {
        question: 'Mức độ ổn định và thời gian phản hồi của hệ thống trong các đợt Siêu Sale?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Các tính năng công nghệ Shop mong muốn được tích hợp trong phiên bản tới:',
        type: 'multiple_choice',
        required: true,
        options: [
          'Mở cổng API kết nối với phần mềm quản lý kho ngoài (KiotViet, Sapo...)',
          'Hệ thống tin nhắn tự động thông minh khi khách đặt đơn',
          'Phân tích biểu đồ tỷ lệ chuyển đổi khách vào xem hàng',
          'Ứng dụng di động (Mobile App) dành riêng cho chủ Shop quản lý',
          'Quản lý nhiều tài khoản nhân viên phân quyền chi tiết'
        ],
      },
      {
        question: 'Độ ưu tiên cải tiến mà Shop mong muốn nhất hiện nay:',
        type: 'single_choice',
        required: false,
        options: [
          'Tối ưu tốc độ tải trang & độ ổn định lúc sale lớn',
          'Mở rộng kết nối API phần mềm bán hàng',
          'Nâng cấp giao diện thân thiện trên điện thoại',
          'Cải tiến công cụ khuyến mãi & voucher'
        ],
      },
      {
        question: 'Mô tả chi tiết những tính năng hoặc điểm bất tiện hệ thống cần khắc phục ngay:',
        type: 'text',
        required: false,
      },
    ],
  },
];

export const SHOP_TEMPLATES: SurveyTemplateItem[] = [
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
        question: 'Bạn đánh giá chất lượng sản phẩm nhận được bao nhiêu sao?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Sản phẩm thực tế có giống như hình ảnh và thông số Shop mô tả trên gian hàng không?',
        type: 'single_choice',
        required: true,
        options: [
          'Hoàn toàn chính xác, đúng 100% như mô tả',
          'Cơ bản giống, chỉ khác biệt nhỏ về ánh sáng chụp',
          'Hơi khác so với hình dung',
          'Không giống với thông tin quảng cáo'
        ],
      },
      {
        question: 'Điểm bạn ưng ý nhất ở sản phẩm của Shop là gì?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Chất liệu dày dặn, hoàn thiện tỉ mỉ',
          'Màu sắc sắc nét, mẫu mã đẹp mắt',
          'Đóng gói bọc hàng cẩn thận, nguyên vẹn',
          'Giá thành hợp lý so với chất lượng',
          'Có quà tặng kèm và thư cảm ơn chu đáo'
        ],
      },
      {
        question: 'Khả năng bạn tiếp tục mua sắm tại gian hàng chúng mình trong lần tới?',
        type: 'single_choice',
        required: true,
        options: [
          'Chắc chắn sẽ ủng hộ tiếp',
          'Có thể sẽ mua lại khi có nhu cầu',
          'Cần cân nhắc thêm',
          'Chưa có ý định'
        ],
      },
      {
        question: 'Chia sẻ thêm cảm nhận hoặc đóng góp ý kiến để Shop phục vụ bạn tốt hơn:',
        type: 'text',
        required: false,
      },
    ],
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
        question: 'Mức độ chuẩn xác của mô tả sản phẩm so với thực tế nhận được?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Bảng hướng dẫn kích thước (Size Chart) của Shop có chuẩn với bạn không?',
        type: 'single_choice',
        required: true,
        options: [
          'Vừa vặn hoàn hảo, size rất chuẩn',
          'Hơi chật một chút',
          'Hơi rộng một chút',
          'Sai lệch nhiều so với bảng kích thước'
        ],
      },
      {
        question: 'Yếu tố nào Shop cần bổ sung thêm trong phần mô tả sản phẩm?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Mô tả đã rất chi tiết và đầy đủ',
          'Cần thêm ảnh chụp thật cận cảnh chất liệu',
          'Thêm video quay sản phẩm thực tế',
          'Ghi rõ hướng dẫn giặt ủi và bảo quản',
          'Ghi chú rõ ràng hơn về nguồn gốc xuất xứ'
        ],
      },
      {
        question: 'Góp ý thêm về hình ảnh hoặc thông tin sản phẩm của gian hàng:',
        type: 'text',
        required: false,
      },
    ],
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
        question: 'Bạn đánh giá độ tương xứng giữa mức giá và chất lượng sản phẩm nhận được như thế nào?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Theo bạn, mức giá hiện tại của sản phẩm này trên thị trường là:',
        type: 'single_choice',
        required: true,
        options: [
          'Rất hời so với chất lượng cao cấp',
          'Mức giá hợp lý, xứng đáng với số tiền bỏ ra',
          'Hơi cao một chút so với mặt bằng chung',
          'Giá khá đắt'
        ],
      },
      {
        question: 'Hình thức khuyến mãi nào Shop nên tổ chức thường xuyên hơn?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Mã giảm giá trực tiếp theo giá trị đơn hàng',
          'Mua kèm deal sốc / Quà tặng hấp dẫn',
          'Miễn phí vận chuyển toàn quốc',
          'Combo tiết kiệm khi mua từ 2 sản phẩm',
          'Ưu đãi tri ân khách hàng cũ'
        ],
      },
      {
        question: 'Bạn mong muốn mức giá hoặc chương trình ưu đãi thế nào cho đợt mua sắm tiếp theo?',
        type: 'text',
        required: false,
      },
    ],
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
        question: 'Mức độ hài lòng của bạn về quy cách đóng gói bọc hàng của Shop?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Tình trạng kiện hàng khi bạn nhận từ tay nhân viên giao hàng:',
        type: 'single_choice',
        required: true,
        options: [
          'Hộp carton vuông vắn, dán băng keo kỹ, bọc chống sốc dày',
          'Hộp hơi móp méo bên ngoài nhưng sản phẩm bên trong nguyên vẹn',
          'Bao bì bị rách hoặc ướt nhẹ',
          'Hàng hóa bên trong bị ảnh hưởng do đóng gói sơ sài'
        ],
      },
      {
        question: 'Chi tiết nào trong gói hàng làm bạn ấn tượng nhất?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Có dán tem niêm phong và tem cảnh báo hàng dễ vỡ',
          'Bọc xốp khí chống va đập nhiều lớp',
          'Có túi zip/túi chống bụi đựng sản phẩm bên trong',
          'Thư cảm ơn viết tay & voucher giảm giá cho lần sau',
          'Đóng gói tối giản, thân thiện với môi trường'
        ],
      },
      {
        question: 'Góp ý giúp Shop cải thiện quy trình đóng gói và bao bì sản phẩm:',
        type: 'text',
        required: false,
      },
    ],
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
        question: 'Mức độ hài lòng về màu sắc và kích thước sản phẩm bạn nhận được?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Màu sắc thực tế của sản phẩm so với hình ảnh hiển thị trên màn hình:',
        type: 'single_choice',
        required: true,
        options: [
          'Màu sắc y hệt hình ảnh trên gian hàng',
          'Thực tế đẹp và đậm nét hơn trong ảnh',
          'Hơi lệch một chút do ánh sáng chụp',
          'Khác biệt rõ rệt so với hình ảnh'
        ],
      },
      {
        question: 'Bạn mong muốn Shop mở rộng thêm các tùy chọn nào?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Thêm các tông màu xu hướng mới (pastel, trung tính...)',
          'Bổ sung thêm size lớn (Plus size: XL, 2XL, 3XL)',
          'Bổ sung thêm size nhỏ (XS, S chuẩn dáng)',
          'Thêm phiên bản theo mùa (hè thoáng mát, thu đông giữ nhiệt)'
        ],
      },
      {
        question: 'Màu sắc hoặc kích cỡ nào bạn mong muốn Shop ra mắt trong bộ sưu tập tiếp theo?',
        type: 'text',
        required: false,
      },
    ],
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
        question: 'Tổng quan mức độ hài lòng của bạn đối với toàn bộ trải nghiệm mua sắm tại Shop?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Tốc độ phản hồi tin nhắn chat và tư vấn của nhân viên Shop:',
        type: 'single_choice',
        required: true,
        options: [
          'Phản hồi siêu nhanh trong vài phút, tư vấn rất có tâm',
          'Phản hồi trong ngày, nhiệt tình',
          'Phản hồi hơi chậm',
          'Shop chưa phản hồi tin nhắn của mình'
        ],
      },
      {
        question: 'Lý do chính khiến bạn lựa chọn mua hàng của Shop chúng mình:',
        type: 'multiple_choice',
        required: false,
        options: [
          'Sản phẩm đẹp, đúng sở thích',
          'Giá cả hợp lý & nhiều ưu đãi',
          'Xem review đánh giá tích cực của khách mua trước',
          'Shop có dịch vụ hỗ trợ đổi trả nhanh chóng',
          'Bạn bè hoặc người quen giới thiệu'
        ],
      },
      {
        question: 'Lời nhắn nhủ hoặc điều gì Shop có thể làm tốt hơn nữa cho bạn?',
        type: 'text',
        required: false,
      },
    ],
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
        question: 'Bạn đánh giá trải nghiệm mua sắm tại gian hàng bao nhiêu điểm?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Thời gian từ lúc bạn đặt đơn đến khi Shop chuẩn bị hàng và bàn giao vận chuyển:',
        type: 'single_choice',
        required: true,
        options: [
          'Siêu nhanh, chuẩn bị hàng trong ngày',
          'Đúng hẹn trong vòng 24 giờ',
          'Hơi lâu hơn một chút so với kỳ vọng',
          'Giao hàng bị chậm do kho thiếu hàng'
        ],
      },
      {
        question: 'Bạn cảm thấy hài lòng nhất ở khâu nào trong đơn hàng này?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Khâu tư vấn chọn mẫu và size',
          'Khâu đóng gói kiện hàng đẹp mắt',
          'Khâu vận chuyển nhận hàng nhanh chóng',
          'Chất lượng sản phẩm khi bóc hộp'
        ],
      },
      {
        question: 'Chia sẻ trải nghiệm chân thật nhất của bạn khi mua sắm tại Shop:',
        type: 'text',
        required: false,
      },
    ],
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
        question: 'Mức độ tin cậy của bạn dành cho các sản phẩm của gian hàng?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Khả năng bạn quay lại mua sắm các sản phẩm khác của Shop trong tương lai:',
        type: 'single_choice',
        required: true,
        options: [
          'Rất cao, đã lưu Shop vào danh sách yêu thích',
          'Chắc chắn sẽ mua nếu có nhu cầu phát sinh',
          'Đang cân nhắc, tùy thuộc vào giá và mẫu mới',
          'Khó có khả năng mua lại'
        ],
      },
      {
        question: 'Yếu tố nào sẽ giữ chân bạn tiếp tục mua hàng tại Shop dài lâu?',
        type: 'multiple_choice',
        required: false,
        options: [
          'Chất lượng sản phẩm luôn ổn định qua các lần mua',
          'Nhiều ưu đãi tri ân độc quyền cho khách hàng thân thiết',
          'Liên tục cập nhật mẫu mã mới bắt trend',
          'Hỗ trợ bảo hành và đổi hàng chu đáo'
        ],
      },
      {
        question: 'Điều gì sẽ khiến bạn sẵn sàng giới thiệu Shop cho người thân và bạn bè?',
        type: 'text',
        required: false,
      },
    ],
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
        question: 'Độ phù hợp của các sản phẩm hiện tại của Shop với phong cách / nhu cầu của bạn?',
        type: 'rating',
        required: true,
      },
      {
        question: 'Bạn mong muốn Shop mở rộng thêm dòng sản phẩm nào trong thời gian tới?',
        type: 'multiple_choice',
        required: true,
        options: [
          'Dòng sản phẩm cao cấp (Premium Collection)',
          'Dòng sản phẩm tiết kiệm / combo gia đình',
          'Phụ kiện đi kèm đồng bộ',
          'Dòng sản phẩm phiên bản giới hạn (Limited Edition)',
          'Dòng sản phẩm thân thiện môi trường / tái chế'
        ],
      },
      {
        question: 'Mức giá bạn sẵn sàng chi trả cho các mẫu sản phẩm mới chất lượng cao:',
        type: 'single_choice',
        required: false,
        options: [
          'Dưới 200.000 VNĐ',
          'Từ 200.000 VNĐ - 500.000 VNĐ',
          'Từ 500.000 VNĐ - 1.000.000 VNĐ',
          'Trên 1.000.000 VNĐ nếu chất lượng xứng đáng'
        ],
      },
      {
        question: 'Hãy mô tả sản phẩm mà bạn đang tìm kiếm nhưng chưa thấy bán trên Shop:',
        type: 'text',
        required: false,
      },
    ],
  },
];
