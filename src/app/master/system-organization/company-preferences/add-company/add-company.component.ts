import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Company } from '../../../../model/company.model';
import * as RoleActions from '../../store/system.actions';
import { Store } from '@ngrx/store';



@Component({
  selector: 'app-add-company',
  imports: [
     CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './add-company.component.html',
  styleUrl: './add-company.component.scss'
})
export class AddCompanyComponent implements OnInit{

   companyForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCompanyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Company | null,
    private store : Store
  ) {}

  ngOnInit(): void {
    this.companyForm = this.fb.group({
      companyName: [this.data?.companyName || '', Validators.required],
      companySlogan: [this.data?.companySlogan || ''],
      companyAddress: [this.data?.companyAddress || '', Validators.required],
      companyGSTNumber: [this.data?.companyGSTNumber || '', Validators.required],
      backupEmailId: [this.data?.backupEmailId || '', [Validators.required, Validators.email]],
      backupTiming: [this.data?.backupTiming || '', Validators.required]
    });
    
  }


onSubmit(): void {
  if (this.companyForm.valid) {
    if (this.data) {
      console.log('id ', this.data._id);
      
      console.log('Edited Company:', this.companyForm.value);
    } else {
      console.log('New Company Added:', this.companyForm.value);
      const data = this.companyForm.value;
      this.store.dispatch(RoleActions.addCompany({ company : data}));
    }
    this.dialogRef.close(this.companyForm.value);
  }
}


  onCancel(): void {
    this.dialogRef.close();
  }
}
