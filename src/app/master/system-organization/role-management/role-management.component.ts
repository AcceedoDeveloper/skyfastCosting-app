import { Component, OnInit } from '@angular/core';
import { Role} from '../../../model/role.model';
import * as RoleActions from '../store/system.actions';
import { selectAllRoles } from '../store/system.selectors';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { CommonModule, } from '@angular/common';
import { MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ConfrimDialogComponent} from '../../../shared/confrim-dialog/confrim-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,  
    FormsModule],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})
export class RoleManagementComponent  implements OnInit {

  constructor(private store : Store, private dialog : MatDialog){}

roles$!: Observable<Role[]>;
 newRoleName: string = '';
  isEditMode: boolean = false;
  editingId: string | null = null;

ngOnInit() {

  this.roles$ = this.store.select(selectAllRoles);
  this.roles$.subscribe(roles => {
    console.log('Roles from store:', roles);
  });

  this.store.dispatch(RoleActions.loadRoles());
}

 addRole() {
    if (!this.newRoleName.trim()) return;
    this.store.dispatch(RoleActions.addRole({ role: { role: this.newRoleName } as Role }));
    this.store.dispatch(RoleActions.loadRoles());
    this.newRoleName = '';
  }

  updateRole() {
    if (!this.newRoleName.trim() || !this.editingId) return;
    this.store.dispatch(RoleActions.updateRole({
      id: this.editingId,
      role: { role: this.newRoleName } as Role
    }));
    this.store.dispatch(RoleActions.loadRoles());
    this.cancelEdit();
  }

  editRole(role: Role) {
    this.isEditMode = true;
    this.editingId = role._id;
    this.newRoleName = role.role;
  }

  cancelEdit() {
    this.isEditMode = false;
    this.editingId = null;
    this.newRoleName = '';
  }

deleteRole(id: string) {
  const dialogRef = this.dialog.open(ConfrimDialogComponent, {
    width: '350px',
    data: {
      title: 'Delete Role',
      message: 'Are you sure you want to delete this role?'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      this.store.dispatch(RoleActions.deleteRole({ id }));
    } 
  });
}


}
