using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contracts
{
    public interface ILoggerManager
    {
        void LogInfo(string messege);
        void LogDebug(string messege);
        void LogWarn(string messege);
        void LogError(string messege);
    }
}
