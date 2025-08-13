import { Component, OnInit } from '@angular/core';
import { Department} from '../../../model/role.model';
import * as RoleActions from '../store/system.actions';
import { selectAllDepartmenstate } from '../store/system.selectors';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { CommonModule, } from '@angular/common'

@Component({
  selector: 'app-department-creation',
  standalone: true,
  imports: [ CommonModule, ],
  templateUrl: './department-creation.component.html',
  styleUrl: './department-creation.component.scss'
})
export class DepartmentCreationComponent   implements OnInit {

  department$! : Observable<Department[]>;

  constructor(private store : Store){}

  ngOnInit(): void {

    this.department$ = this.store.select(selectAllDepartmenstate);

  this.department$.subscribe(Department => {

    console.log('Department from store:', Department);
  });
    this.store.dispatch(RoleActions.loadDepartment());
    
  }

}
