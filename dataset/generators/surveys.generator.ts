import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { CONFIG } from '../config/dataset.config';

const ADMIN_SURVEY_TOPICS = [
  'Khảo sát trải nghiệm mua sắm MIVA',
  'Mức độ hài lòng của khách hàng',
  'Nhu cầu mua sắm cuối năm',
  'Ý kiến về chương trình Voucher',
  'Trải nghiệm thanh toán và giao hàng'
];

const VENDOR_SURVEY_TOPICS = [
  'Chất lượng sản phẩm',
  'Dịch vụ của shop',
  'Mức độ hài lòng sau mua hàng',
  'Nhu cầu sản phẩm mới',
  'Màu sắc/kích thước khách hàng mong muốn'
];

export function generateSurveys(
  admins: any[],
  vendors: any[],
  customers: any[],
  orders: any[],
  orderDetails: any[],
  products: any[],
  colors: any[],
  variants: any[]
) {
  const surveys: any[] = [];
  const surveyQuestions: any[] = [];
  const surveyOptions: any[] = [];
  const surveyResponses: any[] = [];
  const surveyAnswers: any[] = [];

  // 1. Build lookup: vendorId -> Set<customerId>
  const vendorCustomers = new Map<string, Set<string>>();
  vendors.forEach(v => vendorCustomers.set(v.id, new Set()));

  const productVendorMap = new Map<string, string>();
  products.forEach(p => { if (p.vendorId) productVendorMap.set(p.id, p.vendorId); });

  const colorProductMap = new Map<string, string>();
  colors.forEach(c => colorProductMap.set(c.id, c.productId));

  const variantColorMap = new Map<string, string>();
  variants.forEach(v => variantColorMap.set(v.id, v.productColorId));

  const orderCustomerMap = new Map<string, { userId: string, createdAt: Date, status: string }>();
  orders.forEach(o => orderCustomerMap.set(o.id, { userId: o.userId, createdAt: o.createdAt, status: o.status }));

  orderDetails.forEach(detail => {
    const order = orderCustomerMap.get(detail.orderId);
    if (!order) return;
    // Only completed or shipping orders count for vendor feedback
    if (order.status !== 'completed' && order.status !== 'shipping') return;
    
    const variantId = detail.productVariantId;
    const colorId = variantColorMap.get(variantId);
    if (!colorId) return;
    const productId = colorProductMap.get(colorId);
    if (!productId) return;
    const vendorId = productVendorMap.get(productId);
    
    if (vendorId) {
      const set = vendorCustomers.get(vendorId);
      if (set) {
        set.add(order.userId);
      }
    }
  });

  // Remove vendors with no customers from being chosen if possible
  const eligibleVendors = vendors.filter(v => (vendorCustomers.get(v.id)?.size || 0) > 0);

  const numAdminSurveys = faker.number.int({ min: CONFIG.counts.adminSurveys.min, max: CONFIG.counts.adminSurveys.max });
  const numVendorSurveys = eligibleVendors.length > 0 ? faker.number.int({ min: Math.min(CONFIG.counts.vendorSurveys.min, eligibleVendors.length), max: Math.min(CONFIG.counts.vendorSurveys.max, eligibleVendors.length) }) : 0;

  // 2. Helper to create a Survey
  const createSurvey = (creator: any, role: 'admin' | 'vendor') => {
    const isDraft = faker.datatype.boolean(0.1);
    const isClosed = faker.datatype.boolean(0.2);
    const status = isDraft ? 'draft' : (isClosed ? 'closed' : 'active');
    
    const createdAt = faker.date.between({ from: new Date('2025-06-01'), to: CONFIG.dateRange.end });
    const startDate = isDraft ? null : faker.date.soon({ days: 30, refDate: createdAt });
    const endDate = isClosed && startDate ? faker.date.soon({ days: 30, refDate: startDate }) : (isDraft ? null : faker.date.soon({ days: 100, refDate: startDate || createdAt }));

    const survey = {
      id: faker.string.uuid(),
      createdById: creator.id,
      title: role === 'admin' ? faker.helpers.arrayElement(ADMIN_SURVEY_TOPICS) : faker.helpers.arrayElement(VENDOR_SURVEY_TOPICS),
      description: faker.datatype.boolean(0.7) ? faker.lorem.sentences(2) : null,
      imageUrl: faker.datatype.boolean(0.8) ? faker.image.urlPicsumPhotos({ width: 800, height: 400 }) : null,
      status,
      startDate,
      endDate,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    };
    surveys.push(survey);

    // Create Questions
    const numQuestions = faker.number.int({ min: CONFIG.counts.questionsPerSurvey.min, max: CONFIG.counts.questionsPerSurvey.max });
    const questionsForSurvey: any[] = [];
    
    for (let i = 1; i <= numQuestions; i++) {
      let type = faker.helpers.arrayElement(['text', 'single_choice', 'multiple_choice', 'rating']);
      // Force at least some structure
      if (i === 1) type = 'rating';
      if (i === 2) type = 'single_choice';
      
      const qText = role === 'admin' ? 'Bạn đánh giá như thế nào về MIVA?' : 'Bạn đánh giá thế nào về sản phẩm của chúng tôi?';

      const question = {
        id: faker.string.uuid(),
        surveyId: survey.id,
        question: `[Q${i}] ${qText}`,
        type,
        required: faker.datatype.boolean(0.8),
        position: i,
        createdAt: survey.createdAt,
        updatedAt: survey.createdAt,
      };
      surveyQuestions.push(question);
      questionsForSurvey.push(question);

      if (type === 'single_choice' || type === 'multiple_choice') {
        const numOptions = faker.number.int({ min: CONFIG.counts.optionsPerChoice.min, max: CONFIG.counts.optionsPerChoice.max });
        for (let j = 1; j <= numOptions; j++) {
          surveyOptions.push({
            id: faker.string.uuid(),
            questionId: question.id,
            content: `Lựa chọn ${j} cho câu hỏi ${i}`,
            position: j,
            createdAt: survey.createdAt,
          });
        }
      }
    }

    // Generate Responses
    if (status !== 'draft') {
      const eligibleCustomerIds = role === 'admin' 
        ? customers.map(c => c.id) 
        : Array.from(vendorCustomers.get(creator.id) || []);
      
      // Shuffle and pick
      const pickedCustomers = faker.helpers.shuffle(eligibleCustomerIds).slice(0, faker.number.int({ min: Math.min(1, eligibleCustomerIds.length), max: Math.min(20, eligibleCustomerIds.length) }));
      
      for (const customerId of pickedCustomers) {
        // Must be submitted after startDate and before endDate (if closed)
        const earliestSubmit = survey.startDate ? new Date(survey.startDate.getTime() + 86400) : survey.createdAt;
        const maxSubmit = survey.endDate || CONFIG.dateRange.end;
        
        let submittedAt = faker.date.between({ from: earliestSubmit, to: maxSubmit });
        if (submittedAt > CONFIG.dateRange.end) submittedAt = CONFIG.dateRange.end;

        const response = {
          id: faker.string.uuid(),
          surveyId: survey.id,
          userId: customerId,
          submittedAt: submittedAt,
          createdAt: submittedAt,
        };
        surveyResponses.push(response);

        // Answers
        for (const q of questionsForSurvey) {
          if (!q.required && faker.datatype.boolean(0.2)) continue; // skip optional

          const qOptions = surveyOptions.filter(o => o.questionId === q.id);

          if (q.type === 'text') {
            surveyAnswers.push({
              id: faker.string.uuid(),
              responseId: response.id,
              questionId: q.id,
              optionId: null,
              textAnswer: faker.helpers.arrayElement([
                "Sản phẩm tốt, giao hàng khá nhanh.",
                "Mình mong shop có thêm nhiều voucher.",
                "Giao diện dễ sử dụng nhưng phần tìm kiếm có thể cải thiện.",
                "Shop nên bổ sung thêm nhiều màu và kích thước.",
                "Mình hài lòng với chất lượng sản phẩm.",
                "Thời gian giao hàng có thể nhanh hơn.",
                "Mong MIVA có thêm nhiều chương trình khuyến mãi."
              ]),
              ratingValue: null,
              createdAt: response.submittedAt,
            });
          } else if (q.type === 'rating') {
            // Realistic distribution: mostly 4 and 5, some 3, fewer 1 and 2
            const rating = faker.helpers.weightedArrayElement([
              { weight: 1, value: 1 },
              { weight: 2, value: 2 },
              { weight: 10, value: 3 },
              { weight: 40, value: 4 },
              { weight: 47, value: 5 }
            ]);
            surveyAnswers.push({
              id: faker.string.uuid(),
              responseId: response.id,
              questionId: q.id,
              optionId: null,
              textAnswer: null,
              ratingValue: rating,
              createdAt: response.submittedAt,
            });
          } else if (q.type === 'single_choice' && qOptions.length > 0) {
            surveyAnswers.push({
              id: faker.string.uuid(),
              responseId: response.id,
              questionId: q.id,
              optionId: faker.helpers.arrayElement(qOptions).id,
              textAnswer: null,
              ratingValue: null,
              createdAt: response.submittedAt,
            });
          } else if (q.type === 'multiple_choice' && qOptions.length > 0) {
            const selectedOptions = faker.helpers.arrayElements(qOptions, faker.number.int({ min: 1, max: Math.min(3, qOptions.length) }));
            for (const selOpt of selectedOptions) {
              surveyAnswers.push({
                id: faker.string.uuid(),
                responseId: response.id,
                questionId: q.id,
                optionId: selOpt.id,
                textAnswer: null,
                ratingValue: null,
                createdAt: response.submittedAt,
              });
            }
          }
        }
      }
    }
  };

  // Generate Admin surveys
  const sampledAdmins = faker.helpers.arrayElements(admins, Math.min(admins.length, numAdminSurveys));
  for (let i = 0; i < numAdminSurveys; i++) {
    const admin = sampledAdmins[i % sampledAdmins.length];
    createSurvey(admin, 'admin');
  }

  // Generate Vendor surveys
  const sampledVendors = faker.helpers.arrayElements(eligibleVendors, numVendorSurveys);
  for (const vendor of sampledVendors) {
    createSurvey(vendor, 'vendor');
  }

  const sql = [
    surveys.length > 0 ? sqlSection('Surveys', surveys.length) + buildInsert('Survey', surveys) : '',
    surveyQuestions.length > 0 ? sqlSection('SurveyQuestions', surveyQuestions.length) + buildInsert('SurveyQuestion', surveyQuestions) : '',
    surveyOptions.length > 0 ? sqlSection('SurveyOptions', surveyOptions.length) + buildInsert('SurveyOption', surveyOptions) : '',
    surveyResponses.length > 0 ? sqlSection('SurveyResponses', surveyResponses.length) + buildInsert('SurveyResponse', surveyResponses) : '',
    surveyAnswers.length > 0 ? sqlSection('SurveyAnswers', surveyAnswers.length) + buildInsert('SurveyAnswer', surveyAnswers) : '',
  ].filter(Boolean).join('\n');

  return { 
    surveys, 
    surveyQuestions, 
    surveyOptions, 
    surveyResponses, 
    surveyAnswers, 
    sql 
  };
}
