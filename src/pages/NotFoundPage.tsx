import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-100">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">404</h2>
        <h3 className="text-lg font-bold text-slate-800">Page Not Found</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          The requested page or resource could not be found or has been moved.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
