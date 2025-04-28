using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CoCall.Data.DTOs
{
    public class TextChatMessageDto
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int SenderId { get; set; }
        [Required]
        public int ReceiverId { get; set; }
        [Required]
        public string Message { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
    }
}
