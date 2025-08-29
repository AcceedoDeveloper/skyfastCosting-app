import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
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
@Component({
  selector: 'app-customer-details',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss'
})
export class CustomerDetailsComponent implements OnInit{
  customers$!: Observable<CustomerDetails[]>;


  constructor(private store: Store, private fb: FormBuilder, private dialog: MatDialog) {
  }

  ngOnInit(): void {

    
 this.customers$ = this.store.select(selectAllCustomers);
  this.customers$.subscribe(customers => {
      console.log('Customers from store:', customers);
    }
    );


    this.store.dispatch(customerActions.loadCustomers());
    
  }


}
