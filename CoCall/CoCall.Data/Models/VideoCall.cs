using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CoCall.Data.Models
{
    public class VideoCall
    {
        [Key]
        public int Id { get; set; }
        public string CallerId { get; set; }
        public string CalleeId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpireAt { get; set; }
        public DateTime EndedAt { get; set; }
        public string? Ender { get; set; }
        public bool IsActive { get; set; }
    }
}
