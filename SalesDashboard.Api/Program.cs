using Microsoft.EntityFrameworkCore;
using SalesDashboard.Api.Models;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3001",
            "http://localhost:3000",
            "https://sales-dashboard-ui.onrender.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

// Database connection configuration
string connectionString;
if (builder.Environment.IsDevelopment())
{
    // Use your existing local connection string
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}
else
{
    // Parse Render's DATABASE_URL environment variable
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
    var databaseUri = new Uri(databaseUrl!);
    var userInfo = databaseUri.UserInfo.Split(':');

    // Use default PostgreSQL port if none specified
    var dbPort = databaseUri.Port == -1 ? 5432 : databaseUri.Port;

    connectionString = $"Host={databaseUri.Host};" +
                      $"Port={dbPort};" +
                      $"Database={databaseUri.LocalPath.TrimStart('/')};" +
                      $"Username={userInfo[0]};" +
                      $"Password={userInfo[1]};" +
                      $"SSL Mode=Require;" +
                      $"Trust Server Certificate=true";
}

builder.Services.AddDbContext<SalesDashboardContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

// Configure app port for Render deployment
var appPort = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Urls.Add($"http://0.0.0.0:{appPort}");

app.Run();