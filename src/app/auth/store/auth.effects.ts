import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AuthService } from "../../services/auth.services";
import { Router } from "@angular/router";
import { Store } from '@ngrx/store';
import * as fromAuth from '../store/auth.action';
import { catchError, exhaustMap, map, of, tap } from "rxjs";

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private store = inject(Store);

  loginUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuth.loginUser),
      exhaustMap(action =>
        this.authService.login(action.credentials).pipe(
          map(authResponse => fromAuth.loginSuccess({ authResponse })),
          catchError(error => of(fromAuth.loginFailure({ error })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuth.loginSuccess),
      tap(({ authResponse }) => {
        sessionStorage.setItem('token', authResponse.accessToken);
        sessionStorage.setItem('user', JSON.stringify(authResponse.user));
        this.store.dispatch(fromAuth.setUser({ user: authResponse.user }));
        this.router.navigate(['/product/dashboard'], { replaceUrl: true });
      })
    ),
    { dispatch: false }
  );

  logoutUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuth.logoutUser),
      tap(() => {
        sessionStorage.clear();
        this.router.navigate(['/login'], { replaceUrl: true });
      })
    ),
    { dispatch: false }
  );

  autoLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromAuth.autoLogout),
        tap(() => {
          this.authService.logout();
        })
      ),
    { dispatch: false }
  );

  forgotPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuth.forgotPassword),
      exhaustMap(action =>
        this.authService.forgotPassword(action.email).pipe(
          map(response => fromAuth.forgotPasswordSuccess({ message: response.message })),
          catchError(error => of(fromAuth.forgotPasswordFailure({ error })))
        )
      )
    )
  );

  verifyOtp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuth.verifyOtp),
      exhaustMap(action =>
        this.authService.verifyOtp(action.email, action.otp).pipe(
          map(authResponse => fromAuth.verifyOtpSuccess({ authResponse })),
          catchError(error => of(fromAuth.verifyOtpFailure({ error })))
        )
      )
    )
  );

  verifyOtpSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuth.verifyOtpSuccess),
      tap(({ authResponse }) => {
        sessionStorage.setItem('token', authResponse.accessToken);
        sessionStorage.setItem('user', JSON.stringify(authResponse.user));
        this.store.dispatch(fromAuth.setUser({ user: authResponse.user })); // Added for consistency
        this.router.navigate(['/system'], { replaceUrl: true });
      })
    ),
    { dispatch: false }
  );
}