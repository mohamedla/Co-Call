import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { Notification } from '../models/Notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationHubService {
  private connection: signalR.HubConnection;

  constructor() {}

  async startConnection(userName: string): Promise<void> {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.baseURL}/hubs/notification`, {
          accessTokenFactory: () => userName // Pass userId as a token or query string
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

  onReceiveNotification(callback: (noti: Notification) => void): void {
    this.playNotificationSound();
    this.connection.on('ReceiveNotification', callback);
  }

  readNotification(notificationId: number): void {
    this.connection.invoke('ReadNotification', notificationId);
  }


  playNotificationSound() {
    let audio = new Audio('assets/notification.wav');
    // audio.muted = false;
    // audio.muted = true;
    audio.autoplay = true;
    audio.play();
  }

  async sendNotification(userId: string, title: string, description: string): Promise<void> {
    await this.connection.invoke('SendNotification', userId, title, description);
  }
}
