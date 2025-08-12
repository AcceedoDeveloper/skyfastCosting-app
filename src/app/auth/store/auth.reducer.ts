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
}


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

    on(AuthActions.autoLogout, (state) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    error: null,
  })),

  on(AuthActions.logoutUser, () => ({
    ...initialState
  }))
);
