import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import SessionsChart from "./SessionsChart";
import StatCard from "./StatCard";
import HomeownerStats from "./HomeownerStats";
import ExpensesPieChart from "./ExpensesPieChart";
import { API_BASE_URL } from "../../../config";

export default function MainGrid() {
  const [stats, setStats] = useState({
    monthlyPayments: { value: 0, data: [] },
    carStickerOwners: { value: 0, data: [] },
    expenses: { value: 0, data: [] },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the auth token
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch billing data
        const billingsResponse = await fetch(`${API_BASE_URL}/billing`);
        const billingsData = await billingsResponse.json();

        // Fetch expenses data with authentication
        const expensesResponse = await fetch(`${API_BASE_URL}/expenses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!expensesResponse.ok) {
          throw new Error(
            `Failed to fetch expenses: ${expensesResponse.status}`
          );
        }

        const expensesData = await expensesResponse.json();

        // Ensure we have arrays to work with
        const billings = Array.isArray(billingsData) ? billingsData : [];
        const expenses = Array.isArray(expensesData) ? expensesData : [];

        // Calculate monthly payments total and trend
        const totalPayments = billings.reduce(
          (sum, billing) => sum + (billing.lastPaymentAmount || 0),
          0
        );

        // Calculate car sticker owners (homeowners with active status)
        const activeHomeownersResponse = await fetch(
          `${API_BASE_URL}/homeowners`
        );
        const homeownersData = await activeHomeownersResponse.json();
        const homeowners = Array.isArray(homeownersData) ? homeownersData : [];
        const activeHomeowners = homeowners.filter(
          (h) => h.status === "Active"
        ).length;

        // Calculate total expenses
        const totalExpenses = expenses.reduce(
          (sum, expense) => sum + (parseFloat(expense.expenseAmount) || 0),
          0
        );

        // Get last 30 days of payments
        const last30DaysPayments = Array(30).fill(0);
        billings.forEach((billing) => {
          if (billing.lastPaymentDate) {
            const dayIndex =
              29 -
              Math.floor(
                (Date.now() - new Date(billing.lastPaymentDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              );
            if (dayIndex >= 0 && dayIndex < 30) {
              last30DaysPayments[dayIndex] += billing.lastPaymentAmount || 0;
            }
          }
        });

        // Get last 30 days of expenses
        const last30DaysExpenses = Array(30).fill(0);
        expenses.forEach((expense) => {
          if (expense.createdAt) {
            const dayIndex =
              29 -
              Math.floor(
                (Date.now() - new Date(expense.createdAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              );
            if (dayIndex >= 0 && dayIndex < 30) {
              last30DaysExpenses[dayIndex] +=
                parseFloat(expense.expenseAmount) || 0;
            }
          }
        });

        setStats({
          monthlyPayments: {
            value: totalPayments.toLocaleString("en-PH", {
              style: "currency",
              currency: "PHP",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            data: last30DaysPayments,
            trend: totalPayments > 0 ? "up" : "neutral",
          },
          carStickerOwners: {
            value: activeHomeowners.toString(),
            data: Array(30).fill(activeHomeowners),
            trend: activeHomeowners > 0 ? "up" : "neutral",
          },
          expenses: {
            value: totalExpenses.toLocaleString("en-PH", {
              style: "currency",
              currency: "PHP",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            data: last30DaysExpenses,
            trend: "neutral",
          },
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set default values in case of error
        setStats({
          monthlyPayments: {
            value: "₱0.00",
            data: Array(30).fill(0),
            trend: "neutral",
          },
          carStickerOwners: {
            value: "0",
            data: Array(30).fill(0),
            trend: "neutral",
          },
          expenses: {
            value: "₱0.00",
            data: Array(30).fill(0),
            trend: "neutral",
          },
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Monthly Payments",
      ...stats.monthlyPayments,
      interval: "Last 30 days",
    },
    {
      title: "Car Sticker Owners",
      ...stats.carStickerOwners,
      interval: "Active Homeowners",
    },
    {
      title: "HOA Expenses",
      ...stats.expenses,
      interval: "Last 30 days",
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {cards.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, md: 6 }}>
          <SessionsChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ExpensesPieChart />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <HomeownerStats />
        </Grid>
      </Grid>
    </Box>
  );
}
