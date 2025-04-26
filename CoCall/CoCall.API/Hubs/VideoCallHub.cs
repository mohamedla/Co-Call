using CoCall.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace CoCall.API.Hubs
{
    public class VideoCallHub: Hub
    {
        private readonly CoCallDbContext _context;

        public VideoCallHub(CoCallDbContext context)
        {
            _context = context;
        }
        public async Task EnterCall(int callId)
        {
            var call = await _context.VideoCalls.FirstOrDefaultAsync(c => c.Id == callId);

            if (call == null || !call.IsActive || call.ExpireAt < DateTime.UtcNow)
            {
                throw new HubException("The call is not active or has expired.");
            }

            string groupName = $"Call-{callId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} has joined the call.");
        }

        public async Task LeaveCall(int callId)
        {
            string groupName = $"Call-{callId}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} has left the call.");
        }

        public async Task EndCall(int callId, string enderId)
        {
            var call = await _context.VideoCalls.FirstOrDefaultAsync(c => c.Id == callId);

            if (call == null || !call.IsActive)
            {
                throw new HubException("The call is not active or does not exist.");
            }

            call.IsActive = false;
            call.EndedAt = DateTime.UtcNow;
            call.Ender = enderId;

            _context.VideoCalls.Update(call);
            await _context.SaveChangesAsync();

            string groupName = $"Call-{callId}";
            await Clients.Group(groupName).SendAsync("CallEnded", $"The call has been ended by {enderId}.");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task CheckAndExpireCalls()
        {
            var expiredCalls = await _context.VideoCalls
                .Where(c => c.IsActive && c.ExpireAt < DateTime.UtcNow)
                .ToListAsync();

            foreach (var call in expiredCalls)
            {
                call.IsActive = false;
                _context.VideoCalls.Update(call);

                string groupName = $"Call-{call.Id}";
                await Clients.Group(groupName).SendAsync("CallExpired", "The call has expired.");
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            }

            await _context.SaveChangesAsync();
        }

        public async Task SendCallInvitation(string caller, string callee)
        {
            // Notify the callee about the video call invitation
            await Clients.User(callee).SendAsync("ReceiveCallInvitation", caller);
        }
    }
}
