import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';

export default function Register() {
  const { register, isRegistering, registerError } = useAuth();
  const [formData, setFormData] = useState({ 
    fullName: '',
    email: '', 
    password: '',
    phone: '',
    address: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <>
      <h2 className="text-center text-2xl font-bold tracking-tight text-light-text dark:text-dark-text mb-8">
        Create an account
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {registerError && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium">
            {registerError.response?.data?.message || 'Registration failed. Please try again.'}
          </div>
        )}

        <Input
          label="Full Name"
          required
          value={formData.fullName}
          onChange={e => setFormData({...formData, fullName: e.target.value})}
        />

        <Input
          label="Email address"
          type="email"
          required
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
        />

        <Input
          label="Password"
          type="password"
          required
          value={formData.password}
          onChange={e => setFormData({...formData, password: e.target.value})}
        />

        <Input
          label="Phone Number"
          required
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
        />

        <Input
          label="Address"
          required
          value={formData.address}
          onChange={e => setFormData({...formData, address: e.target.value})}
        />

        <Button type="submit" className="w-full !mt-6" isLoading={isRegistering}>
          Create Account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-light-muted dark:text-dark-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </>
  );
}
