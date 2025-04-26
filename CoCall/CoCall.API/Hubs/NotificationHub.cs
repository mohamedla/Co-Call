using Microsoft.AspNetCore.SignalR;

namespace CoCall.API.Hubs
{
    public class NotificationHub: Hub
    {
        public async Task SendNotification(string userId, string message)
        {
            // Send notification to the specific user
            await Clients.User(userId).SendAsync("ReceiveNotification", message);
        }
    }
}
