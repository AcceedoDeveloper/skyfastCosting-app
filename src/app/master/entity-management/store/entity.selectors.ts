// store/machine-type.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MachineTypeState, machineTypeFeatureKey } from './entity.reducer';

export const selectMachineTypeState =
  createFeatureSelector<MachineTypeState>(machineTypeFeatureKey);

export const selectAllMachineTypes = createSelector(
  selectMachineTypeState,
  (state: MachineTypeState) => state.machineTypes
);

export const selectMachineTypeError = createSelector(
  selectMachineTypeState,
  state => state.error
);
