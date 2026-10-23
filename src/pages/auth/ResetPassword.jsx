import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Input, Button, Card, CardContent, Logo } from '../../components/common';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../../services/auth';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /\d/.test(formData.password) },
  ];
  
  // Check if token is missing
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-[var(--color-error)]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Invalid reset link
            </h1>
            
            <p className="text-[var(--color-text-secondary)] mb-6">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
            
            <Link to="/forgot-password">
              <Button fullWidth>
                Request new reset link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.resetPassword({
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setIsSuccess(true);
    } catch (error) {
      setApiError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };
  
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-[var(--color-success)]" />
            </div>
            
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Password reset successful
            </h1>
            
            <p className="text-[var(--color-text-secondary)] mb-6">
              Your password has been reset. You can now sign in with your new password.
            </p>
            
            <Link to="/login">
              <Button fullWidth>
                Sign in
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] py-12 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-8">
            <div className="mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Reset your password
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Enter your new password below
            </p>
          </div>
          
          {apiError && (
            <div className="mb-4 p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-error)]">{apiError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                name="password"
                label="New Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
              
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-xs ${
                        req.met ? 'text-[var(--color-success)]' : 'text-[var(--color-text-tertiary)]'
                      }`}
                    >
                      <span className={req.met ? 'text-[var(--color-success)]' : 'text-[var(--color-text-tertiary)]'}>
                        {req.met ? '✓' : '○'}
                      </span>
                      {req.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Input
              type="password"
              name="confirmPassword"
              label="Confirm New Password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
            
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              Reset password
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
            >
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
