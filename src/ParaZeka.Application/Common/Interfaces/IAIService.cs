using ParaZeka.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Application.Common.Interfaces
{
    public interface IAIService
    {
        Task<Category> PredictCategoryAsync(Transaction transaction);
        Task<List<FinancialInsight>> GenerateInsightsAsync(Guid userId);
        Task<decimal> PredictMonthlyExpenseAsync(Guid userId, int monthsAhead = 1);
        Task<string> GetFinancialAdviceAsync(string question, Guid userId);
        Task<bool> DetectAnomalyAsync(Transaction transaction);
    }
}
