using System.Text;
using System.Text.Json;

namespace HasanBankApi.Server.Services;

public class GeminiService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;

    public GeminiService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _config = config;
    }

    public async Task<string> ChatAsync(string userMessage)
    {
        var apiKey = _config["Gemini:ApiKey"]!;
        var model = _config["Gemini:Model"]!;
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

        var body = new
        {
            contents = new[]
            {
            new
            {
                parts = new[]
                {
                    new { text = userMessage }
                }
            }
        }
        };

        var json = JsonSerializer.Serialize(body);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _http.PostAsync(url, content);
        var responseBody = await response.Content.ReadAsStringAsync();

        try
        {
            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;

            // Check for error
            if (root.TryGetProperty("error", out var error))
                return $"Gemini error: {error.GetProperty("message").GetString()}";

            // Get response text
            if (root.TryGetProperty("candidates", out var candidates) &&
                candidates.GetArrayLength() > 0)
            {
                var candidate = candidates[0];
                if (candidate.TryGetProperty("content", out var contentProp) &&
                    contentProp.TryGetProperty("parts", out var parts) &&
                    parts.GetArrayLength() > 0)
                {
                    return parts[0].GetProperty("text").GetString() ?? "No response";
                }
            }

            return "No response from Gemini";
        }
        catch
        {
            return $"Parse error: {responseBody}";
        }
    }
}