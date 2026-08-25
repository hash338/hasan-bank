using HasanBankApi.Server.DTOs;
using HasanBankApi.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HasanBankApi.Server.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "ADMIN")]
public class AdminController : ControllerBase
{
    private readonly AdminService _service;

    public AdminController(AdminService service)
    {
        _service = service;
    }

    // POST /api/admin/clients
    [HttpPost("clients")]
    public async Task<IActionResult> CreateClient([FromBody] CreateClientRequest req)
    {
        try
        {
            var result = await _service.CreateClientAsync(req);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/admin/clients
    [HttpGet("clients")]
    public async Task<IActionResult> ListClients()
    {
        var result = await _service.ListClientsAsync();
        return Ok(result);
    }

    // DELETE /api/admin/clients/{clientId}
    [HttpDelete("clients/{clientId}")]
    public async Task<IActionResult> DeleteClient(long clientId)
    {
        try
        {
            await _service.DeleteClientAsync(clientId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/admin/clients/search?payeeAddress=@john
    [HttpGet("clients/search")]
    public async Task<IActionResult> SearchClient([FromQuery] string payeeAddress)
    {
        try
        {
            var result = await _service.SearchClientAsync(payeeAddress);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // POST /api/admin/deposits
    [HttpPost("deposits")]
    public async Task<IActionResult> Deposit([FromBody] DepositRequest req)
    {
        try
        {
            var result = await _service.DepositAsync(req);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}