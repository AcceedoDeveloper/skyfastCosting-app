import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from './auth/store/auth.action';
import * as AuthSelectors from './auth/store/auth.selector';
import { User } from './model/auth.model';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'Quality_Management';

  private store = inject(Store);
 // private router = inject(Router);

  isLoggedIn$ : Observable<boolean>;
  user$ : Observable<User | null>;

  constructor(){
    this.isLoggedIn$ = this.store.select(AuthSelectors.selectIsLoggedIn);
    this.user$ = this.store.select(AuthSelectors.selectUser);
  }


  ngOnInit(): void {

     this.user$.subscribe(user => {
      if (user) {
        console.log('✅ Logged in user:', user);
      }
    });

  }

  logout(){
    this.store.dispatch(AuthActions.logoutUser());
  }



}
