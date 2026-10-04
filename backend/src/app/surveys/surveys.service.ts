import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  NotificationType,
  OrderStatus,
  Prisma,
  SurveyAudienceType,
  SurveyQuestionType,
  SurveyResponseStatus,
  SurveyScope,
  SurveyStatus,
  SurveyTriggerType,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { RealtimeService } from 'src/app/realtime/realtime.service';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateSurveyDto,
  type SurveyQuestionInput,
} from './dto/create-survey.dto';
import {
  GetSurveyResultsQueryDto,
  GetSurveysQueryDto,
} from './dto/get-survey.dto';
import {
  SubmitSurveyDto,
  type SubmitSurveyAnswerInput,
} from './dto/submit-survey.dto';
import { GetSurveyInboxQueryDto } from './dto/survey-campaign.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';

type DatabaseClient = PrismaService | Prisma.TransactionClient;
type DeliveryEntry = { userId: string; orderId?: string | null };
type SubmissionQuestion = {
  id: string;
  question: string;
  type: SurveyQuestionType;
  required: boolean;
  position: number;
  options: Array<{ id: string; content: string; position: number }>;
};
type DeliverySurvey = {
  id: string;
  createdById: string;
  title: string;
  description: string | null;
  audienceType: SurveyAudienceType;
  triggerType: SurveyTriggerType;
  endDate: Date | null;
  createdBy: { id: string; role: UserRole };
};
type NotificationPayload = {
  id: string;
  userId: string;
  title: string;
  content: string | null;
  surveyId: string | null;
  surveyResponseId: string | null;
  createdAt: Date;
};

