// import { Injectable } from "@angular/core";
// import { HttpClient } from "@angular/common/http";
// import { Observable, of } from "rxjs";
// import { tap, map } from "rxjs/operators";

// export interface Permission {
//   _id?: string;
//   role: string;
//   screens: any;
//   initialScreen: string;
// }

// @Injectable({ providedIn: 'root' })
// export class PermissionService {
//   // private apiUrl = 'http://localhost:3005';
//   // private cachedPermissions: Permission[] | null = null;

//   constructor(private http: HttpClient) {}

//   getPermissions(): Observable<Permission[]> {
//     if (this.cachedPermissions) return of(this.cachedPermissions);
//     return this.http.get<Permission[]>(`${this.apiUrl}/getPermission`).pipe(tap(perms => this.cachedPermissions = perms));
//   }

//   getPermissionByRole(roleId: string): Observable<Permission | null> {
//     return this.getPermissions().pipe(map(perms => perms.find(p => p.role === roleId) || null));
//   }

//   createPermission(permission: Permission): Observable<Permission> {
//     return this.http.post<Permission>(`${this.apiUrl}/createPermission`, permission).pipe(tap(() => this.cachedPermissions = null));
//   }

//   updatePermission(id: string, permission: Permission): Observable<Permission> {
//     return this.http.patch<Permission>(`${this.apiUrl}/updatePermission/${id}`, permission).pipe(tap(() => this.cachedPermissions = null));
//   }

//   deletePermission(id: string): Observable<any> {
//     return this.http.delete(`${this.apiUrl}/deletePermission/${id}`).pipe(tap(() => this.cachedPermissions = null));
//   }
// }
