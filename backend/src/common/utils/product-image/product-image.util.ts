import { BadRequestException } from '@nestjs/common';

export const MAX_IMAGES_PER_COLOR = 20;

/**
 * Chuẩn hóa danh sách URL ảnh màu sản phẩm:
 * - Trim khoảng trắng, loại bỏ chuỗi rỗng và loại bỏ các URL trùng lặp.
 * - Kiểm tra giới hạn tối đa số lượng ảnh cho mỗi màu (mặc định 20 ảnh).
 */
export function normalizeProductColorImages(
  imageUrls?: string[],
  maxImages = MAX_IMAGES_PER_COLOR,
): string[] {
  const urls = [
    ...new Set((imageUrls ?? []).map((url) => url.trim()).filter(Boolean)),
  ];
  if (urls.length > maxImages) {
    throw new BadRequestException(
      `Mỗi màu chỉ được có tối đa ${maxImages} ảnh`,
    );
  }
  return urls;
}
