// store/role.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as RoleActions from './system.actions';
import { Role } from '../../../model/role.model';

export const systemFeatureKey = 'roles'; 

export interface RoleState {
  roles: Role[];
  error: any;
}

export const initialState: RoleState = {
  roles: [],
  error: null
};

export const roleReducer = createReducer(
  initialState,

  // Load
  on(RoleActions.loadRolesSuccess, (state, { roles }) => ({
    ...state,
    roles
  })),

  // Add
  on(RoleActions.addRoleSuccess, (state, { role }) => ({
    ...state,
    roles: [...state.roles, role]
  })),

  // Update
  on(RoleActions.updateRoleSuccess, (state, { updatedRole }) => ({
    ...state,
    roles: state.roles.map(r => r._id === updatedRole._id ? updatedRole : r)
  })),

  // Delete
  on(RoleActions.deleteRoleSuccess, (state, { id }) => ({
    ...state,
    roles: state.roles.filter(r => r._id !== id)
  })),

  // Common Error
  on(RoleActions.apiFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
