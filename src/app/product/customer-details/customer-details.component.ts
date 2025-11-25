import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import * as customerActions from '../store/product.actions';
import { selectAllCustomers } from '../store/product.selectors';
import { CommonModule } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { CustomerDetails } from '../../model/customer-details.model';
import { MatIconModule } from '@angular/material/icon';
import { AddCustomerDetailsComponent } from './add-customer-details/add-customer-details.component';
import { ConfrimDialogComponent } from '../../shared/confrim-dialog/confrim-dialog.component';
import { EditCustomerDetailsComponent } from './edit-customer-details/edit-customer-details.component';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProductService } from '../../services/product.service';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CustomerResponse } from '../../model/pdf.model';
import { ChangeDetectorRef } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { LoadingSpinnerComponent} from '../../shared/loading-spinner/loading-spinner.component'
import { ToastrService } from 'ngx-toastr';
// import { CustomPaginator} from './custom-paginator-intl';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { ConfigService} from '../../shared/config.service';
import { PdfViewComponent } from './pdf-view/pdf-view.component';

@Component({
  selector: 'app-customer-details',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    MatCheckboxModule,
    MatPaginatorModule,
    LoadingSpinnerComponent
  ],
  providers: [
    { provide: MatPaginatorIntl }
  ],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss'
})


export class CustomerDetailsComponent implements OnInit {
  customers$!: Observable<CustomerDetails[]>;
  filteredCustomers$!: Observable<CustomerDetails[]>;
  totalFiltered$!: Observable<number>;
  searchTerm: string = '';
  searchFilterType: 'none' | 'customerName' | 'drawingNo' | 'partNo' = 'none';
  selectedSearchValue: string = '';
  searchFilterOptions: string[] = [];
  dateFilterType: 'none' | 'date' | 'week' | 'month' | 'year' = 'none';
  filters: { singleDate: string; week: string; month: string; year: string } = {
    singleDate: '',
    week: '',
    month: '',
    year: ''
  };
  statusOptions: string[] = ['Pending', 'Approved', 'Rejected', 'Email Sent'];
  selectedRevisions: any[] = [];
  showComparePopup: boolean = false;
  expandedCustomer: any = null;
  quotationData!: any;
  pdfview: boolean = false;
  domesticpdf: boolean = false;
  pdfwithouticon: boolean = false;
  domesticpdfwithouticon: boolean = false;
  currencyData: any[] = [];
  isPdfLoading$ = new BehaviorSubject<boolean>(false);
  isQuotationLoading = false; // Loading state for quotation popup
  printQuotationUrl: string = '';
  statusUpdatingMap: Record<string, boolean> = {};
  private customersCache: CustomerDetails[] = [];



  isEditing: boolean = false;
  private search$ = new BehaviorSubject<string>('');
  private searchFilter$ = new BehaviorSubject<{ type: string; value: string }>({ type: 'none', value: '' });
  private dateFilter$ = new BehaviorSubject<{ type: string; value: string }>({ type: 'none', value: '' });
  private page$ = new BehaviorSubject<{ index: number; size: number }>({ index: 0, size: 10 });

  constructor(
    private store: Store, 
    private fb: FormBuilder, 
    private dialog: MatDialog, 
    private productservices: ProductService, 
    private tooser : ToastrService, 
    private config : ConfigService,
    private cdr: ChangeDetectorRef ) {}

  ngOnInit(): void {
    this.customers$ = this.store.select(selectAllCustomers).pipe(
      map(customers =>
        customers.map(c => ({
          ...c,
          revisions: c.revisions?.map(r => ({
            ...r,
            rawMaterial: r.rawMaterial ?? [],
            processes: r.processes ?? []
          })) ?? []
        }))
      )
    );

    this.totalFiltered$ = combineLatest([this.customers$, this.search$, this.searchFilter$, this.dateFilter$]).pipe(
      map(([customers, search, searchFilter, dateFilter]) => {
        return this.applyAdvancedFilters(customers, search, searchFilter, dateFilter).length;
      })
    );

    this.filteredCustomers$ = combineLatest([this.customers$, this.search$, this.searchFilter$, this.dateFilter$, this.page$]).pipe(
      map(([customers, search, searchFilter, dateFilter, page]) => {
        const filtered = this.applyAdvancedFilters(customers, search, searchFilter, dateFilter);
        const start = page.index * page.size;
        return filtered.slice(start, start + page.size);
      })
    );

    this.customers$.subscribe(customers => {
      this.customersCache = customers;
      this.updateSearchFilterOptions();
      console.log('Customers from store:', customers);
      console.table(customers);
    });

    this.store.dispatch(customerActions.loadCustomers());
    this.getCurrencyData();
    this.printQuotationUrl = this.config.getCostingUrl('');
  }

