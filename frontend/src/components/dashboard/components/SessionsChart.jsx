import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { LineChart } from "@mui/x-charts/LineChart";
import { useEffect, useState } from "react";

export default function SessionsChart() {
  const theme = useTheme();
  const [chartData, setChartData] = useState({
    dates: [],
    payments: [],
    totalAmount: 0,
    trend: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/billing");
        const data = await response.json();

        // Process last 30 days of payments
        const last30Days = Array(30).fill(0);
        const dates = Array(30)
          .fill(0)
          .map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            return d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          });

        let totalAmount = 0;
        data.forEach((billing) => {
          if (billing.lastPaymentDate) {
            const dayIndex =
              29 -
              Math.floor(
                (Date.now() - new Date(billing.lastPaymentDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              );
            if (dayIndex >= 0 && dayIndex < 30) {
              last30Days[dayIndex] += billing.lastPaymentAmount || 0;
              totalAmount += billing.lastPaymentAmount || 0;
            }
          }
        });

        // Calculate trend (compare last 15 days with previous 15 days)
        const recentSum = last30Days.slice(15).reduce((a, b) => a + b, 0);
        const previousSum = last30Days.slice(0, 15).reduce((a, b) => a + b, 0);
        const trend =
          previousSum !== 0
            ? ((recentSum - previousSum) / previousSum) * 100
            : 0;

        setChartData({
          dates,
          payments: last30Days,
          totalAmount,
          trend,
        });
      } catch (error) {
        console.error("Error fetching payment data:", error);
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
          Payment Trends
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
              })}
            </Typography>
            <Chip
              size="small"
              color={chartData.trend > 0 ? "success" : "error"}
              label={`${chartData.trend.toFixed(1)}%`}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Total payments for the last 30 days
          </Typography>
        </Stack>
        <LineChart
          colors={[theme.palette.primary.main]}
          xAxis={[
            {
              scaleType: "point",
              data: chartData.dates,
              tickInterval: (index) => index % 5 === 0,
            },
          ]}
          series={[
            {
              data: chartData.payments,
              area: true,
              showMark: false,
              label: "Payments",
              curve: "linear",
              areaStyle: {
                fill: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main}20 100%)`,
              },
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
