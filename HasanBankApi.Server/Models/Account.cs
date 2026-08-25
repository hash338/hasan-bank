using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasanBankApi.Server.Models;

[Table("accounts")]
public class Account
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("client_id")]
    public long ClientId { get; set; }

    [ForeignKey("ClientId")]
    public Client Client { get; set; } = null!;

    [Column("type")]
    [MaxLength(20)]
    public string Type { get; set; } = ""; // CHECKING / SAVINGS

    [Column("account_number_16")]
    [MaxLength(16)]
    public string AccountNumber16 { get; set; } = "";

    [Column("balance", TypeName = "decimal(19,2)")]
    public decimal Balance { get; set; } = 0;

    [Column("weekly_limit", TypeName = "decimal(19,2)")]
    public decimal WeeklyLimit { get; set; } = 2000;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}