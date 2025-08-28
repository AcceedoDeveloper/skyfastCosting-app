
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AuthState } from "../../model/auth.model";
import { authFeatureKey } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>(authFeatureKey);

export const selectUser = createSelector(
  selectAuthState,
  state => state.user
);

export const selectToken = createSelector(
  selectAuthState,
  state => state.token
);

export const selectIsLoggedIn = createSelector(
  selectAuthState,
  state => state.isLoggedIn
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  state => state.isLoading
);

export const selectAuthError = createSelector(
  selectAuthState,
  state => state.error
);

export const selectUserId = createSelector(
  selectUser,
  user => user?._id ?? null
);


export const selectForgotPasswordState = createSelector(
  selectAuthState,
  state => state.forgotPassword
);

export const selectForgotPasswordLoading = createSelector(
  selectForgotPasswordState,
  state => state.isLoading
);

export const selectForgotPasswordError = createSelector(
  selectForgotPasswordState,
  state => state.error
);

export const selectForgotPasswordMessage = createSelector(
  selectForgotPasswordState,
  state => state.message
);

export const selectForgotPasswordEmail = createSelector(
  selectForgotPasswordState,
  state => state.email
);

export const selectOtpSent = createSelector(
  selectForgotPasswordState,
  state => state.otpSent
);

export const selectOtpVerified = createSelector(
  selectForgotPasswordState,
  state => state.otpVerified
);