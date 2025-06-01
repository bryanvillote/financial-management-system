import { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Skeleton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import format from "date-fns/format";
import axios from "axios";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  boxShadow: "hsla(220, 60.00%, 2.00%, 0.12) 0px 8px 30px 0px, hsla(222, 25.50%, 10.00%, 0.06) 0px 10px 25px -5px",
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
}));

export default function TextualReport() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reportData, setReportData] = useState({
    month: format(new Date(), "MMMM yyyy"),
    totalPayments: 0,
    totalExpenses: 0,
    paidHomeowners: [],
    pendingHomeowners: [],
    expenseBreakdown: [],
    recentExpenses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        // Format date for API request (YYYY-MM)
        const formattedDate = format(selectedDate, "yyyy-MM");
        
        // Fetch payments data
        const paymentsResponse = await axios.get(`/api/payments/monthly/${formattedDate}`);
        
        // Fetch expenses data
        const expensesResponse = await axios.get(`/api/expenses/monthly/${formattedDate}`);
        
        // Fetch homeowners data
        const homeownersResponse = await axios.get(`/api/homeowners`);
        
        // Process data
        const totalPayments = paymentsResponse.data.reduce(
          (sum, payment) => sum + (parseFloat(payment.amount) || 0), 
          0
        );
        
        // Process expenses data
        const totalExpenses = expensesResponse.data.reduce(
          (sum, expense) => sum + (parseFloat(expense.expenseAmount) || 0), 
          0
        );

        // Get expense breakdown by category
        const expenseBreakdown = expensesResponse.data.reduce((acc, expense) => {
          const category = expense.expenseName || 'Uncategorized';
          const amount = parseFloat(expense.expenseAmount) || 0;
          acc[category] = (acc[category] || 0) + amount;
          return acc;
        }, {});

        // Convert to array and sort by amount
        const expenseBreakdownArray = Object.entries(expenseBreakdown)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount);

        // Get recent expenses (last 5)
        const recentExpenses = [...expensesResponse.data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(expense => ({
            name: expense.expenseName,
            amount: parseFloat(expense.expenseAmount) || 0,
            date: new Date(expense.createdAt).toLocaleDateString()
          }));
        
        // Get homeowners who paid this month
        const paidHomeowners = paymentsResponse.data.map(payment => payment.homeownerName);
        
        // Get homeowners with pending dues
        const allHomeowners = homeownersResponse.data.map(homeowner => homeowner.name);
        const pendingHomeowners = allHomeowners.filter(name => !paidHomeowners.includes(name));
        
        setReportData({
          month: format(selectedDate, "MMMM yyyy"),
          totalPayments,
          totalExpenses,
          paidHomeowners,
          pendingHomeowners,
          expenseBreakdown: expenseBreakdownArray,
          recentExpenses
        });
      } catch (error) {
        console.error("Error fetching report data:", error);
        // Set default values in case of error
        setReportData({
          month: format(selectedDate, "MMMM yyyy"),
          totalPayments: 0,
          totalExpenses: 0,
          paidHomeowners: [],
          pendingHomeowners: [],
          expenseBreakdown: [],
          recentExpenses: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedDate]);

  const formatCurrency = (amount) => {
    return amount.toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" component="h2">
            Monthly Report Summary
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={['year', 'month']}
              label="Select Month"
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>
        </Box>

        {loading ? (
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="text" height={30} />
            <Skeleton variant="text" height={30} />
            <Skeleton variant="text" height={30} />
            <Skeleton variant="text" height={30} />
          </Box>
        ) : (
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            <Box component="span" sx={{ fontWeight: "medium" }}>
              Financial Overview for {reportData.month}
            </Box>
            <br /><br />
            The total payments acquired in the month of <strong>{reportData.month}</strong> are 
            <strong> {formatCurrency(reportData.totalPayments)}</strong> and the total expenses for 
            the month of <strong>{reportData.month}</strong> is exactly 
            <strong> {formatCurrency(reportData.totalExpenses)}</strong>.
            
            {reportData.expenseBreakdown.length > 0 && (
              <>
                <br /><br />
                <Box component="span" sx={{ fontWeight: "medium" }}>
                  Expense Breakdown:
                </Box>
                <br />
                {reportData.expenseBreakdown.map((category, index) => (
                  <Box key={index} sx={{ ml: 2, mt: 1 }}>
                    • {category.name}: {formatCurrency(category.amount)} 
                    ({((category.amount / reportData.totalExpenses) * 100).toFixed(1)}% of total)
                  </Box>
                ))}
              </>
            )}
            
            {reportData.recentExpenses.length > 0 && (
              <>
                <br /><br />
                <Box component="span" sx={{ fontWeight: "medium" }}>
                  Recent Expenses:
                </Box>
                <br />
                {reportData.recentExpenses.map((expense, index) => (
                  <Box key={index} sx={{ ml: 2, mt: 1 }}>
                    • {expense.name} - {formatCurrency(expense.amount)} 
                    (Date: {expense.date})
                  </Box>
                ))}
              </>
            )}
            
            {reportData.paidHomeowners.length > 0 ? (
              <>
                <br /><br />
                The homeowners who paid are: <strong>{reportData.paidHomeowners.join(", ")}</strong>.
              </>
            ) : (
              <>
                <br /><br />
                No homeowners have made payments this month.
              </>
            )}
            
            {reportData.pendingHomeowners.length > 0 ? (
              <>
                <br /><br />
                The homeowners who have pending dues are: <strong>{reportData.pendingHomeowners.join(", ")}</strong>.
              </>
            ) : (
              <>
                <br /><br />
                All homeowners have paid their dues for this month.
              </>
            )}
          </Typography>
        )}
      </CardContent>
    </StyledCard>
  );
}