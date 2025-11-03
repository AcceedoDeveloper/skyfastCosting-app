import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import * as RoleActions from '../../store/system.actions';
import{NgxMaterialTimepickerModule}from'ngx-material-timepicker';
import { selectAllShift } from '../../store/system.selectors';






@Component({
  selector: 'app-add-shift',
  imports: [
     CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
     NgxMaterialTimepickerModule
  ],
  templateUrl: './add-shift.component.html',
  styleUrl: './add-shift.component.scss'
})
export class AddShiftComponent implements OnInit {
  shiftForm!: FormGroup;
  existingTotalHours = 0; // sum of current shifts' hours
  dayLimitError = false; // true if proposed total exceeds 24h

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

  // Load existing shifts to compute total hours present
  this.store.select(selectAllShift).subscribe((shifts: any[]) => {
    const sum = (shifts || []).reduce((acc, s) => acc + (Number(s?.totalHours) || 0), 0);
    this.existingTotalHours = sum;
    this.validateDayLimit();
  });

  // Re-validate whenever times change
  this.shiftForm.valueChanges.subscribe(() => this.validateDayLimit());
}

onSubmit() {
  if (this.shiftForm.valid && !this.dayLimitError) {
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

  private validateDayLimit(): void {
    const start = this.parseTimeToMinutes(this.shiftForm.get('startTime')?.value);
    const end = this.parseTimeToMinutes(this.shiftForm.get('endTime')?.value);
    if (start == null || end == null) {
      this.dayLimitError = false;
      return;
    }

    let duration = end - start; // minutes
    if (duration < 0) duration += 24 * 60; // overnight
    const hours = duration / 60;

    // If editing, exclude the original shift's hours from existing sum
    const base = this.data && this.data.totalHours ? (this.existingTotalHours - Number(this.data.totalHours)) : this.existingTotalHours;
    this.dayLimitError = base + hours > 24;
  }

  private parseTimeToMinutes(val: string): number | null {
    if (!val) return null;
    const m = val.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ap = m[3]?.toUpperCase();
    if (ap === 'AM' && h === 12) h = 0;
    if (ap === 'PM' && h !== 12) h += 12;
    return h * 60 + min;
  }
}