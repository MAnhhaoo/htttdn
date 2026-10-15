import { PickType } from '@nestjs/mapped-types';
import { Client as User } from '../../clients/entities/client.entity';

export class Auth extends PickType(User, ['email', 'phone', 'password']) {}
