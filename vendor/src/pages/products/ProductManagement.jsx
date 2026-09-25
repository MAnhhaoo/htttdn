import { useState } from 'react';
import { Search, Eye, Edit, Trash2, Plus, Image } from 'lucide-react';
import { mockProducts, mockCategories, mockProductColors, mockProductVariants, mockVendorProductMappings } from '../../data';
import { formatCurrency } from '../../utils/formatHelpers';
import { getProductTotalStock, getProductMinPrice, getProductMaxPrice, getAvailableColors } from '../../utils/productHelpers';
import { Button, Input, Select, Badge } from '../../components/ui';
import ProductFormModal from './ProductFormModal';
import ProductDetailModal from './ProductDetailModal';

const CURRENT_VENDOR_ID = 3;

export default function ProductManagement() {
  const vendorProductIds = mockVendorProductMappings
    .filter(m => m.vendorId === CURRENT_VENDOR_ID)
    .map(m => m.productId);

  const [products, setProducts] = useState(mockProducts.filter(p => vendorProductIds.includes(p.id) && !p.deletedAt));
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToView, setProductToView] = useState(null);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.categoryId === Number(categoryFilter);
    return matchSearch && matchCategory;
  });

  const getFirstImage = (productId) => {
    const color = mockProductColors.find(c => c.productId === productId);
    return color?.imageUrls?.[0] || null;
  };

  const handleAddClick = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleViewClick = (product) => {
    const category = mockCategories.find(c => c.id === product.categoryId);
    const colors = mockProductColors.filter(c => c.productId === product.id).map(c => ({
      ...c,
      colorName: c.color,
      variants: mockProductVariants.filter(v => v.productColorId === c.id)
    }));
    
    setProductToView({ 
      ...product, 
      colors,
      categoryName: category?.name,
      // Vendor portal implicitly knows the vendor, so we can just set it or leave it as In-house
      vendorName: 'Your Store'
    });
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (product) => {
    const colors = mockProductColors.filter(c => c.productId === product.id).map(c => ({
      ...c,
      colorName: c.color,
      variants: mockProductVariants.filter(v => v.productColorId === c.id)
    }));
    
    setProductToEdit({ ...product, colors });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleSaveProduct = (savedData) => {
    console.log("Saving product data:", savedData);
    if (productToEdit) {
      setProducts(prev => prev.map(p => p.id === savedData.id ? { ...p, ...savedData } : p));
    } else {
      const newProduct = { ...savedData, id: Date.now() };
      setProducts(prev => [newProduct, ...prev]);
    }
    setIsModalOpen(false);
  };

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
              ...mockCategories.map(c => ({ value: c.id, label: c.name }))
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
              {filtered.map(product => {
                const category = mockCategories.find(c => c.id === product.categoryId);
                const img = getFirstImage(product.id);
                const stock = getProductTotalStock(product.id);
                return (
                  <tr key={product.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {img ? (
                          <img src={img} alt={product.name} className="w-10 h-10 rounded-lg object-cover mr-3 border border-slate-200 dark:border-slate-800" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 dark:border-slate-800 flex items-center justify-center mr-3"><Image className="w-5 h-5 text-slate-400" /></div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{product.name}</p>
                          <p className="text-xs text-slate-400">#{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{category?.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100 font-medium">
                      {formatCurrency(getProductMinPrice(product.id))} - {formatCurrency(getProductMaxPrice(product.id))}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${stock <= 5 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>{stock}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{getAvailableColors(product.id).join(', ')}</td>
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
      />

      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={productToView}
      />

    </div>
  );
}
