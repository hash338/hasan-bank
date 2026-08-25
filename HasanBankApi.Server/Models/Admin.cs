using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasanBankApi.Server.Models;

[Table("admins")]
public class Admin
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("username")]
    [MaxLength(50)]
    public string Username { get; set; } = "";

    [Column("password_hash")]
    [MaxLength(100)]
    public string PasswordHash { get; set; } = "";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}