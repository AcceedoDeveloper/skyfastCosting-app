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

@Component({
  selector: 'app-company-preferences',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './company-preferences.component.html',
  styleUrl: './company-preferences.component.scss'
})
export class CompanyPreferencesComponent implements OnInit {
  company$!: Observable<Company[]>;
  hosting$!: Observable<HostingMail[]>;

  companyForm!: FormGroup;
  hostingForm!: FormGroup;

  editingCompany: { id: string } | null = null;
  editingHosting: { id: string } | null = null;
  trackByCompanyId!: TrackByFunction<Company>;
  trackByHostingId!: TrackByFunction<HostingMail>;

  constructor(private store: Store, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.company$ = this.store.select(selectCompany);
    this.store.dispatch(RoleActions.loadCompany());

    this.hosting$ = this.store.select(selectHosting).pipe(
      map(data => Array.isArray(data) ? data : [data])
    );
    this.store.dispatch(RoleActions.loadHostingMail());
  }


  editCompany(company: Company) {
    this.editingCompany = { id: company._id! };
    this.companyForm = this.fb.group({
      companyName: [company.companyName, Validators.required],
      companySlogan: [company.companySlogan],
      companyAddress: [company.companyAddress, Validators.required],
      companyGSTNumber: [company.companyGSTNumber, Validators.required],
      backupEmailId: [company.backupEmailId, [Validators.required, Validators.email]],
      backupTiming: [company.backupTiming, Validators.required]
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
}