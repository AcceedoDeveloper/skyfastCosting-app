import { createReducer, on } from '@ngrx/store';
import * as ProductActions from './product.actions';
import { RawMaterial, Process } from '../../model/product.model';

export interface ProductState {
  rawMaterials: RawMaterial[];
  process: Process[];
  error: any;
}

export const initialState: ProductState = {
  rawMaterials: [],
  process: [],
  error: null,
};

export const productReducer = createReducer(
  initialState,

  on(ProductActions.loadRawMaterialsSuccess, (state, { rawMaterials }) => ({
    ...state,
    rawMaterials,
    error: null,
  })),

  on(ProductActions.addRawMaterialSuccess, (state, { rawMaterial }) => ({
    ...state,
    rawMaterials: [...state.rawMaterials, rawMaterial],
  })),

  on(ProductActions.deleteRawMaterialSuccess, (state, { id }) => ({
    ...state,
    rawMaterials: state.rawMaterials.filter(rm => rm._id !== id),
  })),

  on(ProductActions.updateRawMaterialSuccess, (state, { updatedRawMaterial }) => ({
    ...state,
    rawMaterials: state.rawMaterials.map(rm =>
      rm._id === updatedRawMaterial._id ? updatedRawMaterial : rm
    ),
  })),



  on(ProductActions.loadProcessSuccess, (state, { process }) => ({
    ...state,
    process,
    error: null
  })),

  on(ProductActions.addProcessSuccess, (state, { process }) => ({
    ...state,
    process: [...state.process, process]
  })),

  on(ProductActions.deleteProcessSuccess, (state, { id }) => ({
    ...state,
    process: state.process.filter(p => p._id !== id)
  })),

  on(ProductActions.updateProcessSuccess, (state, { updatedProcess }) => ({
    ...state,
    process: state.process.map(p =>
      p._id === updatedProcess._id ? updatedProcess : p
    )
  })),


  on(ProductActions.apiFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);
