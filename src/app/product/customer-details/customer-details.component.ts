import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, combineLatest, map, switchMap, startWith } from 'rxjs';
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
import { CustomerDetails, CustomerFilters } from '../../model/customer-details.model';
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
  paginatedResponse$!: Observable<any>;
  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  
  searchTerm: string = '';
  searchFilterType: 'none' | 'all' | 'customerName' | 'drawingNo' | 'partName' = 'all';
  selectedSearchValue: string = '';
  searchFilterOptions: string[] = [];
  dateFilterType: 'none' | 'all' | 'date' | 'week' | 'month' | 'year' = 'month';
  filters: { singleDate: string; week: string; month: string; year: string } = {
    singleDate: '',
    week: '',
    month: '', // Will be set in ngOnInit
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
  isLoading = false;
  private customersCache: CustomerDetails[] = [];

  isEditing: boolean = false;
  private filters$ = new BehaviorSubject<CustomerFilters>({ page: 1, limit: 10 });

  constructor(
    private store: Store, 
    private fb: FormBuilder, 
    private dialog: MatDialog, 
    private productservices: ProductService, 
    private tooser : ToastrService, 
    private config : ConfigService,
    private cdr: ChangeDetectorRef ) {}

  ngOnInit(): void {
    // Server-side pagination with filters
    this.paginatedResponse$ = this.filters$.pipe(
      switchMap(filters => {
        this.isLoading = true;
        return this.productservices.getCustomersPaginated(filters).pipe(
          map(response => {
            this.isLoading = false;
            this.totalItems = response.metadata.totalItems;
            this.currentPage = response.metadata.currentPage - 1; // Convert to 0-based index
            this.pageSize = response.metadata.pageSize;
            return response;
          })
        );
      })
    );

    this.filteredCustomers$ = this.paginatedResponse$.pipe(
      map(response => response.data || [])
    );

    this.totalFiltered$ = this.paginatedResponse$.pipe(
      map(response => response.metadata.totalItems)
    );

    // Keep store subscription for search filter options
    this.customers$ = this.store.select(selectAllCustomers).pipe(
      map(customers => {
        // Ensure customers is an array before mapping
        if (!customers || !Array.isArray(customers)) {
          return [];
        }
        return customers.map(c => ({
          ...c,
          revisions: c.revisions?.map(r => ({
            ...r,
            rawMaterial: r.rawMaterial ?? [],
            processes: r.processes ?? []
          })) ?? []
        }));
      })
    );

    this.productservices.getCustomersPaginated({ page: 1, limit: 10 }).subscribe({
      next: (response) => {
        // Extract data array from paginated response
        const customers = response?.data || [];
        console.log('data', response);
        if (Array.isArray(customers) && customers.length > 0) {
          console.log('Customers loaded for filters:', customers.length);
          console.log('Sample customer structure:', customers[0]);
          this.customersCache = customers;
          // If filter type is already selected, populate options immediately
          if (this.searchFilterType !== 'none' && this.searchFilterType !== 'all') {
            this.populateFilterOptions();
            this.cdr.detectChanges();
          }
        } else {
          console.warn('No customers found in response');
          this.customersCache = [];
        }
      },
      error: (err) => {
        console.error('Error loading customers for filters:', err);
        this.customersCache = [];
      }
    });

    // Also subscribe to store for updates
    this.customers$.subscribe(customers => {
      // Ensure customers is an array
      if (!customers || !Array.isArray(customers)) {
        return;
      }
      // Only update cache if it's empty or if store has more recent data
      if (!this.customersCache || this.customersCache.length === 0) {
        this.customersCache = customers;
        // Update filter options if filter type is selected
        if (this.searchFilterType !== 'none' && this.searchFilterType !== 'all') {
          this.populateFilterOptions();
          this.cdr.detectChanges();
        }
      }
    });

    // Load all customers for filter options (without pagination)
    this.store.dispatch(customerActions.loadCustomers());

    this.setdefaultDateFilterValue();
    
    // Set default month filter to current month
    this.filters.month = this.getCurrentMonth();
    
    this.getCurrencyData();
    this.printQuotationUrl = this.config.getCostingUrl('');
    
    // Load initial paginated data (will use default month filter)
    this.loadCustomers();
  }

  applyFilter(): void {
    this.loadCustomers();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCustomers();
  }

  private loadCustomers(): void {
    const filters: CustomerFilters = {
      page: this.currentPage + 1, // Convert to 1-based index
      limit: this.pageSize
    };

    // Add date filters
    if (this.dateFilterType === 'date' && this.filters.singleDate) {
      filters.StartDate = this.filters.singleDate;
      filters.EndDate = this.filters.singleDate;
    } else if (this.dateFilterType === 'week' && this.filters.week) {
      const [year, week] = this.filters.week.split('-W');
      const startDate = this.getStartOfISOWeek(Number(year), Number(week));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      filters.StartDate = startDate.toISOString().split('T')[0];
      filters.EndDate = endDate.toISOString().split('T')[0];
    } else if (this.dateFilterType === 'month' && this.filters.month) {
      const [year, month] = this.filters.month.split('-');
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 1);
      filters.StartDate = startDate.toISOString().split('T')[0];
      filters.EndDate = endDate.toISOString().split('T')[0];
    } else if (this.dateFilterType === 'year' && this.filters.year) {
      const year = Number(this.filters.year);
      filters.StartDate = `${year}-01-01`;
      filters.EndDate = `${year}-12-31`;
    }

    // Add search filters
    if (this.searchFilterType !== 'none' && this.selectedSearchValue && this.selectedSearchValue !== 'all') {
      switch (this.searchFilterType) {
        case 'customerName':
          filters.customerName = this.selectedSearchValue;
          break;
        case 'partName':
          filters.partName = this.selectedSearchValue;
          break;
        case 'drawingNo':
          filters.drawingNo = this.selectedSearchValue;
          break;
      }
    }

    this.filters$.next(filters);
  }

  openAddProductDialog() {
    const dialogRef = this.dialog.open(AddCustomerDetailsComponent, {
      width: '590%',
      height: '740px',
      maxWidth: '75vw',
      disableClose:true, 
    });

dialogRef.afterClosed().subscribe(result => {
    if (result === true) {
    
      this.loadCustomers();
      this.store.dispatch(customerActions.loadCustomers());
  
    }
  });
  }


  private setdefaultDateFilterValue(): void {
  const now = new Date();

  switch (this.dateFilterType) {
    case 'date':
      this.filters.singleDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      break;

    case 'week': {
      const year = now.getFullYear();
      const week = this.getISOWeekNumber(now);
      // Force correct padding and format
      this.filters.week = `${year}-W${String(week).padStart(2, '0')}`;
      // Extra safety: log to verify
      console.log('Default week set to:', this.filters.week);
      break;
    }

    case 'month':
      this.filters.month = this.getCurrentMonth();
      break;

    case 'year':
      this.filters.year = now.getFullYear().toString();
      break;

    default:
      this.filters = { singleDate: '', week: '', month: '', year: '' };
      break;
  }
}

