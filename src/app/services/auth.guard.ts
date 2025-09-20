import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { selectIsLoggedIn, selectUser } from "../auth/store/auth.selector";
import { combineLatest } from "rxjs";
import { map, take } from "rxjs/operators";

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return combineLatest([
    store.select(selectIsLoggedIn),
    store.select(selectUser)
  ]).pipe(
    take(1),
    map(([isLoggedIn, user]) => {
      if (isLoggedIn && user && sessionStorage.getItem('token')) {
        return true;
      }
      router.navigate(['/login'], { replaceUrl: true });
      return false;
    })
  );
};