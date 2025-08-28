
import { createReducer, on } from "@ngrx/store";
import * as AuthActions from './auth.action';
import { User } from "../../model/auth.model";

export const authFeatureKey = 'auth';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: any;
  forgotPassword: {
    isLoading: boolean;
    error: any;
    message: string | null;
    email: string | null;
    otpSent: boolean;
    otpVerified: boolean;
  };
}

export const initialState: AuthState = {
  user: null,
  token: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,
  forgotPassword: {
    isLoading: false,
    error: null,
    message: null,
    email: null,
    otpSent: false,
    otpVerified: false
  }
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.loginUser, state => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { authResponse }) => ({
    ...state,
    user: authResponse.user,
    token: authResponse.accessToken,
    isLoading: false,
    isLoggedIn: true,
    error: null
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    user: null,
    token: null,
    isLoggedIn: false,
    isLoading: false,
    error: error.message || 'Login failed'
  })),

  on(AuthActions.autoLogout, (state) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    error: null,
  })),

  on(AuthActions.logoutUser, () => ({
    ...initialState
  })),

 
  on(AuthActions.forgotPassword, (state, { email }) => ({
    ...state,
    forgotPassword: {
      ...state.forgotPassword,
      isLoading: true,
      error: null,
      email,
      message: null
    }
  })),

  on(AuthActions.forgotPasswordSuccess, (state, { message }) => ({
    ...state,
    forgotPassword: {
      ...state.forgotPassword,
      isLoading: false,
      message,
      otpSent: true,
      error: null
    }
  })),

  on(AuthActions.forgotPasswordFailure, (state, { error }) => ({
    ...state,
    forgotPassword: {
      ...state.forgotPassword,
      isLoading: false,
      error: error.message || 'Failed to send OTP',
      message: null
    }
  })),

  on(AuthActions.verifyOtp, (state) => ({
    ...state,
    forgotPassword: {
      ...state.forgotPassword,
      isLoading: true,
      error: null
    }
  })),

  on(AuthActions.verifyOtpSuccess, (state, { authResponse }) => ({
    ...state,
    user: authResponse.user,
    token: authResponse.accessToken,
    isLoggedIn: true,
    isLoading: false,
    error: null,
    forgotPassword: {
      ...initialState.forgotPassword
    }
  })),

  on(AuthActions.verifyOtpFailure, (state, { error }) => ({
    ...state,
    forgotPassword: {
      ...state.forgotPassword,
      isLoading: false,
      error: error.message || 'Invalid OTP',
      message: null
    }
  })),

  on(AuthActions.resetForgotPasswordState, (state) => ({
    ...state,
    forgotPassword: {
      ...initialState.forgotPassword
    }
  }))
);