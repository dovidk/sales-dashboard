using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SalesDashboard.Api.Models;

// Result classes for raw SQL queries
public class TopCustomerResult
{
    public string customer_id { get; set; } = string.Empty;
    public string company_name { get; set; } = string.Empty;
    public decimal total_revenue { get; set; }
    public int order_count { get; set; }
}

public class MonthlyResult
{
    public int year { get; set; }
    public int month { get; set; }
    public int order_count { get; set; }
    public decimal revenue { get; set; }
}

public class QuarterlyResult
{
    public int year { get; set; }
    public int quarter { get; set; }
    public decimal revenue { get; set; }
    public int orders { get; set; }
}

public class CustomerOrderResult
{
    public int order_id { get; set; }
    public DateTime order_date { get; set; }
    public decimal total_value { get; set; }
    public int item_count { get; set; }
}

public class QuarterComparisonResult
{
    public int quarter { get; set; }
    public int year { get; set; }
    public decimal revenue { get; set; }
    public int orders { get; set; }
}

namespace SalesDashboard.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly SalesDashboardContext _context;

        public SalesController(SalesDashboardContext context)
        {
            _context = context;
        }

        [HttpGet("total-orders")]
        public async Task<IActionResult> GetTotalOrders([FromQuery] string? startDate = null, [FromQuery] string? endDate = null)
        {
            var sql = "SELECT COUNT(*) as total_orders FROM orders WHERE 1=1";
            var parameters = new List<object>();
            
            if (!string.IsNullOrEmpty(startDate))
            {
                sql += " AND order_date >= @startDate";
            }
            if (!string.IsNullOrEmpty(endDate))
            {
                sql += " AND order_date <= @endDate";
            }
            
            using var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();
            using var command = connection.CreateCommand();
            command.CommandText = sql;
            
            if (!string.IsNullOrEmpty(startDate))
            {
                var startParam = command.CreateParameter();
                startParam.ParameterName = "@startDate";
                startParam.Value = DateTime.Parse(startDate);
                command.Parameters.Add(startParam);
            }
            
            if (!string.IsNullOrEmpty(endDate))
            {
                var endParam = command.CreateParameter();
                endParam.ParameterName = "@endDate";
                endParam.Value = DateTime.Parse(endDate);
                command.Parameters.Add(endParam);
            }
            
            var result = await command.ExecuteScalarAsync();
            return Ok(new { TotalOrders = Convert.ToInt32(result) });
        }

        [HttpGet("total-revenue")]
        public async Task<IActionResult> GetTotalRevenue([FromQuery] string? startDate = null, [FromQuery] string? endDate = null)
        {
            var sql = @"
                SELECT SUM(od.unit_price * od.quantity * (1 - od.discount)) as total_revenue
                FROM order_details od
                JOIN orders o ON od.order_id = o.order_id
                WHERE 1=1";
            
            if (!string.IsNullOrEmpty(startDate))
            {
                sql += " AND o.order_date >= @startDate";
            }
            if (!string.IsNullOrEmpty(endDate))
            {
                sql += " AND o.order_date <= @endDate";
            }
            
            using var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();
            using var command = connection.CreateCommand();
            command.CommandText = sql;
            
            if (!string.IsNullOrEmpty(startDate))
            {
                var startParam = command.CreateParameter();
                startParam.ParameterName = "@startDate";
                startParam.Value = DateTime.Parse(startDate);
                command.Parameters.Add(startParam);
            }
            
            if (!string.IsNullOrEmpty(endDate))
            {
                var endParam = command.CreateParameter();
                endParam.ParameterName = "@endDate";
                endParam.Value = DateTime.Parse(endDate);
                command.Parameters.Add(endParam);
            }
            
            var result = await command.ExecuteScalarAsync();
            var totalRevenue = Convert.ToDecimal(result ?? 0);
            return Ok(new { TotalRevenue = Math.Round(totalRevenue, 2) });
        }

        [HttpGet("avg-order-value")]
        public async Task<IActionResult> GetAverageOrderValue([FromQuery] string? startDate = null, [FromQuery] string? endDate = null)
        {
            var sql = @"
                SELECT AVG(order_total) as avg_order_value
                FROM (
                    SELECT SUM(od.unit_price * od.quantity * (1 - od.discount)) as order_total
                    FROM order_details od
                    JOIN orders o ON od.order_id = o.order_id
                    WHERE 1=1";
            
            if (!string.IsNullOrEmpty(startDate))
            {
                sql += " AND o.order_date >= @startDate";
            }
            if (!string.IsNullOrEmpty(endDate))
            {
                sql += " AND o.order_date <= @endDate";
            }
            
            sql += " GROUP BY od.order_id) order_totals";
            
            using var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();
            using var command = connection.CreateCommand();
            command.CommandText = sql;
            
            if (!string.IsNullOrEmpty(startDate))
            {
                var startParam = command.CreateParameter();
                startParam.ParameterName = "@startDate";
                startParam.Value = DateTime.Parse(startDate);
                command.Parameters.Add(startParam);
            }
            
            if (!string.IsNullOrEmpty(endDate))
            {
                var endParam = command.CreateParameter();
                endParam.ParameterName = "@endDate";
                endParam.Value = DateTime.Parse(endDate);
                command.Parameters.Add(endParam);
            }
            
            var result = await command.ExecuteScalarAsync();
            var avgOrderValue = Convert.ToDecimal(result ?? 0);
            return Ok(new { AverageOrderValue = Math.Round(avgOrderValue, 2) });
        }

        [HttpGet("products-list")]
        public async Task<IActionResult> GetProductsList()
        {
            var sql = @"
                SELECT DISTINCT p.product_id, p.product_name
                FROM products p
                JOIN order_details od ON p.product_id = od.product_id
                ORDER BY p.product_name";
            
            using var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();
            using var command = connection.CreateCommand();
            command.CommandText = sql;
            
            var results = new List<object>();
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                results.Add(new {
                    product_id = Convert.ToInt32(reader["product_id"]),
                    product_name = reader["product_name"].ToString()
                });
            }
            
            return Ok(results);
        }

        [HttpGet("orders-by-month")]
        public async Task<IActionResult> GetOrdersByMonth([FromQuery] int? productId = null)
        {
            var sql = @"
                SELECT 
                    EXTRACT(YEAR FROM o.order_date) as year,
                    EXTRACT(MONTH FROM o.order_date) as month,
                    COUNT(DISTINCT o.order_id) as order_count,
                    SUM(od.unit_price * od.quantity * (1 - od.discount)) as revenue
                FROM orders o
                JOIN order_details od ON o.order_id = od.order_id";
            
            if (productId.HasValue)
            {
                sql += " WHERE od.product_id = @productId AND o.order_date IS NOT NULL";
            }
            else
            {
                sql += " WHERE o.order_date IS NOT NULL";
            }
            
            sql += @"
                GROUP BY EXTRACT(YEAR FROM o.order_date), EXTRACT(MONTH FROM o.order_date)
                ORDER BY year, month";
            
            using var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();
            using var command = connection.CreateCommand();
            command.CommandText = sql;
            
            if (productId.HasValue)
            {
                var param = command.CreateParameter();
                param.ParameterName = "@productId";
                param.Value = productId.Value;
                command.Parameters.Add(param);
            }
            
            var results = new List<MonthlyResult>();
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                results.Add(new MonthlyResult
                {
                    year = Convert.ToInt32(reader["year"]),
                    month = Convert.ToInt32(reader["month"]),
                    order_count = Convert.ToInt32(reader["order_count"]),
                    revenue = Convert.ToDecimal(reader["revenue"])
                });
            }
            
            return Ok(results);
        }

        [HttpGet("top-customers")]
        public async Task<IActionResult> GetTopCustomers()
        {
            var sql = @"
                SELECT 
                    c.customer_id,
                    c.company_name,
                    SUM(od.unit_price * od.quantity * (1 - od.discount)) as total_revenue,
                    COUNT(DISTINCT o.order_id) as order_count
                FROM customers c
                JOIN orders o ON c.customer_id = o.customer_id  
                JOIN order_details od ON o.order_id = od.order_id
                GROUP BY c.customer_id, c.company_name
                ORDER BY total_revenue DESC
                LIMIT 10";
            
            using var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();
            using var command = connection.CreateCommand();
            command.CommandText = sql;
            
            var results = new List<TopCustomerResult>();
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                results.Add(new TopCustomerResult
                {
                    customer_id = reader["customer_id"].ToString() ?? "",
                    company_name = reader["company_name"].ToString() ?? "",
                    total_revenue = Convert.ToDecimal(reader["total_revenue"]),
                    order_count = Convert.ToInt32(reader["order_count"])
                });
            }
            
            return Ok(results);
        }

        [HttpGet("quarterly-growth")]
        public async Task<IActionResult> GetQuarterlyGrowth([FromQuery] int? productId = null)
        {
            var sql = @"
                SELECT 
                    EXTRACT(YEAR FROM o.order_date) as year,
                    EXTRACT(QUARTER FROM o.order_date) as quarter,
                    SUM(od.unit_price * od.quantity * (1 - od.discount)) as revenue,
                    COUNT(DISTINCT o.order_id) as orders
                FROM orders o
                JOIN order_details od ON o.order_id = od.order_id";
            
            if (productId.HasValue)
            {
                sql += " WHERE od.product_id = @productId AND o.order_date IS NOT NULL";
            }
            else
            {
                sql += " WHERE o.order_date IS NOT NULL";
            }
            
            sql += @"
                GROUP BY EXTRACT(YEAR FROM o.order_date), EXTRACT(QUARTER FROM o.order_date)
                ORDER BY year, quarter";
            
            using var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();
            using var command = connection.CreateCommand();
            command.CommandText = sql;
            
            if (productId.HasValue)
            {
                var param = command.CreateParameter();
                param.ParameterName = "@productId";
                param.Value = productId.Value;
                command.Parameters.Add(param);
            }
            
            var results = new List<QuarterlyResult>();
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                results.Add(new QuarterlyResult
                {
                    year = Convert.ToInt32(reader["year"]),
                    quarter = Convert.ToInt32(reader["quarter"]),
                    revenue = Convert.ToDecimal(reader["revenue"]),
                    orders = Convert.ToInt32(reader["orders"])
                });
            }
            
            return Ok(results);
        }

        [HttpGet("customer-orders/{customerId}")]
        public async Task<IActionResult> GetCustomerOrders(string customerId)
        {
            var sql = @"
                SELECT 
                    o.order_id,
                    o.order_date,
                    SUM(od.unit_price * od.quantity * (1 - od.discount)) as total_value,
                    COUNT(od.product_id) as item_count
                FROM orders o
                JOIN order_details od ON o.order_id = od.order_id
                WHERE o.customer_id = @customerId
                GROUP BY o.order_id, o.order_date
                ORDER BY o.order_date DESC";
            
            using var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();
            using var command = connection.CreateCommand();
            command.CommandText = sql;
            
            var parameter = command.CreateParameter();
            parameter.ParameterName = "@customerId";
            parameter.Value = customerId;
            command.Parameters.Add(parameter);
            
            var results = new List<CustomerOrderResult>();
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                results.Add(new CustomerOrderResult
                {
                    order_id = Convert.ToInt32(reader["order_id"]),
                    order_date = Convert.ToDateTime(reader["order_date"]),
                    total_value = Convert.ToDecimal(reader["total_value"]),
                    item_count = Convert.ToInt32(reader["item_count"])
                });
            }
            
            return Ok(results);
        }

        [HttpGet("compare-quarters")]
        public async Task<IActionResult> CompareQuarters(
            int quarter1, int year1, int quarter2, int year2)
        {
            var sql = @"
                WITH quarter_data AS (
                    SELECT 
                        EXTRACT(YEAR FROM o.order_date) as year,
                        EXTRACT(QUARTER FROM o.order_date) as quarter,
                        SUM(od.unit_price * od.quantity * (1 - od.discount)) as revenue,
                        COUNT(DISTINCT o.order_id) as orders
                    FROM orders o
                    JOIN order_details od ON o.order_id = od.order_id
                    WHERE o.order_date IS NOT NULL
                    GROUP BY EXTRACT(YEAR FROM o.order_date), EXTRACT(QUARTER FROM o.order_date)
                )
                SELECT year, quarter, revenue, orders
                FROM quarter_data
                WHERE (year = @year1 AND quarter = @quarter1)
                   OR (year = @year2 AND quarter = @quarter2)
                ORDER BY year, quarter";
            
            using var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();
            using var command = connection.CreateCommand();
            command.CommandText = sql;
            
            var param1 = command.CreateParameter();
            param1.ParameterName = "@year1";
            param1.Value = year1;
            command.Parameters.Add(param1);
            
            var param2 = command.CreateParameter();
            param2.ParameterName = "@quarter1";
            param2.Value = quarter1;
            command.Parameters.Add(param2);
            
            var param3 = command.CreateParameter();
            param3.ParameterName = "@year2";
            param3.Value = year2;
            command.Parameters.Add(param3);
            
            var param4 = command.CreateParameter();
            param4.ParameterName = "@quarter2";
            param4.Value = quarter2;
            command.Parameters.Add(param4);
            
            var results = new List<QuarterComparisonResult>();
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                results.Add(new QuarterComparisonResult
                {
                    year = Convert.ToInt32(reader["year"]),
                    quarter = Convert.ToInt32(reader["quarter"]),
                    revenue = Convert.ToDecimal(reader["revenue"]),
                    orders = Convert.ToInt32(reader["orders"])
                });
            }
            
            if (results.Count != 2)
            {
                return BadRequest("One or both quarters have no data");
            }
            
            var q1Data = results[0];
            var q2Data = results[1];
            
            var revenueGrowth = ((q2Data.revenue - q1Data.revenue) / q1Data.revenue) * 100;
            var orderGrowth = ((q2Data.orders - q1Data.orders) / (decimal)q1Data.orders) * 100;
            
            return Ok(new {
                Quarter1 = q1Data,
                Quarter2 = q2Data,
                Comparison = new {
                    RevenueGrowth = Math.Round(revenueGrowth, 1),
                    OrderGrowth = Math.Round(orderGrowth, 1),
                    AvgOrderValueQ1 = Math.Round(q1Data.revenue / q1Data.orders, 2),
                    AvgOrderValueQ2 = Math.Round(q2Data.revenue / q2Data.orders, 2)
                }
            });
        }
    }
}