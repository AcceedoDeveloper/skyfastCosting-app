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
  editingId: string | null = null; 


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


  toggleForm(isAdd: boolean = false) {
    this.showForm = !this.showForm;

    if(isAdd){
      this.editingId=null;
      this.deptForm.reset();
    }
  }

 onSubmit() {
  if (this.deptForm.valid) {
    const formValue = this.deptForm.value;

    if (this.editingId) {
      console.log('edit data', formValue);
      // update mode
      this.store.dispatch(RoleActions.updateDepartment({ 
        id: this.editingId, 
        department: { ...formValue, _id: this.editingId } as Department
      }));
    } else {
      // add mode
      this.store.dispatch(RoleActions.addDepartment({ department: formValue }));
    }

    // cleanup
    this.toggleForm();
    this.deptForm.reset();
    this.editingId = null;
  }
}


  onDeleteDepartment(id: string) {
  this.store.dispatch(RoleActions.deleteDepartment({ id }));
}

onEditDepartment(dept: Department) {
  this.editingId = dept._id; // remember which one is being edited
  this.deptForm.patchValue({
    department: dept.department,
    departmentCode: dept.departmentCode
  });
  this.showForm = true; // open the popup
}


}
