/**
 * Table and Pagination Components Usage Examples
 * 
 * These components use TanStack Query (React Query) for data fetching and state management.
 */

// import Table from './Table';
// import Pagination from './Pagination';
// import TableWithPagination from './TableWithPagination';
// import { getUsers } from '../services/userService';

// Example 1: Using Table component standalone
// ===========================================
/*
interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
}

function UserTableExample() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const columns = [
    { header: 'Email', accessor: 'email' },
    { header: 'Username', accessor: 'username' },
    { 
      header: 'Full Name', 
      accessor: (row: User) => row.full_name || 'N/A' 
    },
    { 
      header: 'Role', 
      accessor: (row: User) => (
        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
          {row.role}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: (row: User) => (
        <span className={row.is_active ? 'text-green-600' : 'text-red-600'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  return (
    <Table
      data={users}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No users found"
      onRowClick={(user) => console.log('Clicked:', user)}
    />
  );
}
*/

// Example 2: Using Pagination component standalone
// ==================================================
/*
function PaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 100;
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={pageSize}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={setPageSize}
      itemsPerPageOptions={[10, 25, 50, 100]}
    />
  );
}
*/

// Example 3: Using TableWithPagination with Sortable Columns (Recommended)
// ========================================================================
/*
function UserTableWithPaginationExample() {
  // Define columns with sortable option
  const columns = [
    { 
      header: 'Email', 
      accessor: 'email',
      sortable: true, // Enable sorting for this column
    },
    { 
      header: 'Username', 
      accessor: 'username',
      sortable: true,
    },
    { 
      header: 'Full Name', 
      accessor: (row: User) => row.full_name || 'N/A',
      sortable: true,
      sortKey: 'full_name', // Use sortKey when accessor is a function
    },
    { 
      header: 'Role', 
      accessor: (row: User) => (
        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
          {row.role}
        </span>
      ),
      sortable: true,
      sortKey: 'role', // Specify sortKey for function-based accessors
    },
    { 
      header: 'Status', 
      accessor: (row: User) => (
        <span className={row.is_active ? 'text-green-600' : 'text-red-600'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
      sortable: false, // Disable sorting for this column
    },
  ];

  // Query function that accepts page, pageSize, sortColumn, and sortDirection
  const fetchUsers = async (
    page: number, 
    pageSize: number,
    sortColumn?: string | null,
    sortDirection?: 'asc' | 'desc' | null
  ) => {
    // Build query params
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
    });
    
    if (sortColumn && sortDirection) {
      params.append('sort_by', sortColumn);
      params.append('sort_order', sortDirection);
    }

    const response = await fetch(`/api/users?${params.toString()}`);
    const result = await response.json();
    return {
      data: result.users,
      total: result.total,
    };
  };

  return (
    <TableWithPagination
      queryFn={fetchUsers}
      queryKey={['users']}
      columns={columns}
      emptyMessage="No users found"
      initialPageSize={10}
      itemsPerPageOptions={[10, 25, 50, 100]}
      onRowClick={(user) => console.log('Clicked:', user)}
    />
  );
}
*/

// Example 4: Backend API endpoint structure (for reference)
// ==========================================================
/*
// Your backend should support pagination like this:
// GET /api/users?page=1&limit=10

// Response format:
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "username": "user1",
      "full_name": "John Doe",
      "role": "admin",
      "is_active": true
    }
  ],
  "total": 100,  // Total number of items (for pagination)
  "page": 1,
  "limit": 10,
  "total_pages": 10
}

// Or you can use offset/limit:
// GET /api/users?offset=0&limit=10
*/

// Example 5: Updating userService to support pagination
// =====================================================
/*
// In services/userService.ts:

export const getUsersPaginated = async (page = 1, pageSize = 10) => {
  const response = await api.get(`/users?page=${page}&limit=${pageSize}`);
  return {
    data: response.data.users || response.data,
    total: response.data.total || response.data.count || 0,
  };
};

// Then use it:
const fetchUsers = async (page: number, pageSize: number) => {
  return await getUsersPaginated(page, pageSize);
};
*/

export default function TableExample() {
  return null; // This is just for documentation/examples
}
