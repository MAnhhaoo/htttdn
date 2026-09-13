import { PartialType, PickType } from '@nestjs/mapped-types';
import { Auth } from '../entities/auth.entity';
import { User } from '../../users/entities/user.entity';
// import { UserInfo } from '../../../common/decorators/user.decorator';

export class ForgotPasswordDto extends PartialType(
  PickType(Auth, ['email', 'phone']),
) {
  redirectTo: string;
}

export class ResetPasswordDto extends PickType(Auth, ['password']) {
  userID: User['id'];
  // user: UserInfo;
}
