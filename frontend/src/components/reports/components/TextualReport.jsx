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
  const [reportData, setReportData] = useState(null);
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
        
        const totalExpenses = expensesResponse.data.reduce(
          (sum, expense) => sum + (parseFloat(expense.expenseAmount) || 0), 
          0
        );
        
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
          pendingHomeowners
        });
      } catch (error) {
        console.error("Error fetching report data:", error);
        // Set default values in case of error
        setReportData({
          month: format(selectedDate, "MMMM yyyy"),
          totalPayments: 0,
          totalExpenses: 0,
          paidHomeowners: [],
          pendingHomeowners: []
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
            The total payments acquired in the month of <strong>{reportData.month}</strong> are 
            <strong> {formatCurrency(reportData.totalPayments)}</strong> and the total expenses for 
            the month of <strong>{reportData.month}</strong> is exactly 
            <strong> {formatCurrency(reportData.totalExpenses)}</strong>.
            
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