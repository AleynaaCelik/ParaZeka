using ParaZeka.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Domain.Entities
{
    public class FinancialInsight : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public InsightType Type { get; set; }
        public InsightSeverity Severity { get; set; }
        public bool IsRead { get; set; }
        public bool IsDismissed { get; set; }
        public DateTime ValidUntil { get; set; }
        public string? ActionText { get; set; }
        public string? ActionUrl { get; set; }
        public decimal? AmountImpact { get; set; }
        public string? Currency { get; set; }
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;
    }

    public enum InsightType
    {
        SpendingPattern,
        SavingOpportunity,
        BudgetAlert,
        UnusualActivity,
        FinancialTip,
        GoalProgress
    }

    public enum InsightSeverity
    {
        Low,
        Medium,
        High
    }
}

