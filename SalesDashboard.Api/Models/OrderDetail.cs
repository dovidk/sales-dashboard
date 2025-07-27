namespace SalesDashboard.Api.Models
{
    public class OrderDetail
    {
        public short OrderId { get; set; }
        public short ProductId { get; set; }
        public double UnitPrice { get; set; }
        public short Quantity { get; set; }
        public double Discount { get; set; }
    }
}