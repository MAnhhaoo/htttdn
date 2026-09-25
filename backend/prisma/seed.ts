import { PrismaClient, UserRole, UserStatus, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu seed dữ liệu...');

  // 1. Tạo password mặc định cho tất cả user (ví dụ: 'admin123')
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  // 2. Tạo Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      fullName: 'Admin System',
      role: UserRole.admin,
      status: UserStatus.active,
      phone: '0900000001',
      address: 'Hanoi',
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'nike@vendor.com' },
    update: {},
    create: {
      email: 'nike@vendor.com',
      password: hashedPassword,
      fullName: 'Nike Official',
      role: UserRole.seller,
      status: UserStatus.active,
      phone: '0911111111',
      address: 'HCM',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password: hashedPassword,
      fullName: 'John Doe',
      role: UserRole.customer,
      status: UserStatus.active,
      phone: '0988888881',
      address: 'Hanoi',
    },
  });

  console.log('Đã tạo users:', admin.email, seller.email, customer.email);

  // 3. Tạo Categories
  const catSneakers = await prisma.category.upsert({
    where: { slug: 'sneakers' },
    update: {},
    create: { name: 'Sneakers', slug: 'sneakers' },
  });

  const catRunning = await prisma.category.upsert({
    where: { slug: 'running-shoes' },
    update: {},
    create: { name: 'Running Shoes', slug: 'running-shoes' },
  });

  const catBasketball = await prisma.category.upsert({
    where: { slug: 'basketball' },
    update: {},
    create: { name: 'Basketball Shoes', slug: 'basketball' },
  });

  const catLifestyle = await prisma.category.upsert({
    where: { slug: 'lifestyle' },
    update: {},
    create: { name: 'Lifestyle', slug: 'lifestyle' },
  });

  const catFootball = await prisma.category.upsert({
    where: { slug: 'football' },
    update: {},
    create: { name: 'Football Shoes', slug: 'football' },
  });

  console.log('Đã tạo categories:', catSneakers.name, catRunning.name, catBasketball.name, catLifestyle.name, catFootball.name);

  // 4. Tạo Products
  const productsData = [
    {
      categoryId: catSneakers.id,
      name: "Nike Air Force 1 '07",
      slug: 'nike-air-force-1-07',
      description: 'The radiance lives on in the Nike Air Force 1 07, the b-ball icon that puts a fresh spin on what you know best.',
      status: ProductStatus.active,
      colors: {
        create: [
          {
            color: 'White',
            imageUrls: ['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-mens-shoes-jBrhbr.png'],
            variants: { create: [{ size: '40', stock: 10, price: 2999000 }, { size: '41', stock: 15, price: 2999000 }, { size: '42', stock: 5, price: 2999000 }] },
          },
          {
            color: 'Black',
            imageUrls: ['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/120a31b0-efa7-41c7-9a84-87b1e56ab9c3/air-force-1-07-mens-shoes-jBrhbr.png'],
            variants: { create: [{ size: '41', stock: 12, price: 2999000 }, { size: '43', stock: 8, price: 2999000 }] },
          },
        ],
      },
    },
    {
      categoryId: catRunning.id,
      name: 'Nike Pegasus 40',
      slug: 'nike-pegasus-40',
      description: 'A springy ride for every run, the Peg’s familiar, just-for-you feel returns to help you accomplish your goals.',
      status: ProductStatus.active,
      colors: {
        create: [
          {
            color: 'Blue',
            imageUrls: ['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/288cf233-a8ee-4497-a7eb-948ff5b17409/pegasus-40-mens-road-running-shoes-MCWvzj.png'],
            variants: { create: [{ size: '40', stock: 20, price: 3500000 }, { size: '42', stock: 25, price: 3500000 }] },
          },
        ],
      },
    },
    {
      categoryId: catBasketball.id,
      name: 'Nike LeBron 21',
      slug: 'nike-lebron-21',
      description: 'The LeBron 21 is built for the next generation of hoopers.',
      status: ProductStatus.active,
      colors: {
        create: [
          {
            color: 'Abalone Pearl',
            imageUrls: ['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/e82200dc-c93d-4c3e-b9b2-3e28a47ff69b/lebron-21-basketball-shoes-5vw2W0.png'],
            variants: { create: [{ size: '41', stock: 5, price: 5999000 }, { size: '42', stock: 8, price: 5999000 }, { size: '44', stock: 3, price: 5999000 }] },
          },
        ],
      },
    },
    {
      categoryId: catRunning.id,
      name: 'Adidas Ultraboost Light',
      slug: 'adidas-ultraboost-light',
      description: 'Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever.',
      status: ProductStatus.active,
      colors: {
        create: [
          {
            color: 'Core Black',
            imageUrls: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/d4094aed9a574ffea04cafa4010a30b2_9366/Ultraboost_Light_Running_Shoes_Black_HQ6339_01_standard.jpg'],
            variants: { create: [{ size: '40', stock: 15, price: 4200000 }, { size: '42', stock: 22, price: 4200000 }] },
          },
          {
            color: 'Cloud White',
            imageUrls: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/8b49527ec3184518bb13afa4010a5624_9366/Ultraboost_Light_Running_Shoes_White_HQ6341_01_standard.jpg'],
            variants: { create: [{ size: '39', stock: 10, price: 4200000 }, { size: '41', stock: 18, price: 4200000 }] },
          },
        ],
      },
    },
    {
      categoryId: catLifestyle.id,
      name: 'Adidas Stan Smith',
      slug: 'adidas-stan-smith',
      description: 'Timeless appeal. Effortless style. Everyday versatility.',
      status: ProductStatus.active,
      colors: {
        create: [
          {
            color: 'White/Green',
            imageUrls: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/b47d77eba6f945ea8dabac210127b11e_9366/Stan_Smith_Shoes_White_FX5502_01_standard.jpg'],
            variants: { create: [{ size: '38', stock: 30, price: 2500000 }, { size: '39', stock: 20, price: 2500000 }, { size: '40', stock: 15, price: 2500000 }] },
          },
        ],
      },
    },
    {
      categoryId: catSneakers.id,
      name: 'Puma Suede Classic',
      slug: 'puma-suede-classic',
      description: 'The Suede has been changing the game since 1968.',
      status: ProductStatus.active,
      colors: {
        create: [
          {
            color: 'Black/White',
            imageUrls: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/352634/03/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Men\'s-Sneakers'],
            variants: { create: [{ size: '41', stock: 20, price: 2100000 }, { size: '42', stock: 15, price: 2100000 }] },
          },
          {
            color: 'Red/White',
            imageUrls: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/352634/05/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Men\'s-Sneakers'],
            variants: { create: [{ size: '40', stock: 10, price: 2100000 }, { size: '42', stock: 12, price: 2100000 }] },
          },
        ],
      },
    },
    {
      categoryId: catFootball.id,
      name: 'Nike Zoom Mercurial Superfly 9',
      slug: 'nike-zoom-mercurial-superfly-9',
      description: 'Look fast, play fast.',
      status: ProductStatus.active,
      colors: {
        create: [
          {
            color: 'Pink',
            imageUrls: ['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/183dbfa9-7c48-4394-bbfa-61c0de018d41/zoom-mercurial-superfly-9-elite-fg-firm-ground-soccer-cleats-VL1f5L.png'],
            variants: { create: [{ size: '42', stock: 6, price: 7999000 }, { size: '43', stock: 4, price: 7999000 }] },
          },
        ],
      },
    },
    {
      categoryId: catSneakers.id,
      name: 'Air Jordan 1 Retro High OG',
      slug: 'air-jordan-1-retro-high-og',
      description: 'Familiar but always fresh, the iconic Air Jordan 1 is remastered for today.',
      status: ProductStatus.active,
      colors: {
        create: [
          {
            color: 'Chicago',
            imageUrls: ['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/e983f4f0-4fa8-48b4-a2ed-426b64016a5b/air-jordan-1-retro-high-og-mens-shoes-JHpxkn.png'],
            variants: { create: [{ size: '41', stock: 2, price: 4999000 }, { size: '42', stock: 5, price: 4999000 }, { size: '43', stock: 3, price: 4999000 }] },
          },
        ],
      },
    },
  ];

  for (const prodData of productsData) {
    const product = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: {},
      create: prodData,
    });
    console.log('Đã tạo product:', product.name);
  }

  console.log('Seed dữ liệu thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
