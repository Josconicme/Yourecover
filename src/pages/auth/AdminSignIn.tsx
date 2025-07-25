import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const AdminSignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = 'Email is required';
    if (!email.includes('@')) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (error: any) {
      console.error('Admin sign in error:', error);
      setErrors({ general: error.message || 'Invalid admin credentials' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const useDefaultCredentials = () => {
    setEmail('admin@mindheal.com');
    setPassword('AdminMindHeal2025!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Admin Access
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Restricted access for administrators only
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {/* Default Credentials Info */}
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Default Admin Credentials
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p><strong>Email:</strong> admin@mindheal.com</p>
                    <p><strong>Password:</strong> AdminMindHeal2025!</p>
                    <button
                      type="button"
                      onClick={useDefaultCredentials}
                      className="mt-2 text-yellow-800 dark:text-yellow-200 underline hover:no-underline"
                    >
                      Use default credentials
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                    ⚠️ Change these credentials immediately after first login for security
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
                </div>
              )}

              <Input
                label="Admin Email"
                type="email"
                value={email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                required
                placeholder="Enter admin email"
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Admin Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  error={errors.password}
                  required
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in as Admin'}
              </Button>

              <div className="text-center">
                <Link
                  to="/"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  ← Back to main site
                </Link>
              </div>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                🔒 This is a secure admin portal. All access attempts are logged and monitored.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};