import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import * as RoleActions from '../../store/system.actions';





@Component({
  selector: 'app-add-shift',
  imports: [
     CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './add-shift.component.html',
  styleUrl: './add-shift.component.scss'
})
export class AddShiftComponent implements OnInit {
  shiftForm!: FormGroup;

  private fb = inject(FormBuilder);
       private store = inject(Store);
  private dialogRef = inject(MatDialogRef<AddShiftComponent>);
  private data = inject(MAT_DIALOG_DATA);

 ngOnInit(): void {
  this.shiftForm = this.fb.group({
    shiftName: [this.data?.shiftName || '', Validators.required],
    startTime: [this.data?.startTime || '', Validators.required],
    endTime: [this.data?.endTime || '', Validators.required]
  });
}

onSubmit() {
  if (this.shiftForm.valid) {
    const shiftData = this.shiftForm.value;

    if (this.data && this.data._id) {

      this.store.dispatch(
        RoleActions.updateShift({ id: this.data._id, shift: shiftData }));
       
    } else {
      this.store.dispatch(RoleActions.addShift({ shift: shiftData }));
    }
    
     
    this.dialogRef.close();
  }
}


  onCancel() {
    this.dialogRef.close();
  }
}