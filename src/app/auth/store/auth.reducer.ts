import { createReducer, on } from "@ngrx/store";
import { AuthState } from "../../model/auth.model";
import * as AuthActions from './auth.action';

export const authFeatureKey = 'auth';

export const initialState: AuthState = {
  user: null,
  token: null,
  isLoggedIn: false,
  isLoading: false,
  error: null
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

  on(AuthActions.logoutUser, () => ({
    ...initialState
  }))
);
