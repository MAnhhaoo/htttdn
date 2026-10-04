import { createZodDto } from 'nestjs-zod';

import { SurveyFieldsSchema, validateSurveyFields } from './create-survey.dto';

export const UpdateSurveySchema = SurveyFieldsSchema.partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Cần gửi ít nhất một trường để cập nhật',
  })
  .superRefine(validateSurveyFields);

export class UpdateSurveyDto extends createZodDto(UpdateSurveySchema) {}
