import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {ConfigService } from '../shared/config.service';
import { Observable } from "rxjs";
import { Role, Department} from '../model/role.model';


@Injectable({
  providedIn: 'root'
})
export class EntityService {
   private apiUrl = 'http://localhost:3000';


  constructor(private http : HttpClient, private config: ConfigService ) { }


   getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/getrole`);
  }


   addRole(role: Role): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/addrole`, role);
  }

  updateRole(id: string, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/updaterole/${id}`, role);
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleterole/${id}`);
  }


  getDepartment(): Observable<Department[]>{
    return this.http.get<Department[]>(`${this.apiUrl}/getdepartment`)
  }



}
