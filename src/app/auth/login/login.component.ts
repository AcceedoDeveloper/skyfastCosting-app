import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription, interval } from 'rxjs';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

import * as AuthActions from '../store/auth.action';
import {
  selectAuthLoading,
  selectAuthError,
  selectForgotPasswordLoading,
  selectForgotPasswordError,
  selectForgotPasswordMessage,
  selectOtpSent,
  selectForgotPasswordEmail,
} from '../store/auth.selector';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  loginForm!: FormGroup;
  forgotPasswordForm!: FormGroup;
  isLoading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  forgotPasswordLoading$!: Observable<boolean>;
  forgotPasswordError$!: Observable<string | null>;
  forgotPasswordMessage$!: Observable<string | null>;
  otpSent$!: Observable<boolean>;
  email$!: Observable<string | null>;

  showForgotPassword = false;
  showOtpForm = false;
  otpTimer = 0;
  private timerSubscription!: Subscription;
  private emailValue: string = '';


  otpDigits = Array(6).fill(0); 
  otpValues: string[] = Array(6).fill('');

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.error$ = this.store.select(selectAuthError);
    this.isLoading$ = this.store.select(selectAuthLoading);
    this.forgotPasswordLoading$ = this.store.select(selectForgotPasswordLoading);
    this.forgotPasswordError$ = this.store.select(selectForgotPasswordError);
    this.forgotPasswordMessage$ = this.store.select(selectForgotPasswordMessage);
    this.otpSent$ = this.store.select(selectOtpSent);
    this.email$ = this.store.select(selectForgotPasswordEmail);

 
    this.email$.subscribe((email) => {
      if (email) {
        this.emailValue = email;
      }
    });

 
    this.otpSent$.subscribe((otpSent) => {
      this.showOtpForm = otpSent;
      if (otpSent) {
        this.startOtpTimer();
      }
    });

    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');

    if (token && user) {
      this.store.dispatch(
        AuthActions.loginSuccess({
          authResponse: {
            accessToken: token,
            user: JSON.parse(user),
          },
        })
      );
    } else {
      this.store.dispatch(AuthActions.logoutUser());
    }
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { userName, password } = this.loginForm.value;
    this.store.dispatch(AuthActions.loginUser({ credentials: { userName, password } }));
  }

  onForgotPassword(): void {
    this.showForgotPassword = true;
    this.store.dispatch(AuthActions.resetForgotPasswordState());
  }

  onBackToLogin(): void {
    this.showForgotPassword = false;
    this.showOtpForm = false;
    this.resetOtpTimer();
    this.store.dispatch(AuthActions.resetForgotPasswordState());
  }

  onSendOtp(): void {
    if (this.forgotPasswordForm.invalid) return;

    const email = this.forgotPasswordForm.value.email;
    this.store.dispatch(AuthActions.forgotPassword({ email }));
  }

  onVerifyOtp(): void {
    const otp = this.otpValues.join('');
    if (otp.length === this.otpDigits.length && this.otpTimer > 0) {
      this.store.dispatch(AuthActions.verifyOtp({ email: this.emailValue, otp }));
    }
  }

  resendOtp(): void {
    this.store.dispatch(AuthActions.forgotPassword({ email: this.emailValue }));
    this.otpValues = Array(6).fill('');
    this.startOtpTimer();
  }


  onOtpInput(event: any, index: number): void {
    const input = event.target as HTMLInputElement;
    if (/^[0-9]$/.test(input.value)) {
      this.otpValues[index] = input.value;
      if (index < this.otpDigits.length - 1) {
        const next = document.querySelectorAll<HTMLInputElement>('.otp-input')[index + 1];
        next.focus();
      }
    } else {
      input.value = '';
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = document.querySelectorAll<HTMLInputElement>('.otp-input')[index - 1];
      prev.focus();
    }
  }

  private startOtpTimer(): void {
    this.otpTimer = 180; 
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.otpTimer > 0) {
        this.otpTimer--;
      } else {
        this.timerSubscription.unsubscribe();
      }
    });
  }

  private resetOtpTimer(): void {
    this.otpTimer = 0;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
}
