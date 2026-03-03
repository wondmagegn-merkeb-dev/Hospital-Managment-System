import { useState, useMemo } from 'react';
import { Plus, Edit, Eye, Users, UserCheck, UserX, UserCircle } from 'lucide-react';
import { SUPER_ADMIN_ROLE_NAME } from '../config/constants';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { type Column } from '../components/TableWithPagination';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ListLayout, { type StatItem } from '../components/common/ListLayout';
import Tooltip from '../components/ui/Tooltip';
import UserModal from '../components/user/UserModal';
import ViewUserModal from '../components/user/ViewUserModal';
import { useCreateUser, useUpdateUser, useUsersQuery } from '../hooks/useUser';
import { getUsersPaginated } from '../services/userService';
import { getRoles } from '../services/roleService';
import type { User } from '../types/user';

export default function UserManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const fetchUsers = useUsersQuery(searchTerm, roleFilter);

  // Fetch roles for filter dropdown
  const { data: roles } = useQuery({
    queryKey: ['roles', 'all'],
    queryFn: () => getRoles(),
  });

  // Fetch stats - get all users with large page size to calculate stats
  const { data: statsData } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => getUsersPaginated(1, 1000, null, null, '', 'all'),
    staleTime: 30000, // Cache for 30 seconds
  });

  // Calculate stats from fetched data
  const stats: StatItem[] = useMemo(() => {
    if (!statsData) {
      return [
        {
          label: 'Total Users',
          value: '0',
          icon: <Users className="w-6 h-6" />,
          color: 'text-blue-500',
        },
        {
          label: 'Active Users',
          value: '0',
          icon: <UserCheck className="w-6 h-6" />,
          color: 'text-green-500',
        },
        {
          label: 'Inactive Users',
          value: '0',
          icon: <UserX className="w-6 h-6" />,
          color: 'text-red-500',
        },
        {
          label: 'Suspended Users',
          value: '0',
          icon: <UserCircle className="w-6 h-6" />,
          color: 'text-yellow-500',
        },
      ];
    }

    const total = statsData.total;
    const activeCount = statsData.data.filter((user) => user.status === 'active').length;
    const inactiveCount = statsData.data.filter((user) => user.status === 'inactive').length;
    const suspendedCount = statsData.data.filter((user) => user.status === 'suspended').length;

    // If we have all users (total <= 1000), use exact counts, otherwise estimate
    const sampleSize = statsData.data.length;
    const active = total <= 1000 ? activeCount : Math.round((activeCount / sampleSize) * total);
    const inactive = total <= 1000 ? inactiveCount : Math.round((inactiveCount / sampleSize) * total);
    const suspended = total <= 1000 ? suspendedCount : Math.round((suspendedCount / sampleSize) * total);

    return [
      {
        label: 'Total Users',
        value: total.toString(),
        icon: <Users className="w-6 h-6" />,
        color: 'text-blue-500',
      },
      {
        label: 'Active Users',
        value: active.toString(),
        icon: <UserCheck className="w-6 h-6" />,
        color: 'text-green-500',
      },
      {
        label: 'Inactive Users',
        value: inactive.toString(),
        icon: <UserX className="w-6 h-6" />,
        color: 'text-red-500',
      },
      {
        label: 'Suspended Users',
        value: suspended.toString(),
        icon: <UserCircle className="w-6 h-6" />,
        color: 'text-yellow-500',
      },
    ];
  }, [statsData]);

  // Define table columns with sortable options
  const columns: Column<User>[] = [
    {
      header: 'Full Name',
      accessor: (row: User) => (
        <div className="font-medium">{row.full_name || 'N/A'}</div>
      ),
      sortable: true,
      sortKey: 'full_name',
    },
    {
      header: 'Username',
      accessor: (row: User) => (
        <div className="text-sm text-gray-900">{row.username}</div>
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
              <Tooltip key={role.id} content={role.name} position="top">
                <Badge>{role.name}</Badge>
              </Tooltip>
            ))
          ) : (
            <Badge variant="secondary">No roles</Badge>
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
      header: 'Actions',
      accessor: (row: User) => {
        const isSuperAdmin = row.roles?.some((r) => r.name === SUPER_ADMIN_ROLE_NAME);
        return (
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
            {!isSuperAdmin && (
              <Tooltip content="Edit User" position="top">
                <button
                  onClick={() => handleEdit(row)}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                  aria-label="Edit user"
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

  const handleView = (user: User) => {
    setViewingUser(user);
    setViewModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleUserSubmit = (data: any) => {
    if (editingUser) {
      const { password, ...updateData } = data;
      updateMutation.mutate(
        { id: editingUser.id, data: updateData },
        {
          onSuccess: () => {
            toast.success('User updated successfully');
            setIsModalOpen(false);
            setEditingUser(null);
          },
          onError: (err) => {
            const message = getErrorMessage(err);
            toast.error(message);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success('User created successfully. Login credentials sent to their email.');
          setIsModalOpen(false);
        },
        onError: (err) => {
          const message = getErrorMessage(err);
          toast.error(message);
        },
      });
    }
  };

  const getErrorMessage = (err: unknown) => {
    const detail = (err as any)?.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d: any) => d?.msg || d?.message || JSON.stringify(d)).join(', ');
    }
    return (err as any)?.message || 'An error occurred';
  };

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
              ...(roles || [])
                .filter((role) => role.name !== SUPER_ADMIN_ROLE_NAME)
                .map((role) => ({
                  label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
                  value: role.name,
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
          createMutation.reset();
          updateMutation.reset();
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
    </>
  );
}
