// store/machine-type.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as MachineTypeActions from './entity.action';
import { MachineType } from '../../../model/machine.model';

export const machineTypeFeatureKey = 'machineTypes';

export interface MachineTypeState {
  machineTypes: MachineType[];
  error: any;
}

export const initialState: MachineTypeState = {
  machineTypes: [],
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

  on(MachineTypeActions.apiFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
