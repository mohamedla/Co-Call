import { Component, OnInit, Renderer2 } from '@angular/core';
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
export class HeaderComponent implements OnInit {
  notificationCount = 0;
  showNotificationPanel = false;
  notifications: Notification[] = [];
  isDarkTheme = false;
  userId = '12345'; // Example user ID

  constructor(
    private toastr: ToastrService,
    private notificationHubService: NotificationHubService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Check if dark theme was previously selected
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';

    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme');
    }

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

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;

    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}
