import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RoleState } from './system.reducer';
import * as fromSytem from './system.reducer';


export const selectRoleState = createFeatureSelector<RoleState>(fromSytem.systemFeatureKey);

export const selectAllRoles = createSelector(selectRoleState, state => state.roles);
export const selectRoleError = createSelector(selectRoleState, state => state.error);
