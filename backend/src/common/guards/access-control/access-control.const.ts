import { UserRole } from '@prisma/client';

export enum Actions {
  MANAGE = 'manage',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

export const ROLE_ACTION: Record<UserRole, Actions[]> = {
  [UserRole.admin]: [Actions.MANAGE],
  [UserRole.seller]: [
    Actions.CREATE,
    Actions.READ,
    Actions.DELETE,
    Actions.UPDATE,
  ],
  [UserRole.customer]: [Actions.READ],
};
