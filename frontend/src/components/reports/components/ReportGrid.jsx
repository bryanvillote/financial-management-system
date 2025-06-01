import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import Chip from "@mui/material/Chip";

export default function ReportGrid() {
  const [reportData, setReportData] = useState({
    month: format(new Date(), "MMMM yyyy"),
    totalPayments: 0,
    totalExpenses: 0,
    paidHomeowners: [],
    pendingHomeowners: [],
    expenseBreakdown: [],
    recentExpenses: [],
    paymentTrend: {
      dates: [],
      payments: [],
      totalAmount: 0,
      trend: 0
    },
    homeowners: []
  });

  useEffect(() => {
    fetchReportData();
    const interval = setInterval(fetchReportData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Fetching report data...");
      
      // Fetch all required data
      const [paymentsResponse, expensesResponse, homeownersResponse] = await Promise.all([
        fetch(`http://localhost:8000/billing`),
        fetch(`http://localhost:8000/expenses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`http://localhost:8000/homeowners`)
      ]);

      if (!expensesResponse.ok) {
        throw new Error(`Failed to fetch expenses: ${expensesResponse.status}`);
      }

      const [paymentsData, expensesData, homeownersData] = await Promise.all([
        paymentsResponse.json(),
        expensesResponse.json(),
        homeownersResponse.json()
      ]);

      console.log("Raw payments data:", paymentsData);

      // Process payment trends data (matching dashboard implementation)
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
      paymentsData.forEach((billing) => {
        console.log("Processing billing:", billing);
        if (billing.lastPaymentDate) {
          const dayIndex = 29 - Math.floor(
            (Date.now() - new Date(billing.lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          console.log("Day index:", dayIndex, "Payment amount:", billing.lastPaymentAmount);
          if (dayIndex >= 0 && dayIndex < 30) {
            const paymentAmount = parseFloat(billing.lastPaymentAmount) || 0;
            last30Days[dayIndex] += paymentAmount;
            totalAmount += paymentAmount;
            console.log("Updated day total:", last30Days[dayIndex], "New total amount:", totalAmount);
          }
        }
      });

      console.log("Last 30 days array:", last30Days);
      console.log("Total amount calculated:", totalAmount);

      // Calculate trend (compare last 15 days with previous 15 days)
      const recentSum = last30Days.slice(15).reduce((a, b) => a + b, 0);
      const previousSum = last30Days.slice(0, 15).reduce((a, b) => a + b, 0);
      const trend = previousSum !== 0 ? ((recentSum - previousSum) / previousSum) * 100 : 0;

      console.log("Trend calculation:", {
        recentSum,
        previousSum,
        trend
      });

      // Process other data
      const totalPayments = paymentsData.reduce(
        (sum, payment) => sum + (parseFloat(payment.lastPaymentAmount) || 0), 
        0
      );
      
      const totalExpenses = expensesData.reduce(
        (sum, expense) => sum + (parseFloat(expense.expenseAmount) || 0), 
        0
      );
      
      // Get expense breakdown
      const expenseBreakdown = expensesData.reduce((acc, expense) => {
        const category = expense.expenseName || 'Uncategorized';
        const amount = parseFloat(expense.expenseAmount) || 0;
        acc[category] = (acc[category] || 0) + amount;
        return acc;
      }, {});

      const expenseBreakdownArray = Object.entries(expenseBreakdown)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);

      // Get homeowners status
      const currentMonth = format(new Date(), "yyyy-MM");
      console.log("Current month for filtering:", currentMonth);
      
      // Get only homeowners who paid in the current month
      const paidHomeowners = paymentsData
        .filter(payment => {
          console.log("Processing payment:", payment);
          if (!payment.lastPaymentDate) {
            console.log("No lastPaymentDate for:", payment.homeownerName);
            return false;
          }
          try {
          const paymentDate = new Date(payment.lastPaymentDate);
            const paymentMonth = format(paymentDate, "yyyy-MM");
            console.log("Payment date:", payment.lastPaymentDate, "Formatted month:", paymentMonth);
            const isCurrentMonth = paymentMonth === currentMonth;
            const hasName = Boolean(payment.homeownerName);
            console.log("Is current month:", isCurrentMonth, "Has name:", hasName);
            return isCurrentMonth && hasName;
          } catch (error) {
            console.error("Error processing payment date:", payment.lastPaymentDate, error);
            return false;
          }
        })
        .map(payment => {
          console.log("Adding paid homeowner:", payment.homeownerName);
          return payment.homeownerName;
        })
        .filter(name => {
          const isValid = Boolean(name);
          if (!isValid) {
            console.log("Filtered out invalid name");
          }
          return isValid;
        });

      console.log("Final paid homeowners list:", paidHomeowners);

      // Get all homeowners and their statuses
      const allHomeowners = homeownersData.map(homeowner => ({
        name: homeowner.name,
        status: homeowner.status
      }));

      // Only include homeowners with Warning or No Participation status in pending list
      const pendingHomeowners = allHomeowners
        .filter(homeowner => 
          ["Warning", "No Participation"].includes(homeowner.status)
        )
        .map(homeowner => ({
          name: homeowner.name,
          status: homeowner.status
        }));

      // Get recent expenses with proper date formatting
      const recentExpenses = [...expensesData]
        .sort((a, b) => {
          try {
            const dateA = parseISO(a.createdAt);
            const dateB = parseISO(b.createdAt);
            return dateB - dateA;
          } catch (error) {
            console.error("Invalid expense date:", a.createdAt, b.createdAt);
            return 0;
          }
        })
        .slice(0, 5)
        .map(expense => {
          let formattedDate = "Invalid Date";
          try {
            const date = parseISO(expense.createdAt);
            if (!isNaN(date.getTime())) {
              formattedDate = format(date, "MMM dd, yyyy");
            }
          } catch (error) {
            console.error("Error formatting expense date:", expense.createdAt);
          }
          return {
            name: expense.expenseName || "Unnamed Expense",
            amount: parseFloat(expense.expenseAmount) || 0,
            date: formattedDate
          };
        });

      const updatedData = {
        month: format(new Date(), "MMMM yyyy"),
        totalPayments,
        totalExpenses,
        paidHomeowners,
        pendingHomeowners: pendingHomeowners.map(h => h.name),
        pendingHomeownersWithStatus: pendingHomeowners,
        expenseBreakdown: expenseBreakdownArray,
        recentExpenses,
        paymentTrend: {
          dates,
          payments: last30Days,
          totalAmount,
          trend
        },
        homeowners: homeownersData
      };

      console.log("Updated report data:", {
        paidHomeowners: updatedData.paidHomeowners,
        currentMonth: updatedData.month
      });

      setReportData(updatedData);

    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('Financial Report', 105, 20, { align: 'center' });
      
      // Add date
      pdf.setFontSize(12);
      const currentDate = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${currentDate}`, 105, 30, { align: 'center' });
      
      // Add report content
      pdf.setFontSize(12);
      let yOffset = 45;
      
      // Payment Trends
      pdf.text(`Payment Trends:`, 20, yOffset);
      yOffset += 10;
      pdf.text(`The total payment trends for the last 30 days is ${reportData.paymentTrend.trend.toFixed(1)}% ${reportData.paymentTrend.trend >= 0 ? 'increase' : 'decrease'} from the previous period.`, 25, yOffset);
      yOffset += 15;

      // Financial Summary
      pdf.text(`Financial Summary for ${reportData.month}:`, 20, yOffset);
      yOffset += 10;
      pdf.text(`Total Payments Received: ${reportData.totalPayments.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}`, 25, yOffset);
      yOffset += 10;
      pdf.text(`Total Expenses Incurred: ${reportData.totalExpenses.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}`, 25, yOffset);
      yOffset += 15;
      
      // Expense Breakdown
      pdf.text('Expense Breakdown:', 20, yOffset);
      yOffset += 10;
      reportData.expenseBreakdown.forEach((category, index) => {
        if (yOffset > 250) {
          pdf.addPage();
          yOffset = 20;
        }
        const percentage = ((category.amount / reportData.totalExpenses) * 100).toFixed(1);
        pdf.text(`${category.name}: ${category.amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })} (${percentage}% of total)`, 25, yOffset);
        yOffset += 10;
      });
      yOffset += 10;
      
      // Recent Expenses
      pdf.text('Recent Expenses:', 20, yOffset);
      yOffset += 10;
      if (reportData.recentExpenses.length > 0) {
        reportData.recentExpenses.forEach((expense, index) => {
          if (yOffset > 250) {
            pdf.addPage();
            yOffset = 20;
          }
          const dateStr = expense.date !== "Invalid Date" ? ` (${expense.date})` : "";
          pdf.text(`${expense.name} - ${expense.amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}${dateStr}`, 25, yOffset);
          yOffset += 10;
        });
      } else {
        pdf.text("No recent expenses recorded", 25, yOffset);
        yOffset += 10;
      }
      yOffset += 10;
      
      // Homeowners Status
      pdf.text('Homeowners Status:', 20, yOffset);
      yOffset += 10;
      pdf.text(`Recently Paid Homeowners (${reportData.paidHomeowners.length}):`, 25, yOffset);
      yOffset += 10;
      if (reportData.paidHomeowners.length > 0) {
        reportData.paidHomeowners.forEach((name, index) => (
          <Typography key={index} variant="body1" paragraph sx={{ pl: 2 }}>
            {index + 1}. {name}
          </Typography>
        ));
      } else {
        pdf.text(`No homeowners have paid for the current month`, 25, yOffset);
      }
      
      pdf.text(`Pending Payments (${reportData.pendingHomeowners.length}):`, 25, yOffset);
      yOffset += 10;
      if (reportData.pendingHomeowners.length > 0) {
        reportData.pendingHomeowners.forEach((name, index) => {
          const homeowner = reportData.homeowners.find(h => h.name === name);
          const status = homeowner?.status || "Active";
          pdf.text(`${index + 1}. ${name} (${status})`, 30, yOffset);
          yOffset += 10;
        });
      } else {
        pdf.text(`No homeowners with pending status`, 25, yOffset);
      }

      pdf.save('financial-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ mb: 3 }}
      >
        <Typography component="h2" variant="h6">
          Financial Report
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleExportPDF}
          sx={{
            borderRadius: "15px",
            boxShadow: "0px 0px 10px 0px rgba(105, 105, 105, 0.64)",
            "&:hover": {
              backgroundColor: "#000000",
              color: "#FFFFFF"
            }
          }}
        >
          Export as PDF
        </Button>
      </Stack>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          backgroundColor: "rgba(59, 30, 84, 0.04)",
          borderRadius: "15px"
        }}
      >
        <Stack spacing={3}>
          {/* Payment Trends */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
              Payment Trends
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h4" component="p">
                {reportData.paymentTrend.totalAmount.toLocaleString("en-PH", {
                  style: "currency",
                  currency: "PHP",
                })}
          </Typography>
              <Chip
                size="small"
                color={reportData.paymentTrend.trend > 0 ? "success" : "error"}
                label={`${reportData.paymentTrend.trend.toFixed(1)}%`}
              />
            </Stack>
          
          </Box>

          <Divider />

          {/* Financial Summary */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
              Financial Summary for {reportData.month}
            </Typography>
            <Typography variant="body1" paragraph>
              Total Payments Received: {reportData.totalPayments.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
            </Typography>
            <Typography variant="body1" paragraph>
              Total Expenses Incurred: {reportData.totalExpenses.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
            </Typography>
          </Box>

          <Divider />

          {/* Expense Breakdown */}
          <Box>
                <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
              Expense Breakdown
            </Typography>
            <Box sx={{ 
              maxHeight: "200px", 
              overflowY: "auto",
              pr: 2,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#555',
                },
              },
            }}>
              {reportData.expenseBreakdown.map((category, index) => (
                <Typography key={index} variant="body1" paragraph>
                  {category.name}: {category.amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })} 
                  ({(category.amount / reportData.totalExpenses * 100).toFixed(1)}% of total)
                </Typography>
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Recent Expenses */}
                  <Box>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
              Recent Expenses
            </Typography>
            <Box sx={{ 
              maxHeight: "200px", 
              overflowY: "auto",
              pr: 2,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#555',
                },
              },
            }}>
              {reportData.recentExpenses.length > 0 ? (
                reportData.recentExpenses.map((expense, index) => (
                  <Typography key={index} variant="body1" paragraph>
                    {expense.name} - {expense.amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })} 
                    {expense.date !== "Invalid Date" && ` (${expense.date})`}
                    </Typography>
                ))
              ) : (
                <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
                  No recent expenses recorded
                    </Typography>
              )}
                  </Box>
                  </Box>

          <Divider />

            {/* Homeowners Status */}
          <Box>
                <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
                  Homeowners Status
                </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Recently Paid Homeowners ({reportData.paidHomeowners.length}):
                    </Typography>
            <Box sx={{ 
              maxHeight: "200px", 
              overflowY: "auto",
              pr: 2,
              mb: 2,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#555',
                },
              },
                    }}>
                      {reportData.paidHomeowners.length > 0 ? (
                reportData.paidHomeowners.map((name, index) => (
                  <Typography key={index} variant="body1" paragraph sx={{ pl: 2 }}>
                    {index + 1}. {name}
                  </Typography>
                        ))
                      ) : (
                <Typography variant="body1" paragraph sx={{ pl: 2, color: 'text.secondary' }}>
                  No homeowners have paid for the current month
                </Typography>
              )}
                  </Box>
            
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Pending Payments ({reportData.pendingHomeowners.length}):
            </Typography>
            <Box sx={{ 
              maxHeight: "200px", 
              overflowY: "auto",
              pr: 2,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#555',
                },
              },
            }}>
              {reportData.pendingHomeowners.length > 0 ? (
                reportData.pendingHomeowners.map((name, index) => {
                  const homeowner = reportData.homeowners.find(h => h.name === name);
                  const status = homeowner?.status || "Active";
                  return (
                    <Typography key={index} variant="body1" paragraph sx={{ pl: 2 }}>
                      {index + 1}. {name} ({status})
                    </Typography>
                  );
                })
              ) : (
                <Typography variant="body1" paragraph sx={{ pl: 2, color: 'text.secondary' }}>
                  No homeowners with pending status
                </Typography>
              )}
            </Box>
                  </Box>
                </Stack>
              </Paper>
    </Box>
  );
}
