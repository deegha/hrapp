import { usePagination } from "@/hooks/usePagination";
import { Button } from "../button/button";

interface IPagination {
  numberOfPage: number;
}

export const Pagination = ({ numberOfPage }: IPagination) => {
  const { activePage, handlePageClick } = usePagination();

  const renderPages = () =>
    Array.from({ length: numberOfPage }, (_, i) => {
      const page = i + 1;
      const isActive = parseInt(activePage) === page;

      return (
        <div
          key={page}
          className={`cursor-pointer rounded-md px-3 py-1 text-sm border ${
            isActive
              ? "bg-primary text-white"
              : "bg-background text-textSecondary border-border hover:text-textHover"
          }`}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </div>
      );
    });

  const handleNextPage = () => {
    const next = parseInt(activePage) + 1;
    if (next <= numberOfPage) handlePageClick(next);
  };

  const handlePreviousPage = () => {
    const prev = parseInt(activePage) - 1;
    if (prev >= 1) handlePageClick(prev);
  };

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
      <div className="hidden md:flex items-center gap-3">{renderPages()}</div>

      <div className="flex md:hidden items-center gap-4">
        <Button onClick={handlePreviousPage} variant="primary">
          Previous
        </Button>
        <Button onClick={handleNextPage} variant="primary">
          Next
        </Button>
      </div>
    </div>
  );
};
