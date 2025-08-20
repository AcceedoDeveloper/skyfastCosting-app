import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as MachineTypeActions from './entity.action';
import { MachineService } from '../../../services/machine.service';
import { MachineType, Machine, Customer } from '../../../model/machine.model';

@Injectable()
export class MachineTypeEffects {
  private actions$ = inject(Actions);
  private machineTypeService = inject(MachineService);
  private toastr = inject(ToastrService);


  loadMachineTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.loadMachineTypes),
     
      mergeMap(() =>
        this.machineTypeService.getMachineTypes().pipe(
        
          map((machineTypes: MachineType[]) =>
            MachineTypeActions.loadMachineTypesSuccess({ machineTypes })
          ),
          catchError(error => {
            this.toastr.error('Failed to load machine types.');
            console.error('loadMachineTypes error:', error);
            return of(MachineTypeActions.apiFailure({ error }));
          })
        )
      )
    )
  );


  addMachineType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.addMachineType),
      mergeMap(action =>
        this.machineTypeService.createMachineType(action.machineType).pipe(
          map((response: any) => {
            this.toastr.success('Machine type added successfully!');
            const machineType :  MachineType = response.machineType || response;
            return MachineTypeActions.addMachineTypeSuccess({ machineType });
          }),
          catchError(error => {
            this.toastr.error('Failed to add machine type.');
            return of(MachineTypeActions.apiFailure({ error }));
          })
        )
      )
    )
  );


  updateMachineType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.updateMachineType),
      mergeMap(action =>
        this.machineTypeService.updateMachineType(action.id, action.machineType).pipe(
          map((updatedMachineType: MachineType) => {
            this.toastr.success('Machine type updated successfully!');
            return MachineTypeActions.updateMachineTypeSuccess({ updatedMachineType : { ...action.machineType , _id: action.id}});
          }),
          catchError(error => {
            this.toastr.error('Failed to update machine type.');
            return of(MachineTypeActions.apiFailure({ error }));
          })
        )
      )
    )
  );


  deleteMachineType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.deleteMachineType),
      mergeMap(action =>
        this.machineTypeService.deleteMachineType(action.id).pipe(
          map(() => {
            this.toastr.success('Machine type deleted successfully!');
            return MachineTypeActions.deleteMachineTypeSuccess({ id: action.id });
          }),
          catchError(error => {
            this.toastr.error('Failed to delete machine type.');
            return of(MachineTypeActions.apiFailure({ error }));
          })
        )
      )
    )
  );



  loadMachine$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.loadMachine),

      mergeMap(() =>
        this.machineTypeService.getMachine().pipe(
          map( (machine : Machine[]) => 
            MachineTypeActions.loadMachineSuccess({ machine })
          ),
          catchError( error => {
            this.toastr.error(" Failed to load machine");
            console.error(" load material error ", error);
            return of( MachineTypeActions.apiFailure({ error}))
          }
          )
        )

      )
    )

  )



  addMachine$ = createEffect( () =>
    this.actions$.pipe(
      ofType(MachineTypeActions.addMachine),
      mergeMap( actions =>
        this.machineTypeService.createMachine(actions.machine).pipe(
          map( (response : any) => {
            this.toastr.success('Machine added successfully!');
            const machine : Machine = response.machine || response;
            return MachineTypeActions.addMachineSuccess({ machine});
          }),
          catchError( error => {
            this.toastr.error('Failed to add machine');
            return of(MachineTypeActions.apiFailure({ error}));
          })
        )
       )
    )

  )

    updateMachine$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.updateMachine),
      mergeMap(action =>
        this.machineTypeService.updateMachine(action.id, action.machine).pipe(
          map((updatedMachine: Machine) => {
            this.toastr.success('Machine type updated successfully!');
            return MachineTypeActions.updateMachineSuccess({ updatedMachine : { ...action.machine , _id: action.id}});
          }),
          catchError(error => {
            this.toastr.error('Failed to update machine type.');
            return of(MachineTypeActions.apiFailure({ error }));
          })
        )
      )
    ))


    loadCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.loadCustomer),
      mergeMap(() =>
        this.machineTypeService.getCustomer().pipe(
          map((customers) => MachineTypeActions.loadCustomerSuccess({ customers })),
          catchError((error) => {
            this.toastr.error('Failed to load customers');
            return of(MachineTypeActions.apiFailure({ error }));
          })
        )
      )
    )
  );

  addCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.addCustomer),
      mergeMap((action) =>
        this.machineTypeService.addCustomer(action.customer).pipe(
          map((response : any) => {
            this.toastr.success('Customer added successfully!');
            const customer : Customer = response.customer || response;
            return MachineTypeActions.addCustomerSuccess({ customer });
          }),
          catchError((error) => {
            this.toastr.error('Failed to add customer');
            return of(MachineTypeActions.apiFailure({ error }));
          })
        )
      )
    )
  );

  deleteCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.deleteCustomer),
      mergeMap((action) =>
        this.machineTypeService.deleteCustomer(action.id).pipe(
          map(() => {
            this.toastr.success('Customer deleted successfully!');
            return MachineTypeActions.deleteCustomerSuccess({ id: action.id });
          }),
          catchError((error) => {
            this.toastr.error('Failed to delete customer');
            return of(MachineTypeActions.apiFailure({ error }));
          })
        )
      )
    )
  );

  updateCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.updateCustomer),
      mergeMap((action) =>
        this.machineTypeService.updateCustomer(action.id, action.customer).pipe(
          map(() => {
            this.toastr.success('Customer updated successfully!');
            return MachineTypeActions.updateCustomerSuccess({
              updatedCustomer: { ...action.customer, _id: action.id }
            });
          }),
          catchError((error) => {
            this.toastr.error('Failed to update customer');
            return of(MachineTypeActions.apiFailure({ error }));
          })
        )
      )
    )
  );



  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.loadUsers),
      mergeMap(() =>
        this.machineTypeService.getUsers().pipe(
          map(users => MachineTypeActions.loadUsersSuccess({ users })),
          catchError(error => of(MachineTypeActions.apiFailure({ error })))
        )
      )
    )
  );

  addUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.addUser),
      mergeMap(action =>
        this.machineTypeService.createUser(action.user).pipe(
          tap(() => this.toastr.success('User added successfully!')),
          map(user => MachineTypeActions.addUserSuccess({ user })),
          catchError(error => of(MachineTypeActions.apiFailure({ error })))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.updateUser),
      mergeMap(action =>
        this.machineTypeService.updateUser(action.id, action.user).pipe(
          tap(() => this.toastr.success('User updated successfully!')),
          map(() => MachineTypeActions.updateUserSuccess({ updatedUser: { ...action.user, _id: action.id } })),
          catchError(error => of(MachineTypeActions.apiFailure({ error })))
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MachineTypeActions.deleteUser),
      mergeMap(action =>
        this.machineTypeService.deleteUser(action.id).pipe(
          tap(() => this.toastr.success('User deleted successfully!')),
          map(() => MachineTypeActions.deleteUserSuccess({ id: action.id })),
          catchError(error => of(MachineTypeActions.apiFailure({ error })))
        )
      )
    )
  );

  
}
