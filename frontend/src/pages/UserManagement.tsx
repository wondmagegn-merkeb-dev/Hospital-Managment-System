import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Users, UserCheck, UserX } from 'lucide-react';
import { type Column } from '../components/TableWithPagination';
import Button from '../components/ui/Button';
import ListLayout, { type StatItem } from '../components/common/ListLayout';
import DeleteModal from '../components/common/DeleteModal';
import Tooltip from '../components/ui/Tooltip';
import UserModal from '../components/user/UserModal';
import ViewUserModal from '../components/user/ViewUserModal';
import { useCreateUser, useUpdateUser, useDeleteUser, useUsersQuery } from '../hooks/useUser';
import type { User } from '../types/user';

export default function UserManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const fetchUsers = useUsersQuery(searchTerm, roleFilter);

  const roles = ['admin', 'doctor', 'nurse', 'receptionist'];

  // Define table columns with sortable options
  const columns: Column<User>[] = [
    {
      header: 'User',
      accessor: (row: User) => (
        <div>
          <div className="font-medium">{row.full_name || row.username}</div>
          <div className="text-sm text-muted-foreground">@{row.username}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'username',
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
    },
    {
      header: 'Roles',
      accessor: (row: User) => (
        <div className="flex flex-wrap gap-1">
          {row.roles && row.roles.length > 0 ? (
            row.roles.map((role) => (
              <span
                key={role.id}
                className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
              >
                {role.name}
              </span>
            ))
          ) : (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
              No roles
            </span>
          )}
        </div>
      ),
      sortable: false,
    },
    {
      header: 'Status',
      accessor: (row: User) => {
        const statusConfig = {
          active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
          inactive: { bg: 'bg-red-100', text: 'text-red-800', label: 'Inactive' },
          suspended: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Suspended' },
        };
        const config = statusConfig[row.status] || statusConfig.inactive;
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
      sortable: true,
      sortKey: 'status',
    },
    {
      header: 'Created',
      accessor: (row: User) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
      sortable: true,
      sortKey: 'created_at',
    },
    {
      header: 'Actions',
      accessor: (row: User) => (
        <div className="flex items-center justify-end gap-2">
          <Tooltip content="View User" position="top">
            <button
              onClick={() => handleView(row)}
              className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
              aria-label="View user"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Edit User" position="top">
            <button
              onClick={() => handleEdit(row)}
              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
              aria-label="Edit user"
            >
              <Edit className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Delete User" position="top">
            <button
              onClick={() => handleDelete(row)}
              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
              aria-label="Delete user"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
      sortable: false,
      className: 'text-right',
    },
  ];

  const handleView = (user: User) => {
    setViewingUser(user);
    setViewModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        },
      });
    }
  };

  const handleUserSubmit = (data: any) => {
    if (editingUser) {
      const { password, ...updateData } = data;
      updateMutation.mutate(
        { id: editingUser.id, data: updateData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingUser(null);
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

  // Calculate stats (you can fetch these from API or calculate from data)
  const stats: StatItem[] = [
    {
      label: 'Total Users',
      value: '20',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-500',
    },
    {
      label: 'Active Users',
      value: '17',
      icon: <UserCheck className="w-6 h-6" />,
      color: 'text-green-500',
    },
    {
      label: 'Inactive Users',
      value: '3',
      icon: <UserX className="w-6 h-6" />,
      color: 'text-red-500',
    },
  ];

  return (
    <>
      <ListLayout<User>
        title="User Management"
        titleIcon={<Users className="w-6 h-6 md:w-7 md:h-7" />}
        description="Manage users and their roles"
        actionButtons={
          <Button
            onClick={() => {
              setEditingUser(null);
              setIsModalOpen(true);
            }}
            variant="default"
            size="default"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Add User</span>
          </Button>
        }
        stats={stats}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search users..."
        filters={[
          {
            label: 'Role',
            value: roleFilter,
            options: [
              { label: 'All Roles', value: 'all' },
              ...roles.map((role) => ({
                label: role.charAt(0).toUpperCase() + role.slice(1),
                value: role,
              })),
            ],
            onChange: setRoleFilter,
          },
        ]}
        queryFn={fetchUsers}
        queryKey={['users', searchTerm, roleFilter]}
        columns={columns}
        emptyMessage="No users found"
        emptyIcon={<Users className="w-16 h-16" />}
        emptyActionLabel="Add User"
        onEmptyAction={() => {
          setEditingUser(null);
          setIsModalOpen(true);
        }}
        initialPageSize={10}
        itemsPerPageOptions={[10, 25, 50, 100]}
      />

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleUserSubmit}
        editingUser={editingUser}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingUser(null);
        }}
        user={viewingUser}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and all associated data will be permanently removed."
        itemName={userToDelete ? (userToDelete.full_name || userToDelete.username) : undefined}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
