using HasanBankApi.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HasanBankApi.Server.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db, IConfiguration? config = null)
    {
        // Create admin if none exists
        if (!await db.Admins.AnyAsync())
        {
            var username = config?["Seed:AdminUsername"];
            var password = config?["Seed:AdminPassword"];

            if (string.IsNullOrWhiteSpace(username)) username = "admin";
            if (string.IsNullOrWhiteSpace(password))
            {
                password = "admin123";
                Console.WriteLine("[WARN] Using default admin password. Set Seed__AdminPassword in the host.");
            }

            db.Admins.Add(new Admin
            {
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }
    }
}
