import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { DashboardPaginatorIntl } from '../../shared/dashboard-paginator-intl.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAllCustomers } from '../store/product.selectors';
import { loadCustomers } from '../store/product.actions';
import { CustomerDetails, Quotation } from '../../model/customer-details.model';
import { ProductService } from '../../services/product.service';
import { ProcessDetailsDialogComponent } from './process-details-dialog.component';



interface Activity {
  initials: string;
  avatarColor: string;
  description: string;
  date: string;
  time: string;
}

interface customerRevisions {
  name: string;
  partName: string;
  revisionCount: number;
}

interface CustomerRevision {
  name: string;
  partName: string;
  revisionCount: number;
}

interface Country {
  name: string;
  percentage: string;
}

interface Currency {
  name: string;
  count: number;
}

interface Customer {
  name: string;
  count: number;
}

interface RawMaterial {
  GradeName: string;
  RatePerKg: number;
  count: number;
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RawMaterialDisplay {
  gradeName: string;
  ratePerKg: number;
  count: number;
  percentage: number;
  color: string;
}

interface Process {
  processName: string;
  TonnageJaw: string;
  Hours: number;
  machineCentre: number;
  count: number;
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProcessDisplay {
  processName: string;
  tonnageJaw: string;
  hours: number;
  machineCentre: number;
  count: number;
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
    MatButtonModule,
    MatDialogModule,
    MatTableModule
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

  // customerRevisions current filter values based on selected type
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
  recentUpdates: customerRevisions[] = [];
  allRecentUpdates: customerRevisions[] = []; // Store all revisions for pagination
  
  // Pagination for revisions
  revisionsPageIndex = 0;
  revisionsPageSize = 5;
  paginatedRevisions: customerRevisions[] = [];
  
  // Color palette for customer revisions
  private readonly revisionColors = ['#10b981', '#86efac', '#065f46', '#3b82f6', '#8b5cf6', '#60a5fa'];

  // Sales by Countries (using currencies data)
  salesByCountries: Country[] = [];
  salesByCustomers: Country[] = [];
  
  // Pagination for sales
  salesPageIndex = 0;
  salesPageSize = 5;
  paginatedSales: Country[] = [];
  
  // Dropdown selection for sales section
  selectedSalesType: string = 'currencies'; // 'currencies' or 'customers'
  currentSalesData: Country[] = [];

  // Raw Materials
  rawMaterials: RawMaterialDisplay[] = [];
  rawMaterialChartStyle: string = '';
  
  // Color palette for raw materials chart
  private readonly rawMaterialColors = ['#60a5fa', '#9ca3af', '#1e40af', '#3b82f6', '#8b5cf6', '#10b981'];

  // Process
  mostUsedProcess: ProcessDisplay | null = null;
  processChartStyle: string = '';
  allProcesses: Process[] = [];

  private dialog = inject(MatDialog);
  
  constructor(private store: Store, private productService: ProductService) {}

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
      
      // customerRevisions current filter values if a type is already selected
      this.updateCurrentFilterValues();
      
      // Apply all filters
      this.applyFilters();
      
      // Calculate status counts
      this.calculateStatusCounts();
      
      // customerRevisions paginated quotations
      this.updatePaginatedQuotations();
    });

    this.productService.getDashboardData().subscribe(data => {
      console.log('Dashboard data:', data);
      if (data && data.rawMaterials) {
        this.processRawMaterials(data.rawMaterials);
      }
      if (data && data.processes) {
        this.processProcesses(data.processes);
      }
      if (data && data.customerRevisions) {
        this.processCustomerRevisions(data.customerRevisions);
      }
      if (data && data.currencies) {
        this.processCurrencies(data.currencies);
      }
      if (data && data.customers) {
        this.processCustomers(data.customers);
      }
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
    // customerRevisions the available values for the second dropdown
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
    this.salesPageIndex = event.pageIndex;
    this.salesPageSize = event.pageSize;
    this.updatePaginatedSales();
  }

  processRawMaterials(rawMaterials: RawMaterial[]): void {
    if (!rawMaterials || rawMaterials.length === 0) {
      this.rawMaterials = [];
      this.rawMaterialChartStyle = '';
      return;
    }

    // Sort by count (descending) and take top 3 for display
    const sortedMaterials = [...rawMaterials]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 3);

    if (sortedMaterials.length === 0) {
      this.rawMaterials = [];
      this.rawMaterialChartStyle = '';
      return;
    }

    // Calculate total count of top 3 materials for normalization
    const top3TotalCount = sortedMaterials.reduce((sum, rm) => sum + (rm.count || 0), 0);
    
    if (top3TotalCount === 0) {
      this.rawMaterials = [];
      this.rawMaterialChartStyle = '';
      return;
    }

    // Process materials for display - normalize percentages to top 3 total
    this.rawMaterials = sortedMaterials.map((rm, index) => {
      const percentage = top3TotalCount > 0 ? ((rm.count || 0) / top3TotalCount) * 100 : 0;
      return {
        gradeName: rm.GradeName || 'N/A',
        ratePerKg: rm.RatePerKg || 0,
        count: rm.count || 0,
        percentage: percentage,
        color: this.rawMaterialColors[index % this.rawMaterialColors.length]
      };
    });

    // Generate conic-gradient for chart
    this.generateChartStyle();
  }

