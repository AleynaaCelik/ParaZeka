using ParaZeka.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Application.Common.Interfaces
{
    public interface IBankIntegrationService
    {
        Task<List<Transaction>> FetchTransactionsAsync(string bankName, string accessToken, DateTime startDate, DateTime endDate);
        Task<decimal> GetAccountBalanceAsync(string bankName, string accessToken, string accountNumber);
        Task<bool> AuthenticateAsync(string bankName, string username, string password);
        Task<string> GetAccessTokenAsync(string bankName, string authCode);
    }
}
