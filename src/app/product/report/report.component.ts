import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, map, takeUntil, Subject, BehaviorSubject, switchMap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { selectAllCustomers } from '../store/product.selectors';
import { CustomerDetails, CustomerFilters, PaginatedCustomerResponse } from '../../model/customer-details.model';
import * as customerActions from '../store/product.actions';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule, MatIconModule, MatPaginatorModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit, OnDestroy {
  filteredCustomers$!: Observable<CustomerDetails[]>;
  paginatedResponse$!: Observable<PaginatedCustomerResponse>;
  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  isLoading = false;
  
  customerNames: string[] = [];
  partNames: string[] = [];
  private customersCache: CustomerDetails[] = [];
  
  selectedFilterType: string = '';
  selectedMachine: boolean = false;
  selectedDateFilterType: string = 'month'; // Set default to month
  selectedDatePreset: string = '';
  
  filters = {
    customerName: '',
    partName: '',
    singleDate: '',
    week: '',
    month: '', // Will be set in ngOnInit
    year: ''
  };
  
  filteredData: CustomerDetails[] = [];
  private destroy$ = new Subject<void>();
  private filters$ = new BehaviorSubject<CustomerFilters>({ page: 1, limit: 10 });
  
  // Popup properties
  showProcessesPopup: boolean = false;
  popupProcesses: any[] = [];
  popupCustomerName: string = '';
  popupPartName: string = '';
  
  // Packing popup properties
  showInternationalPackingPopup: boolean = false;
  showDomesticPackingPopup: boolean = false;
  popupRevision: any = null;
  popupPackingCustomerName: string = '';
  popupPackingPartName: string = '';
  
  // Full info popup properties
  showFullInfoPopup: boolean = false;
  popupCustomer: CustomerDetails | null = null;
  
  // Expandable rows tracking
  expandedRowId: string | null = null;

  constructor(
    private store: Store,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    // Server-side pagination with filters
    this.paginatedResponse$ = this.filters$.pipe(
      switchMap(filters => {
        this.isLoading = true;
        return this.productService.getCustomersPaginated(filters).pipe(
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

    // Subscribe to filtered customers for display
    this.filteredCustomers$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(customers => {
      this.filteredData = customers;
    });

    // Load all customers for filter options (without pagination)
    this.productService.getCustomersPaginated({ page: 1, limit: 1000 }).subscribe({
      next: (response) => {
        const customers = response?.data || [];
        if (Array.isArray(customers) && customers.length > 0) {
          this.customersCache = customers;
          this.populateFilterOptions();
        }
      },
      error: (err) => {
        console.error('Error loading customers for filters:', err);
        this.customersCache = [];
      }
    });

    // Set default month filter to current month
    this.filters.month = this.getCurrentMonth();
    
    // Load initial data with default month filter
    this.loadCustomers();
  }

  onDateFilterTypeChange(): void {
    const today = new Date();
    this.selectedDatePreset = '';
    
    // Reset all date filter values first
    this.filters.singleDate = '';
    this.filters.week = '';
    this.filters.month = '';
    this.filters.year = '';
    
    // Set the appropriate value based on selected filter type
    switch (this.selectedDateFilterType) {
      case 'custom':
        this.filters.singleDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        // HTML5 week input format: YYYY-Www (e.g., "2024-W05")
        const weekString = this.getCurrentWeekString(today);
        this.filters.week = weekString;
        break;
      case 'month':
        // HTML5 month input format: YYYY-MM (e.g., "2024-03")
        this.filters.month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        this.filters.year = String(today.getFullYear());
        break;
    }
    
    // Apply filters when date filter type changes
    this.applyFilters();
  }

  onDatePresetChange(): void {
    // Handle preset date filter changes
    const today = new Date();
    
    switch (this.selectedDatePreset) {
      case 'today':
        this.filters.singleDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        // Set to start of current week
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        this.filters.week = this.getWeekString(weekStart);
        break;
      case 'month':
        this.filters.month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        this.filters.year = String(today.getFullYear());
        break;
    }
    
    // Apply filters when preset changes
    this.applyFilters();
  }

  getCurrentWeekString(date: Date): string {
    // HTML5 week input format: YYYY-Www
    // Get the ISO week number
    const year = date.getFullYear();
    const weekNumber = this.getISOWeekNumber(date);
    return `${year}-W${String(weekNumber).padStart(2, '0')}`;
  }

  getWeekString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const week = this.getWeekNumber(date);
    return `${year}-W${String(week).padStart(2, '0')}`;
  }

  getISOWeekNumber(date: Date): number {
    // Calculate ISO week number (week starts on Monday)
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // Convert Sunday (0) to 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Thursday of current week
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNumber;
  }

  getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  applyFilters(): void {
    this.currentPage = 0; // Reset to first page when filters change
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
    if (this.selectedDateFilterType === 'custom' && this.filters.singleDate) {
      filters.StartDate = this.filters.singleDate;
      filters.EndDate = this.filters.singleDate;
    } else if (this.selectedDateFilterType === 'week' && this.filters.week) {
      const [year, week] = this.filters.week.split('-W');
      const startDate = this.getStartOfISOWeek(Number(year), Number(week));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      filters.StartDate = startDate.toISOString().split('T')[0];
      filters.EndDate = endDate.toISOString().split('T')[0];
    } else if (this.selectedDateFilterType === 'month' && this.filters.month) {
      const [year, month] = this.filters.month.split('-');
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 1);
      filters.StartDate = startDate.toISOString().split('T')[0];
      filters.EndDate = endDate.toISOString().split('T')[0];
    } else if (this.selectedDateFilterType === 'year' && this.filters.year) {
      const year = Number(this.filters.year);
      filters.StartDate = `${year}-01-01`;
      filters.EndDate = `${year}-12-31`;
    }

    // Add search filters
    if (this.filters.customerName) {
      filters.customerName = this.filters.customerName;
    }
    if (this.filters.partName) {
      filters.partName = this.filters.partName;
    }

    this.filters$.next(filters);
  }

  private populateFilterOptions(): void {
    if (!this.customersCache || !Array.isArray(this.customersCache) || this.customersCache.length === 0) {
      return;
    }

    // Extract unique customer names
    const uniqueCustomerNames = new Set<string>();
    this.customersCache.forEach(customer => {
      if (customer.customerName?.customerName) {
        uniqueCustomerNames.add(customer.customerName.customerName);
      }
    });
    this.customerNames = Array.from(uniqueCustomerNames).sort();

    // Extract unique part names
    const uniquePartNames = new Set<string>();
    this.customersCache.forEach(customer => {
      if (customer.partName) {
        uniquePartNames.add(customer.partName);
      }
    });
    this.partNames = Array.from(uniquePartNames).sort();
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

  clearFilters(): void {
    this.selectedFilterType = '';
    this.selectedDateFilterType = 'month'; // Reset to default month filter
    this.selectedDatePreset = '';
    this.filters = {
      customerName: '',
      partName: '',
      singleDate: '',
      week: '',
      month: this.getCurrentMonth(), // Reset to current month
      year: ''
    };
    
    this.currentPage = 0;
    this.loadCustomers();
  }

  // Helper methods for displaying data
  getCustomerName(customer: CustomerDetails): string {
    return customer?.customerName?.customerName || 'N/A';
  }

  getLatestRevision(customer: CustomerDetails): any {
    return customer?.revisions && customer.revisions.length > 0
      ? customer.revisions[customer.revisions.length - 1]
      : null;
  }

  getRawMaterialList(rawMaterials: any[] | undefined): string {
    if (!rawMaterials || rawMaterials.length === 0) {
      return 'No Raw Materials';
    }
    return rawMaterials.map(mat => mat.GradeName || mat.gradeName || 'N/A').join(', ');
  }

  getProcessList(processes: any[] | undefined): string {
    if (!processes || processes.length === 0) {
      return 'No Processes';
    }
    return processes.map(p => p.processName || 'N/A').join(', ');
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  }

  getCurrentDateString(): string {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  openProcessesPopup(processes: any[], customerName: string, partName: string): void {
    this.popupProcesses = processes || [];
    this.popupCustomerName = customerName;
    this.popupPartName = partName;
    this.showProcessesPopup = true;
  }

  closeProcessesPopup(): void {
    this.showProcessesPopup = false;
    this.popupProcesses = [];
    this.popupCustomerName = '';
    this.popupPartName = '';
  }

  toggleRevisionDetails(customerId: string | undefined): void {
    if (!customerId) return;
    
    if (this.expandedRowId === customerId) {
      this.expandedRowId = null;
    } else {
      this.expandedRowId = customerId;
    }
  }

  isRowExpanded(customerId: string | undefined): boolean {
    return customerId ? this.expandedRowId === customerId : false;
  }

  isInternational(revision: any): boolean {
    return revision?.Packing === 'international';
  }

  openPackingPopup(revision: any, customerName: string, partName: string): void {
    this.popupRevision = revision;
    this.popupPackingCustomerName = customerName;
    this.popupPackingPartName = partName;
    
    if (revision?.Packing === 'international') {
      this.showInternationalPackingPopup = true;
      this.showDomesticPackingPopup = false;
    } else {
      this.showDomesticPackingPopup = true;
      this.showInternationalPackingPopup = false;
    }
  }

  closeInternationalPackingPopup(): void {
    this.showInternationalPackingPopup = false;
    this.popupRevision = null;
    this.popupPackingCustomerName = '';
    this.popupPackingPartName = '';
  }

  closeDomesticPackingPopup(): void {
    this.showDomesticPackingPopup = false;
    this.popupRevision = null;
    this.popupPackingCustomerName = '';
    this.popupPackingPartName = '';
  }

  openFullInfoPopup(customer: CustomerDetails): void {
    this.popupCustomer = customer;
    this.showFullInfoPopup = true;
  }

  closeFullInfoPopup(): void {
    this.showFullInfoPopup = false;
    this.popupCustomer = null;
  }

  openFullInfoInNewTab(): void {
    if (!this.popupCustomer || typeof window === 'undefined') {
      return;
    }

    const viewId = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const storageKey = `reportFullView:${viewId}`;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(this.popupCustomer));
      const urlTree = this.router.createUrlTree(['/report-full-view'], {
        queryParams: { viewId }
      });
      const url = this.router.serializeUrl(urlTree);
      // Navigate in the same tab instead of opening a new tab
      this.router.navigateByUrl(url);
    } catch (error) {
      console.error('Failed to navigate to full view', error);
      window.localStorage.removeItem(storageKey);
    }
  }

  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

}
