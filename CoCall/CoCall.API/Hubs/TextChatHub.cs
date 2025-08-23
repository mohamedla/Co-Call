using CoCall.Data;
using CoCall.Data.Models;
using Microsoft.AspNetCore.SignalR;

namespace CoCall.API.Hubs
{
    public class TextChatHub: Hub
    {
        private readonly CoCallDbContext _context;

        public TextChatHub(CoCallDbContext context)
        {
            _context = context;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.GetHttpContext()?.Request.Query["access_token"].ToString();

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
            var userId = Context.GetHttpContext()?.Request.Query["access_token"].ToString();

            if (!string.IsNullOrEmpty(userId))
            {
                // Remove the connection from the user group
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
                Console.WriteLine($"User {userId} disconnected with ConnectionId {Context.ConnectionId}");
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(int sender, int receiver, string message)
        {
            _context.TextChatMessages.Add(new TextChatMessage
            {
                SenderId = sender,
                ReceiverId = receiver,
                Message = message,
                Timestamp = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
            // Send message to the specific receiver
            await Clients.Group(receiver.ToString()).SendAsync("ReceiveMessage", sender, message);
        }
    }
}
