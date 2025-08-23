import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/chat-message';

@Injectable({
  providedIn: 'root'
})
export class TextChatService {
  private baseURL = `${environment.baseURL}/api/textchat`;

  constructor(private http:HttpClient) { }

  getChatMessage(chatId: number, userId: number): Observable<ChatMessage[]> {
    return this.http.post<ChatMessage[]>(`${this.baseURL}/GetChatMessage`, {
        ownerId: chatId.toString(),
        userId: userId.toString()
    });
  }

  markMessagesAsRead(chatId: number, userId: number): Observable<any> {
    return this.http.post(`${this.baseURL}/MarkChatAsRead`, {
      ownerId: chatId.toString(),
      userId: userId.toString()
    });
  }

  sendMessage(senderId: number, receiverId: number, message: string): Observable<any> {
    return this.http.post(`${this.baseURL}/SendMessage`, {
      senderId,
      receiverId,
      message
    });
  }
}
