import { X } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import type { User } from '../../types/user';
import Tooltip from '../ui/Tooltip';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function ViewUserModal({
  isOpen,
  onClose,
  user,
}: ViewUserModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white border border-border/50 rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-fade-in transform scale-100 mx-4 relative overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-accent/50 transition-all duration-200 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2
          className="text-2xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: '24px',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
          }}
        >
          User Details
        </h2>

        {/* User Information */}
        <div className="space-y-6">
          {/* User Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="text-base font-medium text-gray-900">
                {user.full_name || 'N/A'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="text-base font-medium text-gray-900">
                @{user.username}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="text-base font-medium text-gray-900">
                {user.email}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Roles
              </label>
              <div className="flex flex-wrap gap-1">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <Tooltip key={role.id} content={role.description || ''} position="top">
                      <Badge>{role.name}</Badge>
                    </Tooltip>
                  ))
                ) : (
                  <Badge variant="secondary">No roles assigned</Badge>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Status
              </label>
              <div>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : user.status === 'suspended'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border flex justify-end">
          <Button
            onClick={onClose}
            variant="default"
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
