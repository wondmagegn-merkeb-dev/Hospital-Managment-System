import { useState } from 'react';
import { Plus, Edit, Shield, Eye } from 'lucide-react';
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

  // Define table columns
  const columns: Column<Role>[] = [
    {
      header: 'Name',
      accessor: (row: Role) => (
        <span className="font-medium text-gray-900">{row.name}</span>
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
      accessor: (row: Role) => (
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
        </div>
      ),
      sortable: false,
      className: 'text-right',
    },
  ];

  const handleRoleSubmit = (data: any) => {
    if (editingRole) {
      updateMutation.mutate(
        { id: editingRole.id, data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingRole(null);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
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
