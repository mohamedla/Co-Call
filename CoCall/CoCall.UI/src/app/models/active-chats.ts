import { ChatMessage } from "./chat-message";

export interface ActiveChats {
  id : number;
  userName: string;
  name: string;
  messages : ChatMessage[];
  unreadCount?: number; // Optional property to track unread messages
}
