import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from './product.reducer';
import {CustomerDetails } from '../../model/customer-details.model';

export const selectRawMaterialState =
  createFeatureSelector<ProductState>('products');

export const selectAllRawMaterials = createSelector(
  selectRawMaterialState,
  (state: ProductState) => state.rawMaterials
);


export const selectAllProcess = createSelector(
  selectRawMaterialState,
  (state: ProductState) => state.process
);

export const selectAllCustomers = createSelector(
  selectRawMaterialState,
  (state: ProductState) => state.customersDeatiil
);

export const selectRawMaterialError = createSelector(
  selectRawMaterialState,
  (state: ProductState) => state.error
);
