import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, map, take, takeUntil, Subject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { selectAllCustomers } from '../store/product.selectors';
import { CustomerDetails } from '../../model/customer-details.model';
import * as customerActions from '../store/product.actions';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit, OnDestroy {
  customers$!: Observable<CustomerDetails[]>;
  customerNames: string[] = [];
  partNames: string[] = [];
  
  selectedFilterType: string = '';
  selectedMachine: boolean = false;
  selectedDateFilterType: string = 'custom';
  selectedDatePreset: string = '';
  
  filters = {
    customerName: '',
    partName: '',
    singleDate: new Date().toISOString().split('T')[0], // Set to today's date by default
    week: '',
    month: '',
    year: ''
  };
  
  filteredData: CustomerDetails[] = [];
  private destroy$ = new Subject<void>();
  
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

  constructor(private store: Store) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    // Load customers from store
    this.store.dispatch(customerActions.loadCustomers());
    
    // Subscribe to customers data
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

    // Extract unique customer names and part names
    this.customers$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(customers => {
      // Extract unique customer names
      const uniqueCustomerNames = new Set<string>();
      customers.forEach(customer => {
        if (customer.customerName?.customerName) {
          uniqueCustomerNames.add(customer.customerName.customerName);
        }
      });
      this.customerNames = Array.from(uniqueCustomerNames).sort();

      // Extract unique part names
      const uniquePartNames = new Set<string>();
      customers.forEach(customer => {
        if (customer.partName) {
          uniquePartNames.add(customer.partName);
        }
      });
      this.partNames = Array.from(uniquePartNames).sort();

      // Initialize filtered data with all customers
      this.filteredData = customers;
    });
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
    this.customers$.pipe(take(1)).subscribe(customers => {
      let filtered = [...customers];

      // Filter by customer name
      if (this.filters.customerName) {
        filtered = filtered.filter(customer =>
          customer.customerName?.customerName === this.filters.customerName
        );
      }

      // Filter by part name
      if (this.filters.partName) {
        filtered = filtered.filter(customer =>
          customer.partName === this.filters.partName
        );
      }

      // Filter by date
      if (this.selectedDateFilterType === 'custom' && this.filters.singleDate) {
        filtered = filtered.filter(customer => {
          if (!customer.createdAt) return false;
          const customerDate = new Date(customer.createdAt).toISOString().split('T')[0];
          return customerDate === this.filters.singleDate;
        });
      }

      if (this.selectedDateFilterType === 'week' && this.filters.week) {
        filtered = filtered.filter(customer => {
          if (!customer.createdAt) return false;
          const customerDate = new Date(customer.createdAt);
          const weekString = this.getCurrentWeekString(customerDate);
          return weekString === this.filters.week;
        });
      }

      if (this.selectedDateFilterType === 'month' && this.filters.month) {
        filtered = filtered.filter(customer => {
          if (!customer.createdAt) return false;
          const customerDate = new Date(customer.createdAt);
          const monthString = `${customerDate.getFullYear()}-${String(customerDate.getMonth() + 1).padStart(2, '0')}`;
          return monthString === this.filters.month;
        });
      }

      if (this.selectedDateFilterType === 'year' && this.filters.year) {
        filtered = filtered.filter(customer => {
          if (!customer.createdAt) return false;
          const customerYear = new Date(customer.createdAt).getFullYear();
          return customerYear === parseInt(this.filters.year);
        });
      }

      this.filteredData = filtered;
    });
  }

  clearFilters(): void {
    this.selectedFilterType = '';
    this.selectedDateFilterType = '';
    this.selectedDatePreset = '';
    this.filters = {
      customerName: '',
      partName: '',
      singleDate: '', // Clear custom date as well
      week: '',
      month: '',
      year: ''
    };
    
    // Reset to show all customers
    this.customers$.pipe(take(1)).subscribe(customers => {
      this.filteredData = customers;
    });
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


}
