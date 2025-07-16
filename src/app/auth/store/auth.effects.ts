import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AuthService } from "../../services/auth.services";
import { Router } from "@angular/router";
import * as fromAuth from '../store/auth.action';
import { catchError, exhaustMap, map, of, tap } from "rxjs";

@Injectable()
export class AuthEffects {

  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);


  //registerUser
  registerUser$ = createEffect(() =>
  this.actions$.pipe(
    ofType(fromAuth.registerUser),
    exhaustMap(action =>
      this.authService.register(action.credentials).pipe(
        map(user => fromAuth.registerSuccess({user})),
        catchError(error => of(fromAuth.registerFailure({error})))
      )
    )
  )
);
  //sucess
  registerSuccess$ = createEffect(() =>
  this.actions$.pipe(
    ofType(fromAuth.registerSuccess),
    tap(() => {
      //
      alert('Registration successfull! Please LOGIN');
      this.router.navigate(['/login']);
    })
  ),{dispatch : false}

)
  //loginUser
  loginUser$ = createEffect(() =>
  this.actions$.pipe(
    ofType(fromAuth.loginUser),
    exhaustMap(action =>
      this.authService.login(action.credentials).pipe(
        map(authResponse => fromAuth.loginSuccess({authResponse})),
        catchError(error => of(fromAuth.loginFailure({error})))
      )
    )
  )
);
  //loginsuccess
  loginSuccess$ = createEffect(() =>
  this.actions$.pipe(
    ofType(fromAuth.loginSuccess),
    tap(() => {
      //
      this.router.navigate(['/todos']);
    })
  ),{dispatch : false}

);

logoutUser$ = createEffect(() =>
this.actions$.pipe(
  ofType(fromAuth.logoutUser),
  tap(() =>
    this.router.navigate(['/login'])
  )
), {dispatch : false}

);

}