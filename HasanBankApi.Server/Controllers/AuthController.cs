using HasanBankApi.Server.Data;
using HasanBankApi.Server.DTOs;
using HasanBankApi.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HasanBankApi.Server.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;

    public AuthController(AppDbContext db, JwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    // POST /api/auth/admin/login
    [HttpPost("admin/login")]
    public async Task<IActionResult> AdminLogin([FromBody] AdminLoginRequest req)
    {
        var admin = await _db.Admins
            .FirstOrDefaultAsync(a => a.Username == req.Username);

        if (admin == null || !BCrypt.Net.BCrypt.Verify(req.Password, admin.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials" });

        var token = _jwt.CreateToken(admin.Id, "ADMIN");
        return Ok(new AuthResponse(token, "ADMIN"));
    }

    // POST /api/auth/client/login
    [HttpPost("client/login")]
    public async Task<IActionResult> ClientLogin([FromBody] ClientLoginRequest req)
    {
        var client = await _db.Clients
            .FirstOrDefaultAsync(c => c.PayeeAddress == req.PayeeAddress);

        if (client == null || !BCrypt.Net.BCrypt.Verify(req.Password, client.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials" });

        var token = _jwt.CreateToken(client.Id, "CLIENT");
        return Ok(new AuthResponse(token, "CLIENT"));
    }
}