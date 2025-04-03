using ParaZeka.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;

namespace ParaZeka.Domain.Entities
{
    public class Account : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public string AccountType { get; set; } = string.Empty; // Checking, Savings, Credit Card, etc.
        public string Currency { get; set; } = "TRY";
        public bool IsActive { get; set; } = true;
        public string? BankName { get; set; }
        public string? AccountNumber { get; set; }
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;
        public virtual List<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
