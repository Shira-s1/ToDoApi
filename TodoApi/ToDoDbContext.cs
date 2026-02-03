using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace TodoApi;

public partial class ToDoDbContext : DbContext
{
    public ToDoDbContext()
    {
    }

    public ToDoDbContext(DbContextOptions<ToDoDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Item> Items { get; set; }
    
    // --- כאן הוספנו את השורה החדשה (סעיף 3) ---
    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseMySql("name=ConnectionStrings:ToDoDB", Microsoft.EntityFrameworkCore.ServerVersion.Parse("8.0.41-mysql"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.IdItems).HasName("PRIMARY");
            entity.ToTable("items");
            entity.Property(e => e.IdItems).HasColumnName("idItems");
            entity.Property(e => e.IsComplete).HasColumnName("isComplete");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            
            // Map the new UserId column
            entity.Property(e => e.UserId).HasColumnName("userId");
        });

        // --- מומלץ להוסיף גם את זה כדי לוודא התאמה מושלמת ל-DB ---
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.IdUsers).HasName("PRIMARY");
            entity.ToTable("users"); // ודאי שזה שם הטבלה ב-MySQL (אותיות קטנות/גדולות)
            entity.Property(e => e.IdUsers).HasColumnName("idUsers");
            entity.Property(e => e.UserName).HasColumnName("userName");
            entity.Property(e => e.Password).HasColumnName("password");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}