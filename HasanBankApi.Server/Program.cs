using HasanBankApi.Server.Data;
using HasanBankApi.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Port (Render / Fly / Cloud Run inject PORT) ───────────
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// ── Database ──────────────────────────────────────────────
// Default: local SQLite file (zero setup, works on any free host).
// Override with ConnectionStrings__DefaultConnection to use SQL Server
// (e.g. the existing Somee database) without touching the code.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection is missing. Set the ConnectionStrings__DefaultConnection environment variable.");

var provider = builder.Configuration["Database:Provider"];
if (string.IsNullOrWhiteSpace(provider))
{
    provider = connectionString.Contains("Initial Catalog", StringComparison.OrdinalIgnoreCase)
            || connectionString.Contains("Server=", StringComparison.OrdinalIgnoreCase)
            || connectionString.Contains("User Id=", StringComparison.OrdinalIgnoreCase)
            || connectionString.Contains("User ID=", StringComparison.OrdinalIgnoreCase)
        ? "SqlServer"
        : "Sqlite";
}

if (provider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
    builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));
else
    builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

// ── JWT Auth ──────────────────────────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret))
{
    // No hardcoded secret in the repo: generate one per process.
    // Set Jwt__Secret in the host to keep sessions valid across restarts.
    jwtSecret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
    Console.WriteLine("[WARN] Jwt:Secret is not configured. Using a random secret for this run only.");
}

// Keep the in-memory configuration in sync so JwtService signs with the same key.
builder.Configuration["Jwt:Secret"] = jwtSecret;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// ── Reverse proxy support (Render, Fly.io, Cloud Run...) ──
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// ── CORS (only matters when the React app runs on another origin) ──
var allowedOrigins = (builder.Configuration["Cors:Origins"]
        ?? "https://localhost:5173,http://localhost:5173,https://localhost:53000,http://localhost:53000")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// ── Controllers ───────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<ClientService>();
builder.Services.AddHttpClient<GeminiService>();

var app = builder.Build();

app.UseForwardedHeaders();
app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("ReactPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

// ── Create/upgrade the database and seed the admin ────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

    if (db.Database.IsSqlite())
        await db.Database.EnsureCreatedAsync();          // SQLite: build schema from the model
    else
        await db.Database.MigrateAsync();                // SQL Server: apply migrations

    await DataSeeder.SeedAsync(db, config);
}

app.Run();
