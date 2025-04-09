// src/ParaZeka.Infrastructure/Services/BankIntegrationService.cs
using Microsoft.Extensions.Logging;
using ParaZeka.Application.Common.Interfaces;
using ParaZeka.Domain.Entities;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace ParaZeka.Infrastructure.Services
{
    public class BankIntegrationService : IBankIntegrationService
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly ILogger<BankIntegrationService> _logger;

        public BankIntegrationService(
            IHttpClientFactory clientFactory,
            ILogger<BankIntegrationService> logger)
        {
            _clientFactory = clientFactory;
            _logger = logger;
        }

        public async Task<bool> AuthenticateAsync(string bankName, string username, string password)
        {
            try
            {
                // Bu bir örnek implementasyondur, gerçek dünyada bir banka API'sine bağlanacaktır

                var client = _clientFactory.CreateClient();

                // Banka adına göre API URL'ini belirleme
                var apiUrl = GetBankApiUrl(bankName, "auth");

                // İstek içeriğini oluşturma
                var content = new StringContent(
                    JsonSerializer.Serialize(new { username, password }),
                    Encoding.UTF8,
                    "application/json");

                // İsteği gönderme
                var response = await client.PostAsync(apiUrl, content);

                // Kimlik doğrulamanın başarılı olup olmadığını kontrol etme
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Banka ile kimlik doğrulama hatası {BankName}", bankName);
                return false;
            }
        }

        public async Task<decimal> GetAccountBalanceAsync(string bankName, string accessToken, string accountNumber)
        {
            try
            {
                var client = _clientFactory.CreateClient();

                // API URL'ini ayarlama
                var apiUrl = GetBankApiUrl(bankName, $"accounts/{accountNumber}/balance");

                // Yetkilendirme başlığını ekleme
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                // İsteği gönderme
                var response = await client.GetAsync(apiUrl);

                // İsteğin başarılı olup olmadığını kontrol etme
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var balanceData = JsonSerializer.Deserialize<JsonElement>(content);

                    if (balanceData.TryGetProperty("balance", out var balanceElement) &&
                        balanceElement.TryGetDecimal(out var balance))
                    {
                        return balance;
                    }
                }

                _logger.LogWarning("Banka hesap bakiyesi alınamadı {BankName}", bankName);
                return 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Banka hesap bakiyesi alma hatası {BankName}", bankName);
                return 0;
            }
        }

        public async Task<string> GetAccessTokenAsync(string bankName, string authCode)
        {
            try
            {
                var client = _clientFactory.CreateClient();

                // API URL'ini ayarlama
                var apiUrl = GetBankApiUrl(bankName, "token");

                // İstek içeriğini oluşturma
                var content = new StringContent(
                    JsonSerializer.Serialize(new { code = authCode }),
                    Encoding.UTF8,
                    "application/json");

                // İsteği gönderme
                var response = await client.PostAsync(apiUrl, content);

                // İsteğin başarılı olup olmadığını kontrol etme
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var tokenData = JsonSerializer.Deserialize<JsonElement>(responseContent);

                    if (tokenData.TryGetProperty("access_token", out var tokenElement))
                    {
                        return tokenElement.GetString() ?? string.Empty;
                    }
                }

                _logger.LogWarning("Bankadan erişim belirteci alınamadı {BankName}", bankName);
                return string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bankadan erişim belirteci alma hatası {BankName}", bankName);
                return string.Empty;
            }
        }

        public async Task<List<Transaction>> FetchTransactionsAsync(string bankName, string accessToken, DateTime startDate, DateTime endDate)
        {
            try
            {
                var client = _clientFactory.CreateClient();

                // API URL'ini ayarlama
                var apiUrl = GetBankApiUrl(
                    bankName,
                    $"transactions?startDate={startDate:yyyy-MM-dd}&endDate={endDate:yyyy-MM-dd}");

                // Yetkilendirme başlığını ekleme
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                // İsteği gönderme
                var response = await client.GetAsync(apiUrl);

                // İsteğin başarılı olup olmadığını kontrol etme
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var transactionsData = JsonSerializer.Deserialize<JsonElement>(content);

                    if (transactionsData.TryGetProperty("transactions", out var transactionsElement) &&
                        transactionsElement.ValueKind == JsonValueKind.Array)
                    {
                        var transactions = new List<Transaction>();

                        foreach (var item in transactionsElement.EnumerateArray())
                        {
                            var transaction = new Transaction
                            {
                                Id = Guid.NewGuid(),
                                Amount = item.GetProperty("amount").GetDecimal(),
                                Description = item.GetProperty("description").GetString() ?? string.Empty,
                                TransactionDate = item.GetProperty("date").GetDateTime(),
                                Type = item.GetProperty("isExpense").GetBoolean()
                                    ? TransactionType.Expense
                                    : TransactionType.Income,
                                Currency = item.GetProperty("currency").GetString() ?? "TRY",
                                CreatedDate = DateTime.UtcNow
                            };

                            // Eğer varsa, işlem kategorisini ekleyelim
                            if (item.TryGetProperty("category", out var categoryElement) &&
                                !string.IsNullOrEmpty(categoryElement.GetString()))
                            {
                                // Kategoriyi isimden bulmalıyız, burada sadece bir örnek
                                // Gerçek uygulamada, kategorileri adlarına göre bulmalısınız
                                transaction.CategoryId = null; // Kategori bulunamadı
                            }

                            // Eğer varsa, işlem yerini ekleyelim
                            if (item.TryGetProperty("merchant", out var merchantElement))
                            {
                                transaction.MerchantName = merchantElement.GetString();
                            }

                            // Eğer varsa, işlem konumunu ekleyelim
                            if (item.TryGetProperty("location", out var locationElement))
                            {
                                transaction.Location = locationElement.GetString();
                            }

                            transactions.Add(transaction);
                        }

                        return transactions;
                    }
                }

                _logger.LogWarning("Bankadan işlemler alınamadı {BankName}", bankName);
                return new List<Transaction>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bankadan işlem alma hatası {BankName}", bankName);
                return new List<Transaction>();
            }
        }

        // Banka API URL'lerini bankaya göre belirleme yardımcı metodu
        private string GetBankApiUrl(string bankName, string endpoint)
        {
            // Gerçek bir uygulamada bu, konfigürasyondan alınacaktır
            switch (bankName.ToLower())
            {
                case "garanti":
                    return $"https://api.garanti.com/{endpoint}";
                case "akbank":
                    return $"https://api.akbank.com/{endpoint}";
                case "isbank":
                    return $"https://api.isbank.com/{endpoint}";
                case "yapikredi":
                    return $"https://api.yapikredi.com/{endpoint}";
                case "ziraat":
                    return $"https://api.ziraatbank.com/{endpoint}";
                // Diğer bankalar için eklemeler yapılabilir
                default:
                    return $"https://api.{bankName.ToLower()}.com/{endpoint}";
            }
        }
    }
}