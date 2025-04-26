using CoCall.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoCall.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly CoCallDbContext _context;

        public UserController(CoCallDbContext context)
        {
            _context = context;
        }

        [HttpGet("verify")]
        public async Task<IActionResult> VerifyUser(string username)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserName == username);

            if (userExists)
            {
                return Ok(new { Exists = true });
            }

            return NotFound(new { Exists = false, Message = "User not found." });
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(new { Message = "Search query cannot be empty." });
            }

            var users = await _context.Users
                .Where(u => u.Name.Contains(query))
                .Select(u => new { u.UserName, u.Name })
                .ToListAsync();

            return Ok(users);
        }
    }
}
