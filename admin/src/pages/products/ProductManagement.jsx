import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Edit, Trash2, Plus, Image, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsApi, categoriesApi, productColorsApi } from '../../api';
import { formatCurrency } from '../../utils/formatHelpers';
import { Button, Input, Select, Badge } from '../../components/ui';
import ProductFormModal from './ProductFormModal';
import ProductDetailModal from './ProductDetailModal';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToView, setProductToView] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoriesApi.getCategories({ itemPerPage: 100 });
      setCategories(res.data.list || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, itemPerPage: 10 };
      if (search) params.search = search;

      const res = await productsApi.getProducts(params);
      const data = res.data;
      setProducts(data.list || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || '-';
  };

  const handleAddClick = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleViewClick = async (product) => {
    try {
      // Lấy product colors cho product này
      const colorsRes = await productColorsApi.getByProductId(product.id);
      const colors = colorsRes.data || [];

      setProductToView({ 
        ...product, 
        colors,
        categoryName: getCategoryName(product.categoryId),
      });
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error('Error fetching product details:', err);
      // Vẫn mở modal nếu có lỗi, chỉ không có colors
      setProductToView({
        ...product,
        colors: [],
        categoryName: getCategoryName(product.categoryId),
      });
      setIsDetailModalOpen(true);
    }
  };

  const handleEditClick = async (product) => {
    try {
      const colorsRes = await productColorsApi.getByProductId(product.id);
      const colors = (colorsRes.data || []).map(c => ({
        ...c,
        colorName: c.color || c.colorName,
        variants: c.variants || [],
      }));
      setProductToEdit({ ...product, colors });
    } catch {
      setProductToEdit({ ...product, colors: [] });
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (productId) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await productsApi.deleteProduct(productId);
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.message || 'Xóa sản phẩm thất bại');
      }
    }
  };

  const handleSaveProduct = async (savedData) => {
    try {
      if (productToEdit) {
        const { colors, categoryName, ...productData } = savedData;
        await productsApi.updateProduct(productToEdit.id, productData);
      } else {
        const { colors, ...productData } = savedData;
        await productsApi.createProduct(productData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Lưu sản phẩm thất bại');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Product Management</h1>
          <p className="text-slate-500 dark:text-slate-400">{totalItems} products</p>
        </div>
        <Button icon={Plus} onClick={handleAddClick}>
          Add Product
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input 
              placeholder="Tìm kiếm sản phẩm..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select 
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map(c => ({ value: c.id, label: c.name }))
            ]}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-slate-500">Đang tải...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              Không tìm thấy sản phẩm nào.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Product</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Slug</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {product.colors?.[0]?.imageUrls?.[0] ? (
                          <img src={product.colors[0].imageUrls[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 mr-3 bg-white" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mr-3">
                            <Image className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{product.name}</p>
                          <p className="text-xs text-slate-400 font-mono">#{product.id?.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{getCategoryName(product.categoryId)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 font-mono">{product.slug}</td>
                    <td className="px-4 py-3">
                      <Badge variant={product.status === 'active' ? 'success' : 'default'}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" icon={Eye} className="text-slate-400 hover:text-blue-600" onClick={() => handleViewClick(product)} />
                        <Button variant="ghost" size="sm" icon={Edit} className="text-slate-400 hover:text-amber-600" onClick={() => handleEditClick(product)} />
                        <Button variant="ghost" size="sm" icon={Trash2} className="text-slate-400 hover:text-red-600" onClick={() => handleDeleteClick(product.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Trang {page} / {totalPages} ({totalItems} sản phẩm)
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                icon={ChevronLeft} 
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              />
              <Button 
                variant="outline" 
                size="sm" 
                icon={ChevronRight}
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              />
            </div>
          </div>
        )}
      </div>

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
      />
    </div>
  );
}
