export function getPageItems(
  page: number,
  totalPages: number,
  maxPages: number = 10
) {
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);

  // If total pages small, show all
  if (totalPages <= maxPages + 2) {
    return range(1, totalPages);
  }

  // On left edge: 1 … 2…maxPages … last
  if (page <= maxPages) {
    return [...range(1, maxPages), "…", totalPages];
  }

  // On right edge: 1 … last-maxPages+1…last … last
  if (page > totalPages - maxPages) {
    return [1, "…", ...range(totalPages - maxPages + 1, totalPages)];
  }

  // Middle: 1 … [page−left…page+right] … last
  const half = Math.floor(maxPages / 2);
  const start = page - half;
  const end = page + half - (maxPages % 2 === 0 ? 1 : 0);

  return [1, "…", ...range(start, end), "…", totalPages];
}
