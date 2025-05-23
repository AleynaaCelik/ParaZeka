﻿using ParaZeka.Domain.Common;
using ParaZeka.Domain.Entities.Enum;
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

        // Eksik özellikler
        public bool IsRead { get; set; } = false;
        public bool IsDismissed { get; set; } = false;
        public DateTime? ValidUntil { get; set; }
        public decimal? AmountImpact { get; set; }
        public string Currency { get; set; } = "TRY";
    }

    public enum InsightType
    {
        BudgetAlert,
        SpendingPattern,
        SavingOpportunity,
        Anomaly,
        UnusualActivity // Enum'a eklenmesi gereken bir değer
    }
}