  applyFilter(): void {
    this.search$.next(this.searchTerm);
  }

  onPageChange(event: PageEvent): void {
    this.page$.next({ index: event.pageIndex, size: event.pageSize });
  }

  openAddProductDialog() {
    const dialogRef = this.dialog.open(AddCustomerDetailsComponent, {
      width: '590%',
      height: '680px',
      maxWidth: '75vw',
      disableClose:true, 
    });

     dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.store.dispatch(customerActions.loadCustomers());
    }
  });
  }

  onDelete(_id: string | undefined) {
    if (!_id) return; // safeguard

    const dialogRef = this.dialog.open(ConfrimDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Customer',
        message: 'Are you sure you want to delete this customer?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      this.store.dispatch(customerActions.deleteCustomer({ id: _id }));

      // Wait for delete success, then reload
      this.store.dispatch(customerActions.loadCustomers());
    }
  });
  }

  onEdit(customer: CustomerDetails) {
    const dialogRef = this.dialog.open(EditCustomerDetailsComponent, {
      width: '590%',
      height: '650px',
      maxWidth: '75vw',
      data: customer,
      disableClose:true, 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If user saved changes, dispatch update
        this.store.dispatch(customerActions.loadCustomers());
      }
    });
  }

  onRevisionSelect(revision: any, event: any) {
    revision.selected = event.checked; // keep track of checkbox state
    this.selectedRevisions = this.expandedCustomer.revisions.filter((r: any) => r.selected);
  }

  onRevisionSelectPopup(revision: any, event: any) {
    revision.selected = event.checked; // sync popup selection
    this.selectedRevisions = this.expandedCustomer.revisions.filter((r: any) => r.selected);
  }

  getSearchFilterLabel(): string {
    switch (this.searchFilterType) {
      case 'customerName':
        return 'Customer Name';
      case 'drawingNo':
        return 'Drawing No';
      case 'partNo':
        return 'Part No';
      default:
        return 'Select';
    }
  }

  onSearchFilterTypeChange(): void {
    this.selectedSearchValue = '';
    this.updateSearchFilterOptions();
    this.emitSearchFilter();
  }

  onSearchValueChange(): void {
    this.emitSearchFilter();
  }

  onDateFilterTypeChange(): void {
    this.filters = { singleDate: '', week: '', month: '', year: '' };
    if (this.dateFilterType === 'none') {
      this.dateFilter$.next({ type: 'none', value: '' });
    }
  }

  onDateChange(): void {
    const value = this.filters.singleDate;
    this.dateFilter$.next(value ? { type: 'date', value } : { type: 'none', value: '' });
  }

  onWeekChange(): void {
    const value = this.filters.week;
    this.dateFilter$.next(value ? { type: 'week', value } : { type: 'none', value: '' });
  }

  onMonthChange(): void {
    const value = this.filters.month;
    this.dateFilter$.next(value ? { type: 'month', value } : { type: 'none', value: '' });
  }

  onYearChange(): void {
    const value = this.filters.year ? this.filters.year.toString() : '';
    if (value && value.length === 4) {
      this.dateFilter$.next({ type: 'year', value });
    } else if (!value) {
      this.dateFilter$.next({ type: 'none', value: '' });
    }
  }

  onStatusChange(customer: CustomerDetails, newStatus: string): void {
    const revisions = customer.revisions || [];
    if (!customer._id || revisions.length === 0) {
      return;
    }

    const latestRevisionIndex = revisions.length - 1;
    const updatedRevisions = revisions.map((rev, index) =>
      index === latestRevisionIndex ? { ...rev, Status: newStatus } : rev
    );

    const payload = {
      ...customer,
      revisions: updatedRevisions
    };

    this.statusUpdatingMap[customer._id] = true;

    // this.productservices.updateCustomer(customer._id, payload).subscribe({
    //   next: () => {
    //     this.statusUpdatingMap[customer._id] = false;
    //     this.store.dispatch(customerActions.loadCustomers());
    //   },
    //   error: () => {
    //     this.statusUpdatingMap[customer._id] = false;
    //   }
    // });
  }

  getLatestRevision(c: any) {
    return c?.revisions && c.revisions.length > 0
      ? c.revisions[c.revisions.length - 1]
      : null;
  }

  getDisplayId(customer: CustomerDetails): string {
    const dateSource = customer.updatedAt || customer.createdAt;
    if (!dateSource) {
      return 'N/A';
    }
    const date = new Date(dateSource);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}${month}${year}`;
  }

  getLatestrevisionNumber(c: any) {
    return c?.revisions && c.revisions.length > 0
      ? c.revisions[c.revisions.length - 1]
      : null;
  }

  onCompare(customer: any) {
    this.selectedRevisions = customer.revisions;
  }

  toggleCompare(customer: any) {
    if (this.expandedCustomer === customer) {
      this.expandedCustomer = null; // collapse
    } else {
      this.expandedCustomer = customer; // expand
    }
  }

  canCompare(): boolean {
    return this.selectedRevisions.length >= 2;
  }

  openComparePopup() {
    if (this.selectedRevisions.length >= 2) {
      // rebuild to avoid any leftover duplicates
      this.selectedRevisions = this.expandedCustomer.revisions.filter((r: any) => r.selected);
      this.showComparePopup = true;
    }
  }

  closeComparePopup() {
    this.showComparePopup = false;
  }

  getCellClass(field: string, revision: any): string {
    if (!this.selectedRevisions || this.selectedRevisions.length <= 1) return '';

    const firstValue = this.selectedRevisions[0][field];
    const isDifferent = this.selectedRevisions.some(r => r[field] !== firstValue);

    return isDifferent ? 'highlight-diff' : '';
  }

  isDifferent(value1: any, value2: any): boolean {
    return value1 !== value2;
  }

  getRawMaterialList(rawMaterials: any[] | undefined): string {
    if (!rawMaterials || rawMaterials.length === 0) {
      return 'No Raw Materials';
    }
    return rawMaterials.map(mat => mat.GradeName).join(', ');
  }

  getProcessList(processes: any[] | undefined): string {
    if (!processes || processes.length === 0) {
      return 'No Processes';
    }
    return processes.map(p => p.processName).join(', ');
  }

  private updateSearchFilterOptions(): void {
    if (this.searchFilterType === 'none') {
      this.searchFilterOptions = [];
      return;
    }

    const values = new Set<string>();
    this.customersCache.forEach(customer => {
      let value = '';
      switch (this.searchFilterType) {
        case 'customerName':
          value = customer.customerName?.customerName || '';
          break;
        case 'drawingNo':
          value = customer.drawingNo ? String(customer.drawingNo) : '';
          break;
        case 'partNo':
          value = this.getLatestRevision(customer)?.productName || '';
          break;
      }
      if (value) {
        values.add(value);
      }
    });
    this.searchFilterOptions = Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  private emitSearchFilter(): void {
    if (this.searchFilterType === 'none' || !this.selectedSearchValue) {
      this.searchFilter$.next({ type: 'none', value: '' });
    } else {
      this.searchFilter$.next({ type: this.searchFilterType, value: this.selectedSearchValue });
    }
  }

  private applyAdvancedFilters(
    customers: CustomerDetails[],
    search: string,
    searchFilter: { type: string; value: string },
    dateFilter: { type: string; value: string }
  ): CustomerDetails[] {
    let filtered = [...customers];
    const term = search.trim().toLowerCase();

    if (term) {
      filtered = filtered.filter(c =>
        c.customerName.customerName.toLowerCase().includes(term) ||
        c.partName.toLowerCase().includes(term)
      );
    }

    if (searchFilter.type !== 'none' && searchFilter.value) {
      filtered = filtered.filter(c => {
        switch (searchFilter.type) {
          case 'customerName':
            return (c.customerName?.customerName || '').toLowerCase() === searchFilter.value.toLowerCase();
          case 'drawingNo':
            return String(c.drawingNo || '').toLowerCase() === searchFilter.value.toLowerCase();
          case 'partNo':
            return (this.getLatestRevision(c)?.productName || '').toLowerCase() === searchFilter.value.toLowerCase();
          default:
            return true;
        }
      });
    }

    if (dateFilter.type !== 'none' && dateFilter.value) {
      filtered = filtered.filter(c => this.matchesDateFilter(c, dateFilter));
    }

    return filtered;
  }

  private matchesDateFilter(customer: CustomerDetails, dateFilter: { type: string; value: string }): boolean {
    const dateSource = customer.updatedAt || customer.createdAt;
    if (!dateSource) return false;
    const customerDate = new Date(dateSource);
    if (isNaN(customerDate.getTime())) return false;

    const range = this.getDateRange(dateFilter);
    if (!range) return true;
    return customerDate >= range.start && customerDate < range.end;
  }

  private getDateRange(dateFilter: { type: string; value: string }): { start: Date; end: Date } | null {
    const value = dateFilter.value;
    switch (dateFilter.type) {
      case 'date': {
        if (!value) return null;
        const start = new Date(value);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        return { start, end };
      }
      case 'week': {
        if (!value) return null;
        const [yearStr, weekStr] = value.split('-W');
        const year = Number(yearStr);
        const week = Number(weekStr);
        if (!year || !week) return null;
        const start = this.getStartOfISOWeek(year, week);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        return { start, end };
      }
      case 'month': {
        if (!value) return null;
        const [yearStr, monthStr] = value.split('-');
        const year = Number(yearStr);
        const month = Number(monthStr);
        if (!year || month == null) return null;
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);
        return { start, end };
      }
      case 'year': {
        if (!value) return null;
        const year = Number(value);
        if (!year) return null;
        const start = new Date(year, 0, 1);
        const end = new Date(year + 1, 0, 1);
        return { start, end };
      }
      default:
        return null;
    }
  }

  private getStartOfISOWeek(year: number, week: number): Date {
    const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const dayOfWeek = simple.getUTCDay();
    const isoWeekStart = new Date(simple);
    const diff = dayOfWeek <= 4 ? dayOfWeek - 1 : dayOfWeek - 8;
    isoWeekStart.setUTCDate(simple.getUTCDate() - diff);
    isoWeekStart.setUTCHours(0, 0, 0, 0);
    return isoWeekStart;
  }

  downloadQuotation(customerName: string, partName: string, revision: number) {
    this.productservices.downloadQuotation(customerName, partName, revision).subscribe({
      next: (blob) => {
        // Create a blob URL and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Quotation_${customerName}_${partName}_Rev${revision}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url); // cleanup
      },
      error: (err) => {
        console.error('❌ Download failed:', err);
      }
    });
  }

 

downloadPDF() {
  this.pdfwithouticon = false;
  this.domesticpdfwithouticon = false;
  this.domesticpdf = false;
  this.pdfview = false;
    this.isPdfLoading$.next(true); // start loader
    

    const element = document.getElementById('pdfContent')!;

    html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#fff"
    }).then((canvas: HTMLCanvasElement) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('quotation.pdf');

      this.isPdfLoading$.next(false); // stop loader
      this.tooser.success('quotation download successfully!');

    }).catch(() => {
      this.isPdfLoading$.next(false); // stop loader on error
    });
  }





downloadQuotations(customerName: string, partName: string, revision: number): void {
  // Show popup immediately with loading state
  this.pdfview = true;
  this.domesticpdf = false;
  this.pdfwithouticon = false;
  this.domesticpdfwithouticon = false;
  this.quotationData = null; // Clear previous data
  this.isQuotationLoading = true; // Show loading spinner
  
  // Fetch data asynchronously
  this.productservices.quotationData(customerName, partName, revision).subscribe({
    next: (res) => {
      this.quotationData = res;
      this.isQuotationLoading = false; // Hide loading spinner
      console.log('Quotation Data:', this.quotationData);
      
      const hasCurrency = this.quotationData?.results?.[0]?.revisions?.[0]?.currency != null;
      this.pdfwithouticon = hasCurrency;
      this.domesticpdf = !hasCurrency;
    },
    error: (err) => {
      console.error('Error fetching quotation:', err);
      this.isQuotationLoading = false; // Hide loading spinner
      // Close popup on error
      this.pdfview = false;
      this.domesticpdf = false;
      this.pdfwithouticon = false;
      this.domesticpdfwithouticon = false;
      this.tooser.error('Failed to load quotation data');
    }
  });
}



saveQuotationPDF(customerName: string, partName: string, revision: number){
  console.log('Saving quotation PDF for:', customerName, partName, revision);
  this.productservices.saveQuotationPDF(customerName, partName, revision).subscribe({
    next: (res) => {
      console.log('Quotation PDF saved successfully:', res);
    },
    error: (err) => {
      console.error('Error saving quotation PDF:', err);
    }
  });
}

showQuotationPdf = false;




viewQuatation(customerName: string, partName: string, revision: number): void {
  // Open dialog with quotation data
  const dialogRef = this.dialog.open(PdfViewComponent, {
    width: '90%',
    maxWidth: '1200px',
    height: '90vh',
    data: { customerName, partName, revision },
    disableClose: false
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('Dialog closed');
  });
}

printQuotation(customerName: string, partName: string, revision: number): void {
  this.isPdfLoading$.next(true);
  this.productservices.printQuotation(customerName, partName, revision).subscribe({
    next: (res) => {
      console.log('Quotation printed successfully:', res);
      this.isPdfLoading$.next(false);
      this.tooser.success('Quotation printed successfully');
      const url = this.printQuotationUrl + 'get-report/' + res.fileName;
      console.log(url);
      window.open(url, '_blank');
    },
    error: (err) => {
      console.error('Error printing quotation:', err);
    }
  });
}



closeda(){
  this.pdfview = false;
  this.domesticpdf = false;
  this.pdfwithouticon = false;
  this.domesticpdfwithouticon = false;
  this.isQuotationLoading = false; // Reset loading state
  this.quotationData = null; // Clear data
}

getDrawingImage(): string {
  if (!this.quotationData?.results?.[0]?.drawingImage) {
    return '';
  }

  const api = this.config.getCostingUrl('');
  const imagePath = this.quotationData.results[0].drawingImage;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Normalize path - add /uploads/ if it's just a filename
  let normalizedPath = imagePath;
  if (!imagePath.startsWith('/')) {
    normalizedPath = `/uploads/${imagePath}`;
  } else if (!imagePath.startsWith('/uploads/')) {
    normalizedPath = `/uploads${imagePath}`;
  }
  
  return api + encodeURI(normalizedPath);
}


isProcessFieldDifferent(field: string, index: number): boolean {
  if (!this.selectedRevisions || this.selectedRevisions.length <= 1) return false;

  const firstValue = this.selectedRevisions[0]?.processes?.[index]?.[field];
  return this.selectedRevisions.some(
    rev => rev?.processes?.[index]?.[field] !== firstValue
  );
}


getCurrencyData() {
  this.productservices.getCurrencyRates().subscribe(
(res) => {
  this.currencyData = res;
      console.log('Currency Data:', this.currencyData);
    }
  );
}

enableEdit() {
  this.isEditing = true;
}


cancelEdit() {
  this.isEditing = false;
}


saveCurrency(){
  console.log('currency data to save:', this.currencyData);
  this.isEditing = false;
 const playload = {
  EURO : this.currencyData[0].EURO,
  USD : this.currencyData[0].USD
 }
 const id = this.currencyData[0]._id;

 console.log('id', id);
 console.log('data', playload);
 
 this.productservices.updtaeCurrencyRates(id, playload).subscribe({
  next: (res) => {
    console.log('Currency updated successfully:', res);
    this.getCurrencyData(); // Refresh data after update
  },
  error: (err) => {
    console.error('Error updating currency:', err);
  } 
})

}


getProcessCostByCurrency(process: any, currency: string = '') {
  if (!currency) return process.cost;
  const key = `ProcessCost${currency}`;
  return process[key] ?? process.cost;
}

getSumOfProcessCostByCurrency(revision: any, currency: string = '') {
  if (!currency) return revision.sumOfProcessCost;
  const key = `sumOfProcessCost${currency}`;
  return revision[key] ?? revision.sumOfProcessCost;
}


getRejectionCostByCurrency(revision: any, currency: string = '') {
  if (!currency) return revision.RejectionCost;
  const key = `RejectionCost${currency}`;
  return revision[key] ?? revision.RejectionCost;
}

getTotalProcessCostByCurrency(revision: any, currency: string = '') {
  if (!currency) return revision.TotalProcessCost;
  const key = `TotalProcessCost${currency}`;
  return revision[key] ?? revision.TotalProcessCost;
}



getTotalPriceByCurrency(revision: any, currency: string = '') {
  if (!currency) return revision.TotalPrice;
  const key = `TotalPrice${currency}`;
  return revision[key] ?? revision.TotalPrice;
}


}



