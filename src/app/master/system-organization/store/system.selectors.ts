import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RoleState } from './system.reducer';
import * as fromSytem from './system.reducer';


export const selectRoleState = createFeatureSelector<RoleState>('roles');

export const selectAllRoles = createSelector(
  selectRoleState,
  (state: RoleState | undefined) => state?.roles ?? []
);



export const selectAllDepartmenstate = createSelector(
  selectRoleState,
  (state: RoleState) => state.department

);



export const selectHosting = createSelector(
  selectRoleState,
  (state : RoleState) => state.hostingMail
);


export const selectAllShift = createSelector(
  selectRoleState,
  (state: RoleState) => state.shift
);

export const selectCompany = createSelector(
  selectRoleState,
  (state: RoleState) => state.companies
);

export const selectRoleError = createSelector(selectRoleState, state => state.error);
