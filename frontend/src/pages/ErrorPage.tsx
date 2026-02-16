import { Link } from 'react-router-dom';
import { AlertCircle, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

interface ErrorPageProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
}

export default function ErrorPage({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again later.',
  error,
  onRetry,
}: ErrorPageProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-red-50 p-4">
      <div className="w-full max-w-lg text-center">
        {/* Animated Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative p-6 rounded-3xl bg-gradient-to-br from-yellow-50 to-red-50 border-2 border-yellow-100 shadow-xl">
              <AlertCircle className="w-20 h-20 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="mb-6">
          <h1 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {title}
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed mb-4">
            {message}
          </p>
          {errorMessage && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto">
              <p className="text-sm text-red-800 font-mono break-all">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          {onRetry && (
            <Button 
              variant="default" 
              onClick={onRetry}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl px-6 py-3 text-base font-semibold"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          )}
          <Link to="/dashboard">
            <Button 
              variant="outline"
              className="px-6 py-3 text-base font-semibold border-2 hover:bg-gray-50"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="px-6 py-3 text-base font-semibold border-2 hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
