import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TextChatHubService {
  private connection: signalR.HubConnection;

  constructor() {}

  async startConnection(userId: string): Promise<void> {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.baseURL}/hubs/textchat`, {
        accessTokenFactory: () => userId // Pass userId as a token or query string
      })
      .withAutomaticReconnect()
      .build();

    try {
      await this.connection.start();
      console.log('TextChatHub connection started');
    } catch (err) {
      console.error('Error starting TextChatHub connection:', err);
    }
  }

  onReceiveMessage(callback: (sender: string, message: string) => void): void {
    this.connection.on('ReceiveMessage', callback);
  }

  async sendMessage(sender: number, receiver: number, message: string): Promise<void> {
    await this.connection.invoke('SendMessage', sender, receiver, message);
  }
}
