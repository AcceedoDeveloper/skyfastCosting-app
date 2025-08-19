import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MachineType, Machine, Customer } from '../model/machine.model';

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private baseUrl = 'http://localhost:3005';

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

 createMachine(machine: Partial<Machine>): Observable<Machine> {
    return this.http.post<Machine>(`${this.baseUrl}/createmachine`, machine);
  }

  updateMachine(id: string, machine: Partial<Machine>): Observable<Machine> {
    return this.http.put<Machine>(`${this.baseUrl}/updatemachine/${id}`, machine);
  }
  


  getCustomer(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/getCustomer`);
  }

  addCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/CreateCustomer`, customer);
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteCustomer/${id}`);
  }

  updateCustomer(id: string, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/updateCustomer/${id}`, customer);
  }


  

}