using MediatR;
using ParaZeka.Application.Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Application.Features.Transactions.Queries
{
    public record GetTransactionsListQuery : IRequest<Result<TransactionsListVm>>
    {
        public Guid? AccountId { get; init; }
        public Guid? CategoryId { get; init; }
        public DateTime? StartDate { get; init; }
        public DateTime? EndDate { get; init; }
        public int PageNumber { get; init; } = 1;
        public int PageSize { get; init; } = 10;
    }
}
