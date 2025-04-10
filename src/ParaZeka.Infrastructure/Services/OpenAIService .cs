using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ParaZeka.Application.Common.Interfaces;
using ParaZeka.Domain.Entities;
using System.Text;

namespace ParaZeka.Infrastructure.Services
{
    public class OpenAISettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Endpoint { get; set; } = string.Empty;
        public string DeploymentName { get; set; } = string.Empty;
    }

    public class OpenAIService : IAIService
    {
        private readonly ILogger<OpenAIService> _logger;
        private readonly IApplicationDbContext _context;

        public OpenAIService(
            IOptions<OpenAISettings> options,
            ILogger<OpenAIService> logger,
            IApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<Category> PredictCategoryAsync(Transaction transaction)
        {
            try
            {
                // Basit kategori tahmini - gerçek AI kullanmadan
                var categories = _context.Categories.Where(c => c.IsSystem || c.UserId == null).ToList();

                if (categories.Count == 0)
                {
                    // Eğer kategori yoksa, yeni bir tane oluşturalım
                    var newCategory = new Category
                    {
                        Id = Guid.NewGuid(),
                        Name = transaction.Type == TransactionType.Income ? "Gelir" : "Gider",
                        Description = "Otomatik oluşturulmuş kategori",
                        IconName = "default",
                        ColorHex = "#808080",
                        IsSystem = true,
                        CreatedDate = DateTime.UtcNow
                    };

                    _context.Categories.Add(newCategory);
                    await _context.SaveChangesAsync(default);
                    return newCategory;
                }

                // İşlem açıklamasına göre basit kategori eşleştirme
                var lowerDesc = transaction.Description.ToLower();

                // Gelir kategorisi için
                if (transaction.Type == TransactionType.Income)
                {
                    var salaryCategory = categories.FirstOrDefault(c =>
                        c.Name.ToLower().Contains("maaş") ||
                        c.Name.ToLower().Contains("salary"));

                    if (salaryCategory != null &&
                        (lowerDesc.Contains("maaş") || lowerDesc.Contains("salary")))
                        return salaryCategory;

                    var otherIncomeCategory = categories.FirstOrDefault(c =>
                        c.Name.ToLower().Contains("diğer gelir") ||
                        c.Name.ToLower().Contains("other income"));

                    if (otherIncomeCategory != null)
                        return otherIncomeCategory;

                    // Gelir kategorisi bulunamazsa ilk kategoriyi döndür
                    return categories.First();
                }
                else // Gider kategorisi için
                {
                    // Alışveriş
                    if (lowerDesc.Contains("market") || lowerDesc.Contains("alışveriş"))
                    {
                        var shoppingCategory = categories.FirstOrDefault(c =>
                            c.Name.ToLower().Contains("alışveriş") ||
                            c.Name.ToLower().Contains("shopping"));

                        if (shoppingCategory != null)
                            return shoppingCategory;
                    }

                    // Yemek
                    if (lowerDesc.Contains("restoran") || lowerDesc.Contains("cafe") ||
                        lowerDesc.Contains("yemek") || lowerDesc.Contains("food"))
                    {
                        var foodCategory = categories.FirstOrDefault(c =>
                            c.Name.ToLower().Contains("yemek") ||
                            c.Name.ToLower().Contains("food"));

                        if (foodCategory != null)
                            return foodCategory;
                    }

                    // Diğer harcamalar
                    var otherExpenseCategory = categories.FirstOrDefault(c =>
                        c.Name.ToLower().Contains("diğer") ||
                        c.Name.ToLower().Contains("other"));

                    if (otherExpenseCategory != null)
                        return otherExpenseCategory;

                    // Kategori bulunamazsa ilk kategoriyi döndür
                    return categories.First();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategori tahmini sırasında hata oluştu: {Message}", ex.Message);

                // Hata durumunda varsayılan bir kategori döndür
                var categories = _context.Categories.ToList();
                if (categories.Any())
                    return categories.First();

                // Hiç kategori yoksa yeni bir tane oluştur
                var newCategory = new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Diğer",
                    Description = "Varsayılan kategori",
                    IconName = "default",
                    ColorHex = "#808080",
                    IsSystem = true,
                    CreatedDate = DateTime.UtcNow
                };

                _context.Categories.Add(newCategory);
                await _context.SaveChangesAsync(default);
                return newCategory;
            }
        }

        public async Task<List<FinancialInsight>> GenerateInsightsAsync(Guid userId)
        {
            // Basit öngörü oluşturma
            var insights = new List<FinancialInsight>
            {
                new FinancialInsight
                {
                    Id = Guid.NewGuid(),
                    Title = "Bütçe Durumu",
                    Description = "Bu ay bütçenizin %75'ini kullandınız.",
                    Type = InsightType.BudgetAlert,
                    Severity = InsightSeverity.Medium,
                    UserId = userId,
                    CreatedDate = DateTime.UtcNow
                },
                new FinancialInsight
                {
                    Id = Guid.NewGuid(),
                    Title = "Tasarruf Önerisi",
                    Description = "Geçen aya göre yemek harcamalarınız %15 arttı.",
                    Type = InsightType.SavingOpportunity,
                    Severity = InsightSeverity.Low,
                    UserId = userId,
                    CreatedDate = DateTime.UtcNow
                }
            };

            return insights;
        }

        public Task<decimal> PredictMonthlyExpenseAsync(Guid userId, int monthsAhead = 1)
        {
            // Basit aylık harcama tahmini
            return Task.FromResult(2500.0m); // Sabit bir değer döndürüyoruz
        }

        public Task<string> GetFinancialAdviceAsync(string question, Guid userId)
        {
            // Basit finansal tavsiye
            if (question.ToLower().Contains("tasarruf"))
            {
                return Task.FromResult("Aylık gelirinizin %20'sini tasarruf etmeyi hedefleyin.");
            }

            if (question.ToLower().Contains("yatırım"))
            {
                return Task.FromResult("Çeşitlendirilmiş bir yatırım portföyü riskinizi azaltır.");
            }

            return Task.FromResult("Finansal durumunuzu düzenli olarak gözden geçirin ve bir bütçe planı oluşturun.");
        }

        public Task<bool> DetectAnomalyAsync(Transaction transaction)
        {
            // Basit anomali tespiti - sadece büyük miktarları kontrol ediyoruz
            return Task.FromResult(transaction.Amount > 5000);
        }
    }
}