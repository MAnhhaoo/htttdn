import {
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

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

  private generateData<T>(data: T, model: string) {
    const modelsGenSlug = ['Product', 'Category'];
    if (modelsGenSlug.includes(model)) {
      if (Array.isArray(data)) {
        const result = data.map((item) => ({
          ...item,
          ...(typeof item['name'] === 'string'
            ? { slug: this.stringUtilService.toSlug(item['name']) }
            : {}),
        })) as T;
        data = result;
      } else if (typeof data['name'] === 'string') {
        const slug = this.stringUtilService.toSlug(data['name']);
        return { ...data, slug };
      }
    }
    return data;
  }

  private readonly ACCOUNT_MODELS = ['Admin', 'Client', 'Vendor', 'Employee'];
  private readonly MODEL_FIELDS = new Map(
    Prisma.dmmf.datamodel.models.map((model) => [
      model.name,
      new Set(model.fields.map((field) => field.name)),
    ]),
  );

  private hasField(model: string, field: string) {
    return this.MODEL_FIELDS.get(model)?.has(field) ?? false;
  }

  private isSoftDeletable(model: string) {
    return !this.ACCOUNT_MODELS.includes(model) && this.hasField(model, 'deletedAt');
  }

  initExtended() {
    const hasDeletedAt = (model: string) => this.hasField(model, 'deletedAt');
    const extended = this.$extends({
      query: {
        $allModels: {
          findFirst: ({ args, query, model }) => {
            if (this.isSoftDeletable(model)) {
              args.where = { ...args.where, deletedAt: null };
            }
            return query(args);
          },
          findMany: ({ args, query, model }) => {
            if (this.isSoftDeletable(model)) {
              args.where = { ...args.where, deletedAt: null };
            }
            if (!args.orderBy) {
              const orderBy = ['updatedAt', 'createdAt']
                .filter((field) => this.hasField(model, field))
                .map((field) => ({ [field]: 'desc' as const }));
              if (orderBy.length) args.orderBy = orderBy;
            }
            return query(args);
          },
          create: ({ args, query, model }) => {
            args.data = this.generateData(args.data, model);
            return query(args);
          },
          createMany: ({ args, query, model }) => {
            args.data = this.generateData(args.data, model);
            return query(args);
          },
          createManyAndReturn: ({ args, query, model }) => {
            args.data = this.generateData(args.data, model);
            return query(args);
          },
          update: ({ args, query }) => {
            return query(args);
          },
          updateMany: ({ args, query }) => {
            return query(args);
          },
          count: ({ args, query, model }) => {
            if (this.isSoftDeletable(model)) {
              args.where = { ...args.where, deletedAt: null };
            }
            return query(args);
          },
          upsert: ({ args, query, model }) => {
            args.create = this.generateData(args.create, model);
            args.update = this.generateData(args.update, model);
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
          async softDelete<T>(
            this: T,
            where: Prisma.Args<T, 'deleteMany'>['where'],
          ) {
            const context: any = Prisma.getExtensionContext(this);
            if (!hasDeletedAt(context.$name)) {
              throw new Error(`${context.$name} does not support soft delete`);
            }
            const isAccount = [
              'Admin',
              'Client',
              'Vendor',
              'Employee',
            ].includes(context.$name);
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
            if (!hasDeletedAt(context.$name)) {
              throw new Error(`${context.$name} does not support restore`);
            }
            const isAccount = [
              'Admin',
              'Client',
              'Vendor',
              'Employee',
            ].includes(context.$name);
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

  /** Run an interactive transaction through the extended client. */
  async extendedTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): Promise<T> {
    return this.extended.$transaction(
      (tx) => callback(tx as unknown as Prisma.TransactionClient),
      options,
    );
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
