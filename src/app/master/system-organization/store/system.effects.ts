import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as RoleActions from './system.actions';  // your role action file path
import { EntityService } from '../../../services/entity.service'; // your service for roles
import { ToastrService } from 'ngx-toastr';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';


@Injectable()
export class RoleEffects {


     private actions$ = inject(Actions);
  private roleService = inject(EntityService);
  private toastr = inject(ToastrService);

loadRoles$ = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.loadRoles),
    tap(() => console.log('loadRoles action received')),
    mergeMap(() =>
      this.roleService.getRoles().pipe(
        tap(roles => console.log('Roles loaded from service:', roles)),
        map(roles => RoleActions.loadRolesSuccess({ roles })),
        catchError(error => {
          this.toastr.error('Failed to load roles.');
          console.error('loadRoles error:', error);
          return of(RoleActions.apiFailure({ error }));
        })
      )
    )
  )
);


  addRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RoleActions.addRole),
      mergeMap(action =>
        this.roleService.addRole(action.role).pipe(
          map(role => {
            this.toastr.success('Role added successfully!');
            return RoleActions.addRoleSuccess({ role });
          }),
          catchError(error => {
            this.toastr.error('Failed to add role.');
            return of(RoleActions.apiFailure({ error }));
          })
        )
      )
    )
  );

  updateRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RoleActions.updateRole),
      mergeMap(action =>
        this.roleService.updateRole(action.id, action.role).pipe(
          map(updatedRole => {
            this.toastr.success('Role updated successfully!');
            return RoleActions.updateRoleSuccess({ updatedRole });
          }),
          catchError(error => {
            this.toastr.error('Failed to update role.');
            return of(RoleActions.apiFailure({ error }));
          })
        )
      )
    )
  );

  deleteRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RoleActions.deleteRole),
      mergeMap(action =>
        this.roleService.deleteRole(action.id).pipe(
          map(() => {
            this.toastr.success('Role deleted successfully!');
            return RoleActions.deleteRoleSuccess({ id: action.id });
          }),
          catchError(error => {
            this.toastr.error('Failed to delete role.');
            return of(RoleActions.apiFailure({ error }));
          })
        )
      )
    )
  );


  loadDepartment$ = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.loadDepartment),
    tap(() => console.log('loadDepartment action received')),
    mergeMap(() =>
      this.roleService.getDepartment().pipe(
        tap(department => console.log('Department loaded from service:', department)),
        map(department => RoleActions.loadDepartmentSuccess({ department })),
        catchError(error => {
          this.toastr.error('Failed to load roles.');
          console.error('loadRoles error:', error);
          return of(RoleActions.apiFailure({ error }));
        })
      )
    )
  )
);


}
