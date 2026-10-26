import {
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { omit } from 'es-toolkit';

import { StringUtilService } from '../utils/string-util/string-util.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private _extended: ReturnType<typeof this.initExtended>;

  constructor(private stringUtilService: StringUtilService) {
    super({
      transactionOptions: {
        // This feature is not available on MongoDB, because MongoDB does not support isolation levels.
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      },
    });
    this.initExtended();
  }

  private omitData(value: any, excludeFields: string[] = []) {
    const isArray = Array.isArray(value);
    if (isArray) {
      const result = value.map((value: Record<string, any>) =>
        omit(value, excludeFields),
      );
      return result;
    }
    return omit(value, excludeFields);
  }

  private transferDataCreate(value) {
    const data: any = this.omitData(value, ['user', 'id', 'createdBy']);
    return data;
  }

  private generateData<T>(data: T, model: string) {
    const modelsGenSlug = ['Product', 'Category'];
    if (modelsGenSlug.includes(model)) {
      if (Array.isArray(data)) {
        const result = data.map((item) => ({
          ...item,
          slug: this.stringUtilService.toSlug(item['name']),
        })) as T;
        data = result;
      } else {
        const slug = this.stringUtilService.toSlug(data['name']);
        return { ...data, slug };
      }
    }
    return data;
  }

  private readonly JUNCTION_TABLES = ['RolePermission', 'UserVendorRole'];
  private readonly ACCOUNT_MODELS = ['Admin', 'Client', 'Vendor', 'Employee'];
  initExtended() {
    const extended = this.$extends({
      query: {
        $allModels: {
          findFirst: ({ args, query, model }) => {
            if (!this.ACCOUNT_MODELS.includes(model)) {
              args.where = { ...args.where, deletedAt: null };
            }
            return query(args);
          },
          findMany: ({ args, query, model }) => {
            if (!this.JUNCTION_TABLES.includes(model)) {
              if (!this.ACCOUNT_MODELS.includes(model)) {
                args.where = { ...args.where, deletedAt: null };
              }
              args.orderBy ??= [{ updatedAt: 'desc' }, { createdAt: 'desc' }];
            }
            return query(args);
          },
          create: ({ args, query, model }) => {
            const generateData = this.generateData(args.data, model);
            const transferData = this.transferDataCreate(generateData);
            args.data = transferData;
            return query(args);
          },
          createMany: ({ args, query, model }) => {
            const generateData = this.generateData(args.data, model);
            const transferData = this.transferDataCreate(generateData);
            args.data = transferData;
            return query(args);
          },
          createManyAndReturn: ({ args, query, model }) => {
            const generateData = this.generateData(args.data, model);
            const transferData = this.transferDataCreate(generateData);
            args.data = transferData;
            return query(args);
          },
          update: ({ args, query }) => {
            return query(args);
          },
          updateMany: ({ args, query }) => {
            return query(args);
          },
          count: ({ args, query, model }) => {
            if (!this.ACCOUNT_MODELS.includes(model)) {
              args.where = { ...args.where, deletedAt: null };
            }
            return query(args);
          },
          upsert: ({ args, query, model }) => {
            const generateCreateData = this.generateData(args.create, model);
            const transferCreateData =
              this.transferDataCreate(generateCreateData);
            args.create = transferCreateData;

            const generateUpdateData = this.generateData(args.update, model);
            const transferUpdateData =
              this.transferDataCreate(generateUpdateData);
            args.update = transferUpdateData;
            return query(args);
          },
          delete: async ({ args, query, model }) => {
            const record = await extended[model].findUnique({
              where: args.where,
            });
            if (!record) {
              throw new NotFoundException(`${model} not found for delete`);
            }
            return query(args);
          },
        },
      },
      model: {
        $allModels: {
          async export<T>(
            this: T,
            args: Prisma.Args<T, 'findMany'> = {} as any,
          ) {
            const context: any = Prisma.getExtensionContext(this);
            const FIELDS_EXCLUDE = ['id'];
            args.select ??= Object.keys(context.fields).reduce(
              (acc, field) => ({
                ...acc,
                [field]: FIELDS_EXCLUDE.includes(field) ? false : true,
              }),
              {},
            );

            const result = await context.findMany(args);
            return result;
          },
          async softDelete<T>(
            this: T,
            where: Prisma.Args<T, 'deleteMany'>['where'],
          ) {
            const context: any = Prisma.getExtensionContext(this);
            const isAccount = ['Admin', 'Client', 'Vendor', 'Employee'].includes(
              context.$name,
            );
            const result = await context.updateMany({
              data: isAccount
                ? { status: 'inactive', deletedAt: null }
                : { deletedAt: new Date() },
              where,
            });
            return result;
          },
          async restore<T>(
            this: T,
            where: Prisma.Args<T, 'updateMany'>['where'],
          ) {
            const context: any = Prisma.getExtensionContext(this);
            const isAccount = ['Admin', 'Client', 'Vendor', 'Employee'].includes(
              context.$name,
            );
            const result = await context.updateMany({
              data: isAccount
                ? { status: 'active', deletedAt: null }
                : { deletedAt: null },
              where,
            });
            return result;
          },
        },
      },
    });
    this._extended = extended;
    return extended;
  }

  get extended() {
    return this._extended;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
