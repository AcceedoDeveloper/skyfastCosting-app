// store/role.actions.ts
import { createAction, props } from '@ngrx/store';
import { Role, Department, Shift, HostingMail } from '../../../model/role.model';
import { Company } from '../../../model/company.model';


// Load
export const loadRoles = createAction('[Role] Load Roles');
export const loadRolesSuccess = createAction('[Role] Load Roles Success', props<{ roles: Role[] }>());

// Add
export const addRole = createAction('[Role] Add Role', props<{ role: Role }>());
export const addRoleSuccess = createAction('[Role] Add Role Success', props<{ role: Role }>());

// Update
export const updateRole = createAction('[Role] Update Role', props<{ id: string, role: Role }>());
export const updateRoleSuccess = createAction('[Role] Update Role Success', props<{ updatedRole: Role }>());

// Delete
export const deleteRole = createAction('[Role] Delete Role', props<{ id: string }>());
export const deleteRoleSuccess = createAction('[Role] Delete Role Success', props<{ id: string }>());

// Common Failure
export const apiFailure = createAction('[Role API] Failure', props<{ error: any }>());


export const loadDepartment = createAction('[Department] Load Department');
export const loadDepartmentSuccess = createAction('[Department] Load Department Success', props<{ department: Department[] }>());



export const addDepartment = createAction(
  '[Department] Add Department',
  props<{ department: Department }>()
);

export const addDepartmentSuccess = createAction(
  '[Department] Add Department Success',
  props<{ department: Department }>()
);


export const deleteDepartment = createAction(
  '[Department] Delete Department',
  props<{ id: string }>()
);

export const deleteDepartmentSuccess = createAction(
  '[Department] Delete Department Success',
  props<{ id: string }>()
);

export const updateDepartment = createAction(
  '[Department] Update Department',
  props<{ id: string; department: Department }>()
);

export const updateDepartmentSuccess = createAction(
  '[Department] Update Department Success',
  props<{ updatedDepartment: Department }>()
);

export const loadshift = createAction('[shift] Load shift');
export const loadShiftSuccess = createAction('[shift] Load shift Success', props<{ shift: Shift[] }>());



export const addShift = createAction(
  '[Shift] Add Shift',
  props<{ shift: Shift }>()
);

export const addShiftSuccess = createAction(
  '[Shift] Add Shift Success',
  props<{ shift: Shift }>()
);

export const updateShift = createAction(
  '[Shift] Update Shift',
  props<{ id: string; shift: Shift }>()
);

export const updateShiftSuccess = createAction(
  '[Shift] Update Shift Success',
  props<{ updateshift: Shift }>()
);


export const deleteShift = createAction(
  '[shift] Delete shift',
  props<{ id: string }>()
);

export const deleteShiftSuccess = createAction(
  '[Shift] Delete Shift Success',
  props<{ id: string }>()
);



export const loadHostingMail = createAction('[HostingMail] Load HostingMail');
export const loadHostingMailSuccess = createAction(
  '[HostingMail] Load HostingMail Success',
  props<{ hostingMail: HostingMail[] }>()
);

export const addHostingMail = createAction(
  '[HostingMail] Add HostingMail',
  props<{ hostingMail: HostingMail }>()
);

export const addHostingMailSuccess = createAction(
  '[HostingMail] Add HostingMail Success',
  props<{ hostingMail: HostingMail }>()
);

export const updateHostingMail = createAction(
  '[HostingMail] Update HostingMail',
  props<{ id: string; hostingMail: HostingMail }>()
);

export const updateHostingMailSuccess = createAction(
  '[HostingMail] Update HostingMail Success',
  props<{ updatedHostingMail: HostingMail }>()
);

export const deleteHostingMail = createAction(
  '[HostingMail] Delete HostingMail',
  props<{ id: string }>()
);

export const deleteHostingMailSuccess = createAction(
  '[HostingMail] Delete HostingMail Success',
  props<{ id: string }>()
);




export const loadCompany = createAction('[Company] Load Company');
export const loadCompanySuccess = createAction(
  '[Company] Load Company Success',
  props<{ companies: Company[] }>()
);

export const addCompany = createAction(
  '[Company] Add Company',
  props<{ company: Company }>()
);

export const addCompanySuccess = createAction(
  '[Company] Add Company Success',
  props<{ company: Company }>()
);

export const deleteCompany = createAction(
  '[Company] Delete Company',
  props<{ id: string }>()
);

export const deleteCompanySuccess = createAction(
  '[Company] Delete Company Success',
  props<{ id: string }>()
);

export const updateCompany = createAction(
  '[Company] Update Company',
  props<{ id: string; company: Company }>()
);

export const updateCompanySuccess = createAction(
  '[Company] Update Company Success',
  props<{ updatedCompany: Company }>()
);


