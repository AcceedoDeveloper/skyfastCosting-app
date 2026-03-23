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
        const user = authResponse.user;
        sessionStorage.setItem('token', authResponse.accessToken);
        sessionStorage.setItem('user', JSON.stringify(authResponse.user));
        // Use initialScreen from user object, fallback to dashboard
        const initialScreen = user.initialScreen || '/product/dashboard';
        sessionStorage.setItem('lastRoute', initialScreen);
        this.store.dispatch(fromAuth.setUser({ user: authResponse.user }));
        // Navigate to the initialScreen from user object
        this.router.navigate([initialScreen], { replaceUrl: true });
      })
    ),
    { dispatch: false }
  );

  logoutUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromAuth.logoutUser),
      tap(() => {
        sessionStorage.clear();
        // Check if we're on a public route before redirecting
        // Check window.location.hash first (for hash routing)
        let hashPath = window.location.hash;
        if (hashPath && hashPath.startsWith('#')) {
          hashPath = hashPath.substring(1);
        }
        const pathFromHash = hashPath.split('?')[0];
        const pathFromLocation = typeof window !== 'undefined'
          ? window.location.pathname?.split('?')[0] || ''
          : '';
        const routerPath = this.router.url.replace('#', '').split('?')[0];
        const currentUrl = pathFromHash || pathFromLocation || routerPath;
        
        const isPublicRoute = currentUrl === '/login' || 
                              currentUrl.startsWith('/quotation') || 
                              currentUrl.startsWith('/report-full-view');
        
        // Only redirect to login if not on a public route
        if (!isPublicRoute) {
          this.router.navigate(['/login'], { replaceUrl: true });
        }
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
        // const user = authResponse.user;
        // sessionStorage.setItem('token', authResponse.accessToken);
        // sessionStorage.setItem('user', JSON.stringify(authResponse.user));
        // // Use initialScreen from user object, fallback to dashboard
        // const initialScreen = user.initialScreen || '/product/dashboard';
        // sessionStorage.setItem('lastRoute', initialScreen);
        // this.store.dispatch(fromAuth.setUser({ user: authResponse.user })); // Added for consistency
        // // Navigate to the initialScreen from user object
        // this.router.navigate([initialScreen], { replaceUrl: true });
      })
    ),
    { dispatch: false }
  );
}