@Injectable()
export class SurveysService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly realtime?: RealtimeService,
  ) {}

  async create(dto: CreateSurveyDto, user: UserInfo) {
    if (user.role !== UserRole.admin && user.role !== UserRole.vendor) {
      throw new ForbiddenException('Chỉ admin hoặc vendor được tạo khảo sát');
    }
    const { questions, audienceType, triggerType, ...fields } = dto;
    const resolvedAudience =
      audienceType ??
      (user.role === UserRole.vendor
        ? SurveyAudienceType.vendor_buyers
        : SurveyAudienceType.all_users);
    this.assertDeliveryRules(resolvedAudience, triggerType, user.role);
    const startDate = this.toDate(fields.startDate);
    const endDate = this.toDate(fields.endDate);
    this.assertDateRange(startDate, endDate);

    return this.prisma.survey.create({
      data: {
        ...fields,
        startDate,
        endDate,
        audienceType: resolvedAudience,
        triggerType,
        scope:
          user.role === UserRole.vendor
            ? SurveyScope.vendor
            : SurveyScope.platform,
        status: SurveyStatus.draft,
        createdById: user.userID,
        questions: {
          create: questions.map((question) =>
            this.questionCreateData(question),
          ),
        },
      },
      include: this.managementInclude(),
    });
  }

  listMine(userId: string, query: GetSurveysQueryDto) {
    return this.listManagement({ createdById: userId }, query);
  }

  listAll(query: GetSurveysQueryDto) {
    return this.listManagement({}, query);
  }

  async getManagementDetail(id: string, user: UserInfo) {
    const survey = await this.getSurveyForManagement(id);
    this.assertOwnerOrAdmin(survey.createdById, user);
    return survey;
  }

  async update(id: string, dto: UpdateSurveyDto, user: UserInfo) {
    const current = await this.getSurveyForManagement(id);
    if (current.createdById !== user.userID) {
      throw new ForbiddenException('Chỉ người tạo được sửa nội dung khảo sát');
    }
    if (current.status !== SurveyStatus.draft) {
      throw new BadRequestException(
        'Chỉ được sửa khảo sát đang ở trạng thái nháp',
      );
    }
    if (dto.questions && current._count.responses > 0) {
      throw new ConflictException(
        'Không thể thay câu hỏi khi khảo sát đã được gửi',
      );
    }
    const audienceType = dto.audienceType ?? current.audienceType;
    const triggerType = dto.triggerType ?? current.triggerType;
    this.assertDeliveryRules(audienceType, triggerType, user.role);
    const startDate =
      dto.startDate === undefined
        ? current.startDate
        : this.toDate(dto.startDate);
    const endDate =
      dto.endDate === undefined ? current.endDate : this.toDate(dto.endDate);
    this.assertDateRange(startDate, endDate);
    const data = this.surveyUpdateData(dto);

    return this.prisma.$transaction(async (tx) => {
      if (dto.questions) {
        await tx.surveyQuestion.deleteMany({ where: { surveyId: id } });
        data.questions = {
          create: dto.questions.map((question) =>
            this.questionCreateData(question),
          ),
        };
      }
      return tx.survey.update({
        where: { id },
        data,
        include: this.managementInclude(),
      });
    });
  }

  async changeStatus(id: string, status: SurveyStatus, user: UserInfo) {
    const survey = await this.getSurveyForManagement(id);
    this.assertOwnerOrAdmin(survey.createdById, user);
    if (survey.status === status) return survey;
    if (status === SurveyStatus.active) {
      if (survey.createdById !== user.userID) {
        throw new ForbiddenException('Chỉ người tạo được phát hành khảo sát');
      }
      this.assertPublishable(survey);
      const result = await this.prisma.$transaction(async (tx) => {
        const activeSurvey = await tx.survey.update({
          where: { id },
          data: { status: SurveyStatus.active },
          include: {
            createdBy: { select: { id: true, role: true } },
          },
        });
        const notifications =
          activeSurvey.triggerType === SurveyTriggerType.manual
            ? await this.createResponses(
                tx,
                activeSurvey,
                (await this.resolveManualRecipientIds(tx, activeSurvey)).map(
                  (userId) => ({ userId }),
                ),
              )
            : [];
        return { activeSurvey, notifications };
      });
      this.emitNotifications(result.notifications);
      return {
        ...result.activeSurvey,
        deliveredCount: result.notifications.length,
      };
    }
    if (
      status === SurveyStatus.closed &&
      survey.status === SurveyStatus.draft
    ) {
      throw new BadRequestException('Khảo sát nháp chưa thể đóng');
    }
    return this.prisma.survey.update({
      where: { id },
      data: { status },
      include: this.managementInclude(),
    });
  }

  async remove(id: string, user: UserInfo) {
    const survey = await this.getSurveyForManagement(id);
    this.assertOwnerOrAdmin(survey.createdById, user);
    return this.prisma.survey.update({
      where: { id },
      data: { status: SurveyStatus.closed, deletedAt: new Date() },
    });
  }

  async listInbox(userId: string, query: GetSurveyInboxQueryDto) {
    const { page = 1, itemPerPage = 10, status } = query;
    const where: Prisma.SurveyResponseWhereInput = {
      userId,
      ...(status ? { status } : {}),
      survey: { deletedAt: null },
    };
    const [totalItems, list] = await Promise.all([
      this.prisma.surveyResponse.count({ where }),
      this.prisma.surveyResponse.findMany({
        where,
        skip: (page - 1) * itemPerPage,
        take: itemPerPage,
        select: this.responsePromptSelect(),
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      list,
      page,
      itemPerPage,
      totalItems,
      totalPages: Math.ceil(totalItems / itemPerPage) || 1,
    };
  }

  async getInboxDetail(responseId: string, userId: string) {
    const response = await this.getResponse(responseId, userId);
    this.assertResponseAvailable(response);
    return response;
  }

  async openResponse(responseId: string, userId: string) {
    const response = await this.getResponse(responseId, userId);
    this.assertResponseAvailable(response);
    if (!response.openedAt) {
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.surveyResponse.update({
          where: { id: responseId },
          data: { openedAt: new Date() },
          select: this.responsePromptSelect(),
        });
        await tx.notification.updateMany({
          where: { surveyResponseId: responseId, userId },
          data: { isRead: true, readAt: new Date() },
        });
        return updated;
      });
    }
    return response;
  }

  async submitResponse(
    responseId: string,
    userId: string,
    dto: SubmitSurveyDto,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const response = await tx.surveyResponse.findFirst({
          where: { id: responseId, userId },
          include: {
            survey: {
              include: {
                questions: {
                  orderBy: { position: 'asc' },
                  include: { options: { orderBy: { position: 'asc' } } },
                },
              },
            },
            answers: { select: { id: true }, take: 1 },
          },
        });
        if (!response) throw new NotFoundException('Khảo sát không tồn tại');
        this.assertResponseAvailable(response);
        if (response.answers.length) {
          throw new ConflictException('Khảo sát đã được trả lời');
        }
        const answers = this.buildAnswerRows(
          response.survey.questions,
          dto.answers,
        );
        const now = new Date();
        const updated = await tx.surveyResponse.update({
          where: { id: responseId },
          data: {
            status: SurveyResponseStatus.submitted,
            submittedAt: now,
            answers: { createMany: { data: answers } },
          },
          include: {
            answers: {
              include: { question: true, option: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        });
        await tx.notification.updateMany({
          where: { surveyResponseId: responseId, userId },
          data: { isRead: true, readAt: now },
        });
        return updated;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Khảo sát đã được trả lời');
      }
      throw error;
    }
  }

  async skipResponse(responseId: string, userId: string) {
    const response = await this.getResponse(responseId, userId);
    this.assertResponseAvailable(response);
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.surveyResponse.update({
        where: { id: responseId },
        data: { status: SurveyResponseStatus.skipped, skippedAt: now },
      });
      await tx.notification.updateMany({
        where: { surveyResponseId: responseId, userId },
        data: { isRead: true, readAt: now },
      });
      return updated;
    });
  }

  async listPendingForOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      select: { id: true },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    return this.prisma.surveyResponse.findMany({
      where: {
        orderId,
        userId,
        status: SurveyResponseStatus.pending,
        survey: this.availableWhere(),
      },
      select: this.responsePromptSelect(),
      orderBy: { createdAt: 'asc' },
    });
  }

  async submit(
    surveyId: string,
    orderId: string,
    userId: string,
    dto: SubmitSurveyDto,
  ) {
    const response = await this.findOrderResponse(surveyId, orderId, userId);
    return this.submitResponse(response.id, userId, dto);
  }

  async skip(surveyId: string, orderId: string, userId: string) {
    const response = await this.findOrderResponse(surveyId, orderId, userId);
    return this.skipResponse(response.id, userId);
  }

  async getMyResponse(surveyId: string, orderId: string, userId: string) {
    const response = await this.prisma.surveyResponse.findFirst({
      where: {
        surveyId,
        orderId,
        userId,
        status: SurveyResponseStatus.submitted,
      },
      include: {
        survey: { select: { id: true, title: true, status: true } },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                type: true,
                required: true,
                position: true,
              },
            },
            option: { select: { id: true, content: true, position: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!response) {
      throw new NotFoundException('Bạn chưa trả lời khảo sát này cho đơn hàng');
    }
    const grouped = new Map<
      string,
      {
        question: (typeof response.answers)[number]['question'];
        textAnswer: string | null;
        ratingValue: number | null;
        options: Array<{ id: string; content: string; position: number }>;
      }
    >();
    for (const answer of response.answers) {
      const item = grouped.get(answer.questionId) ?? {
        question: answer.question,
        textAnswer: null,
        ratingValue: null,
        options: [],
      };
      item.textAnswer ??= answer.textAnswer;
      item.ratingValue ??= answer.ratingValue;
      if (answer.option) item.options.push(answer.option);
      grouped.set(answer.questionId, item);
    }
    return {
      id: response.id,
      survey: response.survey,
      submittedAt: response.submittedAt,
      answers: [...grouped.values()].sort(
        (left, right) => left.question.position - right.question.position,
      ),
    };
  }

  async getResults(
    id: string,
    user: UserInfo,
    { page = 1, itemPerPage = 10 }: GetSurveyResultsQueryDto,
  ) {
    const survey = await this.getSurveyForManagement(id);
    this.assertOwnerOrAdmin(survey.createdById, user);
    const interactionGroups = await this.prisma.surveyResponse.groupBy({
      by: ['status'],
      where: { surveyId: id },
      _count: { _all: true },
    });
    const interactionCounts = Object.fromEntries(
      Object.values(SurveyResponseStatus).map((status) => [
        status,
        interactionGroups.find((item) => item.status === status)?._count._all ??
          0,
      ]),
    ) as Record<SurveyResponseStatus, number>;
    const responseCount = interactionCounts[SurveyResponseStatus.submitted];

    const questions = await Promise.all(
      survey.questions.map(async (question) => {
        const base = {
          id: question.id,
          question: question.question,
          type: question.type,
          required: question.required,
          position: question.position,
        };
        const answerScope: Prisma.SurveyAnswerWhereInput = {
          questionId: question.id,
          response: { surveyId: id },
        };
        if (question.type === SurveyQuestionType.text) {
          const where: Prisma.SurveyAnswerWhereInput = {
            ...answerScope,
            textAnswer: { not: null },
          };
          const [totalItems, answers] = await Promise.all([
            this.prisma.surveyAnswer.count({ where }),
            this.prisma.surveyAnswer.findMany({
              where,
              skip: (page - 1) * itemPerPage,
              take: itemPerPage,
              select: {
                id: true,
                textAnswer: true,
                createdAt: true,
                response: {
                  select: { user: { select: { id: true, fullName: true } } },
                },
              },
              orderBy: { createdAt: 'desc' },
            }),
          ]);
          return {
            ...base,
            result: {
              list: answers,
              page,
              itemPerPage,
              totalItems,
              totalPages: Math.ceil(totalItems / itemPerPage) || 1,
            },
          };
        }
        if (question.type === SurveyQuestionType.rating) {
          const groups = await this.prisma.surveyAnswer.groupBy({
            by: ['ratingValue'],
            where: { ...answerScope, ratingValue: { not: null } },
            _count: { _all: true },
          });
          const distribution = [1, 2, 3, 4, 5].map((value) => ({
            value,
            count:
              groups.find((group) => group.ratingValue === value)?._count
                ._all ?? 0,
          }));
          const answeredCount = distribution.reduce(
            (sum, item) => sum + item.count,
            0,
          );
          return {
            ...base,
            result: {
              answeredCount,
              average: answeredCount
                ? distribution.reduce(
                    (sum, item) => sum + item.value * item.count,
                    0,
                  ) / answeredCount
                : 0,
              distribution,
            },
          };
        }
        const groups = await this.prisma.surveyAnswer.groupBy({
          by: ['optionId'],
          where: { ...answerScope, optionId: { not: null } },
          _count: { _all: true },
        });
        const counts = new Map(
          groups.map((group) => [group.optionId, group._count._all]),
        );
        return {
          ...base,
          result: {
            options: question.options.map((option) => {
              const count = counts.get(option.id) ?? 0;
              return {
                ...option,
                count,
                percentage: responseCount ? (count / responseCount) * 100 : 0,
              };
            }),
          },
        };
      }),
    );
    return {
      survey: {
        id: survey.id,
        title: survey.title,
        status: survey.status,
        scope: survey.scope,
        audienceType: survey.audienceType,
        triggerType: survey.triggerType,
        startDate: survey.startDate,
        endDate: survey.endDate,
      },
      responseCount,
      interactionCounts,
      responseRate:
        survey._count.responses > 0
          ? (responseCount / survey._count.responses) * 100
          : 0,
      questions,
    };
  }

  async deliverForOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
    triggerType: SurveyTriggerType,
  ) {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        details: {
          select: {
            productVariant: {
              select: {
                productColor: {
                  select: { product: { select: { vendorId: true } } },
                },
              },
            },
          },
        },
      },
    });
    const vendorIds = new Set(
      order.details.flatMap((detail) => {
        const id = detail.productVariant.productColor.product.vendorId;
        return id ? [id] : [];
      }),
    );
    const surveys = await tx.survey.findMany({
      where: {
        ...this.availableWhere(),
        triggerType,
        OR: [
          { createdBy: { role: UserRole.admin } },
          { createdById: { in: [...vendorIds] } },
        ],
      },
      include: { createdBy: { select: { id: true, role: true } } },
    });
    const eligible = surveys.filter((survey) => {
      if (survey.createdBy.role === UserRole.admin) {
        return (
          survey.audienceType === SurveyAudienceType.all_users ||
          survey.audienceType === SurveyAudienceType.all_system
        );
      }
      if (!vendorIds.has(survey.createdById)) return false;
      if (survey.audienceType === SurveyAudienceType.vendor_completed_buyers) {
        return order.status === OrderStatus.completed;
      }
      return survey.audienceType === SurveyAudienceType.vendor_buyers;
    });
    const notifications: NotificationPayload[] = [];
    for (const survey of eligible) {
      notifications.push(
        ...(await this.createResponses(tx, survey, [
          { userId: order.userId, orderId },
        ])),
      );
    }
    return notifications;
  }

  emitNotifications(notifications: NotificationPayload[]) {
    for (const notification of notifications) {
      this.realtime?.emitToUser(notification.userId, 'notification:created', {
        id: notification.id,
        type: NotificationType.survey_invitation,
        title: notification.title,
        content: notification.content,
        surveyId: notification.surveyId,
        responseId: notification.surveyResponseId,
        createdAt: notification.createdAt,
      });
    }
  }

  private async createResponses(
    tx: Prisma.TransactionClient,
    survey: DeliverySurvey,
    entries: DeliveryEntry[],
  ): Promise<NotificationPayload[]> {
    if (!entries.length) return [];
    const now = new Date();
    const rows = entries.map((entry) => ({
      surveyId: survey.id,
      userId: entry.userId,
      orderId: entry.orderId ?? null,
      deliveryKey: `${survey.id}:${entry.userId}:${entry.orderId ?? 'manual'}`,
      status: SurveyResponseStatus.pending,
      notifiedAt: now,
      expiresAt: survey.endDate,
    }));
    await tx.surveyResponse.createMany({ data: rows, skipDuplicates: true });
    const responses = await tx.surveyResponse.findMany({
      where: { deliveryKey: { in: rows.map((row) => row.deliveryKey) } },
      select: {
        id: true,
        userId: true,
        orderId: true,
        notification: { select: { id: true } },
      },
    });
    const withoutNotification = responses.filter((item) => !item.notification);
    if (!withoutNotification.length) return [];
    await tx.notification.createMany({
      data: withoutNotification.map((response) => ({
        userId: response.userId,
        surveyId: survey.id,
        surveyResponseId: response.id,
        type: NotificationType.survey_invitation,
        title: survey.title,
        content: survey.description,
        data: {
          responseId: response.id,
          surveyId: survey.id,
          orderId: response.orderId,
        },
        expiresAt: survey.endDate,
      })),
      skipDuplicates: true,
    });
    return tx.notification.findMany({
      where: {
        surveyResponseId: { in: withoutNotification.map((item) => item.id) },
      },
      select: {
        id: true,
        userId: true,
        title: true,
        content: true,
        surveyId: true,
        surveyResponseId: true,
        createdAt: true,
      },
    });
  }

  private async resolveManualRecipientIds(
    db: DatabaseClient,
    survey: DeliverySurvey,
  ) {
    const activeUserWhere = {
      status: UserStatus.active,
      deletedAt: null,
    } satisfies Prisma.UserWhereInput;
    if (survey.createdBy.role === UserRole.admin) {
      const roleFilter: Prisma.UserWhereInput =
        survey.audienceType === SurveyAudienceType.all_users
          ? { role: UserRole.customer }
          : survey.audienceType === SurveyAudienceType.all_vendors
            ? { role: UserRole.vendor }
            : { role: { in: [UserRole.customer, UserRole.vendor] } };
      const users = await db.user.findMany({
        where: { ...activeUserWhere, ...roleFilter },
        select: { id: true },
      });
      return users.map((item) => item.id);
    }
    const orders = await db.order.findMany({
      where: {
        status:
          survey.audienceType === SurveyAudienceType.vendor_completed_buyers
            ? OrderStatus.completed
            : { not: OrderStatus.cancelled },
        user: activeUserWhere,
        details: {
          some: {
            productVariant: {
              productColor: { product: { vendorId: survey.createdById } },
            },
          },
        },
      },
      select: { userId: true },
      distinct: ['userId'],
    });
    return orders.map((order) => order.userId);
  }

  private assertDeliveryRules(
    audienceType: SurveyAudienceType,
    triggerType: SurveyTriggerType,
    role: UserRole,
  ) {
    if (role === UserRole.vendor) {
      if (
        audienceType !== SurveyAudienceType.vendor_buyers &&
        audienceType !== SurveyAudienceType.vendor_completed_buyers
      ) {
        throw new ForbiddenException(
          'Vendor chỉ được gửi khảo sát cho khách đã mua sản phẩm của mình',
        );
      }
      if (
        triggerType === SurveyTriggerType.after_checkout &&
        audienceType === SurveyAudienceType.vendor_completed_buyers
      ) {
        throw new BadRequestException(
          'Khách giao thành công phải dùng after_order_completed hoặc manual',
        );
      }
      return;
    }
    if (
      audienceType !== SurveyAudienceType.all_users &&
      audienceType !== SurveyAudienceType.all_vendors &&
      audienceType !== SurveyAudienceType.all_system
    ) {
      throw new BadRequestException('Nhóm người nhận không hợp lệ với admin');
    }
    if (
      audienceType === SurveyAudienceType.all_vendors &&
      triggerType !== SurveyTriggerType.manual
    ) {
      throw new BadRequestException(
        'Khảo sát gửi vendor chỉ hỗ trợ trigger manual',
      );
    }
  }

  private async findOrderResponse(
    surveyId: string,
    orderId: string,
    userId: string,
  ) {
    const response = await this.prisma.surveyResponse.findFirst({
      where: { surveyId, orderId, userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (!response) {
      throw new BadRequestException('Khảo sát không dành cho đơn hàng này');
    }
    return response;
  }

  private async getResponse(id: string, userId: string) {
    const response = await this.prisma.surveyResponse.findFirst({
      where: { id, userId },
      select: this.responsePromptSelect(),
    });
    if (!response) throw new NotFoundException('Khảo sát không tồn tại');
    return response;
  }

  private assertResponseAvailable(response: {
    status: SurveyResponseStatus;
    expiresAt: Date | null;
    survey: {
      status: SurveyStatus;
      startDate: Date | null;
      endDate: Date | null;
    };
  }) {
    if (response.status !== SurveyResponseStatus.pending) {
      throw new BadRequestException('Khảo sát đã được xử lý');
    }
    const now = new Date();
    if (
      response.survey.status !== SurveyStatus.active ||
      (response.survey.startDate && response.survey.startDate > now) ||
      (response.survey.endDate && response.survey.endDate < now) ||
      (response.expiresAt && response.expiresAt < now)
    ) {
      throw new BadRequestException('Khảo sát chưa mở hoặc đã hết hạn');
    }
  }

  private async listManagement(
    baseWhere: Prisma.SurveyWhereInput,
    { page = 1, itemPerPage = 10, search, status }: GetSurveysQueryDto,
  ) {
    const where: Prisma.SurveyWhereInput = {
      ...baseWhere,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [totalItems, list] = await Promise.all([
      this.prisma.survey.count({ where }),
      this.prisma.survey.findMany({
        where,
        skip: (page - 1) * itemPerPage,
        take: itemPerPage,
        include: {
          createdBy: { select: { id: true, fullName: true, role: true } },
          _count: { select: { questions: true, responses: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      list,
      page,
      itemPerPage,
      totalItems,
      totalPages: Math.ceil(totalItems / itemPerPage) || 1,
    };
  }

  private async getSurveyForManagement(id: string) {
    const survey = await this.prisma.survey.findFirst({
      where: { id, deletedAt: null },
      include: this.managementInclude(),
    });
    if (!survey) throw new NotFoundException('Khảo sát không tồn tại');
    return survey;
  }

  private assertOwnerOrAdmin(createdById: string, user: UserInfo) {
    if (user.role !== UserRole.admin && createdById !== user.userID) {
      throw new ForbiddenException('Bạn không có quyền quản lý khảo sát này');
    }
  }

  private assertPublishable(survey: {
    questions: Array<SubmissionQuestion>;
    startDate: Date | null;
    endDate: Date | null;
  }) {
    if (!survey.questions.length) {
      throw new BadRequestException('Khảo sát phải có ít nhất một câu hỏi');
    }
    this.assertDateRange(survey.startDate, survey.endDate);
    if (survey.endDate && survey.endDate <= new Date()) {
      throw new BadRequestException('Ngày kết thúc khảo sát đã qua');
    }
  }

  private buildAnswerRows(
    questions: SubmissionQuestion[],
    submittedAnswers: SubmitSurveyAnswerInput[],
  ) {
    const questionsById = new Map(
      questions.map((question) => [question.id, question]),
    );
    const answersByQuestionId = new Map(
      submittedAnswers.map((answer) => [answer.questionId, answer]),
    );
    for (const answer of submittedAnswers) {
      if (!questionsById.has(answer.questionId)) {
        throw new BadRequestException(
          'Câu trả lời chứa câu hỏi không thuộc khảo sát',
        );
      }
    }
    const missing = questions.find(
      (question) => question.required && !answersByQuestionId.has(question.id),
    );
    if (missing) {
      throw new BadRequestException(
        `Câu hỏi "${missing.question}" là bắt buộc`,
      );
    }
    const rows: Array<{
      questionId: string;
      optionId?: string;
      textAnswer?: string;
      ratingValue?: number;
    }> = [];
    for (const question of questions) {
      const answer = answersByQuestionId.get(question.id);
      if (!answer) continue;
      if (question.type === SurveyQuestionType.text) {
        if (answer.textAnswer === undefined) {
          throw new BadRequestException(
            `Câu hỏi "${question.question}" yêu cầu câu trả lời văn bản`,
          );
        }
        rows.push({ questionId: question.id, textAnswer: answer.textAnswer });
        continue;
      }
      if (question.type === SurveyQuestionType.rating) {
        if (answer.ratingValue === undefined) {
          throw new BadRequestException(
            `Câu hỏi "${question.question}" yêu cầu điểm đánh giá`,
          );
        }
        rows.push({ questionId: question.id, ratingValue: answer.ratingValue });
        continue;
      }
      if (!answer.optionIds?.length) {
        throw new BadRequestException(
          `Câu hỏi "${question.question}" yêu cầu chọn phương án`,
        );
      }
      if (
        question.type === SurveyQuestionType.single_choice &&
        answer.optionIds.length !== 1
      ) {
        throw new BadRequestException(
          `Câu hỏi "${question.question}" chỉ được chọn một phương án`,
        );
      }
      const validOptionIds = new Set(
        question.options.map((option) => option.id),
      );
      if (answer.optionIds.some((id) => !validOptionIds.has(id))) {
        throw new BadRequestException(
          `Câu hỏi "${question.question}" chứa phương án không hợp lệ`,
        );
      }
      rows.push(
        ...answer.optionIds.map((optionId) => ({
          questionId: question.id,
          optionId,
        })),
      );
    }
    return rows;
  }

  private availableWhere(): Prisma.SurveyWhereInput {
    const now = new Date();
    return {
      deletedAt: null,
      status: SurveyStatus.active,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    };
  }

  private responsePromptSelect() {
    return {
      id: true,
      orderId: true,
      status: true,
      notifiedAt: true,
      openedAt: true,
      submittedAt: true,
      skippedAt: true,
      expiresAt: true,
      createdAt: true,
      survey: {
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          status: true,
          startDate: true,
          endDate: true,
          createdBy: { select: { id: true, fullName: true, role: true } },
          questions: {
            orderBy: { position: 'asc' as const },
            select: {
              id: true,
              question: true,
              type: true,
              required: true,
              position: true,
              options: {
                orderBy: { position: 'asc' as const },
                select: { id: true, content: true, position: true },
              },
            },
          },
        },
      },
    } satisfies Prisma.SurveyResponseSelect;
  }

  private surveyUpdateData(dto: UpdateSurveyDto): Prisma.SurveyUpdateInput {
    const data: Prisma.SurveyUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.audienceType !== undefined) data.audienceType = dto.audienceType;
    if (dto.triggerType !== undefined) data.triggerType = dto.triggerType;
    if (dto.startDate !== undefined)
      data.startDate = this.toDate(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = this.toDate(dto.endDate);
    return data;
  }

  private assertDateRange(
    startDate: Date | null | undefined,
    endDate: Date | null | undefined,
  ) {
    if (startDate && endDate && endDate <= startDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }
  }

  private toDate(value: string | null | undefined): Date | null | undefined {
    if (value === null || value === undefined) return value;
    return new Date(value);
  }

  private questionCreateData(question: SurveyQuestionInput) {
    return {
      question: question.question,
      type: question.type,
      required: question.required,
      position: question.position,
      options: question.options.length
        ? {
            create: question.options.map((option) => ({
              content: option.content,
              position: option.position,
            })),
          }
        : undefined,
    };
  }

  private managementInclude() {
    return {
      createdBy: { select: { id: true, fullName: true, role: true } },
      questions: {
        orderBy: { position: 'asc' as const },
        include: { options: { orderBy: { position: 'asc' as const } } },
      },
      _count: { select: { responses: true } },
    } satisfies Prisma.SurveyInclude;
  }
}
