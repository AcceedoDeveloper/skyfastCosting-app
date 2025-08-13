import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as MachineTypeActions from './entity.action';
import { MachineService } from '../../../services/machine.service';
import { MachineType } from '../../../model/machine.model';

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
          map((machineType: MachineType) => {
            this.toastr.success('Machine type added successfully!');
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
            return MachineTypeActions.updateMachineTypeSuccess({ updatedMachineType });
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
}
