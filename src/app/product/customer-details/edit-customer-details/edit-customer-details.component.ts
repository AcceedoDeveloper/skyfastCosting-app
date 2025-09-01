import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CustomerDetails } from '../../../model/customer-details.model';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';


@Component({
  selector: 'app-edit-customer-details',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './edit-customer-details.component.html',
  styleUrl: './edit-customer-details.component.scss'
})
export class EditCustomerDetailsComponent {
  customerForm: FormGroup;

  get processes(): FormArray {
    return this.customerForm.get('processes') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditCustomerDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CustomerDetails | null
  ) {
    this.customerForm = this.fb.group({
      productName: [data?.productName || '', Validators.required],
      partName: [data?.partName || '', Validators.required],
      noOfRawMaterials: [data?.noOfRawMaterial ?? 0, [Validators.required, Validators.min(0)]],
      noOfProcess: [data?.noOfProcess ?? 0, [Validators.required, Validators.min(0)]],
      rejection: [data?.Rejection ?? 0],
      interestRate: [data?.InterestRate ?? 0],
      inspectorCost: [data?.InspectorCost ?? 0],
      packing: [data?.Packing || ''],
      toolAmbience: [data?.ToolAmbience || ''],
      castingWeight: [data?.castingWeight ?? 0],
      cavities: [data?.cavities ?? 0],
      meltingLoss: [data?.meltingLoss ?? 0],
      shortWeight: [data?.shortWeight ?? 0],
      processes: this.fb.array([])   // ✅ add processes as FormArray
    });

    // Populate processes if editing
    if (data?.processes) {
      data.processes.forEach(proc => this.addProcess(proc));
    }
  }

  addProcess(proc: any = null) {
    this.processes.push(
      this.fb.group({
        processId: [proc?.processId || ''],
        processName: [proc?.processName || '', Validators.required],
        TonnageJaw: [proc?.TonnageJaw || ''],
        Hours: [proc?.Hours ?? 0],
        cycleTime: [proc?.cycleTime ?? 0],
        cavity: [proc?.cavity ?? 0],
        cost: [proc?.cost ?? 0],
        calculation: [proc?.calculation ?? 0]
      })
    );
  }

  removeProcess(index: number) {
    this.processes.removeAt(index);
  }

  onSave() {
    if (this.customerForm.valid) {
      this.dialogRef.close({
        ...this.data,
        ...this.customerForm.value
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}