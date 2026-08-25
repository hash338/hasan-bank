using HasanBankApi.Server.Data;
using HasanBankApi.Server.DTOs;
using HasanBankApi.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HasanBankApi.Server.Services;

public class AdminService
{
    private readonly AppDbContext _db;

    public AdminService(AppDbContext db)
    {
        _db = db;
    }

    // ── Create Client ─────────────────────────────────────
    public async Task<CreateClientResponse> CreateClientAsync(CreateClientRequest req)
    {
        // Generate unique payee address
        var firstName = req.FirstName.Trim();
        var lastName = req.LastName.Trim();
        var basePayee = $"@{char.ToLower(firstName[0])}{firstName[1..].ToLower()}{char.ToUpper(lastName[0])}{lastName[1..].ToLower()}";

        var payee = basePayee;
        int suffix = 1;
        while (await _db.Clients.AnyAsync(c => c.PayeeAddress == payee))
            payee = $"{basePayee}{suffix++}";

        // Generate unique public ID
        string publicId;
        do { publicId = GenerateDigits(16); }
        while (await _db.Clients.AnyAsync(c => c.ClientPublicId16 == publicId));

        var client = new Client
        {
            FirstName = firstName,
            LastName = lastName,
            PayeeAddress = payee,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password.Trim()),
            ClientPublicId16 = publicId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Clients.Add(client);
        await _db.SaveChangesAsync();

        // Create accounts
        var accounts = new List<Account>();

        if (req.AddCheckingAccount)
        {
            var acc = new Account
            {
                ClientId = client.Id,
                Type = "CHECKING",
                AccountNumber16 = await UniqueAccountNumber(),
                Balance = req.CheckingInitialBalance,
                WeeklyLimit = 2000,
                CreatedAt = DateTime.UtcNow
            };
            _db.Accounts.Add(acc);
            accounts.Add(acc);
        }

        if (req.AddSavingsAccount)
        {
            var acc = new Account
            {
                ClientId = client.Id,
                Type = "SAVINGS",
                AccountNumber16 = await UniqueAccountNumber(),
                Balance = req.SavingsInitialBalance,
                WeeklyLimit = 2000,
                CreatedAt = DateTime.UtcNow
            };
            _db.Accounts.Add(acc);
            accounts.Add(acc);
        }

        await _db.SaveChangesAsync();

        return new CreateClientResponse(
            client.Id,
            client.FirstName,
            client.LastName,
            client.PayeeAddress,
            client.ClientPublicId16,
            client.CreatedAt,
            accounts.Select(a => new AccountInfo(
                a.Id, a.Type, a.AccountNumber16,
                a.Balance, a.WeeklyLimit, a.CreatedAt)).ToList()
        );
    }

    // ── List Clients ──────────────────────────────────────
    public async Task<List<ClientRowResponse>> ListClientsAsync()
    {
        return await _db.Clients
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new ClientRowResponse(
                c.Id, c.FirstName, c.LastName,
                c.PayeeAddress, c.ClientPublicId16, c.CreatedAt))
            .ToListAsync();
    }

    // ── Delete Client ─────────────────────────────────────
    public async Task DeleteClientAsync(long clientId)
    {
        var client = await _db.Clients
            .Include(c => c.Accounts)
            .FirstOrDefaultAsync(c => c.Id == clientId)
            ?? throw new Exception("Client not found");

        var accountIds = client.Accounts.Select(a => a.Id).ToList();

        var txs = await _db.Transactions
            .Where(t => accountIds.Contains(t.FromAccountId ?? 0) ||
                        accountIds.Contains(t.ToAccountId))
            .ToListAsync();

        _db.Transactions.RemoveRange(txs);
        _db.Accounts.RemoveRange(client.Accounts);
        _db.Clients.Remove(client);
        await _db.SaveChangesAsync();
    }

    // ── Search Client ─────────────────────────────────────
    public async Task<SearchClientResponse> SearchClientAsync(string payeeAddress)
    {
        var client = await _db.Clients
            .Include(c => c.Accounts)
            .FirstOrDefaultAsync(c => c.PayeeAddress == payeeAddress)
            ?? throw new Exception("Client not found");

        return new SearchClientResponse(
            client.Id,
            client.FirstName,
            client.LastName,
            client.PayeeAddress,
            client.ClientPublicId16,
            client.Accounts.Select(a => new AccountInfo(
                a.Id, a.Type, a.AccountNumber16,
                a.Balance, a.WeeklyLimit, a.CreatedAt)).ToList()
        );
    }

    // ── Deposit ───────────────────────────────────────────
    public async Task<DepositResponse> DepositAsync(DepositRequest req)
    {
        var client = await _db.Clients
            .Include(c => c.Accounts)
            .FirstOrDefaultAsync(c => c.PayeeAddress == req.PayeeAddress)
            ?? throw new Exception("Client not found");

        Account account;
        if (req.TargetAccountType != null)
            account = client.Accounts.First(a => a.Type == req.TargetAccountType);
        else
            account = client.Accounts.First();

        account.Balance += req.Amount;

        _db.Transactions.Add(new Transaction
        {
            FromAccountId = null,
            ToAccountId = account.Id,
            Amount = req.Amount,
            Type = "DEPOSIT",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return new DepositResponse(client.PayeeAddress, account.Type, account.Balance);
    }

    // ── Helpers ───────────────────────────────────────────
    private static string GenerateDigits(int length)
    {
        var rng = new Random();
        return string.Concat(Enumerable.Range(0, length).Select(_ => rng.Next(0, 10).ToString()));
    }

    private async Task<string> UniqueAccountNumber()
    {
        string num;
        do { num = GenerateDigits(16); }
        while (await _db.Accounts.AnyAsync(a => a.AccountNumber16 == num));
        return num;
    }
}