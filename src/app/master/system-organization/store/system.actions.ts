// store/role.actions.ts
import { createAction, props } from '@ngrx/store';
import { Role } from '../../../model/role.model';

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
