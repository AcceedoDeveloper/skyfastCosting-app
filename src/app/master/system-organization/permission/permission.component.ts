import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { ConfrimDialogComponent} from '../../../shared/confrim-dialog/confrim-dialog.component';
import { Role } from '../../../model/role.model';
import { Permission } from '../../../model/permission.model';
import { selectAllRoles, selectAllPermissions } from '../store/system.selectors';
import * as RoleActions from '../store/system.actions';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// ---------- Types ----------
interface UserChildren {
  user: boolean;
  role: boolean;
  shift: boolean;
  customer: boolean;
}

interface CompanyChildren {
  companyPreferences: boolean;
  permission: boolean;
}

interface MaterialChildren {
  rawMaterial: boolean;
  process: boolean;
}

interface PermissionGroup<T> {
  parent: boolean;
  children: T;
}

interface Permissions {
  dashboard: boolean;
  user: PermissionGroup<UserChildren>;
  company: PermissionGroup<CompanyChildren>;
  material: PermissionGroup<MaterialChildren>;
  quotation: boolean;
  reports: boolean;
}

interface SubItem<K> {
  key: K;
  label: string;
}

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})
export class PermissionComponent implements OnInit, OnDestroy {
  // ---------- Store Observables ----------
  roles$!: Observable<Role[]>;
  permissions$!: Observable<Permission[]>;
   private dialog = inject(MatDialog); 

  // ---------- Local States ----------
  private destroy$ = new Subject<void>();
  permissionsList: Permission[] = [];
  roleMap: Record<string, string> = {};

  showForm = false;
  selectedRole: string | null = null;
  initialScreen: string | null = null;
  existingPermissionId: string | null = null;

  // ---------- Permission State ----------
  permissions: Permissions = this.getEmptyPermissions();

  userSubItems: SubItem<keyof UserChildren>[] = [
    { key: 'user', label: 'User' },
    { key: 'role', label: 'Role' },
    { key: 'shift', label: 'Shift' },
    { key: 'customer', label: 'Customer' },
  ];

  companySubItems: SubItem<keyof CompanyChildren>[] = [
    { key: 'companyPreferences', label: 'Company Preferences' },
    { key: 'permission', label: 'Permission' },
  ];

  materialSubItems: SubItem<keyof MaterialChildren>[] = [
    { key: 'rawMaterial', label: 'Raw Material' },
    { key: 'process', label: 'Process' },
  ];

  constructor(private store: Store) {
    this.roles$ = this.store.select(selectAllRoles);
    this.permissions$ = this.store.select(selectAllPermissions);
  }

