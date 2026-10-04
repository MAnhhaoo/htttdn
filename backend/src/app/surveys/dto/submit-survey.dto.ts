import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SubmitSurveyAnswerSchema = z
  .object({
    questionId: z.uuid(),
    textAnswer: z.string().trim().min(1).max(10_000).optional(),
    optionIds: z.array(z.uuid()).min(1).max(100).optional(),
    ratingValue: z.number().int().min(1).max(5).optional(),
  })
  .strict()
  .superRefine((data, context) => {
    const suppliedValues = [
      data.textAnswer !== undefined,
      data.optionIds !== undefined,
      data.ratingValue !== undefined,
    ].filter(Boolean).length;

    if (suppliedValues !== 1) {
      context.addIssue({
        code: 'custom',
        message: 'Mỗi câu trả lời chỉ được dùng một loại dữ liệu',
      });
    }

    if (
      data.optionIds &&
      new Set(data.optionIds).size !== data.optionIds.length
    ) {
      context.addIssue({
        code: 'custom',
        path: ['optionIds'],
        message: 'Phương án trả lời không được trùng nhau',
      });
    }
  });

export const SubmitSurveySchema = z
  .object({
    answers: z.array(SubmitSurveyAnswerSchema).max(1000),
  })
  .strict()
  .superRefine((data, context) => {
    const questionIds = data.answers.map((answer) => answer.questionId);
    if (new Set(questionIds).size !== questionIds.length) {
      context.addIssue({
        code: 'custom',
        path: ['answers'],
        message: 'Mỗi câu hỏi chỉ được xuất hiện một lần',
      });
    }
  });

export class SubmitSurveyDto extends createZodDto(SubmitSurveySchema) {}

export type SubmitSurveyAnswerInput = z.infer<typeof SubmitSurveyAnswerSchema>;
