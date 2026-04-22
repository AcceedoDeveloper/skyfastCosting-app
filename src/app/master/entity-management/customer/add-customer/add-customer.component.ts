import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as MachineTypeActions from '../../store/entity.action';
import { Customer } from '../../../../model/machine.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule
  ],
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.scss'
})
export class AddCustomerComponent implements OnInit {
  customerForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private dialogRef: MatDialogRef<AddCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Customer // ✅ data passed from CustomerComponent
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data?._id; // ✅ if _id exists → Edit mode

    this.customerForm = this.fb.group({
      customerName: [this.data?.customerName || '', Validators.required],
      address: [this.data?.address || ''],
      gstNumber: [this.data?.gstNumber || ''],
      phone: [this.data?.phone || ''],
      email: [this.data?.email || ''],
      transport: [this.data?.transport || '',Validators.required],
      category:[this.data?.category || '',Validators.required],
      baseCost: [this.data?.baseCost || 0]
    });
  }

  
  onSubmit(): void {
    if (this.customerForm.valid) {
      const customer: Customer = {
        ...this.data,
        ...this.customerForm.value
      };

      if (this.isEditMode) {
        // ✅ Update Customer
        this.store.dispatch(
          MachineTypeActions.updateCustomer({ id: this.data._id!, customer })
        );
      } else {
        // ✅ Add Customer
        this.store.dispatch(MachineTypeActions.addCustomer({ customer }));
      }

      this.dialogRef.close(); // ✅ close dialog after action
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
