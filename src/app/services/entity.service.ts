import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {ConfigService } from '../shared/config.service';
import { Observable } from "rxjs";
import { Role, Department, Shift} from '../model/role.model';


@Injectable({
  providedIn: 'root'
})
export class EntityService {
   private apiUrl = 'http://localhost:3005';


  constructor(private http : HttpClient, private config: ConfigService ) { }


   getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/getRole`);
  }


   addRole(role: Role): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/addRole`, role);
  }

  updateRole(id: string, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/updateRole/${id}`, role);
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteRole/${id}`);
  }


  getDepartment(): Observable<Department[]>{
    return this.http.get<Department[]>(`${this.apiUrl}/getdepartment`)
  }

  addDepartment(department: Department): Observable<Department> {
  return this.http.post<Department>(`${this.apiUrl}/createdepartment`, department);
}

deleteDepartment(id: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/deletedepartment/${id}`);
}

updateDepartment(id: string, department: Department): Observable<Department> {
  return this.http.put<Department>(`${this.apiUrl}/updatedepartment/${id}`, department);
}

  getShift(): Observable<Shift[]>{
    return this.http.get<Shift[]>(`${this.apiUrl}/getShifts`)
  }

   addShift(shift: Shift): Observable<Shift> {
  return this.http.post<Shift>(`${this.apiUrl}/createShift`, shift);
}

updateShift(id: string, shift: Shift): Observable<Shift> {
  return this.http.put<Shift>(`${this.apiUrl}/updateShift/${id}`, shift );
}

deleteShift(id: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/deleteShift/${id}`);
}

}
