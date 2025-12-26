import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../shared/config.service';
import { Version } from '../model/version';


@Injectable({
  providedIn: 'root'
})
export class VersionService {

  constructor(private http:HttpClient,private config:ConfigService){}

  getVersions():Observable<Version[]>
  {
    
    return this.http.get<Version[]>(this.config.getCostingUrl('getVersions'));
  }

  addVersions(version:FormData):Observable<Version>
  {
   
    
     return this.http.post<Version>(this.config.getCostingUrl('createVersions'),version);
  }

  updateVersions(id:string,version:FormData):Observable<Version[]>
  {
    return this.http.put<Version[]>(`${this.config.getCostingUrl('updateVersions')}/${id}`,version);
  }

  deleteVersions(id:string):Observable<Version[]>
  {
    return this.http.delete<Version[]>(`${this.config.getCostingUrl('deleteVersions')}/${id}`);
  }

   updateVersionObject(id:string,version:FormData):Observable<Version[]>
   {
     return this.http.put<Version[]>(`${this.config.getCostingUrl('updateVersions/objects')}/${id}`,version);
   }

   deleteVersionObject(id:string):Observable<Version[]>
   {
    return this.http.delete<Version[]>(`${this.config.getCostingUrl('deleteVersions/objects')}/${id}`);
   }

}