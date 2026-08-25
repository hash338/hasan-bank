using HasanBankApi.Server.DTOs;
using HasanBankApi.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HasanBankApi.Server.Controllers;

[ApiController]
[Route("api/client")]
[Authorize(Roles = "CLIENT")]
public class ClientController : ControllerBase
{
    private readonly ClientService _service;

    public ClientController(ClientService service)
    {
        _service = service;
    }

    // GET /api/client/profile
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var result = await _service.GetProfileAsync(User);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT /api/client/profile
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
    {
        try
        {
            var result = await _service.UpdateProfileAsync(User, req);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT /api/client/profile/password
    [HttpPut("profile/password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        try
        {
            await _service.ChangePasswordAsync(User, req);
            return Ok(new MessageResponse("Password changed successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/client/accounts
    [HttpGet("accounts")]
    public async Task<IActionResult> GetAccounts()
    {
        var result = await _service.GetAccountsAsync(User);
        return Ok(result);
    }

    // GET /api/client/transactions
    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions([FromQuery] string? range)
    {
        var weekly = range?.ToLower() == "weekly";
        var result = await _service.GetTransactionsAsync(User, weekly);
        return Ok(result);
    }

    // GET /api/client/summary
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var result = await _service.GetSummaryAsync(User);
        return Ok(result);
    }

    // POST /api/client/transfers/send-money
    [HttpPost("transfers/send-money")]
    public async Task<IActionResult> SendMoney([FromBody] SendMoneyRequest req)
    {
        try
        {
            await _service.SendMoneyAsync(User, req);
            return Ok(new MessageResponse("Sent successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST /api/client/transfers/internal
    [HttpPost("transfers/internal")]
    public async Task<IActionResult> InternalTransfer([FromBody] InternalTransferRequest req)
    {
        try
        {
            await _service.InternalTransferAsync(User, req);
            return Ok(new MessageResponse("Transfer successful"));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}