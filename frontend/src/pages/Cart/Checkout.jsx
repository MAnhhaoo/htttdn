import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Truck, CreditCard, MapPin } from 'lucide-react';
import { clearCart } from '../../store/cartSlice';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';

export default function Checkout() {
  const { items } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // If cart is empty and not in success state, redirect to cart
  if (items.length === 0 && !isSuccess) {
    navigate('/cart');
    return null;
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 30000;
  const total = subtotal + shipping;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    // Simulate order placement
    setIsSuccess(true);
    dispatch(clearCart());
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4">
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-light-text dark:text-dark-text mb-4 text-center">Order Placed Successfully!</h1>
        <p className="text-light-muted dark:text-dark-muted mb-8 text-center max-w-md">
          Thank you for shopping with Miva. Your order #ORD-{Math.floor(Math.random() * 100000)} has been received and is being processed.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/account/orders')}>View Orders</Button>
          <Button variant="primary" onClick={() => navigate('/products')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <h1 className="text-3xl font-black text-light-text dark:text-dark-text tracking-tight mb-10">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Column: Form Details */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Shipping Address */}
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Shipping Address</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="John Doe" required />
              <Input label="Phone Number" placeholder="+84 123 456 789" required />
              <div className="md:col-span-2">
                <Input label="Address" placeholder="123 Example Street, District 1, Ho Chi Minh City" required />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Payment Method</h2>
            </div>
            
            <div className="flex flex-col gap-3">
              <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border hover:border-gray-300'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="cod" 
                  checked={paymentMethod === 'cod'} 
                  onChange={() => setPaymentMethod('cod')}
                  className="w-5 h-5 accent-primary" 
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-light-text dark:text-dark-text">Cash on Delivery (COD)</span>
                  <span className="text-sm text-light-muted dark:text-dark-muted">Pay when you receive the package</span>
                </div>
              </label>

              <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border hover:border-gray-300'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="bank" 
                  checked={paymentMethod === 'bank'} 
                  onChange={() => setPaymentMethod('bank')}
                  className="w-5 h-5 accent-primary" 
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-light-text dark:text-dark-text">Bank Transfer</span>
                  <span className="text-sm text-light-muted dark:text-dark-muted">Transfer via internet banking</span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm sticky top-28">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-md object-cover border border-light-border dark:border-dark-border flex-shrink-0" />
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-semibold text-light-text dark:text-dark-text line-clamp-2">{item.name}</span>
                    <span className="text-xs text-light-muted dark:text-dark-muted mt-1">Qty: {item.quantity}</span>
                    <span className="text-sm font-bold text-primary mt-auto">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-light-border dark:border-dark-border pt-4 space-y-3 text-sm mb-6">
              <div className="flex justify-between text-light-muted dark:text-dark-muted">
                <span>Subtotal</span>
                <span className="font-medium text-light-text dark:text-dark-text">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-light-muted dark:text-dark-muted">
                <span>Shipping</span>
                <span className="font-medium text-light-text dark:text-dark-text">{formatPrice(shipping)}</span>
              </div>
            </div>
            
            <div className="border-t border-light-border dark:border-dark-border pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-light-text dark:text-dark-text">Total</span>
                <span className="text-2xl font-black text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-4 text-base flex justify-center items-center gap-2">
              Place Order
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

