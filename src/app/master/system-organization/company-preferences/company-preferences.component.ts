import { Component, OnInit, inject } from '@angular/core';
import * as RoleActions from '../store/system.actions';
import { selectCompany } from '../store/system.selectors';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { CommonModule, } from '@angular/common'
import { Company } from '../../../model/company.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { AddCompanyComponent}  from './add-company/add-company.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';



@Component({
  selector: 'app-company-preferences',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule ,
 MatFormFieldModule, MatInputModule,
    MatCardModule,  MatDialogModule,
  ],
  templateUrl: './company-preferences.component.html',
  styleUrl: './company-preferences.component.scss'
})
export class CompanyPreferencesComponent implements OnInit{

  company$! : Observable<Company[]>;
  
  private dialog = inject(MatDialog); 

    constructor(private store : Store, ){}

    ngOnInit(): void {

      this.company$ = this.store.select(selectCompany);

      this.company$.subscribe( data =>{
        console.log('data', data);
      })

      this.store.dispatch(RoleActions.loadCompany());
      
    }

   openAddCompany(company?: Company) {
  this.dialog.open(AddCompanyComponent, {
    width: '500px',
    data: company || null  // pass company if editing
  });
}
 
}
