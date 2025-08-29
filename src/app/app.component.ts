import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, filter } from 'rxjs';
import * as AuthActions from './auth/store/auth.action';
import * as AuthSelectors from './auth/store/auth.selector';
import { User } from './model/auth.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Quality_Management';

  private store = inject(Store);
  private router = inject(Router);

  isLoggedIn$: Observable<boolean>;
  user$: Observable<User | null>;
  userName!: string;
  userRole!: string;

  showHeader = true;
  showDropdown = false;
  activeSubmenu: string | null = null;

  constructor() {
    this.isLoggedIn$ = this.store.select(AuthSelectors.selectIsLoggedIn);
    this.user$ = this.store.select(AuthSelectors.selectUser);

    this.user$.subscribe(user => {
      if (user) {
        console.log('User data:', user);
        this.userName = user.userName;
        this.userRole = user.role?.role;
      }
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showHeader = !event.urlAfterRedirects.includes('/login');
      });
  }

  ngOnInit(): void {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');

    if (!token || !user) {
      this.store.dispatch(AuthActions.logoutUser());
    }
  }

  // Open profile dropdown
  openDropdown() {
    this.showDropdown = true;
  }

  // Toggle submenu based on a unique identifier
  toggleSubmenu(menu: string) {
    this.activeSubmenu = this.activeSubmenu === menu ? null : menu;
  }

  // Close dropdown and submenu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Check if click is outside profile dropdown or button
    const clickedInsideDropdown = target.closest('.profile-container') || target.closest('.profile-dropdown');
    if (!clickedInsideDropdown) {
      this.showDropdown = false;
    }
    // Check if click is outside submenu or its parent
    const clickedInsideSubmenu = target.closest('.submenu') || target.closest('.has-submenu');
    if (!clickedInsideSubmenu) {
      this.activeSubmenu = null;
    }
  }

  logout() {
    this.store.dispatch(AuthActions.logoutUser());
    this.showDropdown = false;
  }
}