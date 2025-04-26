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
        public DbSet<User> Users { get; set; }

        public CoCallDbContext(DbContextOptions<CoCallDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasIndex( u => u.UserName).IsUnique();
            modelBuilder.Entity<User>().HasKey( u => u.UserName);

            modelBuilder.Entity<User>().HasData(
                new User { UserName = "johndoe", Name = "John Doe" },
                new User { UserName = "janedoe", Name = "Jane Doe" },
                new User { UserName = "johnsmith", Name = "John Smith" }
            );
        }
    }
}
