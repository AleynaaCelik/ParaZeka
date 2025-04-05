using AutoMapper;
using MediatR;
using ParaZeka.Application.Common.Interfaces;
using ParaZeka.Application.Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Application.Features.Transactions.Queries
{
    public class GetTransactionsListQueryHandler : IRequestHandler<GetTransactionsListQuery, Result<TransactionsListVm>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public GetTransactionsListQueryHandler(
            IApplicationDbContext context,
            IMapper mapper,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<Result<TransactionsListVm>> Handle(GetTransactionsListQuery request, CancellationToken cancellationToken)
        {
            if (_currentUserService.UserId == null)
            {
                return Result<TransactionsListVm>.Failure("User not authenticated.");
            }

            var userId = _currentUserService.UserId.Value;

            // Start with user's transactions through accounts
            var query = _context.Transactions
                .Include(t => t.Account)
                .Include(t => t.Category)
                .Where(t => t.Account.UserId == userId);

            // Apply filters
            if (request.AccountId.HasValue)
            {
                query = query.Where(t => t.AccountId == request.AccountId.Value);
            }

            if (request.CategoryId.HasValue)
            {
                query = query.Where(t => t.CategoryId == request.CategoryId.Value);
            }

            if (request.StartDate.HasValue)
            {
                query = query.Where(t => t.TransactionDate >= request.StartDate.Value);
            }

            if (request.EndDate.HasValue)
            {
                query = query.Where(t => t.TransactionDate <= request.EndDate.Value);
            }

            // Order by date descending (newest first)
            query = query.OrderByDescending(t => t.TransactionDate);

            // Get total count for pagination
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var transactions = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ProjectTo<TransactionDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            var vm = new TransactionsListVm
            {
                Transactions = transactions,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
            };

            return Result<TransactionsListVm>.Success(vm);
        }
    }
}
