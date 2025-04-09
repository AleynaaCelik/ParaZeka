using AutoMapper;
using ParaZeka.Application.Common.Mappings;
using ParaZeka.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Application.Features.Transactions.Queries.GetTransactionsList
{
    public class TransactionDto : IMapFrom<Transaction>
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public TransactionType Type { get; set; }
        public string TransactionTypeName => Type.ToString();
        public Guid AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public Guid? CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryColor { get; set; } = string.Empty;
        public string CategoryIcon { get; set; } = string.Empty;
        public bool IsRecurring { get; set; }
        public string? RecurrencePattern { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string? MerchantName { get; set; }
        public string? Location { get; set; }
        public DateTime CreatedDate { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Transaction, TransactionDto>()
                .ForMember(d => d.AccountName, opt => opt.MapFrom(s => s.Account.Name))
                .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category != null ? s.Category.Name : "Uncategorized"))
                .ForMember(d => d.CategoryColor, opt => opt.MapFrom(s => s.Category != null ? s.Category.ColorHex : "#CCCCCC"))
                .ForMember(d => d.CategoryIcon, opt => opt.MapFrom(s => s.Category != null ? s.Category.IconName : "default"));
        }
    }
}
