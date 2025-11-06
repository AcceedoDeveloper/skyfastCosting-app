import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { DashboardPaginatorIntl } from '../../shared/dashboard-paginator-intl.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAllCustomers } from '../store/product.selectors';
import { loadCustomers } from '../store/product.actions';
import { CustomerDetails, Quotation } from '../../model/customer-details.model';



interface Activity {
  initials: string;
  avatarColor: string;
  description: string;
  date: string;
  time: string;
}

interface Update {
  role: string;
  category: string;
  dotColor: string;
}

interface Country {
  name: string;
  percentage: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: DashboardPaginatorIntl }
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  customers$!: Observable<CustomerDetails[]>;
  
  // Quotation Summary
  totalQuotations = 0;
  approvedQuotations = 0;
  pendingQuotations = 0;
  rejectedQuotations = 0;

  // Date picker
  selectedDate: string = new Date().toISOString().split('T')[0]; // Today's date by default
  isInitialLoad: boolean = true; // Flag to track if it's initial load

  // Two cascading dropdowns
  selectedFilterType: string = ''; // 'customer', 'partName', or 'status'
  selectedFilterValue: string = ''; // The selected value based on filter type
  
  // Filter options
  customerOptions: string[] = [];
  partNameOptions: string[] = [];
  statusOptions: string[] = ['Pending', 'Approved', 'Rejected'];
  
  // Current filter values based on selected type
  currentFilterValues: string[] = [];
  
  // Filter type options
  filterTypeOptions: Array<{value: string, label: string}> = [
    { value: 'customer', label: 'Customer' },
    { value: 'partName', label: 'Part Name' },
    { value: 'status', label: 'Status' }
  ];
  
  // Get label for selected filter type
  getSelectedFilterLabel(): string {
    if (!this.selectedFilterType) {
      return 'Select';
    }
    const option = this.filterTypeOptions.find(opt => opt.value === this.selectedFilterType);
    return option ? option.label : 'Select';
  }

  // Update current filter values based on selected type
  updateCurrentFilterValues(): void {
    if (!this.selectedFilterType) {
      this.currentFilterValues = [];
      return;
    }
    
    switch (this.selectedFilterType) {
      case 'customer':
        this.currentFilterValues = this.customerOptions || [];
        break;
      case 'partName':
        this.currentFilterValues = this.partNameOptions || [];
        break;
      case 'status':
        this.currentFilterValues = this.statusOptions || [];
        break;
      default:
        this.currentFilterValues = [];
    }
  }

  // Quotations Table
  quotations: Quotation[] = [];
  filteredQuotations: Quotation[] = [];
  paginatedQuotations: Quotation[] = [];
  pageSize = 5;
  pageIndex = 0;

  // Today Activity
  todayActivities: Activity[] = [
    { initials: 'EK', avatarColor: '#3b82f6', description: 'Indo shell payment', date: '04 April, 2021', time: '04:00 PM' },
    { initials: 'JH', avatarColor: '#8b5cf6', description: 'Uniqueshell delivery', date: '04 April, 2021', time: '03:30 PM' },
    { initials: 'AF', avatarColor: '#1e40af', description: 'Skyfast waiting for response', date: '04 April, 2021', time: '03:00 PM' },
    { initials: 'RP', avatarColor: '#60a5fa', description: 'Acceedo approved', date: '04 April, 2021', time: '02:30 PM' },
    { initials: 'SM', avatarColor: '#3b82f6', description: 'New quotation created', date: '04 April, 2021', time: '02:00 PM' },
  ];

  // Cost Estimation
  currencyRates = [
    { name: 'Indna (Ru)', value: '1' },
    { name: 'USD', value: '90' }
  ];

  // Recent Updates
  recentUpdates: Update[] = [
    { role: 'Admin', category: 'raw material', dotColor: '#10b981' },
    { role: 'Manager', category: 'Process', dotColor: '#86efac' },
    { role: 'Officer', category: 'Customer', dotColor: '#065f46' },
    { role: 'Admin', category: 'Role', dotColor: '#86efac' },
    { role: 'Manager', category: 'Department', dotColor: '#10b981' },
  ];

  // Sales by Countries
  salesByCountries: Country[] = [
    { name: 'Australia', percentage: '20%' },
    { name: 'Canada', percentage: '20%' },
    { name: 'France', percentage: '20%' },
    { name: 'Indonesia', percentage: '20%' },
    { name: 'Italy', percentage: '20%' },
  ];

  constructor(private store: Store) {}

  ngOnInit(): void {
    // Load customers from store
    this.store.dispatch(loadCustomers());
    
    // Subscribe to customers data
    this.customers$ = this.store.select(selectAllCustomers);
    
    this.customers$.subscribe(customers => {
      // Transform customer data to quotations

      console.log('Customers:', customers);
      this.quotations = this.transformCustomersToQuotations(customers);

      console.log('Quotations:', this.quotations);
      
      // Extract unique values for filter dropdowns
      this.extractFilterOptions();
      
      // Update current filter values if a type is already selected
      this.updateCurrentFilterValues();
      
      // Apply all filters
      this.applyFilters();
      
      // Calculate status counts
      this.calculateStatusCounts();
      
      // Update paginated quotations
      this.updatePaginatedQuotations();
    });
  }

  extractFilterOptions(): void {
    // Extract unique customer names
    this.customerOptions = [...new Set(this.quotations.map(q => q.customer).filter(c => c && c !== 'N/A'))].sort();
    
    // Extract unique part names
    this.partNameOptions = [...new Set(this.quotations.map(q => q.partName).filter(p => p && p !== 'N/A'))].sort();
    
    // Status options are already defined
  }

  onFilterChange(): void {
    this.pageIndex = 0; // Reset to first page when filtering
    this.applyFilters();
    this.calculateStatusCounts();
    this.updatePaginatedQuotations();
  }

  applyFilters(): void {
    // Start with all quotations
    let filtered = [...this.quotations];
    
    // Apply date filter first
    filtered = this.applyDateFilterToArray(filtered);
    
    // Apply filter based on selected type and value
    if (this.selectedFilterType && this.selectedFilterValue) {
      switch (this.selectedFilterType) {
        case 'customer':
          filtered = filtered.filter(q => q.customer === this.selectedFilterValue);
          break;
        case 'partName':
          filtered = filtered.filter(q => q.partName === this.selectedFilterValue);
          break;
        case 'status':
          filtered = filtered.filter(q => q.status === this.selectedFilterValue);
          break;
      }
    }
    
    this.filteredQuotations = filtered;
  }

  onFilterTypeChange(): void {
    // Reset the value dropdown when filter type changes
    this.selectedFilterValue = '';
    // Update the available values for the second dropdown
    this.updateCurrentFilterValues();
    this.onFilterChange();
  }

  onFilterValueChange(): void {
    this.onFilterChange();
  }

  applyDateFilterToArray(quotations: Quotation[]): Quotation[] {
    if (!this.selectedDate) {
      return quotations;
    }

    const selectedDateObj = new Date(this.selectedDate + 'T00:00:00');
    selectedDateObj.setHours(0, 0, 0, 0);

    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if selected date is today (initial load)
    const isToday = selectedDateObj.getTime() === today.getTime();

    // On initial load with today's date, show current month's data
    // Otherwise, filter by specific selected date
    if (this.isInitialLoad && isToday) {
      // Show current month's data
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      return quotations.filter(quotation => {
        if (!quotation.sentAtDate) return false;
        
        const quotationDate = new Date(quotation.sentAtDate);
        quotationDate.setHours(0, 0, 0, 0);
        
        return quotationDate.getFullYear() === currentYear && 
               quotationDate.getMonth() === currentMonth;
      });
    } else {
      // Filter by specific selected date
      return quotations.filter(quotation => {
        if (!quotation.sentAtDate) return false;
        
        const quotationDate = new Date(quotation.sentAtDate);
        quotationDate.setHours(0, 0, 0, 0);
        
        return quotationDate.getTime() === selectedDateObj.getTime();
      });
    }
  }

  onDateChange(): void {
    this.isInitialLoad = false; // Mark that user has interacted with date picker
    this.onFilterChange(); // Apply all filters including date
  }

  clearFilters(): void {
    this.selectedFilterType = '';
    this.selectedFilterValue = '';
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.isInitialLoad = true;
    this.onFilterChange();
  }

  transformCustomersToQuotations(customers: CustomerDetails[]): Quotation[] {
    const quotations: Quotation[] = [];
    
    customers.forEach(customer => {
      let revision;
      let status = 'Pending';
      
      if (customer.revisions && customer.revisions.length > 0) {
        const sortedRevisions = [...customer.revisions].sort((a, b) => 
          (b.revisionNumber || 0) - (a.revisionNumber || 0)
        );
        revision = sortedRevisions[0]; 
        status = revision.Status || 'Pending';
      }
      
      // Get date from createdAt or updatedAt
      const dateObj = customer.updatedAt 
        ? new Date(customer.updatedAt)
        : customer.createdAt 
        ? new Date(customer.createdAt)
        : new Date();
      
      // Format date for display (DD/MM/YYYY)
      const dateFormatted = dateObj.toLocaleDateString('en-GB');
      
      quotations.push({
        customer: customer.customerName?.customerName || 'N/A',
        email: customer.customerName?.email || 'N/A',
        partName: customer.partName || 'N/A',
        status: status,
        sentAt: dateFormatted,
        sentAtDate: dateObj, // Store original date for filtering
        actualCost: 0, // You may need to calculate this from revision data
        difference: 0, // You may need to calculate this from revision data
        revisionNumber: revision?.revisionNumber,
        revisionName: revision?.revisionName
      });
    });
    
    return quotations;
  }

  calculateStatusCounts(): void {
    this.totalQuotations = this.filteredQuotations.length;
    this.approvedQuotations = this.filteredQuotations.filter(q => q.status.toLowerCase() === 'approved').length;
    this.pendingQuotations = this.filteredQuotations.filter(q => q.status.toLowerCase() === 'pending').length;
    this.rejectedQuotations = this.filteredQuotations.filter(q => q.status.toLowerCase() === 'rejected').length;
  }

  updatePaginatedQuotations(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedQuotations = this.filteredQuotations.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedQuotations();
  }

  onSalesPageChange(event: PageEvent): void {
    // Handle sales pagination if needed
  }
}
