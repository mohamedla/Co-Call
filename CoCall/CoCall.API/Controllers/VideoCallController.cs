using CoCall.Data;
using CoCall.Data.Models;
using Microsoft.AspNetCore.Mvc;

namespace CoCall.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VideoCallController : ControllerBase
    {
        private readonly CoCallDbContext _context;
        public VideoCallController(CoCallDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateCall(string callerId, string calleeId)
        {
            var call = new VideoCall
            {
                CallerId = callerId,
                CalleeId = calleeId,
                CreatedAt = DateTime.UtcNow,
                ExpireAt = DateTime.UtcNow.AddHours(1),
                IsActive = true
            };

            _context.VideoCalls.Add(call);
            await _context.SaveChangesAsync();

            return Ok(call);
        }

        [HttpGet("verify")]
        public IActionResult VerifyParticipant(int callId, string userId)
        {
            var call = _context.VideoCalls.FirstOrDefault(c => c.Id == callId);

            if (call == null || (!call.CallerId.Equals(userId) && !call.CalleeId.Equals(userId)))
            {
                return Unauthorized("User is not a participant of this call.");
            }

            return Ok("User is verified.");
        }
    }
}
