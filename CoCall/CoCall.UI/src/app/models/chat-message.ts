export interface ChatMessage {
  id : number;
  senderId : number;
  receiverId : number;
  message: string;
  timestamp: Date;
  isRead: boolean;
}
