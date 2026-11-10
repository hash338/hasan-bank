using HasanBankApi.Server.Data;
using HasanBankApi.Server.DTOs;
using HasanBankApi.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HasanBankApi.Server.Services;

public class ClientService
{
    private readonly AppDbContext _db;

    public ClientService(AppDbContext db)
    {
        _db = db;
    }

    // ── Helper: get client id from JWT ───────────────────
    public long GetClientId(ClaimsPrincipal user)
    {
        return long.Parse(user.FindFirstValue("id")!);
    }

    // ── Profile ───────────────────────────────────────────
    public async Task<ClientProfileResponse> GetProfileAsync(ClaimsPrincipal user)
    {
        var id = GetClientId(user);
        var client = await _db.Clients.FindAsync(id)
            ?? throw new Exception("Client not found");

        return new ClientProfileResponse(
            client.Id, client.FirstName, client.LastName,
            client.PayeeAddress, client.ClientPublicId16, client.CreatedAt);
    }

    public async Task<ClientProfileResponse> UpdateProfileAsync(ClaimsPrincipal user, UpdateProfileRequest req)
    {
        var id = GetClientId(user);
        var client = await _db.Clients.FindAsync(id)
            ?? throw new Exception("Client not found");

        client.FirstName = req.FirstName.Trim();
        client.LastName = req.LastName.Trim();
        await _db.SaveChangesAsync();

        return new ClientProfileResponse(
            client.Id, client.FirstName, client.LastName,
            client.PayeeAddress, client.ClientPublicId16, client.CreatedAt);
    }

    public async Task ChangePasswordAsync(ClaimsPrincipal user, ChangePasswordRequest req)
    {
        var id = GetClientId(user);
        var client = await _db.Clients.FindAsync(id)
            ?? throw new Exception("Client not found");

        if (!BCrypt.Net.BCrypt.Verify(req.OldPassword, client.PasswordHash))
            throw new Exception("Old password is incorrect");

        client.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await _db.SaveChangesAsync();
    }

    // ── Accounts ──────────────────────────────────────────
    public async Task<List<ClientAccountResponse>> GetAccountsAsync(ClaimsPrincipal user)
    {
        var id = GetClientId(user);
        return await _db.Accounts
            .Where(a => a.ClientId == id)
            .Select(a => new ClientAccountResponse(
                a.Id,
                a.Type,
                a.AccountNumber16,  // return full 16 digits
                a.Balance,
                a.WeeklyLimit,
                a.CreatedAt))
            .ToListAsync();
    }

    // ── Transactions ──────────────────────────────────────
    public async Task<List<ClientTransactionRow>> GetTransactionsAsync(ClaimsPrincipal user, bool weeklyOnly)
    {
        var id = GetClientId(user);
        var accountIds = await _db.Accounts
            .Where(a => a.ClientId == id)
            .Select(a => a.Id)
            .ToListAsync();

        var query = _db.Transactions
            .Include(t => t.FromAccount).ThenInclude(a => a.Client)
            .Include(t => t.ToAccount).ThenInclude(a => a.Client)
            .Where(t => accountIds.Contains(t.ToAccountId) ||
                        accountIds.Contains(t.FromAccountId ?? 0));

        if (weeklyOnly)
            query = query.Where(t => t.CreatedAt >= DateTime.UtcNow.AddDays(-7));

        var txs = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();

        return txs.Select(t =>
        {
            var isIn = accountIds.Contains(t.ToAccountId) && !accountIds.Contains(t.FromAccountId ?? 0);
            var fromPayee = t.FromAccount == null ? "BANK" : t.FromAccount.Client.PayeeAddress;
            var toPayee = t.ToAccount?.Client?.PayeeAddress ?? "";

            return new ClientTransactionRow(
                t.Id,
                t.Type,
                t.Amount,
                t.Message,
                isIn ? "IN" : "OUT",
                fromPayee,
                toPayee,
                t.FromAccount?.Type,
                t.ToAccount?.Type,
                t.CreatedAt
            );
        }).ToList();
    }

    // ── Summary ───────────────────────────────────────────
    public async Task<ClientSummaryResponse> GetSummaryAsync(ClaimsPrincipal user)
    {
        var id = GetClientId(user);
        var accountIds = await _db.Accounts
            .Where(a => a.ClientId == id)
            .Select(a => a.Id)
            .ToListAsync();

        var txs = await _db.Transactions
            .Where(t => accountIds.Contains(t.ToAccountId) ||
                        accountIds.Contains(t.FromAccountId ?? 0))
            .ToListAsync();

        var income = txs
            .Where(t => accountIds.Contains(t.ToAccountId) &&
                        !accountIds.Contains(t.FromAccountId ?? 0))
            .Sum(t => t.Amount);

        var expenses = txs
            .Where(t => accountIds.Contains(t.FromAccountId ?? 0))
            .Sum(t => t.Amount);

        return new ClientSummaryResponse(income, expenses);
    }

    // ── Send Money ────────────────────────────────────────
    public async Task SendMoneyAsync(ClaimsPrincipal user, SendMoneyRequest req)
    {
        var id = GetClientId(user);

        var fromAccount = await _db.Accounts
            .FirstOrDefaultAsync(a => a.ClientId == id && a.Type == req.FromAccountType)
            ?? throw new Exception("Account not found");

        if (fromAccount.Balance < req.Amount)
            throw new Exception("Insufficient balance");

        // Weekly limit check
        // NOTE: summed in memory on purpose — SQLite cannot SUM decimal columns.
        var weeklyAmounts = await _db.Transactions
            .Where(t => t.FromAccountId == fromAccount.Id &&
                        t.Type == "SEND_MONEY" &&
                        t.CreatedAt >= DateTime.UtcNow.AddDays(-7))
            .Select(t => t.Amount)
            .ToListAsync();
        var weeklySpent = weeklyAmounts.Sum();

        if (weeklySpent + req.Amount > fromAccount.WeeklyLimit)
            throw new Exception("Weekly limit exceeded");

        var toClient = await _db.Clients
            .Include(c => c.Accounts)
            .FirstOrDefaultAsync(c => c.PayeeAddress == req.ToPayeeAddress)
            ?? throw new Exception("Recipient not found");

        var toAccount = toClient.Accounts.FirstOrDefault()
            ?? throw new Exception("Recipient has no account");

        fromAccount.Balance -= req.Amount;
        toAccount.Balance += req.Amount;

        _db.Transactions.Add(new Transaction
        {
            FromAccountId = fromAccount.Id,
            ToAccountId = toAccount.Id,
            Amount = req.Amount,
            Type = "SEND_MONEY",
            Message = req.Message,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
    }

    // ── Internal Transfer ─────────────────────────────────
    public async Task InternalTransferAsync(ClaimsPrincipal user, InternalTransferRequest req)
    {
        var id = GetClientId(user);

        var fromAccount = await _db.Accounts
            .FirstOrDefaultAsync(a => a.ClientId == id && a.Type == req.FromAccountType)
            ?? throw new Exception("Source account not found");

        var toAccount = await _db.Accounts
            .FirstOrDefaultAsync(a => a.ClientId == id && a.Type == req.ToAccountType)
            ?? throw new Exception("Destination account not found");

        if (fromAccount.Balance < req.Amount)
            throw new Exception("Insufficient balance");

        fromAccount.Balance -= req.Amount;
        toAccount.Balance += req.Amount;

        _db.Transactions.Add(new Transaction
        {
            FromAccountId = fromAccount.Id,
            ToAccountId = toAccount.Id,
            Amount = req.Amount,
            Type = "INTERNAL",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
    }
}