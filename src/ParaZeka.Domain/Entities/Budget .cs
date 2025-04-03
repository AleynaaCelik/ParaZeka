using ParaZeka.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Domain.Entities
{
    public class Budget : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public BudgetPeriod Period { get; set; }
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;
        public Guid? CategoryId { get; set; }
        public virtual Category? Category { get; set; }
        public string Currency { get; set; } = "TRY";
        public decimal SpentAmount { get; set; } // Running total of spent amount
    }

    public enum BudgetPeriod
    {
        Daily,
        Weekly,
        Monthly,
        Quarterly,
        Yearly
    }
}
