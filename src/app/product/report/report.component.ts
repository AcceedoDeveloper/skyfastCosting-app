import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, map, take, takeUntil, Subject, BehaviorSubject, switchMap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { selectAllCustomers } from '../store/product.selectors';
import { CustomerDetails, CustomerFilters, PaginatedCustomerResponse } from '../../model/customer-details.model';
import * as customerActions from '../store/product.actions';
import { ProductService } from '../../services/product.service';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

  @ViewChild('pdfContent') pdfContent!: ElementRef;

  constructor(
    private store: Store,
    private productService: ProductService
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

  downloadFullInfoPDF(): void {
    if (!this.popupCustomer) {
      return;
    }

    // Always use the hidden PDF content div - it has the proper format
    setTimeout(() => {
      const element = document.getElementById('fullInfoPdfContent');
      
      if (!element) {
        console.error('PDF content element not found');
        return;
      }

      // Save original styles
      const originalDisplay = element.style.display;
      const originalPosition = element.style.position;
      const originalLeft = element.style.left;
      const originalTop = element.style.top;
      const originalWidth = element.style.width;
      const originalOverflow = element.style.overflow;
      const originalMaxHeight = element.style.maxHeight;
      const originalVisibility = element.style.visibility;
      const originalZIndex = element.style.zIndex;
      const originalHeight = element.style.height;
      
      // Make element fully visible and rendered (positioned off-screen but visible to html2canvas)
      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.left = '0';
      element.style.top = '0';
      element.style.width = '210mm';
      element.style.visibility = 'visible';
      element.style.zIndex = '9999';
      element.style.overflow = 'visible';
      element.style.maxHeight = 'none';
      element.style.height = 'auto';
      element.style.opacity = '1';
      element.style.pointerEvents = 'none';
      element.style.transform = 'translateX(-10000px)';

      // Ensure all child elements are visible
      const allChildren = element.querySelectorAll('*');
      allChildren.forEach((child: any) => {
        if (child.style) {
          child.style.overflow = 'visible';
          child.style.maxHeight = 'none';
          child.style.height = 'auto';
          child.style.display = '';
          child.style.visibility = 'visible';
        }
      });

      // Wait for full rendering - multiple delays to ensure everything is rendered
      setTimeout(() => {
        // Force multiple reflows
        void element.offsetHeight;
        void element.scrollHeight;
        void element.clientHeight;
        
        // Ensure all tables and content are visible
        const tables = element.querySelectorAll('table');
        tables.forEach((table: any) => {
          if (table.style) {
            table.style.overflow = 'visible';
            table.style.maxHeight = 'none';
            table.style.height = 'auto';
            table.style.display = 'table';
          }
        });
        
        const tbodyElements = element.querySelectorAll('tbody');
        tbodyElements.forEach((tbody: any) => {
          if (tbody.style) {
            tbody.style.overflow = 'visible';
            tbody.style.maxHeight = 'none';
            tbody.style.height = 'auto';
            tbody.style.display = 'table-row-group';
          }
        });
        
        // Additional delay to ensure Angular has rendered all *ngFor loops
        setTimeout(() => {
          // Final check and force reflow multiple times
          void element.offsetHeight;
          void element.scrollHeight;
          void element.clientHeight;
          
          // Count actual rendered rows to verify
          const processRows = element.querySelectorAll('tbody tr').length;
          const revisionRows = element.querySelectorAll('table tbody tr').length;
          const revisionCards = element.querySelectorAll('[style*="Revision"]').length;
          console.log('Rendered rows - Processes:', processRows, 'Revisions:', revisionRows, 'Revision Cards:', revisionCards);
          
          // Ensure all ngFor loops are rendered - force change detection
          const allNgForElements = element.querySelectorAll('[ng-reflect-ng-for-of]');
          console.log('Found ngFor elements:', allNgForElements.length);
          
          const finalHeight = Math.max(
            element.scrollHeight,
            element.offsetHeight,
            element.clientHeight,
            element.getBoundingClientRect().height
          );
          
          console.log('Final element height:', finalHeight);
          
          // Set explicit height to ensure capture
          element.style.height = finalHeight + 'px';
          
          // One more delay to ensure height is applied
          setTimeout(() => {
            this.generatePDF(element!, true, {
              display: originalDisplay,
              position: originalPosition,
              left: originalLeft,
              top: originalTop,
              width: originalWidth,
              overflow: originalOverflow,
              maxHeight: originalMaxHeight,
              visibility: originalVisibility,
              zIndex: originalZIndex,
              height: originalHeight
            });
          }, 500);
        }, 1000);
      }, 1000);
    }, 200);
  }

  private generatePDF(element: HTMLElement, restoreStyles: boolean, originalStyles: any): void {
    const customerName = this.getCustomerName(this.popupCustomer!).replace(/[^a-z0-9]/gi, '_');
    const partName = (this.popupCustomer?.partName || 'N/A').replace(/[^a-z0-9]/gi, '_');
    const filename = `Customer_Full_Details_${customerName}_${partName}_${new Date().toISOString().split('T')[0]}.pdf`;

    // Use html2canvas + jsPDF directly - let html2canvas auto-detect dimensions
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc: Document) => {
        // Ensure cloned document has all elements visible
        const clonedElement = clonedDoc.getElementById('fullInfoPdfContent');
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.overflow = 'visible';
          clonedElement.style.maxHeight = 'none';
          clonedElement.style.height = 'auto';
          
          // Make all children visible
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el: any) => {
            if (el.style) {
              el.style.overflow = 'visible';
              el.style.maxHeight = 'none';
              el.style.height = 'auto';
              el.style.display = '';
              el.style.visibility = 'visible';
            }
          });
        }
      }
    }).then((canvas: HTMLCanvasElement) => {
      console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 3;
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = pdfHeight - (margin * 2);
      
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      // If content fits on one page
      if (imgHeight <= contentHeight) {
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      } else {
        // Multi-page handling
        let heightLeft = imgHeight;
        let position = margin;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= contentHeight;
        
        // Add additional pages if needed
        while (heightLeft > 0) {
          position = margin - (imgHeight - heightLeft);
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
          heightLeft -= contentHeight;
        }
      }
      
      pdf.save(filename);
      
      if (restoreStyles) {
        element.style.display = originalStyles.display || 'none';
        element.style.position = originalStyles.position || '';
        element.style.left = originalStyles.left || '';
        element.style.top = originalStyles.top || '';
        element.style.width = originalStyles.width || '';
        element.style.visibility = originalStyles.visibility || 'hidden';
        element.style.zIndex = originalStyles.zIndex || '';
        element.style.overflow = originalStyles.overflow || '';
        element.style.maxHeight = originalStyles.maxHeight || '';
        element.style.height = originalStyles.height || '';
        element.style.opacity = '';
        element.style.pointerEvents = '';
        element.style.transform = '';
      }
    }).catch((error) => {
      console.error('PDF generation error:', error);
      if (restoreStyles) {
        element.style.display = originalStyles.display || 'none';
        element.style.visibility = originalStyles.visibility || 'hidden';
        element.style.overflow = originalStyles.overflow || '';
        element.style.maxHeight = originalStyles.maxHeight || '';
        element.style.height = '';
      }
    });
  }

  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

}
