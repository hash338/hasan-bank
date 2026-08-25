using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasanBankApi.Server.Models;

[Table("clients")]
public class Client
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("first_name")]
    [MaxLength(60)]
    public string FirstName { get; set; } = "";

    [Column("last_name")]
    [MaxLength(60)]
    public string LastName { get; set; } = "";

    [Column("payee_address")]
    [MaxLength(80)]
    public string PayeeAddress { get; set; } = "";

    [Column("password_hash")]
    [MaxLength(100)]
    public string PasswordHash { get; set; } = "";

    [Column("client_public_id_16")]
    [MaxLength(16)]
    public string ClientPublicId16 { get; set; } = "";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Account> Accounts { get; set; } = new List<Account>();
}