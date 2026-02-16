import { Link } from 'react-router-dom';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
      <div className="w-full max-w-lg text-center">
        {/* Animated Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 shadow-xl">
              <FileQuestion className="w-20 h-20 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-6">
          <h1 
            className="text-8xl md:text-9xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            404
          </h1>
          <h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has been moved to a different location.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Link to="/dashboard">
            <Button 
              variant="default"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl px-6 py-3 text-base font-semibold"
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
