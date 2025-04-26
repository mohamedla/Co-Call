using CoCall.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace CoCall.API.Services
{
    public class CallExpiryService: BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public CallExpiryService(IServiceProvider serviceProvider)
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
                    var expiredCalls = await context.VideoCalls
                        .Where(c => c.IsActive && c.ExpireAt < DateTime.UtcNow)
                        .ToListAsync();

                    foreach (var call in expiredCalls)
                    {
                        call.IsActive = false;
                        context.VideoCalls.Update(call);
                    }

                    await context.SaveChangesAsync();
                }

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken); // Check every 5 minutes
            }
        }
    }
}
