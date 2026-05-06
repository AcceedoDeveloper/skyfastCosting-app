import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {ConfigService } from '../shared/config.service';

import { Role, Department, Shift, HostingMail} from '../model/role.model';
import { Permission } from '../model/permission.model';
import { tap, map } from "rxjs/operators";
import { Observable, of } from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class EntityService {
 
 private cachedPermissions: Permission[] | null = null;

  constructor(private http : HttpClient, private config: ConfigService ) { }


    getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.config.getCostingUrl('getRole'));
  }

  addRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.config.getCostingUrl('addRole'), role);
  }

  updateRole(id: string, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.config.getCostingUrl('updateRole')}/${id}`, role);
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl('deleteRole')}/${id}`);
  }

  // 🔹 Departments
  getDepartment(): Observable<Department[]> {
    return this.http.get<Department[]>(this.config.getCostingUrl('getDepartment'));
  }

  addDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(this.config.getCostingUrl('createDepartment'), department);
  }

  updateDepartment(id: string, department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.config.getCostingUrl('updateDepartment')}/${id}`, department);
  }

  deleteDepartment(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl('deleteDepartment')}/${id}`);
  }

  // 🔹 Shifts
  getShift(): Observable<Shift[]> {
    return this.http.get<Shift[]>(this.config.getCostingUrl('getShift'));
  }

  addShift(shift: Shift): Observable<Shift> {
    return this.http.post<Shift>(this.config.getCostingUrl('createShift'), shift);
  }

  updateShift(id: string, shift: Shift): Observable<Shift> {
    return this.http.put<Shift>(`${this.config.getCostingUrl('updateShift')}/${id}`, shift);
  }

  deleteShift(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl('deleteShift')}/${id}`);
  }

  // 🔹 Hosting Mail
  getHostingMail(): Observable<HostingMail[]> {
    return this.http.get<HostingMail[]>(this.config.getCostingUrl('getHostingMail'));
  }

  createHostingMail(hostingMail: HostingMail): Observable<HostingMail> {
    return this.http.post<HostingMail>(this.config.getCostingUrl('createHostingMail'), hostingMail);
  }

  updateHostingMail(id: string, hostingMail: HostingMail): Observable<HostingMail> {
    return this.http.put<HostingMail>(`${this.config.getCostingUrl('updateHostingMail')}/${id}`, hostingMail);
  }

  deleteHostingMail(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl('deleteHostingMail')}/${id}`);
  }



// 🔹 Permissions
getPermissions(): Observable<Permission[]> {
  if (this.cachedPermissions) return of(this.cachedPermissions);
  return this.http
    .get<Permission[]>(this.config.getCostingUrl('getPermission'))
    .pipe(tap(perms => this.cachedPermissions = perms));
}

getPermissionByRole(roleId: string): Observable<Permission | null> {
  return this.getPermissions()
    .pipe(map(perms => perms.find(p => p.role === roleId) || null));
}

createPermission(permission: Permission): Observable<Permission> {
  return this.http
    .post<Permission>(this.config.getCostingUrl('createPermission'), permission)
    .pipe(tap(() => this.cachedPermissions = null));
}

updatePermission(id: string, permission: Permission): Observable<Permission> {
  return this.http
    .patch<Permission>(`${this.config.getCostingUrl('updatePermission')}/${id}`, permission)
    .pipe(tap(() => this.cachedPermissions = null));
}

deletePermission(id: string): Observable<any> {
  return this.http
    .delete(`${this.config.getCostingUrl('deletePermission')}/${id}`)
    .pipe(tap(() => this.cachedPermissions = null));
}



}