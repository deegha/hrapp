import {usePagination} from "@/hooks/usePagination";
import {Button} from "../button/button";

interface IPagination {
  numberOfPage: number;
}

export const Pagination = ({numberOfPage}: IPagination) => {
  const {activePage, handlePageClick} = usePagination();

  const renderPages = () =>
    Array.from({length: numberOfPage}, (_, i) => {
      const page = i + 1;
      const isActive = parseInt(activePage) === page;

      return (
        <div
          key={page}
          className={`cursor-pointer rounded-md border px-3 py-1 text-sm ${
            isActive
              ? "bg-primary text-white"
              : "border-border bg-background text-textSecondary hover:text-textHover"
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
      <div className="hidden items-center gap-3 md:flex">{renderPages()}</div>

      <div className="flex items-center gap-4 md:hidden">
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
