using ParaZeka.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Domain.Entities
{
   
        public class User : BaseEntity
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public bool EmailConfirmed { get; set; }
        public decimal MonthlyIncome { get; set; }
        public string Currency { get; set; } = "TRY";
        public virtual List<Account> Accounts { get; set; } = new List<Account>();
        public virtual List<Budget> Budgets { get; set; } = new List<Budget>();
        public virtual List<FinancialGoal> FinancialGoals { get; set; } = new List<FinancialGoal>();
    }

}
