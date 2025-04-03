using ParaZeka.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Domain.Entities
{
    public class Transaction : BaseEntity
    {
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public TransactionType Type { get; set; }
        public Guid AccountId { get; set; }
        public virtual Account Account { get; set; } = null!;
        public Guid? CategoryId { get; set; }
        public virtual Category? Category { get; set; }
        public bool IsRecurring { get; set; }
        public string? RecurrencePattern { get; set; } // Monthly, Weekly, etc.
        public string Currency { get; set; } = "TRY";
        public string? MerchantName { get; set; }
        public string? Location { get; set; }
    }

    public enum TransactionType
    {
        Income,
        Expense,
        Transfer
    }
}

