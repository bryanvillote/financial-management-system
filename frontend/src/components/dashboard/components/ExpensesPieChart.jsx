import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { PieChart } from "@mui/x-charts/PieChart";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config";

export default function ExpensesPieChart() {
  const theme = useTheme();
  const [chartData, setChartData] = useState({
    categories: [],
    totalAmount: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_BASE_URL}/expenses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch expenses: ${response.status}`);
        }

        const data = await response.json();

        // Calculate expenses by category
        const categoryTotals = {
          Maintenance: 0,
          Utilities: 0,
          Security: 0,
          Others: 0
        };

        let totalAmount = 0;

        if (Array.isArray(data)) {
          data.forEach((expense) => {
            if (expense.expenseAmount) {
              const amount = parseFloat(expense.expenseAmount) || 0;
              const category = expense.category || 'Others';
              categoryTotals[category] += amount;
              totalAmount += amount;
            }
          });
        }

        // Convert to array format for pie chart
        const categories = Object.entries(categoryTotals).map(([name, value]) => ({
          id: name,
          value: value,
          label: name,
        }));

        setChartData({
          categories,
          totalAmount,
        });
      } catch (error) {
        console.error("Error fetching expense data:", error);
        setChartData({
          categories: [],
          totalAmount: 0,
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card variant="outlined" sx={{ width: "100%", height: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Expenses by Category
        </Typography>
        <Stack sx={{ justifyContent: "space-between" }}>
          <Typography variant="h4" component="p">
            {chartData.totalAmount.toLocaleString("en-PH", {
              style: "currency",
              currency: "PHP",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Total expenses distribution
          </Typography>
        </Stack>
        <Box sx={{ width: "100%", height: 200, mt: 2 }}>
          <PieChart
            series={[
              {
                data: chartData.categories,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { innerRadius: 10, additionalRadius: -20, color: 'gray' },
              },
            ]}
            colors={[
              theme.palette.primary.main,
              theme.palette.success.main,
              theme.palette.warning.main,
              theme.palette.error.main
            ]}
            height={200}
            margin={{ top: 0, bottom: 45, left: 0, right: 0 }}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 0,
                itemMarkWidth: 10,
                itemMarkHeight: 10,
                markGap: 5,
                itemGap: 10,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
} 