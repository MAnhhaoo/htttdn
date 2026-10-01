/**
 * Real product image URLs organised by category slug.
 *
 * Sources:
 *  • Unsplash (direct photo URLs — free, HTTPS, no watermark)
 *  • Pexels  (direct photo URLs — free, HTTPS, no watermark)
 *
 * Each URL is paired with a `verified` flag.
 * Run `npm run validate-images` to HEAD-check every URL.
 */

export interface ImageEntry {
  url: string;
  verified: boolean;
  credit: string;
}

export const PRODUCT_IMAGES: Record<string, ImageEntry[]> = {
  'thoi-trang-nam': [
    { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3f95?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'thoi-trang-nu': [
    { url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'giay-dep': [
    { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'balo-tui-xach': [
    { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'dien-thoai-phu-kien': [
    { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1580910051074-3eb694886571?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'may-tinh-laptop': [
    { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1629131726692-1acfc0d42e05?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'thiet-bi-dien-tu': [
    { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1558089687-f282d8956417?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'do-gia-dung': [
    { url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1631889993959-41b4e9c76fb6?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'nha-cua-doi-song': [
    { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'sac-dep': [
    { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'cham-soc-suc-khoe': [
    { url: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'the-thao-du-lich': [
    { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'sach-van-phong-pham': [
    { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'me-va-be': [
    { url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],

  'phu-kien-thoi-trang': [
    { url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=640&q=80', verified: false, credit: 'Unsplash' },
    { url: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=640&q=80', verified: false, credit: 'Unsplash' },
  ],
};
