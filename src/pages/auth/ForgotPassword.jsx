import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, Card, CardContent, Logo } from '../../components/common';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../../services/auth';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await authService.forgotPassword({ email });
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
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
              Check your email
            </h1>
            
            <p className="text-[var(--color-text-secondary)] mb-6">
              We've sent a password reset link to{' '}
              <span className="font-medium text-[var(--color-text-primary)]">{email}</span>
            </p>
            
            <p className="text-sm text-[var(--color-text-tertiary)] mb-6">
              The link will expire in 24 hours. If you don't receive an email, check your spam folder.
            </p>
            
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
            >
              Send another email
            </Button>
            
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
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
              Forgot your password?
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Enter your email and we'll send you a reset link
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-error)]">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={handleChange}
              error={error}
              disabled={isLoading}
              autoComplete="email"
              required
            />
            
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              Send reset link
            </Button>
          </form>
          
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
