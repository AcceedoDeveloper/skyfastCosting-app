import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../model/company.model';
import { ConfigService} from '../shared/config.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {


constructor(private http: HttpClient, private configService: ConfigService ) {}

getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.configService.getCostingUrl('getCompanies'));
  }

  addCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(this.configService.getCostingUrl('CreateCompany'), company);
  }

  deleteCompany(id: string): Observable<any> {
    return this.http.delete(this.configService.getCostingUrl('deleteCompany') + `/${id}`);
  }

  updateCompany(id: string, company: Company): Observable<Company> {
    return this.http.put<Company>(this.configService.getCostingUrl('updateCompany') + `/${id}`, company);
  }
}
