import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts/BarChart";
import { useEffect, useState } from "react";

export default function PageViewsBarChart() {
  const theme = useTheme();
  const [chartData, setChartData] = useState({
    months: [],
    expenses: {
      maintenance: [],
      utilities: [],
      security: [],
      others: []
    },
    totalAmount: 0,
    trend: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch("http://localhost:8000/expenses", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch expenses: ${response.status}`);
        }

        const data = await response.json();

        // Get last 6 months
        const last6Months = [];
        const monthlyExpenses = {
          maintenance: Array(6).fill(0),
          utilities: Array(6).fill(0),
          security: Array(6).fill(0),
          others: Array(6).fill(0)
        };
        let totalAmount = 0;

        const currentDate = new Date();

        // Initialize arrays for last 6 months
        for (let i = 5; i >= 0; i--) {
          const month = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          );
          const monthName = month.toLocaleDateString("en-US", {
            month: "short",
          });
          last6Months.push(monthName);
        }

        // Process expenses
        if (Array.isArray(data)) {
          data.forEach((expense) => {
            if (expense.expenseAmount && expense.date) {
              const expenseDate = new Date(expense.date);
              const expenseMonth = expenseDate.toLocaleDateString("en-US", {
                month: "short",
              });
              const monthIndex = last6Months.indexOf(expenseMonth);

              if (monthIndex !== -1) {
                const amount = parseFloat(expense.expenseAmount) || 0;
                const category = expense.category?.toLowerCase() || 'others';
                
                switch(category) {
                  case 'maintenance':
                    monthlyExpenses.maintenance[monthIndex] += amount;
                    break;
                  case 'utilities':
                    monthlyExpenses.utilities[monthIndex] += amount;
                    break;
                  case 'security':
                    monthlyExpenses.security[monthIndex] += amount;
                    break;
                  default:
                    monthlyExpenses.others[monthIndex] += amount;
                }
                
                totalAmount += amount;
              }
            }
          });
        }

        // Calculate trend
        const recent3Months = Object.values(monthlyExpenses)
          .map(category => category.slice(-3).reduce((a, b) => a + b, 0))
          .reduce((a, b) => a + b, 0);
        const previous3Months = Object.values(monthlyExpenses)
          .map(category => category.slice(0, 3).reduce((a, b) => a + b, 0))
          .reduce((a, b) => a + b, 0);
        const trend =
          previous3Months !== 0
            ? ((recent3Months - previous3Months) / previous3Months) * 100
            : 0;

        setChartData({
          months: last6Months,
          expenses: monthlyExpenses,
          totalAmount: totalAmount,
          trend: trend,
        });
      } catch (error) {
        console.error("Error fetching expense data:", error);
        setChartData({
          months: Array(6)
            .fill("")
            .map((_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - (5 - i));
              return d.toLocaleDateString("en-US", { month: "short" });
            }),
          expenses: {
            maintenance: Array(6).fill(0),
            utilities: Array(6).fill(0),
            security: Array(6).fill(0),
            others: Array(6).fill(0)
          },
          totalAmount: 0,
          trend: 0,
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Monthly Expenses by Category
        </Typography>
        <Stack sx={{ justifyContent: "space-between" }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: "center", sm: "flex-start" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {chartData.totalAmount.toLocaleString("en-PH", {
                style: "currency",
                currency: "PHP",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
            <Chip
              size="small"
              color={chartData.trend < 0 ? "success" : "error"}
              label={`${
                chartData.trend > 0 ? "+" : ""
              }${chartData.trend.toFixed(1)}%`}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Total expenses for the last 6 months
          </Typography>
        </Stack>
        <BarChart
          colors={[
            theme.palette.primary.main,
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.error.main
          ]}
          xAxis={[
            {
              scaleType: "band",
              data: chartData.months,
              categoryGapRatio: 0.3,
            },
          ]}
          series={[
            {
              data: chartData.expenses.maintenance,
              label: "Maintenance",
              stack: "total",
            },
            {
              data: chartData.expenses.utilities,
              label: "Utilities",
              stack: "total",
            },
            {
              data: chartData.expenses.security,
              label: "Security",
              stack: "total",
            },
            {
              data: chartData.expenses.others,
              label: "Others",
              stack: "total",
            },
          ]}
          height={250}
          margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
        />
      </CardContent>
    </Card>
  );
}
