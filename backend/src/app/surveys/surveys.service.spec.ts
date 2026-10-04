import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  SurveyQuestionType,
  SurveyAudienceType,
  SurveyResponseStatus,
  SurveyScope,
  SurveyStatus,
  SurveyTriggerType,
  UserRole,
} from '@prisma/client';

import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { SurveysService } from './surveys.service';

describe('SurveysService', () => {
  const vendorId = '11111111-1111-4111-8111-111111111111';
  const customerId = '22222222-2222-4222-8222-222222222222';
  const surveyId = '33333333-3333-4333-8333-333333333333';
  const questionId = '44444444-4444-4444-8444-444444444444';
  const optionOneId = '55555555-5555-4555-8555-555555555555';
  const optionTwoId = '66666666-6666-4666-8666-666666666666';

  const user = (userID: string, role: UserRole): UserInfo => ({
    userID,
    userEmail: `${role}@example.com`,
    fullName: role,
    phone: null,
    avatar: null,
    gender: null,
    address: null,
    role,
  });

  const managementSurvey = (createdById = vendorId) => ({
    id: surveyId,
    createdById,
    title: 'Khảo sát',
    description: null,
    imageUrl: null,
    scope: SurveyScope.vendor,
    audienceType: SurveyAudienceType.vendor_buyers,
    triggerType: SurveyTriggerType.manual,
    status: SurveyStatus.draft,
    startDate: null,
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdBy: { id: createdById, fullName: 'Vendor', role: UserRole.vendor },
    questions: [],
    _count: { responses: 0 },
  });

  it('creates a vendor survey as draft and assigns ownership from JWT', async () => {
    const create = jest.fn().mockResolvedValue(managementSurvey());
    const service = new SurveysService({
      survey: { create },
    } as unknown as PrismaService);

    await service.create(
      {
        title: 'Mức độ hài lòng',
        triggerType: SurveyTriggerType.manual,
        questions: [
          {
            question: 'Bạn hài lòng không?',
            type: SurveyQuestionType.rating,
            required: true,
            position: 0,
            options: [],
          },
        ],
      },
      user(vendorId, UserRole.vendor),
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          createdById: vendorId,
          status: SurveyStatus.draft,
          questions: {
            create: [
              expect.objectContaining({
                type: SurveyQuestionType.rating,
                required: true,
              }),
            ],
          },
        }),
      }),
    );
  });

  it('does not let an admin or another vendor edit survey content they did not create', async () => {
    const prisma = {
      survey: { findFirst: jest.fn().mockResolvedValue(managementSurvey()) },
    };
    const service = new SurveysService(prisma as unknown as PrismaService);

    await expect(
      service.update(
        surveyId,
        { title: 'Nội dung đã sửa' },
        user('77777777-7777-4777-8777-777777777777', UserRole.admin),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('stores every selected option of a multiple-choice answer in its own row', async () => {
    const tx = {
      surveyResponse: {
        findFirst: jest.fn().mockResolvedValue({
          id: '77777777-7777-4777-8777-777777777777',
          status: SurveyResponseStatus.pending,
          expiresAt: null,
          answers: [],
          survey: {
            ...managementSurvey(),
            status: SurveyStatus.active,
            questions: [
              {
                id: questionId,
                question: 'Chọn màu yêu thích',
                type: SurveyQuestionType.multiple_choice,
                required: true,
                position: 0,
                options: [
                  { id: optionOneId, content: 'Đen', position: 0 },
                  { id: optionTwoId, content: 'Trắng', position: 1 },
                ],
              },
            ],
          },
        }),
        update: jest.fn().mockResolvedValue({ id: 'response-id' }),
      },
      notification: { updateMany: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
      ),
    };
    const service = new SurveysService(prisma as unknown as PrismaService);

    await service.submitResponse(
      '77777777-7777-4777-8777-777777777777',
      customerId,
      {
        answers: [{ questionId, optionIds: [optionOneId, optionTwoId] }],
      },
    );

    expect(tx.surveyResponse.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          submittedAt: expect.any(Date) as Date,
          answers: {
            createMany: {
              data: [
                { questionId, optionId: optionOneId },
                { questionId, optionId: optionTwoId },
              ],
            },
          },
        }),
      }),
    );
  });

  it('rejects a submission that omits a required question', async () => {
    const tx = {
      surveyResponse: {
        findFirst: jest.fn().mockResolvedValue({
          id: '77777777-7777-4777-8777-777777777777',
          status: SurveyResponseStatus.pending,
          expiresAt: null,
          answers: [],
          survey: {
            ...managementSurvey(),
            status: SurveyStatus.active,
            questions: [
              {
                id: questionId,
                question: 'Nhận xét',
                type: SurveyQuestionType.text,
                required: true,
                position: 0,
                options: [],
              },
            ],
          },
        }),
        update: jest.fn(),
      },
      notification: { updateMany: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
      ),
    };
    const service = new SurveysService(prisma as unknown as PrismaService);

    await expect(
      service.submitResponse(
        '77777777-7777-4777-8777-777777777777',
        customerId,
        { answers: [] },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.surveyResponse.update).not.toHaveBeenCalled();
  });
});
