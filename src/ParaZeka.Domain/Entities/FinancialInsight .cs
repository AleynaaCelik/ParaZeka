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
        public bool IsAIGenerated { get; set; } = false;
    }

    public enum InsightType
    {
        BudgetAlert,
        SpendingPattern,
        SavingOpportunity,
        Anomaly
    }

    public enum InsightSeverity
    {
        Low,
        Medium,
        High
    }
}

