import { type ReactNode } from 'react';
import { Inbox, Plus } from 'lucide-react';
import Button from '../ui/Button';

interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  message = 'No data available',
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const defaultIcon = icon || <Inbox className="w-16 h-16" />;

  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 ${className}`}>
      {/* Icon */}
      <div className="relative mb-6">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-2xl animate-pulse"
          style={{
            background: 'linear-gradient(135deg, rgba(51, 57, 205, 0.2), rgba(147, 51, 234, 0.2))',
            transform: 'scale(1.5)',
          }}
        />
        
        {/* Icon container */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-100 shadow-lg">
          <div style={{ color: 'rgba(51, 57, 205, 0.6)' }}>
            {defaultIcon}
          </div>
        </div>
      </div>

      {/* Message */}
      <h3 
        className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {message}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm md:text-base text-gray-600 text-center max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="default"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl px-6 py-3 text-base font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
