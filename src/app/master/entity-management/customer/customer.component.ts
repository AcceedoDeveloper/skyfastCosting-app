import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Customer } from '../../../model/machine.model';
import * as MachineTypeActions from '../store/entity.action';
import { selectAllCustomers } from '../store/entity.selectors';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent implements OnInit {
  customer$!: Observable<Customer[]>;

  private dialog = inject(MatDialog);
  private store = inject(Store);

  ngOnInit(): void {
    this.customer$ = this.store.select(selectAllCustomers);

    this.customer$.subscribe(data => {
      console.log('Customers data:', data);
    });

    this.store.dispatch(MachineTypeActions.loadCustomer());
  }

  openAddCustomer(customer?: Customer) {
    this.dialog.open(AddCustomerComponent, {
      width: '600px',
      height: '600px',
      data: customer || {}
    });
  }

  deleteCustomer(id: string) {
    this.store.dispatch(MachineTypeActions.deleteCustomer({ id }));
  }
}
