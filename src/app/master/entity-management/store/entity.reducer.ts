// store/machine-type.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as MachineTypeActions from './entity.action';
import { MachineType, Machine } from '../../../model/machine.model';

export const machineTypeFeatureKey = 'machineTypes';

export interface MachineTypeState {
  machineTypes: MachineType[];
  machine: Machine[];
  error: any;
}

export const initialState: MachineTypeState = {
  machineTypes: [],
  machine: [],
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


  on(MachineTypeActions.apiFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
