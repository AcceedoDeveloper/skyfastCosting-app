import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RoleState } from './system.reducer';
import * as fromSytem from './system.reducer';


export const selectRoleState = createFeatureSelector<RoleState>('roles');

export const selectAllRoles = createSelector(
  selectRoleState,
  (state: RoleState) => {
    console.log('Selector: current roles:', state.roles);
    return state.roles;
  }
);export const selectRoleError = createSelector(selectRoleState, state => state.error);
