import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/auth.service';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: (userData) => authService.register(userData),
    onSuccess: () => {
      alert('Registration successful! Please login.');
      navigate('/login');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Registration failed');
    }
  });

  const handleRegister = (e) => {
    e.preventDefault();
    registerMutation.mutate({ email, password, fullName: name, address, phone, role });
  };


  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-luxury p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <span className="text-4xl font-black tracking-tighter text-primary">Miva</span>
          </Link>
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Create an account</h2>
          <p className="text-light-muted dark:text-dark-muted mt-2">Join Miva to get everything you need.</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-5">
          <Input 
            label="Full Name" 
            type="text" 
            placeholder="Enter your full name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
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
            placeholder="Create a password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <Input 
            label="Address" 
            type="text" 
            placeholder="Enter your address" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Input 
            label="Phone Number" 
            type="tel" 
            placeholder="Enter your phone number" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-light-text dark:text-dark-text">Account Type</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="customer">Customer</option>
              <option value="seller">Vendor / Seller</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 mt-4" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-light-muted dark:text-dark-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
