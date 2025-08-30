using Microsoft.AspNetCore.Mvc;

namespace CoCall.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecordingController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        public RecordingController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost("upload")]
        [RequestSizeLimit(200_000_000)] // ~200 MB
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("Empty file");

            var savePath = Path.Combine(_env.ContentRootPath, "Records");
            if (!Directory.Exists(savePath)) Directory.CreateDirectory(savePath);

            var filePath = Path.Combine(savePath, file.FileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new { filePath });
        }
    }
}
