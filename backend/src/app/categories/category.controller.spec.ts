import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationUtilService } from 'src/common/utils/paginaton-util/pagintion-util.service';
import { QueryUtilService } from 'src/common/utils/query-util/query-util.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { RealtimeService } from '../realtime/realtime.service';

describe('Category writes (HTTP validation regression)', () => {
  let app: INestApplication;
  const id = '11111111-1111-4111-8111-111111111111';
  const category = {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id, name: 'Giày thể thao', slug: 'giay-the-thao' }),
    update: jest.fn().mockResolvedValue({ id, name: 'Giày mới', slug: 'giay-the-thao' }),
    softDelete: jest.fn().mockResolvedValue({ count: 1 }),
  };
  const realtime = { emitCategoryUpdated: jest.fn() };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        CategoryService,
        PaginationUtilService,
        QueryUtilService,
        StringUtilService,
        { provide: PrismaService, useValue: { extended: { category } } },
        { provide: RealtimeService, useValue: realtime },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useLogger(false);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
  });

  afterEach(() => jest.clearAllMocks());
  afterAll(async () => app?.close());

  it('creates a category using a trimmed name and a generated slug', async () => {
    await request(app.getHttpServer())
      .post('/api/categories')
      .send({ name: '  Giày thể thao  ' })
      .expect(201);
    expect(category.create).toHaveBeenCalledWith({ data: { name: 'Giày thể thao', slug: 'giay-the-thao' } });
    expect(realtime.emitCategoryUpdated).toHaveBeenCalledWith(id);
  });

  it.each([
    {},
    { name: '   ' },
    { name: 123 },
    { name: 'a'.repeat(256) },
    { name: 'Giày', description: 'Unsupported database field' },
  ])('rejects invalid create data before it reaches Prisma: %j', async (body) => {
    await request(app.getHttpServer()).post('/api/categories').send(body).expect(400);
    expect(category.create).not.toHaveBeenCalled();
    expect(realtime.emitCategoryUpdated).not.toHaveBeenCalled();
  });

  it('returns conflict for a category whose slug already exists', async () => {
    category.findUnique.mockResolvedValueOnce({ id });
    await request(app.getHttpServer()).post('/api/categories').send({ name: 'Giày thể thao' }).expect(409);
    expect(category.create).not.toHaveBeenCalled();
    expect(realtime.emitCategoryUpdated).not.toHaveBeenCalled();
  });

  it('restores a deleted category when its name is created again', async () => {
    const deletedCategory = {
      id,
      name: 'Giày thể thao',
      slug: 'giay-the-thao',
      deletedAt: new Date(),
    };
    category.findUnique.mockResolvedValueOnce(deletedCategory);
    category.update.mockResolvedValueOnce({ ...deletedCategory, deletedAt: null });

    const response = await request(app.getHttpServer())
      .post('/api/categories')
      .send({ name: '  Giày thể thao  ' })
      .expect(201);

    expect(response.body).toMatchObject({ id, name: 'Giày thể thao', slug: 'giay-the-thao', deletedAt: null });
    expect(category.update).toHaveBeenCalledWith({
      where: { id },
      data: { name: 'Giày thể thao', deletedAt: null },
    });
    expect(category.create).not.toHaveBeenCalled();
    expect(realtime.emitCategoryUpdated).toHaveBeenCalledWith(id);
  });

  it('updates the category name without changing its existing slug', async () => {
    await request(app.getHttpServer()).patch(`/api/categories/${id}`).send({ name: '  Giày mới  ' }).expect(200);
    expect(category.update).toHaveBeenCalledWith({ where: { id }, data: { name: 'Giày mới' } });
    expect(realtime.emitCategoryUpdated).toHaveBeenCalledWith(id);
  });

  it('rejects unsupported fields on update before reaching Prisma', async () => {
    await request(app.getHttpServer())
      .patch(`/api/categories/${id}`)
      .send({ name: 'Giày mới', description: '' })
      .expect(400);
    expect(category.update).not.toHaveBeenCalled();
    expect(realtime.emitCategoryUpdated).not.toHaveBeenCalled();
  });

  it('notifies other clients after deleting a category', async () => {
    await request(app.getHttpServer()).delete(`/api/categories/${id}`).expect(200);
    expect(realtime.emitCategoryUpdated).toHaveBeenCalledWith(id);
  });

  it('does not notify clients when a database write fails', async () => {
    category.create.mockRejectedValueOnce(new Error('Database unavailable'));
    await request(app.getHttpServer()).post('/api/categories').send({ name: 'Giày' }).expect(500);
    expect(realtime.emitCategoryUpdated).not.toHaveBeenCalled();
  });
});
