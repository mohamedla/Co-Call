using CoCall.Data;
using CoCall.Data.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CoCall.Business.Business
{
    class TextChatBL
    {
        private readonly CoCallDbContext _context;
        public TextChatBL(CoCallDbContext context)
        {
            _context = context;
        }

        
    }
}
