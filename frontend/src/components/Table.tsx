import { useState, useMemo, type ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import EmptyState from './common/EmptyState';
import Loading from './common/Loading';

export type SortDirection = 'asc' | 'desc';

export interface Column<T> {
  header: string | ReactNode;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  sortKey?: keyof T;
  className?: string;
}

interface TableProps<T extends { id?: number | string }> {
  columns: Column<T>[];
  data: T[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  sortColumn: keyof T | null;
  sortDirection: SortDirection;
  onSort: (column: keyof T) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  className?: string;
}

export default function Table<T extends { id?: number | string }>({
  columns,
  data,
  total,
  isLoading,
  error,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  emptyMessage = 'No data to display',
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  className = '',
}: TableProps<T>) {
  const [internalSortColumn, setInternalSortColumn] = useState<keyof T | null>(sortColumn);
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(sortDirection);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    const sortKey = typeof column.accessor === 'string' 
      ? column.accessor 
      : column.sortKey;

    if (!sortKey) return;

    const newSortDirection = 
      internalSortColumn === sortKey && internalSortDirection === 'asc' 
      ? 'desc' 
      : 'asc';

    setInternalSortColumn(sortKey);
    setInternalSortDirection(newSortDirection);
    onSort(sortKey);
  };

  const renderCell = (row: T, column: Column<T>): ReactNode => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    const value = row[column.accessor];
    return String(value ?? '');
  };

  const memoizedColumns = useMemo(() => columns, [columns]);

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive font-medium">Error: {error.message}</p>
      </div>
    );
  }

  if (isLoading && total === 0) {
    return <Loading message="Loading data..." className="py-10" />;
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-primary to-accent">
              {memoizedColumns.map((column, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(column)}
                  className={`px-6 py-4 text-left text-sm font-semibold text-primary-foreground first:rounded-l-lg last:rounded-r-lg ${
                    column.className || ''
                  } ${
                    column.sortable
                      ? 'cursor-pointer hover:bg-black/10 select-none transition-colors duration-200'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable && internalSortColumn === column.accessor && (
                      <span className="transition-transform duration-200">
                        {internalSortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {data.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState 
                    message={emptyMessage} 
                    icon={emptyIcon} 
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                  />
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={row.id ?? rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`${
                    rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } ${
                    !!onRowClick 
                      ? 'cursor-pointer hover:bg-gray-100' 
                      : ''
                  }`}
                >
                  {memoizedColumns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
