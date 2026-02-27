import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Loading({ 
  message = 'Loading...', 
  fullScreen = false,
  size = 'md',
  className = ''
}: LoadingProps) {
  const sizeClasses = {
    sm: { icon: 'w-8 h-8', container: 'p-4' },
    md: { icon: 'w-12 h-12', container: 'p-6' },
    lg: { icon: 'w-16 h-16', container: 'p-8' },
  };

  const currentSize = sizeClasses[size];

  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'
    : `flex items-center justify-center ${className}`;

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div 
            className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse"
            style={{ transform: 'scale(1.5)' }}
          />
          <div className={`relative ${currentSize.container} rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 shadow-xl`}>
            <Loader2 
              className={`${currentSize.icon} animate-spin text-primary`}
            />
          </div>
        </div>

        {message && (
          <div className="text-center">
            <p className="text-base md:text-lg font-semibold text-foreground/80 animate-pulse">
              {message}
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span 
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span 
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span 
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
