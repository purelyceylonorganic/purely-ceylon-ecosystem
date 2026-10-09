
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function ProductPagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  function getPageNumbers() {
    const pages = new Set<number>([
      1,
      totalPages,
      currentPage,
      currentPage - 1,
      currentPage + 1,
    ]);

    return [...pages]
      .filter((number) => number >= 1 && number <= totalPages)
      .sort((a, b) => a - b);
  }

  const pages = getPageNumbers();

  const buttonClass =
    "inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="Product pagination"
      className="mt-5 flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:px-4"
    >
      <p className="text-center text-sm text-gray-500 sm:text-left">
        Page <span className="font-bold text-[#0E4B32]">{currentPage}</span>
        {" "}of{" "}
        <span className="font-bold text-[#0E4B32]">{totalPages}</span>
      </p>

      <div className="flex min-w-0 items-center justify-center gap-1.5 sm:gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          className={`${buttonClass} hidden sm:inline-flex`}
          aria-label="First page"
          title="First page"
        >
          <ChevronsLeft size={17} />
        </button>

        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`${buttonClass} flex-1 sm:flex-none`}
          aria-label="Previous page"
        >
          <ChevronLeft size={17} />
          <span className="sm:hidden">Previous</span>
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex min-w-0 items-center justify-center gap-1">
          {pages.map((number, index) => {
            const previousNumber = pages[index - 1];
            const showEllipsis =
              previousNumber !== undefined &&
              number - previousNumber > 1;

            return (
              <span key={number} className="flex items-center gap-1">
                {showEllipsis && (
                  <span
                    className="px-0.5 text-gray-400 sm:px-1"
                    aria-hidden="true"
                  >
                    …
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onPageChange(number)}
                  aria-label={`Page ${number}`}
                  aria-current={
                    number === currentPage ? "page" : undefined
                  }
                  className={`${buttonClass} ${
                    number === currentPage
                      ? "border-[#0E4B32] bg-[#0E4B32] text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-[#FFF8EE]"
                  }`}
                >
                  {number}
                </button>
              </span>
            );
          })}
        </div>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`${buttonClass} flex-1 sm:flex-none`}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={17} />
        </button>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`${buttonClass} hidden sm:inline-flex`}
          aria-label="Last page"
          title="Last page"
        >
          <ChevronsRight size={17} />
        </button>
      </div>
    </nav>
  );
}
