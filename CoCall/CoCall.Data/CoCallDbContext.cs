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
        public CoCallDbContext(DbContextOptions<CoCallDbContext> options) : base(options) { }
    }
}
