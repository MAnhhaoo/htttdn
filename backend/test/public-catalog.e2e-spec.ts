import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'node:http';
import request from 'supertest';

import { AppModule } from '../src/app/app.module';
import { CategoryService } from '../src/app/categories/category.service';
import { ProductService } from '../src/app/products/products.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { initApp } from '../src/init';

describe('Public catalog (HTTP integration)', () => {
  let app: INestApplication;

  const productId = '33333333-3333-4333-8333-333333333333';
  const productService = {
    getProducts: jest.fn().mockResolvedValue({
      list: [{ id: productId, name: 'Sneaker' }],
      totalPages: 1,
      totalItems: 1,
    }),
    getProductsByCategory: jest.fn().mockResolvedValue({
      list: [{ id: productId, name: 'Sneaker' }],
      totalPages: 1,
      totalItems: 1,
    }),
    getProductById: jest
      .fn()
      .mockResolvedValue({ id: productId, name: 'Sneaker' }),
  };
  const categoryService = {
    getCategories: jest.fn().mockResolvedValue({
      list: [{ id: 'category-1', name: 'Shoes', slug: 'shoes' }],
      totalPages: 1,
      totalItems: 1,
    }),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({ extended: {} })
      .overrideProvider(ProductService)
      .useValue(productService)
      .overrideProvider(CategoryService)
      .useValue(categoryService)
      .compile();

    app = module.createNestApplication();
    app.useLogger(false);
    initApp(app);
    await app.init();
  });

  afterAll(async () => app?.close());

  const server = (): Server => app.getHttpServer() as Server;

  it('allows anonymous users to list and read products', async () => {
    await request(server()).get('/api/products').expect(200);
    await request(server()).get('/api/products/category/shoes').expect(200);
    await request(server()).get(`/api/products/${productId}`).expect(200);
  });

  it('allows anonymous users to list categories', async () => {
    const response = await request(server()).get('/api/categories').expect(200);

    expect(response.body.list[0].slug).toBe('shoes');
  });

  it('still protects catalog write operations', async () => {
    await request(server()).post('/api/products').send({}).expect(401);
    await request(server()).post('/api/categories').send({}).expect(401);
  });
});
