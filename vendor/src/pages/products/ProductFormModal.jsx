import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Modal, Button, Input, Select, Badge } from '../../components/ui';
import { mockCategories } from '../../data';

const CURRENT_VENDOR_ID = 3;

export default function ProductFormModal({ isOpen, onClose, productToEdit, onSave }) {
  // --- Form State ---
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    vendorId: CURRENT_VENDOR_ID,
    description: '',
    status: 'active',
    colors: [] 
  });

  const [expandedColorId, setExpandedColorId] = useState(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    } else {
      setFormData({
        name: '',
        categoryId: '',
        vendorId: CURRENT_VENDOR_ID,
        description: '',
        status: 'active',
        colors: []
      });
    }
  }, [productToEdit, isOpen]);

  // --- Handlers ---
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddColor = () => {
    const newColor = {
      id: `temp-color-${Date.now()}`,
      colorName: '',
      imageUrls: [''],
      variants: []
    };
    setFormData(prev => ({ ...prev, colors: [...prev.colors, newColor] }));
    setExpandedColorId(newColor.id);
  };

  const handleUpdateColor = (colorId, field, value) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map(c => c.id === colorId ? { ...c, [field]: value } : c)
    }));
  };

  const handleRemoveColor = (colorId) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c.id !== colorId)
    }));
  };

  const handleAddVariant = (colorId) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map(c => {
        if (c.id === colorId) {
          return {
            ...c,
            variants: [...c.variants, { id: `temp-var-${Date.now()}`, size: '', price: 0, stock: 0 }]
          };
        }
        return c;
      })
    }));
  };

  const handleUpdateVariant = (colorId, variantId, field, value) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map(c => {
        if (c.id === colorId) {
          return {
            ...c,
            variants: c.variants.map(v => v.id === variantId ? { ...v, [field]: value } : v)
          };
        }
        return c;
      })
    }));
  };

  const handleRemoveVariant = (colorId, variantId) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map(c => {
        if (c.id === colorId) {
          return { ...c, variants: c.variants.filter(v => v.id !== variantId) };
        }
        return c;
      })
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.categoryId) {
      alert("Please fill required product fields (Name, Category)");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? "Edit Product" : "Add New Product"}
      maxWidth="max-w-4xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500" onClick={handleSubmit}>Save Product</Button>
        </>
      }
    >
      <div className="space-y-8">
        
        {/* LEVEL 1: PRODUCT INFO */}
        <section>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b pb-2">1. Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Product Name *" 
              placeholder="e.g. Vintage T-Shirt" 
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
            />
            <Select 
              label="Category *"
              options={[
                { value: '', label: 'Select Category' },
                ...mockCategories.map(c => ({ value: c.id, label: c.name }))
              ]}
              value={formData.categoryId}
              onChange={e => handleChange('categoryId', e.target.value)}
            />
            <Select 
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              value={formData.status}
              onChange={e => handleChange('status', e.target.value)}
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea 
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                rows={3}
                placeholder="Product description..."
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* LEVEL 2 & 3: COLORS AND VARIANTS */}
        <section>
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">2. Colors & Variants</h3>
            <Button variant="outline" size="sm" icon={Plus} onClick={handleAddColor} className="hover:border-indigo-500 hover:text-indigo-600">
              Add Color
            </Button>
          </div>

          {formData.colors.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 rounded-xl">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No colors added yet. Add a color to define variants.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.colors.map((color, index) => (
                <div key={color.id} className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 transition-colors overflow-hidden shadow-sm">
                  {/* Color Header */}
                  <div 
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 cursor-pointer select-none"
                    onClick={() => setExpandedColorId(expandedColorId === color.id ? null : color.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedColorId === color.id ? <ChevronUp className="w-5 h-5 text-slate-400"/> : <ChevronDown className="w-5 h-5 text-slate-400"/>}
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {color.colorName || `Color #${index + 1}`}
                      </span>
                      <Badge variant="info" className="bg-indigo-100 text-indigo-700">{color.variants.length} variants</Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => { e.stopPropagation(); handleRemoveColor(color.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Color Content */}
                  {expandedColorId === color.id && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Input 
                          label="Color Name" 
                          placeholder="e.g. Red"
                          value={color.colorName}
                          onChange={e => handleUpdateColor(color.id, 'colorName', e.target.value)}
                        />
                        <Input 
                          label="Image URL" 
                          placeholder="https://..."
                          value={color.imageUrls[0] || ''}
                          onChange={e => handleUpdateColor(color.id, 'imageUrls', [e.target.value])}
                        />
                      </div>

                      {/* LEVEL 3: VARIANTS */}
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">Sizes & Inventory (Variants)</h4>
                          <Button variant="secondary" size="sm" icon={Plus} onClick={() => handleAddVariant(color.id)}>
                            Add Size
                          </Button>
                        </div>
                        
                        {color.variants.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No variants added for this color.</p>
                        ) : (
                          <div className="space-y-2">
                            {color.variants.map(variant => (
                              <div key={variant.id} className="flex flex-wrap md:flex-nowrap items-end gap-2 bg-white dark:bg-slate-900 transition-colors p-2 rounded border border-slate-200 dark:border-slate-800">
                                <div className="flex-1 min-w-[100px]">
                                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Size</label>
                                  <input 
                                    type="text" 
                                    className="w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded outline-none focus:border-indigo-500" 
                                    placeholder="e.g. L"
                                    value={variant.size}
                                    onChange={e => handleUpdateVariant(color.id, variant.id, 'size', e.target.value)}
                                  />
                                </div>
                                <div className="flex-1 min-w-[120px]">
                                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Price (VND)</label>
                                  <input 
                                    type="number" 
                                    className="w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded outline-none focus:border-indigo-500" 
                                    placeholder="0"
                                    value={variant.price}
                                    onChange={e => handleUpdateVariant(color.id, variant.id, 'price', Number(e.target.value))}
                                  />
                                </div>
                                <div className="flex-1 min-w-[100px]">
                                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Stock</label>
                                  <input 
                                    type="number" 
                                    className="w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-800 rounded outline-none focus:border-indigo-500" 
                                    placeholder="0"
                                    value={variant.stock}
                                    onChange={e => handleUpdateVariant(color.id, variant.id, 'stock', Number(e.target.value))}
                                  />
                                </div>
                                <button 
                                  onClick={() => handleRemoveVariant(color.id, variant.id)}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </Modal>
  );
}
