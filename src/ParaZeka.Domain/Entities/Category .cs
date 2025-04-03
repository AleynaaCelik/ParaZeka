using ParaZeka.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ParaZeka.Domain.Entities
{
    public class Category : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ColorHex { get; set; } = "#000000";
        public string IconName { get; set; } = "default";
        public Guid? ParentCategoryId { get; set; }
        public virtual Category? ParentCategory { get; set; }
        public virtual List<Category> Subcategories { get; set; } = new List<Category>();
        public virtual List<Transaction> Transactions { get; set; } = new List<Transaction>();
        public bool IsSystem { get; set; } // Is this a system default category?
        public Guid? UserId { get; set; } // null for system categories
        public virtual User? User { get; set; }
    }
}
