import { Modal, Button, Badge } from '../../components/ui';
import { formatCurrency } from '../../utils/formatHelpers';

export default function ProductDetailModal({ isOpen, onClose, product }) {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details"
      maxWidth="max-w-4xl"
      footer={
        <Button variant="secondary" onClick={onClose}>Close</Button>
      }
    >
      <div className="space-y-8">
        
        {/* Basic Info */}
        <section className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{product.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Product ID: #{product.id}</p>
            </div>
            <Badge variant={product.status === 'active' ? 'success' : 'default'} className={product.status === 'active' ? 'bg-green-100 text-green-700' : ''}>
              {product.status.toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Category</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{product.categoryName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Vendor</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{product.vendorName || 'In-house'}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Description</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 transition-colors p-3 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed whitespace-pre-wrap">
              {product.description || 'No description provided.'}
            </p>
          </div>
        </section>

        {/* Colors and Variants */}
        <section>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b">Colors & Variants</h3>
          
          {(!product.colors || product.colors.length === 0) ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">No colors or variants configured for this product.</p>
          ) : (
            <div className="space-y-6">
              {product.colors.map(color => (
                <div key={color.id} className="bg-white dark:bg-slate-900 transition-colors border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    {color.imageUrls?.[0] ? (
                      <img src={color.imageUrls[0]} alt={color.colorName} className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-800" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">No Image</div>
                    )}
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{color.colorName}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{color.variants?.length || 0} variants</p>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {(!color.variants || color.variants.length === 0) ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No variants available for this color.</p>
                    ) : (
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <th className="pb-2 font-medium">Size</th>
                            <th className="pb-2 font-medium">Price</th>
                            <th className="pb-2 font-medium">Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {color.variants.map(variant => (
                            <tr key={variant.id} className="border-b border-slate-50 last:border-0">
                              <td className="py-2 font-medium text-slate-800 dark:text-slate-100">{variant.size}</td>
                              <td className="py-2 text-slate-600 dark:text-slate-400">{formatCurrency(variant.price)}</td>
                              <td className="py-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${variant.stock > 10 ? 'bg-green-100 text-green-700' : variant.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                  {variant.stock > 0 ? `${variant.stock} items` : 'Out of stock'}
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
