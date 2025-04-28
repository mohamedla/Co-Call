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
    public class TextChatMessage: TextChatMessageDto
    {
        public virtual User Sender { get; set; }
        public virtual User Receiver { get; set; }
    }
}
