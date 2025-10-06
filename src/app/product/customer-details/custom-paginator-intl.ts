import { MatPaginatorIntl } from '@angular/material/paginator';

export function CustomPaginator() {
  const customPaginatorIntl = new MatPaginatorIntl();

  customPaginatorIntl.itemsPerPageLabel = 'Customer details per page:';
  customPaginatorIntl.nextPageLabel = 'Next';
  customPaginatorIntl.previousPageLabel = 'Previous';
  customPaginatorIntl.firstPageLabel = 'First Page';
  customPaginatorIntl.lastPageLabel = 'Last Page';

  return customPaginatorIntl;
}
