using System;
using CoCall.API.Hubs;
using CoCall.API.Services;
using CoCall.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<CoCallDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("CoCall") ?? throw new InvalidOperationException("Can't found CoCall Connection String While Working With Repository."), b => b.MigrationsAssembly("CoCall.API")));

builder.Services.AddHostedService<TextMessageCleanupService>();
builder.Services.AddHostedService<CallExpiryService>();

builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}


app.UseCors();
app.MapHub<TextChatHub>("/hubs/textchat");
app.MapHub<VideoCallHub>("/hubs/videocall");
app.MapHub<NotificationHub>("/hubs/notification");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
