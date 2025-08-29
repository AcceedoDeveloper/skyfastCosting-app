import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from './product.reducer';

export const selectRawMaterialState =
  createFeatureSelector<ProductState>('products');

export const selectAllRawMaterials = createSelector(
  selectRawMaterialState,
  (state: ProductState) => state.rawMaterials
);

export const selectRawMaterialError = createSelector(
  selectRawMaterialState,
  (state: ProductState) => state.error
);
