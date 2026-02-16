import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate which pages to show (max 5 page numbers)
      let start: number;
      let end: number;

      if (currentPage <= 3) {
        // Near the beginning: show pages 1-5
        start = 1;
        end = 5;
      } else if (currentPage >= totalPages - 2) {
        // Near the end: show last 5 pages
        start = totalPages - 4;
        end = totalPages;
      } else {
        // In the middle: show current page with 2 on each side
        start = currentPage - 2;
        end = currentPage + 2;
      }

      // Add first page if not already included
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }

      // Add the range of pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add last page if not already included
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border">
      {/* Items per page selector - Hidden on mobile */}
      {onItemsPerPageChange && (
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border-2 border-input bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50 font-medium"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Page info - Hidden on mobile */}
      <div className="hidden md:block text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{startItem}</span> to{' '}
        <span className="font-medium text-foreground">{endItem}</span> of{' '}
        <span className="font-medium text-foreground">{totalItems}</span> results
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-input hover:bg-accent/50 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95 disabled:hover:scale-100 text-sm font-medium"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Page numbers - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageClick(pageNumber)}
                className={`min-w-[2.5rem] px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-lg scale-105'
                    : 'border-2 border-input hover:bg-accent/50 hover:border-primary/50 hover:scale-110 active:scale-95'
                }`}
                style={isActive ? {
                  backgroundColor: 'rgba(51, 57, 205, 1)',
                } : {}}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Current page indicator on mobile */}
        <div className="md:hidden text-sm font-medium text-muted-foreground px-2">
          {currentPage} / {totalPages}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-input hover:bg-accent/50 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95 disabled:hover:scale-100 text-sm font-medium"
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
