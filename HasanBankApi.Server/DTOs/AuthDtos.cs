namespace HasanBankApi.Server.DTOs;

public record AdminLoginRequest(string Username, string Password);
public record ClientLoginRequest(string PayeeAddress, string Password);
public record AuthResponse(string AccessToken, string Role);