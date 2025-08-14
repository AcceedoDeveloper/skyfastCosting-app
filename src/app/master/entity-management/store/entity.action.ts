// store/machine-type.actions.ts
import { createAction, props } from '@ngrx/store';
import { MachineType, Machine } from '../../../model/machine.model';

// Load
export const loadMachineTypes = createAction('[MachineType] Load Machine Types');
export const loadMachineTypesSuccess = createAction(
  '[MachineType] Load Machine Types Success',
  props<{ machineTypes: MachineType[] }>()
);

// Add
export const addMachineType = createAction(
  '[MachineType] Add Machine Type',
  props<{ machineType: MachineType }>()
);
export const addMachineTypeSuccess = createAction(
  '[MachineType] Add Machine Type Success',
  props<{ machineType: MachineType }>()
);

// Update
export const updateMachineType = createAction(
  '[MachineType] Update Machine Type',
  props<{ id: string; machineType: MachineType }>()
);
export const updateMachineTypeSuccess = createAction(
  '[MachineType] Update Machine Type Success',
  props<{ updatedMachineType: MachineType }>()
);

// Delete
export const deleteMachineType = createAction(
  '[MachineType] Delete Machine Type',
  props<{ id: string }>()
);
export const deleteMachineTypeSuccess = createAction(
  '[MachineType] Delete Machine Type Success',
  props<{ id: string }>()
);

// Common Failure
export const apiFailure = createAction(
  '[MachineType API] Failure',
  props<{ error: any }>()
);


export const loadMachine = createAction('[Machine] Load Machine ');
export const loadMachineSuccess = createAction(
  '[Machine] Load Machine  Success',
  props<{ machine: Machine[] }>()
);