using HasanBankApi.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HasanBankApi.Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<AiConversation> AiConversations => Set<AiConversation>();
    public DbSet<AiMessage> AiMessages => Set<AiMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Transaction → FromAccount (nullable)
        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.FromAccount)
            .WithMany()
            .HasForeignKey(t => t.FromAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // Transaction → ToAccount
        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.ToAccount)
            .WithMany()
            .HasForeignKey(t => t.ToAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // Account → Client
        modelBuilder.Entity<Account>()
            .HasOne(a => a.Client)
            .WithMany(c => c.Accounts)
            .HasForeignKey(a => a.ClientId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}