// store/role.reducer.ts
import { createReducer, on, State } from '@ngrx/store';
import * as RoleActions from './system.actions';
import { Role, Department, Shift, HostingMail } from '../../../model/role.model';
import { Company } from '../../../model/company.model';

export const systemFeatureKey = 'roles'; 

export interface RoleState {
  roles: Role[];
  department: Department[];
  shift: Shift[];
  hostingMail: any[];
  companies: Company[];
   error: any;
}

export const initialState: RoleState = {
  roles: [],
  department: [],
  shift: [],
  hostingMail: [],
  companies: [],
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

on(RoleActions.updateShiftSuccess, (state, { updateshift }) => ({
  ...state,
  shift: state.shift.map(s => s._id === updateshift._id ? updateshift : s)
})),

on(RoleActions.deleteShiftSuccess, (state, { id }) => ({
  ...state,
  shift: state.shift.filter(shi => shi._id !== id)
})),

on(RoleActions.loadHostingMailSuccess, (state, { hostingMail }) => ({
  ...state,
  hostingMail: Array.isArray(hostingMail) ? hostingMail : [hostingMail], // force into array
  error: null
})),

  on(RoleActions.addHostingMailSuccess, (state, { hostingMail }) => ({
    ...state,
    hostingMail: [...state.hostingMail, hostingMail]
  })),
  on(RoleActions.updateHostingMailSuccess, (state, { updatedHostingMail }) => ({
    ...state,
    hostingMail: state.hostingMail.map(mail =>
      mail._id === updatedHostingMail._id ? updatedHostingMail : mail
    )
  })),
  on(RoleActions.deleteHostingMailSuccess, (state, { id }) => ({
    ...state,
    hostingMail: state.hostingMail.filter(mail => mail._id !== id)
  })),


  on(RoleActions.loadCompanySuccess, (state, { companies }) => ({
    ...state,
    companies,
    error: null
  })),

  on(RoleActions.addCompanySuccess, (state, { company }) => ({
    ...state,
    companies: [...state.companies, company]
  })),

  on(RoleActions.deleteCompanySuccess, (state, { id }) => ({
    ...state,
    companies: state.companies.filter(c => c._id !== id)
  })),

  on(RoleActions.updateCompanySuccess, (state, { updatedCompany }) => ({
    ...state,
    companies: state.companies.map(c =>
      c._id === updatedCompany._id ? updatedCompany : c
    )
  })),




  // Common Error
  on(RoleActions.apiFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
