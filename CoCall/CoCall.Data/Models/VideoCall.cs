using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CoCall.Data.Models
{
    public class VideoCall
    {
        public int Id { get; set; }
        public string CallerId { get; set; }
        public string CalleeId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }
}
