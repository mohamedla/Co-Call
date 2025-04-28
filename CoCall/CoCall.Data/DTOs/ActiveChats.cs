using CoCall.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CoCall.Data.DTOs
{
    public class ActiveChats
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public List<TextChatMessageDto> Messages { get; set; } = new List<TextChatMessageDto>();
    }
}
