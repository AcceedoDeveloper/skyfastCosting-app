import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MachineType, Machine } from '../model/machine.model';

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // GET: All machine types
  getMachineTypes(): Observable<MachineType[]> {
    return this.http.get<MachineType[]>(`${this.baseUrl}/getmachine-type`);
  }

  // POST: Create machine type
  createMachineType(machineType: Partial<MachineType>): Observable<MachineType> {
    return this.http.post<MachineType>(`${this.baseUrl}/createmachine-type`, machineType);
  }

  // PUT: Update machine type
  updateMachineType(id: string, machineType: Partial<MachineType>): Observable<MachineType> {
    return this.http.put<MachineType>(`${this.baseUrl}/updatemachine-type/${id}`, machineType);
  }

  // DELETE: Remove machine type
  deleteMachineType(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deletemachine-type/${id}`);
  }

  getMachine(): Observable<Machine[]>{
    return this.http.get<Machine[]>(`${this.baseUrl}/getmachine`);
  } 

}