import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional} from '@nestjs/common';
import {
  NotificationType,
  OrderStatus,
  Prisma,
  SurveyAudienceType,
  SurveyQuestionType,
  SurveyResponseStatus,
  SurveyScope,
  SurveyStatus,
  SurveyTriggerType} from '@prisma/client';

import { RealtimeService } from 'src/app/realtime/realtime.service';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  formatPaginatedList,
  normalizePagination,
} from 'src/common/utils/paginaton-util/pagintion-util.service';
import {
  CreateSurveyDto,
  type SurveyQuestionInput} from './dto/create-survey.dto';
import {
  GetSurveyResultsQueryDto,
  GetSurveysQueryDto} from './dto/get-survey.dto';
import {
  SubmitSurveyDto,
  type SubmitSurveyAnswerInput} from './dto/submit-survey.dto';
import { GetSurveyInboxQueryDto } from './dto/survey-campaign.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import {
  CLIENT_TEMPLATES,
  VENDOR_TEMPLATES,
  SHOP_TEMPLATES,
} from './survey-templates.data';

type DatabaseClient = PrismaService | Prisma.TransactionClient;
type DeliveryEntry = { clientId: string; orderId?: string | null };
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
  adminId?: string, vendorId?: string;
  title: string;
  description: string | null;
  audienceType: SurveyAudienceType;
  triggerType: SurveyTriggerType;
  endDate: Date | null;
  createdBy: { id: string; role: 'admin' | 'client' | 'vendor' };
};
type NotificationPayload = {
  id: string;
  clientId: string | null;
  vendorId?: string | null;
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

  getTemplates(target?: string) {
    if (target === 'vendor') {
      return {
        topics: VENDOR_TEMPLATES.map((t) => t.topic),
        templates: VENDOR_TEMPLATES,
      };
    }
    if (target === 'shop') {
      return {
        topics: SHOP_TEMPLATES.map((t) => t.topic),
        templates: SHOP_TEMPLATES,
      };
    }
    return {
      topics: CLIENT_TEMPLATES.map((t) => t.topic),
      templates: CLIENT_TEMPLATES,
    };
  }

  async create(dto: CreateSurveyDto, user: UserInfo) {
    if (user.role !== 'admin' && user.role !== 'vendor') {
      throw new ForbiddenException('Chỉ admin hoặc vendor được tạo khảo sát');
    }
    const { questions, audienceType, triggerType, scope, status, ...fields } = dto;
    const resolvedAudience =
      audienceType ??
      (user.role === 'vendor'
        ? SurveyAudienceType.vendor_buyers
        : SurveyAudienceType.all_users);
    this.assertDeliveryRules(resolvedAudience, triggerType, user.role);
    const startDate = this.toDate(fields.startDate);
    const endDate = this.toDate(fields.endDate);
    this.assertDateRange(startDate, endDate);

    return this.prisma.survey.create({
      data: {
        ...fields,
        imageUrl: fields.imageUrl || null,
        startDate,
        endDate,
        audienceType: resolvedAudience,
        triggerType,
        scope:
          scope ??
          (user.role === 'vendor'
            ? SurveyScope.vendor
            : SurveyScope.platform),
        status: status ?? SurveyStatus.draft,
        adminId: user.role === 'admin' ? user.userID : undefined,
        vendorId: user.role === 'vendor' ? user.userID : undefined,
        questions: {
          create: questions.map((question) =>
            this.questionCreateData(question),
          ),
        },
      },
      include: this.managementInclude(),
    });
  }

  listMine(user: UserInfo, query: GetSurveysQueryDto) {
    const where = user.role === 'vendor' ? { vendorId: user.userID } : { adminId: user.userID };
    return this.listManagement(where, query);
  }

  listAll(query: GetSurveysQueryDto) {
    return this.listManagement({}, query);
  }

  async getManagementDetail(id: string, user: UserInfo) {
    const survey = await this.getSurveyForManagement(id);
    this.assertOwnerOrAdmin(survey, user);
    return survey;
  }

  async update(id: string, dto: UpdateSurveyDto, user: UserInfo) {
    const current = await this.getSurveyForManagement(id);
    this.assertOwnerOrAdmin(current, user);
    if (current.status !== SurveyStatus.draft) {
      throw new BadRequestException(
        'Chỉ được sửa khảo sát đang ở trạng thái nháp',
      );
    }
    if (dto.questions && current._count.responses > 0) {
      throw new ConflictException(
        'Không thể thay câu hỏi khi khảo sát đã có người tham gia',
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
          )};
      }
      return tx.survey.update({
        where: { id },
        data,
        include: this.managementInclude()});
    });
  }

  async changeStatus(id: string, status: SurveyStatus, user: UserInfo) {
    const survey = await this.getSurveyForManagement(id);
    this.assertOwnerOrAdmin(survey, user);
    if (survey.status === status) return survey;
    if (status === SurveyStatus.active) {
      this.assertPublishable(survey);
      const result = await this.prisma.$transaction(async (tx) => {
        const activeSurvey = await tx.survey.update({
          where: { id },
          data: { status: SurveyStatus.active },
          include: {
            admin: { select: { id: true, fullName: true } },
            vendor: { select: { id: true, fullName: true, storeName: true } },
          },
        });
        const recipients = await this.resolveManualRecipientIds(tx, activeSurvey);
        const notifications =
          activeSurvey.triggerType === SurveyTriggerType.manual
            ? await this.createResponses(tx, activeSurvey, recipients)
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
    this.assertOwnerOrAdmin(survey, user);
    return this.prisma.survey.update({
      where: { id },
      data: { status: SurveyStatus.closed, deletedAt: new Date() },
    });
  }

  private resolveActor(actor: UserInfo | string): {
    userId: string;
    role: UserInfo['role'];
  } {
    if (typeof actor === 'string') {
      return { userId: actor, role: 'client' };
    }
    return { userId: actor.userID, role: actor.role };
  }

  private mapVendorNotificationToInboxResponse(notif: any) {
    const meta =
      notif.data && typeof notif.data === 'object' && !Array.isArray(notif.data)
        ? (notif.data as Record<string, any>)
        : {};
    const status = (meta.status as SurveyResponseStatus) || SurveyResponseStatus.pending;
    return {
      id: notif.id,
      orderId: null,
      status,
      notifiedAt: notif.createdAt,
      openedAt: meta.openedAt ? new Date(meta.openedAt) : notif.readAt ?? null,
      submittedAt: meta.submittedAt ? new Date(meta.submittedAt) : null,
      skippedAt: meta.skippedAt ? new Date(meta.skippedAt) : null,
      expiresAt: notif.expiresAt,
      createdAt: notif.createdAt,
      answers: Array.isArray(meta.answers) ? meta.answers : [],
      survey: notif.survey,
    };
  }

  async listInbox(actor: UserInfo | string, query: GetSurveyInboxQueryDto) {
    const { userId, role } = this.resolveActor(actor);
    const { status } = query;
    const { page, itemPerPage, skip } = normalizePagination({
      page: query.page,
      itemPerPage: query.itemPerPage,
    });
    if (role === 'vendor') {
      const allNotifs = await this.prisma.notification.findMany({
        where: {
          vendorId: userId,
          type: NotificationType.survey_invitation,
          survey: { deletedAt: null },
        },
        include: {
          survey: {
            select: this.responsePromptSelect().survey.select,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      const mapped = allNotifs
        .map((n) => this.mapVendorNotificationToInboxResponse(n))
        .filter((item) => (!status ? true : item.status === status));
      const paged = mapped.slice(skip, skip + itemPerPage);
      return formatPaginatedList(paged, mapped.length, { page, itemPerPage });
    }
    const where: Prisma.SurveyResponseWhereInput = {
      clientId: userId,
      ...(status ? { status } : {}),
      survey: { deletedAt: null }};
    const [totalItems, list] = await Promise.all([
      this.prisma.surveyResponse.count({ where }),
      this.prisma.surveyResponse.findMany({
        where,
        skip,
        take: itemPerPage,
        select: this.responsePromptSelect(),
        orderBy: { createdAt: 'desc' }}),
    ]);
    return formatPaginatedList(list, totalItems, { page, itemPerPage });
  }

  async getInboxDetail(responseId: string, actor: UserInfo | string) {
    const { userId, role } = this.resolveActor(actor);
    if (role === 'vendor') {
      const notif = await this.prisma.notification.findFirst({
        where: {
          id: responseId,
          vendorId: userId,
          type: NotificationType.survey_invitation,
          survey: { deletedAt: null },
        },
        include: {
          survey: {
            select: this.responsePromptSelect().survey.select,
          },
        },
      });
      if (!notif) throw new NotFoundException('Khảo sát không tồn tại');
      return this.mapVendorNotificationToInboxResponse(notif);
    }
    const response = await this.getResponse(responseId, userId);
    return response;
  }

  async openResponse(responseId: string, actor: UserInfo | string) {
    const { userId, role } = this.resolveActor(actor);
    if (role === 'vendor') {
      const notif = await this.prisma.notification.findFirst({
        where: {
          id: responseId,
          vendorId: userId,
          type: NotificationType.survey_invitation,
          survey: { deletedAt: null },
        },
        include: {
          survey: {
            select: this.responsePromptSelect().survey.select,
          },
        },
      });
      if (!notif) throw new NotFoundException('Khảo sát không tồn tại');
      const meta =
        notif.data && typeof notif.data === 'object' && !Array.isArray(notif.data)
          ? { ...(notif.data as Record<string, any>) }
          : {};
      if (!meta.openedAt) {
        const now = new Date();
        meta.openedAt = now.toISOString();
        meta.status = meta.status || SurveyResponseStatus.pending;
        const updatedNotif = await this.prisma.notification.update({
          where: { id: responseId },
          data: {
            isRead: true,
            readAt: notif.readAt ?? now,
            data: meta,
          },
          include: {
            survey: {
              select: this.responsePromptSelect().survey.select,
            },
          },
        });
        return this.mapVendorNotificationToInboxResponse(updatedNotif);
      }
      return this.mapVendorNotificationToInboxResponse(notif);
    }
    const response = await this.getResponse(responseId, userId);
    if (!response.openedAt) {
      const now = new Date();
      await this.prisma.surveyResponse.updateMany({
        where: { id: responseId, clientId: userId, openedAt: null },
        data: { openedAt: now },
      });
      await this.prisma.notification.updateMany({
        where: { surveyResponseId: responseId, clientId: userId },
        data: { isRead: true, readAt: now },
      });
      return this.getResponse(responseId, userId);
    }
    return response;
  }

  async submitResponse(
    responseId: string,
    actor: UserInfo | string,
    dto: SubmitSurveyDto,
  ) {
    const { userId, role } = this.resolveActor(actor);
    if (role === 'vendor') {
      const notif = await this.prisma.notification.findFirst({
        where: {
          id: responseId,
          vendorId: userId,
          type: NotificationType.survey_invitation,
          survey: { deletedAt: null },
        },
        include: {
          survey: {
            include: {
              admin: { select: { id: true, fullName: true } },
              vendor: { select: { id: true, fullName: true, storeName: true } },
              questions: {
                orderBy: { position: 'asc' },
                include: { options: { orderBy: { position: 'asc' } } },
              },
            },
          },
        },
      });
      if (!notif || !notif.survey) {
        throw new NotFoundException('Khảo sát không tồn tại');
      }
      const meta =
        notif.data && typeof notif.data === 'object' && !Array.isArray(notif.data)
          ? { ...(notif.data as Record<string, any>) }
          : {};
      const currentStatus =
        (meta.status as SurveyResponseStatus) || SurveyResponseStatus.pending;
      if (
        currentStatus === SurveyResponseStatus.submitted ||
        (Array.isArray(meta.answers) && meta.answers.length > 0)
      ) {
        throw new ConflictException('Khảo sát đã được trả lời');
      }
      this.assertResponseAvailable({
        status: currentStatus,
        expiresAt: notif.expiresAt,
        survey: notif.survey,
      });
      const answerRows = this.buildAnswerRows(
        notif.survey.questions,
        dto.answers,
      );
      const now = new Date();
      const storedAnswers = answerRows.map((row, idx) => ({
        id: `${responseId}-ans-${idx + 1}`,
        questionId: row.questionId,
        optionId: row.optionId ?? null,
        textAnswer: row.textAnswer ?? null,
        ratingValue: row.ratingValue ?? null,
        createdAt: now.toISOString(),
      }));
      const nextMeta = {
        ...meta,
        surveyId: notif.surveyId,
        status: SurveyResponseStatus.submitted,
        openedAt: meta.openedAt || now.toISOString(),
        submittedAt: now.toISOString(),
        answers: storedAnswers,
      };
      const updatedNotif = await this.prisma.notification.update({
        where: { id: responseId },
        data: {
          isRead: true,
          readAt: notif.readAt ?? now,
          data: nextMeta,
        },
        include: {
          survey: {
            select: this.responsePromptSelect().survey.select,
          },
        },
      });
      return this.mapVendorNotificationToInboxResponse(updatedNotif);
    }
    try {
      return await this.prisma.$transaction(async (tx) => {
        const response = await tx.surveyResponse.findFirst({
          where: { id: responseId, clientId: userId },
          include: {
            survey: {
              include: {
                questions: {
                  orderBy: { position: 'asc' },
                  include: { options: { orderBy: { position: 'asc' } } }}}},
            answers: { select: { id: true }, take: 1 }}});
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
            answers: { createMany: { data: answers } }},
          include: {
            answers: {
              include: { question: true, option: true },
              orderBy: { createdAt: 'asc' }}}});
        await tx.notification.updateMany({
          where: { surveyResponseId: responseId, clientId: userId },
          data: { isRead: true, readAt: now }});
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

  async skipResponse(responseId: string, actor: UserInfo | string) {
    const { userId, role } = this.resolveActor(actor);
    if (role === 'vendor') {
      const notif = await this.prisma.notification.findFirst({
        where: {
          id: responseId,
          vendorId: userId,
          type: NotificationType.survey_invitation,
          survey: { deletedAt: null },
        },
        include: {
          survey: {
            select: this.responsePromptSelect().survey.select,
          },
        },
      });
      if (!notif || !notif.survey) {
        throw new NotFoundException('Khảo sát không tồn tại');
      }
      const meta =
        notif.data && typeof notif.data === 'object' && !Array.isArray(notif.data)
          ? { ...(notif.data as Record<string, any>) }
          : {};
      const currentStatus =
        (meta.status as SurveyResponseStatus) || SurveyResponseStatus.pending;
      this.assertResponseAvailable({
        status: currentStatus,
        expiresAt: notif.expiresAt,
        survey: notif.survey,
      });
      const now = new Date();
      const updatedNotif = await this.prisma.notification.update({
        where: { id: responseId },
        data: {
          isRead: true,
          readAt: notif.readAt ?? now,
          data: {
            ...meta,
            status: SurveyResponseStatus.skipped,
            skippedAt: now.toISOString(),
          },
        },
        include: {
          survey: {
            select: this.responsePromptSelect().survey.select,
          },
        },
      });
      return this.mapVendorNotificationToInboxResponse(updatedNotif);
    }
    const response = await this.getResponse(responseId, userId);
    this.assertResponseAvailable(response);
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.surveyResponse.update({
        where: { id: responseId },
        data: { status: SurveyResponseStatus.skipped, skippedAt: now }});
      await tx.notification.updateMany({
        where: { surveyResponseId: responseId, clientId: userId },
        data: { isRead: true, readAt: now }});
      return updated;
    });
  }

  async listPendingForOrder(orderId: string, clientId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, clientId },
      select: { id: true }});
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    return this.prisma.surveyResponse.findMany({
      where: {
        orderId,
        clientId,
        status: SurveyResponseStatus.pending,
        survey: this.availableWhere()},
      select: this.responsePromptSelect(),
      orderBy: { createdAt: 'asc' }});
  }

  async submit(
    surveyId: string,
    orderId: string,
    clientId: string,
    dto: SubmitSurveyDto,
  ) {
    const response = await this.findOrderResponse(surveyId, orderId, clientId);
    return this.submitResponse(response.id, clientId, dto);
  }

  async skip(surveyId: string, orderId: string, clientId: string) {
    const response = await this.findOrderResponse(surveyId, orderId, clientId);
    return this.skipResponse(response.id, clientId);
  }

  async getMyResponse(surveyId: string, orderId: string, clientId: string) {
    const response = await this.prisma.surveyResponse.findFirst({
      where: {
        surveyId,
        orderId,
        clientId,
        status: SurveyResponseStatus.submitted},
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
                position: true}},
            option: { select: { id: true, content: true, position: true } }},
          orderBy: { createdAt: 'asc' }}}});
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
        options: []};
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
      )};
  }

  async getResults(
    id: string,
    user: UserInfo,
    query: GetSurveyResultsQueryDto,
  ) {
    const { page, itemPerPage, skip } = normalizePagination({
      page: query.page,
      itemPerPage: query.itemPerPage,
    });
    const survey = await this.getSurveyForManagement(id);
    this.assertOwnerOrAdmin(survey, user);

    if (
      survey.audienceType === SurveyAudienceType.all_vendors &&
      this.prisma.notification?.findMany
    ) {
      const notifs = await this.prisma.notification.findMany({
        where: {
          surveyId: id,
          vendorId: { not: null },
        },
        include: {
          vendor: { select: { id: true, fullName: true, storeName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      const parsed = notifs.map((n) => {
        const meta =
          n.data && typeof n.data === 'object' && !Array.isArray(n.data)
            ? (n.data as Record<string, any>)
            : {};
        const status =
          (meta.status as SurveyResponseStatus) || SurveyResponseStatus.pending;
        return {
          notif: n,
          status,
          opened: Boolean(meta.openedAt || n.isRead || status === SurveyResponseStatus.submitted),
          answers: Array.isArray(meta.answers) ? meta.answers : [],
        };
      });
      const interactionCounts = Object.fromEntries(
        Object.values(SurveyResponseStatus).map((status) => [
          status,
          parsed.filter((item) => item.status === status).length,
        ]),
      ) as Record<SurveyResponseStatus, number>;
      const invitedCount = parsed.length;
      const openedCount = parsed.filter((item) => item.opened).length;
      const responseCount = interactionCounts[SurveyResponseStatus.submitted];
      const pendingCount = interactionCounts[SurveyResponseStatus.pending];
      const completionRate = invitedCount > 0 ? responseCount / invitedCount : 0;

      const submittedItems = parsed.filter(
        (item) => item.status === SurveyResponseStatus.submitted,
      );
      const questions = survey.questions.map((question) => {
        const base = {
          id: question.id,
          question: question.question,
          type: question.type,
          required: question.required,
          position: question.position,
        };
        const matchingAnswers = submittedItems.flatMap((item) =>
          item.answers
            .filter((a: any) => a.questionId === question.id)
            .map((a: any) => ({
              ...a,
              vendor: item.notif.vendor,
            })),
        );
        if (question.type === SurveyQuestionType.text) {
          const textRows = matchingAnswers
            .filter((a: any) => a.textAnswer !== null && a.textAnswer !== undefined)
            .map((a: any, idx: number) => ({
              id: a.id || `${question.id}-txt-${idx}`,
              textAnswer: a.textAnswer,
              createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
              response: {
                client: {
                  id: a.vendor?.id || '',
                  fullName:
                    a.vendor?.storeName || a.vendor?.fullName || 'Đối tác Vendor',
                },
              },
            }));
          const paged = textRows.slice(skip, skip + itemPerPage);
          return {
            ...base,
            result: formatPaginatedList(paged, textRows.length, {
              page,
              itemPerPage,
            }),
          };
        }
        if (question.type === SurveyQuestionType.rating) {
          const distribution = [1, 2, 3, 4, 5].map((value) => ({
            value,
            count: matchingAnswers.filter((a: any) => a.ratingValue === value)
              .length,
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
        return {
          ...base,
          result: {
            options: question.options.map((option) => {
              const count = matchingAnswers.filter(
                (a: any) => a.optionId === option.id,
              ).length;
              return {
                ...option,
                count,
                percentage: responseCount ? (count / responseCount) * 100 : 0,
              };
            }),
          },
        };
      });

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
        summary: {
          invitedCount,
          openedCount,
          responseCount,
          pendingCount,
          completionRate,
        },
        responseCount,
        interactionCounts,
        responseRate: completionRate * 100,
        questions,
      };
    }

    const interactionGroups = await this.prisma.surveyResponse.groupBy({
      by: ['status'],
      where: { surveyId: id },
      _count: { _all: true }});
    const interactionCounts = Object.fromEntries(
      Object.values(SurveyResponseStatus).map((status) => [
        status,
        interactionGroups.find((item) => item.status === status)?._count._all ??
          0,
      ]),
    ) as Record<SurveyResponseStatus, number>;
    const responseCount = interactionCounts[SurveyResponseStatus.submitted];
    const invitedCount = survey._count.responses;
    const pendingCount = interactionCounts[SurveyResponseStatus.pending] ?? 0;
    const openedCount = this.prisma.surveyResponse.count
      ? await this.prisma.surveyResponse.count({
          where: {
            surveyId: id,
            OR: [
              { openedAt: { not: null } },
              { status: SurveyResponseStatus.submitted },
            ],
          },
        })
      : responseCount;
    const completionRate =
      invitedCount > 0 ? responseCount / invitedCount : 0;

    const questions = await Promise.all(
      survey.questions.map(async (question) => {
        const base = {
          id: question.id,
          question: question.question,
          type: question.type,
          required: question.required,
          position: question.position};
        const answerScope: Prisma.SurveyAnswerWhereInput = {
          questionId: question.id,
          response: { surveyId: id }};
        if (question.type === SurveyQuestionType.text) {
          const where: Prisma.SurveyAnswerWhereInput = {
            ...answerScope,
            textAnswer: { not: null }};
          const [totalItems, answers] = await Promise.all([
            this.prisma.surveyAnswer.count({ where }),
            this.prisma.surveyAnswer.findMany({
              where,
              skip,
              take: itemPerPage,
              select: {
                id: true,
                textAnswer: true,
                createdAt: true,
                response: {
                  select: { client: { select: { id: true, fullName: true } } }}},
              orderBy: { createdAt: 'desc' }}),
          ]);
          return {
            ...base,
            result: formatPaginatedList(answers, totalItems, { page, itemPerPage })};
        }
        if (question.type === SurveyQuestionType.rating) {
          const groups = await this.prisma.surveyAnswer.groupBy({
            by: ['ratingValue'],
            where: { ...answerScope, ratingValue: { not: null } },
            _count: { _all: true }});
          const distribution = [1, 2, 3, 4, 5].map((value) => ({
            value,
            count:
              groups.find((group) => group.ratingValue === value)?._count
                ._all ?? 0}));
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
              distribution}};
        }
        const groups = await this.prisma.surveyAnswer.groupBy({
          by: ['optionId'],
          where: { ...answerScope, optionId: { not: null } },
          _count: { _all: true }});
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
                percentage: responseCount ? (count / responseCount) * 100 : 0};
            })}};
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
        endDate: survey.endDate},
      summary: {
        invitedCount,
        openedCount,
        responseCount,
        pendingCount,
        completionRate,
      },
      responseCount,
      interactionCounts,
      responseRate: completionRate * 100,
      questions};
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
                  select: { product: { select: { vendorId: true } } }}}}}}}});
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
          { adminId: { not: null } },
          { vendorId: { in: [...vendorIds] } },
        ],
      },
      include: {
        admin: { select: { id: true, fullName: true } },
        vendor: { select: { id: true, fullName: true, storeName: true } },
      },
    });
    const eligible = surveys.filter((survey) => {
      if (survey.adminId) {
        return (
          survey.audienceType === SurveyAudienceType.all_users ||
          survey.audienceType === SurveyAudienceType.all_system
        );
      }
      if (!survey.vendorId || !vendorIds.has(survey.vendorId)) return false;
      if (survey.audienceType === SurveyAudienceType.vendor_completed_buyers) {
        return order.status === OrderStatus.completed;
      }
      return survey.audienceType === SurveyAudienceType.vendor_buyers;
    });
    const notifications: NotificationPayload[] = [];
    for (const survey of eligible) {
      notifications.push(
        ...(await this.createResponses(tx, survey, [
          { clientId: order.clientId, orderId },
        ])),
      );
    }
    return notifications;
  }

  emitNotifications(notifications: NotificationPayload[]) {
    for (const notification of notifications) {
      const targetUserId = notification.clientId || notification.vendorId;
      if (!targetUserId) continue;
      this.realtime?.emitToUser(targetUserId, 'notification:created', {
        id: notification.id,
        type: NotificationType.survey_invitation,
        title: notification.title,
        content: notification.content,
        surveyId: notification.surveyId,
        responseId: notification.surveyResponseId ?? notification.id,
        createdAt: notification.createdAt});
    }
  }

  private async createResponses(
    tx: Prisma.TransactionClient,
    survey: any,
    entries: any[],
  ): Promise<NotificationPayload[]> {
    if (!entries.length) return [];
    const now = new Date();

    const clientEntries = entries.filter((e) => e.clientId);
    const vendorEntries = entries.filter((e) => e.vendorId);

    if (clientEntries.length) {
      const rows = clientEntries.map((entry) => ({
        surveyId: survey.id,
        clientId: entry.clientId,
        orderId: entry.orderId ?? null,
        deliveryKey: `${survey.id}:${entry.clientId}:${entry.orderId ?? 'manual'}`,
        status: SurveyResponseStatus.pending,
        notifiedAt: now,
        expiresAt: survey.endDate,
      }));
      await tx.surveyResponse.createMany({ data: rows, skipDuplicates: true });
      const responses = await tx.surveyResponse.findMany({
        where: { deliveryKey: { in: rows.map((r) => r.deliveryKey) } },
        select: { id: true, clientId: true, orderId: true, notification: { select: { id: true } } },
      });
      const withoutNotification = responses.filter((r) => !r.notification);
      if (withoutNotification.length) {
        await tx.notification.createMany({
          data: withoutNotification.map((response) => ({
            clientId: response.clientId,
            surveyId: survey.id,
            surveyResponseId: response.id,
            type: NotificationType.survey_invitation,
            title: survey.title,
            content: survey.description || 'Mời bạn tham gia khảo sát để đóng góp ý kiến.',
            data: {
              responseId: response.id,
              surveyId: survey.id,
              orderId: response.orderId,
            },
            expiresAt: survey.endDate,
          })),
          skipDuplicates: true,
        });
      }
    }

    if (vendorEntries.length) {
      await tx.notification.createMany({
        data: vendorEntries.map((entry) => ({
          vendorId: entry.vendorId,
          surveyId: survey.id,
          type: NotificationType.survey_invitation,
          title: `[MIVA gửi Đối tác] ${survey.title}`,
          content: survey.description || 'Ban quản trị MIVA trân trọng gửi khảo sát tới Quý Đối tác bán hàng.',
          data: {
            surveyId: survey.id,
            status: SurveyResponseStatus.pending,
          },
          expiresAt: survey.endDate,
        })),
        skipDuplicates: true,
      });
    }

    return tx.notification.findMany({
      where: { surveyId: survey.id },
      select: {
        id: true,
        clientId: true,
        vendorId: true,
        title: true,
        content: true,
        surveyId: true,
        surveyResponseId: true,
        createdAt: true,
      },
    }) as any;
  }

  private async resolveManualRecipientIds(
    db: DatabaseClient,
    survey: any,
  ): Promise<any[]> {
    if (survey.scope === SurveyScope.platform || survey.adminId) {
      if (survey.audienceType === SurveyAudienceType.all_vendors) {
        const vendors = await db.vendor.findMany({
          where: { status: 'active', deletedAt: null },
          select: { id: true },
        });
        return vendors.map((v) => ({ vendorId: v.id, clientId: null }));
      }
      const clients = await db.client.findMany({
        where: { status: 'active', deletedAt: null },
        select: { id: true },
      });
      return clients.map((c) => ({ clientId: c.id, orderId: null }));
    }

    const vendorId = survey.vendorId;
    const orders = await db.order.findMany({
      where: {
        status:
          survey.audienceType === SurveyAudienceType.vendor_completed_buyers
            ? OrderStatus.completed
            : { not: OrderStatus.cancelled },
        details: {
          some: {
            productVariant: {
              productColor: { product: { vendorId } },
            },
          },
        },
      },
      select: { clientId: true, id: true },
      distinct: ['clientId'],
    });

    return orders.map((order) => ({ clientId: order.clientId, orderId: order.id }));
  }

  private assertDeliveryRules(
    audienceType: SurveyAudienceType,
    triggerType: SurveyTriggerType,
    role: UserInfo['role'],
  ) {
    if (role === 'vendor') {
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
    clientId: string,
  ) {
    const response = await this.prisma.surveyResponse.findFirst({
      where: { surveyId, orderId, clientId },
      orderBy: { createdAt: 'desc' },
      select: { id: true }});
    if (!response) {
      throw new BadRequestException('Khảo sát không dành cho đơn hàng này');
    }
    return response;
  }

  private async getResponse(id: string, clientId: string) {
    const response = await this.prisma.surveyResponse.findFirst({
      where: { id, clientId },
      select: this.responsePromptSelect()});
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
      throw new BadRequestException('Khảo sát này đã được trả lời trước đó');
    }
    if (response.survey.status !== SurveyStatus.active) {
      throw new BadRequestException('Khảo sát hiện không hoạt động hoặc đã đóng');
    }
    const now = new Date();
    if (response.survey.startDate && response.survey.startDate > now) {
      throw new BadRequestException('Khảo sát chưa đến ngày bắt đầu');
    }
  }

  private async listManagement(
    baseWhere: Prisma.SurveyWhereInput,
    query: GetSurveysQueryDto,
  ) {
    const { search, status } = query;
    const { page, itemPerPage, skip } = normalizePagination({
      page: query.page,
      itemPerPage: query.itemPerPage,
    });
    const where: Prisma.SurveyWhereInput = {
      ...baseWhere,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ]}
        : {})};
    const [totalItems, list] = await Promise.all([
      this.prisma.survey.count({ where }),
      this.prisma.survey.findMany({
        where,
        skip,
        take: itemPerPage,
        include: {
          admin: { select: { id: true, fullName: true } }, vendor: { select: { id: true, fullName: true } },
          _count: { select: { questions: true, responses: true } }},
        orderBy: { createdAt: 'desc' }}),
    ]);
    const vendorSurveyIds = list
      .filter((s) => s.audienceType === SurveyAudienceType.all_vendors)
      .map((s) => s.id);
    if (vendorSurveyIds.length && this.prisma.notification?.findMany) {
      const vendorNotifs = await this.prisma.notification.findMany({
        where: {
          surveyId: { in: vendorSurveyIds },
          vendorId: { not: null },
        },
        select: { surveyId: true, data: true },
      });
      const submittedBySurvey = new Map<string, number>();
      for (const n of vendorNotifs) {
        if (!n.surveyId) continue;
        const meta =
          n.data && typeof n.data === 'object' && !Array.isArray(n.data)
            ? (n.data as Record<string, any>)
            : {};
        if (meta.status === SurveyResponseStatus.submitted) {
          submittedBySurvey.set(
            n.surveyId,
            (submittedBySurvey.get(n.surveyId) ?? 0) + 1,
          );
        }
      }
      for (const s of list) {
        if (s.audienceType === SurveyAudienceType.all_vendors) {
          s._count.responses = submittedBySurvey.get(s.id) ?? 0;
        }
      }
    }
    return formatPaginatedList(list, totalItems, { page, itemPerPage });
  }

  private async getSurveyForManagement(id: string) {
    const survey = await this.prisma.survey.findFirst({
      where: { id, deletedAt: null },
      include: this.managementInclude()});
    if (!survey) throw new NotFoundException('Khảo sát không tồn tại');
    return survey;
  }

  private assertOwnerOrAdmin(
    survey: { adminId?: string | null; vendorId?: string | null },
    user: UserInfo,
  ) {
    if (user.role === 'admin') return;
    if (user.role === 'vendor' && survey.vendorId === user.userID) return;
    throw new ForbiddenException('Bạn không có quyền quản lý khảo sát này');
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
          optionId})),
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
      ]};
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
      answers: {
        select: {
          id: true,
          questionId: true,
          optionId: true,
          textAnswer: true,
          ratingValue: true,
        },
      },
      survey: {
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          status: true,
          scope: true,
          startDate: true,
          endDate: true,
          admin: { select: { id: true, fullName: true } },
          vendor: { select: { id: true, fullName: true, storeName: true } },
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
                select: { id: true, content: true, position: true }}}}}}} satisfies Prisma.SurveyResponseSelect;
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
    if (value === null || value === undefined || value === '') return null;
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
              position: option.position}))}
        : undefined};
  }

  private managementInclude() {
    return {
      admin: { select: { id: true, fullName: true } }, vendor: { select: { id: true, fullName: true } },
      questions: {
        orderBy: { position: 'asc' as const },
        include: { options: { orderBy: { position: 'asc' as const } } }},
      _count: { select: { responses: true } }} satisfies Prisma.SurveyInclude;
  }
}
