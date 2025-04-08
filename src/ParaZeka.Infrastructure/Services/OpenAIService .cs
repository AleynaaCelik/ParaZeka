using ParaZeka.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
        private readonly OpenAIClient _client;
        private readonly string _deploymentName;
        private readonly ILogger<OpenAIService> _logger;
        private readonly IApplicationDbContext _context;

        public OpenAIService(
            IOptions<OpenAISettings> options,
            ILogger<OpenAIService> logger,
            IApplicationDbContext context)
        {
            _logger = logger;
            _context = context;

            var settings = options.Value;

            // Initialize the OpenAI client
            if (!string.IsNullOrEmpty(settings.Endpoint))
            {
                _client = new OpenAIClient(
                    new Uri(settings.Endpoint),
                    new AzureKeyCredential(settings.ApiKey));
            }
            else
            {
                _client = new OpenAIClient(settings.ApiKey);
            }

            _deploymentName = settings.DeploymentName;
        }

        public async Task<Category> PredictCategoryAsync(Transaction transaction)
        {
            try
            {
                // Get all available categories to suggest from
                var categories = _context.Categories.Where(c => c.IsSystem || c.UserId == null).ToList();

                var systemPrompt = @"
                    You are a financial transaction classifier. Your task is to categorize a transaction into one of the predefined categories
                    based on the transaction description, amount, and other details. You should return only the category name that best fits the transaction.";

                var userPrompt = new StringBuilder();
                userPrompt.AppendLine("Transaction details:");
                userPrompt.AppendLine($"- Description: {transaction.Description}");
                userPrompt.AppendLine($"- Amount: {transaction.Amount} {transaction.Currency}");
                userPrompt.AppendLine($"- Type: {transaction.Type}");
                if (!string.IsNullOrEmpty(transaction.MerchantName))
                {
                    userPrompt.AppendLine($"- Merchant: {transaction.MerchantName}");
                }

                userPrompt.AppendLine("\nAvailable categories:");
                foreach (var category in categories)
                {
                    userPrompt.AppendLine($"- {category.Name}: {category.Description}");
                }

                userPrompt.AppendLine("\nReply with only the name of the most appropriate category from the list above.");

                var chatCompletionsOptions = new ChatCompletionsOptions()
                {
                    Messages =
                    {
                        new ChatMessage(ChatRole.System, systemPrompt),
                        new ChatMessage(ChatRole.User, userPrompt.ToString())
                    },
                    MaxTokens = 50,
                    Temperature = 0.0f,
                    FrequencyPenalty = 0.0f,
                    PresencePenalty = 0.0f
                };

                var response = await _client.GetChatCompletionsAsync(_deploymentName, chatCompletionsOptions);
                var content = response.Value.Choices[0].Message.Content.Trim();

                // Find the matching category
                var predictedCategory = categories.FirstOrDefault(c =>
                    string.Equals(c.Name, content, StringComparison.OrdinalIgnoreCase));

                // If no match, default to "Other Income" or "Shopping" based on transaction type
                if (predictedCategory == null)
                {
                    if (transaction.Type == TransactionType.Income)
                    {
                        predictedCategory = categories.FirstOrDefault(c => c.Name == "Other Income");
                    }
                    else
                    {
                        predictedCategory = categories.FirstOrDefault(c => c.Name == "Shopping");
                    }
                }

                // If still no category found, create a default one
                if (predictedCategory == null)
                {
                    predictedCategory = new Category
                    {
                        Id = Guid.NewGuid(),
                        Name = transaction.Type == TransactionType.Income ? "Other Income" : "Other Expense",
                        Description = "Default category",
                        ColorHex = "#808080",
                        IconName = "help-circle",
                        IsSystem = true,
                        CreatedDate = DateTime.UtcNow
                    };

                    _context.Categories.Add(predictedCategory);
                    await _context.SaveChangesAsync(CancellationToken.None);
                }

                return predictedCategory;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting category for transaction");

                // Fallback to a default category
                var defaultCategory = _context.Categories.FirstOrDefault(c =>
                    c.IsSystem && (c.Name == "Other Income" || c.Name == "Shopping"));

                if (defaultCategory != null)
                {
                    return defaultCategory;
                }

                // Create a new default category if none exists
                var newDefaultCategory = new Category
                {
                    Id = Guid.NewGuid(),
                    Name = transaction.Type == TransactionType.Income ? "Other Income" : "Other Expense",
                    Description = "Default category",
                    ColorHex = "#808080",
                    IconName = "help-circle",
                    IsSystem = true,
                    CreatedDate = DateTime.UtcNow
                };

                _context.Categories.Add(newDefaultCategory);
                await _context.SaveChangesAsync(CancellationToken.None);

                return newDefaultCategory;
            }
        }

        public async Task<List<FinancialInsight>> GenerateInsightsAsync(Guid userId)
        {
            try
            {
                // Get user's recent transactions
                var recentTransactions = _context.Transactions
                    .Where(t => t.Account.UserId == userId)
                    .Where(t => t.TransactionDate >= DateTime.UtcNow.AddMonths(-3))
                    .OrderByDescending(t => t.TransactionDate)
                    .Take(100)
                    .ToList();

                if (recentTransactions.Count < 10)
                {
                    // Not enough data to generate meaningful insights
                    return new List<FinancialInsight>();
                }

                // Group transactions by category
                var categorySummary = recentTransactions
                    .Where(t => t.Type == TransactionType.Expense)
                    .GroupBy(t => t.CategoryId)
                    .Select(g => new
                    {
                        CategoryId = g.Key,
                        CategoryName = g.First().Category?.Name ?? "Uncategorized",
                        TotalAmount = g.Sum(t => t.Amount),
                        Count = g.Count()
                    })
                    .OrderByDescending(x => x.TotalAmount)
                    .Take(5)
                    .ToList();

                // Calculate monthly spending
                var monthlySpending = recentTransactions
                    .Where(t => t.Type == TransactionType.Expense)
                    .GroupBy(t => new { t.TransactionDate.Year, t.TransactionDate.Month })
                    .Select(g => new
                    {
                        YearMonth = $"{g.Key.Year}-{g.Key.Month:D2}",
                        TotalAmount = g.Sum(t => t.Amount)
                    })
                    .OrderBy(x => x.YearMonth)
                    .ToList();

                // Create JSON summary of financial data
                var financialSummary = new
                {
                    TopCategories = categorySummary,
                    MonthlySpending = monthlySpending,
                    TotalIncome = recentTransactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                    TotalExpense = recentTransactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount),
                    Currency = recentTransactions.FirstOrDefault()?.Currency ?? "TRY"
                };

                var systemPrompt = @"
                    You are a financial advisor AI. Based on the provided transaction data summary, generate 3-5 meaningful financial insights that could help the user manage their finances better.
                    For each insight, provide:
                    1. A short, specific title (max 50 characters)
                    2. A detailed description explaining the insight and how it could help (max 200 characters)
                    3. The type of insight (pick one: SpendingPattern, SavingOpportunity, BudgetAlert, UnusualActivity, FinancialTip, GoalProgress)
                    4. The severity level (Low, Medium, or High)
                    5. Estimated monetary impact (if applicable)
                    
                    Format your response as a JSON array of insight objects.";

                var userPrompt = $"Here's the financial data summary:\n{JsonSerializer.Serialize(financialSummary, new JsonSerializerOptions { WriteIndented = true })}";

                var chatCompletionsOptions = new ChatCompletionsOptions()
                {
                    Messages =
                    {
                        new ChatMessage(ChatRole.System, systemPrompt),
                        new ChatMessage(ChatRole.User, userPrompt)
                    },
                    MaxTokens = 800,
                    Temperature = 0.7f
                };

                var response = await _client.GetChatCompletionsAsync(_deploymentName, chatCompletionsOptions);
                var content = response.Value.Choices[0].Message.Content.Trim();

                // Parse the JSON response
                try
                {
                    var insightsData = JsonSerializer.Deserialize<List<JsonElement>>(content);
                    var insights = new List<FinancialInsight>();

                    if (insightsData != null)
                    {
                        foreach (var item in insightsData)
                        {
                            var title = item.GetProperty("title").GetString() ?? "Financial Insight";
                            var description = item.GetProperty("description").GetString() ?? "";

                            var typeStr = item.GetProperty("type").GetString() ?? "FinancialTip";
                            Enum.TryParse<InsightType>(typeStr, out var insightType);

                            var severityStr = item.GetProperty("severity").GetString() ?? "Medium";
                            Enum.TryParse<InsightSeverity>(severityStr, out var severity);

                            decimal? amount = null;
                            if (item.TryGetProperty("monetaryImpact", out var monetaryElement) &&
                                monetaryElement.ValueKind != JsonValueKind.Null)
                            {
                                if (monetaryElement.TryGetDecimal(out var monetaryImpact))
                                {
                                    amount = monetaryImpact;
                                }
                            }

                            var insight = new FinancialInsight
                            {
                                Id = Guid.NewGuid(),
                                Title = title,
                                Description = description,
                                Type = insightType,
                                Severity = severity,
                                IsRead = false,
                                IsDismissed = false,
                                ValidUntil = DateTime.UtcNow.AddDays(14),
                                AmountImpact = amount,
                                Currency = recentTransactions.FirstOrDefault()?.Currency,
                                UserId = userId,
                                CreatedDate = DateTime.UtcNow
                            };

                            insights.Add(insight);
                        }
                    }

                    return insights;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error parsing AI-generated insights");
                    return new List<FinancialInsight>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating financial insights");
                return new List<FinancialInsight>();
            }
        }

        public async Task<decimal> PredictMonthlyExpenseAsync(Guid userId, int monthsAhead = 1)
        {
            try
            {
                // Get the user's monthly expenses for the past year
                var startDate = DateTime.UtcNow.AddYears(-1);
                var endDate = DateTime.UtcNow;

                var monthlyExpenses = _context.Transactions
                    .Where(t => t.Account.UserId == userId)
                    .Where(t => t.Type == TransactionType.Expense)
                    .Where(t => t.TransactionDate >= startDate && t.TransactionDate <= endDate)
                    .GroupBy(t => new { t.TransactionDate.Year, t.TransactionDate.Month })
                    .Select(g => new
                    {
                        YearMonth = $"{g.Key.Year}-{g.Key.Month:D2}",
                        TotalAmount = g.Sum(t => t.Amount)
                    })
                    .OrderBy(x => x.YearMonth)
                    .ToList();

                if (monthlyExpenses.Count < 3)
                {
                    // Not enough historical data, return the average of available data
                    var averageMonthly = monthlyExpenses.Any()
                        ? monthlyExpenses.Average(m => m.TotalAmount)
                        : 0;
                    return averageMonthly;
                }

                // Calculate average and trend
                var values = monthlyExpenses.Select(m => m.TotalAmount).ToList();
                var average = values.Average();

                // Simple linear regression for trend
                var n = values.Count;
                var xValues = Enumerable.Range(1, n).ToList();
                var xAverage = xValues.Average();
                var yAverage = values.Average();

                var numerator = 0.0;
                var denominator = 0.0;

                for (int i = 0; i < n; i++)
                {
                    numerator += (xValues[i] - xAverage) * (values[i] - yAverage);
                    denominator += Math.Pow(xValues[i] - xAverage, 2);
                }

                var slope = denominator != 0 ? numerator / denominator : 0;
                var intercept = yAverage - (slope * xAverage);

                // Predict future value
                var futureX = n + monthsAhead;
                var prediction = intercept + (slope * futureX);

                // Return the prediction, ensuring it's not negative
                return (decimal)Math.Max(0, prediction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting monthly expenses");
                return 0;
            }
        }

        public async Task<string> GetFinancialAdviceAsync(string question, Guid userId)
        {
            try
            {
                // Get user's financial summary
                var user = _context.Users.Find(userId);
                if (user == null)
                {
                    return "Sorry, I couldn't access your financial information to provide personalized advice.";
                }

                // Get recent transactions for context
                var recentTransactions = _context.Transactions
                    .Where(t => t.Account.UserId == userId)
                    .Where(t => t.TransactionDate >= DateTime.UtcNow.AddMonths(-2))
                    .OrderByDescending(t => t.TransactionDate)
                    .Take(50)
                    .ToList();

                // Calculate income vs expenses
                var totalIncome = recentTransactions
                    .Where(t => t.Type == TransactionType.Income)
                    .Sum(t => t.Amount);

                var totalExpenses = recentTransactions
                    .Where(t => t.Type == TransactionType.Expense)
                    .Sum(t => t.Amount);

                // Get top spending categories
                var topCategories = recentTransactions
                    .Where(t => t.Type == TransactionType.Expense && t.CategoryId != null)
                    .GroupBy(t => t.CategoryId)
                    .Select(g => new
                    {
                        CategoryName = g.First().Category?.Name ?? "Unknown",
                        TotalAmount = g.Sum(t => t.Amount)
                    })
                    .OrderByDescending(x => x.TotalAmount)
                    .Take(3)
                    .ToList();

                var systemPrompt = @"
                    You are a helpful and knowledgeable financial advisor. Based on the user's financial data and their question, 
                    provide specific, actionable financial advice. Be concise, practical and supportive. 
                    Don't overwhelm the user with too much information - focus on the most relevant advice for their situation.
                    
                    If the user is asking about specific financial products or services, provide general information but remind them 
                    to consult with a professional financial advisor for personalized recommendations.";

                var userPrompt = new StringBuilder();
                userPrompt.AppendLine($"User's question: {question}");
                userPrompt.AppendLine("\nUser's financial context:");
                userPrompt.AppendLine($"- Monthly income (approx): {totalIncome} {user.Currency}");
                userPrompt.AppendLine($"- Monthly expenses (approx): {totalExpenses} {user.Currency}");

                if (topCategories.Any())
                {
                    userPrompt.AppendLine("- Top spending categories:");
                    foreach (var category in topCategories)
                    {
                        userPrompt.AppendLine($"  * {category.CategoryName}: {category.TotalAmount} {user.Currency}");
                    }
                }

                var chatCompletionsOptions = new ChatCompletionsOptions()
                {
                    Messages =
                    {
                        new ChatMessage(ChatRole.System, systemPrompt),
                        new ChatMessage(ChatRole.User, userPrompt.ToString())
                    },
                    MaxTokens = 500,
                    Temperature = 0.7f
                };

                var response = await _client.GetChatCompletionsAsync(_deploymentName, chatCompletionsOptions);
                return response.Value.Choices[0].Message.Content.Trim();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting financial advice");
                return "I'm sorry, I couldn't process your question at the moment. Please try again later.";
            }
        }

        public async Task<bool> DetectAnomalyAsync(Transaction transaction)
        {
            try
            {
                // Get the user's transaction history for this category
                var categoryTransactions = _context.Transactions
                    .Where(t => t.CategoryId == transaction.CategoryId)
                    .Where(t => t.Account.UserId == transaction.Account.UserId)
                    .Where(t => t.TransactionDate >= DateTime.UtcNow.AddMonths(-6))
                    .OrderByDescending(t => t.TransactionDate)
                    .Take(20)
                    .ToList();

                if (categoryTransactions.Count < 5)
                {
                    // Not enough history to detect anomalies reliably
                    return false;
                }

                // Calculate statistics
                var amounts = categoryTransactions.Select(t => t.Amount).ToList();
                var average = amounts.Average();

                // Calculate standard deviation
                var sumOfSquaresOfDifferences = amounts.Select(val => (val - average) * (val - average)).Sum();
                var standardDeviation = Math.Sqrt(sumOfSquaresOfDifferences / amounts.Count);

                // Calculate Z-score
                var zScore = Math.Abs((transaction.Amount - (decimal)average) / (decimal)standardDeviation);

                // If Z-score is greater than 3, it's an anomaly (99.7% of values should be within 3 standard deviations)
                return zScore > 3;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting anomaly");
                return false;
            }
        }
    }
}
