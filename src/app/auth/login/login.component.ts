import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { LoadingSpinnerComponent} from '../../shared/loading-spinner/loading-spinner.component';

import * as AuthActions from '../store/auth.action';
import { selectAuthLoading, selectAuthError } from '../store/auth.selector';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,  LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  loginForm!: FormGroup;
  isLoading$!: Observable<boolean>;
  error$!: Observable<string | null>;

ngOnInit(): void {
  this.loginForm = this.fb.group({
    userName: ['', Validators.required],
    password: ['', Validators.required]
  });

  this.error$ = this.store.select(selectAuthError);
  this.isLoading$ = this.store.select(selectAuthLoading);

  const token = sessionStorage.getItem('token');
  const user = sessionStorage.getItem('user');

  if (token && user) {
    this.store.dispatch(AuthActions.loginSuccess({
      authResponse: {
        accessToken: token,
        user: JSON.parse(user)
      }
    }));
  } else {
    this.store.dispatch(AuthActions.logoutUser());
  }
}

  onSubmit(): void {
  if (this.loginForm.invalid) return;

  const { userName, password } = this.loginForm.value;
  console.log('Submitted:', userName, password);
  this.store.dispatch(AuthActions.loginUser({ credentials: { userName, password } }));


}

}
