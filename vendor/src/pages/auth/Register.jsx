import { useState } from 'react';
import { Store, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { Button, Input, Select } from '../../components/ui';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function VendorRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ 
    storeName: '',
    businessType: '',
    email: '', 
    password: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register({
        fullName: formData.storeName,
        email: formData.email,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 transition-colors rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
        <Link to="/login" className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <Store className="w-7 h-7 text-indigo-600" />
            Become a Vendor
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Fill out the form below to start selling on our platform.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input 
              label="Store Name *" 
              placeholder="e.g. Vintage Apparel"
              value={formData.storeName}
              onChange={e => setFormData({ ...formData, storeName: e.target.value })}
              required
            />
            <Select 
              label="Business Type *"
              options={[
                { value: '', label: 'Select Type' },
                { value: 'retail', label: 'Retail' },
                { value: 'wholesale', label: 'Wholesale' },
                { value: 'handmade', label: 'Handmade/Crafts' }
              ]}
              value={formData.businessType}
              onChange={e => setFormData({ ...formData, businessType: e.target.value })}
              required
            />
          </div>

          <Input 
            label="Email Address *" 
            type="email" 
            placeholder="vendor@shop.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
          
          <div className="relative">
            <Input 
              label="Password *" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button 
              type="button"
              className="absolute right-3 top-[28px] p-1 text-slate-400 hover:text-slate-600 dark:text-slate-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2 cursor-pointer text-sm">
              <input type="checkbox" required className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-slate-600 dark:text-slate-400 leading-relaxed">
                I agree to the <a href="#" className="text-indigo-600 font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 font-medium hover:underline">Privacy Policy</a>
              </span>
            </label>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-12 text-base mt-4 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Store Account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
