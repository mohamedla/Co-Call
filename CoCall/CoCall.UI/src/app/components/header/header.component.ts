import { Component } from '@angular/core';
import { NotificationHubService } from '../../services/notification-hub.service';
import { ToastrService } from 'ngx-toastr';

interface Notification {
  id: number;
  message: string;
  timestamp: Date;
  isRead: boolean;
};

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  notifications: Notification[] = [
    { id: 1, message: 'New message from User1', timestamp: new Date(), isRead: false },
    { id: 2, message: 'New comment on your post', timestamp: new Date(), isRead: false },
    { id: 3, message: 'User2 liked your photo', timestamp: new Date(), isRead: false }
  ];
  userId = '12345'; // Example user ID
  showNotificationPanel = false;

  constructor(
    private toastr: ToastrService,
    private notificationHubService: NotificationHubService
  ) {}

  ngOnInit() {
    this.notificationHubService.startConnection(this.userId);
    this.notificationHubService.onReceiveNotification((message: string) => {
      this.notifications.push({
        id: this.notifications.length + 1,
        message: message,
        timestamp: new Date(),
        isRead: false
      });
      this.toastr.info(message, 'New Notification', { timeOut: 3000 });
    });
  }

  toggleNotifications() {
    this.showNotificationPanel = !this.showNotificationPanel;
    // const notificationList = document.getElementById('notification-list');
    // if (notificationList) {
    //   notificationList.classList.toggle('show');
    // }
  }

  showNotifications() {
    this.toastr.info('Show notifications list here.', 'Notifications');
  }

  markAsRead(notification: Notification) {
    notification.isRead = true;
    this.toastr.success('All notifications marked as read.', 'Success', { timeOut: 3000 });
  }

  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
    this.toastr.success('All notifications marked as read.', 'Success', { timeOut: 3000 });
  }
}
