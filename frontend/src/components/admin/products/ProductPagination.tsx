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
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-2">

      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border px-4 py-2 disabled:opacity-50"
      >
        Previous
      </button>


      {Array.from(
        { length: totalPages },
        (_, index) => index + 1
      ).map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`rounded-lg px-4 py-2 ${
            page === number
              ? "bg-green-700 text-white"
              : "border"
          }`}
        >
          {number}
        </button>
      ))}


      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border px-4 py-2 disabled:opacity-50"
      >
        Next
      </button>

    </div>
  );
}