import {
  SurveyAudienceType,
  SurveyQuestionType,
  SurveyTriggerType,
} from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SurveyOptionInputSchema = z
  .object({
    content: z.string().trim().min(1).max(500),
    position: z.number().int().nonnegative(),
  })
  .strict();

export const SurveyQuestionInputSchema = z
  .object({
    question: z.string().trim().min(1).max(3000),
    type: z.enum(SurveyQuestionType),
    required: z.boolean().default(false),
    position: z.number().int().nonnegative(),
    options: z.array(SurveyOptionInputSchema).max(100).default([]),
  })
  .strict()
  .superRefine((data, context) => {
    const isChoice =
      data.type === SurveyQuestionType.single_choice ||
      data.type === SurveyQuestionType.multiple_choice;

    if (isChoice && data.options.length < 2) {
      context.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Câu hỏi lựa chọn phải có ít nhất hai phương án',
      });
    }

    if (!isChoice && data.options.length > 0) {
      context.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Câu hỏi text hoặc rating không được có phương án',
      });
    }

    const positions = data.options.map((option) => option.position);
    if (new Set(positions).size !== positions.length) {
      context.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Vị trí phương án không được trùng nhau',
      });
    }
  });

export const SurveyFieldsSchema = z
  .object({
    title: z.string().trim().min(1).max(255),
    description: z.string().trim().max(10_000).nullable().optional(),
    imageUrl: z.string().trim().url().max(1000).nullable().optional(),
    audienceType: z.enum(SurveyAudienceType).optional(),
    triggerType: z.enum(SurveyTriggerType).default(SurveyTriggerType.manual),
    startDate: z.iso.datetime({ offset: true }).nullable().optional(),
    endDate: z.iso.datetime({ offset: true }).nullable().optional(),
    questions: z.array(SurveyQuestionInputSchema).min(1).max(100),
  })
  .strict();

export function validateSurveyFields(
  data: Partial<z.infer<typeof SurveyFieldsSchema>>,
  context: z.RefinementCtx,
) {
  if (
    data.startDate &&
    data.endDate &&
    new Date(data.endDate) <= new Date(data.startDate)
  ) {
    context.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
    });
  }

  if (data.questions) {
    const positions = data.questions.map((question) => question.position);
    if (new Set(positions).size !== positions.length) {
      context.addIssue({
        code: 'custom',
        path: ['questions'],
        message: 'Vị trí câu hỏi không được trùng nhau',
      });
    }
  }
}

export const CreateSurveySchema =
  SurveyFieldsSchema.superRefine(validateSurveyFields);

export class CreateSurveyDto extends createZodDto(CreateSurveySchema) {}

export type SurveyQuestionInput = z.infer<typeof SurveyQuestionInputSchema>;
