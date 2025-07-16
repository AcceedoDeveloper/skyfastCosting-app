import { createReducer, on } from "@ngrx/store";
import { AuthState } from "../../model/auth.model";
import * as AuthActions from '../store/auth.action';

export const authFeatureKey = 'auth';

export const initiaState : AuthState = {
  user : null,
  token : null,
  isLoggedIn : false,
  isLoading : false,
  error : null
};

export const authReducer = createReducer(
  initiaState,

  on(AuthActions.registerUser, (state) => ({
    ...state,
    isLoading : true,
    error : null,
  })),

    on(AuthActions.registerSuccess, (state, {user}) => ({
    ...state,
    isLoading : false,
    error : null,
  })),

    on(AuthActions.registerFailure, (state, {error}) => ({
    ...state,
    isLoading : false,
    error : error.message || 'Registration failed',
  })),

    on(AuthActions.loginUser, (state) => ({
    ...state,
    isLoading : true,
    error : null,
  })),


    on(AuthActions.loginSuccess, (state, {authResponse}) => ({
    ...state,
    user : authResponse.user,
    isLoading : false,
    isLoggedIn : true,
    token : authResponse.accessToken,
    error : null,
  })),

      on(AuthActions.loginFailure, (state, {error}) => ({
    ...state,
    user : null,
    isLoading : false,
    isLoggedIn : false,
    token : null,
    error : error.message || 'Registration failed',
  })),

on(AuthActions.logoutUser, () => ({
  ...initiaState
}))

)