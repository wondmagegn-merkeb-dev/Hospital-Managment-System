import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Button from '../ui/Button';
import { createRoleSchema, updateRoleSchema, type RoleFormData } from '../../validation/role';
import { getPermissions, getRolePermissions } from '../../services/roleService';
import type { Role, Permission } from '../../types/role';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData & { permissionIds?: number[] }) => void;
  editingRole?: Role | null;
  isLoading?: boolean;
}

export default function RoleModal({
  isOpen,
  onClose,
  onSubmit,
  editingRole,
  isLoading = false,
}: RoleModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // Fetch all permissions
  const { data: permissions } = useQuery({
    queryKey: ['permissions', 'all'],
    queryFn: () => getPermissions(),
    enabled: isOpen,
  });

  // Fetch role permissions when editing
  const { data: rolePermissions } = useQuery({
    queryKey: ['rolePermissions', editingRole?.id],
    queryFn: () => editingRole ? getRolePermissions(editingRole.id) : Promise.resolve([]),
    enabled: isOpen && !!editingRole,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(editingRole ? updateRoleSchema : createRoleSchema),
    defaultValues: editingRole
      ? {
          name: editingRole.name,
          description: editingRole.description || '',
        }
      : {
          name: '',
          description: '',
        },
  });

  // Reset form and permissions when modal opens/closes or editingRole changes
  useEffect(() => {
    if (isOpen) {
      if (editingRole && rolePermissions) {
        reset({
          name: editingRole.name,
          description: editingRole.description || '',
        });
        setSelectedPermissions(rolePermissions.map(rp => rp.permission_id));
      } else {
        reset({
          name: '',
          description: '',
        });
        setSelectedPermissions([]);
      }
    }
  }, [isOpen, editingRole, rolePermissions, reset]);

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleModulePermissions = (modulePermissions: Permission[]) => {
    if (!modulePermissions || modulePermissions.length === 0) return;
    
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Deselect all permissions in this module
      setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)));
    } else {
      // Select all permissions in this module
      setSelectedPermissions(prev => {
        const newSelection = [...prev];
        modulePermissionIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const toggleResourcePermissions = (resourcePermissions: Permission[]) => {
    if (!resourcePermissions || resourcePermissions.length === 0) return;
    
    const resourcePermissionIds = resourcePermissions.map(p => p.id);
    const allSelected = resourcePermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Deselect all permissions for this resource
      setSelectedPermissions(prev => prev.filter(id => !resourcePermissionIds.includes(id)));
    } else {
      // Select all permissions for this resource
      setSelectedPermissions(prev => {
        const newSelection = [...prev];
        resourcePermissionIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const areAllModulePermissionsSelected = (modulePermissions: Permission[]): boolean => {
    if (!modulePermissions || modulePermissions.length === 0) return false;
    return modulePermissions.every(p => selectedPermissions.includes(p.id));
  };

  const areAllResourcePermissionsSelected = (resourcePermissions: Permission[]): boolean => {
    if (!resourcePermissions || resourcePermissions.length === 0) return false;
    return resourcePermissions.every(p => selectedPermissions.includes(p.id));
  };

  const onFormSubmit = (data: RoleFormData) => {
    onSubmit({
      ...data,
      permissionIds: selectedPermissions,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100/50 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingRole ? 'Edit Role' : 'Create Role'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                errors.name
                  ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
                  : 'border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50'
              } focus:outline-none`}
              placeholder="e.g., Admin, Doctor"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                errors.description
                  ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
                  : 'border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50'
              } focus:outline-none resize-none`}
              placeholder="Role description (optional)"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Permissions by Module */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions
            </label>
            <div className="border-2 border-gray-200 rounded-xl p-4 max-h-96 overflow-y-auto bg-gray-50">
              {permissions && permissions.length > 0 ? (
                (() => {
                  // Parse permission name to extract action and resource
                  const parsePermission = (name: string) => {
                    const parts = name.split('_');
                    if (parts.length >= 2) {
                      const action = parts[0]; // create, update, delete, view, assign
                      const resource = parts.slice(1).join('_'); // user, role, patient, etc.
                      return { action, resource };
                    }
                    return { action: name, resource: '' };
                  };

                  // Group permissions by module, then by resource
                  const permissionsByModule = permissions.reduce((acc, permission) => {
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
                  }, {} as Record<string, Record<string, typeof permissions>>);

                  // CRUD action labels
                  const actionLabels: Record<string, string> = {
                    create: 'Create',
                    update: 'Update',
                    delete: 'Delete',
                    view: 'View',
                    assign: 'Assign',
                  };

                  // Format resource name (e.g., "user" -> "Users", "role" -> "Roles")
                  const formatResource = (resource: string): string => {
                    if (!resource) return '';
                    return resource
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
                  };

                  return (
                    <div className="space-y-5">
                      {Object.entries(permissionsByModule).map(([module, resources]) => {
                        // Get all permissions for this module
                        const modulePermissions = Object.values(resources).flat();
                        const allModuleSelected = areAllModulePermissionsSelected(modulePermissions);
                        
                        return (
                          <div key={module} className="border-b border-gray-200 last:border-b-0 pb-5 last:pb-0">
                            {/* Module Header with Select All */}
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-gray-900 text-base">
                                {module}
                              </h4>
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={allModuleSelected}
                                  onChange={() => toggleModulePermissions(modulePermissions)}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">
                                  Select All
                                </span>
                              </label>
                            </div>
                            <div className="space-y-4 pl-2">
                              {Object.entries(resources).map(([resource, resourcePermissions]) => {
                                const allResourceSelected = areAllResourcePermissionsSelected(resourcePermissions);
                                
                                return (
                                  <div key={resource} className="bg-white rounded-lg p-3 border border-gray-200">
                                    {/* Resource Header with Select All */}
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-semibold text-gray-800 text-sm">
                                        {formatResource(resource)}
                                      </h5>
                                      <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                          type="checkbox"
                                          checked={allResourceSelected}
                                          onChange={() => toggleResourcePermissions(resourcePermissions)}
                                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                                          Select All
                                        </span>
                                      </label>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                                            <label
                                              key={permission.id}
                                              className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-50 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                                            >
                                              <input
                                                type="checkbox"
                                                checked={selectedPermissions.includes(permission.id)}
                                                onChange={() => togglePermission(permission.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                                              />
                                              <span className="text-xs font-medium text-gray-700">
                                                {actionLabels[action] || action.charAt(0).toUpperCase() + action.slice(1)}
                                              </span>
                                            </label>
                                          );
                                        })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No permissions available
                </p>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Select the permissions that this role should have. Permissions are organized by module and resource.
            </p>
          </div>
          </div>

          {/* Form Actions - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white p-6 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="font-semibold text-sm"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
              className="font-semibold text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {isLoading 
                ? 'Saving...' 
                : editingRole 
                  ? 'Update' 
                  : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
