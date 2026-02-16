import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Button from '../ui/Button';
import { getRolePermissions } from '../../services/roleService';
import type { Role, Permission } from '../../types/role';

interface ViewRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

export default function ViewRoleModal({
  isOpen,
  onClose,
  role,
}: ViewRoleModalProps) {
  // Fetch role permissions
  const { data: rolePermissions } = useQuery({
    queryKey: ['rolePermissions', role?.id],
    queryFn: () => role ? getRolePermissions(role.id) : Promise.resolve([]),
    enabled: isOpen && !!role,
  });

  if (!isOpen || !role) return null;

  // Parse permission name to extract action and resource
  const parsePermission = (name: string) => {
    const parts = name.split('_');
    if (parts.length >= 2) {
      const action = parts[0];
      const resource = parts.slice(1).join('_');
      return { action, resource };
    }
    return { action: name, resource: '' };
  };

  // Group permissions by module, then by resource
  const permissionsByModule = (rolePermissions || []).reduce((acc, rp) => {
    if (!rp.permission) return acc;
    const permission = rp.permission;
    const module = permission.module || 'Other';
    if (!acc[module]) {
      acc[module] = {};
    }
    const { resource } = parsePermission(permission.name);
    if (!acc[module][resource]) {
      acc[module][resource] = [];
    }
    acc[module][resource].push(permission);
    return acc;
  }, {} as Record<string, Record<string, Permission[]>>);

  // CRUD action labels
  const actionLabels: Record<string, string> = {
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    view: 'View',
    assign: 'Assign',
  };

  // Format resource name
  const formatResource = (resource: string): string => {
    if (!resource) return '';
    return resource
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
        className="bg-white border border-border/50 rounded-3xl p-8 w-full max-w-3xl shadow-2xl animate-fade-in transform scale-100 mx-4 relative overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-accent/50 transition-all duration-200 text-muted-foreground hover:text-foreground z-10"
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
          Role Details
        </h2>

        {/* Role Information */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Role Name
              </label>
              <div className="text-base font-medium text-gray-900">
                {role.name}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Created At
              </label>
              <div className="text-base font-medium text-gray-900">
                {new Date(role.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Description
              </label>
              <div className="text-base font-medium text-gray-900">
                {role.description || <span className="text-gray-400">No description</span>}
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Permissions ({rolePermissions?.length || 0})
            </label>
            {rolePermissions && rolePermissions.length > 0 ? (
              <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <div className="space-y-5">
                  {Object.entries(permissionsByModule).map(([module, resources]) => (
                    <div key={module} className="border-b border-gray-200 last:border-b-0 pb-5 last:pb-0">
                      <h4 className="font-bold text-gray-900 text-base mb-3">
                        {module}
                      </h4>
                      <div className="space-y-4 pl-2">
                        {Object.entries(resources).map(([resource, resourcePermissions]) => (
                          <div key={resource} className="bg-white rounded-lg p-3 border border-gray-200">
                            <h5 className="font-semibold text-gray-800 text-sm mb-2">
                              {formatResource(resource)}
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {resourcePermissions
                                .sort((a, b) => {
                                  const { action: aAction } = parsePermission(a.name);
                                  const { action: bAction } = parsePermission(b.name);
                                  const order = ['create', 'view', 'update', 'delete', 'assign'];
                                  return order.indexOf(aAction) - order.indexOf(bAction);
                                })
                                .map((permission) => {
                                  const { action } = parsePermission(permission.name);
                                  return (
                                    <span
                                      key={permission.id}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {actionLabels[action] || action.charAt(0).toUpperCase() + action.slice(1)}
                                    </span>
                                  );
                                })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-2 border-gray-200 rounded-xl p-8 bg-gray-50 text-center">
                <p className="text-sm text-gray-500">No permissions assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-border flex justify-end flex-shrink-0">
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
