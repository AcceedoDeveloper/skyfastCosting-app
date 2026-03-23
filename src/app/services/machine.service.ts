import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MachineType, Machine, Customer, User } from '../model/machine.model';
import  { ConfigService} from '../shared/config.service';

@Injectable({
  providedIn: 'root'
})
export class MachineService {

  constructor(private http: HttpClient, private config : ConfigService) {}

 getMachineTypes(): Observable<MachineType[]> {
    return this.http.get<MachineType[]>(this.config.getCostingUrl("getMachineTypes"));
  }

  createMachineType(machineType: Partial<MachineType>): Observable<MachineType> {
    return this.http.post<MachineType>(this.config.getCostingUrl("createMachineType"), machineType);
  }

  updateMachineType(id: string, machineType: Partial<MachineType>): Observable<MachineType> {
    return this.http.put<MachineType>(`${this.config.getCostingUrl("updateMachineType")}/${id}`, machineType);
  }

  deleteMachineType(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl("deleteMachineType")}/${id}`);
  }

  // 🔹 Machines
  getMachine(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.config.getCostingUrl("getMachine"));
  }

  createMachine(machine: Partial<Machine>): Observable<Machine> {
    return this.http.post<Machine>(this.config.getCostingUrl("createMachine"), machine);
  }

  updateMachine(id: string, machine: Partial<Machine>): Observable<Machine> {
    return this.http.put<Machine>(`${this.config.getCostingUrl("updateMachine")}/${id}`, machine);
  }

  // 🔹 Customers
  getCustomer(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.config.getCostingUrl("getCustomer"));
  }

  addCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.config.getCostingUrl("createCustomer"), customer);
  }

  updateCustomer(id: string, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.config.getCostingUrl("updateCustomer")}/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl("deleteCustomer")}/${id}`);
  }

  // 🔹 Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.config.getCostingUrl("getUsers"));
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.config.getCostingUrl("createUser"), user);
  }

  updateUser(id: string, user: User): Observable<User> {
    console.log('user',user);
    
    return this.http.put<User>(`${this.config.getCostingUrl("updateUser")}/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl("deleteUser")}/${id}`);
  }

}