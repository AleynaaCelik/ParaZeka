// src/ParaZeka.API/Program.cs
using Microsoft.EntityFrameworkCore;
using ParaZeka.API.Middlewares;
using ParaZeka.Application;
using ParaZeka.Infrastructure;
using ParaZeka.Persistence;
using ParaZeka.Persistence.Seed; // Seed s�n�f� i�in namespace ekleyin

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddPersistence(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Development only database initialization
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.EnsureCreated();

        // ApplicationDbContextSeed s�n�f�n� kullan�rken do�ru namespace'i referans edin
        await ApplicationDbContextSeed.SeedDefaultDataAsync(db);
    }
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<ErrorHandlingMiddleware>();

app.MapControllers();

app.Run();