private getISOWeekNumber(date: Date): number {
  // Copy date so we don't modify original
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Set to nearest Thursday: current date + 4 - current day number
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));

  // Get first day of year
  const yearStart = new Date(d.getFullYear(), 0, 1);

  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return weekNo;
}

  onDelete(_id: string | undefined) {
  if (!_id) return;

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

      // Immediately reload paginated data
      this.loadCustomers();

      this.tooser.success('Customer deleted successfully!');
    }
  });
}
  onEdit(customer: CustomerDetails) {
    const dialogRef = this.dialog.open(EditCustomerDetailsComponent, {
      width: '590%',
      height: '670px',
      maxWidth: '75vw',
      data: customer,
      disableClose:true, 
    });

 dialogRef.afterClosed().subscribe(result => {
    if (result === true || result === 'success') {
      this.loadCustomers();
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
      case 'partName':
        return 'Part Name';
      default:
        return 'Select';
    }
  }

  onSearchFilterTypeChange(): void {
    this.selectedSearchValue = '';
  
    if (this.searchFilterType === 'none' || this.searchFilterType === 'all') {
      this.searchFilterOptions = [];
      return;
    }
  
    // 💡 If customer cache is READY → populate immediately
    if (this.customersCache && Array.isArray(this.customersCache) && this.customersCache.length > 0) {
      this.populateFilterOptions();
      this.cdr.detectChanges();
      return;
    }
  
    // 💡 If cache NOT READY → fetch data first
    this.productservices.getCustomersPaginated({ page: 1, limit: 1000 }).subscribe({
      next: (response) => {
        // Extract data array from paginated response
        const customers = response?.data || [];
        if (Array.isArray(customers) && customers.length > 0) {
          this.customersCache = customers;
          this.populateFilterOptions();
        } else {
          console.warn('No customers found in response');
          this.customersCache = [];
          this.searchFilterOptions = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching customers:', err);
        this.customersCache = [];
        this.searchFilterOptions = [];
        this.cdr.detectChanges();
      }
    });
  }
  

  onSearchValueChange(): void {
    if (this.selectedSearchValue === 'all') {
      this.selectedSearchValue = '';
    }
    this.currentPage = 0; // Reset to first page
    this.loadCustomers();
  }

  onDateFilterTypeChange(): void {
    this.filters = { singleDate: '', week: '', month: '', year: '' };
    if (this.dateFilterType === 'none' || this.dateFilterType === 'all') {
      this.dateFilterType = 'none';
    }
    else{
      this.setdefaultDateFilterValue();
    }
    this.currentPage = 0; // Reset to first page
    this.loadCustomers();
  }

  onDateChange(): void {
    this.currentPage = 0; // Reset to first page
    this.loadCustomers();
  }

  onWeekChange(): void {
    this.currentPage = 0; // Reset to first page
    this.loadCustomers();
  }

  onMonthChange(): void {
    this.currentPage = 0; // Reset to first page
    this.loadCustomers();
  }

  onYearChange(): void {
    if (this.filters.year && this.filters.year.toString().length === 4) {
      this.currentPage = 0; // Reset to first page
      this.loadCustomers();
    } else if (!this.filters.year) {
      this.currentPage = 0;
      this.loadCustomers();
    }
  }

  onStatusChange(customer: CustomerDetails, newStatus: string): void {
    const revisions = customer.revisions || [];
    const customerId = customer._id;
    
    if (!customerId || revisions.length === 0) {
      console.warn(' Status change skipped: Missing customer ID or revisions', {
        customerId: customerId,
        hasRevisions: revisions.length > 0
      });
      return;
    }

    const latestRevisionIndex = revisions.length - 1;
    const latestRevision = revisions[latestRevisionIndex];
    const oldStatus = latestRevision?.Status || 'Pending';

    // Log the status change
    // console.log('🔄 Status Change Detected:', {
    //   customerId: customerId,
    //   customerName: customer.customerName?.customerName,
    //   partName: customer.partName,
    //   revisionNumber: latestRevision?.revisionNumber,
    //   oldStatus: oldStatus,
    //   newStatus: newStatus,
    //   timestamp: new Date().toISOString(),
    //   changed: oldStatus !== newStatus
    // });

    // Log if status actually changed
    if (oldStatus !== newStatus) {
      console.log(' Status Updated:', {
        from: oldStatus,
        to: newStatus,
        customer: `${customer.customerName?.customerName} - ${customer.partName}`
      });
    } else {
      console.log(' Status unchanged (same value selected)');
      return; // Don't make API call if status hasn't changed
    }

    // Prepare payload
    const payload = {
      revisionNumber: latestRevisionIndex + 1,
      Status: newStatus
    };

    console.log(' Update Payload:', {
      customerId: customerId,
      payload: payload
    });

    // Set loading state BEFORE API call
    this.statusUpdatingMap[customerId] = true;
    console.log('⏳ Status update in progress for customer:', customerId);

    // Make API call to update status
    this.productservices.updateCustomer(customerId, payload).subscribe({
      next: (res) => {
        console.log('✅ Status updated successfully:', {
          customerId: customerId,
          newStatus: newStatus,
          response: res
        });
        
        // Reset loading state
        this.statusUpdatingMap[customerId] = false;
        
        // Reload customers to reflect the change
        this.store.dispatch(customerActions.loadCustomers());
        
        // Show success message
        this.tooser.success(`Status updated to ${newStatus} successfully!`);
      },
      error: (err) => {
        console.error('❌ Status update failed:', {
          customerId: customerId,
          error: err,
          attemptedStatus: newStatus
        });
        
        // Reset loading state on error
        this.statusUpdatingMap[customerId] = false;
        
        // Show error message
        this.tooser.error('Failed to update status. Please try again.');
      }
    });
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
    if (this.searchFilterType === 'none' || this.searchFilterType === 'all') {
      this.searchFilterOptions = [];
      return;
    }

    // If cache is empty or not an array, fetch all customers for filter options
    if (!this.customersCache || !Array.isArray(this.customersCache) || this.customersCache.length === 0) {
      console.log('Cache is empty, fetching customers for filter options...');
      // Fetch all customers for filter options
      this.productservices.getCustomersPaginated({ page: 1, limit: 1000 }).subscribe({
        next: (response) => {
          // Extract data array from paginated response
          const customers = response?.data || [];
          if (Array.isArray(customers) && customers.length > 0) {
            console.log('Customers fetched for filters:', customers.length);
            this.customersCache = customers;
            this.populateFilterOptions();
          } else {
            console.warn('No customers found in response');
            this.customersCache = [];
            this.searchFilterOptions = [];
          }
          // Trigger change detection to update the dropdown
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching customers for filter options:', err);
          this.customersCache = [];
          this.searchFilterOptions = [];
          this.cdr.detectChanges();
        }
      });
      return;
    }

    // Cache has data, populate options immediately
    console.log('Cache has data, populating options immediately. Cache size:', this.customersCache.length);
    this.populateFilterOptions();
    // Trigger change detection to ensure dropdown updates
    this.cdr.detectChanges();
  }

  private populateFilterOptions(): void {
    // Check if customersCache exists and is an array
    if (!this.customersCache || !Array.isArray(this.customersCache) || this.customersCache.length === 0) {
      console.log('Cannot populate options: cache is empty or not an array', {
        cache: this.customersCache,
        isArray: Array.isArray(this.customersCache),
        length: this.customersCache?.length
      });
      this.searchFilterOptions = [];
      this.cdr.detectChanges();
      return;
    }

    console.log('Populating filter options for type:', this.searchFilterType, 'from', this.customersCache.length, 'customers');

    const values = new Set<string>();
    let sampleCustomer = null;
    
    this.customersCache.forEach((customer, index) => {
      if (index === 0) {
        sampleCustomer = customer;
      }
      
      let value = '';
      switch (this.searchFilterType) {
        case 'customerName':
          // Handle both possible structures
          if (customer.customerName) {
            value = typeof customer.customerName === 'string' 
              ? customer.customerName 
              : customer.customerName.customerName || '';
          }
          break;
        case 'drawingNo':
          value = customer.drawingNo ? String(customer.drawingNo) : '';
          break;
        case 'partName':
          value = customer.partName || '';
          break;
      }
      if (value && value.trim() !== '') {
        values.add(value.trim());
      }
    });
    
    // Log sample customer structure for debugging
    if (sampleCustomer) {
      const sample = sampleCustomer as CustomerDetails;
      console.log('Sample customer structure:', {
        customerName: sample.customerName,
        customerNameType: typeof sample.customerName,
        hasCustomerName: !!sample.customerName
      });
    }
    
    // Create a new array reference to ensure Angular detects the change
    const sortedOptions = Array.from(values).sort((a, b) => a.localeCompare(b));
    this.searchFilterOptions = sortedOptions; // Direct assignment should work
    
    // Log for debugging
    console.log('Filter options populated:', {
      filterType: this.searchFilterType,
      optionsCount: this.searchFilterOptions.length,
      options: this.searchFilterOptions.slice(0, 10) // Show first 10 for debugging
    });
    
    // Force change detection
    this.cdr.detectChanges();
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
          case 'partName':
            return (c.partName || '').toLowerCase() === searchFilter.value.toLowerCase();
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
       this.isPdfLoading$.next(false); 
        this.tooser.error('Failed to print quotation');AddCustomerDetailsComponent
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

onDateArrowKey(event: KeyboardEvent, direction: 'prev' | 'next'): void {
  event.preventDefault();
  if (!this.filters.singleDate) {
    this.filters.singleDate = new Date().toISOString().split('T')[0];
  }

  const date = new Date(this.filters.singleDate);
  if (direction === 'prev') {
    date.setDate(date.getDate() - 1);
  } else {
    date.setDate(date.getDate() + 1);
  }
  this.filters.singleDate = date.toISOString().split('T')[0];
  this.onDateChange();
}

onWeekArrowKey(event: KeyboardEvent, direction: 'prev' | 'next'): void {
  event.preventDefault();
  if (!this.filters.week) {
    const now = new Date();
    const year = now.getFullYear();
    const week = this.getISOWeekNumber(now);
    this.filters.week = `${year}-W${String(week).padStart(2, '0')}`;
  }

  const [yearStr, weekStr] = this.filters.week.split('-W');
  let year = Number(yearStr);
  let week = Number(weekStr);

  if (direction === 'prev') {
    week--;
    if (week < 1) {
      week = 52; // Rough estimate; some years have 53
      year--;
    }
  } else {
    week++;
    if (week > 53) {
      week = 1;
      year++;
    }
  }

  this.filters.week = `${year}-W${String(week).padStart(2, '0')}`;
  this.onWeekChange();
}

onMonthArrowKey(event: KeyboardEvent, direction: 'prev' | 'next'): void {
  event.preventDefault();
  if (!this.filters.month) {
    this.filters.month = this.getCurrentMonth();
  }

  const [yearStr, monthStr] = this.filters.month.split('-');
  let year = Number(yearStr);
  let month = Number(monthStr);

  if (direction === 'prev') {
    month--;
    if (month < 1) {
      month = 12;
      year--;
    }
  } else {
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  this.filters.month = `${year}-${String(month).padStart(2, '0')}`;
  this.onMonthChange();
}

onYearArrowKey(event: KeyboardEvent, direction: 'prev' | 'next'): void {
  event.preventDefault();

  if (!this.filters.year) {
    this.filters.year = new Date().getFullYear().toString();
  }

  let year = Number(this.filters.year);
  year = direction === 'prev' ? year - 1 : year + 1;

  if (year >= 2000 && year <= 2100) {
    this.filters.year = year.toString();
    this.onYearChange();
  }
}

isInternationalQuotation(): boolean {
  const revision = this.quotationData?.results?.[0]?.revisions?.[0];
  if (!revision) return false;
  
  // You can decide based on what you consider "international"
  return revision.Packing === 'international' || 
         !!revision.currency;
}


  getTotalPriceByCurrency(revision: any, currency: string = '') {
    if (!currency) return revision.TotalPrice;
    const key = `TotalPrice${currency}`;
    return revision[key] ?? revision.TotalPrice;
  }

  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

}



