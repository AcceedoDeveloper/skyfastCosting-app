import { Component, OnInit, TemplateRef, TrackByFunction, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';

import * as RoleActions from '../store/system.actions';
import { selectCompany, selectHosting } from '../store/system.selectors';

import { Company } from '../../../model/company.model';
import { HostingMail } from '../../../model/role.model';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductService } from '../../../services/product.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-company-preferences',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './company-preferences.component.html',
  styleUrl: './company-preferences.component.scss'
})
export class CompanyPreferencesComponent implements OnInit {
  company$!: Observable<Company[]>;
  hosting$!: Observable<HostingMail[]>;
  currencyData: any[] = [];
  isEditing: boolean = false;
  companyForm!: FormGroup;
  hostingForm!: FormGroup;
  meltScrapForm!: FormGroup;

  readonly defaultMeltScrapPercentage = 0.101;

  editingCompany: { id: string } | null = null;
  editingHosting: { id: string } | null = null;
  editingMeltScrap: { id: string } | null = null;
  trackByCompanyId!: TrackByFunction<Company>;
  trackByHostingId!: TrackByFunction<HostingMail>;

  constructor(private store: Store, private fb: FormBuilder,private productservices : ProductService  ) {}

  ngOnInit(): void {
    this.company$ = this.store.select(selectCompany);
    this.store.dispatch(RoleActions.loadCompany());

    this.hosting$ = this.store.select(selectHosting).pipe(
      map(data => Array.isArray(data) ? data : [data])
    );
    this.store.dispatch(RoleActions.loadHostingMail());
    this.getCurrencyData();
  }


  editCompany(company: Company) {
    this.editingCompany = { id: company._id! };
    this.companyForm = this.fb.group({
      companyName: [company.companyName, Validators.required],
      companySlogan: [company.companySlogan],
      companyAddress: [company.companyAddress, Validators.required],
      companyGSTNumber: [company.companyGSTNumber, Validators.required],
      backupEmailId: [company.backupEmailId, [Validators.required, Validators.email]],
      backupTiming: [company.backupTiming, Validators.required],
      // carried through so saving company details does not drop the costing preference
      meltScrapPercentage: [company.meltScrapPercentage ?? this.defaultMeltScrapPercentage]
    });
  }

  cancelEditCompany() {
    this.editingCompany = null;
  }

  saveCompany() {
    if (this.companyForm.valid && this.editingCompany) {
      this.store.dispatch(RoleActions.updateCompany({
        id: this.editingCompany.id,
        company: this.companyForm.value
      }));
      this.editingCompany = null;
    }
  }


  editMeltScrap(company: Company) {
    this.editingMeltScrap = { id: company._id! };
    this.meltScrapForm = this.fb.group({
      meltScrapPercentage: [
        company.meltScrapPercentage ?? this.defaultMeltScrapPercentage,
        [Validators.required, Validators.min(0)]
      ]
    });
  }

  cancelEditMeltScrap() {
    this.editingMeltScrap = null;
  }

  saveMeltScrap(company: Company) {
    if (this.meltScrapForm.valid && this.editingMeltScrap) {
      this.store.dispatch(RoleActions.updateCompany({
        id: this.editingMeltScrap.id,
        company: {
          ...company,
          meltScrapPercentage: Number(this.meltScrapForm.value.meltScrapPercentage)
        }
      }));
      this.editingMeltScrap = null;
    }
  }


  editHosting(host: HostingMail) {
    this.editingHosting = { id: host._id! };
    this.hostingForm = this.fb.group({
      smtpServer: [host.smtpServer, Validators.required],
      portNo: [host.portNo, Validators.required],
      emailId: [host.emailId, [Validators.required, Validators.email]],
      password: [host.password, Validators.required],
      EncryptionType: [host.EncryptionType, Validators.required]
    });
  }

  cancelEditHosting() {
    this.editingHosting = null;
  }

  saveHosting() {
    if (this.hostingForm.valid && this.editingHosting) {
      this.store.dispatch(RoleActions.updateHostingMail({
        id: this.editingHosting.id,
        hostingMail: this.hostingForm.value
      }));
      this.editingHosting = null;
    }
  }


  getCurrencyData() {
  this.productservices.getCurrencyRates().subscribe(
(res) => {
  this.currencyData = res;
      console.log('Currency Data:', this.currencyData);
    }
  );
}

enableEdit() {
  this.isEditing = true;
}


cancelEdit() {
  this.isEditing = false;
}


saveCurrency(){
  console.log('currency data to save:', this.currencyData);
  this.isEditing = false;
 const playload = {
  EURO : this.currencyData[0].EURO,
  USD : this.currencyData[0].USD
 }
 const id = this.currencyData[0]._id;

 console.log('id', id);
 console.log('data', playload);
 
 this.productservices.updtaeCurrencyRates(id, playload).subscribe({
  next: (res) => {
    console.log('Currency updated successfully:', res);
    this.getCurrencyData(); // Refresh data after update
  },
  error: (err) => {
    console.error('Error updating currency:', err);
  } 
})

}
}