export type UserRole = 'admin' | 'client' | 'vendor' | 'employee';


export enum Actions {
  MANAGE = 'manage',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

export const ROLE_ACTION: Record<UserRole, Actions[]> = {
  ['admin']: [Actions.MANAGE],
  ['employee']: [Actions.READ, Actions.UPDATE],
  ['vendor']: [
    Actions.CREATE,
    Actions.READ,
    Actions.DELETE,
    Actions.UPDATE,
  ],
  ['client']: [Actions.READ],
};
