using CoCall.Data;
using CoCall.Data.DTOs;
using CoCall.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoCall.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TextChatController : ControllerBase
    {
        private readonly CoCallDbContext _context;
        public TextChatController(CoCallDbContext context)
        {
            _context = context;
        }

        [HttpPost(nameof(GetChatMessage))]
        public async Task<IActionResult> GetChatMessage([FromBody] ChatOwner owner)
        {
            var chat = await _context.TextChatMessages
                .Where(c => (c.SenderId == owner.OwnerId || c.ReceiverId == owner.OwnerId) && (c.SenderId == owner.UserId || c.ReceiverId == owner.UserId))
                .ToListAsync();
            return Ok(chat);
        }

        [HttpPost("MarkChatAsRead")]
        public async Task<IActionResult> MarkChatAsRead([FromBody] ChatOwner owner)
        {
            var messages = await _context.TextChatMessages
                .Where(c => (c.SenderId == owner.OwnerId || c.ReceiverId == owner.OwnerId) && (c.SenderId == owner.UserId || c.ReceiverId == owner.UserId) && c.IsRead == false)
                .ToListAsync();
            messages.ForEach(m => m.IsRead = true);
            _context.TextChatMessages.UpdateRange(messages);
            await _context.SaveChangesAsync();
            return Ok(true);
        }

        [HttpPost(nameof(SendMessage))]
        public async Task<IActionResult> SendMessage([FromBody] TextChatMessageAddDto message)
        {
            TextChatMessage textChatMessage = new TextChatMessage
            {
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                Message = message.Message,
                Timestamp = DateTime.UtcNow,
                IsRead = false
            };
            return Ok(true);
        }
    }
}
