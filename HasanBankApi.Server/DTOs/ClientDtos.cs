namespace HasanBankApi.Server.DTOs;

public record ClientProfileResponse(
    long ClientId,
    string FirstName,
    string LastName,
    string PayeeAddress,
    string ClientPublicId16,
    DateTime CreatedAt
);

public record AiChatRequest(string Message, string? ConversationId);
public record AiChatResponse(string Reply, string ConversationId);

public record UpdateProfileRequest(
    string FirstName,
    string LastName
);

public record ChangePasswordRequest(
    string OldPassword,
    string NewPassword
);

public record ClientAccountResponse(
    long AccountId,
    string Type,
    string AccountNumber16,  // changed from AccountNumberLast8
    decimal Balance,
    decimal WeeklyLimit,
    DateTime CreatedAt
);

public record ClientTransactionRow(
    long TransactionId,
    string Type,
    decimal Amount,
    string? Message,
    string Direction,
    string? FromPayee,
    string? ToPayee,
    string? FromAccountType,
    string? ToAccountType,
    DateTime CreatedAt
);

public record ClientSummaryResponse(
    decimal Income,
    decimal Expenses
);

public record SendMoneyRequest(
    string FromAccountType,
    string ToPayeeAddress,
    decimal Amount,
    string? Message
);

public record InternalTransferRequest(
    string FromAccountType,
    string ToAccountType,
    decimal Amount
);

public record MessageResponse(string Message);