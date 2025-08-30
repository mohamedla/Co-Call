import { Component, OnInit, Renderer2 } from '@angular/core';
import { NotificationHubService } from '../../services/notification-hub.service';
import { ToastrService } from 'ngx-toastr';
import { Notification } from '../../models/Notification';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  notificationCount = 0;
  showNotificationPanel = false;
  notifications: Notification[] = [
    {
      id: 1,
      title: 'Welcome',
      description: 'Welcome to the app!',
      timeStamp: new Date(),
      isReaded: false
    }
  ];
  isDarkTheme = false;
  userId = 4; // Example user ID

  userName = 'johnsmith';

  constructor(
    private toastr: ToastrService,
    private notificationHubService: NotificationHubService,
    private renderer: Renderer2,
    public route: ActivatedRoute,
    private userService: UserService,
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.userName = params['username'] || this.userName;
    });

    // Check if dark theme was previously selected
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';

    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme');
    }

    this.userService.verifyUser(this.userName).subscribe(
      (response) => {
        // Load Notifications
        this.userService.getNotifications(this.userId).subscribe(
          (response) => {
            this.notifications = response;
          },
          (error) => {
            this.toastr.error('Error getting active chats');
            console.error('Error getting active chats:', error);
          }
        );

        this.userId = response.id;
        this.notificationHubService.startConnection(this.userName);
        this.notificationHubService.onReceiveNotification((noti: Notification): void => {
          this.notifications.push(noti);
          this.toastr.info(noti.description, noti.title, { timeOut: 3000 });
        });
    });

  }

  toggleNotifications() {
    this.showNotificationPanel = !this.showNotificationPanel;
  }

  showNotifications() {
    this.toastr.info('Show notifications list here.', 'Notifications');
  }

  getNumberOfUnreadNotifications(): number {
    return this.notifications.filter(notification => !notification.isReaded).length;
  }

  markAsRead(notification: Notification) {
    this.notificationHubService.readNotification(notification.id);
    notification.isReaded = true;
    this.toastr.success('Notification marked as read.', 'Success', { timeOut: 3000 });
  }

  markAllAsRead() {
    this.notifications.forEach(notification => {
      this.notificationHubService.readNotification(notification.id);
      notification.isReaded = true;
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
