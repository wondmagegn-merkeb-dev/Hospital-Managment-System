import { useState } from 'react';
import { Plus, Edit, Shield, Eye } from 'lucide-react';
import { SUPER_ADMIN_ROLE_NAME } from '../config/constants';
import { toast } from 'sonner';
import { type Column } from '../components/TableWithPagination';
import Button from '../components/ui/Button';
import ListLayout from '../components/common/ListLayout';
import Tooltip from '../components/ui/Tooltip';
import RoleModal from '../components/role/RoleModal';
import ViewRoleModal from '../components/role/ViewRoleModal';
import { useCreateRole, useUpdateRole } from '../hooks/useRole';
import { getRolesPaginated } from '../services/roleService';
import type { Role } from '../types/role';

export default function RoleManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  
  // Query function for ListLayout
  const fetchRoles = async (
    page: number,
    pageSize: number,
    sortColumn?: string | null,
    sortDirection?: 'asc' | 'desc' | null
  ) => {
    const result = await getRolesPaginated(page, pageSize, sortColumn, sortDirection, searchTerm);
    return result;
  };

  // Helper to format permissions for table display
  const formatPermissionsForTable = (permissions?: Record<string, string[]>) => {
    if (!permissions || Object.keys(permissions).length === 0) {
      return <span className="text-gray-400 text-sm">No permissions</span>;
    }
    const entries = Object.entries(permissions).filter(([_, actions]) => actions?.length > 0);
    const totalCount = entries.reduce((sum, [_, actions]) => sum + (actions?.length || 0), 0);

    // Get up to three items for display
    const topEntries = entries.slice(0, 3);

    return (
      <div className="flex flex-wrap gap-1 items-center">
        {topEntries.map(([resource, actions]) => {
          const label =
            resource
              .split('_')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');

          // Tooltip per resource label
          const tooltipContent =
            `${label}: ${(actions || []).map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}`;

          return (
            <Tooltip key={label} content={tooltipContent} position="top">
              <span
                className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
              >
                {label}
              </span>
            </Tooltip>
          );
        })}
        {entries.length > 3 && (
          <Tooltip
            content={
              entries
                .slice(3)
                .map(([resource, actions]) => {
                  const label = resource
                    .split('_')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                  return `${label}: ${(actions || []).map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}`;
                })
                .join(' • ')
            }
            position="top"
          >
            <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
              +{entries.length - 3} more
            </span>
          </Tooltip>
        )}
        <span className="text-xs text-gray-500 ml-1">({totalCount})</span>
      </div>
    );
  };

  // Define table columns
  const columns: Column<Role>[] = [
    {
      header: 'Name',
      accessor: (row: Role) => (
        <span className="font-medium text-gray-900 flex items-center gap-2">
          {row.name}
          {row.name === SUPER_ADMIN_ROLE_NAME && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
              System Role
            </span>
          )}
        </span>
      ),
      sortable: true,
      sortKey: 'name',
    },
    {
      header: 'Description',
      accessor: (row: Role) => (
        <span className="text-sm text-gray-600">
          {row.description || <span className="text-gray-400">No description</span>}
        </span>
      ),
      sortable: true,
      sortKey: 'description',
    },
    {
      header: 'Permissions',
      accessor: (row: Role) => formatPermissionsForTable(row.permissions),
      sortable: false,
    },
    {
      header: 'Created',
      accessor: (row: Role) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
      sortable: true,
      sortKey: 'created_at',
    },
    {
      header: 'Actions',
      accessor: (row: Role) => {
        const isSuperAdmin = row.name === SUPER_ADMIN_ROLE_NAME;
        return (
          <div className="flex items-center justify-end gap-2">
            <Tooltip content="View Role" position="top">
              <button
                onClick={() => {
                  setViewingRole(row);
                  setViewModalOpen(true);
                }}
                className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                aria-label="View role"
              >
                <Eye className="w-4 h-4" />
              </button>
            </Tooltip>
            {!isSuperAdmin && (
              <Tooltip content="Edit Role" position="top">
                <button
                  onClick={() => {
                    setEditingRole(row);
                    setIsModalOpen(true);
                  }}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                  aria-label="Edit role"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </Tooltip>
            )}
          </div>
        );
      },
      sortable: false,
      className: 'text-right',
    },
  ];

  const getErrorMessage = (err: unknown) => {
    const detail = (err as any)?.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d: any) => d?.msg || d?.message || JSON.stringify(d)).join(', ');
    }
    return (err as any)?.message || 'An error occurred';
  };

  const handleRoleSubmit = (data: any) => {
    if (editingRole) {
      updateMutation.mutate(
        { id: editingRole.id, data },
        {
          onSuccess: () => {
            toast.success('Role updated successfully');
            setIsModalOpen(false);
            setEditingRole(null);
          },
          onError: (err) => {
            toast.error(getErrorMessage(err));
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success('Role created successfully');
          setIsModalOpen(false);
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      });
    }
  };


  return (
    <>
      <ListLayout<Role>
        title="Roles & Permissions"
        titleIcon={<Shield className="w-6 h-6" />}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search roles..."
        queryFn={fetchRoles}
        queryKey={['roles', searchTerm]}
        columns={columns}
        emptyIcon={<Shield className="w-16 h-16" />}
        emptyMessage="No roles found"
        emptyActionLabel="Add Role"
        onEmptyAction={() => setIsModalOpen(true)}
        initialPageSize={10}
        itemsPerPageOptions={[10, 25, 50, 100]}
        actionButtons={
          <Button
            onClick={() => {
              setEditingRole(null);
              setIsModalOpen(true);
            }}
            variant="default"
            size="default"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Add Role</span>
          </Button>
        }
      />

      <RoleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRole(null);
        }}
        onSubmit={handleRoleSubmit}
        editingRole={editingRole}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* View Role Modal */}
      <ViewRoleModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingRole(null);
        }}
        role={viewingRole}
      />
    </>
  );
}
