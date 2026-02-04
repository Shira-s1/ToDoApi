using TodoApi;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Register Swagger Services (with Security Definition) ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Todo API", Version = "v1" });

    // Define Security Scheme for JWT
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", securityScheme);

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            securityScheme,
            new string[] {}
        }
    });
});

// --- 2. Register Authentication & Authorization Services ---
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("Jwt:Key is missing! Please set it in appsettings.json or environment variables (Jwt__Key).");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// --- 3. CORS Configuration ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.SetIsOriginAllowed(origin => true) // More permissive for debugging
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// --- 4. Database Connection ---

var connectionString = builder.Configuration.GetConnectionString("ToDoDB");
builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

var app = builder.Build();

// --- 5. Middleware Pipeline ---
app.UseSwagger();
app.UseSwaggerUI();


app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "ToDo API is running! Go to /swagger to test it.");

// --- Auth Endpoints ---

// Register
app.MapPost("/register", async (ToDoDbContext db, User newUser) =>
{
    if (string.IsNullOrEmpty(newUser.UserName) || string.IsNullOrEmpty(newUser.Password))
        return Results.BadRequest("Username and password are required.");

    var existingUser = await db.Users.FirstOrDefaultAsync(u => u.UserName == newUser.UserName);
    if (existingUser != null)
        return Results.Conflict("User already exists.");

    newUser.Password = BCrypt.Net.BCrypt.HashPassword(newUser.Password);

    db.Users.Add(newUser);
    await db.SaveChangesAsync();

    return Results.Ok("User registered successfully.");
});

// Login
app.MapPost("/login", async (ToDoDbContext db, User loginUser, IConfiguration config) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.UserName == loginUser.UserName);

    if (user == null || !BCrypt.Net.BCrypt.Verify(loginUser.Password, user.Password))
        return Results.Unauthorized();

    var jwtKey = config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing!");
    var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.IdUsers.ToString()),
        new Claim(ClaimTypes.Name, user.UserName)
    };

    var token = new JwtSecurityToken(
        issuer: config["Jwt:Issuer"],
        audience: config["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddMinutes(60),
        signingCredentials: credentials);

    var jwt = new JwtSecurityTokenHandler().WriteToken(token);

    return Results.Ok(new { token = jwt });
});


// --- Protected Items Endpoints ---
// Added .RequireAuthorization() to all items endpoints

app.MapGet("/items", async (ToDoDbContext db, ClaimsPrincipal user) =>
{
    var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    return await db.Items.Where(t => t.UserId == userId).ToListAsync();
})
.RequireAuthorization();

app.MapPost("/items", async (ToDoDbContext db, Item newItem, ClaimsPrincipal user) =>
{
    var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    newItem.UserId = userId;

    db.Items.Add(newItem);
    await db.SaveChangesAsync();
    return Results.Created($"/items/{newItem.IdItems}", newItem);
})
.RequireAuthorization();

app.MapPut("/items/{id}", async (ToDoDbContext db, int id, Item inputItem, ClaimsPrincipal user) =>
{
    var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    var item = await db.Items.FirstOrDefaultAsync(i => i.IdItems == id && i.UserId == userId);

    if (item is null) return Results.NotFound();

    item.Name = inputItem.Name;
    item.IsComplete = inputItem.IsComplete;

    await db.SaveChangesAsync();
    return Results.NoContent();
})
.RequireAuthorization();

app.MapDelete("/items/{id}", async (ToDoDbContext db, int id, ClaimsPrincipal user) =>
{
    var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    var item = await db.Items.FirstOrDefaultAsync(i => i.IdItems == id && i.UserId == userId);

    if (item is null) return Results.NotFound();

    db.Items.Remove(item);
    await db.SaveChangesAsync();
    return Results.Ok(item);
})
.RequireAuthorization();

app.Run();