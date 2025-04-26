import { Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  activeChats = [{ name: 'User1' }, { name: 'User2' }];
  selectedChat: any = null;
  newMessage = '';

  onSearch(event: any) {
    const query = event.target.value;
    console.log('Search query:', query);
  }

  openChat(chat: any) {
    this.selectedChat = {
      name: chat.name,
      messages: [
        { sender: 'User1', text: 'Hello!' },
        { sender: 'Me', text: 'Hi there!' }
      ]
    };
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.selectedChat.messages.push({ sender: 'Me', text: this.newMessage });
      this.newMessage = '';
    }
  }
}
