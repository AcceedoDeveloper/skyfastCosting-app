import { Component, OnInit, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  selectOtpVerified
} from '../store/auth.selector';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  loginForm!: FormGroup;
  forgotPasswordForm!: FormGroup;
  otpForm!: FormGroup;

  isLoading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  forgotPasswordLoading$!: Observable<boolean>;
  forgotPasswordError$!: Observable<string | null>;
  forgotPasswordMessage$!: Observable<string | null>;
  otpVerified$!: Observable<boolean>;

  showForgotPassword = false;
  otpSent = false;
  timeLeft = 0;
  private timerSubscription!: Subscription;
  private messageSubscription!: Subscription;


  authMessage: string | null = null;
  authMessageType: 'error' | 'success' | null = null;
  private messageTimer!: any;

  @ViewChild('firstDigit') firstDigit!: ElementRef;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      digit1: ['', Validators.required],
      digit2: ['', Validators.required],
      digit3: ['', Validators.required],
      digit4: ['', Validators.required],
      digit5: ['', Validators.required],
      digit6: ['', Validators.required]
    });

    this.error$ = this.store.select(selectAuthError);
    this.isLoading$ = this.store.select(selectAuthLoading);
    this.forgotPasswordLoading$ = this.store.select(selectForgotPasswordLoading);
    this.forgotPasswordError$ = this.store.select(selectForgotPasswordError);
    this.forgotPasswordMessage$ = this.store.select(selectForgotPasswordMessage);
    this.otpVerified$ = this.store.select(selectOtpVerified);

    this.store.dispatch(AuthActions.resetForgotPasswordState());


    this.messageSubscription = this.forgotPasswordMessage$.subscribe(message => {
      if (message && message.includes('OTP')) {
        this.otpSent = true;
        this.startTimer();
        this.showTempMessage('OTP sent successfully!', 'success');
        setTimeout(() => this.firstDigit?.nativeElement.focus(), 100);
      }
    });

 
    this.error$.subscribe(err => {
      if (err) {
        this.showTempMessage('Enter the correct username or password.', 'error');
      }
    });

    this.forgotPasswordError$.subscribe(err => {
      if (err) {
        this.showTempMessage('Invalid OTP. Please try again.', 'error');
      }
    });
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.timerSubscription?.unsubscribe();
  }

  startTimer(): void {
    this.timeLeft = 180; 
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timerSubscription.unsubscribe();
      }
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  showTempMessage(message: string, type: 'error' | 'success'): void {
    this.authMessage = message;
    this.authMessageType = type;
    if (this.messageTimer) clearTimeout(this.messageTimer);
    this.messageTimer = setTimeout(() => {
      this.authMessage = null;
      this.authMessageType = null;
    }, 3000);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    const { userName, password } = this.loginForm.value;
    this.store.dispatch(AuthActions.loginUser({ credentials: { userName, password } }));
  }

  onForgotPassword(): void {
    this.showForgotPassword = true;
    this.otpSent = false;
    this.timeLeft = 0;
    this.store.dispatch(AuthActions.resetForgotPasswordState());
  }

  onBackToLogin(): void {
    this.showForgotPassword = false;
    this.otpSent = false;
    this.timeLeft = 0;
    this.store.dispatch(AuthActions.resetForgotPasswordState());
  }

  onSendOtp(): void {
    if (this.forgotPasswordForm.invalid) return;
    const email = this.forgotPasswordForm.get('email')?.value;
    this.store.dispatch(AuthActions.forgotPassword({ email }));
  }

  onVerifyOtp(): void {
    if (this.otpForm.invalid || this.timeLeft === 0) return;
    const email = this.forgotPasswordForm.get('email')?.value;
    const otp = Object.values(this.otpForm.value).join('');
    this.store.dispatch(AuthActions.verifyOtp({ email, otp }));
  }

  onResendOtp(): void {
    const email = this.forgotPasswordForm.get('email')?.value;
    if (email) {
      this.otpForm.reset();
      this.store.dispatch(AuthActions.forgotPassword({ email }));
    }
  }

  moveToNext(event: any, nextField: string): void {
    const input = event.target;
    if (input.value.length === input.maxLength) {
      const nextInput = document.querySelector(`[formControlName="${nextField}"]`) as HTMLInputElement;
      nextInput?.focus();
    }
  }

  moveToPrevious(event: any, previousField: string): void {
    if (event.key === 'Backspace' && event.target.value === '') {
      const previousInput = document.querySelector(`[formControlName="${previousField}"]`) as HTMLInputElement;
      previousInput?.focus();
    }
  }
}
