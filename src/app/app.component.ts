import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, filter, takeUntil, combineLatest } from 'rxjs';
import * as AuthActions from './auth/store/auth.action';
import * as AuthSelectors from './auth/store/auth.selector';
import * as RoleActions from '../app/master/system-organization/store/system.actions';
import * as RoleSelectors from '../app/master/system-organization/store/system.selectors';
import { User } from './model/auth.model';
import { Permission } from './model/permission.model';

interface SidebarItem {
  label: string;
  route: string | null;
  icon: string;
  submenu?: SidebarItem[];
}

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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);

  isLoggedIn$: Observable<boolean>;
  user$: Observable<User | null>;
  permissions$: Observable<Permission[]>;
  userName: string = '';
  userRole: string = '';
  permissions: Permissions = this.getEmptyPermissions();
  showHeader: boolean = true;
  showDropdown: boolean = false;
  activeSubmenu: string | null = null;
  sidebarItems: SidebarItem[] = [];
  private permissionsCache = new Map<string, Permission>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.isLoggedIn$ = this.store.select(AuthSelectors.selectIsLoggedIn);
    this.user$ = this.store.select(AuthSelectors.selectUser);
    this.permissions$ = this.store.select(RoleSelectors.selectAllPermissions);
  }

  ngOnInit(): void {
    const lastRoute = sessionStorage.getItem('lastRoute') || this.router.url;

    combineLatest([this.isLoggedIn$, this.user$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([isLoggedIn, user]) => {
        if (isLoggedIn && user) {
          this.userName = user.userName;
          this.userRole = user.role?.role || '';
          this.store.dispatch(RoleActions.loadPermissions());
          this.loadPermissions(user.role?._id || '');
          if (lastRoute && !lastRoute.includes('/login')) {
            this.router.navigateByUrl(lastRoute);
          }
        } else {
          this.permissions = this.getEmptyPermissions();
          this.sidebarItems = [];
          this.router.navigate(['/login']);
        }
      });

    this.permissions$.pipe(takeUntil(this.destroy$)).subscribe(permissions => {
      if (permissions.length > 0) {
        this.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
          if (user && user.role?._id) {
            this.autoRefreshPermissions(user.role._id, permissions);
          }
        });
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.showHeader = !event.urlAfterRedirects.includes('/login');
      sessionStorage.setItem('lastRoute', event.urlAfterRedirects);
    });

    this.store.select(RoleSelectors.selectPermissionError).pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        console.error('Permission loading failed:', error);
        this.permissions = this.getEmptyPermissions();
        this.sidebarItems = [];
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getEmptyPermissions(): Permissions {
    return {
      dashboard: false,
      user: { parent: false, children: { user: false, role: false, shift: false, customer: false } },
      company: { parent: false, children: { companyPreferences: false, permission: false } },
      material: { parent: false, children: { rawMaterial: false, process: false } },
      quotation: false,
      reports: false
    };
  }

  anyTrue(children: any): boolean {
    return Object.values(children).some(value => value === true);
  }

  private loadPermissions(roleId: string) {
    if (!roleId) {
      this.permissions = this.getEmptyPermissions();
      this.sidebarItems = [];
      return;
    }

    if (this.userRole?.toLowerCase() === 'admin') {
      this.setFullAdminPermissions();
      return;
    }

    if (this.permissionsCache.has(roleId)) {
      this.applyPermissions(this.permissionsCache.get(roleId)!);
    } else {
      this.permissions$.pipe(takeUntil(this.destroy$)).subscribe(permissions => {
        const perm = permissions.find(p => p.role === roleId);
        if (perm) {
          this.permissionsCache.set(roleId, perm);
          this.applyPermissions(perm);
        } else {
          this.permissions = this.getEmptyPermissions();
          this.sidebarItems = [];
        }
      });
    }
  }

  private autoRefreshPermissions(roleId: string, permissions: Permission[]) {
    const updatedPerm = permissions.find(p => p.role === roleId);
    if (updatedPerm) {
      this.permissionsCache.set(roleId, updatedPerm);
      this.applyPermissions(updatedPerm);
    }
  }

  private setFullAdminPermissions() {
    this.permissions = {
      dashboard: true,
      user: { parent: true, children: { user: true, role: true, shift: true, customer: true } },
      company: { parent: true, children: { companyPreferences: true, permission: true } },
      material: { parent: true, children: { rawMaterial: true, process: true } },
      quotation: true,
      reports: true
    };
    const lastRoute = sessionStorage.getItem('lastRoute') || '/dashboard/dashh';
    this.generateSidebar({ screens: this.permissions, initialScreen: lastRoute } as Permission);
    if (!lastRoute.includes('/login')) {
      this.router.navigateByUrl(lastRoute);
    } else {
      this.router.navigate(['/dashboard/dashh']);
    }
  }

  private applyPermissions(perm: Permission) {
    this.permissions = perm.screens;
    this.generateSidebar(perm);
    const lastRoute = sessionStorage.getItem('lastRoute') || perm.initialScreen;
    if (lastRoute && !lastRoute.includes('/login')) {
      this.router.navigateByUrl(lastRoute);
    } else if (perm.initialScreen) {
      this.router.navigate([perm.initialScreen]);
    }
  }

  generateSidebar(perm: Permission | null) {
    if (!perm) {
      this.sidebarItems = [];
      return;
    }

    const screens = perm.screens;
    const sidebar: SidebarItem[] = [];

    if (screens.dashboard) sidebar.push({ label: 'Dashboard', route: '/dashboard/dashh', icon: 'dashboard' });

    if (screens.user?.parent || this.anyTrue(screens.user?.children)) {
      sidebar.push({
        label: 'User Management',
        route: null,
        icon: 'group',
        submenu: [
          screens.user.children.user ? { label: 'User', route: '/entity', icon: 'person' } : null,
          screens.user.children.role ? { label: 'Role', route: '/system/roles', icon: 'security' } : null,
          screens.user.children.shift ? { label: 'Shift', route: '/system/shifts', icon: 'people' } : null,
          screens.user.children.customer ? { label: 'Customer', route: '/entity/customers', icon: 'business' } : null
        ].filter(Boolean) as SidebarItem[]
      });
    }

    if (screens.company?.parent || this.anyTrue(screens.company?.children)) {
      sidebar.push({
        label: 'Company Management',
        route: null,
        icon: 'apartment',
        submenu: [
          screens.company.children.companyPreferences ? { label: 'Company Preferences', route: '/system/companypreferences', icon: 'settings' } : null,
          screens.company.children.permission ? { label: 'Permission', route: '/system/permissions', icon: 'admin_panel_settings' } : null
        ].filter(Boolean) as SidebarItem[]
      });
    }

    if (screens.material?.parent || this.anyTrue(screens.material?.children)) {
      sidebar.push({
        label: 'Material & Process Management',
        route: null,
        icon: 'inventory_2',
        submenu: [
          screens.material.children.rawMaterial ? { label: 'Raw Material', route: '/product/raw-materials', icon: 'list_alt' } : null,
          screens.material.children.process ? { label: 'Process', route: '/product', icon: 'category' } : null
        ].filter(Boolean) as SidebarItem[]
      });
    }

    if (screens.quotation) sidebar.push({ label: 'Quotation Generator', route: '/product/quatation', icon: 'receipt_long' });
    if (screens.reports) sidebar.push({ label: 'Reports', route: '/dashboard/report', icon: 'bar_chart' });

    this.sidebarItems = sidebar;
  }

  openDropdown() { this.showDropdown = true; }
  toggleSubmenu(menu: string) { this.activeSubmenu = this.activeSubmenu === menu ? null : menu; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-container') && !target.closest('.profile-dropdown')) this.showDropdown = false;
    if (!target.closest('.submenu') && !target.closest('.has-submenu')) this.activeSubmenu = null;
  }

  logout() {
    this.store.dispatch(AuthActions.logoutUser());
    this.showDropdown = false;
    sessionStorage.removeItem('lastRoute');
    this.router.navigate(['/login']);
  }
}