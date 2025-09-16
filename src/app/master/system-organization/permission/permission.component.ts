import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { Role } from '../../../model/role.model';
import { Permission } from '../../../model/permission.model';
import { selectAllRoles, selectAllPermissions } from '../store/system.selectors';
import * as RoleActions from '../store/system.actions';

interface UserChildren { user: boolean; role: boolean; shift: boolean; customer: boolean; }
interface CompanyChildren { companyPreferences: boolean; permission: boolean; }
interface MaterialChildren { rawMaterial: boolean; process: boolean; }

interface PermissionGroup<T> { parent: boolean; children: T; }

interface Permissions {
  dashboard: boolean;
  user: PermissionGroup<UserChildren>;
  company: PermissionGroup<CompanyChildren>;
  material: PermissionGroup<MaterialChildren>;
  quotation: boolean;
  reports: boolean;
}

interface SubItem<K> { key: K; label: string; }

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})
export class PermissionComponent implements OnInit, OnDestroy {
  roles$!: Observable<Role[]>;
  permissions$!: Observable<Permission[]>;
  destroy$ = new Subject<void>();

  showForm = false;
  selectedRole: string | null = null;
  initialScreen: string | null = null;
  existingPermissionId: string | null = null;

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

  ngOnInit(): void {
    console.log('🟢 PermissionComponent initialized');
    this.store.dispatch(RoleActions.loadRoles());
    this.store.dispatch(RoleActions.loadPermissions());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    console.log(`📝 Form toggled -> ${this.showForm ? 'OPEN' : 'CLOSED'}`);
    if (!this.showForm) this.resetPermissions();
  }

  onRoleChange() {
    if (!this.selectedRole) return this.resetPermissions();

    console.log('🔄 Role changed:', this.selectedRole);

    this.permissions$.pipe(take(1)).subscribe((all) => {
      const res = all.find(p => p.role === this.selectedRole);
      if (res) {
        this.existingPermissionId = res._id || null;
        this.loadPermissions(res);
        console.log('📡 Existing permission loaded from store:', res);
      } else {
        this.existingPermissionId = null;
        this.permissions = this.getEmptyPermissions();
        console.log('ℹ️ No existing permission found, using empty permissions');
      }
    });
  }

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
    const children = this.permissions[group].children as unknown as Record<string, boolean>;
    Object.keys(children).forEach(key => {
      children[key] = this.permissions[group].parent;
    });
    console.log(`↪️ Children updated for ${group}:`, children);
  }

  checkParent<K extends keyof Omit<Permissions, 'dashboard' | 'quotation' | 'reports'>>(group: K) {
    const children = this.permissions[group].children as unknown as Record<string, boolean>;
    this.permissions[group].parent = Object.values(children).every(Boolean);
    console.log(`🔍 Checked parent status for ${group}:`, this.permissions[group].parent);
  }

  get isDirty(): boolean {
    return !!this.selectedRole && this.permissions && this.permissions !== this.getEmptyPermissions();
  }


savePermission() {
  if (!this.selectedRole) return alert('Please select a role!');

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

  // Auto-refresh permissions list from store
  this.store.dispatch(RoleActions.loadPermissions());

  // Auto-close form after saving
  this.showForm = false;
  this.resetPermissions();
  alert('✅ Permissions saved successfully!');
}


deletePermission() {
  if (!this.existingPermissionId) return alert('No permission exists to delete.');

  if (confirm('Are you sure you want to delete this permission?')) {
    this.store.dispatch(RoleActions.deletePermission({ id: this.existingPermissionId }));

    // Auto-refresh permissions list from store
    this.store.dispatch(RoleActions.loadPermissions());

    // Auto-close form after deletion
    this.showForm = false;
    this.resetPermissions();
    alert('🗑️ Permission deleted successfully!');
  }
}




  loadPermissions(savedData: Permission) {
    this.selectedRole = savedData.role;
    this.initialScreen = savedData.initialScreen || 'dashboard';
    const screens = savedData.screens;

    this.permissions = {
      dashboard: !!screens.dashboard,
      user: { parent: !!screens.user?.parent, children: { ...screens.user?.children } },
      company: { parent: !!screens.company?.parent, children: { ...screens.company?.children } },
      material: { parent: !!screens.material?.parent, children: { ...screens.material?.children } },
      quotation: !!screens.quotation,
      reports: !!screens.reports,
    };
    console.log('📥 Permissions loaded into form:', this.permissions);
  }

  resetPermissions() {
    console.log('🔁 Resetting permission form');
    this.permissions = this.getEmptyPermissions();
    this.initialScreen = null;
    this.selectedRole = null;
    this.existingPermissionId = null;
  }
} 