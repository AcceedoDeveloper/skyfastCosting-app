import { createAction, props } from '@ngrx/store';
import { RawMaterial } from '../../model/product.model';

// Load
export const loadRawMaterials = createAction('[RawMaterial] Load RawMaterials');
export const loadRawMaterialsSuccess = createAction(
  '[RawMaterial] Load RawMaterials Success',
  props<{ rawMaterials: RawMaterial[] }>()
);

// Add
export const addRawMaterial = createAction(
  '[RawMaterial] Add RawMaterial',
  props<{ rawMaterial: RawMaterial }>()
);

export const addRawMaterialSuccess = createAction(
  '[RawMaterial] Add RawMaterial Success',
  props<{ rawMaterial: RawMaterial }>()
);

// Delete
export const deleteRawMaterial = createAction(
  '[RawMaterial] Delete RawMaterial',
  props<{ id: string }>()
);

export const deleteRawMaterialSuccess = createAction(
  '[RawMaterial] Delete RawMaterial Success',
  props<{ id: string }>()
);

// Update
export const updateRawMaterial = createAction(
  '[RawMaterial] Update RawMaterial',
  props<{ id: string; rawMaterial: RawMaterial }>()
);

export const updateRawMaterialSuccess = createAction(
  '[RawMaterial] Update RawMaterial Success',
  props<{ updatedRawMaterial: RawMaterial }>()
);

// API Failure
export const apiFailure = createAction(
  '[RawMaterial] API Failure',
  props<{ error: any }>()
);
