using CoCall.Data;
using CoCall.Data.DTOs.WebRTC;
using CoCall.Data.Models;
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

        public async Task SendCallInvitation(int callId)
        {
            var call = _context.VideoCalls.Include(c => c.Callee).Include(c => c.Caller).First(c => c.Id == callId);
            if (call == null) return;

            await Clients.Group(call.Callee.UserName).SendAsync("ReceiveCallInvitation", call.Caller.Name);
        }

        public async Task SendOffer(int callId, RtcSessionDescriptionDto offer)
        {
            await Clients.OthersInGroup($"Call-{callId}")
                .SendAsync("ReceiveOffer", offer);
        }

        public async Task SendAnswer(int callId, RtcSessionDescriptionDto answer)
        {
            await Clients.OthersInGroup($"Call-{callId}")
                .SendAsync("ReceiveAnswer", answer);
        }

        public async Task SendIceCandidate(int callId, RtcIceCandidateDto candidate)
        {
            await Clients.OthersInGroup($"Call-{callId}")
                .SendAsync("ReceiveIceCandidate", candidate);
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
    }
}
