import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  activeChats = [{ id: 1, name: 'User1', messages: [{ sender: 'User1', text: 'Hello!' }, { sender: 'Me', text: 'Hi there!' }] }, { id: 2, name: 'User2', messages: [{ sender: 'User2', text: 'Hello!' }, { sender: 'Me', text: 'Hi there!' }] }];
  selectedChat: any = null;
  newMessage = '';
  userName = 'User1';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.verifyUser(this.userName).subscribe(
      (response) => {
        console.log('verify results:', response);
      },
      (error) => {
        console.error('Error verifying:', error);
      }
    );
  }

  onSearch(event: any) {
    const query = event.target.value;
    this.userService.search(query).subscribe(
      (response) => {
        console.log('Search results:', response);
      },
      (error) => {
        console.error('Error searching:', error);
      }
    );
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
