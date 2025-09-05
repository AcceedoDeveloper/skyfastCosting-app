import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import * as customerActions from '../store/product.actions';
import { selectAllCustomers } from '../store/product.selectors';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    MatCheckboxModule
  ],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss'
})
export class CustomerDetailsComponent implements OnInit{
  customers$!: Observable<CustomerDetails[]>;
selectedRevisions: any[] = [];
showComparePopup: boolean = false;
   expandedCustomer: any = null;



  constructor(private store: Store, private fb: FormBuilder, private dialog: MatDialog) {
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

onRevisionSelect(revision: any, event: any) {
  if (event.checked) {
    if (this.selectedRevisions.length < 2) {
      this.selectedRevisions.push(revision);
    } else {
      event.source.checked = false; // restrict to 2
    }
  } else {
    this.selectedRevisions = this.selectedRevisions.filter(r => r !== revision);
  }
}

canCompare(): boolean {
  return this.selectedRevisions.length === 2;
}

openComparePopup() {
  if (this.selectedRevisions.length === 2) {
    this.showComparePopup = true;
  }
}

closeComparePopup() {
  this.showComparePopup = false;
}


onRevisionSelectPopup(revision: any, event: any) {
  if (event.checked) {
    if (this.selectedRevisions.length < 2) {
      this.selectedRevisions.push(revision);
    } else {
      event.source.checked = false; // restrict to 2
    }
  } else {
    this.selectedRevisions = this.selectedRevisions.filter(r => r !== revision);
  }
}


getCellClass(field: string): string {
  if (!this.selectedRevisions || this.selectedRevisions.length < 2) return '';

  const val1 = this.selectedRevisions[0][field];
  const val2 = this.selectedRevisions[1][field];

  if (val1 !== val2) {
    return 'highlight-diff'; // Apply red background if different
  }
  return ''; // No class if same
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



}

