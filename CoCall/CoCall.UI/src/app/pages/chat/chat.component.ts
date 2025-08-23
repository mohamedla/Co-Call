import { ToastrService } from 'ngx-toastr';
import { ActiveChats } from '../../models/active-chats';
import { User } from '../../models/user';
import { TextChatService } from '../../services/text-chat.service';
import { TextChatHubService } from '../../services/text-chat-hub.service';
import { UserService } from './../../services/user.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnDestroy {
  activeChats: ActiveChats[] = [
    {
      id: 1,
      userName:'user1',
      name: 'User1',
      messages: [
        { id: 1, senderId: 3, receiverId: 2, message: 'Hello!', timestamp: new Date(), isRead: false },
        { id: 2, senderId: 2, receiverId: 3, message: 'Hi there!', timestamp: new Date(), isRead: false },
      ],
      unreadCount: 0
    },
    {
      id: 2,
      userName:'user2',
      name: 'User2',
      messages: [
        { id: 1, senderId: 3, receiverId: 2, message: 'Hello!', timestamp: new Date(), isRead: false },
        { id: 2, senderId: 2, receiverId: 3, message: 'Hi there!', timestamp: new Date(), isRead: false },
      ],
      unreadCount: 0
    },
  ];
  selectedChat: any = null;
  newMessage = '';
  userName = 'johnsmith';
  user: User;
  searchResults: User[] = [];
  searchTimeout: any;
  isChatOpen = false;

  constructor(
    private toastr: ToastrService,
    private userService: UserService,
    private chatService: TextChatService,
    private chatHubService: TextChatHubService
  ) {}

  ngOnInit(): void {
    this.userService.verifyUser(this.userName).subscribe(
      (response) => {
        this.user = response;

        // Initialize SignalR connection
        this.initializeSignalRConnection();

        // Load active chats
        this.userService.getActiveChats(this.user.id).subscribe(
          (response) => {
            this.activeChats = response;
            // Calculate unread counts for all chats
            this.calculateUnreadCounts();
          },
          (error) => {
            this.toastr.error('Error getting active chats');
            console.error('Error getting active chats:', error);
          }
        );
      },
      (error) => {
        this.toastr.error('Error verifying user');
        console.error('Error verifying:', error);
      }
    );
  }

  ngOnDestroy(): void {
    // Disconnect from SignalR when component is destroyed
    // In a real app, you would add code to stop the connection
  }

  private initializeSignalRConnection(): void {
    this.chatHubService.startConnection(this.user.id.toString())
      .then(() => {
        this.toastr.success('Connected to chat service');

        // Set up message receiving
        this.chatHubService.onReceiveMessage((sender, message) => {
          // Find the chat with this sender
          const chat = this.activeChats.find(c => c.userName === sender);

          if (chat) {
            // Add message to chat
            const newMessage = {
              id: chat.messages.length + 1,
              senderId: chat.id,
              receiverId: this.user.id,
              message: message,
              timestamp: new Date(),
              isRead: false
            };

            chat.messages.push(newMessage);

            // Update unread count if this isn't the currently open chat
            if (!this.selectedChat || this.selectedChat.id !== chat.id) {
              chat.unreadCount = (chat.unreadCount || 0) + 1;
            } else {
              // Mark as read if chat is open
              newMessage.isRead = true;
              this.markChatAsRead(chat.id);
            }

            this.toastr.info(`New message from ${chat.name}`);
          }
        });
      })
      .catch(err => {
        this.toastr.error('Could not connect to chat service');
        console.error('Error connecting to ChatHub:', err);
      });
  }

  calculateUnreadCounts(): void {
    this.activeChats.forEach(chat => {
      // Count messages where receiverId is the current user and isRead is false
      chat.unreadCount = chat.messages.filter(
        msg => msg.receiverId === this.user.id && !msg.isRead
      ).length;
    });
  }

  markChatAsRead(chatId: number): void {
    const chat = this.activeChats.find(c => c.id === chatId);
    if (chat) {
      // Mark all messages as read
      chat.messages.forEach(message => {
        if (message.receiverId === this.user.id) {
          message.isRead = true;
        }
      });

      // Reset unread count
      chat.unreadCount = 0;

      // Call service to update read status on server
      this.chatService.markMessagesAsRead(chatId, this.user.id).subscribe(
        () => {
          console.log('Messages marked as read');
        },
        error => {
          console.error('Error marking messages as read:', error);
        }
      );
    }
  }

  onSearch(event: any) {
    const query = event.target.value;

    // Clear previous timeout to prevent multiple API calls
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (query.trim() === '') {
      this.searchResults = [];
      return;
    }

    // Add delay to avoid making API calls on every keystroke
    this.searchTimeout = setTimeout(() => {
      this.userService.search(query).subscribe(
        (response : User[]) => {
          this.searchResults = response;
        },
        (error) => {
          console.error('Error searching:', error);
          this.searchResults = [];
        }
      );
    }, 300);
  }

  createNewChat(user: User) {
    // Check if chat already exists with this user
    const existingChat = this.activeChats.find(chat => chat.name === user.name);

    if (existingChat) {
      // If chat exists, open it
      this.openChat(existingChat);
    } else {
      // Create new chat
      const newChat = {
        id: user.id,
        userName: user.userName,
        name: user.name,
        messages: [],
        unreadCount: 0
      };

      // Add to active chats
      this.activeChats.push(newChat);

      // Open the new chat
      this.openChat(newChat);
    }

    // Clear search results
    this.searchResults = [];
  }

  openChat(chat: any) {
    this.selectedChat = null; // Reset selected chat
    this.isChatOpen = false; // Close any open chat
    this.chatService.getChatMessage(chat.id, this.user.id).subscribe(
      (response) => {
        this.selectedChat = chat;
        this.selectedChat.messages = response;
        this.isChatOpen = true; // Open the selected chat

        // Mark messages as read when opening the chat
        this.markChatAsRead(chat.id);
      },
      (error) => {
        this.toastr.error('Error fetching chat messages');
        console.error('Error fetching chat messages:', error);
      }
    );
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      // Create new message object
      const message = {
        id: this.selectedChat.messages.length + 1,
        senderId: this.user.id,
        receiverId: this.selectedChat.id,
        message: this.newMessage,
        timestamp: new Date(),
        isRead: false
      };

      // Add to UI
      this.selectedChat.messages.push(message);

      // Send via SignalR
      this.chatHubService.sendMessage(
        this.user.id,
        this.selectedChat.id,
        this.newMessage
      ).then(() => {
        console.log('Message sent successfully');
      }).catch(error => {
        this.toastr.error('Failed to send message');
        console.error('Error sending message:', error);
      });

      // Clear input
      this.newMessage = '';
    }
  }
}
