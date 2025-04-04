using Microsoft.EntityFrameworkCore;
using ParaZeka.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<User> Users { get; }
        DbSet<Account> Accounts { get; }
        DbSet<Transaction> Transactions { get; }
        DbSet<Category> Categories { get; }
        DbSet<Budget> Budgets { get; }
        DbSet<FinancialGoal> FinancialGoals { get; }
        DbSet<FinancialInsight> FinancialInsights { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
