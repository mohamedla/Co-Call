import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VideoCallHubService {
  private connection: signalR.HubConnection;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.baseURL}/hubs/videocall`)
      .withAutomaticReconnect()
      .build();
  }

  async startConnection(): Promise<void> {
    try {
      await this.connection.start();
      console.log('VideoCallHub connection started');
    } catch (err) {
      console.error('Error starting VideoCallHub connection:', err);
    }
  }

  onReceiveCallInvitation(callback: (caller: string) => void): void {
    this.connection.on('ReceiveCallInvitation', callback);
  }

  async sendCallInvitation(caller: string, callee: string): Promise<void> {
    await this.connection.invoke('SendCallInvitation', caller, callee);
  }

  async enterCall(callId: number): Promise<void> {
    await this.connection.invoke('EnterCall', callId);
  }

  async leaveCall(callId: number): Promise<void> {
    await this.connection.invoke('LeaveCall', callId);
  }

  async endCall(callId: number, enderId: string): Promise<void> {
    await this.connection.invoke('EndCall', callId, enderId);
  }
}
