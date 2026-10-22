import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { CONFIG } from '../config/dataset.config';
import {
  CLIENT_SURVEY_TEMPLATES,
  ADMIN_TO_VENDOR_SURVEY_TEMPLATES,
  VENDOR_TO_CLIENT_SURVEY_TEMPLATES,
  SurveyTemplateDefinition,
} from '../data/surveyTemplates';

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

  vendors.forEach((v) => {
    vendorCustomers.set(v.id, new Set());
    vendorCompletedOrders.set(v.id, []);
  });

  const productVendorMap = new Map<string, string>();
  products.forEach((p) => {
    if (p.vendorId) productVendorMap.set(p.id, p.vendorId);
  });

  const colorProductMap = new Map<string, string>();
  colors.forEach((c) => colorProductMap.set(c.id, c.productId));

  const variantColorMap = new Map<string, string>();
  variants.forEach((v) => variantColorMap.set(v.id, v.productColorId));

  const orderMap = new Map<string, any>();
  orders.forEach((o) => orderMap.set(o.id, o));

  orderDetails.forEach((detail) => {
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
        set.add(order.clientId);
      }

      // Track completed or shipping orders for buyers
      if (order.status === 'completed' || order.status === 'shipping') {
        const vOrders = vendorCompletedOrders.get(vendorId);
        if (vOrders && !vOrders.find((o) => o.id === order.id)) {
          vOrders.push(order);
        }
      }
    }
  });

  const eligibleVendors = vendors.filter(
    (v) => (vendorCustomers.get(v.id)?.size || 0) > 0
  );

  const numAdminSurveys = faker.number.int({
    min: CONFIG.counts.adminSurveys.min,
    max: CONFIG.counts.adminSurveys.max,
  });

  const numVendorSurveys =
    eligibleVendors.length > 0
      ? faker.number.int({
          min: Math.min(CONFIG.counts.vendorSurveys.min, eligibleVendors.length),
          max: Math.min(CONFIG.counts.vendorSurveys.max, eligibleVendors.length),
        })
      : 0;

  // 2. Helper to build survey from real domain template
  const createSurveyFromTemplate = (
    template: SurveyTemplateDefinition,
    creator: any,
    role: 'admin' | 'vendor'
  ) => {
    const isDraft = faker.datatype.boolean(0.1);
    const isClosed = faker.datatype.boolean(0.2);
    const surveyStatus = isDraft ? 'draft' : isClosed ? 'closed' : 'active';

    const createdAt = faker.date.between({
      from: new Date('2025-06-01'),
      to: CONFIG.dateRange.end,
    });
    const startDate = isDraft
      ? null
      : faker.date.soon({ days: 30, refDate: createdAt });
    const endDate =
      isClosed && startDate
        ? faker.date.soon({ days: 30, refDate: startDate })
        : isDraft
        ? null
        : faker.date.soon({ days: 90, refDate: startDate || createdAt });

    const surveyTitle =
      role === 'vendor' && creator.storeName
        ? `[${creator.storeName}] ${template.title}`
        : template.title;

    const surveyDesc =
      role === 'vendor' && creator.storeName
        ? `${creator.storeName} trân trọng gửi tới bạn: ${template.description}`
        : template.description;

    const survey = {
      id: faker.string.uuid(),
      adminId: role === 'admin' ? creator.id : null,
      vendorId: role === 'vendor' ? creator.id : null,
      title: surveyTitle,
      description: surveyDesc,
      imageUrl: template.imageUrl,
      scope: role === 'admin' ? 'platform' : 'vendor',
      audienceType: template.audienceType,
      triggerType: template.triggerType,
      status: surveyStatus,
      startDate,
      endDate,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    };
    surveys.push(survey);

    // 3. Create Questions & Options from template
    const questionsForSurvey: any[] = [];

    template.questions.forEach((qDef, qIdx) => {
      const position = qIdx + 1;
      const question = {
        id: faker.string.uuid(),
        surveyId: survey.id,
        question: qDef.question,
        type: qDef.type,
        required: qDef.required,
        position,
        createdAt: survey.createdAt,
        updatedAt: survey.createdAt,
      };
      surveyQuestions.push(question);
      questionsForSurvey.push({ ...question, templateOptions: qDef.options || [] });

      // Create predefined options for single/multiple choice questions
      if (
        (qDef.type === 'single_choice' || qDef.type === 'multiple_choice') &&
        qDef.options &&
        qDef.options.length > 0
      ) {
        qDef.options.forEach((optContent, optIdx) => {
          surveyOptions.push({
            id: faker.string.uuid(),
            questionId: question.id,
            content: optContent,
            position: optIdx + 1,
            createdAt: survey.createdAt,
          });
        });
      }
    });

    // 4. Generate Responses (only for non-draft surveys)
    if (surveyStatus !== 'draft') {
      let targetList: { clientId: string; orderId: string | null }[] = [];

      if (role === 'admin') {
        if (
          template.audienceType === 'all_users' ||
          template.audienceType === 'selected_users'
        ) {
          targetList = customers.map((c) => ({ clientId: c.id, orderId: null }));

          if (template.triggerType === 'after_checkout') {
            targetList = targetList
              .map((t) => {
                const userOrders = orders.filter((o) => o.clientId === t.clientId);
                return {
                  clientId: t.clientId,
                  orderId:
                    userOrders.length > 0
                      ? faker.helpers.arrayElement(userOrders).id
                      : null,
                };
              })
              .filter((t) => t.orderId !== null);
          }
        } else if (template.audienceType === 'all_vendors') {
          // Admin survey targeted to vendors:
          // In database schema, SurveyResponse strictly requires FK to Client table,
          // so vendor invitations are tracked via Notification table with vendorId.
          targetList = [];

          // Create vendor notification invitations
          const sampledVendors = faker.helpers.arrayElements(
            vendors,
            faker.number.int({ min: 5, max: Math.min(20, vendors.length) })
          );
          for (const vend of sampledVendors) {
            const isRead = faker.datatype.boolean(0.6);
            notifications.push({
              id: faker.string.uuid(),
              adminId: null,
              clientId: null,
              vendorId: vend.id,
              surveyId: survey.id,
              surveyResponseId: null,
              type: 'survey_invitation',
              title: `[MIVA gửi Đối tác] ${survey.title}`,
              content:
                survey.description ||
                'Ban quản trị MIVA trân trọng gửi khảo sát tới Quý Đối tác bán hàng.',
              data: { surveyId: survey.id },
              isRead,
              readAt: isRead ? survey.createdAt : null,
              expiresAt: survey.endDate,
              createdAt: survey.createdAt,
            });
          }
        }
      } else {
        // Vendor survey targeting their buyers
        if (template.audienceType === 'vendor_buyers') {
          const buyers = Array.from(vendorCustomers.get(creator.id) || []);
          targetList = buyers.map((id) => ({ clientId: id, orderId: null }));
        } else if (template.audienceType === 'vendor_completed_buyers') {
          const compOrders = vendorCompletedOrders.get(creator.id) || [];
          targetList = compOrders.map((o) => ({
            clientId: o.clientId,
            orderId: o.id,
          }));
        }
      }

      // Shuffle and pick a realistic response batch
      const maxSample = Math.min(targetList.length, 18);
      const pickedTargets =
        targetList.length > 0
          ? faker.helpers
              .shuffle(targetList)
              .slice(0, faker.number.int({ min: Math.min(2, targetList.length), max: maxSample }))
          : [];

      for (const target of pickedTargets) {
        const earliestAction = survey.startDate
          ? new Date(survey.startDate.getTime() + 86400000)
          : survey.createdAt;
        const maxAction = new Date(
          Math.min((survey.endDate || CONFIG.dateRange.end).getTime(), CONFIG.dateRange.end.getTime()),
        );
        const fromAction = earliestAction > maxAction ? maxAction : earliestAction;

        const actionAt = faker.date.between({ from: fromAction, to: maxAction });

        const responseStatus = faker.helpers.weightedArrayElement([
          { weight: 15, value: 'pending' },
          { weight: 60, value: 'submitted' },
          { weight: 10, value: 'skipped' },
          { weight: 15, value: 'expired' },
        ]);

        const response = {
          id: faker.string.uuid(),
          surveyId: survey.id,
          clientId: target.clientId,
          orderId: target.orderId,
          deliveryKey: faker.string.uuid(),
          status: responseStatus,
          notifiedAt: faker.datatype.boolean(0.85)
            ? new Date(actionAt.getTime() - 86400000)
            : null,
          openedAt:
            responseStatus !== 'pending' || faker.datatype.boolean(0.5)
              ? new Date(actionAt.getTime() - 3600000)
              : null,
          submittedAt: responseStatus === 'submitted' ? actionAt : null,
          skippedAt: responseStatus === 'skipped' ? actionAt : null,
          expiresAt:
            responseStatus === 'expired'
              ? new Date(actionAt.getTime() - 86400000)
              : survey.endDate || new Date(actionAt.getTime() + 7 * 86400000),
          createdAt: new Date(actionAt.getTime() - 86400000 * 2),
          updatedAt: actionAt,
        };
        surveyResponses.push(response);

        // Notification for client
        if (response.notifiedAt) {
          const isRead = response.openedAt ? true : faker.datatype.boolean(0.5);
          notifications.push({
            id: faker.string.uuid(),
            adminId: null,
            clientId: response.clientId,
            vendorId: null,
            surveyId: survey.id,
            surveyResponseId: response.id,
            type: 'survey_invitation',
            title: `Thư mời khảo sát: ${survey.title}`,
            content:
              survey.description ||
              'MIVA trân trọng mời bạn tham gia khảo sát để cải thiện dịch vụ.',
            data: { surveyId: survey.id, responseId: response.id },
            isRead,
            readAt: isRead ? response.openedAt || response.notifiedAt : null,
            expiresAt: response.expiresAt,
            createdAt: response.notifiedAt,
          });
        }

        // Generate Answers for submitted response
        if (responseStatus === 'submitted') {
          for (const q of questionsForSurvey) {
            // Optional questions can be skipped occasionally
            if (!q.required && faker.datatype.boolean(0.15)) continue;

            const qOptions = surveyOptions.filter((o) => o.questionId === q.id);

            if (q.type === 'text') {
              const textAnswers =
                template.textAnswers && template.textAnswers.length > 0
                  ? template.textAnswers
                  : [
                      'Dịch vụ rất tốt, giao hàng đúng hẹn.',
                      'Chất lượng sản phẩm đáp ứng tốt mong đợi của mình.',
                      'Mong sàn tiếp tục phát huy và có thêm nhiều ưu đãi!',
                    ];

              surveyAnswers.push({
                id: faker.string.uuid(),
                responseId: response.id,
                questionId: q.id,
                optionId: null,
                textAnswer: faker.helpers.arrayElement(textAnswers),
                ratingValue: null,
                createdAt: response.submittedAt,
              });
            } else if (q.type === 'rating') {
              const rating = faker.helpers.weightedArrayElement([
                { weight: 2, value: 1 },
                { weight: 3, value: 2 },
                { weight: 10, value: 3 },
                { weight: 35, value: 4 },
                { weight: 50, value: 5 },
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
              const selectedOpt = faker.helpers.arrayElement(qOptions);
              surveyAnswers.push({
                id: faker.string.uuid(),
                responseId: response.id,
                questionId: q.id,
                optionId: selectedOpt.id,
                textAnswer: null,
                ratingValue: null,
                createdAt: response.submittedAt,
              });
            } else if (q.type === 'multiple_choice' && qOptions.length > 0) {
              const numPick = faker.number.int({
                min: 1,
                max: Math.min(2, qOptions.length),
              });
              const pickedOpts = faker.helpers.arrayElements(qOptions, numPick);
              for (const opt of pickedOpts) {
                surveyAnswers.push({
                  id: faker.string.uuid(),
                  responseId: response.id,
                  questionId: q.id,
                  optionId: opt.id,
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

  // 5. Generate Admin Surveys
  // Distribute across CLIENT_SURVEY_TEMPLATES (60%) and ADMIN_TO_VENDOR_SURVEY_TEMPLATES (40%)
  const numClientSurveys = Math.ceil(numAdminSurveys * 0.6);
  const numAdminVendorSurveys = numAdminSurveys - numClientSurveys;

  const shuffledClientTemplates = faker.helpers.shuffle([...CLIENT_SURVEY_TEMPLATES]);
  for (let i = 0; i < numClientSurveys; i++) {
    const admin = admins[i % admins.length];
    const template = shuffledClientTemplates[i % shuffledClientTemplates.length];
    createSurveyFromTemplate(template, admin, 'admin');
  }

  const shuffledVendorTemplates = faker.helpers.shuffle([
    ...ADMIN_TO_VENDOR_SURVEY_TEMPLATES,
  ]);
  for (let i = 0; i < numAdminVendorSurveys; i++) {
    const admin = admins[(i + numClientSurveys) % admins.length];
    const template = shuffledVendorTemplates[i % shuffledVendorTemplates.length];
    createSurveyFromTemplate(template, admin, 'admin');
  }

  // 6. Generate Vendor Surveys
  const sampledVendors = faker.helpers.arrayElements(
    eligibleVendors,
    numVendorSurveys
  );
  const shuffledShopTemplates = faker.helpers.shuffle([
    ...VENDOR_TO_CLIENT_SURVEY_TEMPLATES,
  ]);

  sampledVendors.forEach((vendor, idx) => {
    const template = shuffledShopTemplates[idx % shuffledShopTemplates.length];
    createSurveyFromTemplate(template, vendor, 'vendor');
  });

  // 7. Build Batched SQL
  const sql = [
    surveys.length > 0
      ? sqlSection('Surveys', surveys.length) + buildInsert('Survey', surveys)
      : '',
    surveyQuestions.length > 0
      ? sqlSection('SurveyQuestions', surveyQuestions.length) +
        buildInsert('SurveyQuestion', surveyQuestions)
      : '',
    surveyOptions.length > 0
      ? sqlSection('SurveyOptions', surveyOptions.length) +
        buildInsert('SurveyOption', surveyOptions)
      : '',
    surveyResponses.length > 0
      ? sqlSection('SurveyResponses', surveyResponses.length) +
        buildInsert('SurveyResponse', surveyResponses)
      : '',
    surveyAnswers.length > 0
      ? sqlSection('SurveyAnswers', surveyAnswers.length) +
        buildInsert('SurveyAnswer', surveyAnswers)
      : '',
    notifications.length > 0
      ? sqlSection('Notifications', notifications.length) +
        buildInsert('Notification', notifications)
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    surveys,
    surveyQuestions,
    surveyOptions,
    surveyResponses,
    surveyAnswers,
    notifications,
    sql,
  };
}
