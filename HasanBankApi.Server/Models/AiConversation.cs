using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasanBankApi.Server.Models;

[Table("ai_conversations")]
public class AiConversation
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("client_id")]
    public long ClientId { get; set; }

    [ForeignKey("ClientId")]
    public Client Client { get; set; } = null!;

    [Column("title")]
    [MaxLength(120)]
    public string Title { get; set; } = "New chat";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AiMessage> Messages { get; set; } = new List<AiMessage>();
}