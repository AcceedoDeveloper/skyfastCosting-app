
import { createAction, props } from "@ngrx/store";
import { AuthResponse, User } from "../../model/auth.model";

export const loginUser = createAction(
  '[Login Page] Login User',
  props<{ credentials: { userName: string; password: string } }>()
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

// Forgot Password Actions
export const forgotPassword = createAction(
  '[Forgot Password] Forgot Password',
  props<{ email: string }>()
);

export const forgotPasswordSuccess = createAction(
  '[Forgot Password API] Forgot Password Success',
  props<{ message: string }>()
);

export const forgotPasswordFailure = createAction(
  '[Forgot Password API] Forgot Password Failure',
  props<{ error: any }>()
);

export const verifyOtp = createAction(
  '[Verify OTP] Verify OTP',
  props<{ email: string, otp: string }>()
);

export const verifyOtpSuccess = createAction(
  '[Verify OTP API] Verify OTP Success',
  props<{ authResponse: AuthResponse }>()
);

export const verifyOtpFailure = createAction(
  '[Verify OTP API] Verify OTP Failure',
  props<{ error: any }>()
);

export const resetForgotPasswordState = createAction(
  '[Forgot Password] Reset State'
);