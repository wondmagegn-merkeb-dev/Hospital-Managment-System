import { useState, type ReactNode } from 'react';
import { Search, Filter } from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import TableWithPagination, { type Column } from '../TableWithPagination';
import type { SortDirection } from '../Table';
import { Card, CardContent } from '../ui/Card';
import Pagination from '../Pagination';
import EmptyState from './EmptyState';
import Loading from './Loading';

export interface StatItem {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string; // Tailwind color class or CSS color value
}

// Helper function to convert Tailwind color classes to actual color values
const getColorValue = (colorClass?: string): string => {
  if (!colorClass) return 'rgba(51, 57, 205, 1)'; // Default blue
  
  // If it's already a CSS color value (rgba, rgb, hex, etc.), return it
  if (colorClass.startsWith('rgba') || colorClass.startsWith('rgb') || colorClass.startsWith('#')) {
    return colorClass;
  }
  
  // Map common Tailwind color classes to actual color values
  const colorMap: Record<string, string> = {
    'text-blue-500': '#3b82f6',
    'text-blue-600': '#2563eb',
    'text-green-500': '#10b981',
    'text-green-600': '#059669',
    'text-red-500': '#ef4444',
    'text-red-600': '#dc2626',
    'text-yellow-500': '#eab308',
    'text-yellow-600': '#ca8a04',
    'text-purple-500': '#a855f7',
    'text-purple-600': '#9333ea',
    'text-indigo-500': '#6366f1',
    'text-indigo-600': '#4f46e5',
    'text-pink-500': '#ec4899',
    'text-pink-600': '#db2777',
    'text-primary': 'rgba(51, 57, 205, 1)',
  };
  
  return colorMap[colorClass] || 'rgba(51, 57, 205, 1)';
};

export interface FilterOption {
  label: string;
  value: string;
}

interface ListLayoutProps<T extends { id?: number | string }> {
  // Title section
  title: string;
  titleIcon?: ReactNode;
  description?: string;
  
  // Action buttons
  actionButtons?: ReactNode;
  
  // Stats cards
  stats?: StatItem[];
  
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  
  // Filters
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  
  // Table
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
  initialPageSize?: number;
  itemsPerPageOptions?: number[];
  
  // Additional
  className?: string;
}

/**
 * ListLayout Component
 * 
 * A comprehensive reusable layout component that includes:
 * - Title and description
 * - Action buttons
 * - Stats cards
 * - Search functionality
 * - Filters
 * - Table with pagination
 * 
 * @example
 * ```tsx
 * <ListLayout
 *   title="Users"
 *   description="Manage users and their roles"
 *   actionButtons={<Button>Add User</Button>}
 *   stats={[
 *     { label: 'Total Users', value: 100 },
 *     { label: 'Active', value: 85 },
 *   ]}
 *   searchValue={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   filters={[{
 *     label: 'Role',
 *     value: roleFilter,
 *     options: [{ label: 'All', value: 'all' }, ...],
 *     onChange: setRoleFilter,
 *   }]}
 *   queryFn={fetchUsers}
 *   queryKey={['users']}
 *   columns={columns}
 * />
 * ```
 */
