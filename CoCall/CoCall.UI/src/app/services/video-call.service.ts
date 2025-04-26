import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VideoCallService {
  private baseURL = `${environment.baseURL}/api/VideoCall`;

  constructor(private http:HttpClient) { }

  async createCall(callerId: string, calleeId: string): Promise<any> {
    return await this.http.post(`${this.baseURL}/create`, { callerId, calleeId });
  }

  async verifyParticipant(callId: number, userId: string): Promise<any> {
    return await this.http.get(`${this.baseURL}/verify`, {
      params: { callId, userId }
    });
  }
}
