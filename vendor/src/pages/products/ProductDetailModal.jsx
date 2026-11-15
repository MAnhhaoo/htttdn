import { Edit, Trash2 } from 'lucide-react';
import { Modal, Button, Badge } from '../../components/ui';
import { formatCurrency } from '../../utils/formatHelpers';

export default function ProductDetailModal({ isOpen, onClose, product, onEdit, onDelete }) {
  if (!product) return null;

  const isActive = product.status === 'active';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết Sản phẩm"
      maxWidth="max-w-4xl"
      footer={
        <div className="flex items-center justify-between gap-2 w-full">
          <div>
            {onDelete && (
              <Button
                variant="outline"
                icon={Trash2}
                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/30"
                onClick={() => onDelete(product)}
              >
                Xóa sản phẩm
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
            {onEdit && (
              <Button
                variant="primary"
                icon={Edit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => onEdit(product)}
              >
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {product.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Mã sản phẩm: #{product.id}
              </p>
            </div>
            <Badge variant={isActive ? 'success' : 'error'}>
              {isActive ? 'Đang bán' : 'Đã khóa'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">
                Danh mục
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {product.categoryName || product.category?.name || 'Chưa phân loại'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">
                Gian hàng
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {product.vendorName || 'Gian hàng của bạn'}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Mô tả sản phẩm
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 transition-colors p-3 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed whitespace-pre-wrap">
              {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            Phân loại Màu sắc &amp; Biến thể
          </h3>

          {!product.colors || product.colors.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              Chưa thiết lập màu sắc hoặc kích cỡ cho sản phẩm này.
            </p>
          ) : (
            <div className="space-y-4">
              {product.colors.map((color) => (
                <div
                  key={color.id}
                  className="bg-white dark:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
                >
                  <div className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    {color.imageUrls?.[0] ? (
                      <img
                        src={color.imageUrls[0]}
                        alt={color.color}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                        Chưa có ảnh
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
                        {color.color}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {color.variants?.length || 0} biến thể kích cỡ
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    {!color.variants || color.variants.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Chưa có kích cỡ nào cho màu này.
                      </p>
                    ) : (
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <th className="pb-2 font-medium">Kích cỡ</th>
                            <th className="pb-2 font-medium">Giá bán</th>
                            <th className="pb-2 font-medium">Tồn kho</th>
                          </tr>
                        </thead>
                        <tbody>
                          {color.variants.map((variant) => (
                            <tr
                              key={variant.id}
                              className="border-b border-slate-50 dark:border-slate-800/60 last:border-0"
                            >
                              <td className="py-2 font-medium text-slate-800 dark:text-slate-100">
                                {variant.size}
                              </td>
                              <td className="py-2 text-slate-600 dark:text-slate-400">
                                {formatCurrency(variant.price)}
                              </td>
                              <td className="py-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    variant.stock > 10
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                      : variant.stock > 0
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                  }`}
                                >
                                  {variant.stock > 0 ? `Còn ${variant.stock} sản phẩm` : 'Hết hàng'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
