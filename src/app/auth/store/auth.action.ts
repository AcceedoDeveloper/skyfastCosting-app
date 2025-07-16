import { createAction, props } from "@ngrx/store";
import { AuthResponse, User } from "../../model/auth.model";

export const registerUser = createAction(
  '[Auth page] Register User',
  props<{credentials : {name : string; email : string; password : string}}>()
);

export const registerSuccess = createAction(
   '[Auth API] Register Success',
   props<{user : User}>()
);

export const registerFailure = createAction(
  '[Auth API] Register Failure',
  props<{ error: any }>()
);

export const loginUser = createAction(
  '[login page] login user',
  props<{credentials : {email : string; password : string}}>()
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