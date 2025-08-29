import { createReducer, on } from '@ngrx/store';
import * as RawMaterialActions from './product.actions';
import { RawMaterial } from '../../model/product.model';

export interface ProductState {
  rawMaterials: RawMaterial[];
  error: any;
}

export const initialState: ProductState = {
  rawMaterials: [],
  error: null,
};

export const productReducer = createReducer(
  initialState,

  on(RawMaterialActions.loadRawMaterialsSuccess, (state, { rawMaterials }) => ({
    ...state,
    rawMaterials,
    error: null,
  })),

  on(RawMaterialActions.addRawMaterialSuccess, (state, { rawMaterial }) => ({
    ...state,
    rawMaterials: [...state.rawMaterials, rawMaterial],
  })),

  on(RawMaterialActions.deleteRawMaterialSuccess, (state, { id }) => ({
    ...state,
    rawMaterials: state.rawMaterials.filter(rm => rm._id !== id),
  })),

  on(RawMaterialActions.updateRawMaterialSuccess, (state, { updatedRawMaterial }) => ({
    ...state,
    rawMaterials: state.rawMaterials.map(rm =>
      rm._id === updatedRawMaterial._id ? updatedRawMaterial : rm
    ),
  })),

  on(RawMaterialActions.apiFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);
