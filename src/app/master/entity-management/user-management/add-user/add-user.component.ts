import { Component, Inject, OnInit } from '@angular/core';
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
import { Observable } from 'rxjs';
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
export class AddUserComponent implements OnInit {
   role$! : Observable<Role[]>;
  form!: FormGroup;
  isEdit = false;
  changingPassword = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUserComponent>,
    private store: Store,
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

  }

  save(): void {
    if (this.form.valid) {
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

      this.dialogRef.close();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}