  generateChartStyle(): void {
    if (this.rawMaterials.length === 0) {
      this.rawMaterialChartStyle = '';
      return;
    }

    let currentAngle = 0;
    const gradientParts: string[] = [];
    
    // Percentages are already normalized to 100% for top 3 materials
    this.rawMaterials.forEach((rm) => {
      const angle = (rm.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      gradientParts.push(`${rm.color} ${startAngle}deg ${endAngle}deg`);
      currentAngle = endAngle;
    });

    // Fill remaining with grey if percentages don't add up to exactly 100% (due to rounding)
    if (currentAngle < 360) {
      gradientParts.push(`#e0e0e0 ${currentAngle}deg 360deg`);
    }

    this.rawMaterialChartStyle = `conic-gradient(${gradientParts.join(', ')})`;
  }

  processProcesses(processes: Process[]): void {
    // Store all processes for the dialog
    this.allProcesses = processes || [];

    if (!processes || processes.length === 0) {
      this.mostUsedProcess = null;
      this.processChartStyle = '';
      return;
    }

    // Find the process with the highest count
    const sortedProcesses = [...processes].sort((a, b) => (b.count || 0) - (a.count || 0));
    const topProcess = sortedProcesses[0];

    if (!topProcess || topProcess.count === 0) {
      this.mostUsedProcess = null;
      this.processChartStyle = '';
      return;
    }

    // Calculate total count for percentage calculation
    const totalCount = processes.reduce((sum, p) => sum + (p.count || 0), 0);
    const percentage = totalCount > 0 ? ((topProcess.count || 0) / totalCount) * 100 : 0;
    const angle = (percentage / 100) * 360;

    // Store the most used process
    this.mostUsedProcess = {
      processName: topProcess.processName || 'N/A',
      tonnageJaw: topProcess.TonnageJaw || 'N/A',
      hours: topProcess.Hours || 0,
      machineCentre: topProcess.machineCentre || 0,
      count: topProcess.count || 0
    };

    // Generate dynamic chart style based on percentage
    this.processChartStyle = `conic-gradient(#86efac 0deg ${angle}deg, #e0e0e0 ${angle}deg 360deg)`;
  }

  openProcessDetailsDialog(): void {
    this.dialog.open(ProcessDetailsDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { processes: this.allProcesses },
      disableClose: false
    });
  }

  processCustomerRevisions(customerRevisions: CustomerRevision[]): void {
    if (!customerRevisions || customerRevisions.length === 0) {
      this.allRecentUpdates = [];
      this.updatePaginatedRevisions();
      return;
    }

    // Sort by revisionCount (descending) - keep all for pagination
    const sortedRevisions = [...customerRevisions]
      .sort((a, b) => (b.revisionCount || 0) - (a.revisionCount || 0));

    // Transform customer revisions to customerRevisions format
    this.allRecentUpdates = sortedRevisions.map((revision, index) => {
      return {
        name: revision.name || 'N/A',
        partName: revision.partName || 'N/A',
        revisionCount: revision.revisionCount || 0
      };
    });

    // Update paginated revisions
    this.updatePaginatedRevisions();
  }

  processCurrencies(currencies: Currency[]): void {
    if (!currencies || currencies.length === 0) {
      this.salesByCountries = [];
      this.updateCurrentSalesData();
      return;
    }

    // Calculate total count for percentage calculation
    const totalCount = currencies.reduce((sum, curr) => sum + (curr.count || 0), 0);

    if (totalCount === 0) {
      this.salesByCountries = [];
      this.updateCurrentSalesData();
      return;
    }

    // Transform currencies to Country format with percentages
    this.salesByCountries = currencies.map(curr => {
      const percentage = totalCount > 0 ? ((curr.count || 0) / totalCount) * 100 : 0;
      return {
        name: curr.name || 'N/A',
        percentage: `${percentage.toFixed(1)}%`
      };
    });

    // customerRevisions current sales data based on selection
    this.updateCurrentSalesData();
  }

  processCustomers(customers: Customer[]): void {
    if (!customers || customers.length === 0) {
      this.salesByCustomers = [];
      this.updateCurrentSalesData();
      return;
    }

    // Calculate total count for percentage calculation
    const totalCount = customers.reduce((sum, cust) => sum + (cust.count || 0), 0);

    if (totalCount === 0) {
      this.salesByCustomers = [];
      this.updateCurrentSalesData();
      return;
    }

    // Transform customers to Country format with percentages
    this.salesByCustomers = customers.map(cust => {
      const percentage = totalCount > 0 ? ((cust.count || 0) / totalCount) * 100 : 0;
      return {
        name: cust.name || 'N/A',
        percentage: `${percentage.toFixed(1)}%`
      };
    });

    // customerRevisions current sales data based on selection
    this.updateCurrentSalesData();
  }

  onSalesTypeChange(): void {
    this.salesPageIndex = 0; // Reset to first page
    this.updateCurrentSalesData();
  }

  updateCurrentSalesData(): void {
    if (this.selectedSalesType === 'customers') {
      this.currentSalesData = this.salesByCustomers || [];
    } else {
      this.currentSalesData = this.salesByCountries || [];
    }
    this.updatePaginatedSales();
  }

  updatePaginatedSales(): void {
    const startIndex = this.salesPageIndex * this.salesPageSize;
    const endIndex = startIndex + this.salesPageSize;
    this.paginatedSales = this.currentSalesData.slice(startIndex, endIndex);
  }

  onRevisionsPageChange(event: PageEvent): void {
    this.revisionsPageIndex = event.pageIndex;
    this.revisionsPageSize = event.pageSize;
    this.updatePaginatedRevisions();
  }

  updatePaginatedRevisions(): void {
    const startIndex = this.revisionsPageIndex * this.revisionsPageSize;
    const endIndex = startIndex + this.revisionsPageSize;
    this.paginatedRevisions = this.allRecentUpdates.slice(startIndex, endIndex);
  }
}
