import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RawMaterial } from '../model/product.model';




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
}
