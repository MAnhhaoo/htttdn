import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';

export default function Login() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <>
      <h2 className="text-center text-2xl font-bold tracking-tight text-light-text dark:text-dark-text mb-8">
        Sign in to your account
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {loginError && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center font-medium">
            {loginError.response?.data?.message || 'Invalid email or password'}
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          required
          autoComplete="email"
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
        />

        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={formData.password}
          onChange={e => setFormData({...formData, password: e.target.value})}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-light-muted dark:text-dark-muted">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-semibold text-primary hover:text-primary-dark">
              Forgot password?
            </a>
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoggingIn}>
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-light-muted dark:text-dark-muted">
        Not a member?{' '}
        <Link to="/register" className="font-semibold text-primary hover:text-primary-dark">
          Create an account
        </Link>
      </p>
    </>
  );
}
