import { MatPaginatorIntl } from '@angular/material/paginator';

export function ProcessPaginator() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Processes per page:';
  paginatorIntl.nextPageLabel = 'Next';
  paginatorIntl.previousPageLabel = 'Previous';
  paginatorIntl.firstPageLabel = 'First Page';
  paginatorIntl.lastPageLabel = 'Last Page';

  paginatorIntl.getRangeLabel = (page, pageSize, length) => {
    if (length === 0 || pageSize === 0) return `0 of ${length}`;
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return `${startIndex + 1} – ${endIndex} of ${length} processes`;
  };

  return paginatorIntl;
}
