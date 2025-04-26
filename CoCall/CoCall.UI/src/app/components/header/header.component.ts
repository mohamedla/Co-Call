import { Component } from '@angular/core';
import { NotificationHubService } from '../../services/notification-hub.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  notificationCount = 0;
  userId = '12345'; // Example user ID

  constructor(
    private toastr: ToastrService,
    private notificationHubService: NotificationHubService
  ) {}

  ngOnInit() {
    this.notificationHubService.startConnection(this.userId);
    this.notificationHubService.onReceiveNotification((message: string) => {
      this.notificationCount++;
      this.toastr.info(message, 'New Notification', { timeOut: 3000 });
    });
  }

  showNotifications() {
    this.toastr.info('Show notifications list here.', 'Notifications');
  }
}
