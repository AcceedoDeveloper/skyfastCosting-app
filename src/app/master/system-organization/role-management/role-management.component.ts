import { Component, OnInit } from '@angular/core';
import { Role} from '../../../model/role.model';
import * as RoleActions from '../store/system.actions';
import { selectAllRoles } from '../store/system.selectors';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { CommonModule, } from '@angular/common';
import { MatIconModule} from '@angular/material/icon'

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule  ],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})
export class RoleManagementComponent  implements OnInit {

  constructor(private store : Store){}

roles$!: Observable<Role[]>;

ngOnInit() {

  this.roles$ = this.store.select(selectAllRoles);
  this.roles$.subscribe(roles => {
    console.log('Roles from store:', roles);
  });

  this.store.dispatch(RoleActions.loadRoles());
}


}
