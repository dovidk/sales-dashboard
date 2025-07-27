using Microsoft.EntityFrameworkCore;

namespace SalesDashboard.Api.Models
{
    public class SalesDashboardContext : DbContext
    {
        public SalesDashboardContext(DbContextOptions<SalesDashboardContext> options) : base(options)
        {
        }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Customer> Customers { get; set; }

     protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Order>(entity =>
    {
        entity.ToTable("orders");
        entity.Property(e => e.OrderId).HasColumnName("order_id");
        entity.Property(e => e.CustomerId).HasColumnName("customer_id");
        entity.Property(e => e.EmployeeId).HasColumnName("employee_id");
        entity.Property(e => e.OrderDate).HasColumnName("order_date");
        entity.Property(e => e.RequiredDate).HasColumnName("required_date");
        entity.Property(e => e.ShippedDate).HasColumnName("shipped_date");
        entity.Property(e => e.ShipVia).HasColumnName("ship_via");
        entity.Property(e => e.Freight).HasColumnName("freight");
        entity.Property(e => e.ShipName).HasColumnName("ship_name");
        entity.Property(e => e.ShipAddress).HasColumnName("ship_address");
        entity.Property(e => e.ShipCity).HasColumnName("ship_city");
        entity.Property(e => e.ShipRegion).HasColumnName("ship_region");
        entity.Property(e => e.ShipPostalCode).HasColumnName("ship_postal_code");
        entity.Property(e => e.ShipCountry).HasColumnName("ship_country");
    });
    
   modelBuilder.Entity<Customer>(entity =>
{
    entity.ToTable("customers");
    entity.Property(e => e.CustomerId).HasColumnName("customer_id");
    entity.Property(e => e.CompanyName).HasColumnName("company_name");
    entity.Property(e => e.ContactName).HasColumnName("contact_name");
    entity.Property(e => e.ContactTitle).HasColumnName("contact_title");
    entity.Property(e => e.Address).HasColumnName("address");
    entity.Property(e => e.City).HasColumnName("city");
    entity.Property(e => e.Region).HasColumnName("region");
    entity.Property(e => e.PostalCode).HasColumnName("postal_code");
    entity.Property(e => e.Country).HasColumnName("country");
    entity.Property(e => e.Phone).HasColumnName("phone");
    entity.Property(e => e.Fax).HasColumnName("fax");
});
    
    modelBuilder.Entity<OrderDetail>(entity =>
    {
        entity.ToTable("order_details");
        entity.HasKey(od => new { od.OrderId, od.ProductId });
        entity.Property(e => e.OrderId).HasColumnName("order_id");
        entity.Property(e => e.ProductId).HasColumnName("product_id");
        entity.Property(e => e.UnitPrice).HasColumnName("unit_price");
        entity.Property(e => e.Quantity).HasColumnName("quantity");
        entity.Property(e => e.Discount).HasColumnName("discount");
    });
}
    }
}