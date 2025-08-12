import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, filter } from 'rxjs';
import * as AuthActions from './auth/store/auth.action';
import * as AuthSelectors from './auth/store/auth.selector';
import { User } from './model/auth.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Quality_Management';

  private store = inject(Store);
  private router = inject(Router);

  isLoggedIn$: Observable<boolean>;
  user$: Observable<User | null>;

  showHeader = true;
  showDropdown = false;

  constructor() {
    this.isLoggedIn$ = this.store.select(AuthSelectors.selectIsLoggedIn);
    this.user$ = this.store.select(AuthSelectors.selectUser);

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

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    this.store.dispatch(AuthActions.logoutUser());
    this.showDropdown = false;
  }
}
