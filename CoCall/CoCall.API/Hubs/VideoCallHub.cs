using Microsoft.AspNetCore.SignalR;

namespace CoCall.API.Hubs
{
    public class VideoCallHub: Hub
    {
        //public async Task SendMessage(string message)
        //{
        //    await Clients.All.SendAsync("ReceiveMessage", message);
        //}
        //public async Task JoinGroup(string groupName)
        //{
        //    await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        //    await Clients.Group(groupName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} has joined the group {groupName}");
        //}
        //public async Task LeaveGroup(string groupName)
        //{
        //    await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        //    await Clients.Group(groupName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} has left the group {groupName}");
        //}
        public async Task SendCallInvitation(string caller, string callee)
        {
            // Notify the callee about the video call invitation
            await Clients.User(callee).SendAsync("ReceiveCallInvitation", caller);
        }
    }
}
