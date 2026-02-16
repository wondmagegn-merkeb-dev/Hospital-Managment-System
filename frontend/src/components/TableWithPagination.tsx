import { useState, type ReactNode } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import Table, { type SortConfig, type SortDirection } from './Table';
import type { Column } from './Table';
import Pagination from './Pagination';

export type { Column };

interface TableWithPaginationProps<T> {
  // Query function that accepts page, pageSize, and optional sort params, returns { data: T[], total: number }
  queryFn: (
    page: number,
    pageSize: number,
    sortColumn?: string | null,
    sortDirection?: SortDirection
  ) => Promise<{ data: T[]; total: number }>;
  queryKey: (string | number)[];
  columns: Column<T>[];
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onRowClick?: (row: T) => void;
  initialPageSize?: number;
  itemsPerPageOptions?: number[];
  className?: string;
}

/**
 * TableWithPagination Component
 * 
 * A reusable table component with built-in pagination using TanStack Query (React Query).
 * 
 * @example
 * ```tsx
 * const columns = [
 *   { header: 'Name', accessor: 'name' },
 *   { header: 'Email', accessor: 'email' },
 *   { header: 'Role', accessor: (row) => <Badge>{row.role}</Badge> },
 * ];
 * 
 * <TableWithPagination
 *   queryFn={(page, pageSize) => getUsers(page, pageSize)}
 *   queryKey={['users']}
 *   columns={columns}
 *   onRowClick={(user) => console.log(user)}
 * />
 * ```
 */
export default function TableWithPagination<T extends { id?: number | string }>({
  queryFn,
  queryKey,
  columns,
  emptyMessage = 'No data available',
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  onRowClick,
  initialPageSize = 10,
  itemsPerPageOptions = [10, 25, 50, 100],
  className = '',
}: TableWithPaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: null,
  });

  const { data, isLoading, error } = useQuery<{ data: T[]; total: number }>({
    queryKey: [...queryKey, currentPage, pageSize, sortConfig.column, sortConfig.direction],
    queryFn: () =>
      queryFn(
        currentPage,
        pageSize,
        sortConfig.column,
        sortConfig.direction
      ),
    placeholderData: keepPreviousData,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSort = (column: string, direction: SortDirection) => {
    setSortConfig({ column, direction });
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="text-destructive mb-2">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-destructive font-medium mb-2">Error loading data</p>
          <p className="text-sm text-muted-foreground">
            Please try again or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className={className}>
      <Table
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        emptyIcon={emptyIcon}
        emptyActionLabel={emptyActionLabel}
        onEmptyAction={onEmptyAction}
        onRowClick={onRowClick}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
      {data && data.total > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={data.total}
          itemsPerPage={pageSize}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handlePageSizeChange}
          itemsPerPageOptions={itemsPerPageOptions}
        />
      )}
    </div>
  );
}
