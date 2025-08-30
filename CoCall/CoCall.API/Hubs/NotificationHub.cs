using CoCall.Data;
using CoCall.Data.Models;
using Microsoft.AspNetCore.SignalR;

namespace CoCall.API.Hubs
{
    public class NotificationHub: Hub
    {
        private readonly CoCallDbContext _context;
        public NotificationHub(CoCallDbContext context)
        {
            _context = context;
        }
        public override async Task OnConnectedAsync()
        {
            
            var userName = Context.GetHttpContext()?.Request.Query["access_token"].ToString();

            if (!string.IsNullOrEmpty(userName))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userName);
                Console.WriteLine($"User {userName} connected to NotificationHub");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
                Console.WriteLine($"User {userId} disconnected from NotificationHub");
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendNotification(string username, string title, string description)
        {
            var user = _context.Users.First(u => u.UserName == username);
            if (user == null) return;
            var newNoti = new Data.Models.Notification
            {
                UserId = user.Id,
                Title = title,
                Description = description,
            };
            _context.Notifications.Add(newNoti);
            _context.SaveChanges();
            await Clients.Group(user.UserName).SendAsync("ReceiveNotification", newNoti);
        }

        public async Task ReadNotification(int notId)
        {
            var noti = _context.Notifications.First(n => n.Id == notId && !n.IsReaded);
            if (noti == null) return;
            noti.IsReaded = true;
            _context.Notifications.Update(noti);
        }
    }
}
