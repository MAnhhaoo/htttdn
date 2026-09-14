import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UserSchema } from '../../../generated/zod';
import { withResponse } from '../../../common/interceptors/format-response/format-response.util';
import { TokenKeys } from '../consts/jwt.const';

const SignInSchema = UserSchema.pick({ email: true, password: true });

const SignUpSchema = SignInSchema.merge(
  UserSchema.pick({ fullName: true, address: true }),
);

// HOC / HOF: nhận một hàm kahcs làm tham so
const SignInResponseSchema = withResponse(
  z.object({
    [TokenKeys.ACCESS_TOKEN_KEY]: z.string(),
    [TokenKeys.REFRESH_TOKEN_KEY]: z.string(),
  }),
);

class SignInDto extends createZodDto(SignInSchema) {}

class SignInResponseDto extends createZodDto(SignInResponseSchema) {}

class SignUpDto extends createZodDto(SignUpSchema) {}

export { SignInDto, SignInResponseDto, SignUpDto };