  // ---------- Lifecycle ----------
  ngOnInit(): void {
    console.log('PermissionComponent initialized');

    this.store.dispatch(RoleActions.loadRoles());
    this.store.dispatch(RoleActions.loadPermissions());

    // Build role map
    this.roles$.pipe(takeUntil(this.destroy$)).subscribe(roles => {
      this.roleMap = roles.reduce((acc, r) => {
        acc[r._id] = r.role;
        return acc;
      }, {} as Record<string, string>);
    });

    // Track all permissions
    this.permissions$.pipe(takeUntil(this.destroy$)).subscribe(permissions => {
      this.permissionsList = permissions;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------- UI Actions ----------
  toggleForm() {
    this.showForm = !this.showForm;
    console.log(`Form toggled -> ${this.showForm ? 'OPEN' : 'CLOSED'}`);
    if (!this.showForm) this.resetPermissions();
  }

  onRoleChange() {
    if (!this.selectedRole) {
      this.resetPermissions();
      return;
    }

    console.log('Role changed:', this.selectedRole);

    this.permissions$.pipe(take(1)).subscribe((all) => {
      const existing = all.find(p => p.role === this.selectedRole);
      if (existing) {
        this.existingPermissionId = existing._id || null;
        this.loadPermissions(existing);
        console.log('Existing permission loaded:', existing);
      } else {
        this.existingPermissionId = null;
        this.permissions = this.getEmptyPermissions();
        console.log('No existing permission found, using empty permissions');
      }
    });
  }

  // ---------- Permission Handling ----------
  private getEmptyPermissions(): Permissions {
    return {
      dashboard: false,
      user: { parent: false, children: { user: false, role: false, shift: false, customer: false } },
      company: { parent: false, children: { companyPreferences: false, permission: false } },
      material: { parent: false, children: { rawMaterial: false, process: false } },
      quotation: false,
      reports: false,
    };
  }

  toggleGroup<K extends keyof Omit<Permissions, 'dashboard' | 'quotation' | 'reports'>>(group: K) {
    const children = this.permissions[group].children as UserChildren | CompanyChildren | MaterialChildren;
    Object.keys(children).forEach(key => {
      (children as any)[key] = this.permissions[group].parent;
    });
    console.log(`Children updated for ${group}:`, children);
  }

  checkParent<K extends keyof Omit<Permissions, 'dashboard' | 'quotation' | 'reports'>>(group: K) {
    const children = this.permissions[group].children as UserChildren | CompanyChildren | MaterialChildren;
    this.permissions[group].parent = Object.values(children).some(Boolean); // Changed from 'every' to 'some'
    console.log(`Checked parent status for ${group}:`, this.permissions[group].parent);
  }

  savePermission() {
    if (!this.selectedRole) {
      alert('Please select a role!');
      return;
    }

    const payload: Permission = {
      role: this.selectedRole,
      initialScreen: this.initialScreen || 'dashboard',
      screens: this.permissions
    };

    console.log('💾 Saving permission payload via NgRx:', payload);

    if (this.existingPermissionId) {
      this.store.dispatch(RoleActions.updatePermission({ id: this.existingPermissionId, permission: payload }));
    } else {
      this.store.dispatch(RoleActions.addPermission({ permission: payload }));
    }

    this.store.dispatch(RoleActions.loadPermissions());
    this.showForm = false;
    this.resetPermissions();
    // alert('Permissions saved successfully!');
  }

  

  deletePermission() {
    if (!this.existingPermissionId) {
     
      return;
    }

    const dialog = this.dialog.open(ConfrimDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this permission?',
      }
    });

    dialog.afterClosed().subscribe(result => {
      if (result === 'confirm') {
       this.store.dispatch(RoleActions.deletePermission({ id: this.existingPermissionId! }));
      }
    });
  }



  loadPermissions(savedData: Permission) {
    this.selectedRole = savedData.role;
    this.initialScreen = savedData.initialScreen || 'dashboard';

    this.permissions = {
      dashboard: !!savedData.screens.dashboard,
      user: { parent: !!savedData.screens.user?.parent, children: { ...savedData.screens.user?.children } },
      company: { parent: !!savedData.screens.company?.parent, children: { ...savedData.screens.company?.children } },
      material: { parent: !!savedData.screens.material?.parent, children: { ...savedData.screens.material?.children } },
      quotation: !!savedData.screens.quotation,
      reports: !!savedData.screens.reports,
    };

    // Ensure parent is set correctly based on children
    this.checkParent('user');
    this.checkParent('company');
    this.checkParent('material');

    console.log('📥 Permissions loaded into form:', this.permissions);
  }

  resetPermissions() {
    console.log('🔁 Resetting permission form');
    this.permissions = this.getEmptyPermissions();
    this.initialScreen = null;
    this.selectedRole = null;
    this.existingPermissionId = null;
  }

  editPermission(p: Permission) {
    this.existingPermissionId = p._id || null;
    this.loadPermissions(p);
    this.showForm = true;
  }

 deletePermissionById(id?: string) {
  if (!id) {
  
    return;
  }

  const dialogRef = this.dialog.open(ConfrimDialogComponent, {
    width: '350px',
    data: {
      title: 'Delete Permission',
      message: 'Are you sure you want to delete this permission?'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      this.store.dispatch(RoleActions.deletePermission({ id }));
      this.store.dispatch(RoleActions.loadPermissions());
    }
  });
}


  getEnabledChildNames(children: UserChildren | CompanyChildren | MaterialChildren | undefined): string {
    if (!children) return '';

    let labels: SubItem<string>[] = [];
    if ('user' in children) {
      labels = this.userSubItems;
    } else if ('companyPreferences' in children) {
      labels = this.companySubItems;
    } else if ('rawMaterial' in children) {
      labels = this.materialSubItems;
    }

    return Object.keys(children)
      .filter(key => children[key as keyof typeof children])
      .map(key => labels.find(item => item.key === key)?.label || key)
      .join(', ');
  }
}