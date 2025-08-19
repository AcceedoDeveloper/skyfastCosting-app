// store/role.reducer.ts
import { createReducer, on, State } from '@ngrx/store';
import * as RoleActions from './system.actions';
import { Role, Department, Shift } from '../../../model/role.model';

export const systemFeatureKey = 'roles'; 

export interface RoleState {
  roles: Role[];
  department: Department[];
  shift: Shift[];
   error: any;
}

export const initialState: RoleState = {
  roles: [],
  department: [],
  shift: [],
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



    on(RoleActions.addDepartmentSuccess, (state, { department }) => ({
  ...state,
  department: [...state.department, department]
})),

on(RoleActions.deleteDepartmentSuccess, (state, { id }) => ({
  ...state,
  department: state.department.filter(dep => dep._id !== id)
})),

on(RoleActions.updateDepartmentSuccess, (state, { updatedDepartment }) => ({
  ...state,
  department: state.department.map(dep =>
    dep._id === updatedDepartment._id ? updatedDepartment : dep
  )
})),


on(RoleActions.loadShiftSuccess, (state, { shift }) => ({
      ...state,
      shift,
      error: null
    })),
       on(RoleActions.addShiftSuccess, (state, { shift }) => ({
  ...state,
  shift: [...state.shift, shift]
})),

on(RoleActions.updateShiftSuccess, (state, { shift }) => ({
  ...state,
  shifts: state.shift.map(s => s._id === shift._id ? shift : s)
})),

on(RoleActions.deleteShiftSuccess, (state, { id }) => ({
  ...state,
  shift: state.shift.filter(shi => shi._id !== id)
})),




  // Common Error
  on(RoleActions.apiFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
