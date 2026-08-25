using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasanBankApi.Server.Models;

[Table("ai_messages")]
public class AiMessage
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("conversation_id")]
    public Guid ConversationId { get; set; }

    [ForeignKey("ConversationId")]
    public AiConversation Conversation { get; set; } = null!;

    [Column("role")]
    [MaxLength(10)]
    public string Role { get; set; } = "USER"; // USER / BOT

    [Column("content")]
    public string Content { get; set; } = "";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}