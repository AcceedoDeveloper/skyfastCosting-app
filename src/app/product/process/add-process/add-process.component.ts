import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Process } from '../../../model/product.model';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import * as processActions from '../../store/product.actions';
import { MatSelectModule } from '@angular/material/select';



@Component({
  selector: 'app-add-process',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './add-process.component.html',
  styleUrl: './add-process.component.scss'
})
export class AddProcessComponent implements OnInit, OnDestroy {
   processForm: FormGroup;
  isEditMode: boolean = false;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();
  private isSaving = false;

    constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddProcessComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { process?: Process },
    private store: Store,
    private actions$: Actions
  ) {
    this.isEditMode = !!data?.process;

    this.processForm = this.fb.group({
      processName: [data?.process?.processName || '', Validators.required],
      TonnageJaw: [data?.process?.TonnageJaw || ''],
      Hours: [data?.process?.Hours || ''],
     machineCentre: [data?.process?.machineCentre || ''],
     Unit:[data?.process?.Unit ||'']
    });
  }

  ngOnInit(): void {
    // Listen to success actions
    this.actions$.pipe(
      ofType(processActions.addProcessSuccess, processActions.updateProcessSuccess),
      takeUntil(this.destroy$),
      filter(() => this.isSaving)
    ).subscribe(() => {
      this.isSaving = false;
      this.errorMessage = null;
      this.dialogRef.close(true);
    });

    // Listen to failure actions
    this.actions$.pipe(
      ofType(processActions.apiFailure),
      takeUntil(this.destroy$),
      filter(() => this.isSaving)
    ).subscribe((action) => {
      this.isSaving = false;
      // Extract error message from backend response
      const error = action.error;
      let message = 'An error occurred. Please try again.';
      
      // Try different error message formats from backend
      if (error?.error?.message) {
        message = error.error.message;
      } else if (error?.error?.error) {
        message = error.error.error;
      } else if (error?.message) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error?.error && typeof error.error === 'string') {
        message = error.error;
      }
      
      this.errorMessage = message;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.processForm.valid) {
      this.errorMessage = null;
      this.isSaving = true;
      const payload = { ...this.data?.process, ...this.processForm.value };
      console.log('data', payload);

      if (this.isEditMode && this.data?.process?._id) {
        // Edit mode - use store dispatch
        this.store.dispatch(processActions.updateProcess({ 
          id: this.data.process._id, 
          process: this.processForm.value 
        }));
      } else {
        // Add mode - use store dispatch
        this.store.dispatch(processActions.addProcess({ process: this.processForm.value }));
      }
      // Don't close dialog here - wait for success/failure action
    }
  }


}