export default function ListLayout<T extends { id?: number | string }>({
  title,
  titleIcon,
  description,
  actionButtons,
  stats = [],
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  queryFn,
  queryKey,
  columns,
  emptyMessage = 'No data available',
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  initialPageSize = 10,
  itemsPerPageOptions = [10, 25, 50, 100],
  className = '',
}: ListLayoutProps<T>) {
  return (
    <div className={`space-y-4 md:space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3" style={{ color: 'rgba(51, 57, 205, 1)' }}>
            {titleIcon && <span className="flex-shrink-0">{titleIcon}</span>}
            <span className="text-2xl sm:text-3xl font-bold truncate">{title}</span>
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actionButtons && (
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
            {actionButtons}
          </div>
        )}
      </div>

      {/* Stats Section */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm border border-border/50 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">{stat.label}</p>
                  <p 
                    className="text-2xl sm:text-3xl font-semibold truncate" 
                    style={{ color: getColorValue(stat.color) }}
                  >
                    {stat.value}
                  </p>
                </div>
                {stat.icon && (
                  <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-accent to-accent/50 shadow-lg flex-shrink-0 ${stat.color || 'text-primary'}`}>
                    {stat.icon}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Combined Card: Filters, Table, and Pagination */}
      <Card>
        <CardContent className="p-0">
          {/* Search and Filters Section */}
          {(onSearchChange || filters.length > 0) && (
            <div className="p-3 md:p-4 border-b border-border">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 md:gap-4">
                {/* Search */}
                {onSearchChange && (
                  <div className="relative w-full lg:flex-1 lg:max-w-md group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchValue || ''}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-input bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50"
                    />
                  </div>
                )}

                {/* Filters */}
                {filters.length > 0 && (
                  <div className="flex flex-col sm:flex-row lg:items-center items-start gap-2 sm:gap-3 lg:flex-shrink-0">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Filter className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">Filters:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {filters.map((filter, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 flex-1 sm:flex-initial">
                          <label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap sm:inline hidden sm:block">
                            {filter.label}:
                          </label>
                          <select
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                            className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 border-input bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50 min-w-[120px] font-medium"
                          >
                            {filter.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Table with Pagination - Desktop */}
          <div className={`${onSearchChange || filters.length > 0 ? '' : 'p-4 md:p-6'} hidden md:block`}>
            <TableWithPagination
              queryFn={queryFn}
              queryKey={queryKey}
              columns={columns}
              emptyMessage={emptyMessage}
              emptyIcon={emptyIcon}
              emptyActionLabel={emptyActionLabel}
              onEmptyAction={onEmptyAction}
              initialPageSize={initialPageSize}
              itemsPerPageOptions={itemsPerPageOptions}
            />
          </div>

          {/* Mobile Card View */}
          <MobileCardView
            queryFn={queryFn}
            queryKey={queryKey}
            columns={columns}
            emptyMessage={emptyMessage}
            emptyIcon={emptyIcon}
            initialPageSize={initialPageSize}
            itemsPerPageOptions={itemsPerPageOptions}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Mobile Card View Component
interface MobileCardViewProps<T extends { id?: number | string }> {
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
  initialPageSize?: number;
  itemsPerPageOptions?: number[];
}

function MobileCardView<T extends { id?: number | string }>({
  queryFn,
  queryKey,
  columns,
  emptyMessage = 'No data available',
  emptyIcon,
  initialPageSize = 10,
  itemsPerPageOptions = [10, 25, 50, 100],
}: MobileCardViewProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const { data, isLoading, error } = useQuery<{ data: T[]; total: number }>({
    queryKey: [...queryKey, currentPage, pageSize],
    queryFn: () => queryFn(currentPage, pageSize, null, null),
    placeholderData: keepPreviousData,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const renderCell = (row: T, column: Column<T>): ReactNode => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    const value = row[column.accessor];
    return String(value ?? '');
  };

  // Filter out Actions column for mobile (or show it differently)
  const displayColumns = columns.filter(col => col.header !== 'Actions');
  const actionsColumn = columns.find(col => col.header === 'Actions');

  if (error) {
    return (
      <div className="p-4 md:hidden">
        <div className="text-center text-destructive">
          <p className="font-medium">Error loading data</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 md:hidden">
        <Loading message="Loading data..." size="md" />
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="p-4 md:hidden">
        <EmptyState message={emptyMessage} icon={emptyIcon} className="p-4" />
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / pageSize);

  return (
    <div className="md:hidden space-y-4 p-4">
      {/* Mobile Cards */}
      <div className="space-y-4">
        {data.data.map((row) => (
          <div
            key={row.id ?? Math.random()}
            className="relative bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] transition-shadow duration-200"
          >
            <div className="p-5">
              <div className="space-y-4">
                {displayColumns.map((column, index) => {
                  const isFirstColumn = index === 0;
                  const isLastDataColumn = index === displayColumns.length - 1;
                  const cellContent = renderCell(row, column);
                  
                  return (
                    <div 
                      key={index}
                      className={!isLastDataColumn ? 'pb-4 border-b border-gray-100' : ''}
                    >
                      <div>
                        <div className="mb-1.5">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.05em]">
                            {column.header}
                          </span>
                        </div>
                        <div className={`${
                          isFirstColumn 
                            ? 'text-[15px] font-semibold text-gray-900' 
                            : 'text-sm font-normal text-gray-800'
                        }`}>
                          {cellContent}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {actionsColumn && (
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex items-center justify-end gap-2">
                    {renderCell(row, actionsColumn)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Pagination */}
      {data.total > 0 && (
        <div className="pt-3 border-t border-border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={data.total}
            itemsPerPage={pageSize}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handlePageSizeChange}
            itemsPerPageOptions={itemsPerPageOptions}
          />
        </div>
      )}
    </div>
  );
}
