using ParaZeka.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ParaZeka.Application.Common.Interfaces
{
    public interface IAIService
    {
        /// <summary>
        /// İşlemin kategorisini tahmin eder
        /// </summary>
        /// <param name="transaction">İşlem bilgileri</param>
        /// <returns>Tahmin edilen kategori</returns>
        Task<Category> PredictCategoryAsync(Transaction transaction);

        /// <summary>
        /// Kullanıcı için finansal öngörüler oluşturur
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>Finansal öngörüler listesi</returns>
        Task<List<FinancialInsight>> GenerateInsightsAsync(Guid userId);

        /// <summary>
        /// Gelecek aylar için harcama tahmini yapar
        /// </summary>
        /// <param name="userId">Kullanıcı ID</param>
        /// <param name="monthsAhead">Kaç ay sonrası için tahmin yapılacak</param>
        /// <returns>Tahmini harcama tutarı</returns>
        Task<decimal> PredictMonthlyExpenseAsync(Guid userId, int monthsAhead = 1);

        /// <summary>
        /// Kullanıcının finansal sorusuna cevap verir
        /// </summary>
        /// <param name="question">Kullanıcının sorusu</param>
        /// <param name="userId">Kullanıcı ID</param>
        /// <returns>Finansal tavsiye</returns>
        Task<string> GetFinancialAdviceAsync(string question, Guid userId);

        /// <summary>
        /// İşlemin anormal olup olmadığını tespit eder
        /// </summary>
        /// <param name="transaction">İşlem bilgileri</param>
        /// <returns>İşlem anormal ise true, değilse false</returns>
        Task<bool> DetectAnomalyAsync(Transaction transaction);
    }
}