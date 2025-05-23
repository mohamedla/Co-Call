﻿// <auto-generated />
using System;
using CoCall.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace CoCall.API.Migrations
{
    [DbContext(typeof(CoCallDbContext))]
    partial class CoCallDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("CoCall.Data.Models.TextChatMessage", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<bool>("IsRead")
                        .HasColumnType("bit");

                    b.Property<string>("Message")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("ReceiverId")
                        .HasColumnType("int");

                    b.Property<int>("SenderId")
                        .HasColumnType("int");

                    b.Property<DateTime>("Timestamp")
                        .HasColumnType("datetime2");

                    b.HasKey("Id");

                    b.HasIndex("ReceiverId");

                    b.HasIndex("SenderId");

                    b.ToTable("TextChatMessages");
                });

            modelBuilder.Entity("CoCall.Data.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserName")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("UserName")
                        .IsUnique();

                    b.ToTable("Users");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Name = "John Doe",
                            UserName = "johndoe"
                        },
                        new
                        {
                            Id = 2,
                            Name = "Jane Doe",
                            UserName = "janedoe"
                        },
                        new
                        {
                            Id = 3,
                            Name = "John Smith",
                            UserName = "johnsmith"
                        });
                });

            modelBuilder.Entity("CoCall.Data.Models.VideoCall", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("CalleeId")
                        .HasColumnType("int");

                    b.Property<int>("CallerId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("EndedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("Ender")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("ExpireAt")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.HasKey("Id");

                    b.HasIndex("CalleeId");

                    b.HasIndex("CallerId");

                    b.ToTable("VideoCalls");
                });

            modelBuilder.Entity("CoCall.Data.Models.TextChatMessage", b =>
                {
                    b.HasOne("CoCall.Data.Models.User", "Receiver")
                        .WithMany("ReceiverTextChatMessags")
                        .HasForeignKey("ReceiverId")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.HasOne("CoCall.Data.Models.User", "Sender")
                        .WithMany("SenderTextChatMessags")
                        .HasForeignKey("SenderId")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.Navigation("Receiver");

                    b.Navigation("Sender");
                });

            modelBuilder.Entity("CoCall.Data.Models.VideoCall", b =>
                {
                    b.HasOne("CoCall.Data.Models.User", "Callee")
                        .WithMany("CalleeVideoCalls")
                        .HasForeignKey("CalleeId")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.HasOne("CoCall.Data.Models.User", "Caller")
                        .WithMany("CallerVideoCalls")
                        .HasForeignKey("CallerId")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.Navigation("Callee");

                    b.Navigation("Caller");
                });

            modelBuilder.Entity("CoCall.Data.Models.User", b =>
                {
                    b.Navigation("CalleeVideoCalls");

                    b.Navigation("CallerVideoCalls");

                    b.Navigation("ReceiverTextChatMessags");

                    b.Navigation("SenderTextChatMessags");
                });
#pragma warning restore 612, 618
        }
    }
}
