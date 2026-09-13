--
-- PostgreSQL database dump
--

\restrict gQUYQTHVnW9TrIyxQSp4SiHAo9ztVAsxSyr1wO6bbMwWU25E0BSnRQfOp9nuMin

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: user_ecommerce
--

INSERT INTO public."User" VALUES ('d6d77053-92bc-7af6-3332-8bea8c4c6904', 'user1@gmail.com', '123456', '0900000001', 'active', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, NULL, 'Nam', 'Địa chỉ người dùng 1', 'Nguyễn Quản Trị', 'admin');
INSERT INTO public."User" VALUES ('3d58ce20-fe80-2793-e0b2-21905baa60b3', 'user2@gmail.com', '123456', '0900000002', 'active', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, NULL, 'Nữ', 'Địa chỉ người dùng 2', 'Trần Người Bán Một', 'seller');
INSERT INTO public."User" VALUES ('134ad24e-9980-6ca1-1119-7065657dbf5e', 'user3@gmail.com', '123456', '0900000003', 'active', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, NULL, 'Nam', 'Địa chỉ người dùng 3', 'Lê Người Bán Hai', 'seller');
INSERT INTO public."User" VALUES ('24b299d7-67a9-79b1-ef4b-2e634067c8ad', 'user4@gmail.com', '123456', '0900000004', 'active', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, NULL, 'Nữ', 'Địa chỉ người dùng 4', 'Phạm Khách Hàng Một', 'customer');
INSERT INTO public."User" VALUES ('39201609-d980-3efb-38f4-1f440309a429', 'user5@gmail.com', '123456', '0900000005', 'active', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, NULL, 'Nam', 'Địa chỉ người dùng 5', 'Hoàng Khách Hàng Hai', 'customer');


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: user_ecommerce
--

