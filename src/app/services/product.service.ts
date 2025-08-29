import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RawMaterial, Process } from '../model/product.model';
import { CustomerDetails } from '../model/customer-details.model';




@Injectable({
  providedIn: 'root'
})
export class ProductService {

private apiUrl = 'http://localhost:3005';

  constructor(private http: HttpClient) {}

  getRawMaterials(): Observable<RawMaterial[]> {
    return this.http.get<RawMaterial[]>(`${this.apiUrl}/getRawMaterial`);
  }

  addRawMaterial(rawMaterial: RawMaterial): Observable<RawMaterial> {
    return this.http.post<RawMaterial>(`${this.apiUrl}/createRawMaterial`, rawMaterial);
  }

  deleteRawMaterial(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteRawMaterial/${id}`);
  }

  updateRawMaterial(id: string, rawMaterial: RawMaterial): Observable<RawMaterial> {
    return this.http.put<RawMaterial>(`${this.apiUrl}/updateRawMaterial/${id}`, rawMaterial);
  }


   getProcesses(): Observable<Process[]> {
    return this.http.get<Process[]>(`${this.apiUrl}/getProcess`);
  }

  addProcess(process: Process): Observable<Process> {
    return this.http.post<Process>(`${this.apiUrl}/createProcess`, process);
  }

  deleteProcess(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteProcess/${id}`);
  }

  updateProcess(id: string, process: Process): Observable<Process> {
    return this.http.put<Process>(`${this.apiUrl}/updateProcess/${id}`, process);
  }


  getCustomers(): Observable<CustomerDetails[]> {
    return this.http.get<CustomerDetails[]>(`${this.apiUrl}/getCustomerDetails`);
  }

  createCustomerDetails(customerdetails: CustomerDetails): Observable<CustomerDetails> {
    return this.http.post<CustomerDetails>(`${this.apiUrl}/createCustomerDetails`, customerdetails);
  }

  updateCustomer(id: string, customer: CustomerDetails): Observable<CustomerDetails> {
    return this.http.put<CustomerDetails>(`${this.apiUrl}/updateCustomerDetails/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteCustomerDetails/${id}`);
  }
}
