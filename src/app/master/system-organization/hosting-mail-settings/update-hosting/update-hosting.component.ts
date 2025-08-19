import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HostingMail } from '../../../../model/role.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Store } from '@ngrx/store';
import * as RoleActions from '../../store/system.actions';
import { MatInputModule } from '@angular/material/input';   // 👈 import this
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-update-hosting',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule,  MatInputModule,   // 👈 needed for matInput
    MatButtonModule ],
  templateUrl: './update-hosting.component.html',
  styleUrl: './update-hosting.component.scss'
})
export class UpdateHostingComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UpdateHostingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HostingMail | null,
    private store : Store
  ) {}

ngOnInit(): void {
  this.isEdit = !!this.data && !!this.data._id;

  this.form = this.fb.group({
    smtpServer: [this.data?.smtpServer || '', Validators.required],
    portNo: [this.data?.portNo || '', Validators.required],
    emailId: [this.data?.emailId || '', [Validators.required, Validators.email]],
    password: [this.data?.password || '', Validators.required],  // 👈 added
    EncryptionType: [this.data?.EncryptionType || '', Validators.required],
  });
}


save(): void {
  if (this.form.valid) {
    const formValue = this.form.value;

    if (this.isEdit && this.data?._id) {
      // Dispatch update action
      this.store.dispatch(RoleActions.updateHostingMail({ 
        id: this.data._id, 
        hostingMail: formValue 
      }));
    } else {
      // Dispatch add action
      this.store.dispatch(RoleActions.addHostingMail({ hostingMail: formValue }));
      this.store.dispatch(RoleActions.loadHostingMail());
    }
    // Close dialog after dispatch
    this.dialogRef.close();
  }
}


  cancel(): void {
    this.dialogRef.close();
  }
}
