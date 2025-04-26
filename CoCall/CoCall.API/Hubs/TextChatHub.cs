using Microsoft.AspNetCore.SignalR;

namespace CoCall.API.Hubs
{
    public class TextChatHub: Hub
    {
        public async Task SendMessage(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }
    }
}
