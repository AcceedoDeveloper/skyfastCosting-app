import { MatPaginatorIntl } from '@angular/material/paginator';

export function RawMaterialPaginator() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Raw materials per page:';
  paginatorIntl.nextPageLabel = 'Next';
  paginatorIntl.previousPageLabel = 'Previous';
  paginatorIntl.firstPageLabel = 'First Page';
  paginatorIntl.lastPageLabel = 'Last Page';

  paginatorIntl.getRangeLabel = (page, pageSize, length) => {
    if (length === 0 || pageSize === 0) return `0 of ${length}`;
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return `${startIndex + 1} – ${endIndex} of ${length} raw materials`;
  };

  return paginatorIntl;
}
