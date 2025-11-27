import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { Router, RouterOutlet, RouterModule, NavigationEnd, NavigationStart } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, filter, takeUntil, combineLatest, of, take } from 'rxjs';
import * as AuthActions from './auth/store/auth.action';
import * as AuthSelectors from './auth/store/auth.selector';
import * as RoleActions from '../app/master/system-organization/store/system.actions';
import * as RoleSelectors from '../app/master/system-organization/store/system.selectors';
import { User } from './model/auth.model';
import { Permission } from './model/permission.model';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';

interface SidebarItem {
  label: string;
  route: string | null;
  icon: string;
  submenu?: SidebarItem[];
}

interface UserChildren { user: boolean; role: boolean; shift: boolean; customer: boolean; version: boolean; }
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
  imports: [CommonModule, RouterModule, RouterOutlet, LoadingSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  router = inject(Router); // Make public for template access

    title: string = 'Quality_Management';

  isLoggedIn$: Observable<boolean>;
  user$: Observable<User | null>;
  permissions$: Observable<Permission[]>;
  userName: string = '';
  userRole: string = '';
  permissions: Permissions = this.getEmptyPermissions();
  showDropdown: boolean = false;
  activeSubmenu: string | null = null;
  sidebarItems: SidebarItem[] = [];
  private permissionsCache = new Map<string, Permission>();
  private destroy$ = new Subject<void>();
  loading: boolean = true;
  error: string | null = null;
  currentUrl: string = '';
  isLoggedIn: boolean = false;

  constructor() {
    this.isLoggedIn$ = this.store.select(AuthSelectors.selectIsLoggedIn);
    this.user$ = this.store.select(AuthSelectors.selectUser);
    this.permissions$ = this.store.select(RoleSelectors.selectAllPermissions);
  }

  ngOnInit(): void {
    // Set initial URL first - handle both hash and non-hash routing
    // Get URL from window.location.hash first (most reliable for hash routing)
    let hashPath = window.location.hash;
    if (hashPath && hashPath.startsWith('#')) {
      hashPath = hashPath.substring(1); // Remove the #
    }
    const pathFromHash = hashPath.split('?')[0]; // Get path without query params
    
    // Fallback to router.url if hash is not available
    const routerPath = this.router.url.split('?')[0].replace('#', '');
    
    // Use hash path if available, otherwise use router path
    this.currentUrl = pathFromHash || routerPath || '/';
    
    console.log('Initial URL check:', { 
      hash: window.location.hash, 
      pathFromHash, 
      routerUrl: this.router.url,
      routerPath,
      currentUrl: this.currentUrl 
    });
    
    // Check if current route is a public route (login or quotation)
    const isPublicRoute = this.currentUrl === '/login' || 
                         this.currentUrl.startsWith('/quotation') ||
                         pathFromHash === '/quotation' ||
                         pathFromHash?.startsWith('/quotation');
    console.log('Is public route:', isPublicRoute, 'for URL:', this.currentUrl);
    
    // Initial state check from sessionStorage
    const token = sessionStorage.getItem('token');
    let user: User | null = null;
    try {
      const userJson = sessionStorage.getItem('user');
      if (userJson) {
        user = JSON.parse(userJson) as User;
      }
    } catch (e) {
      console.error('Failed to parse user from sessionStorage at', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), e);
      // Only redirect if not on a public route
      if (!isPublicRoute) {
        this.handleUnauthenticatedState();
      } else {
        // Set loading to false so UI can show
        this.loading = false;
      }
      return;
    }

    // Set initial state based on session
    if (token && user) {
      // If on login page with valid token, keep loading true until navigation completes
      if (this.currentUrl === '/login') {
        this.loading = true;
      }
      this.store.dispatch(AuthActions.setUser({ user }));
    } else {
      // Don't dispatch logoutUser if on public route - it will redirect
      // Instead, just ensure unauthenticated state without redirecting
      if (!isPublicRoute) {
        this.store.dispatch(AuthActions.logoutUser()); // This will redirect to login
        this.handleUnauthenticatedState();
      } else {
        // On public route - just clear state but don't dispatch logoutUser (which redirects)
        // Set loading to false so UI can show for public routes
        this.loading = false;
        // Ensure store state is cleared but don't trigger logout effect
        this.store.dispatch(AuthActions.logoutUser()); // This will be handled by effect to not redirect
      }
    }

    // Wait for store to stabilize
    combineLatest([this.isLoggedIn$, this.user$])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([isLoggedIn, user]) => {
          console.log('AppComponent: isLoggedIn=', isLoggedIn, 'user=', user, 'at', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
          if (isLoggedIn && user) {
            this.userName = user.userName || '';
            this.userRole = user.role?.role || '';
            // Load permissions but don't block UI
            this.store.dispatch(RoleActions.loadPermissions());
            this.loadPermissions(user.role?._id || '');
            // Only navigate if not already on a valid route
            const routerUrl = this.router.url.replace('#', '').split('?')[0];
            // Get initialScreen from user object first, then fallback to lastRoute
            const userInitialScreen = user.initialScreen;
            const lastRoute = sessionStorage.getItem('lastRoute') || userInitialScreen;
            // Don't navigate if already on a valid route (including quotation)
            // On initial login (coming from /login), use initialScreen from user or lastRoute
            if (routerUrl === '/' || routerUrl === '' || routerUrl === '/login') {
              // Keep loading true during navigation from login
              this.loading = true;
              // Don't set isLoggedIn to true until navigation completes for initial login
              // This prevents navbar/sidebar from flashing
              const isInitialLogin = routerUrl === '/login';
              if (isInitialLogin) {
                // Delay setting isLoggedIn until after navigation
                this.isLoggedIn = false;
              } else {
                this.isLoggedIn = isLoggedIn || false;
              }
              
              // Determine the route to navigate to
              const targetRoute = userInitialScreen || lastRoute || '/product/dashboard';
              if (isInitialLogin && targetRoute && !targetRoute.includes('/login') && !targetRoute.startsWith('/quotation')) {
                // On initial login, navigate to initialScreen or lastRoute
                this.router.navigate([targetRoute], { replaceUrl: true }).then(() => {
                  // Now set isLoggedIn to true after navigation completes
                  this.isLoggedIn = true;
                  // Set loading to false after navigation completes
                  setTimeout(() => {
                    this.loading = false;
                  }, 100);
                });
              } else if (lastRoute && !lastRoute.includes('/login') && !lastRoute.startsWith('/quotation')) {
                this.router.navigateByUrl(lastRoute).then(() => {
                  if (isInitialLogin) {
                    this.isLoggedIn = true;
                  }
                  setTimeout(() => {
                    this.loading = false;
                  }, 100);
                });
              } else {
                // Fallback to dashboard instead of /system
                this.router.navigate(['/product/dashboard'], { replaceUrl: true }).then(() => {
                  if (isInitialLogin) {
                    this.isLoggedIn = true;
                  }
                  setTimeout(() => {
                    this.loading = false;
                  }, 100);
                });
              }
            } else {
              // Already on a valid route, set isLoggedIn and loading immediately
              this.isLoggedIn = isLoggedIn || false;
              this.loading = false;
            }
          } else {
            this.permissions = this.getEmptyPermissions();
            this.sidebarItems = [];
            // Update currentUrl from router - check both hash and router.url
            let routerUrl = this.router.url.replace('#', '').split('?')[0];
            // Also check window.location.hash as fallback
            if (!routerUrl || routerUrl === '/' || routerUrl === '') {
              const hashPath = window.location.hash;
              if (hashPath && hashPath.startsWith('#')) {
                routerUrl = hashPath.substring(1).split('?')[0];
              }
            }
            this.currentUrl = routerUrl;
            // Don't redirect if user is on login or quotation route (public routes)
            const isPublicRoute = routerUrl === '/login' || routerUrl.startsWith('/quotation');
            if (!isPublicRoute) {
              console.log('Redirecting to login, current route:', routerUrl);
              this.router.navigate(['/login']);
            } else {
              console.log('Skipping redirect, on public route:', routerUrl);
              // Ensure loading is false for public routes
              this.loading = false;
            }
          }
        },
        error: (err) => {
          console.error('Error in combineLatest subscription at', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), err);
          this.loading = false; // Always set loading to false even on error
          this.error = 'An error occurred. Redirecting to login...';
          // Only redirect if not on public route
          const routerUrl = this.router.url.replace('#', '').split('?')[0];
          if (routerUrl !== '/login' && !routerUrl.startsWith('/quotation')) {
            this.handleUnauthenticatedState();
          }
        }
      });

    this.permissions$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (permissions) => {
        if (permissions.length > 0) {
          this.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
            if (user && user.role?._id) {
              this.autoRefreshPermissions(user.role._id, permissions);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error in permissions$ subscription at', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), err);
        // Don't block UI on permission loading error - just log it
        this.loading = false;
        // Only show error if not on public route
        const routerUrl = this.router.url.replace('#', '').split('?')[0];
        if (routerUrl !== '/login' && !routerUrl.startsWith('/quotation')) {
          this.error = 'Failed to load permissions. Please refresh the page.';
          // Don't redirect - let user continue using the app
        }
      }
    });

    // Listen to navigation start to catch early route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationStart) => {
      // Handle both hash and non-hash routing
      let url = event.url;
      if (url.startsWith('#')) {
        url = url.substring(1);
      }
      url = url.split('?')[0];
      const previousUrl = this.currentUrl;
      this.currentUrl = url;
      console.log('Navigation start - currentUrl:', this.currentUrl, 'from event.url:', event.url);
      
      // If navigating away from login page, keep loading true until navigation completes
      if (previousUrl === '/login' && url !== '/login') {
        this.loading = true;
      }
      
      // If navigating to quotation route and not logged in, ensure loading is false
      if (this.currentUrl.startsWith('/quotation')) {
        this.loading = false;
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.showDropdown = false;
      this.activeSubmenu = null;
      // Handle both hash and non-hash routing
      const url = event.urlAfterRedirects.replace('#', '').split('?')[0];
      this.currentUrl = url;
      console.log('Navigation end - currentUrl:', this.currentUrl);
      sessionStorage.setItem('lastRoute', event.urlAfterRedirects);
      
      // If navigating away from login page and user is logged in, set loading to false
      if (url !== '/login' && !url.startsWith('/quotation')) {
        const isLoggedIn = sessionStorage.getItem('token') && sessionStorage.getItem('user');
        if (isLoggedIn) {
          setTimeout(() => {
            this.loading = false;
          }, 50);
        }
      }
    });

    this.store.select(RoleSelectors.selectPermissionError).pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        console.error('Permission loading failed at', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), error);
        this.loading = false; // Always allow UI to show
        // Don't block UI - just set empty permissions and continue
        this.permissions = this.getEmptyPermissions();
        this.sidebarItems = [];
        // Only redirect if not on public route
        const routerUrl = this.router.url.replace('#', '').split('?')[0];
        if (routerUrl !== '/login' && !routerUrl.startsWith('/quotation')) {
          this.error = 'Permission loading failed. Please refresh the page.';
          // Don't redirect - let user continue
        }
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
      user: { parent: false, children: { user: false, role: false, shift: false, customer: false, version: false } },
      company: { parent: false, children: { companyPreferences: false, permission: false } },
      material: { parent: false, children: { rawMaterial: false, process: false } },
      quotation: false,
      reports: false
    };
  }

  private handleUnauthenticatedState(): void {
    this.loading = false;
    this.permissions = this.getEmptyPermissions();
    this.sidebarItems = [];
    // Update currentUrl from router
    const routerUrl = this.router.url.replace('#', '').split('?')[0];
    this.currentUrl = routerUrl;
    // Don't redirect if user is on login or quotation route (public routes)
    if (routerUrl !== '/login' && !routerUrl.startsWith('/quotation')) {
      console.log('handleUnauthenticatedState - Redirecting to login, current route:', routerUrl);
      this.router.navigate(['/login']);
    } else {
      console.log('handleUnauthenticatedState - Skipping redirect, on public route:', routerUrl);
    }
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
      const perm = this.permissionsCache.get(roleId)!;
      // Update permission's initialScreen from user object if available
      this.user$.pipe(take(1), takeUntil(this.destroy$)).subscribe(user => {
        if (user?.initialScreen && perm.initialScreen !== user.initialScreen) {
          perm.initialScreen = user.initialScreen;
        }
        this.applyPermissions(perm);
      });
    } else {
      // Subscribe to permissions but don't block UI - permissions will load asynchronously
      this.permissions$.pipe(takeUntil(this.destroy$)).subscribe(permissions => {
        if (permissions && permissions.length > 0) {
          const perm = permissions.find(p => p.role === roleId);
          if (perm) {
            // Update permission's initialScreen from user object if available
            this.user$.pipe(take(1), takeUntil(this.destroy$)).subscribe(user => {
              if (user?.initialScreen && perm.initialScreen !== user.initialScreen) {
                perm.initialScreen = user.initialScreen;
              }
              this.permissionsCache.set(roleId, perm);
              this.applyPermissions(perm);
            });
          } else {
            // If no permission found, set empty but don't block UI
            this.permissions = this.getEmptyPermissions();
            this.sidebarItems = [];
          }
        }
        // If permissions array is empty, wait for them to load - don't block UI
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
      user: { parent: true, children: { user: true, role: true, shift: true, customer: true, version: true } },
      company: { parent: true, children: { companyPreferences: true, permission: true } },
      material: { parent: true, children: { rawMaterial: true, process: true } },
      quotation: true,
      reports: true
    };
    const lastRoute = sessionStorage.getItem('lastRoute');
    const currentUrl = this.router.url.replace('#', '').split('?')[0];
    const perm: Permission = { screens: this.permissions, initialScreen: '/product/dashboard', role: '' };
    
    // Only navigate if we're on a route that needs redirect (like /system or /login)
    if (currentUrl === '/system' || currentUrl === '/' || currentUrl === '' || currentUrl === '/login' || currentUrl === '/product/dashboard') {
      // During initial login, delay sidebar generation until after navigation
      if (currentUrl === '/login' && this.loading) {
        // Don't generate sidebar yet - wait for navigation
        const targetRoute = lastRoute && !lastRoute.includes('/login') && !lastRoute.startsWith('/quotation') && lastRoute !== '/system' 
          ? lastRoute 
          : '/product/dashboard';
        this.router.navigate([targetRoute], { replaceUrl: true }).then(() => {
          // Generate sidebar after navigation completes
          this.generateSidebar(perm);
        });
      } else {
        // Generate sidebar immediately for non-login routes
        this.generateSidebar(perm);
        if (lastRoute && !lastRoute.includes('/login') && !lastRoute.startsWith('/quotation') && lastRoute !== '/system') {
          this.router.navigateByUrl(lastRoute);
        } else {
          this.router.navigate(['/product/dashboard'], { replaceUrl: true });
        }
      }
    } else {
      // Already on a valid route - generate sidebar immediately
      this.generateSidebar(perm);
    }
  }

  private applyPermissions(perm: Permission) {
    this.permissions = perm.screens;
    const lastRoute = sessionStorage.getItem('lastRoute');
    const currentUrl = this.router.url.replace('#', '').split('?')[0];
    
    // Only navigate if we're on a route that needs redirect (like /system or /login)
    // Don't override if already on a valid route like /product/dashboard
    if (currentUrl === '/system' || currentUrl === '/' || currentUrl === '' || currentUrl === '/login') {
      // During initial login, delay sidebar generation until after navigation
      // This prevents the flash of navbar/sidebar with login form
      if (currentUrl === '/login' && this.loading) {
        // Don't generate sidebar yet - wait for navigation
        const targetRoute = lastRoute && !lastRoute.includes('/login') && !lastRoute.startsWith('/quotation') && lastRoute !== '/system'
          ? lastRoute
          : (perm.initialScreen || '/product/dashboard');
        this.router.navigate([targetRoute], { replaceUrl: true }).then(() => {
          // Generate sidebar after navigation completes
          this.generateSidebar(perm);
        });
      } else {
        // Generate sidebar immediately for non-login routes
        this.generateSidebar(perm);
        if (lastRoute && !lastRoute.includes('/login') && !lastRoute.startsWith('/quotation') && lastRoute !== '/system') {
          this.router.navigateByUrl(lastRoute);
        } else if (perm.initialScreen) {
          this.router.navigate([perm.initialScreen]);
        } else {
          // Fallback to dashboard instead of /system
          this.router.navigate(['/product/dashboard'], { replaceUrl: true });
        }
      }
    } else {
      // Already on a valid route - generate sidebar immediately
      this.generateSidebar(perm);
    }
  }

  generateSidebar(perm: Permission | null) {
    if (!perm) {
      this.sidebarItems = [];
      return;
    }

    const screens = perm.screens;
    const sidebar: SidebarItem[] = [];

    if (screens.dashboard) sidebar.push({ label: 'Dashboard', route: '/product/dashboard', icon: 'dashboard' });

    if (screens.user?.parent || this.anyTrue(screens.user?.children)) {
      sidebar.push({
        label: 'User Management',
        route: null,
        icon: 'group',
        submenu: [
          screens.user.children.user ? { label: 'User', route: '/entity', icon: 'person' } : null,
          screens.user.children.role ? { label: 'Role', route: '/system/roles', icon: 'security' } : null,
          screens.user.children.shift ? { label: 'Shift', route: '/system/shifts', icon: 'people' } : null,
          screens.user.children.customer ? { label: 'Customer', route: '/entity/customers', icon: 'business' } : null,
          screens.user.children.version ? { label: 'Version', route: '/system/user-management-update', icon: 'update' } : null
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

    if (screens.quotation) sidebar.push({ label: 'Quotation Generator', route: '/product/quotation', icon: 'receipt_long' });
    if (screens.reports) sidebar.push({ label: 'Report', route: '/product/report', icon: 'bar_chart' });

    this.sidebarItems = sidebar;
  }

  openDropdown() { this.showDropdown = true; }
  toggleSubmenu(menu: string) { 
    // If clicking on a different menu item, close current and open new one
    // If clicking on the same menu item, toggle it
    this.activeSubmenu = this.activeSubmenu === menu ? null : menu; 
  }

  closeSubmenu() {
    this.activeSubmenu = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-container')) this.showDropdown = false;
    
    // Close submenu if clicking outside sidebar items or submenu
    if (!target.closest('.custom-sidenav')) {
      this.activeSubmenu = null;
    }
  }

  logout() {
    this.store.dispatch(AuthActions.logoutUser());
    this.showDropdown = false;
    sessionStorage.removeItem('lastRoute');
    this.router.navigate(['/login']);
  }

  get shouldShowMainLayout(): boolean {
    // Don't show layout if loading or on login/quotation routes
    // This prevents the flash during initial login navigation
    return !this.loading && this.isLoggedIn && this.currentUrl !== '/login' && !this.currentUrl?.startsWith('/quotation');
  }

  get shouldShowNavbar(): boolean {
    // Don't show navbar if loading or on login/quotation routes
    // This prevents the flash during initial login navigation
    return !this.loading && this.isLoggedIn && this.currentUrl !== '/login' && !this.currentUrl?.startsWith('/quotation');
  }
}