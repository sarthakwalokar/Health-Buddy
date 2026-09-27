import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <Card className="max-w-md w-full p-8 text-center shadow-elevated border-softBorder">
        <div className="w-16 h-16 rounded-3xl bg-primary-100 text-primary-dark flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div className="text-xs font-bold text-primary tracking-wider uppercase mb-1">Error 404</div>
        <h1 className="text-2xl font-bold text-charcoal">Page Not Found</h1>
        <p className="text-sm text-muted mt-2 mb-6">
          The healthcare resource or page you are looking for does not exist or has been relocated.
        </p>

        <Link to="/">
          <Button size="md" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
            Return to Homepage
          </Button>
        </Link>
      </Card>
    </div>
  );
};
