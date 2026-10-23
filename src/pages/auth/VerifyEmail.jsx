import { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card, CardContent } from '../../components/common';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { authService } from '../../services/auth';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // loading, success, error, expired
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const verifyEmail = useCallback(async () => {
    try {
      await authService.verifyEmail({ token });
      setStatus('success');
      setMessage('Your email has been verified successfully');
    } catch (error) {
      if (error.message?.includes('expired')) {
        setStatus('expired');
        setMessage('Verification link has expired');
      } else {
        setStatus('error');
        setMessage(error.message || 'Failed to verify email');
      }
    }
  }, [token]);
  
  useLayoutEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);
  
  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token, verifyEmail]);
  
  const handleResend = async () => {
    setIsLoading(true);
    try {
      await authService.resendVerification();
      setStatus('success');
      setMessage('Verification email sent. Please check your inbox.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-[var(--color-primary)] animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Verifying your email
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Please wait while we verify your email address...
            </p>
          </>
        );
      
      case 'success':
        return (
          <>
            <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-[var(--color-success)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Email verified!
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-6">
              {message}
            </p>
            <Link to="/onboarding">
              <Button fullWidth size="lg">
                Continue to onboarding
              </Button>
            </Link>
          </>
        );
      
      case 'expired':
        return (
          <>
            <div className="w-16 h-16 rounded-full bg-[var(--color-warning)]/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-[var(--color-warning)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Link expired
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-6">
              {message}
            </p>
            <Button
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              onClick={handleResend}
            >
              Resend verification email
            </Button>
          </>
        );
      
      case 'error':
      default:
        return (
          <>
            <div className="w-16 h-16 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-[var(--color-error)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Verification failed
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Button
                fullWidth
                variant="outline"
                loading={isLoading}
                disabled={isLoading}
                onClick={handleResend}
              >
                Resend verification email
              </Button>
              <Link to="/login">
                <Button fullWidth variant="ghost">
                  Back to login
                </Button>
              </Link>
            </div>
          </>
        );
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] py-12 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
