import { Component, OnInit } from '@angular/core';
import { Department} from '../../../model/role.model';
import * as RoleActions from '../store/system.actions';
import { selectAllDepartmenstate } from '../store/system.selectors';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { CommonModule, } from '@angular/common'


import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-department-creation',
  standalone: true,
  imports: [ CommonModule, MatButtonModule, MatIconModule ,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './department-creation.component.html',
  styleUrl: './department-creation.component.scss'
})
export class DepartmentCreationComponent   implements OnInit {

  department$! : Observable<Department[]>;
  showForm = false; 
  deptForm!: FormGroup;

  constructor(private store : Store, private fb: FormBuilder){}

  ngOnInit(): void {

    this.department$ = this.store.select(selectAllDepartmenstate);

  this.department$.subscribe(Department => {

    console.log('Department from store:', Department);
  });
    this.store.dispatch(RoleActions.loadDepartment());

    this.deptForm = this.fb.group({
      department: ['', Validators.required],
      departmentCode: ['', Validators.required]
    });

    
  }


  toggleForm() {
    this.showForm = !this.showForm;
  }

  onSubmit() {
    if (this.deptForm.valid) {
       console.log(this.deptForm.value);
       const formValue = this.deptForm.value;
  console.log(formValue);
       this.store.dispatch(RoleActions.addDepartment({ department: formValue }));
      this.toggleForm(); // close popup after submit
      this.deptForm.reset();
    }
  }

  onDeleteDepartment(id: string) {
  this.store.dispatch(RoleActions.deleteDepartment({ id }));
}

}
