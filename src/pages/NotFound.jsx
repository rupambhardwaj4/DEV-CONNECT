import { Link } from 'react-router-dom';
import { Button } from '../components/common';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="text-center px-4">
        <div className="mb-4">
          <h1 className="text-9xl font-bold text-[var(--color-primary)]">404</h1>
        </div>
        
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          Page Not Found
        </h2>
        
        <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/">
          <Button icon={Home}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
