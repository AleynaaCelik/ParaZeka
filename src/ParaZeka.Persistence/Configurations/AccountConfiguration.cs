using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using ParaZeka.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Persistence.Configurations
{
    public class AccountConfiguration : IEntityTypeConfiguration<Account>
    {
        public void Configure(EntityTypeBuilder<Account> builder)
        {
            builder.Property(a => a.Name)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(a => a.Balance)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(a => a.AccountType)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(a => a.Currency)
                .HasMaxLength(3)
                .IsRequired();

            builder.Property(a => a.BankName)
                .HasMaxLength(100);

            builder.Property(a => a.AccountNumber)
                .HasMaxLength(50);

            builder.HasOne(a => a.User)
                .WithMany(u => u.Accounts)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
