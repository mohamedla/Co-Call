using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CoCall.Data.Models
{
    public class VideoCall
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int CallerId { get; set; }
        [Required]
        public int CalleeId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpireAt { get; set; }
        public DateTime EndedAt { get; set; }
        public string? Ender { get; set; }
        public bool IsActive { get; set; }
        public virtual User Caller { get; set; }
        public virtual User Callee { get; set; }
    }
}
