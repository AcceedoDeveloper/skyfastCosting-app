import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RawMaterial, Process } from '../model/product.model';
import { CustomerDetails, PaginatedCustomerResponse, CustomerFilters } from '../model/customer-details.model';
import { ConfigService} from '../shared/config.service';



@Injectable({
  providedIn: 'root'
})
export class ProductService {

// private apiUrl = 'http://localhost:3005';

//  private apiUrl2 = 'http://localhost:3005/uploadProcessExcel';


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

  updateProcess(id: string, process: Partial<Process>): Observable<Process> {
    return this.http.put<Process>(`${this.config.getCostingUrl('updateProcess')}/${id}`, process);
  }

  deleteProcess(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl('deleteProcess')}/${id}`);
  }

  // 🔹 Customer Details
  getCustomers(): Observable<CustomerDetails[]> {
    return this.http.get<CustomerDetails[]>(this.config.getCostingUrl('getCustomerDetails'));
  }

  // 🔹 Get Customers with Server-Side Pagination and Filters
  getCustomersPaginated(filters: CustomerFilters): Observable<PaginatedCustomerResponse> {
    let params = new HttpParams();
    
    if (filters.StartDate) {
      params = params.set('StartDate', filters.StartDate);
    }
    if (filters.EndDate) {
      params = params.set('EndDate', filters.EndDate);
    }
    if (filters.customerName) {
      params = params.set('customerName', filters.customerName);
    }
    if (filters.partName) {
      params = params.set('partName', filters.partName);
    }
    if (filters.drawingNo) {
      params = params.set('drawingNo', filters.drawingNo);
    }
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PaginatedCustomerResponse>(
      this.config.getCostingUrl('getCustomerDetails'),
      { params }
    );
  }

createCustomerDetails(customerDetails: FormData): Observable<CustomerDetails> {
  return this.http.post<CustomerDetails>(
    this.config.getCostingUrl('createCustomerDetails'),
    customerDetails
  );
}


updateCustomer(id: string, customer: any): Observable<any> {
  // If customer is FormData, HttpClient will automatically set multipart headers
  return this.http.put<any>(
    `${this.config.getCostingUrl('updateCustomerDetails')}/${id}`,
    customer
  );
}





  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl('deleteCustomerDetails')}/${id}`);
  }






 downloadQuotation(customerName: string, partName: string, revision: number): Observable<Blob> {
    const url =
      this.config.getCostingUrl("downloadQuotation") +
      `?CustomerName=${encodeURIComponent(customerName)}&partName=${encodeURIComponent(partName)}&Revision=${revision}`;
    return this.http.get(url, { responseType: "blob" });
  }

  // 🔹 Get Quotation Data
  quotationData(customerName: string, partName: string, revision: number): Observable<any> {
    const url =
      this.config.getCostingUrl("getQuotationData") +
      `?CustomerName=${encodeURIComponent(customerName)}&partName=${encodeURIComponent(partName)}&Revision=${revision}`;
    return this.http.get<any>(url);
  }

  // 🔹 Upload File
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post(this.config.getCostingUrl("uploadProcessExcel"), formData);
  }

  // 🔹 Download Process Excel
  downloadProcessExcel(): Observable<Blob> {
    return this.http.get(`${this.config.getCostingUrl("downloadProcessExcel")}`, { responseType: "blob" });
  }


  getCurrencyRates(): Observable<any> {
    return this.http.get<any>(this.config.getCostingUrl('getCurrency'));
  }

  updtaeCurrencyRates(id : string, data: any): Observable<any> {
    return this.http.put<any>(`${this.config.getCostingUrl('updateCurrency')}/${id}`, data);
  }


  saveQuotationPDF(customerName: string, partName: string, revision: number): Observable<any> {
    const url = `${this.config.getCostingUrl('saveQuotationPDF')}?CustomerName=${encodeURIComponent(customerName)}&partName=${encodeURIComponent(partName)}&Revision=${revision}`;
    return this.http.post<any>(url, {}); // empty body
  }
  
  uploadQuotationPDF(customerName: string, partName: string, revision: number, file: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, `${customerName}-${partName}-rev${revision}.pdf`);
    formData.append('customerName', customerName);
    formData.append('partName', partName);
    formData.append('revision', revision.toString());
    console.log('data sent');
  
    const url = this.config.getCostingUrl('uploadQuotationPDF');
    return this.http.post<any>(url, formData);
  }

  getDashboardData(): Observable<any> {
    const url = this.config.getCostingUrl('getDashboardData');
    return this.http.get<any>(url);
  }

  downloadQuotationPDF(params: { customerName: string, partName: string, revision: number }) {
    const url = this.config.getCostingUrl('downloadQuotation');
    return this.http.get<{ fileName: string }>(url, { params });
  }
  
  getQuotationData(customerName: string, partName: string, revision: number) {
    const url = this.config.getCostingUrl('get-report');
  
    const params = {
      customerName,
      partName,
      revision: revision.toString()
    };
    console.log(params);
    
  
    return this.http.get<any>(url, { params });
  }


  printQuotation(CustomerName: string, partName: string, revision: number) {
    const url = this.config.getCostingUrl('printQuotation');
    const params = {
      CustomerName,
      partName,
      Revision: revision.toString()
    };
    console.log(params);

    return this.http.get<any>(url, { params });
  }
  
  
  

}
