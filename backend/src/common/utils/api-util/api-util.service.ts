import { Injectable } from '@nestjs/common';
import { FormatResponseParams } from './dto/api-util.dto';

@Injectable()
export class ApiUtilService {
  formatResponse({
    errors = null,
    data = null,
    message = 'OK',
    ...params
  }: FormatResponseParams) {
    const messageData = data?.message;
    const firstErrorMessage = errors?.find(
      (error) => typeof error?.message === 'string' && error.message.trim(),
    )?.message;
    const messageDefault = errors ? firstErrorMessage || 'ERROR' : message;
    const messageResponse = messageData ? messageData : messageDefault;
    return {
      errors,
      data,
      message: messageResponse,
      ...params,
    };
  }
}
