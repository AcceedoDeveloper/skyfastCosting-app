import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
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
import {CustomerDetails } from '../../model/customer-details.model';
import { MatIconModule} from '@angular/material/icon';
import { AddCustomerDetailsComponent} from './add-customer-details/add-customer-details.component';
import { ConfrimDialogComponent} from '../../shared/confrim-dialog/confrim-dialog.component';
import { EditCustomerDetailsComponent } from './edit-customer-details/edit-customer-details.component';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProductService} from '../../services/product.service';
import html2pdf from 'html2pdf.js';
import { CustomerResponse} from '../../model/pdf.model';
import { ChangeDetectorRef } from '@angular/core';


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
  ],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss'
})
export class CustomerDetailsComponent implements OnInit{
  customers$!: Observable<CustomerDetails[]>;
selectedRevisions: any[] = [];
showComparePopup: boolean = false;
   expandedCustomer: any = null;
  quotationData!: CustomerResponse; 
  pdfview : boolean = false;

  constructor(private store: Store, private fb: FormBuilder, private dialog: MatDialog, private productservices: ProductService,  private cdr: ChangeDetectorRef) {
  }

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
  this.customers$.subscribe(customers => {
      console.log('Customers from store:', customers);
      console.table(customers);
    }
    );


    this.store.dispatch(customerActions.loadCustomers());
    
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



 downloadPDF() {
    const element = document.getElementById('pdfContent')!;
    const options = {
      margin: 10,
      filename: 'angular-demo.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(options).save();
  }


downloadQuotations(customerName: string, partName: string, revision: number): void {
  this.productservices.quotationData(customerName, partName, revision).subscribe({
    next: (res) => {
      this.quotationData = res;
      console.log('Quotation Data:', this.quotationData);
      this.pdfview= true;
      
    },
    error: (err) => {
      console.error('Error fetching quotation:', err);
    }
  });


}

closeda(){
  this.pdfview = false;
}

}

