import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { removeFromCart, updateQuantity } from '../../store/cartSlice';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../../components/common/Button/Button';
import EmptyState from '../../components/common/EmptyState/EmptyState';

export default function Cart() {
  const { items } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ id, quantity: newQuantity }));
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = 0; // Mock discount logic could be added here
  const shipping = subtotal > 0 ? 30000 : 0; // Mock 30k shipping fee
  const total = subtotal - discount + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20">
        <EmptyState 
          icon={ShoppingBag}
          title="Your cart is waiting for something special."
          description="Discover premium products and everyday essentials."
          actionText="Start Shopping"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <h1 className="text-3xl font-black text-light-text dark:text-dark-text tracking-tight mb-10">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-light-border dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50 font-semibold text-sm text-light-muted dark:text-dark-muted">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Items */}
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {items.map(item => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 items-center">
                  
                  {/* Product Info */}
                  <div className="col-span-1 md:col-span-6 flex gap-4">
                    <Link to={`/products/${item.id}`} className="w-24 h-24 bg-gray-100 dark:bg-dark-bg rounded-lg overflow-hidden flex-shrink-0 border border-light-border dark:border-dark-border">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex flex-col justify-center">
                      <Link to={`/products/${item.id}`} className="font-semibold text-light-text dark:text-dark-text hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      <p className="text-sm text-light-muted dark:text-dark-muted mt-1">Brand: {item.brand}</p>
                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 mt-3 w-fit transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-1 md:col-span-2 md:text-center mt-2 md:mt-0 font-medium text-light-text dark:text-dark-text">
                    <span className="md:hidden text-light-muted text-sm mr-2">Price:</span>
                    {formatPrice(item.price)}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-1 md:col-span-2 flex items-center md:justify-center mt-2 md:mt-0">
                    <span className="md:hidden text-light-muted text-sm mr-4">Qty:</span>
                    <div className="flex items-center border border-light-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-light-muted hover:text-primary transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-semibold text-light-text dark:text-dark-text text-sm">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-light-muted hover:text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-1 md:col-span-2 md:text-right mt-2 md:mt-0 font-bold text-light-text dark:text-dark-text">
                    <span className="md:hidden text-light-muted text-sm mr-2 text-normal font-normal">Subtotal:</span>
                    {formatPrice(item.price * item.quantity)}
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm sticky top-28">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-light-muted dark:text-dark-muted">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-medium text-light-text dark:text-dark-text">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-light-muted dark:text-dark-muted">
                <span>Shipping</span>
                <span className="font-medium text-light-text dark:text-dark-text">{formatPrice(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Discount</span>
                  <span className="font-medium">-{formatPrice(discount)}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-light-border dark:border-dark-border pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-light-text dark:text-dark-text">Total</span>
                <span className="text-2xl font-black text-primary">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-light-muted dark:text-dark-muted text-right mt-1">Inclusive of VAT</p>
            </div>

            <Button 
              variant="primary" 
              className="w-full py-4 text-base flex justify-center items-center gap-2"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </Button>
            
            <div className="mt-4 text-center">
              <Link to="/products" className="text-sm font-semibold text-light-muted hover:text-primary transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

