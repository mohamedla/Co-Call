import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseURL = `${environment.baseURL}/api/user`;

  constructor(private http:HttpClient) { }

  verifyUser(username: string,): Observable<any> {
    return this.http.get(`${this.baseURL}/verify`, { params: { username }});
  }

  search(query: string): Observable<any> {
    return this.http.get(`${this.baseURL}/search`, { params: { query }});
  }
}
