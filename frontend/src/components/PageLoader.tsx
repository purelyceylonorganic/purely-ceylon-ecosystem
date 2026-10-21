export default function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[50vh] items-center justify-center"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#0E4B32]" />
    </div>
  );
}