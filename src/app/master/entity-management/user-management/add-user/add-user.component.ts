import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import * as MachineTypeActions from '../../store/entity.action';
import { User } from '../../../../model/machine.model';
import { Role} from '../../../../model/role.model';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';
import * as RoleActions from '../../../system-organization/store/system.actions';
import { selectAllRoles } from '../../../system-organization/store/system.selectors';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-add-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent implements OnInit, OnDestroy {
   role$! : Observable<Role[]>;
  form!: FormGroup;
  isEdit = false;
  changingPassword = false;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();
  private isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUserComponent>,
    private store: Store,
    private actions$: Actions,
    @Inject(MAT_DIALOG_DATA) public data: User | null
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data; // if data exists → edit mode

    this.form = this.fb.group({
      userName: [this.data?.userName || '', Validators.required],
      fullName: [this.data?.fullName || '', Validators.required],
      emailId: [this.data?.emailId || '', [Validators.required, Validators.email]],
      phoneNumber: [this.data?.phoneNumber || ''],
     role: [this.data?.role?.role || this.data?.role || '', Validators.required], 
      password: ['']
    });

    // Require password only for Add; on Edit it's optional until user chooses to change
    const passwordCtrl = this.form.get('password');
    if (passwordCtrl) {
      if (this.isEdit) {
        passwordCtrl.clearValidators();
        passwordCtrl.updateValueAndValidity();
      } else {
        passwordCtrl.addValidators(Validators.required);
        passwordCtrl.updateValueAndValidity();
      }
    }



     this.role$ = this.store.select(selectAllRoles);

    this.role$.subscribe( data => {
      console.log('role', data);
      
    })

        this.store.dispatch(RoleActions.loadRoles());

    // Listen to success actions
    this.actions$.pipe(
      ofType(MachineTypeActions.addUserSuccess, MachineTypeActions.updateUserSuccess),
      takeUntil(this.destroy$),
      filter(() => this.isSaving) // Only process success when we're saving
    ).subscribe(() => {
      this.isSaving = false;
      this.errorMessage = null;
      this.dialogRef.close();
    });

    // Listen to failure actions
    this.actions$.pipe(
      ofType(MachineTypeActions.apiFailure),
      takeUntil(this.destroy$),
      filter(() => this.isSaving) // Only process failures when we're saving
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

  save(): void {
    if (this.form.valid) {
      this.errorMessage = null; // Clear previous errors
      this.isSaving = true; // Mark that we're saving
      const formValue = this.form.value;

      if (this.isEdit && this.data?._id) {
        console.log('data', formValue);
        console.log('is', this.data._id);
        
        
        this.store.dispatch(MachineTypeActions.updateUser({
          id: this.data._id,
          user: this.changingPassword ? formValue : { ...formValue, password: undefined }
        }));
      } else {
        console.log('data', formValue);
        
        this.store.dispatch(MachineTypeActions.addUser({ user: formValue }));
      }
      // Don't close dialog here - wait for success/failure action
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}