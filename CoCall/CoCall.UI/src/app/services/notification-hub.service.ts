import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationHubService {
  private connection: signalR.HubConnection;

  constructor() {}

  async startConnection(userId: string): Promise<void> {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.baseURL}/hubs/notification`, {
          accessTokenFactory: () => userId // Pass userId as a token or query string
        })
        .withAutomaticReconnect()
        .build();

      try {
        await this.connection.start();
        console.log('Notification connection started');
      } catch (err) {
        console.error('Error starting TextChatHub connection:', err);
      }
    }

  onReceiveNotification(callback: (message: string) => void): void {
    this.connection.on('ReceiveNotification', callback);
  }

  private audio = new Audio('assets/notification.wav');

  playNotificationSound() {
    this.audio.play();
  }

  async sendNotification(userId: string, message: string): Promise<void> {
    await this.connection.invoke('SendNotification', userId, message);
  }
}
