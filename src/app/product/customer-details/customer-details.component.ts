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

  isEditing: boolean = false;
  private search$ = new BehaviorSubject<string>('');
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

    this.totalFiltered$ = combineLatest([this.customers$, this.search$]).pipe(
      map(([customers, search]) => {
        return customers.filter(c =>
          c.customerName.customerName.toLowerCase().includes(search.toLowerCase()) ||
          c.partName.toLowerCase().includes(search.toLowerCase())
        ).length;
      })
    );

    this.filteredCustomers$ = combineLatest([this.customers$, this.search$, this.page$]).pipe(
      map(([customers, search, page]) => {
        const filtered = customers.filter(c =>
          c.customerName.customerName.toLowerCase().includes(search.toLowerCase()) ||
          c.partName.toLowerCase().includes(search.toLowerCase())
        );
        const start = page.index * page.size;
        return filtered.slice(start, start + page.size);
      })
    );

    this.customers$.subscribe(customers => {
      console.log('Customers from store:', customers);
      console.table(customers);
    });

    this.store.dispatch(customerActions.loadCustomers());
    this.getCurrencyData();
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

  getLatestRevision(c: any) {
    return c?.revisions && c.revisions.length > 0
      ? c.revisions[c.revisions.length - 1]
      : null;
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
  this.productservices.quotationData(customerName, partName, revision).subscribe({
    next: (res) => {
      this.quotationData = res;
      console.log('Quotation Data:', this.quotationData);
      if( this.quotationData.results[0].revisions[0].currency != null){
            this.pdfview= true;
      }
      else{
        this.domesticpdf = true;
      }
  
      
    },
    error: (err) => {
      console.error('Error fetching quotation:', err);
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

viewQuatation(customerName: string, partName: string, revision: number): void {
  this.isPdfLoading$.next(true); // Show loading spinner

  this.productservices.quotationData(customerName, partName, revision).subscribe({
    next: async (res) => {
      this.quotationData = res;
      console.log('Quotation Data:', this.quotationData);
      

      // Check which PDF layout to use
      const hasCurrency = this.quotationData.results[0]?.revisions[0]?.currency != null;

      if (hasCurrency) {
        this.domesticpdfwithouticon = false;
        this.pdfwithouticon = true;
      } else {
        this.domesticpdfwithouticon = true;
        this.pdfwithouticon = false;
      }

      this.cdr.detectChanges();

      // Wait for DOM render
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const element = document.getElementById('pdfContent');
      if (!element) {
        this.isPdfLoading$.next(false);
        this.tooser.error('PDF content not found');
        return;
      }

      try {
        // Convert to canvas
        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);

        // Convert to blob & open new tab
        const pdfBlob = pdf.output('blob');
        const blobUrl = window.URL.createObjectURL(pdfBlob);
        const newWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');

        if (newWindow) {
          this.tooser.success('PDF opened in new tab!');
          
          // ✅ Wait for a few seconds after opening the tab, then save to backend
          setTimeout(() => {
            this.saveQuotationPDF(customerName, partName, revision);
          }, 3000); // waits 3 seconds before calling backend save
        } else {
          this.tooser.error('Please allow popups to view the PDF');
        }

        // Cleanup
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
        this.pdfwithouticon = false;
        this.domesticpdfwithouticon = false;
        this.isPdfLoading$.next(false);
      } catch (error) {
        console.error('Error generating PDF:', error);
        this.isPdfLoading$.next(false);
        this.tooser.error('Failed to generate PDF');
      }
    },

    error: (err) => {
      console.error('Error fetching quotation:', err);
      this.isPdfLoading$.next(false);
      this.tooser.error('Failed to load quotation data');
    }
  });
}



closeda(){
  this.pdfview = false;
  this.domesticpdf = false;
  this.pdfwithouticon = false;
  this.domesticpdfwithouticon = false;
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



