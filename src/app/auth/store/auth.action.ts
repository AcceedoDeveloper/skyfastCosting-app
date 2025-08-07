import { createAction, props } from "@ngrx/store";
import { AuthResponse, User } from "../../model/auth.model";



export const loginUser = createAction(
  '[Login Page] Login User',
  props<{ credentials: { username: string; password: string } }>()
);


export const loginSuccess = createAction(
  '[Auth API] Login Success',
  props<{authResponse : AuthResponse}>()
);

export const loginFailure = createAction(
  '[Auth API] Login Failure',
  props<{ error: any }>()
);

export const logoutUser = createAction(
  '[App Logout] Logout User'
);


export const autoLogout = createAction('[Auth] Auto Logout');
