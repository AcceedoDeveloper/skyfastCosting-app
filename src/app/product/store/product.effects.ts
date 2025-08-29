import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as RawMaterialActions from './product.actions';
import { ProductService } from '../../services/product.service';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';


@Injectable()
export class ProductEffects {



  private actions$ = inject(Actions);
  private productservices = inject(ProductService);
  private toastr = inject(ToastrService);

  // Load
  loadRawMaterials$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.loadRawMaterials),
      mergeMap(() =>
        this.productservices.getRawMaterials().pipe(
          map(rawMaterials =>
            RawMaterialActions.loadRawMaterialsSuccess({ rawMaterials })
          ),
          catchError(error => {
            this.toastr.error('Failed to load raw materials.');
            return of(RawMaterialActions.apiFailure({ error }));
          })
        )
      )
    )
  );

  // Add
  addRawMaterial$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.addRawMaterial),
      mergeMap(action =>
        this.productservices.addRawMaterial(action.rawMaterial).pipe(
          map(response => {
            this.toastr.success('Raw material added successfully!');
            return RawMaterialActions.addRawMaterialSuccess({
              rawMaterial: response,
            });
          }),
          catchError(error => {
            this.toastr.error('Failed to add raw material.');
            return of(RawMaterialActions.apiFailure({ error }));
          })
        )
      )
    )
  );

  // Delete
  deleteRawMaterial$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.deleteRawMaterial),
      mergeMap(action =>
        this.productservices.deleteRawMaterial(action.id).pipe(
          map(() => {
            this.toastr.success('Raw material deleted successfully!');
            return RawMaterialActions.deleteRawMaterialSuccess({
              id: action.id,
            });
          }),
          catchError(error => {
            this.toastr.error('Failed to delete raw material.');
            return of(RawMaterialActions.apiFailure({ error }));
          })
        )
      )
    )
  );

  // Update
  updateRawMaterial$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.updateRawMaterial),
      mergeMap(action =>
        this.productservices
          .updateRawMaterial(action.id, action.rawMaterial)
          .pipe(
            map(() => {
              this.toastr.success('Raw material updated successfully!');
              return RawMaterialActions.updateRawMaterialSuccess({
                updatedRawMaterial: { ...action.rawMaterial, _id: action.id },
              });
            }),
            catchError(error => {
              this.toastr.error('Failed to update raw material.');
              return of(RawMaterialActions.apiFailure({ error }));
            })
          )
      )
    )
  );
}
