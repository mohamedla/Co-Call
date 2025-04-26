using Microsoft.AspNetCore.SignalR;

namespace CoCall.API.Hubs
{
    public class TextChatHub: Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();

            if (!string.IsNullOrEmpty(userId))
            {
                // Associate the connection with the user
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
                Console.WriteLine($"User {userId} connected with ConnectionId {Context.ConnectionId}");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();

            if (!string.IsNullOrEmpty(userId))
            {
                // Remove the connection from the user group
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
                Console.WriteLine($"User {userId} disconnected with ConnectionId {Context.ConnectionId}");
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string sender, string receiver, string message)
        {
            // Send message to the specific receiver
            await Clients.Group(receiver).SendAsync("ReceiveMessage", sender, message);
        }
    }
}
