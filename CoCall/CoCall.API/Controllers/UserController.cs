using AutoMapper;
using CoCall.Data;
using CoCall.Data.DTOs;
using CoCall.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoCall.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly CoCallDbContext _context;
        private readonly IMapper _mapper;

        public UserController(IMapper mapper, CoCallDbContext context)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("verify")]
        public async Task<IActionResult> VerifyUser(string username)
        {
            var user = await _context.Users.Where(u => u.UserName == username).FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { Exists = false, Message = "User not found." });

            return Ok(_mapper.Map<UserDto>(user));

        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(new { Message = "Search query cannot be empty." });
            }

            var users = await _context.Users
                .Where(u => u.Name.Contains(query) || u.UserName.Contains(query))
                .Select(u => _mapper.Map<UserDto>(u))
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new { u.Id, u.UserName, u.Name})
                .FirstOrDefaultAsync();
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }
            return Ok(user);
        }

        [HttpGet("getactivechats/{id}")]
        public async Task<IActionResult> GetActiveChats(int id)
        {
            var users = _context.Users
                .Include(List => List.SenderTextChatMessags)
                .Include(List => List.ReceiverTextChatMessags)
                .Where(u => u.Id == id && (u.SenderTextChatMessags.Any(tc => tc.SenderId == id) || u.ReceiverTextChatMessags.Any(tc => tc.ReceiverId == id)))
                .Select(u => new ActiveChats()
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    Name = u.Name,
                    Messages = u.SenderTextChatMessags
                        .Union(u.ReceiverTextChatMessags)
                        //.Where(tc => (tc.SenderId == id && tc.ReceiverId == u.Id) || (tc.SenderId == u.Id && tc.ReceiverId == id))
                        .OrderByDescending(tc => tc.Timestamp)
                        .Select(tc => new TextChatMessageDto()
                        {
                            SenderId = tc.SenderId,
                            ReceiverId = tc.ReceiverId,
                            Message = tc.Message,
                            Timestamp = tc.Timestamp
                        })
                        .ToList()
                })
                .ToList();

            return Ok(users);
        }

        //[HttpGet("getactiverooms/{id}")]
        //public async Task<IActionResult> GetActiveRooms(int id)
        //{
        //    var users = _context.Users
        //        .Include(List => List.ActiveTextChat)
        //        .Where(u => u.ActiveVideoCalls.Any(tc => (tc.CalleeId == id || tc.CalleeId == id) && tc.IsActive == true))
        //        .Select(u => _mapper.Map<UserDto>(u))
        //        .ToList();

        //    return Ok(users);
        //}
    }
}
