// store/machine-type.actions.ts
import { createAction, props } from '@ngrx/store';
import { MachineType, Machine, Customer } from '../../../model/machine.model';

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

export const addMachine = createAction(
  '[Machine] Add Machine',
  props<{ machine: Machine }>()
);
export const addMachineSuccess = createAction(
  '[Machine] Add Machine  Success',
  props<{ machine: Machine }>()
);


export const updateMachine = createAction(
  '[Machine] Update Machine',
  props<{ id: string; machine: Machine }>()
);
export const updateMachineSuccess = createAction(
  '[Machine] Update Machine Success',
  props<{ updatedMachine: Machine }>()
);





// Load
export const loadCustomer = createAction('[Customer] Load Customer');
export const loadCustomerSuccess = createAction(
  '[Customer] Load Customer Success',
  props<{ customers: Customer[] }>()
);

// Add
export const addCustomer = createAction(
  '[Customer] Add Customer',
  props<{ customer: Customer }>()
);
export const addCustomerSuccess = createAction(
  '[Customer] Add Customer Success',
  props<{ customer: Customer }>()
);

// Delete
export const deleteCustomer = createAction(
  '[Customer] Delete Customer',
  props<{ id: string }>()
);
export const deleteCustomerSuccess = createAction(
  '[Customer] Delete Customer Success',
  props<{ id: string }>()
);

// Update
export const updateCustomer = createAction(
  '[Customer] Update Customer',
  props<{ id: string; customer: Customer }>()
);
export const updateCustomerSuccess = createAction(
  '[Customer] Update Customer Success',
  props<{ updatedCustomer: Customer }>()
);


