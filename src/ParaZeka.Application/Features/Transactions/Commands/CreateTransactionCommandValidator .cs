using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Application.Features.Transactions.Commands
{
    public class CreateTransactionCommandValidator : AbstractValidator<CreateTransactionCommand>
    {
        public CreateTransactionCommandValidator()
        {
            RuleFor(v => v.Amount)
                .NotEmpty().WithMessage("Amount is required.")
                .GreaterThan(0).WithMessage("Amount must be greater than zero.");

            RuleFor(v => v.TransactionDate)
                .NotEmpty().WithMessage("Transaction date is required.")
                .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Transaction date cannot be in the future.");

            RuleFor(v => v.Description)
                .MaximumLength(200).WithMessage("Description must not exceed 200 characters.");

            RuleFor(v => v.Type)
                .IsInEnum().WithMessage("Invalid transaction type.");

            RuleFor(v => v.AccountId)
                .NotEmpty().WithMessage("Account is required.");

            RuleFor(v => v.RecurrencePattern)
                .Must(pattern => pattern == null ||
                                 pattern == "Daily" ||
                                 pattern == "Weekly" ||
                                 pattern == "Monthly" ||
                                 pattern == "Yearly")
                .When(v => v.IsRecurring)
                .WithMessage("Valid recurrence pattern is required for recurring transactions.");
        }
    }
}
