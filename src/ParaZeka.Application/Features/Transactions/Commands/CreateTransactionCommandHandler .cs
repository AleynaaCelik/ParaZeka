using MediatR;
using ParaZeka.Application.Common.Interfaces;
using ParaZeka.Application.Common.Models;
using ParaZeka.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Application.Features.Transactions.Commands
{
    public class CreateTransactionCommandHandler : IRequestHandler<CreateTransactionCommand, Result<Guid>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAIService _aiService;

        public CreateTransactionCommandHandler(
            IApplicationDbContext context,
            ICurrentUserService currentUserService,
            IAIService aiService)
        {
            _context = context;
            _currentUserService = currentUserService;
            _aiService = aiService;
        }

        public async Task<Result<Guid>> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
        {
            // Validate account ownership
            var account = await _context.Accounts.FindAsync(new object[] { request.AccountId }, cancellationToken);

            if (account == null)
            {
                return Result<Guid>.Failure("Account not found.");
            }

            if (account.UserId != _currentUserService.UserId)
            {
                return Result<Guid>.Failure("You don't have permission to add transactions to this account.");
            }

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                Amount = request.Amount,
                TransactionDate = request.TransactionDate,
                Description = request.Description,
                Type = request.Type,
                AccountId = request.AccountId,
                CategoryId = request.CategoryId,
                IsRecurring = request.IsRecurring,
                RecurrencePattern = request.RecurrencePattern,
                Currency = account.Currency,
                MerchantName = request.MerchantName,
                Location = request.Location,
                CreatedDate = DateTime.UtcNow
            };

            // If no category provided, use AI to predict category
            if (transaction.CategoryId == null)
            {
                try
                {
                    var predictedCategory = await _aiService.PredictCategoryAsync(transaction);
                    transaction.CategoryId = predictedCategory.Id;
                }
                catch (Exception)
                {
                    // If AI prediction fails, continue without category
                }
            }

            // Update account balance
            if (transaction.Type == TransactionType.Income)
            {
                account.Balance += transaction.Amount;
            }
            else if (transaction.Type == TransactionType.Expense)
            {
                account.Balance -= transaction.Amount;
            }

            // Check for unusual activity
            try
            {
                bool isAnomaly = await _aiService.DetectAnomalyAsync(transaction);
                if (isAnomaly)
                {
                    // Create insight for unusual activity
                    var insight = new FinancialInsight
                    {
                        Id = Guid.NewGuid(),
                        Title = "Unusual Transaction Detected",
                        Description = $"We detected an unusual transaction of {transaction.Amount} {transaction.Currency} for {transaction.Description}.",
                        Type = InsightType.UnusualActivity,
                        Severity = InsightSeverity.Medium,
                        IsRead = false,
                        IsDismissed = false,
                        ValidUntil = DateTime.UtcNow.AddDays(7),
                        AmountImpact = transaction.Amount,
                        Currency = transaction.Currency,
                        UserId = account.UserId,
                        CreatedDate = DateTime.UtcNow
                    };

                    _context.FinancialInsights.Add(insight);
                }
            }
            catch (Exception)
            {
                // If anomaly detection fails, continue without creating an insight
            }

            _context.Transactions.Add(transaction);
            account.LastModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(transaction.Id);
        }
    }
}
