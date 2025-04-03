using ParaZeka.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Domain.Entities
{
    public class FinancialGoal : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal TargetAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime TargetDate { get; set; }
        public GoalStatus Status { get; set; }
        public string Currency { get; set; } = "TRY";
        public string? IconName { get; set; }
        public string ColorHex { get; set; } = "#000000";
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;
    }

    public enum GoalStatus
    {
        Active,
        Completed,
        Abandoned
    }
}
