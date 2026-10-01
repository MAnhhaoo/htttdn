/**
 * 15 general marketplace categories (Vietnamese).
 * Slugs are URL-safe, unique, and lowercase.
 */
export interface CategoryDefinition {
  name: string;
  slug: string;
}

export const CATEGORIES: CategoryDefinition[] = [
  { name: 'Thời trang nam',          slug: 'thoi-trang-nam' },
  { name: 'Thời trang nữ',           slug: 'thoi-trang-nu' },
  { name: 'Giày dép',                slug: 'giay-dep' },
  { name: 'Balo & Túi xách',         slug: 'balo-tui-xach' },
  { name: 'Điện thoại & Phụ kiện',   slug: 'dien-thoai-phu-kien' },
  { name: 'Máy tính & Laptop',       slug: 'may-tinh-laptop' },
  { name: 'Thiết bị điện tử',        slug: 'thiet-bi-dien-tu' },
  { name: 'Đồ gia dụng',            slug: 'do-gia-dung' },
  { name: 'Nhà cửa & Đời sống',     slug: 'nha-cua-doi-song' },
  { name: 'Sắc đẹp',                slug: 'sac-dep' },
  { name: 'Chăm sóc sức khỏe',      slug: 'cham-soc-suc-khoe' },
  { name: 'Thể thao & Du lịch',     slug: 'the-thao-du-lich' },
  { name: 'Sách & Văn phòng phẩm',  slug: 'sach-van-phong-pham' },
  { name: 'Mẹ & Bé',                slug: 'me-va-be' },
  { name: 'Phụ kiện thời trang',     slug: 'phu-kien-thoi-trang' },
];
