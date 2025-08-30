using CoCall.Data.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace CoCall.Data
{
    public class CoCallDbContext: DbContext
    {
        public DbSet<TextChatMessage> TextChatMessages { get; set; }
        public DbSet<VideoCall> VideoCalls { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<ErrorDetails> ErrorsDetails { get; set; }

        public CoCallDbContext(DbContextOptions<CoCallDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasIndex( u => u.UserName).IsUnique();
            modelBuilder.Entity<User>().HasKey( u => u.Id);

            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, UserName = "johndoe", Name = "John Doe" },
                new User { Id = 2, UserName = "janedoe", Name = "Jane Doe" },
                new User { Id = 3, UserName = "johnsmith", Name = "John Smith" }
            );

            modelBuilder.Entity<User>()
                .HasMany(e => e.SenderTextChatMessags)
                .WithOne(e => e.Sender)
                .OnDelete(DeleteBehavior.NoAction)
                .HasForeignKey(e => e.SenderId)
                .HasPrincipalKey(e => e.Id);

            modelBuilder.Entity<User>()
                .HasMany(e => e.ReceiverTextChatMessags)
                .WithOne(e => e.Receiver)
                .OnDelete(DeleteBehavior.NoAction)
                .HasForeignKey(e => e.ReceiverId)
                .HasPrincipalKey(e => e.Id);

            modelBuilder.Entity<User>()
                .HasMany(e => e.CallerVideoCalls)
                .WithOne(e => e.Caller)
                .OnDelete(DeleteBehavior.NoAction)
                .HasForeignKey(e => e.CallerId)
                .HasPrincipalKey(e => e.Id);

            modelBuilder.Entity<User>()
                .HasMany(e => e.CalleeVideoCalls)
                .WithOne(v => v.Callee)
                .OnDelete(DeleteBehavior.NoAction)
                .HasForeignKey(v => v.CalleeId)
                .HasPrincipalKey(v => v.Id);

            modelBuilder.Entity<User>()
                .HasMany(e => e.Notifications)
                .WithOne(noti => noti.user)
                .OnDelete(DeleteBehavior.NoAction)
                .HasForeignKey(noti => noti.UserId)
                .HasPrincipalKey(noti => noti.Id);

        }
    }
}
