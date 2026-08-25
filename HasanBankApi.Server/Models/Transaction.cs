using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasanBankApi.Server.Models;

[Table("transactions")]
public class Transaction
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("from_account_id")]
    public long? FromAccountId { get; set; }

    [ForeignKey("FromAccountId")]
    public Account? FromAccount { get; set; }

    [Column("to_account_id")]
    public long ToAccountId { get; set; }

    [ForeignKey("ToAccountId")]
    public Account ToAccount { get; set; } = null!;

    [Column("amount", TypeName = "decimal(19,2)")]
    public decimal Amount { get; set; }

    [Column("type")]
    [MaxLength(30)]
    public string Type { get; set; } = ""; // DEPOSIT / SEND_MONEY / INTERNAL

    [Column("message")]
    public string? Message { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}