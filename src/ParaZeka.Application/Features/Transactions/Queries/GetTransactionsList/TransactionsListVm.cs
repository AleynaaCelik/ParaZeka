using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Application.Features.Transactions.Queries.GetTransactionsList
{
    public class TransactionsListVm
    {
        public List<TransactionDto> Transactions { get; set; } = new List<TransactionDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

}
