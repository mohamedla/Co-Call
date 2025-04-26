using CoCall.Data.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CoCall.Data
{
    public class CoCallDbContext: DbContext
    {
        public DbSet<TextChatMessage> TextChatMessages { get; set; }
        public DbSet<VideoCall> VideoCalls { get; set; }

        public CoCallDbContext(DbContextOptions<CoCallDbContext> options) : base(options) { }
    }
}
