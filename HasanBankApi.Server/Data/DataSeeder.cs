using HasanBankApi.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HasanBankApi.Server.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // Create admin if none exists
        if (!await db.Admins.AnyAsync())
        {
            db.Admins.Add(new Admin
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }
    }
}