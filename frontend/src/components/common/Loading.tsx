import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loading({ 
  message = 'Loading...', 
  fullScreen = false,
  size = 'md' 
}: LoadingProps) {
  const sizeClasses = {
    sm: { spinner: 'w-6 h-6', icon: 'w-8 h-8', container: 'p-4' },
    md: { spinner: 'w-12 h-12', icon: 'w-16 h-16', container: 'p-6' },
    lg: { spinner: 'w-16 h-16', icon: 'w-24 h-24', container: 'p-8' },
  };

  const currentSize = sizeClasses[size];

  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50/80 via-white/80 to-purple-50/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-6">
        {/* Animated Spinner with Glow */}
        <div className="relative">
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl animate-pulse"
            style={{
              background: 'linear-gradient(135deg, rgba(51, 57, 205, 0.3), rgba(147, 51, 234, 0.3))',
              transform: 'scale(1.5)',
            }}
          />
          
          {/* Spinner container */}
          <div className={`relative ${currentSize.container} rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 shadow-xl`}>
            <Loader2 
              className={`${currentSize.icon} animate-spin`}
              style={{ color: 'rgba(51, 57, 205, 1)' }}
            />
          </div>
        </div>

        {/* Loading Message */}
        {message && (
          <div className="text-center">
            <p 
              className="text-base md:text-lg font-semibold text-gray-700 animate-pulse"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {message}
            </p>
            {/* Animated dots */}
            <div className="flex items-center justify-center gap-1 mt-2">
              <span 
                className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span 
                className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span 
                className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
