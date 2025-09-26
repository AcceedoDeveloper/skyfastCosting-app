import { Component, OnInit } from '@angular/core';
import { Role } from '../../../model/role.model';
import * as RoleActions from '../store/system.actions';
import { selectAllRoles } from '../store/system.selectors';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfrimDialogComponent } from '../../../shared/confrim-dialog/confrim-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit {
  roles$!: Observable<Role[]>;
  newRoleName: string = '';
  isEditMode: boolean = false;
  editingId: string | null = null;

  constructor(private store: Store,private dialog : MatDialog ) {}

  ngOnInit() {
    this.roles$ = this.store.select(selectAllRoles);
    this.store.dispatch(RoleActions.loadRoles());
  }

  addRole() {
    if (!this.newRoleName.trim()) return;
    this.store.dispatch(RoleActions.addRole({ role: { role: this.newRoleName } as Role }));
    this.store.dispatch(RoleActions.loadRoles());
    this.newRoleName = '';
  }

  editRole(role: Role) {
    this.isEditMode = true;
    this.editingId = role._id;
    this.newRoleName = role.role;
  }

  updateRole() {
    if (!this.newRoleName.trim() || !this.editingId) return;
    this.store.dispatch(RoleActions.updateRole({ id: this.editingId, role: { role: this.newRoleName } as Role }));
    this.store.dispatch(RoleActions.loadRoles());
    this.cancelEdit();
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
      this.store.dispatch(RoleActions.loadRoles());
    }
  });
}

}
