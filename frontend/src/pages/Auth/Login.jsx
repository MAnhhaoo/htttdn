import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/authSlice';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Mock user login
      dispatch(loginSuccess({
        id: 1,
        name: 'John Doe',
        email: email,
        avatar: null
      }));
      setIsLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-luxury p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <span className="text-4xl font-black tracking-tighter text-primary">Miva</span>
          </Link>
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Welcome back</h2>
          <p className="text-light-muted dark:text-dark-muted mt-2">Please enter your details to sign in.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary" />
              <span className="text-light-muted dark:text-dark-muted">Remember me</span>
            </label>
            <a href="#" className="font-semibold text-primary hover:text-primary-dark transition-colors">
              Forgot password?
            </a>
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 mt-4" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-light-muted dark:text-dark-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
