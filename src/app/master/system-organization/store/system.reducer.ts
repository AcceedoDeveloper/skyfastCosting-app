// store/role.reducer.ts
import { createReducer, on, State } from '@ngrx/store';
import * as RoleActions from './system.actions';
import { Role, Department } from '../../../model/role.model';

export const systemFeatureKey = 'roles'; 

export interface RoleState {
  roles: Role[];
  department: Department[];
   error: any;
}

export const initialState: RoleState = {
  roles: [],
  department: [],
  error: null
};

export const roleReducer = createReducer(
  initialState,

  // Load
on(RoleActions.loadRolesSuccess, (state, { roles }) => ({
      ...state,
      roles,
      error: null
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


  on(RoleActions.loadDepartmentSuccess, (state, { department }) => ({
      ...state,
      department,
      error: null
    })),


  // Common Error
  on(RoleActions.apiFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
