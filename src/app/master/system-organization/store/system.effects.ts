import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as RoleActions from './system.actions';  // your role action file path
import { EntityService } from '../../../services/entity.service'; // your service for roles
import { ToastrService } from 'ngx-toastr';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import {Department, Role, Shift,  } from '../../../model/role.model';


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
          map((response : any) => {
            this.toastr.success('Role added successfully!');
            const role : Role = response.role || response ;
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
            return RoleActions.updateRoleSuccess({ updatedRole : { ...action.role, _id: action.id} });
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


addDepartment$ = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.addDepartment),
    mergeMap(action =>
      this.roleService.addDepartment(action.department).pipe(
        map((response: any) => {
          this.toastr.success('Department added successfully!');
          const department: Department = response.departmentname || response;
          return RoleActions.addDepartmentSuccess({ department });
        }),
        catchError(error => {
          this.toastr.error('Failed to add department.');
          return of(RoleActions.apiFailure({ error }));
        })
      )
    )
  )
);



deleteDepartment$ = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.deleteDepartment),
    mergeMap(action =>
      this.roleService.deleteDepartment(action.id).pipe(
        map(() => {
          this.toastr.success('Department deleted successfully!');
          return RoleActions.deleteDepartmentSuccess({ id: action.id });
        }),
        catchError(error => {
          this.toastr.error('Failed to delete department.');
          return of(RoleActions.apiFailure({ error }));
        })
      )
    )
  )
);

updateDepartment$ = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.updateDepartment),
    mergeMap(action =>
      this.roleService.updateDepartment(action.id, action.department).pipe(
        map(() => {
          this.toastr.success('Department updated successfully!');
          // Use the submitted form values
          return RoleActions.updateDepartmentSuccess({
            updatedDepartment: { ...action.department, _id: action.id }
          });
        }),
        catchError(error => {
          this.toastr.error('Failed to update department.');
          return of(RoleActions.apiFailure({ error }));
        })
      )
    )
  )
);


  loadShift$ = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.loadshift),
    mergeMap(() =>
      this.roleService.getShift().pipe(
        tap(shift => console.log('Department loaded from service:', shift)),
        map(shift => RoleActions.loadShiftSuccess({ shift })),
        catchError(error => {
          this.toastr.error('Failed to load roles.');
          console.error('loadRoles error:', error);
          return of(RoleActions.apiFailure({ error }));
        })
      )
    )
  )
);


addShift$ = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.addShift),
    mergeMap(action =>
      this.roleService.addShift(action.shift).pipe(
        map((response: any) => {
          this.toastr.success('Shift added successfully!');
          const shift: Shift = response.shift || response;
          return RoleActions.addShiftSuccess({ shift }); 
        }),
        catchError(error => {
          this.toastr.error('Failed to add shift.');
          return of(RoleActions.apiFailure({ error }));
        })
      )
    )
  )
);

updateShift$ = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.updateShift),
    mergeMap((action) =>
      this.roleService.updateShift(action.id, action.shift).pipe(
       map(() => {
  this.toastr.success('Shift updated successfully!');
  return RoleActions.updateShiftSuccess({
    shift: { ...action.shift, _id: action.id }
  });
}),

        catchError((error) => {
          this.toastr.error('Failed to update shift.');
          return of(RoleActions.apiFailure({ error }));
        })
      )
    )
  )
);



deleteShift$ = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.deleteShift),
    mergeMap(action =>
      this.roleService.deleteShift(action.id).pipe(
        map(() => {
          this.toastr.success('Shift deleted successfully!');
          return RoleActions.deleteShiftSuccess({ id: action.id });
        }),
        catchError(error => {
          this.toastr.error('Failed to delete department.');
          return of(RoleActions.apiFailure({ error }));
        })
      )
    )
  )
);


}
