import type { ReactNode } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import EmptyState from './common/EmptyState';
import Loading from './common/Loading';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  sortable?: boolean;
  sortKey?: string; // Optional key for sorting (useful when accessor is a function)
}

export interface SortConfig {
  column: string | null;
  direction: SortDirection;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onRowClick?: (row: T) => void;
  className?: string;
  sortConfig?: SortConfig;
  onSort?: (column: string, direction: SortDirection) => void;
}

export default function Table<T extends { id?: number | string }>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  onRowClick,
  className = '',
  sortConfig,
  onSort,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg">
        <Loading message="Loading data..." size="md" />
      </div>
    );
  }

  const renderCell = (row: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return String(row[column.accessor] ?? '');
  };

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;

    const sortKey = column.sortKey || (typeof column.accessor === 'string' ? column.accessor : column.header.toLowerCase());
    const currentColumn = sortConfig?.column;
    const currentDirection = sortConfig?.direction;

    let newDirection: SortDirection = 'asc';
    if (currentColumn === sortKey) {
      if (currentDirection === 'asc') {
        newDirection = 'desc';
      } else if (currentDirection === 'desc') {
        newDirection = null;
      }
    }

    onSort(sortKey, newDirection);
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    const sortKey = column.sortKey || (typeof column.accessor === 'string' ? column.accessor : column.header.toLowerCase());
    const isActive = sortConfig?.column === sortKey;
    const direction = sortConfig?.direction;

    if (!isActive) {
      return <ArrowUpDown className="w-4 h-4 text-white/70" />;
    }

    if (direction === 'asc') {
      return <ArrowUp className="w-4 h-4 text-white" />;
    }

    if (direction === 'desc') {
      return <ArrowDown className="w-4 h-4 text-white" />;
    }

    return <ArrowUpDown className="w-4 h-4 text-white/70" />;
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: 'rgba(51, 57, 205, 1)' }}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(column)}
                  className={`px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider ${
                    index === 0 ? 'rounded-tl-lg' : ''
                  } ${
                    index === columns.length - 1 ? 'rounded-tr-lg' : ''
                  } ${
                    column.className || ''
                  } ${
                    column.sortable && onSort
                      ? 'cursor-pointer hover:bg-white/10 select-none transition-all duration-200'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {data.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <div className="bg-card border-x border-b border-border rounded-b-lg">
                    <EmptyState 
                      message={emptyMessage}
                      icon={emptyIcon}
                      actionLabel={emptyActionLabel}
                      onAction={onEmptyAction}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-border/50">
              {data.map((row, rowIndex) => (
                <tr
                  key={row.id ?? rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-all duration-200 ${
                    rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } ${
                    onRowClick 
                      ? 'cursor-pointer hover:bg-gradient-to-r hover:from-accent/30 hover:to-accent/10 hover:scale-[1.01]' 
                      : ''
                  }`}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        column.className || ''
                      }`}
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
