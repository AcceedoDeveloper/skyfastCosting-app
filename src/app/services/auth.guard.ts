import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { selectIsLoggedIn } from "../auth/store/auth.selector";
import { map, take } from "rxjs";

export const authGuard : CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsLoggedIn).pipe(
    take(1),
    map(isLoggedIn => {
      if(isLoggedIn){
        return true;
      }else{
        router.navigate(['/login'])
        return false
      }
    })
  )
}