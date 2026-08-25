namespace HasanBankApi.Server.DTOs;

public record CreateClientRequest(
    string FirstName,
    string LastName,
    string Password,
    bool AddCheckingAccount,
    decimal CheckingInitialBalance,
    bool AddSavingsAccount,
    decimal SavingsInitialBalance
);

public record AccountInfo(
    long Id,
    string Type,
    string AccountNumber16,
    decimal Balance,
    decimal WeeklyLimit,
    DateTime CreatedAt
);

public record CreateClientResponse(
    long ClientId,
    string FirstName,
    string LastName,
    string PayeeAddress,
    string ClientPublicId16,
    DateTime CreatedAt,
    List<AccountInfo> Accounts
);

public record ClientRowResponse(
    long ClientId,
    string FirstName,
    string LastName,
    string PayeeAddress,
    string ClientPublicId16,
    DateTime CreatedAt
);

public record DepositRequest(
    string PayeeAddress,
    string? TargetAccountType,
    decimal Amount
);

public record DepositResponse(
    string PayeeAddress,
    string AccountType,
    decimal NewBalance
);

public record SearchClientResponse(
    long ClientId,
    string FirstName,
    string LastName,
    string PayeeAddress,
    string ClientPublicId16,
    List<AccountInfo> Accounts
);