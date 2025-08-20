// store/machine-type.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as MachineTypeActions from './entity.action';
import { MachineType, Machine, Customer, User } from '../../../model/machine.model';

export const machineTypeFeatureKey = 'machineTypes';

export interface MachineTypeState {
  machineTypes: MachineType[];
  machine: Machine[];
   customers: Customer[];
    users: User[];
  error: any;
}

export const initialState: MachineTypeState = {
  machineTypes: [],
  machine: [],
  customers: [],
    users: [],
  error: null
};

export const machineTypeReducer = createReducer(
  initialState,

  on(MachineTypeActions.loadMachineTypesSuccess, (state, { machineTypes }) => ({
    ...state,
    machineTypes,
    error: null
  })),

  on(MachineTypeActions.addMachineTypeSuccess, (state, { machineType }) => ({
    ...state,
    machineTypes: [...state.machineTypes, machineType]
  })),

  on(MachineTypeActions.updateMachineTypeSuccess, (state, { updatedMachineType }) => ({
    ...state,
    machineTypes: state.machineTypes.map(mt =>
      mt._id === updatedMachineType._id ? updatedMachineType : mt
    )
  })),

  on(MachineTypeActions.deleteMachineTypeSuccess, (state, { id }) => ({
    ...state,
    machineTypes: state.machineTypes.filter(mt => mt._id !== id)
  })),

    on(MachineTypeActions.loadMachineSuccess, (state, { machine }) => ({
    ...state,
    machine,
    error: null
  })),

    on(MachineTypeActions.addMachineSuccess, (state, { machine }) => ({
    ...state,
    machine: [...state.machine, machine]
  })),

   on(MachineTypeActions.updateMachineSuccess, (state, { updatedMachine }) => ({
    ...state,
    machine: state.machine.map(mt =>
      mt._id === updatedMachine._id ? updatedMachine : mt
    )
  })),


  on(MachineTypeActions.loadCustomerSuccess, (state, { customers }) => ({
    ...state,
    customers,
    error: null
  })),

  on(MachineTypeActions.addCustomerSuccess, (state, { customer }) => ({
    ...state,
    customers: [...state.customers, customer]
  })),

  on(MachineTypeActions.deleteCustomerSuccess, (state, { id }) => ({
    ...state,
    customers: state.customers.filter((c) => c._id !== id)
  })),

  on(MachineTypeActions.updateCustomerSuccess, (state, { updatedCustomer }) => ({
    ...state,
    customers: state.customers.map((c) =>
      c._id === updatedCustomer._id ? updatedCustomer : c
    )
  })),


   on(MachineTypeActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    error: null
  })),

  on(MachineTypeActions.addUserSuccess, (state, { user }) => ({
    ...state,
    users: [...state.users, user]
  })),

  on(MachineTypeActions.updateUserSuccess, (state, { updatedUser }) => ({
    ...state,
    users: state.users.map(u => u._id === updatedUser._id ? updatedUser : u)
  })),

  on(MachineTypeActions.deleteUserSuccess, (state, { id }) => ({
    ...state,
    users: state.users.filter(u => u._id !== id)
  })),




  on(MachineTypeActions.apiFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
