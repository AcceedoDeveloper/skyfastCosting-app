import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RawMaterial, Process } from '../model/product.model';
import { CustomerDetails } from '../model/customer-details.model';
import { ConfigService} from '../shared/config.service';



@Injectable({
  providedIn: 'root'
})
export class ProductService {

private apiUrl = 'http://localhost:3005';

  constructor(private http: HttpClient, private config : ConfigService) {}

 getRawMaterials(): Observable<RawMaterial[]> {
    return this.http.get<RawMaterial[]>(this.config.getCostingUrl('getRawMaterials'));
  }

  addRawMaterial(rawMaterial: RawMaterial): Observable<RawMaterial> {
    return this.http.post<RawMaterial>(this.config.getCostingUrl('createRawMaterial'), rawMaterial);
  }

  updateRawMaterial(id: string, rawMaterial: RawMaterial): Observable<RawMaterial> {
    return this.http.put<RawMaterial>(`${this.config.getCostingUrl('updateRawMaterial')}/${id}`, rawMaterial);
  }

  deleteRawMaterial(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl('deleteRawMaterial')}/${id}`);
  }

  // 🔹 Processes
  getProcesses(): Observable<Process[]> {
    return this.http.get<Process[]>(this.config.getCostingUrl('getProcesses'));
  }

  addProcess(process: Process): Observable<Process> {
    return this.http.post<Process>(this.config.getCostingUrl('createProcess'), process);
  }

  updateProcess(id: string, process: Process): Observable<Process> {
    return this.http.put<Process>(`${this.config.getCostingUrl('updateProcess')}/${id}`, process);
  }

  deleteProcess(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl('deleteProcess')}/${id}`);
  }

  // 🔹 Customer Details
  getCustomers(): Observable<CustomerDetails[]> {
    return this.http.get<CustomerDetails[]>(this.config.getCostingUrl('getCustomerDetails'));
  }

  createCustomerDetails(customerDetails: CustomerDetails): Observable<CustomerDetails> {
    return this.http.post<CustomerDetails>(this.config.getCostingUrl('createCustomerDetails'), customerDetails);
  }

  updateCustomer(id: string, customer: CustomerDetails): Observable<CustomerDetails> {
    console.log('data', customer);
    
    return this.http.put<CustomerDetails>(`${this.config.getCostingUrl('updateCustomerDetails')}/${id}`, customer);
  }


  downloadQuotation(customerName: string, partName: string, revision: number): Observable<Blob> {
    const url = `${this.apiUrl}/quotation/revision?CustomerName=${encodeURIComponent(customerName)}&partName=${encodeURIComponent(partName)}&Revision=${revision}`;
    return this.http.get(url, { responseType: 'blob' }); // blob = binary data
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl('deleteCustomerDetails')}/${id}`);
  }
}
