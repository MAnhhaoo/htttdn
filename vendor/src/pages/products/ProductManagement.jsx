import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Plus, Image, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatHelpers';
import { Button, Input, Select, Badge } from '../../components/ui';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../contexts/AuthContext';
import ProductFormModal from './ProductFormModal';
import ProductDetailModal from './ProductDetailModal';

export default function ProductManagement() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToView, setProductToView] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.getVendorProducts({ itemPerPage: 100 }), // temporary high limit
        categoryService.getAll()
      ]);
      setProducts(prodRes.list || []);
      setCategories(catRes.list || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleAddClick = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleViewClick = (product) => {
    // We already have colors and variants nested from the backend API
    setProductToView({ 
      ...product, 
      categoryName: product.category?.name,
      vendorName: user?.fullName || 'Your Store'
    });
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Failed to delete product', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm');
      }
    }
  };

  const handleSaveProduct = async (savedData) => {
    // Re-fetch after save to get updated variants/colors
    await fetchData();
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Products</h1>
          <p className="text-slate-500 dark:text-slate-400">{filtered.length} products</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white" icon={Plus} onClick={handleAddClick}>
          Add Product
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input 
              placeholder="Search your products..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <Select 
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map(c => ({ value: c.id, label: c.name }))
            ]}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Product</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Price Range</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Stock</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Colors</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">No products found</td>
                </tr>
              ) : (
                filtered.map(product => {
                  const stock = product.totalStock || 0;
                  const colorsList = product.colors?.map(c => c.color).join(', ') || 'N/A';
                  return (
                    <tr key={product.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {product.thumbnail ? (
                            <img src={product.thumbnail} alt={product.name} className="w-10 h-10 rounded-lg object-cover mr-3 border border-slate-200 dark:border-slate-800" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 dark:border-slate-800 flex items-center justify-center mr-3"><Image className="w-5 h-5 text-slate-400" /></div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-slate-400">#{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{product.category?.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100 font-medium whitespace-nowrap">
                        {product.minPrice ? formatCurrency(product.minPrice) : 'N/A'} {product.minPrice !== product.maxPrice && product.maxPrice ? ` - ${formatCurrency(product.maxPrice)}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${stock <= 5 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>{stock}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{colorsList}</td>
                      <td className="px-4 py-3">
                        <Badge variant={product.status === 'active' ? 'success' : 'default'} className={product.status === 'active' ? 'bg-green-100 text-green-700' : ''}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" icon={Eye} className="text-slate-400 hover:text-indigo-600" onClick={() => handleViewClick(product)} />
                          <Button variant="ghost" size="sm" icon={Edit} className="text-slate-400 hover:text-amber-600" onClick={() => handleEditClick(product)} />
                          <Button variant="ghost" size="sm" icon={Trash2} className="text-slate-400 hover:text-red-600" onClick={() => handleDeleteClick(product.id)} />
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
