using CoCall.Data.DTOs;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CoCall.Data.Models
{
    public class User: UserDto
    {
        public virtual List<VideoCall> CallerVideoCalls { get; set; }
        public virtual List<VideoCall> CalleeVideoCalls { get; set; }
        public virtual List<TextChatMessage> SenderTextChatMessags { get; set; }
        public virtual List<TextChatMessage> ReceiverTextChatMessags { get; set; }
    }
}
