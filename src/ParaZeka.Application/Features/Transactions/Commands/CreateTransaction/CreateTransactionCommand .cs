using MediatR;
using ParaZeka.Application.Common.Models;
using ParaZeka.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Application.Features.Transactions.Commands.CreateTransaction
{
    public record CreateTransactionCommand : IRequest<Result<Guid>>
    {
        public decimal Amount { get; init; }
        public DateTime TransactionDate { get; init; }
        public string Description { get; init; } = string.Empty;
        public TransactionType Type { get; init; }
        public Guid AccountId { get; init; }
        public Guid? CategoryId { get; init; }
        public bool IsRecurring { get; init; }
        public string? RecurrencePattern { get; init; }
        public string? MerchantName { get; init; }
        public string? Location { get; init; }
    }
}
