import { AlertTriangle, Loader2, X } from 'lucide-react';
import Button from '../ui/Button';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

/**
 * DeleteModal Component
 * 
 * A professional, reusable delete confirmation modal with modern UI.
 * 
 * @example
 * ```tsx
 * <DeleteModal
 *   isOpen={isDeleteModalOpen}
 *   onClose={() => setIsDeleteModalOpen(false)}
 *   onConfirm={() => handleDelete(user.id)}
 *   title="Delete User"
 *   message="Are you sure you want to delete this user? This action cannot be undone."
 *   itemName="John Doe"
 *   isLoading={deleteMutation.isPending}
 * />
 * ```
 */
export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName,
  isLoading = false,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: DeleteModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white border border-border/50 rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-fade-in transform scale-100 mx-4 relative overflow-hidden"
        style={{
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-accent/50 transition-all duration-200 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon and Title */}
        <div className="flex items-start gap-5 mb-6 relative z-10">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center border border-red-500/20 shadow-lg">
            <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={2.5} />
          </div>
          <div className="flex-1 pt-1">
            <h2 
              className="text-2xl font-bold text-gray-900 mb-3 leading-tight tracking-tight" 
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: '24px',
                lineHeight: '1.2',
                letterSpacing: '-0.02em'
              }}
            >
              {title}
            </h2>
            {itemName && (
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 shadow-sm">
                <p 
                  className="text-sm font-semibold text-gray-700" 
                  style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontSize: '13px',
                    letterSpacing: '0.01em'
                  }}
                >
                  {itemName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="mb-8 relative z-10">
          <p className="text-[15px] text-muted-foreground leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: '1.6' }}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-border/50 relative z-10 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="font-semibold text-sm"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {cancelText}
          </Button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="font-semibold text-sm h-11 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 flex items-center justify-center"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
