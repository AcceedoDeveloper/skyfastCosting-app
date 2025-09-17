import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Process } from '../../../model/product.model';



@Component({
  selector: 'app-add-process',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './add-process.component.html',
  styleUrl: './add-process.component.scss'
})
export class AddProcessComponent {


   processForm: FormGroup;
  isEditMode: boolean = false;

    constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddProcessComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { process?: Process }
  ) {
    this.isEditMode = !!data?.process;

    this.processForm = this.fb.group({
      processName: [data?.process?.processName || '', Validators.required],
      TonnageJaw: [data?.process?.TonnageJaw || '', Validators.required],
      Hours: [data?.process?.Hours || '', Validators.required],
     machineCentre: [data?.process?.machineCentre || '', Validators.required],
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.processForm.valid) {
      const payload = { ...this.data?.process, ...this.processForm.value };
      console.log('data', payload);
      
      this.dialogRef.close(payload);
    }
  }


}