INSERT INTO public."Cart" VALUES ('a83008af-26e8-c1af-6abe-360b45f29165', 'd6d77053-92bc-7af6-3332-8bea8c4c6904', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');
INSERT INTO public."Cart" VALUES ('35f1c2f0-e09c-fee8-49de-e2dbe2e27cb4', '3d58ce20-fe80-2793-e0b2-21905baa60b3', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');
INSERT INTO public."Cart" VALUES ('d2514f2c-7639-625e-36e0-30ed5d2ecc99', '134ad24e-9980-6ca1-1119-7065657dbf5e', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');
INSERT INTO public."Cart" VALUES ('20bf22f3-5d6b-6e73-520b-4775e9752969', '24b299d7-67a9-79b1-ef4b-2e634067c8ad', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');
INSERT INTO public."Cart" VALUES ('efac19f7-0cf0-7fcc-f7f4-a74675b09836', '39201609-d980-3efb-38f4-1f440309a429', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: user_ecommerce
--

INSERT INTO public."Category" VALUES ('379c0f89-7db0-fa7e-004f-65f52cce2e75', 'Điện thoại', 'dien-thoai', NULL, '/images/categories/category-1.jpg', 'Mô tả danh mục số 1', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);
INSERT INTO public."Category" VALUES ('569debe8-b660-e3a9-2017-e93574cf456f', 'Laptop', 'laptop', NULL, '/images/categories/category-2.jpg', 'Mô tả danh mục số 2', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);
INSERT INTO public."Category" VALUES ('80213437-0399-4b4f-2333-426bb5050534', 'Thời trang nam', 'thoi-trang-nam', NULL, '/images/categories/category-3.jpg', 'Mô tả danh mục số 3', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);
INSERT INTO public."Category" VALUES ('fa9a1354-631a-4206-df34-291f0db8f42a', 'Thời trang nữ', 'thoi-trang-nu', NULL, '/images/categories/category-4.jpg', 'Mô tả danh mục số 4', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);
INSERT INTO public."Category" VALUES ('5afe272b-ca8e-731e-0871-c5b169760081', 'Phụ kiện', 'phu-kien', NULL, '/images/categories/category-5.jpg', 'Mô tả danh mục số 5', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: user_ecommerce
--

INSERT INTO public."Product" VALUES ('42f1e2fa-04bc-46d2-bd22-d11514db6623', 'Điện thoại Galaxy S26', 'dien-thoai-galaxy-s26', 'Mô tả sản phẩm số 1', '379c0f89-7db0-fa7e-004f-65f52cce2e75', '134ad24e-9980-6ca1-1119-7065657dbf5e', 'active', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);
INSERT INTO public."Product" VALUES ('07be8445-2cc6-57aa-bb55-b10dfd13c8ff', 'Laptop văn phòng Pro', 'laptop-van-phong-pro', 'Mô tả sản phẩm số 2', '569debe8-b660-e3a9-2017-e93574cf456f', '3d58ce20-fe80-2793-e0b2-21905baa60b3', 'active', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);
INSERT INTO public."Product" VALUES ('fb6b355a-2ee2-69a2-6225-6d8ef6f0de10', 'Áo thun nam basic', 'ao-thun-nam-basic', 'Mô tả sản phẩm số 3', '80213437-0399-4b4f-2333-426bb5050534', '134ad24e-9980-6ca1-1119-7065657dbf5e', 'active', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);
INSERT INTO public."Product" VALUES ('2731e44f-51d6-20a4-957d-26a99aa11492', 'Áo dài nữ truyền thống', 'ao-dai-nu-truyen-thong', 'Mô tả sản phẩm số 4', 'fa9a1354-631a-4206-df34-291f0db8f42a', '3d58ce20-fe80-2793-e0b2-21905baa60b3', 'active', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);
INSERT INTO public."Product" VALUES ('bb570e6e-7131-d4ae-9ca7-abbbb10aeb70', 'Tai nghe Bluetooth', 'tai-nghe-bluetooth', 'Mô tả sản phẩm số 5', '5afe272b-ca8e-731e-0871-c5b169760081', '134ad24e-9980-6ca1-1119-7065657dbf5e', 'active', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);
INSERT INTO public."Product" VALUES ('e670a882-c57b-4492-61aa-f9fd4d98942c', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'Điện thoại cao cấp, thiết kế sang trọng và hiệu năng mạnh mẽ', '379c0f89-7db0-fa7e-004f-65f52cce2e75', '3d58ce20-fe80-2793-e0b2-21905baa60b3', 'active', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL);
INSERT INTO public."Product" VALUES ('3ffb71ac-8124-c242-ba58-d777a4950494', 'Laptop Gaming Ultra X', 'laptop-gaming-ultra-x', 'Laptop gaming hiệu năng cao dành cho game và đồ họa', '569debe8-b660-e3a9-2017-e93574cf456f', '134ad24e-9980-6ca1-1119-7065657dbf5e', 'active', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL);
INSERT INTO public."Product" VALUES ('0a78cb6d-3d0a-cf83-166c-e214aa4f2ee4', 'Áo sơ mi nam Premium', 'ao-so-mi-nam-premium', 'Áo sơ mi nam chất liệu cao cấp, kiểu dáng hiện đại', '80213437-0399-4b4f-2333-426bb5050534', '3d58ce20-fe80-2793-e0b2-21905baa60b3', 'active', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL);
INSERT INTO public."Product" VALUES ('4ec5ab4b-133e-d62b-ceee-377248662a19', 'Áo dài nữ hoa sen', 'ao-dai-nu-hoa-sen', 'Áo dài nữ truyền thống với họa tiết hoa sen', 'fa9a1354-631a-4206-df34-291f0db8f42a', '134ad24e-9980-6ca1-1119-7065657dbf5e', 'active', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL);
INSERT INTO public."Product" VALUES ('57b3f2bb-e314-2319-9b40-38adf8a2d578', 'Tai nghe Bluetooth Pro', 'tai-nghe-bluetooth-pro', 'Tai nghe không dây chống ồn, âm thanh chất lượng cao', '5afe272b-ca8e-731e-0871-c5b169760081', '3d58ce20-fe80-2793-e0b2-21905baa60b3', 'active', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL);


--
-- Data for Name: ProductColor; Type: TABLE DATA; Schema: public; Owner: user_ecommerce
--

INSERT INTO public."ProductColor" VALUES ('a98ce51a-ee0a-f630-6626-47539b2f2d05', '42f1e2fa-04bc-46d2-bd22-d11514db6623', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, 'Đen', '/images/products/product-1.jpg');
INSERT INTO public."ProductColor" VALUES ('79a9f5f8-c034-31dc-e4f7-a60ce431bfa8', '07be8445-2cc6-57aa-bb55-b10dfd13c8ff', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, 'Bạc', '/images/products/product-2.jpg');
INSERT INTO public."ProductColor" VALUES ('05bdda59-76c7-70d0-ae81-593cdb3afc23', 'fb6b355a-2ee2-69a2-6225-6d8ef6f0de10', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, 'Trắng', '/images/products/product-3.jpg');
INSERT INTO public."ProductColor" VALUES ('a23ecc77-98f2-15c7-0987-3424b2552ed6', '2731e44f-51d6-20a4-957d-26a99aa11492', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, 'Hồng', '/images/products/product-4.jpg');
INSERT INTO public."ProductColor" VALUES ('035f9aad-a5a6-db0a-1bb9-9b2cadefa4fd', 'bb570e6e-7131-d4ae-9ca7-abbbb10aeb70', '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, 'Xanh', '/images/products/product-5.jpg');
INSERT INTO public."ProductColor" VALUES ('b4b3749c-7545-1921-5473-ca6175cd2506', 'e670a882-c57b-4492-61aa-f9fd4d98942c', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Đen', '/images/products/iphone-17-black.jpg');
INSERT INTO public."ProductColor" VALUES ('8dea1479-3027-c058-3b03-f9f49fc1aae3', 'e670a882-c57b-4492-61aa-f9fd4d98942c', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Bạc', '/images/products/iphone-17-silver.jpg');
INSERT INTO public."ProductColor" VALUES ('8e22e7a4-f4b4-c407-2126-287e7d03bf35', 'e670a882-c57b-4492-61aa-f9fd4d98942c', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Vàng', '/images/products/iphone-17-gold.jpg');
INSERT INTO public."ProductColor" VALUES ('7a818a25-ff8c-4788-ea46-f67d5247bc75', '3ffb71ac-8124-c242-ba58-d777a4950494', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Đen', '/images/products/laptop-ultra-black.jpg');
INSERT INTO public."ProductColor" VALUES ('8e0ed3cf-c1e8-4c4c-1d5f-8141096feffc', '3ffb71ac-8124-c242-ba58-d777a4950494', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Xám', '/images/products/laptop-ultra-gray.jpg');
INSERT INTO public."ProductColor" VALUES ('355ab75e-4def-595d-499e-4cfa57071cf9', '3ffb71ac-8124-c242-ba58-d777a4950494', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Trắng', '/images/products/laptop-ultra-white.jpg');
INSERT INTO public."ProductColor" VALUES ('1b6b6922-00c5-29ec-b829-452e8433808c', '0a78cb6d-3d0a-cf83-166c-e214aa4f2ee4', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Trắng', '/images/products/shirt-premium-white.jpg');
INSERT INTO public."ProductColor" VALUES ('3c652eb4-9b5a-a67a-3987-83a70b3566c4', '0a78cb6d-3d0a-cf83-166c-e214aa4f2ee4', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Xanh', '/images/products/shirt-premium-blue.jpg');
INSERT INTO public."ProductColor" VALUES ('9d661ed6-a590-42e5-10d7-caf641fa8286', '0a78cb6d-3d0a-cf83-166c-e214aa4f2ee4', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Đen', '/images/products/shirt-premium-black.jpg');
INSERT INTO public."ProductColor" VALUES ('bca2540a-0895-d8ac-adda-89115fe31cf6', '4ec5ab4b-133e-d62b-ceee-377248662a19', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Hồng', '/images/products/ao-dai-hoa-sen-hong.jpg');
INSERT INTO public."ProductColor" VALUES ('ba079671-63a4-862a-46c3-4bd53f86decf', '4ec5ab4b-133e-d62b-ceee-377248662a19', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Đỏ', '/images/products/ao-dai-hoa-sen-do.jpg');
INSERT INTO public."ProductColor" VALUES ('1668228b-f0d6-909c-1837-83cdf181d729', '4ec5ab4b-133e-d62b-ceee-377248662a19', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Trắng', '/images/products/ao-dai-hoa-sen-trang.jpg');
INSERT INTO public."ProductColor" VALUES ('5f5eccda-9218-5d9a-69c7-d11a53ca96c5', '57b3f2bb-e314-2319-9b40-38adf8a2d578', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Đen', '/images/products/headphone-pro-black.jpg');
INSERT INTO public."ProductColor" VALUES ('49904f61-f74e-0150-4178-0161e89d91b2', '57b3f2bb-e314-2319-9b40-38adf8a2d578', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Trắng', '/images/products/headphone-pro-white.jpg');
INSERT INTO public."ProductColor" VALUES ('e38636c8-1a5e-6fee-116a-a451c966946d', '57b3f2bb-e314-2319-9b40-38adf8a2d578', '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Xanh', '/images/products/headphone-pro-blue.jpg');


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: user_ecommerce
--

INSERT INTO public."ProductVariant" VALUES ('a124549f-0442-30f9-9592-b64593317bd4', 'a98ce51a-ee0a-f630-6626-47539b2f2d05', 'SKU-0001', 20000000.00, 19000000.00, 11, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, '256GB');
INSERT INTO public."ProductVariant" VALUES ('3bd25be0-7ec1-ed88-1cff-3390309d8049', '79a9f5f8-c034-31dc-e4f7-a60ce431bfa8', 'SKU-0002', 18000000.00, 17000000.00, 12, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, '512GB');
INSERT INTO public."ProductVariant" VALUES ('5f45271a-52fb-012e-9985-4245eba5e1ce', '05bdda59-76c7-70d0-ae81-593cdb3afc23', 'SKU-0003', 250000.00, 220000.00, 13, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, 'Size L');
INSERT INTO public."ProductVariant" VALUES ('06bffc5a-a50e-a91d-59bb-6c7d4782b05d', 'a23ecc77-98f2-15c7-0987-3424b2552ed6', 'SKU-0004', 1200000.00, 1100000.00, 14, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, 'Size M');
INSERT INTO public."ProductVariant" VALUES ('22495c5d-a3a7-9acd-144d-237c6a57202b', '035f9aad-a5a6-db0a-1bb9-9b2cadefa4fd', 'SKU-0005', 800000.00, 750000.00, 15, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, NULL);
INSERT INTO public."ProductVariant" VALUES ('c4a69bc6-a444-880e-8fc3-7ce40e5e7cd2', 'b4b3749c-7545-1921-5473-ca6175cd2506', 'IPHONE17-BLACK-128GB', 29990000.00, 28990000.00, 10, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, '128GB');
INSERT INTO public."ProductVariant" VALUES ('919e757e-6b7e-33eb-0687-4233aec36c38', 'b4b3749c-7545-1921-5473-ca6175cd2506', 'IPHONE17-BLACK-256GB', 33990000.00, 32990000.00, 10, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, '256GB');
INSERT INTO public."ProductVariant" VALUES ('0105b37c-30d4-0ca4-8346-c1d8e3e7948d', 'b4b3749c-7545-1921-5473-ca6175cd2506', 'IPHONE17-BLACK-512GB', 40990000.00, 39990000.00, 10, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, '512GB');
INSERT INTO public."ProductVariant" VALUES ('be5c3a10-9b5b-04d0-b0d7-aed615037b85', '8dea1479-3027-c058-3b03-f9f49fc1aae3', 'IPHONE17-SILVER-128GB', 29990000.00, 28990000.00, 10, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, '128GB');
INSERT INTO public."ProductVariant" VALUES ('d7e6e6d5-e435-c28b-9732-944b1e893eed', '8dea1479-3027-c058-3b03-f9f49fc1aae3', 'IPHONE17-SILVER-256GB', 33990000.00, 32990000.00, 10, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, '256GB');
INSERT INTO public."ProductVariant" VALUES ('94d57f26-f2d5-3202-8e2d-f75d77b575fe', '8dea1479-3027-c058-3b03-f9f49fc1aae3', 'IPHONE17-SILVER-512GB', 40990000.00, 39990000.00, 10, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, '512GB');
INSERT INTO public."ProductVariant" VALUES ('949aada0-4fa3-e0cc-a35c-686c1cc39372', '8e22e7a4-f4b4-c407-2126-287e7d03bf35', 'IPHONE17-GOLD-128GB', 29990000.00, 28990000.00, 10, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, '128GB');
INSERT INTO public."ProductVariant" VALUES ('b70c07f5-d67e-d063-f134-0b25bbaae2fc', '8e22e7a4-f4b4-c407-2126-287e7d03bf35', 'IPHONE17-GOLD-256GB', 33990000.00, 32990000.00, 10, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, '256GB');
INSERT INTO public."ProductVariant" VALUES ('6ade0ebf-3b05-a5a0-7a09-149f0ef6b712', '8e22e7a4-f4b4-c407-2126-287e7d03bf35', 'IPHONE17-GOLD-512GB', 40990000.00, 39990000.00, 10, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, '512GB');
INSERT INTO public."ProductVariant" VALUES ('430a6742-aba5-bbd9-753d-24bbf7fd009a', '7a818a25-ff8c-4788-ea46-f67d5247bc75', 'LAPTOP-BLACK-I5-512', 18990000.00, 17990000.00, 8, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Core i5 - SSD 512GB');
INSERT INTO public."ProductVariant" VALUES ('b1c02eff-af63-201b-f0ea-65363e6ea3d8', '7a818a25-ff8c-4788-ea46-f67d5247bc75', 'LAPTOP-BLACK-I7-512', 23990000.00, 22990000.00, 8, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Core i7 - SSD 512GB');
INSERT INTO public."ProductVariant" VALUES ('33c88046-712f-7417-f6b6-ef6cfce9d747', '7a818a25-ff8c-4788-ea46-f67d5247bc75', 'LAPTOP-BLACK-I7-1TB', 28990000.00, 27990000.00, 8, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Core i7 - SSD 1TB');
INSERT INTO public."ProductVariant" VALUES ('4f081fcc-04a9-9963-be82-0e46649db353', '8e0ed3cf-c1e8-4c4c-1d5f-8141096feffc', 'LAPTOP-GRAY-I5-512', 18990000.00, 17990000.00, 8, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Core i5 - SSD 512GB');
INSERT INTO public."ProductVariant" VALUES ('d96548d6-f821-f023-7ef4-0b29e4e45dd1', '8e0ed3cf-c1e8-4c4c-1d5f-8141096feffc', 'LAPTOP-GRAY-I7-512', 23990000.00, 22990000.00, 8, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Core i7 - SSD 512GB');
INSERT INTO public."ProductVariant" VALUES ('8a32e8d6-d66a-e6c3-beed-43c53bf94764', '8e0ed3cf-c1e8-4c4c-1d5f-8141096feffc', 'LAPTOP-GRAY-I7-1TB', 28990000.00, 27990000.00, 8, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Core i7 - SSD 1TB');
INSERT INTO public."ProductVariant" VALUES ('fe519e30-0c98-bd4b-e118-f0752d1ebc6a', '355ab75e-4def-595d-499e-4cfa57071cf9', 'LAPTOP-WHITE-I5-512', 18990000.00, 17990000.00, 8, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Core i5 - SSD 512GB');
INSERT INTO public."ProductVariant" VALUES ('73d2f7aa-91a6-e23d-5078-e33036a5344d', '355ab75e-4def-595d-499e-4cfa57071cf9', 'LAPTOP-WHITE-I7-512', 23990000.00, 22990000.00, 8, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Core i7 - SSD 512GB');
INSERT INTO public."ProductVariant" VALUES ('a3bc288f-b61f-3efe-8973-16738046fe32', '355ab75e-4def-595d-499e-4cfa57071cf9', 'LAPTOP-WHITE-I7-1TB', 28990000.00, 27990000.00, 8, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Core i7 - SSD 1TB');
INSERT INTO public."ProductVariant" VALUES ('ac943b4f-8988-355c-7608-4bd9ad3048a9', '1b6b6922-00c5-29ec-b829-452e8433808c', 'SHIRT-WHITE-M', 450000.00, 399000.00, 25, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size M');
INSERT INTO public."ProductVariant" VALUES ('67a9edab-2cb4-10af-562b-c118c6ed64b3', '1b6b6922-00c5-29ec-b829-452e8433808c', 'SHIRT-WHITE-L', 450000.00, 399000.00, 25, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size L');
INSERT INTO public."ProductVariant" VALUES ('0164cf96-3572-a445-1cb7-8d6c72e9709c', '1b6b6922-00c5-29ec-b829-452e8433808c', 'SHIRT-WHITE-XL', 450000.00, 399000.00, 25, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size XL');
INSERT INTO public."ProductVariant" VALUES ('2b3377db-c1c0-5a00-5f2a-4eb532c32083', '3c652eb4-9b5a-a67a-3987-83a70b3566c4', 'SHIRT-BLUE-M', 450000.00, 399000.00, 25, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size M');
INSERT INTO public."ProductVariant" VALUES ('6fa26fcc-cf09-f9c2-e238-815254860a38', '3c652eb4-9b5a-a67a-3987-83a70b3566c4', 'SHIRT-BLUE-L', 450000.00, 399000.00, 25, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size L');
INSERT INTO public."ProductVariant" VALUES ('6ee99766-1335-b33f-e8b8-ad6357f6a31f', '3c652eb4-9b5a-a67a-3987-83a70b3566c4', 'SHIRT-BLUE-XL', 450000.00, 399000.00, 25, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size XL');
INSERT INTO public."ProductVariant" VALUES ('fb36e341-0712-e222-cab0-cae820f69eea', '9d661ed6-a590-42e5-10d7-caf641fa8286', 'SHIRT-BLACK-M', 450000.00, 399000.00, 25, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size M');
INSERT INTO public."ProductVariant" VALUES ('1d52ed93-ca2f-130a-8394-37808b5baab2', '9d661ed6-a590-42e5-10d7-caf641fa8286', 'SHIRT-BLACK-L', 450000.00, 399000.00, 25, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size L');
INSERT INTO public."ProductVariant" VALUES ('7f9b9faf-4724-d220-9141-5900e80f41f3', '9d661ed6-a590-42e5-10d7-caf641fa8286', 'SHIRT-BLACK-XL', 450000.00, 399000.00, 25, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size XL');
INSERT INTO public."ProductVariant" VALUES ('bfe60c50-fb18-365b-68ee-53686205a80b', 'bca2540a-0895-d8ac-adda-89115fe31cf6', 'AODAI-PINK-S', 1500000.00, 1350000.00, 12, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size S');
INSERT INTO public."ProductVariant" VALUES ('7c8fe379-f396-f26a-5083-6a31e1e0d46b', 'bca2540a-0895-d8ac-adda-89115fe31cf6', 'AODAI-PINK-M', 1500000.00, 1350000.00, 12, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size M');
INSERT INTO public."ProductVariant" VALUES ('5aa0fb8c-c81f-d9c0-78e0-e6eac226e604', 'bca2540a-0895-d8ac-adda-89115fe31cf6', 'AODAI-PINK-L', 1500000.00, 1350000.00, 12, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size L');
INSERT INTO public."ProductVariant" VALUES ('a76cbd8f-7f16-24ec-adbe-afe5a481ccd1', 'ba079671-63a4-862a-46c3-4bd53f86decf', 'AODAI-RED-S', 1500000.00, 1350000.00, 12, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size S');
INSERT INTO public."ProductVariant" VALUES ('6226fe9e-0521-d905-7c55-fe4f0f2656e0', 'ba079671-63a4-862a-46c3-4bd53f86decf', 'AODAI-RED-M', 1500000.00, 1350000.00, 12, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size M');
INSERT INTO public."ProductVariant" VALUES ('a1a83356-8314-0663-f343-7a06c982dd57', 'ba079671-63a4-862a-46c3-4bd53f86decf', 'AODAI-RED-L', 1500000.00, 1350000.00, 12, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size L');
INSERT INTO public."ProductVariant" VALUES ('16d494d4-b813-b743-b3a2-a5cebeda5ec1', '1668228b-f0d6-909c-1837-83cdf181d729', 'AODAI-WHITE-S', 1500000.00, 1350000.00, 12, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size S');
INSERT INTO public."ProductVariant" VALUES ('97a9b575-e912-76ab-fb55-e96f026ec7c5', '1668228b-f0d6-909c-1837-83cdf181d729', 'AODAI-WHITE-M', 1500000.00, 1350000.00, 12, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size M');
INSERT INTO public."ProductVariant" VALUES ('0eab0247-aacc-229d-e5dc-9f72fddc628f', '1668228b-f0d6-909c-1837-83cdf181d729', 'AODAI-WHITE-L', 1500000.00, 1350000.00, 12, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Size L');
INSERT INTO public."ProductVariant" VALUES ('7895537b-9aa8-fd10-753f-278078876031', '5f5eccda-9218-5d9a-69c7-d11a53ca96c5', 'HEADPHONE-BLACK-STANDARD', 790000.00, 690000.00, 30, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Standard');
INSERT INTO public."ProductVariant" VALUES ('09ba8a8c-8a00-3d6c-c14c-a6d4dd548732', '5f5eccda-9218-5d9a-69c7-d11a53ca96c5', 'HEADPHONE-BLACK-ANC', 1190000.00, 990000.00, 30, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Chống ồn ANC');
INSERT INTO public."ProductVariant" VALUES ('ebbf3957-f126-fed6-a686-4fc8c1d94580', '5f5eccda-9218-5d9a-69c7-d11a53ca96c5', 'HEADPHONE-BLACK-PRO', 1590000.00, 1390000.00, 30, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Pro');
INSERT INTO public."ProductVariant" VALUES ('56088b32-ea9d-1678-c101-b33c7c10716b', '49904f61-f74e-0150-4178-0161e89d91b2', 'HEADPHONE-WHITE-STANDARD', 790000.00, 690000.00, 30, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Standard');
INSERT INTO public."ProductVariant" VALUES ('570b7c22-4f53-f9da-c9b9-43c8ed9d73f3', '49904f61-f74e-0150-4178-0161e89d91b2', 'HEADPHONE-WHITE-ANC', 1190000.00, 990000.00, 30, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Chống ồn ANC');
INSERT INTO public."ProductVariant" VALUES ('a3327938-b763-11a6-fcd4-47364d02481f', '49904f61-f74e-0150-4178-0161e89d91b2', 'HEADPHONE-WHITE-PRO', 1590000.00, 1390000.00, 30, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Pro');
INSERT INTO public."ProductVariant" VALUES ('2df13509-036b-0594-92ab-2c376dfda7be', 'e38636c8-1a5e-6fee-116a-a451c966946d', 'HEADPHONE-BLUE-STANDARD', 790000.00, 690000.00, 30, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Standard');
INSERT INTO public."ProductVariant" VALUES ('fa52b001-bae0-a580-453b-793bc2a463ae', 'e38636c8-1a5e-6fee-116a-a451c966946d', 'HEADPHONE-BLUE-ANC', 1190000.00, 990000.00, 30, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Chống ồn ANC');
INSERT INTO public."ProductVariant" VALUES ('ca7b18e7-e3cb-4e91-126f-bbb4cce22e93', 'e38636c8-1a5e-6fee-116a-a451c966946d', 'HEADPHONE-BLUE-PRO', 1590000.00, 1390000.00, 30, '2026-09-13 23:24:40.737', '2026-09-13 23:24:40.737', NULL, 'Pro');


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: user_ecommerce
--

INSERT INTO public."CartItem" VALUES ('5e5c33be-6d65-eb00-79b8-c0c9d1ea8802', 'a83008af-26e8-c1af-6abe-360b45f29165', 'a124549f-0442-30f9-9592-b64593317bd4', 1, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');
INSERT INTO public."CartItem" VALUES ('a4491d81-2e36-ed54-31a4-42101e35548e', '35f1c2f0-e09c-fee8-49de-e2dbe2e27cb4', '3bd25be0-7ec1-ed88-1cff-3390309d8049', 2, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');
INSERT INTO public."CartItem" VALUES ('56e70778-6770-280a-0627-9e90376aa896', 'd2514f2c-7639-625e-36e0-30ed5d2ecc99', '5f45271a-52fb-012e-9985-4245eba5e1ce', 3, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');
INSERT INTO public."CartItem" VALUES ('d22ec7c8-43f4-d7b8-7159-9ad9a4f86fbe', '20bf22f3-5d6b-6e73-520b-4775e9752969', '06bffc5a-a50e-a91d-59bb-6c7d4782b05d', 4, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');
INSERT INTO public."CartItem" VALUES ('cde6e800-a513-ef2c-021a-73753b8705a5', 'efac19f7-0cf0-7fcc-f7f4-a74675b09836', '22495c5d-a3a7-9acd-144d-237c6a57202b', 5, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: user_ecommerce
--

INSERT INTO public."Order" VALUES ('6e7f85a9-d0fe-9b5d-fb50-4c6f2991d744', 'd6d77053-92bc-7af6-3332-8bea8c4c6904', 'ORDER-0001', 'pending', 'Ghi chú đơn hàng số 1', 19000000.00, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, '2026-09-13 23:19:50.745');
INSERT INTO public."Order" VALUES ('18899d7d-59a5-ab5a-a0df-f9fca8604ece', '3d58ce20-fe80-2793-e0b2-21905baa60b3', 'ORDER-0002', 'confirmed', 'Ghi chú đơn hàng số 2', 17000000.00, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, '2026-09-13 23:19:50.745');
INSERT INTO public."Order" VALUES ('f93e03b3-7135-ae23-7598-681bcd60abf2', '134ad24e-9980-6ca1-1119-7065657dbf5e', 'ORDER-0003', 'processing', 'Ghi chú đơn hàng số 3', 220000.00, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, '2026-09-13 23:19:50.745');
INSERT INTO public."Order" VALUES ('001469a0-ffea-db85-e6f0-c13bb37bd148', '24b299d7-67a9-79b1-ef4b-2e634067c8ad', 'ORDER-0004', 'shipping', 'Ghi chú đơn hàng số 4', 1100000.00, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, '2026-09-13 23:19:50.745');
INSERT INTO public."Order" VALUES ('9bf8c4be-8b3f-c15c-4623-226aa6e2318e', '39201609-d980-3efb-38f4-1f440309a429', 'ORDER-0005', 'completed', 'Ghi chú đơn hàng số 5', 750000.00, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL, '2026-09-13 23:19:50.745');


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: user_ecommerce
--

INSERT INTO public."OrderItem" VALUES ('7f152048-1d11-53a8-4cd7-675ed7c869cd', '6e7f85a9-d0fe-9b5d-fb50-4c6f2991d744', 'a124549f-0442-30f9-9592-b64593317bd4', 1, 19000000.00, '2026-09-13 23:19:50.745');
INSERT INTO public."OrderItem" VALUES ('80f3fbcd-4122-bf62-722c-bbc1ae4603bc', '18899d7d-59a5-ab5a-a0df-f9fca8604ece', '3bd25be0-7ec1-ed88-1cff-3390309d8049', 1, 17000000.00, '2026-09-13 23:19:50.745');
INSERT INTO public."OrderItem" VALUES ('0ee9197d-42f7-05d6-9b66-d036ca1d28e3', 'f93e03b3-7135-ae23-7598-681bcd60abf2', '5f45271a-52fb-012e-9985-4245eba5e1ce', 1, 220000.00, '2026-09-13 23:19:50.745');
INSERT INTO public."OrderItem" VALUES ('3b7cf6d5-0c3a-ef61-694a-cf21c107ca0b', '001469a0-ffea-db85-e6f0-c13bb37bd148', '06bffc5a-a50e-a91d-59bb-6c7d4782b05d', 1, 1100000.00, '2026-09-13 23:19:50.745');
INSERT INTO public."OrderItem" VALUES ('b94cd659-79b4-9fce-9251-6cd7566835e3', '9bf8c4be-8b3f-c15c-4623-226aa6e2318e', '22495c5d-a3a7-9acd-144d-237c6a57202b', 1, 750000.00, '2026-09-13 23:19:50.745');


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: user_ecommerce
--

INSERT INTO public."Payment" VALUES ('9ff1a37e-38e6-e886-219b-07c24acd964a', '6e7f85a9-d0fe-9b5d-fb50-4c6f2991d744', 'cod', 'pending', 19000000.00, 'TRANSACTION-0001', NULL, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');
INSERT INTO public."Payment" VALUES ('5a4972fb-50de-f4a3-b59b-80860ebb63c9', '18899d7d-59a5-ab5a-a0df-f9fca8604ece', 'vnpay', 'success', 17000000.00, 'TRANSACTION-0002', NULL, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');
INSERT INTO public."Payment" VALUES ('20eb75be-04c8-f057-0653-46661d91197a', 'f93e03b3-7135-ae23-7598-681bcd60abf2', 'momo', 'success', 220000.00, 'TRANSACTION-0003', NULL, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');
INSERT INTO public."Payment" VALUES ('97d25f0b-0067-1acd-b6a2-187107f2d55d', '001469a0-ffea-db85-e6f0-c13bb37bd148', 'zalopay', 'success', 1100000.00, 'TRANSACTION-0004', NULL, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');
INSERT INTO public."Payment" VALUES ('11622409-4918-6c7f-7066-a13619d0246e', '9bf8c4be-8b3f-c15c-4623-226aa6e2318e', 'bank_transfer', 'success', 750000.00, 'TRANSACTION-0005', NULL, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745');


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: user_ecommerce
--

INSERT INTO public."Review" VALUES ('0c508dc5-b8cd-9ab6-bc3d-4f4b442a50c6', 'd6d77053-92bc-7af6-3332-8bea8c4c6904', '42f1e2fa-04bc-46d2-bd22-d11514db6623', 'Đánh giá sản phẩm số 1', 4, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);
INSERT INTO public."Review" VALUES ('78f6475b-22de-06cf-ce46-6b39e2596a9e', '3d58ce20-fe80-2793-e0b2-21905baa60b3', '07be8445-2cc6-57aa-bb55-b10dfd13c8ff', 'Đánh giá sản phẩm số 2', 4, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);
INSERT INTO public."Review" VALUES ('64aa842d-347a-c789-6332-ffa81d7937ec', '134ad24e-9980-6ca1-1119-7065657dbf5e', 'fb6b355a-2ee2-69a2-6225-6d8ef6f0de10', 'Đánh giá sản phẩm số 3', 5, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);
INSERT INTO public."Review" VALUES ('0dc89e97-3eb5-f5d0-2a57-8fcc10e46ed9', '24b299d7-67a9-79b1-ef4b-2e634067c8ad', '2731e44f-51d6-20a4-957d-26a99aa11492', 'Đánh giá sản phẩm số 4', 5, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);
INSERT INTO public."Review" VALUES ('808a7027-4977-b8e1-07fd-598fe4c4746b', '39201609-d980-3efb-38f4-1f440309a429', 'bb570e6e-7131-d4ae-9ca7-abbbb10aeb70', 'Đánh giá sản phẩm số 5', 5, '2026-09-13 23:19:50.745', '2026-09-13 23:19:50.745', NULL);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: user_ecommerce
--

INSERT INTO public._prisma_migrations VALUES ('5cfdc9a4-b38a-47d4-8f11-7a1c31e7984f', '80b837957409175e4714a85198198e96089bf9713262e91b15df71262edf9b25', '2026-09-13 16:05:07.231746+00', '20260905145554_init', NULL, NULL, '2026-09-13 16:05:07.20749+00', 1);
INSERT INTO public._prisma_migrations VALUES ('45090795-22dd-4ba2-8281-16df787e6af3', '015969462eb619bb450cb18137cb95f593442e0084ff983da7a85918996aacff', '2026-09-13 16:05:07.495551+00', '20260913132323_init', NULL, NULL, '2026-09-13 16:05:07.234581+00', 1);
INSERT INTO public._prisma_migrations VALUES ('7098123b-7cdc-4391-8297-ca4945353d8a', 'b902c70a0ced26edff2c62595e996771d96fed6cadce49a88d4e15e30902fbd2', '2026-09-13 16:05:07.543855+00', '20260913135904_update_database_structure', NULL, NULL, '2026-09-13 16:05:07.497489+00', 1);
INSERT INTO public._prisma_migrations VALUES ('eb2e1c4d-99e9-41cf-85ec-b9758fdb4cb5', 'ec38b9860dbeed993e9b20036d761e7416808f97d80c28e5c2f0e9ff07e8522f', '2026-09-13 16:17:37.560373+00', '20260913161737_add_user_role', NULL, NULL, '2026-09-13 16:17:37.541209+00', 1);


--
-- PostgreSQL database dump complete
--

\unrestrict gQUYQTHVnW9TrIyxQSp4SiHAo9ztVAsxSyr1wO6bbMwWU25E0BSnRQfOp9nuMin

