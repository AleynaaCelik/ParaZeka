using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ParaZeka.Application.Common.Interfaces;
using ParaZeka.Domain.Entities;
using System.Security.Claims;

namespace ParaZeka.API.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;
        private readonly ILogger<AIController> _logger;

        public AIController(
            IAIService aiService,
            ILogger<AIController> logger)
        {
            _aiService = aiService;
            _logger = logger;
        }

        [HttpGet("insights")]
        public async Task<ActionResult<List<FinancialInsight>>> GetInsights()
        {
            try
            {
                var userId = GetUserId();
                var insights = await _aiService.GenerateInsightsAsync(userId);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Finansal öngörüler alınırken hata oluştu");
                return StatusCode(500, "Finansal öngörüler alınırken bir hata oluştu");
            }
        }

        [HttpGet("monthly-forecast")]
        public async Task<ActionResult<decimal>> GetMonthlyForecast([FromQuery] int monthsAhead = 1)
        {
            try
            {
                var userId = GetUserId();
                var forecast = await _aiService.PredictMonthlyExpenseAsync(userId, monthsAhead);
                return Ok(forecast);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Aylık harcama tahmini yapılırken hata oluştu");
                return StatusCode(500, "Aylık harcama tahmini yapılırken bir hata oluştu");
            }
        }

        [HttpPost("ask")]
        public async Task<ActionResult<string>> AskFinancialQuestion([FromBody] FinancialQuestionDto question)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(question.Question))
                {
                    return BadRequest("Soru boş olamaz");
                }

                var userId = GetUserId();
                var answer = await _aiService.GetFinancialAdviceAsync(question.Question, userId);
                return Ok(new { answer });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Finansal tavsiye alınırken hata oluştu");
                return StatusCode(500, "Finansal tavsiye alınırken bir hata oluştu");
            }
        }

        [HttpPost("detect-anomaly")]
        public async Task<ActionResult<bool>> DetectAnomaly([FromBody] Transaction transaction)
        {
            try
            {
                if (transaction == null)
                {
                    return BadRequest("İşlem bilgileri geçersiz");
                }

                // Kullanıcı güvenliği kontrolü
                var userId = GetUserId();
                transaction.UserId = userId; // Kullanıcı ID'sini güvenlik için zorla ata

                var isAnomaly = await _aiService.DetectAnomalyAsync(transaction);
                return Ok(new { isAnomaly });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Anomali tespiti yapılırken hata oluştu");
                return StatusCode(500, "Anomali tespiti yapılırken bir hata oluştu");
            }
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Kullanıcı kimliği bulunamadı");
            }
            return userId;
        }
    }

    public class FinancialQuestionDto
    {
        public string Question { get; set; }
    }
}

