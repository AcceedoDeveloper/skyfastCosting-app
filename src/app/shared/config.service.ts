import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AppConfig {
  baseUrl: string;
 costingUrl: string;
  backupUrl: string;
  liveTimeOut: number;
  urls: { name: string; url: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
private config!: AppConfig; 

  constructor(private http: HttpClient) {}

  load(): Promise<void> {
    return this.http.get<AppConfig>('assets/config/development.json')
      .toPromise()
      .then((data) => {
        this.config = data!;
      });
  }

  getUrl(name: string): string {
    const found = this.config.urls.find((u) => u.name === name);
    return found ? found.url : '';
  }

getCostingUrl(name: string): string {
  return this.config.costingUrl + this.getUrl(name); 
}

}
