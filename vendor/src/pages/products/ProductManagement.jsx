import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Eye,
  Edit,
  Lock,
  Unlock,
  Trash2,
  AlertTriangle,
  Plus,
  Image,
  Loader2,
  Package,
  Star,
} from 'lucide-react';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { formatCurrency } from '../../utils/formatHelpers';
import { Button, Input, Select, Badge, Modal, useToast } from '../../components/ui';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../contexts/AuthContext';
import ProductFormModal from './ProductFormModal';
import ProductDetailModal from './ProductDetailModal';
import ReviewManagement from '../reviews/ReviewManagement';

export default function ProductManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') === 'reviews' ? 'reviews' : 'products';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToView, setProductToView] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.getVendorProducts({ itemPerPage: 100 }),
        categoryService.getAll(),
      ]);
      setProducts(prodRes?.list || (Array.isArray(prodRes) ? prodRes : []));
      setCategories(catRes?.list || (Array.isArray(catRes) ? catRes : []));
    } catch (error) {
      console.error('Lỗi tải dữ liệu sản phẩm:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const refreshProducts = () => fetchData({ silent: true });
    const refreshCategories = () => fetchData({ silent: true });
    window.addEventListener('miva:products', refreshProducts);
    window.addEventListener('miva:categories', refreshCategories);
    return () => {
      window.removeEventListener('miva:products', refreshProducts);
      window.removeEventListener('miva:categories', refreshCategories);
    };
  }, [fetchData]);

  const handleTabChange = (nextTab) => {
    if (nextTab === 'reviews') {
      setSearchParams({ tab: 'reviews' });
    } else {
      setSearchParams({});
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = (p.name || '').toLowerCase().includes(debouncedSearch.trim().toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const handleAddClick = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleViewClick = (product) => {
    setProductToView({
      ...product,
      categoryName: product.category?.name,
      vendorName: user?.storeName || user?.fullName || 'Gian hàng của bạn',
    });
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleEditFromDetail = (product) => {
    setIsDetailModalOpen(false);
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (product) => {
    const isLocking = product.status === 'active';
    const actionText = isLocking ? 'khóa' : 'mở khóa';
    const nextStatus = isLocking ? 'inactive' : 'active';

    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} sản phẩm "${product.name}"?`)) {
      try {
        await productService.updateProduct(product.id, { status: nextStatus });
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p)),
        );
        toast.success(`Đã ${actionText} sản phẩm "${product.name}".`);
      } catch (error) {
        console.error(`Failed to ${actionText} product`, error);
        toast.error(
          error.response?.data?.message || `Có lỗi xảy ra khi ${actionText} sản phẩm.`,
        );
      }
    }
  };

  const handleSaveProduct = async () => {
    await fetchData({ silent: true });
    setIsModalOpen(false);
  };

  const handleRequestDelete = (product) => {
    setProductToDelete(product);
  };

  const handleRequestDeleteFromDetail = (product) => {
    setIsDetailModalOpen(false);
    setProductToDelete(product);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete || isDeleting) return;
    const target = productToDelete;
    try {
      setIsDeleting(true);
      await productService.deleteProduct(target.id);
      setProducts((prev) => prev.filter((p) => p.id !== target.id));
      setProductToDelete(null);
      if (productToView?.id === target.id) {
        setProductToView(null);
        setIsDetailModalOpen(false);
      }
      toast.success(`Đã xóa và ẩn sản phẩm "${target.name}" khỏi gian hàng.`);
    } catch (error) {
      console.error('Lỗi xóa sản phẩm:', error);
      toast.error(
        error.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Sản phẩm &amp; Đánh giá Khách hàng
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý danh mục hàng hóa, tồn kho biến thể và phản hồi đánh giá từ người mua
          </p>
        </div>
        {activeTab === 'products' && (
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white self-start sm:self-auto"
            icon={Plus}
            onClick={handleAddClick}
          >
            Thêm sản phẩm
          </Button>
        )}
      </div>

      {/* 2 Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => handleTabChange('products')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Package className="w-4 h-4" />
          Danh sách Sản phẩm ({products.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('reviews')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Star className="w-4 h-4" />
          Đánh giá Khách hàng
        </button>
      </div>

      {activeTab === 'reviews' ? (
        <ReviewManagement embedded />
      ) : loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[240px] max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                placeholder="Tìm kiếm tên sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <Select
              options={[
                { value: 'all', label: 'Tất cả danh mục' },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 w-48"
            />
            <Select
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'active', label: 'Đang mở bán' },
                { value: 'inactive', label: 'Đã khóa (Tạm ngừng)' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 w-52"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Danh mục
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Khoảng giá
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Tồn kho
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Màu sắc
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-sm text-slate-500">
                      Không tìm thấy sản phẩm nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => {
                    const stock = product.totalStock || 0;
                    const colorsList = product.colors?.map((c) => c.color).join(', ') || '—';
                    const isInactive = product.status === 'inactive';
                    return (
                      <tr
                        key={product.id}
                        className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${
                          isInactive
                            ? 'bg-slate-50/70 dark:bg-slate-900/40 text-slate-500'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail}
                                alt={product.name}
                                className={`w-10 h-10 rounded-lg object-cover mr-3 border border-slate-200 dark:border-slate-800 ${
                                  isInactive ? 'grayscale contrast-75 opacity-70' : ''
                                }`}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mr-3">
                                <Image className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <p
                                className={`text-sm font-medium line-clamp-1 ${
                                  isInactive
                                    ? 'text-slate-500 dark:text-slate-400'
                                    : 'text-slate-800 dark:text-slate-100'
                                }`}
                              >
                                {product.name}
                              </p>
                              <p className="text-xs text-slate-400">#{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {product.category?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100 font-medium whitespace-nowrap">
                          {product.minPrice ? formatCurrency(product.minPrice) : 'Chưa đặt giá'}
                          {product.minPrice !== product.maxPrice && product.maxPrice
                            ? ` - ${formatCurrency(product.maxPrice)}`
                            : ''}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-sm font-medium ${
                              stock <= 5
                                ? 'text-rose-500'
                                : 'text-slate-800 dark:text-slate-100'
                            }`}
                          >
                            {stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {colorsList}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={product.status === 'active' ? 'success' : 'error'}>
                            {product.status === 'active' ? 'Đang bán' : 'Đã khóa'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Eye}
                              title="Xem chi tiết"
                              className="text-slate-400 hover:text-indigo-600"
                              onClick={() => handleViewClick(product)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Edit}
                              title="Chỉnh sửa sản phẩm"
                              className="text-slate-400 hover:text-amber-600"
                              onClick={() => handleEditClick(product)}
                            />
                            {product.status === 'active' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Lock}
                                title="Khóa sản phẩm (Tạm ngừng kinh doanh)"
                                className="text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                onClick={() => handleToggleStatus(product)}
                              />
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Unlock}
                                title="Mở khóa sản phẩm (Mở bán trở lại)"
                                className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                onClick={() => handleToggleStatus(product)}
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              title="Xóa sản phẩm (Ẩn khỏi gian hàng)"
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              onClick={() => handleRequestDelete(product)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
        categories={categories}
      />

      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={productToView}
        onEdit={handleEditFromDetail}
        onDelete={handleRequestDeleteFromDetail}
      />

      <Modal
        isOpen={Boolean(productToDelete)}
        onClose={() => {
          if (!isDeleting) setProductToDelete(null);
        }}
        title="Xác nhận xóa sản phẩm"
        maxWidth="max-w-lg"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={isDeleting}
              onClick={() => setProductToDelete(null)}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              icon={isDeleting ? Loader2 : Trash2}
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className={isDeleting ? '[&_svg]:animate-spin' : ''}
            >
              {isDeleting ? 'Đang xử lý...' : 'Xóa sản phẩm'}
            </Button>
          </>
        }
      >
        {productToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                Bạn có chắc chắn muốn xóa sản phẩm{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  &ldquo;{productToDelete.name}&rdquo;
                </span>
                ?
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                • Sản phẩm sẽ được <strong className="text-slate-800 dark:text-slate-100">ẩn hoàn toàn</strong> khỏi danh sách quản lý của Shop và giao diện mua sắm của khách hàng.
              </p>
              <p>
                • Dữ liệu sản phẩm cùng lịch sử đơn hàng, doanh thu và đánh giá liên quan <strong className="text-slate-800 dark:text-slate-100">vẫn được lưu giữ an toàn trong cơ sở dữ liệu</strong> để phục vụ đối soát.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
