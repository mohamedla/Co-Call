using CoCall.Data;
using Microsoft.Extensions.Hosting;

namespace CoCall.API.Services
{
    public class TextMessageCleanupService: BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public TextMessageCleanupService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<CoCallDbContext>();
                    var cutoffDate = DateTime.UtcNow.AddDays(-7);

                    var oldMessages = context.TextChatMessages.Where(m => m.Timestamp < cutoffDate);
                    context.TextChatMessages.RemoveRange(oldMessages);

                    await context.SaveChangesAsync();
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken); // Run daily
            }
        }
    }
}
