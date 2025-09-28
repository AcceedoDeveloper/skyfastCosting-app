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
  quotationData!: CustomerResponse;
  pdfview: boolean = false;
  domesticpdf: boolean = false;
  pdfwithouticon: boolean = false;
  domesticpdfwithouticon: boolean = false;
  currencyData: any[] = [];
  isEditing: boolean = false;
  private search$ = new BehaviorSubject<string>('');
  private page$ = new BehaviorSubject<{ index: number; size: number }>({ index: 0, size: 10 });

  constructor(
    private store: Store, private fb: FormBuilder, 
    private dialog: MatDialog, private productservices: ProductService,) {}

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
      height: '650px',
      maxWidth: '75vw'
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
      }
    });
  }

  onEdit(customer: CustomerDetails) {
    const dialogRef = this.dialog.open(EditCustomerDetailsComponent, {
      width: '590%',
      height: '650px',
      maxWidth: '75vw',
      data: customer   // ✅ pass the selected customer to dialog
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

  // downloadPDF() {
  //   const element = document.getElementById('pdfContent')!;
  //   const options = {
  //     margin: 10,
  //     filename: 'angular-demo.pdf',
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 2 },
  //     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  //   };

  //   html2pdf().from(element).set(options).save();
  // }


//   downloadPDF() {
//   const element = document.getElementById('pdfContent')!;
  
//   const opt = {
//     margin:       0,
//     filename:     'quotation.pdf',
//     image:        { type: 'jpeg', quality: 1 },
//     html2canvas:  { scale: 2, useCORS: true },
//     jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
//     pagebreak:    { mode: ['avoid-all'] }  // prevent page breaks
//   };

//   // Force scale to single A4 by using html2canvas width/height vs jsPDF size
//   html2pdf()
//     .set(opt)
//     .from(element)
//     .toPdf()
//     .get('pdf')
//     .then(function (pdf) {
//       const totalPages = pdf.internal.getNumberOfPages();

//       // Get PDF dimensions
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();

//       // Scale content to fit 1 page
//       pdf.setPage(1);
//       pdf.internal.pageSize.width = pdfWidth;
//       pdf.internal.pageSize.height = pdfHeight;

//       // Content is automatically scaled by html2canvas
//     })
//     .save();
// }

// downloadPDF() {
//   const element = document.getElementById('pdfContent')!;
  
//   html2canvas(element, { scale: 2, useCORS: true }).then((canvas: HTMLCanvasElement) => {
//     const imgData = canvas.toDataURL('image/jpeg', 1.0);

//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = pdf.internal.pageSize.getHeight();

//     const imgProps = {
//       width: canvas.width,
//       height: canvas.height
//     };
//     const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);

//     const imgWidth = imgProps.width * ratio;
//     const imgHeight = imgProps.height * ratio;

//     pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
//     pdf.save('quotation.pdf');
//   });
// }


downloadPDF() {
  const element = document.getElementById('pdfContent')!;

  html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: "#fff"
  }).then((canvas: HTMLCanvasElement) => {
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // Keep aspect ratio
    const imgWidth = pdfWidth;  
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('quotation.pdf');
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




viewQuatation(customerName: string, partName: string, revision: number): void {
  this.productservices.quotationData(customerName, partName, revision).subscribe({
    next: (res) => {
      this.quotationData = res;
      console.log('Quotation Data:', this.quotationData);
      if( this.quotationData.results[0].revisions[0].currency != null){
            this.pdfwithouticon = true;
      }
      else{
        this.domesticpdfwithouticon = true;
      }
  
      
    },
    error: (err) => {
      console.error('Error fetching quotation:', err);
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

  console.log('image path:', 'http://localhost:3005' + encodeURI(this.quotationData.results[0].drawingImage));
  
  return 'http://localhost:3005' + encodeURI(this.quotationData.results[0].drawingImage);
  
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




}
