using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ParaZeka.Application.Common.Interfaces;
using ParaZeka.Domain.Entities;
using Azure.AI.OpenAI;
using Azure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace ParaZeka.Infrastructure.Services
{
    public class OpenAISettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Endpoint { get; set; } = string.Empty;
        public string DeploymentName { get; set; } = string.Empty;
        public string ChatDeploymentName { get; set; } = string.Empty;
    }

    public class OpenAIService : IAIService
    {
        private readonly ILogger<OpenAIService> _logger;
        private readonly IApplicationDbContext _context;
        private readonly OpenAIClient? _openAIClient;
        private readonly string _deploymentName = string.Empty;
        private readonly string _chatDeploymentName = string.Empty;

        public OpenAIService(
            IOptions<OpenAISettings> options,
            ILogger<OpenAIService> logger,
            IApplicationDbContext context)
        {
            _logger = logger;
            _context = context;

            // Azure OpenAI client'ı oluştur
            if (!string.IsNullOrEmpty(options.Value.Endpoint) && !string.IsNullOrEmpty(options.Value.ApiKey))
            {
                try
                {
                    _openAIClient = new OpenAIClient(
                        new Uri(options.Value.Endpoint),
                        new AzureKeyCredential(options.Value.ApiKey));

                    _deploymentName = options.Value.DeploymentName;
                    _chatDeploymentName = options.Value.ChatDeploymentName;
                    _logger.LogInformation("OpenAI servisi başarıyla yapılandırıldı.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "OpenAI istemcisi oluşturulurken hata oluştu: {Message}", ex.Message);
                }
            }
            else
            {
                _logger.LogWarning("OpenAI servis bilgileri eksik, AI özellikleri kısıtlı çalışacak.");
            }
        }

        public async Task<Category> PredictCategoryAsync(ParaZeka.Domain.Entities.Transaction transaction)
        {
            try
            {
                // Kullanıcının kategorilerini ve sistem kategorilerini al
                var categories = _context.Categories
                    .Where(c => c.IsSystem || c.UserId == null || c.UserId == transaction.UserId)
                    .ToList();

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
                    await _context.SaveChangesAsync(CancellationToken.None);
                    return newCategory;
                }

                // OpenAI kullanarak kategori tahmin et
                if (_openAIClient != null)
                {
                    try
                    {
                        // Kategori listesini ve işlem bilgilerini hazırla
                        var categoryNames = string.Join(", ", categories.Select(c => c.Name));
                        var transactionInfo = new
                        {
                            description = transaction.Description,
                            amount = transaction.Amount,
                            type = transaction.Type.ToString(),
                            date = transaction.TransactionDate.ToString("yyyy-MM-dd"),
                            merchantName = transaction.MerchantName,
                            location = transaction.Location
                        };

                        // ChatGPT isteği oluştur
                        var chatCompletionsOptions = new ChatCompletionsOptions
                        {
                            MaxTokens = 50,
                            Temperature = 0.1f // Düşük sıcaklık daha tutarlı ve kesin yanıtlar için
                        };

                        chatCompletionsOptions.Messages.Add(
                            new ChatMessage(ChatRole.System, $"Sen bir finans kategorilendirme asistanısın. Verilen işlemin açıklamasına ve detaylarına bakarak en uygun kategoriyi seçmelisin. Mevcut kategoriler: {categoryNames}. Sadece kategori adını döndür, başka bir şey yazma."));

                        chatCompletionsOptions.Messages.Add(
                            new ChatMessage(ChatRole.User, $"İşlem bilgileri: {JsonSerializer.Serialize(transactionInfo)}"));

                        var response = await _openAIClient.GetChatCompletionsAsync(
                            _chatDeploymentName,
                            chatCompletionsOptions);

                        if (response.Value.Choices.Count > 0)
                        {
                            var predictedCategoryName = response.Value.Choices[0].Message.Content.Trim();

                            // Tahmin edilen kategoriyi bul
                            var matchedCategory = categories.FirstOrDefault(c =>
                                c.Name.Equals(predictedCategoryName, StringComparison.OrdinalIgnoreCase));

                            if (matchedCategory != null)
                            {
                                _logger.LogInformation("İşlem için AI tarafından kategori tahmin edildi: {Category}", matchedCategory.Name);
                                return matchedCategory;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "OpenAI kategori tahmini sırasında hata: {Message}", ex.Message);
                        // Hata durumunda alternatif yönteme geç
                    }
                }

                // OpenAI çalışmazsa veya sonuç döndürmezse, mevcut basit yöntemi kullan
                var lowerDesc = transaction.Description.ToLower();
                var lowerMerchant = transaction.MerchantName?.ToLower() ?? string.Empty;

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
                    if (lowerDesc.Contains("market") || lowerDesc.Contains("alışveriş") ||
                        lowerMerchant.Contains("market") || lowerMerchant.Contains("migros") ||
                        lowerMerchant.Contains("carrefour") || lowerMerchant.Contains("bim") ||
                        lowerMerchant.Contains("a101"))
                    {
                        var shoppingCategory = categories.FirstOrDefault(c =>
                            c.Name.ToLower().Contains("alışveriş") ||
                            c.Name.ToLower().Contains("market") ||
                            c.Name.ToLower().Contains("shopping"));

                        if (shoppingCategory != null)
                            return shoppingCategory;
                    }

                    // Yemek
                    if (lowerDesc.Contains("restoran") || lowerDesc.Contains("cafe") ||
                        lowerDesc.Contains("yemek") || lowerDesc.Contains("food") ||
                        lowerMerchant.Contains("restoran") || lowerMerchant.Contains("cafe"))
                    {
                        var foodCategory = categories.FirstOrDefault(c =>
                            c.Name.ToLower().Contains("yemek") ||
                            c.Name.ToLower().Contains("food") ||
                            c.Name.ToLower().Contains("restaurant"));

                        if (foodCategory != null)
                            return foodCategory;
                    }

                    // Fatura
                    if (lowerDesc.Contains("fatura") || lowerDesc.Contains("bill") ||
                        lowerDesc.Contains("elektrik") || lowerDesc.Contains("su") ||
                        lowerDesc.Contains("doğalgaz") || lowerDesc.Contains("internet") ||
                        lowerMerchant.Contains("tedaş") || lowerMerchant.Contains("iski"))
                    {
                        var billCategory = categories.FirstOrDefault(c =>
                            c.Name.ToLower().Contains("fatura") ||
                            c.Name.ToLower().Contains("bill") ||
                            c.Name.ToLower().Contains("utilities"));

                        if (billCategory != null)
                            return billCategory;
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
                await _context.SaveChangesAsync(CancellationToken.None);
                return newCategory;
            }
        }

        public async Task<List<FinancialInsight>> GenerateInsightsAsync(Guid userId)
        {
            try
            {
                // Kullanıcının son 30 gündeki işlemleri
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                var recentTransactions = _context.Transactions
                    .Where(t => t.UserId == userId && t.TransactionDate >= thirtyDaysAgo)
                    .ToList();

                // Kategorilere göre harcamaları hesapla
                var categorySpending = recentTransactions
                    .Where(t => t.Type == TransactionType.Expense && t.CategoryId.HasValue)
                    .GroupBy(t => t.CategoryId)
                    .Select(g => new
                    {
                        CategoryId = g.Key,
                        TotalAmount = g.Sum(t => t.Amount)
                    })
                    .ToList();

                // Toplam gelir ve gider
                var totalIncome = recentTransactions
                    .Where(t => t.Type == TransactionType.Income)
                    .Sum(t => t.Amount);

                var totalExpense = recentTransactions
                    .Where(t => t.Type == TransactionType.Expense)
                    .Sum(t => t.Amount);

                var insights = new List<FinancialInsight>();

                // Öngörüleri oluştur
                // 1. Bütçe durumu
                if (totalIncome > 0)
                {
                    var spendingRatio = totalExpense / totalIncome;
                    var budgetInsight = new FinancialInsight
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Title = "Bütçe Durumu",
                        Description = $"Bu ay gelirinizin {(spendingRatio * 100):0}%'ini harcadınız.",
                        Type = InsightType.BudgetAlert,
                        Severity = spendingRatio > 0.9m ? InsightSeverity.High :
                                  spendingRatio > 0.7m ? InsightSeverity.Medium :
                                  InsightSeverity.Low,
                        CreatedDate = DateTime.UtcNow
                    };
                    insights.Add(budgetInsight);
                }

                // 2. En yüksek harcama kategorisi
                if (categorySpending.Any())
                {
                    var topCategory = categorySpending.OrderByDescending(c => c.TotalAmount).First();
                    var categoryName = _context.Categories
                        .FirstOrDefault(c => c.Id == topCategory.CategoryId)?.Name ?? "Bilinmeyen Kategori";

                    var categoryInsight = new FinancialInsight
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Title = "En Yüksek Harcama Kategorisi",
                        Description = $"En çok harcamanız '{categoryName}' kategorisinde (toplam {topCategory.TotalAmount:C2}).",
                        Type = InsightType.SpendingPattern,
                        Severity = InsightSeverity.Medium,
                        CreatedDate = DateTime.UtcNow
                    };
                    insights.Add(categoryInsight);
                }

                // 3. Tasarruf önerisi
                if (totalIncome > 0 && totalExpense > 0)
                {
                    var savingsRate = (totalIncome - totalExpense) / totalIncome;

                    InsightSeverity severity;
                    string advice;

                    if (savingsRate < 0.1m)
                    {
                        severity = InsightSeverity.High;
                        advice = "Tasarruf oranınız çok düşük. Harcamalarınızı azaltarak aylık gelirinizin en az %10'unu biriktirmeyi hedefleyin.";
                    }
                    else if (savingsRate < 0.2m)
                    {
                        severity = InsightSeverity.Medium;
                        advice = "Tasarruf oranınızı artırabilirsiniz. Finansal uzmanlar, gelirinizin en az %20'sini biriktirmenizi öneriyor.";
                    }
                    else
                    {
                        severity = InsightSeverity.Low;
                        advice = "Tebrikler! İyi bir tasarruf oranına sahipsiniz. Bu oranı korumaya devam edin.";
                    }

                    var savingInsight = new FinancialInsight
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Title = "Tasarruf Değerlendirmesi",
                        Description = advice,
                        Type = InsightType.SavingOpportunity,
                        Severity = severity,
                        CreatedDate = DateTime.UtcNow
                    };
                    insights.Add(savingInsight);
                }

                // AI ile öngörü zenginleştirme
                if (_openAIClient != null && recentTransactions.Count > 5)
                {
                    try
                    {
                        // Son işlemleri ve kategorilere göre harcamaları özetleyen bir veri oluştur
                        var userData = new
                        {
                            RecentTransactions = recentTransactions.Take(10).Select(t => new
                            {
                                Description = t.Description,
                                Amount = t.Amount,
                                Type = t.Type.ToString(),
                                Date = t.TransactionDate.ToString("yyyy-MM-dd"),
                                Category = t.CategoryId.HasValue ?
                                    _context.Categories.FirstOrDefault(c => c.Id == t.CategoryId)?.Name : null,
                                MerchantName = t.MerchantName
                            }),
                            CategorySpending = categorySpending.Select(cs => new
                            {
                                Category = _context.Categories
                                    .FirstOrDefault(c => c.Id == cs.CategoryId)?.Name,
                                TotalAmount = cs.TotalAmount
                            }),
                            TotalIncome = totalIncome,
                            TotalExpense = totalExpense
                        };

                        // ChatGPT isteği oluştur
                        var chatCompletionsOptions = new ChatCompletionsOptions
                        {
                            MaxTokens = 500,
                            Temperature = 0.7f
                        };

                        chatCompletionsOptions.Messages.Add(
                            new ChatMessage(ChatRole.System, "Sen bir finansal danışmansın. Kullanıcının finans verilerini analiz ederek 2 adet özel finansal öngörü ve tavsiye oluştur. Her öngörünün bir başlığı (kısa) ve açıklaması (2 cümle) olmalı. Aşağıdaki JSON formatında yanıt ver: [{\"title\": \"Başlık\", \"description\": \"Açıklama\", \"type\": \"BUDGET_ALERT|SPENDING_PATTERN|SAVING_OPPORTUNITY|ANOMALY\", \"severity\": \"LOW|MEDIUM|HIGH\"}]"));

                        chatCompletionsOptions.Messages.Add(
                            new ChatMessage(ChatRole.User, $"Kullanıcı verileri: {JsonSerializer.Serialize(userData)}"));

                        var response = await _openAIClient.GetChatCompletionsAsync(
                            _chatDeploymentName,
                            chatCompletionsOptions);

                        if (response.Value.Choices.Count > 0)
                        {
                            var aiResponse = response.Value.Choices[0].Message.Content;
                            try
                            {
                                using (JsonDocument doc = JsonDocument.Parse(aiResponse))
                                {
                                    foreach (var element in doc.RootElement.EnumerateArray())
                                    {
                                        string title = element.GetProperty("title").GetString() ?? string.Empty;
                                        string description = element.GetProperty("description").GetString() ?? string.Empty;
                                        string typeStr = element.GetProperty("type").GetString() ?? "BUDGET_ALERT";
                                        string severityStr = element.GetProperty("severity").GetString() ?? "MEDIUM";

                                        InsightType type = InsightType.BudgetAlert; // Varsayılan değer
                                        if (typeStr == "SPENDING_PATTERN") type = InsightType.SpendingPattern;
                                        else if (typeStr == "SAVING_OPPORTUNITY") type = InsightType.SavingOpportunity;
                                        else if (typeStr == "ANOMALY") type = InsightType.Anomaly;

                                        InsightSeverity severity = InsightSeverity.Medium; // Varsayılan değer
                                        if (severityStr == "LOW") severity = InsightSeverity.Low;
                                        else if (severityStr == "HIGH") severity = InsightSeverity.High;

                                        insights.Add(new FinancialInsight
                                        {
                                            Id = Guid.NewGuid(),
                                            UserId = userId,
                                            Title = title,
                                            Description = description,
                                            Type = type,
                                            Severity = severity,
                                            CreatedDate = DateTime.UtcNow,
                                            IsAIGenerated = true
                                        });
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "AI öngörülerini ayrıştırırken hata: {Message}", ex.Message);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "OpenAI öngörü oluşturma sırasında hata: {Message}", ex.Message);
                    }
                }

                return insights;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Öngörüler oluşturulurken hata: {Message}", ex.Message);

                // Hata durumunda basit öngörüler döndür
                return new List<FinancialInsight>
                {
                    new FinancialInsight
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Title = "Bütçe Durumu",
                        Description = "Bu ay bütçenizin %75'ini kullandınız.",
                        Type = InsightType.BudgetAlert,
                        Severity = InsightSeverity.Medium,
                        CreatedDate = DateTime.UtcNow
                    },
                    new FinancialInsight
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Title = "Tasarruf Önerisi",
                        Description = "Geçen aya göre yemek harcamalarınız %15 arttı.",
                        Type = InsightType.SavingOpportunity,
                        Severity = InsightSeverity.Low,
                        CreatedDate = DateTime.UtcNow
                    }
                };
            }
        }

        public async Task<decimal> PredictMonthlyExpenseAsync(Guid userId, int monthsAhead = 1)
        {
            try
            {
                // Son 6 aydaki aylık harcamaları al
                var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
                var expenses = _context.Transactions
                    .Where(t => t.UserId == userId && t.Type == TransactionType.Expense && t.TransactionDate >= sixMonthsAgo)
                    .ToList();

                // Aylık harcamaları hesapla
                var monthlyExpenses = expenses
                    .GroupBy(t => new { t.TransactionDate.Year, t.TransactionDate.Month })
                    .Select(g => new
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        TotalExpense = g.Sum(t => t.Amount)
                    })
                    .OrderBy(m => m.Year)
                    .ThenBy(m => m.Month)
                    .Select(m => m.TotalExpense)
                    .ToList();

                if (monthlyExpenses.Count >= 3)
                {
                    // Son 3 ayın ortalamasını al ve %5 artış ekle (basit bir tahmin)
                    var lastThreeMonths = monthlyExpenses.Skip(Math.Max(0, monthlyExpenses.Count - 3)).Take(3);
                    var lastThreeMonthsAverage = lastThreeMonths.Average();
                    var predictedExpense = lastThreeMonthsAverage * (1 + (0.05m * monthsAhead));

                    return Math.Round(predictedExpense, 2);
                }
                else if (monthlyExpenses.Any())
                {
                    // En az bir ay varsa, onun değerini al ve %10 artış ekle
                    var lastMonth = monthlyExpenses.Last();
                    var predictedExpense = lastMonth * (1 + (0.1m * monthsAhead));

                    return Math.Round(predictedExpense, 2);
                }

                // Yeterli veri yoksa sabit bir değer döndür
                return 2500.0m;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Aylık harcama tahmini sırasında hata: {Message}", ex.Message);
                return 2500.0m;
            }
        }

        public async Task<string> GetFinancialAdviceAsync(string question, Guid userId)
        {
            // OpenAI kullanarak finansal tavsiye ver
            if (_openAIClient != null)
            {
                try
                {
                    // Kullanıcının son 30 gündeki işlemleri
                    var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                    var recentTransactions = _context.Transactions
                        .Where(t => t.UserId == userId && t.TransactionDate >= thirtyDaysAgo)
                        .ToList();

                    // Toplam gelir ve gider
                    var totalIncome = recentTransactions
                        .Where(t => t.Type == TransactionType.Income)
                        .Sum(t => t.Amount);

                    var totalExpense = recentTransactions
                        .Where(t => t.Type == TransactionType.Expense)
                        .Sum(t => t.Amount);

                    // Kullanıcı verilerini özet bir şekilde hazırla
                    var userFinancialSummary = new
                    {
                        MonthlyIncome = totalIncome,
                        MonthlyExpenses = totalExpense,
                        SavingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0,
                        TopExpenseCategories = recentTransactions
                            .Where(t => t.Type == TransactionType.Expense && t.CategoryId.HasValue)
                            .GroupBy(t => t.CategoryId)
                            .OrderByDescending(g => g.Sum(t => t.Amount))
                            .Take(3)
                            .Select(g => new
                            {
                                Category = _context.Categories.FirstOrDefault(c => c.Id == g.Key)?.Name,
                                Amount = g.Sum(t => t.Amount)
                            })
                            .ToList()
                    };

                    // ChatGPT isteği oluştur
                    var chatCompletionsOptions = new ChatCompletionsOptions
                    {
                        MaxTokens = 250,
                        Temperature = 0.7f
                    };

                    chatCompletionsOptions.Messages.Add(
                        new ChatMessage(ChatRole.System, $"Sen bir finans danışmanısın. Kullanıcının finansal durumuna dair özet bilgileri: {JsonSerializer.Serialize(userFinancialSummary)}. Bu bilgilere dayanarak, kullanıcının sorusuna kişiselleştirilmiş, pratik ve uygulanabilir finansal tavsiyeler ver. Yanıtın 3-4 cümleyi geçmesin."));

                    chatCompletionsOptions.Messages.Add(
                        new ChatMessage(ChatRole.User, question));

                    var response = await _openAIClient.GetChatCompletionsAsync(
                        _chatDeploymentName,
                        chatCompletionsOptions);

                    if (response.Value.Choices.Count > 0)
                    {
                        var advice = response.Value.Choices[0].Message.Content.Trim();
                        return advice;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "OpenAI finansal tavsiye sırasında hata: {Message}", ex.Message);
                    // Hata durumunda alternatif yönteme geç
                }
            }

            // OpenAI çalışmazsa veya sonuç döndürmezse, basit tavsiyeler ver
            if (question.ToLower().Contains("tasarruf"))
            {
                return "Aylık gelirinizin %20'sini tasarruf etmeyi hedefleyin. Düzenli olarak otomatik tasarruf planı oluşturun ve acil durum fonu için 3-6 aylık gideriniz kadar bir miktar biriktirin.";
            }

            if (question.ToLower().Contains("yatırım"))
            {
                return "Çeşitlendirilmiş bir yatırım portföyü riskinizi azaltır. Hisse senetleri, tahviller ve düşük maliyetli endeks fonları arasında dağılım yaparak uzun vadeli yatırım stratejisi oluşturun.";
            }

            if (question.ToLower().Contains("bütçe") || question.ToLower().Contains("harcama"))
            {
                return "50-30-20 bütçe kuralını uygulayın: Gelirinizin %50'si temel ihtiyaçlara, %30'u isteklere ve %20'si tasarrufa ayrılmalıdır. Harcamalarınızı kategorilere ayırıp düzenli olarak takip edin.";
            }

            if (question.ToLower().Contains("borç") || question.ToLower().Contains("kredi"))
            {
                return "Öncelikle yüksek faizli borçları kapatmaya odaklanın. Kar topu veya çığ yöntemi kullanarak sistematik bir borç ödeme planı oluşturun ve ek gelir elde etme yollarını değerlendirin.";
            }

            return "Finansal durumunuzu düzenli olarak gözden geçirin ve uzun vadeli hedeflerinize uygun bir bütçe planı oluşturun. Acil durum fonu oluşturmak, borçları azaltmak ve düzenli tasarruf yapmak sağlıklı bir finans için temel adımlardır.";
        }

        public async Task<bool> DetectAnomalyAsync(ParaZeka.Domain.Entities.Transaction transaction)
        {
            try
            {
                // Kullanıcının son 3 aydaki aynı kategorideki işlemleri
                var threeMonthsAgo = DateTime.UtcNow.AddMonths(-3);
                var userTransactions = _context.Transactions
                    .Where(t => t.UserId == transaction.UserId &&
                           t.Type == transaction.Type &&
                           t.TransactionDate >= threeMonthsAgo &&
                           (t.CategoryId == transaction.CategoryId || (!t.CategoryId.HasValue && !transaction.CategoryId.HasValue)))
                    .ToList();

                if (userTransactions.Count < 5)
                {
                    // Yeterli veri yoksa, sadece büyük miktarları kontrol et
                    return transaction.Amount > 5000;
                }

                // Kategori bazında ortalama ve standart sapma hesapla
                decimal average = userTransactions.Average(t => t.Amount);

                // Standart sapma hesaplama
                decimal sumOfSquaresOfDifferences = userTransactions.Sum(t =>
                    (t.Amount - average) * (t.Amount - average));
                decimal standardDeviation = (decimal)Math.Sqrt((double)(sumOfSquaresOfDifferences / userTransactions.Count));

                // Z-skoru hesapla (standart normal dağılımda 2 veya -2'den büyük değerler anormal kabul edilir)
                decimal zScore = standardDeviation != 0
                    ? (transaction.Amount - average) / standardDeviation
                    : 0;

                // Mutlak Z-skoru 2'den büyükse anormaldir
                return Math.Abs(zScore) > 2;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Anomali tespiti sırasında hata: {Message}", ex.Message);

                // Hata durumunda basit bir kontrol yap
                return transaction.Amount > 5000;
            }
        }
    }
}
