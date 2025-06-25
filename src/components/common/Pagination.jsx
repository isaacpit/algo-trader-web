import React from "react";
import { useTheme } from "../../context/ThemeContext";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0,
}) => {
  const { isDarkMode } = useTheme();

  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Items info */}
      <div
        className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isDarkMode
              ? "text-gray-400 bg-gray-700 border border-gray-600 hover:bg-gray-600 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700 disabled:hover:text-gray-400"
              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
          }`}
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span
                  className={`px-3 py-2 text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  ...
                </span>
              ) : (
                <button
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    page === currentPage
                      ? isDarkMode
                        ? "bg-indigo-600 text-white border border-indigo-500"
                        : "bg-indigo-600 text-white border border-indigo-500"
                      : isDarkMode
                      ? "text-gray-400 bg-gray-700 border border-gray-600 hover:bg-gray-600 hover:text-gray-300"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isDarkMode
              ? "text-gray-400 bg-gray-700 border border-gray-600 hover:bg-gray-600 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700 disabled:hover:text-gray-400"
              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
