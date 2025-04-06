using Microsoft.EntityFrameworkCore;
using ParaZeka.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Persistence.Seed
{
    public static class ApplicationDbContextSeed
    {
        public static async Task SeedDefaultDataAsync(ApplicationDbContext context)
        {
            // Seed default categories
            if (!await context.Categories.AnyAsync(c => c.IsSystem))
            {
                await SeedDefaultCategoriesAsync(context);
            }
        }

        private static async Task SeedDefaultCategoriesAsync(ApplicationDbContext context)
        {
            // Income categories
            var incomeCategories = new List<Category>
            {
                new Category { Id = Guid.NewGuid(), Name = "Salary", Description = "Regular income from employment", ColorHex = "#4CAF50", IconName = "briefcase", IsSystem = true },
                new Category { Id = Guid.NewGuid(), Name = "Investment", Description = "Income from investments", ColorHex = "#2196F3", IconName = "trending-up", IsSystem = true },
                new Category { Id = Guid.NewGuid(), Name = "Gift", Description = "Money received as a gift", ColorHex = "#9C27B0", IconName = "gift", IsSystem = true },
                new Category { Id = Guid.NewGuid(), Name = "Other Income", Description = "Other sources of income", ColorHex = "#607D8B", IconName = "plus-circle", IsSystem = true }
            };

            // Expense categories
            var expenseCategories = new List<Category>
            {
                new Category { Id = Guid.NewGuid(), Name = "Housing", Description = "Rent, mortgage, and home expenses", ColorHex = "#F44336", IconName = "home", IsSystem = true },
                new Category { Id = Guid.NewGuid(), Name = "Food", Description = "Groceries and eating out", ColorHex = "#FF9800", IconName = "shopping-cart", IsSystem = true },
                new Category { Id = Guid.NewGuid(), Name = "Transportation", Description = "Public transport, fuel, and vehicle expenses", ColorHex = "#3F51B5", IconName = "car", IsSystem = true },
                new Category { Id = Guid.NewGuid(), Name = "Utilities", Description = "Electricity, water, internet, etc.", ColorHex = "#00BCD4", IconName = "zap", IsSystem = true },
                new Category { Id = Guid.NewGuid(), Name = "Entertainment", Description = "Movies, games, hobbies, etc.", ColorHex = "#E91E63", IconName = "film", IsSystem = true },
                new Category { Id = Guid.NewGuid(), Name = "Health", Description = "Medical and healthcare expenses", ColorHex = "#8BC34A", IconName = "activity", IsSystem = true },
                new Category { Id = Guid.NewGuid(), Name = "Education", Description = "Books, courses, and educational expenses", ColorHex = "#FFC107", IconName = "book", IsSystem = true },
                new Category { Id = Guid.NewGuid(), Name = "Shopping", Description = "Clothing, electronics, and other purchases", ColorHex = "#9E9E9E", IconName = "shopping-bag", IsSystem = true },
                new Category { Id = Guid.NewGuid(), Name = "Travel", Description = "Vacations and trips", ColorHex = "#03A9F4", IconName = "map", IsSystem = true },
                new Category { Id = Guid.NewGuid(), Name = "Subscriptions", Description = "Recurring subscription payments", ColorHex = "#673AB7", IconName = "repeat", IsSystem = true }
            };

            context.Categories.AddRange(incomeCategories);
            context.Categories.AddRange(expenseCategories);

            await context.SaveChangesAsync();
        }
    }
}
