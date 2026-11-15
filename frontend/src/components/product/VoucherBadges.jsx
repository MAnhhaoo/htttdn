import { formatPrice } from '../../utils/formatPrice';
import { formatVoucherShortLabel } from '../../utils/voucherPrice';

/**
 * Icon chiếc vé kèm dấu tích tròn đồng bộ tông Xanh Rừng MIVA & Vàng Champagne.
 */
export function VoucherTicketCheckIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={`${className} text-[#2A5C4A] dark:text-[#C9A84C] shrink-0`}
      viewBox="0 0 22 17"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1.2 2.8A1.6 1.6 0 012.8 1.2h13.4a1.6 1.6 0 011.6 1.6v2.3a1.9 1.9 0 000 3.8V11a1.6 1.6 0 01-1.6 1.6H2.8A1.6 1.6 0 011.2 11V8.9a1.9 1.9 0 000-3.8V2.8z"
        stroke="currentColor"
        strokeWidth="1.45"
      />
      <path d="M6.5 3.6v6.6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.6 1.6" />
      <circle cx="16.8" cy="12" r="4.2" fill="currentColor" />
      <path
        d="M15 12l1.2 1.2 2.3-2.4"
        stroke="#FFFFFF"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Nhãn phần trăm giảm ở góc trên bên phải ảnh sản phẩm (-10%).
 */
export function DiscountCornerBadge({ percent, className = '' }) {
  if (!percent || percent <= 0) return null;
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 bg-[#1A3A2C] text-[#F5ECD7] text-xs font-extrabold leading-tight rounded-bl-xl border-l border-b border-[#C9A84C]/45 shadow-sm select-none ${className}`}
    >
      -{percent}%
    </span>
  );
}

/**
 * Dải băng khuyến mãi góc trái dưới của ảnh thẻ sản phẩm.
 */
export function PromoImageRibbon({ hasShopOffer, hasPlatformOffer, hasDiscount }) {
  if (!hasShopOffer && !hasPlatformOffer) return null;

  if (hasShopOffer && hasPlatformOffer) {
    return (
      <div className="absolute bottom-0 left-0 z-10 flex items-center text-[10px] font-extrabold leading-none tracking-tight shadow-xs select-none pointer-events-none">
        <span className="px-1.5 py-1 bg-[#C9A84C] text-[#0E2219] uppercase">Voucher Xtra</span>
        <span className="px-1.5 py-1 bg-[#1A3A2C] text-[#F5ECD7] uppercase rounded-tr-md">
          Ưu Đãi Kép
        </span>
      </div>
    );
  }

  if (hasDiscount) {
    return (
      <div className="absolute bottom-0 left-0 z-10 flex items-center text-[10px] font-extrabold leading-none tracking-tight shadow-xs select-none pointer-events-none">
        <span className="px-2 py-1 bg-gradient-to-r from-[#1A3A2C] to-[#2A5C4A] text-[#F5ECD7] border-t border-r border-[#C9A84C]/35 uppercase rounded-tr-md">
          {hasShopOffer ? 'Ưu Đãi Shop' : 'Voucher Sàn'}
        </span>
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 left-0 z-10 flex items-center text-[10px] font-extrabold leading-none tracking-tight shadow-xs select-none pointer-events-none">
      <span className="px-2 py-1 bg-[#C9A84C] text-[#0E2219] uppercase rounded-tr-md">
        Có Mã Giảm
      </span>
    </div>
  );
}

/**
 * Nhãn "Yêu thích+" đặt đầu tiêu đề sản phẩm (Vàng Champagne sang trọng).
 */
export function PreferredBadge({ label = 'Yêu thích+', size = 'sm' }) {
  const sizeClass =
    size === 'md'
      ? 'px-1.5 py-0.5 text-[11px] mr-1.5 rounded-[3px]'
      : 'px-1 py-[1px] text-[10px] mr-1 rounded-[3px]';
  return (
    <span
      className={`inline-block align-middle bg-[#C9A84C] text-[#0E2219] font-bold leading-tight select-none ${sizeClass}`}
    >
      {label}
    </span>
  );
}

/**
 * Nhãn viền mảnh bên dưới tên sản phẩm: "Rẻ Vô Địch", "Giá Sau Voucher", "Giảm 10%".
 */
export function PromoOutlineTag({ children }) {
  if (!children) return null;
  return (
    <span className="inline-flex items-center px-1.5 py-[1px] text-[10px] font-medium leading-tight border border-[#2A5C4A]/55 bg-[#EEF5F1]/70 text-[#1A3A2C] dark:bg-[#1A3A2C]/45 dark:text-[#B9D6C6] dark:border-[#579678]/60 rounded-[3px] max-w-full truncate">
      {children}
    </span>
  );
}

/**
 * Thẻ vé răng cưa cho dòng "Mã Giảm Giá Của Shop" / "Ưu Đãi Toàn Sàn" trên ProductDetail.
 */
export function VoucherSerratedChip({
  offer,
  selected = false,
  eligible = true,
  onClick,
}) {
  if (!offer) return null;
  const label = formatVoucherShortLabel(offer);
  const scopeTag = offer.scope === 'platform' ? 'Sàn' : null;
  const minText = offer.minOrderAmount
    ? `Đơn tối thiểu ${formatPrice(offer.minOrderAmount)}`
    : 'Không giới hạn đơn tối thiểu';
  const capText = offer.maxDiscountAmount
    ? ` · Tối đa ${formatPrice(offer.maxDiscountAmount)}`
    : '';
  const endText = offer.endDate
    ? ` · HSD ${new Date(offer.endDate).toLocaleDateString('vi-VN')}`
    : '';

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${offer.code}: ${offer.name || label} (${minText}${capText}${endText})`}
      className={`relative inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-[3px] border transition-all cursor-pointer select-none ${
        selected
          ? 'bg-[#1A3A2C] text-[#F5ECD7] border-[#1A3A2C] dark:bg-[#C9A84C] dark:text-[#0E2219] dark:border-[#C9A84C] shadow-xs'
          : eligible
            ? 'bg-[#EEF5F1] dark:bg-[#1A3A2C]/40 text-[#1A3A2C] dark:text-[#B9D6C6] border-[#2A5C4A]/35 dark:border-[#579678]/50 hover:border-[#1A3A2C] dark:hover:border-[#C9A84C]'
            : 'bg-gray-100 dark:bg-dark-surface text-light-muted dark:text-dark-muted border-dashed border-gray-300 dark:border-dark-border opacity-80 hover:opacity-100'
      }`}
    >
      {/* Hai khấc tròn tạo hiệu ứng vé răng cưa 2 đầu */}
      <span
        aria-hidden="true"
        className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-light-bg dark:bg-dark-bg border-r border-inherit"
      />
      <span
        aria-hidden="true"
        className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-light-bg dark:bg-dark-bg border-l border-inherit"
      />
      <span>{label}</span>
      {scopeTag && (
        <span
          className={`text-[10px] px-1 rounded ${
            selected
              ? 'bg-[#C9A84C]/25 text-[#F5ECD7] dark:bg-[#0E2219]/20 dark:text-[#0E2219]'
              : 'bg-[#C9A84C]/20 text-[#8C6B1F] dark:text-[#DEC47E]'
          }`}
        >
          {scopeTag}
        </span>
      )}
    </button>
  );
}
