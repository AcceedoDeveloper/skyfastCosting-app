import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as RawMaterialActions from './product.actions';
import { ProductService } from '../../services/product.service';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CustomerDetails } from '../../model/customer-details.model';


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


  loadProcess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.loadProcess),
      mergeMap(() =>
        this.productservices.getProcesses().pipe(
          map(process => RawMaterialActions.loadProcessSuccess({ process })),
          catchError(error => of(RawMaterialActions.apiFailure({ error })))
        )
      )
    )
  );

  addProcess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.addProcess),
      mergeMap(action =>
        this.productservices.addProcess(action.process).pipe(
          map((response: any) => {
            this.toastr.success('Process added successfully!');
            return RawMaterialActions.addProcessSuccess({ process: response });
          }),
          catchError(error => {
            this.toastr.error('Failed to add process.');
            return of(RawMaterialActions.apiFailure({ error }));
          })
        )
      )
    )
  );

  deleteProcess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.deleteProcess),
      mergeMap(action =>
        this.productservices.deleteProcess(action.id).pipe(
          map(() => {
            this.toastr.success('Process deleted successfully!');
            return RawMaterialActions.deleteProcessSuccess({ id: action.id });
          }),
          catchError(error => {
            this.toastr.error('Failed to delete process.');
            return of(RawMaterialActions.apiFailure({ error }));
          })
        )
      )
    )
  );

  updateProcess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.updateProcess),
      mergeMap(action =>
        this.productservices.updateProcess(action.id, action.process).pipe(
          map(() => {
            this.toastr.success('Process updated successfully!');
            return RawMaterialActions.updateProcessSuccess({
              updatedProcess: { ...action.process, _id: action.id }
            });
          }),
          catchError(error => {
            this.toastr.error('Failed to update process.');
            return of(RawMaterialActions.apiFailure({ error }));
          })
        )
      )
    )
  );



  loadCustomers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.loadCustomers),
      mergeMap(() =>
        this.productservices.getCustomers().pipe(
          map(customers => RawMaterialActions.loadCustomersSuccess({ customers })),
          catchError(error => {
            this.toastr.error('Failed to load customers');
            return of(RawMaterialActions.apiFailure({ error }));
          })
        )
      )
    )
  );

  // Add Customer
  addCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.addCustomer),
      mergeMap(action =>
        this.productservices.createCustomer(action.customer).pipe(
          map(customer => {
            this.toastr.success('Customer added successfully!');
            return RawMaterialActions.addCustomerSuccess({ customer });
          }),
          catchError(error => {
            this.toastr.error('Failed to add customer');
            return of(RawMaterialActions.apiFailure({ error }));
          })
        )
      )
    )
  );

  // Update
  updateCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.updateCustomer),
      mergeMap(action =>
        this.productservices.updateCustomer(action.id, action.customer).pipe(
          map(() => {
            this.toastr.success('Customer updated successfully!');
            return RawMaterialActions.updateCustomerSuccess({
              updatedCustomer: { ...action.customer, _id: action.id }
            });
          }),
          catchError(error => {
            this.toastr.error('Failed to update customer');
            return of(RawMaterialActions.apiFailure({ error }));
          })
        )
      )
    )
  );

  // Delete
  deleteCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.deleteCustomer),
      mergeMap(action =>
        this.productservices.deleteCustomer(action.id).pipe(
          map(() => {
            this.toastr.success('Customer deleted successfully!');
            return RawMaterialActions.deleteCustomerSuccess({ id: action.id });
          }),
          catchError(error => {
            this.toastr.error('Failed to delete customer');
            return of(RawMaterialActions.apiFailure({ error }));
          })
        )
      )
    )
  );







}
