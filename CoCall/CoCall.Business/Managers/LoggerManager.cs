using Contracts;
using NLog;

namespace CoCall.Business.Managers
{
    public class LoggerManager : ILoggerManager
    {
        private static ILogger logger = LogManager.GetCurrentClassLogger();

        public LoggerManager()
        {

        }

        public void LogDebug(string messege)
        {
            logger.Debug(messege);
        }

        public void LogError(string messege)
        {
            logger.Error(messege);
        }

        public void LogInfo(string messege)
        {
            logger.Info(messege);
        }

        public void LogWarn(string messege)
        {
            logger.Warn(messege);
        }
    }
}
