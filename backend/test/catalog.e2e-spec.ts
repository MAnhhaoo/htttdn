import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  Prisma,
  Product,
  ProductColor,
  ProductVariant,
  User,
} from '@prisma/client';
import { hashSync } from 'bcrypt';
import { readdir } from 'node:fs/promises';
import { Server } from 'node:http';
import { join } from 'node:path';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { initApp } from '../src/init';

describe('Product detail and variants (HTTP integration)', () => {
  let app: INestApplication;
  let users: User[];
  let products: Product[];
  let colors: ProductColor[];
  let variants: ProductVariant[];

  const ids = {
    vendor: '11111111-1111-4111-8111-111111111111',
    vendorB: '99999999-9999-4999-8999-999999999999',
    customer: '22222222-2222-4222-8222-222222222222',
    product: '33333333-3333-4333-8333-333333333333',
    color: '44444444-4444-4444-8444-444444444444',
    variant: '55555555-5555-4555-8555-555555555555',
    deletedVariant: '66666666-6666-4666-8666-666666666666',
  };

  const userDelegate = {
    findUnique: jest.fn(({ where, select, omit }) => {
      const user = users.find((item) =>
        Object.entries(where as Record<string, unknown>).every(
          ([key, value]) => item[key] === value,
        ),
      );
      if (!user) return null;
      return Object.fromEntries(
        Object.entries(user).filter(([key]) =>
          select ? select[key] === true : !omit?.[key],
        ),
      );
    }),
  };

  const productDelegate = {
    findUnique: jest.fn(({ where }) =>
      products.find((item) => item.id === where.id || item.slug === where.slug),
    ),
    findFirst: jest.fn(({ where, include }) => {
      const product = products.find(
        (item) =>
          item.id === where.id &&
          item.deletedAt === null &&
          (where.vendorId === undefined || item.vendorId === where.vendorId),
      );
      if (!product) return null;
      if (!include) return product;
      return {
        ...product,
        category: { id: product.categoryId, name: 'Shoes', slug: 'shoes' },
        colors: colors
          .filter((color) => color.productId === product.id && !color.deletedAt)
          .map((color) => ({
            ...color,
            variants: variants.filter(
              (variant) =>
                variant.productColorId === color.id && !variant.deletedAt,
            ),
          })),
      };
    }),
    create: jest.fn(({ data }) => {
      const product = {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        vendorId: data.vendor.connect.id,
        categoryId: data.category.connect.id,
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        status: data.status ?? 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as Product;
      products.push(product);
      return product;
    }),
    update: jest.fn(({ where, data }) => {
      const product = products.find(
        (item) =>
          item.id === where.id &&
          item.vendorId === where.vendorId &&
          item.deletedAt === where.deletedAt,
      );
      if (!product) throw new Error('Product not found');
      Object.assign(product, {
        ...data,
        ...(data.category ? { categoryId: data.category.connect.id } : {}),
      });
      return product;
    }),
  };

  const colorDelegate = {
    findFirst: jest.fn(({ where }) =>
      colors.find(
        (color) =>
          color.id === where.id &&
          (where.deletedAt === undefined ||
            color.deletedAt === where.deletedAt) &&
          !color.deletedAt &&
          products.some(
            (product) =>
              product.id === color.productId &&
              !product.deletedAt &&
              (where.product?.vendorId === undefined ||
                product.vendorId === where.product.vendorId),
          ),
      ),
    ),
    findUnique: jest.fn(({ where }) =>
      colors.find(
        (color) =>
          color.id === where.id ||
          (color.productId === where.productId_color?.productId &&
            color.color === where.productId_color?.color),
      ),
    ),
    create: jest.fn(({ data }) => {
      const color = {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        productId: data.product.connect.id,
        color: data.color,
        imageUrls: data.imageUrls,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as ProductColor;
      colors.push(color);
      return color;
    }),
    update: jest.fn(({ where, data }) => {
      const color = colors.find(
        (item) =>
          item.id === where.id &&
          (where.productId === undefined || item.productId === where.productId),
      );
      if (!color) throw new Error('Color not found');
      Object.assign(color, data);
      return color;
    }),
  };

  const rawColorDelegate = {
    findFirst: jest.fn(({ where }) =>
      colors.find(
        (color) =>
          color.id === where.id &&
          products.some(
            (product) =>
              product.id === color.productId &&
              !product.deletedAt &&
              product.vendorId === where.product.vendorId,
          ),
      ),
    ),
  };

  const variantDelegate = {
    findFirst: jest.fn(({ where }) =>
      variants.find((variant) => {
        if (variant.deletedAt) return false;
        if (typeof where.id === 'string' && variant.id !== where.id)
          return false;
        if (where.id?.not && variant.id === where.id.not) return false;
        if (
          where.productColorId &&
          variant.productColorId !== where.productColorId
        )
          return false;
        if (where.size && variant.size !== where.size) return false;
        if (where.productColor) {
          const color = colors.find(
            (item) => item.id === variant.productColorId && !item.deletedAt,
          );
          if (!color) return false;
          if (
            !products.some(
              (product) =>
                product.id === color.productId &&
                !product.deletedAt &&
                (where.productColor.product?.vendorId === undefined ||
                  product.vendorId === where.productColor.product.vendorId),
            )
          )
            return false;
        }
        return true;
      }),
    ),
    findMany: jest.fn(({ where }) =>
      variants.filter(
        (variant) =>
          variant.productColorId === where.productColorId && !variant.deletedAt,
      ),
    ),
    create: jest.fn(({ data }) => {
      const variant = {
        id: '77777777-7777-4777-8777-777777777777',
        productColorId: data.productColor.connect.id,
        size: data.size,
        price: data.price,
        stock: data.stock,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as ProductVariant;
      variants.push(variant);
      return variant;
    }),
    update: jest.fn(({ where, data }) => {
      const variant = variants.find((item) => item.id === where.id);
      if (!variant) throw new Error('Variant not found');
      Object.assign(variant, data);
      return variant;
    }),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({
        user: userDelegate,
        product: productDelegate,
        productColor: rawColorDelegate,
        productVariant: variantDelegate,
        extended: {
          user: userDelegate,
          product: productDelegate,
          productColor: colorDelegate,
          productVariant: variantDelegate,
        },
      })
      .compile();
    app = module.createNestApplication();
    app.useLogger(false);
    initApp(app);
    await app.init();
  });

  beforeEach(() => {
    const now = new Date();
    users = (['vendor', 'vendorB', 'customer'] as const).map((identity) => ({
      id: ids[identity],
      role: identity === 'vendorB' ? 'vendor' : identity,
      email: `${identity.toLowerCase()}@example.com`,
      fullName: identity,
      password: hashSync('Test-password-123!', 4),
      status: 'active',
      deletedAt: null,
      phone: null,
      address: null,
      createdBy: null,
      createdAt: now,
      updatedAt: now,
    }));
    products = [
      {
        id: ids.product,
        vendorId: ids.vendor,
        categoryId: '88888888-8888-4888-8888-888888888888',
        name: 'Sneaker',
        slug: 'sneaker',
        description: null,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ];
    colors = [
      {
        id: ids.color,
        productId: ids.product,
        color: 'Black',
        imageUrls: [],
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ];
    variants = [
      {
        id: ids.variant,
        productColorId: ids.color,
        size: 'M',
        price: new Prisma.Decimal(150),
        stock: 3,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: ids.deletedVariant,
        productColorId: ids.color,
        size: 'L',
        price: new Prisma.Decimal(160),
        stock: 1,
        createdAt: now,
        updatedAt: now,
        deletedAt: now,
      },
    ];
    jest.clearAllMocks();
  });

  afterAll(async () => app?.close());

  const server = (): Server => app.getHttpServer() as Server;

  const token = async (role: 'vendor' | 'vendorB' | 'customer') => {
    const response = await request(server())
      .post('/api/auth/sign-in')
      .send({ email: `${role}@example.com`, password: 'Test-password-123!' })
      .expect(201);
    return response.body.data.accessToken as string;
  };

  it('returns product detail with only active colors and variants', async () => {
    const accessToken = await token('customer');
    const response = await request(server())
      .get(`/api/products/${ids.product}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(200);
    expect(response.body.category.slug).toBe('shoes');
    expect(response.body.colors[0].variants.map((item) => item.id)).toEqual([
      ids.variant,
    ]);
    expect(
      productDelegate.findFirst.mock.calls[0][0].include.colors.include.variants
        .where,
    ).toEqual({
      deletedAt: null,
    });
  });

  it('lists variants by color and hides deleted records', async () => {
    const accessToken = await token('customer');
    const response = await request(server())
      .get(`/api/productVariant/productColor/${ids.color}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(200);
    expect(response.body.map((item) => item.id)).toEqual([ids.variant]);
    expect(variantDelegate.findMany.mock.calls[0][0].orderBy).toEqual({
      createdAt: 'asc',
    });
  });

  it('validates vendor updates and rejects duplicate sizes', async () => {
    const accessToken = await token('vendor');
    await request(server())
      .patch(`/api/productVariant/${ids.variant}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ stock: -1 })
      .expect(400);
    await request(server())
      .patch(`/api/productVariant/${ids.variant}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ productColorId: ids.color })
      .expect(400);
    await request(server())
      .patch(`/api/productVariant/${ids.variant}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ price: 100.123 })
      .expect(400);
    await request(server())
      .post('/api/productVariant')
      .auth(accessToken, { type: 'bearer' })
      .send({ productColorId: ids.color, size: 'S', price: 100 })
      .expect(201);
    await request(server())
      .patch(`/api/productVariant/${ids.variant}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ size: 'S' })
      .expect(409);
    const response = await request(server())
      .patch(`/api/productVariant/${ids.variant}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ size: ' XL ', price: 200.5, stock: 5 })
      .expect(200);
    expect(response.body).toMatchObject({ size: 'XL', price: 200.5, stock: 5 });
    await request(server())
      .post('/api/productVariant')
      .auth(accessToken, { type: 'bearer' })
      .send({ productColorId: ids.color, size: 'XL', price: 100 })
      .expect(409);
  });

  it('soft deletes variants and rejects repeated deletion', async () => {
    const accessToken = await token('vendor');
    await request(server())
      .delete(`/api/productVariant/${ids.variant}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(200);
    expect(variants[0].deletedAt).toBeInstanceOf(Date);
    await request(server())
      .delete(`/api/productVariant/${ids.variant}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(404);
    const response = await request(server())
      .get(`/api/productVariant/productColor/${ids.color}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(200);
    expect(response.body).toEqual([]);
  });

  it('enforces vendor permissions and rejects missing parents', async () => {
    const customerToken = await token('customer');
    await request(server())
      .patch(`/api/productVariant/${ids.variant}`)
      .auth(customerToken, { type: 'bearer' })
      .send({ stock: 4 })
      .expect(403);
    products[0].deletedAt = new Date();
    await request(server())
      .get(`/api/products/${ids.product}`)
      .auth(customerToken, { type: 'bearer' })
      .expect(404);
    await request(server())
      .get(`/api/productVariant/productColor/${ids.color}`)
      .auth(customerToken, { type: 'bearer' })
      .expect(404);
  });

  it('assigns a new product to the signed-in vendor and rejects owner spoofing', async () => {
    const accessToken = await token('vendorB');
    await request(server())
      .post('/api/products')
      .auth(accessToken, { type: 'bearer' })
      .send({
        name: 'New Sneaker',
        category: { connect: { id: products[0].categoryId } },
        vendorId: ids.vendor,
      })
      .expect(400);

    const response = await request(server())
      .post('/api/products')
      .auth(accessToken, { type: 'bearer' })
      .send({
        name: 'New Sneaker',
        category: { connect: { id: products[0].categoryId } },
      })
      .expect(201);
    expect(response.body.vendorId).toBe(ids.vendorB);
    expect(productDelegate.create.mock.calls[0][0].data.vendor.connect.id).toBe(
      ids.vendorB,
    );
  });

  it('blocks vendor B from changing vendor A products, colors and variants', async () => {
    const accessToken = await token('vendorB');
    await request(server())
      .patch(`/api/products/${ids.product}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ name: 'Hijacked' })
      .expect(404);
    await request(server())
      .delete(`/api/products/${ids.product}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(404);
    await request(server())
      .post('/api/productColors')
      .auth(accessToken, { type: 'bearer' })
      .send({ productId: ids.product, color: 'White' })
      .expect(404);
    await request(server())
      .patch(`/api/productColors/${ids.color}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ color: 'White' })
      .expect(404);
    await request(server())
      .delete(`/api/productColors/${ids.color}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(404);
    colors[0].deletedAt = new Date();
    await request(server())
      .patch(`/api/productColors/${ids.color}/restore`)
      .auth(accessToken, { type: 'bearer' })
      .expect(404);
    colors[0].deletedAt = null;
    await request(server())
      .post('/api/productVariant')
      .auth(accessToken, { type: 'bearer' })
      .send({ productColorId: ids.color, size: 'S', price: 100 })
      .expect(404);
    await request(server())
      .patch(`/api/productVariant/${ids.variant}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ stock: 10 })
      .expect(404);
    await request(server())
      .delete(`/api/productVariant/${ids.variant}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(404);
    expect(productDelegate.update).not.toHaveBeenCalled();
    expect(colorDelegate.update).not.toHaveBeenCalled();
    expect(variantDelegate.update).not.toHaveBeenCalled();
    expect(variants[0].stock).toBe(3);
  });

  it('keeps legacy products without an owner read-only for vendors', async () => {
    products[0].vendorId = null;
    const accessToken = await token('vendor');
    await request(server())
      .patch(`/api/products/${ids.product}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ name: 'Updated Sneaker' })
      .expect(404);
    await request(server())
      .post('/api/productColors')
      .auth(accessToken, { type: 'bearer' })
      .send({ productId: ids.product, color: 'White' })
      .expect(404);
  });

  it('removes uploaded files when a vendor targets another vendor color', async () => {
    const accessToken = await token('vendorB');
    const uploadDirectory = join(process.cwd(), 'uploads', 'products');
    const before = await readdir(uploadDirectory);
    await request(server())
      .post(`/api/productColors/${ids.color}/images`)
      .auth(accessToken, { type: 'bearer' })
      .attach('images', Buffer.from('test image'), {
        filename: 'test.png',
        contentType: 'image/png',
      })
      .expect(404);
    expect(await readdir(uploadDirectory)).toEqual(before);
  });

  it('allows the owner to update a product and color', async () => {
    const accessToken = await token('vendor');
    await request(server())
      .patch(`/api/products/${ids.product}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ name: 'Updated Sneaker' })
      .expect(200);
    await request(server())
      .patch(`/api/productColors/${ids.color}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ color: 'Blue' })
      .expect(200);
    expect(products[0].name).toBe('Updated Sneaker');
    expect(colors[0].color).toBe('Blue');
  });
});
