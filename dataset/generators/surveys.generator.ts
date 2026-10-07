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
  const notifications: any[] = [];

  // 1. Build lookup: vendorId -> Set<customerId> and vendorId -> Order[]
  const vendorCustomers = new Map<string, Set<string>>();
  const vendorCompletedOrders = new Map<string, any[]>();
  
  vendors.forEach(v => {
    vendorCustomers.set(v.id, new Set());
    vendorCompletedOrders.set(v.id, []);
  });

  const productVendorMap = new Map<string, string>();
  products.forEach(p => { if (p.vendorId) productVendorMap.set(p.id, p.vendorId); });

  const colorProductMap = new Map<string, string>();
  colors.forEach(c => colorProductMap.set(c.id, c.productId));

  const variantColorMap = new Map<string, string>();
  variants.forEach(v => variantColorMap.set(v.id, v.productColorId));

  const orderMap = new Map<string, any>();
  orders.forEach(o => orderMap.set(o.id, o));

  orderDetails.forEach(detail => {
    const order = orderMap.get(detail.orderId);
    if (!order) return;
    
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
      
      // Keep track of orders for vendor completed buyers
      if (order.status === 'completed' || order.status === 'shipping') {
        const vendorOrders = vendorCompletedOrders.get(vendorId);
        if (vendorOrders && !vendorOrders.find(o => o.id === order.id)) {
          vendorOrders.push(order);
        }
      }
    }
  });

  const eligibleVendors = vendors.filter(v => (vendorCustomers.get(v.id)?.size || 0) > 0);

  const numAdminSurveys = faker.number.int({ min: CONFIG.counts.adminSurveys.min, max: CONFIG.counts.adminSurveys.max });
  const numVendorSurveys = eligibleVendors.length > 0 ? faker.number.int({ min: Math.min(CONFIG.counts.vendorSurveys.min, eligibleVendors.length), max: Math.min(CONFIG.counts.vendorSurveys.max, eligibleVendors.length) }) : 0;

  // 2. Helper to create a Survey
  const createSurvey = (creator: any, role: 'admin' | 'vendor') => {
    const isDraft = faker.datatype.boolean(0.1);
    const isClosed = faker.datatype.boolean(0.2);
    const surveyStatus = isDraft ? 'draft' : (isClosed ? 'closed' : 'active');
    
    const createdAt = faker.date.between({ from: new Date('2025-06-01'), to: CONFIG.dateRange.end });
    const startDate = isDraft ? null : faker.date.soon({ days: 30, refDate: createdAt });
    const endDate = isClosed && startDate ? faker.date.soon({ days: 30, refDate: startDate }) : (isDraft ? null : faker.date.soon({ days: 100, refDate: startDate || createdAt }));

    const scope = role === 'admin' ? 'platform' : 'vendor';
    
    // Choose audience and trigger types realistically
    let audienceType = 'all_users';
    let triggerType = 'manual';
    
    if (role === 'admin') {
      audienceType = faker.helpers.arrayElement(['all_users', 'selected_users', 'all_vendors']);
      triggerType = faker.helpers.arrayElement(['manual', 'after_checkout']);
    } else {
      audienceType = faker.helpers.arrayElement(['vendor_buyers', 'vendor_completed_buyers']);
      triggerType = faker.helpers.arrayElement(['manual', 'after_order_completed']);
      if (audienceType === 'vendor_completed_buyers') {
        triggerType = 'after_order_completed';
      }
    }

    const survey = {
      id: faker.string.uuid(),
      createdById: creator.id,
      title: role === 'admin' ? faker.helpers.arrayElement(ADMIN_SURVEY_TOPICS) : faker.helpers.arrayElement(VENDOR_SURVEY_TOPICS),
      description: faker.datatype.boolean(0.7) ? faker.lorem.sentences(2) : null,
      imageUrl: faker.datatype.boolean(0.8) ? faker.image.urlPicsumPhotos({ width: 800, height: 400 }) : null,
      scope,
      audienceType,
      triggerType,
      status: surveyStatus,
      startDate,
      endDate,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    };
    surveys.push(survey);

    // Create Questions
    const numQuestions = faker.number.int({ min: 4, max: 8 });
    const questionsForSurvey: any[] = [];
    
    for (let i = 1; i <= numQuestions; i++) {
      let type = faker.helpers.arrayElement(['text', 'single_choice', 'multiple_choice', 'rating']);
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
        const numOptions = faker.number.int({ min: 2, max: 6 });
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
    if (surveyStatus !== 'draft') {
      let targetList: any[] = [];
      
      if (role === 'admin') {
        if (audienceType === 'all_users' || audienceType === 'selected_users') {
          targetList = customers.map(c => ({ userId: c.id, orderId: null }));
        } else if (audienceType === 'all_vendors') {
          targetList = vendors.map(v => ({ userId: v.id, orderId: null }));
        }
        
        if (triggerType === 'after_checkout') {
          // Attach a recent order for each selected user if available
          targetList = targetList.map(t => {
            const userOrders = orders.filter(o => o.userId === t.userId);
            return {
              userId: t.userId,
              orderId: userOrders.length > 0 ? faker.helpers.arrayElement(userOrders).id : null
            };
          }).filter(t => t.orderId !== null); // for after_checkout, let's strictly require order
        }
      } else {
        if (audienceType === 'vendor_buyers') {
          const buyers = Array.from(vendorCustomers.get(creator.id) || []);
          targetList = buyers.map(id => ({ userId: id, orderId: null }));
        } else if (audienceType === 'vendor_completed_buyers') {
          const compOrders = vendorCompletedOrders.get(creator.id) || [];
          targetList = compOrders.map(o => ({ userId: o.userId, orderId: o.id }));
        }
      }
      
      // Shuffle and pick
      const pickedTargets = faker.helpers.shuffle(targetList).slice(0, faker.number.int({ min: Math.min(1, targetList.length), max: Math.min(20, targetList.length) }));
      
      for (const target of pickedTargets) {
        const earliestAction = survey.startDate ? new Date(survey.startDate.getTime() + 86400) : survey.createdAt;
        const maxAction = survey.endDate || CONFIG.dateRange.end;
        
        let actionAt = faker.date.between({ from: earliestAction, to: maxAction });
        if (actionAt > CONFIG.dateRange.end) actionAt = CONFIG.dateRange.end;

        const responseStatus = faker.helpers.weightedArrayElement([
          { weight: 20, value: 'pending' },
          { weight: 50, value: 'submitted' },
          { weight: 10, value: 'skipped' },
          { weight: 20, value: 'expired' }
        ]);

        const response = {
          id: faker.string.uuid(),
          surveyId: survey.id,
          userId: target.userId,
          orderId: target.orderId,
          deliveryKey: faker.string.uuid(), // unique
          status: responseStatus,
          notifiedAt: faker.datatype.boolean(0.8) ? new Date(actionAt.getTime() - 86400000) : null,
          openedAt: responseStatus !== 'pending' || faker.datatype.boolean(0.5) ? new Date(actionAt.getTime() - 3600000) : null,
          submittedAt: responseStatus === 'submitted' ? actionAt : null,
          skippedAt: responseStatus === 'skipped' ? actionAt : null,
          expiresAt: responseStatus === 'expired' ? new Date(actionAt.getTime() - 86400000) : (survey.endDate || new Date(actionAt.getTime() + 7 * 86400000)),
          createdAt: new Date(actionAt.getTime() - 86400000 * 2), // slightly before
          updatedAt: actionAt,
        };
        surveyResponses.push(response);

        // Notification
        if (response.notifiedAt) {
          const isRead = response.openedAt ? true : faker.datatype.boolean(0.5);
          notifications.push({
            id: faker.string.uuid(),
            userId: response.userId,
            surveyId: survey.id,
            surveyResponseId: response.id,
            type: 'survey_invitation',
            title: `Thư mời tham gia khảo sát: ${survey.title}`,
            content: `Chào bạn, mời bạn tham gia khảo sát để cải thiện dịch vụ.`,
            data: { surveyId: survey.id },
            isRead: isRead,
            readAt: isRead ? response.openedAt || response.notifiedAt : null,
            expiresAt: response.expiresAt,
            createdAt: response.notifiedAt,
          });
        }

        // Answers
        if (responseStatus === 'submitted') {
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
    notifications.length > 0 ? sqlSection('Notifications', notifications.length) + buildInsert('Notification', notifications) : '',
  ].filter(Boolean).join('\n');

  return { 
    surveys, 
    surveyQuestions, 
    surveyOptions, 
    surveyResponses, 
    surveyAnswers, 
    notifications,
    sql 
  };
}
