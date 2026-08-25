using HasanBankApi.Server.Data;
using HasanBankApi.Server.DTOs;
using HasanBankApi.Server.Models;
using HasanBankApi.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HasanBankApi.Server.Controllers;

[ApiController]
[Route("api/client/ai")]
[Authorize(Roles = "CLIENT")]
public class AiController : ControllerBase
{
    private readonly GeminiService _gemini;
    private readonly AppDbContext _db;

    public AiController(GeminiService gemini, AppDbContext db)
    {
        _gemini = gemini;
        _db = db;
    }

    private long GetClientId() =>
        long.Parse(User.FindFirstValue("id")!);

    // GET /api/client/ai/conversations
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var id = GetClientId();
        var list = await _db.AiConversations
            .Where(c => c.ClientId == id)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new {
                conversationId = c.Id,
                title = c.Title,
                createdAt = c.CreatedAt
            })
            .ToListAsync();
        return Ok(list);
    }

    // POST /api/client/ai/new-chat
    [HttpPost("new-chat")]
    public async Task<IActionResult> NewChat()
    {
        var id = GetClientId();
        var conv = new AiConversation
        {
            ClientId = id,
            Title = "New chat",
            CreatedAt = DateTime.UtcNow
        };
        _db.AiConversations.Add(conv);
        await _db.SaveChangesAsync();
        return Ok(new { conversationId = conv.Id });
    }

    // GET /api/client/ai/history?conversationId=xxx
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] Guid conversationId)
    {
        var id = GetClientId();
        var conv = await _db.AiConversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.ClientId == id);
        if (conv == null) return NotFound();

        var messages = await _db.AiMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new { role = m.Role, content = m.Content, createdAt = m.CreatedAt })
            .ToListAsync();

        return Ok(messages);
    }

    // DELETE /api/client/ai/conversations?conversationId=xxx
    [HttpDelete("conversations")]
    public async Task<IActionResult> DeleteConversation([FromQuery] Guid conversationId)
    {
        var id = GetClientId();
        var conv = await _db.AiConversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.ClientId == id);
        if (conv == null) return NotFound();

        _db.AiMessages.RemoveRange(conv.Messages);
        _db.AiConversations.Remove(conv);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // POST /api/client/ai/chat
    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] AiChatRequest req)
    {
        var id = GetClientId();
        var conv = await _db.AiConversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == Guid.Parse(req.ConversationId!) && c.ClientId == id);
        if (conv == null) return NotFound();

        // Save user message
        _db.AiMessages.Add(new AiMessage
        {
            ConversationId = conv.Id,
            Role = "USER",
            Content = req.Message,
            CreatedAt = DateTime.UtcNow
        });

        // Get reply from Gemini
        var reply = await _gemini.ChatAsync(req.Message);

        // Save bot message
        _db.AiMessages.Add(new AiMessage
        {
            ConversationId = conv.Id,
            Role = "BOT",
            Content = reply,
            CreatedAt = DateTime.UtcNow
        });

        // Update title from first message
        if (conv.Messages.Count == 0)
            conv.Title = req.Message.Length > 50
                ? req.Message[..50] + "..."
                : req.Message;

        await _db.SaveChangesAsync();

        return Ok(new { reply, conversationId = conv.Id });
    }
}