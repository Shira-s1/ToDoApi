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
            entity.ToTable("Items"); // exact match
            entity.Property(e => e.IdItems).HasColumnName("IdItems");
            entity.Property(e => e.IsComplete).HasColumnName("IsComplete");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("Name");
            
            // Map the new UserId column
            entity.Property(e => e.UserId).HasColumnName("UserId");
        });

        // --- מומלץ להוסיף גם את זה כדי לוודא התאמה מושלמת ל-DB ---
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.IdUsers).HasName("PRIMARY");
            entity.ToTable("Users"); // exact match
            entity.Property(e => e.IdUsers).HasColumnName("IdUsers");
            entity.Property(e => e.UserName).HasColumnName("UserName");
            entity.Property(e => e.Password).HasColumnName("Password");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
// Server=bcuhkxwv0nldifpaesyf-mysql.services.clever-cloud.com;Database=bcuhkxwv0nldifpaesyf;Uid=u2qewhssb8ncpkc0;Pwd=Q4qogxKLwF5DN3GVtFsx;