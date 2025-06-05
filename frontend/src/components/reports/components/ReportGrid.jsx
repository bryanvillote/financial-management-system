import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import Chip from "@mui/material/Chip";
import autoTable from 'jspdf-autotable';

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

      // Process payment trends data
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
        if (billing.lastPaymentDate) {
          try {
            const dayIndex = 29 - Math.floor(
              (Date.now() - new Date(billing.lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24)
            );
            if (dayIndex >= 0 && dayIndex < 30) {
              const paymentAmount = parseFloat(billing.lastPaymentAmount) || 0;
              last30Days[dayIndex] += paymentAmount;
              totalAmount += paymentAmount;
            }
          } catch (error) {
            console.error("Error processing payment date:", billing.lastPaymentDate);
          }
        }
      });

      // Calculate trend
      const recentSum = last30Days.slice(15).reduce((a, b) => a + b, 0);
      const previousSum = last30Days.slice(0, 15).reduce((a, b) => a + b, 0);
      const trend = previousSum !== 0 ? ((recentSum - previousSum) / previousSum) * 100 : 0;

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
      
      // Get only homeowners who paid in the current month
      const paidHomeowners = paymentsData
        .filter(payment => {
          if (!payment.lastPaymentDate) return false;
          try {
            const paymentDate = new Date(payment.lastPaymentDate);
            const paymentMonth = format(paymentDate, "yyyy-MM");
            return paymentMonth === currentMonth && Boolean(payment.homeownerName);
          } catch (error) {
            console.error("Error processing payment date:", payment.lastPaymentDate);
            return false;
          }
        })
        .map(payment => payment.homeownerName)
        .filter(Boolean);

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
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(expense => {
          let formattedDate = "N/A";
          if (expense.date) {
            try {
              const date = new Date(expense.date);
              if (!isNaN(date.getTime())) {
                formattedDate = format(date, "MMM dd, yyyy");
              }
            } catch (error) {
              console.error("Error formatting expense date:", expense.date);
            }
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

      setReportData(updatedData);

    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF();
      
      // Add logo
      const logo = new Image();
      logo.src = '/src/logo.png';
      
      await new Promise((resolve) => {
        logo.onload = () => {
          // Calculate aspect ratio to maintain image proportions
          const imgWidth = 40;
          const imgHeight = (logo.height * imgWidth) / logo.width;
          
          // Add logo to PDF
          pdf.addImage(logo, 'PNG', 20, 10, imgWidth, imgHeight);
          resolve();
        };
      });
      
      // Add header text (adjusted position to account for logo)
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CENTRO DE SAN LORENZO', 190, 25, { align: 'right' });
      pdf.setFontSize(16);
      pdf.text('Homeowners\' Association', 190, 35, { align: 'right' });
      
      // Add title
      pdf.setFontSize(18);
      pdf.text('MONTHLY REPORT', 105, 50, { align: 'center' });
      
      // Add date generated
      pdf.setFontSize(12);
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Date Generated: ${currentDate}`, 20, 60);
      
      let yOffset = 70;

      // Payment Trends Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Payment Trends – Last 30 Days', 20, yOffset);
      yOffset += 10;

      // Create payment trends table
      const paymentTrendsData = reportData.paymentTrend.dates.map((date, index) => [
        date,
        reportData.paymentTrend.payments[index] > 0 ? '1' : '0',
        reportData.paymentTrend.payments[index].toLocaleString('en-PH', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        reportData.paymentTrend.payments[index] > 0 ? 'Payment received' : 'No payment'
      ]);

      autoTable(pdf, {
        startY: yOffset,
        head: [['Date', 'Number of Payments', 'Total Collected', 'Notes']],
        body: paymentTrendsData,
        theme: 'grid',
        styles: { 
          fontSize: 10,
          cellPadding: 5,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      yOffset = pdf.lastAutoTable.finalY + 15;

      // Expense Breakdown Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Expense Breakdown', 20, yOffset);
      yOffset += 10;

      // Create expense breakdown table
      const expenseData = reportData.expenseBreakdown.map(expense => [
        expense.name,
        expense.amount.toLocaleString('en-PH', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        `${((expense.amount / reportData.totalExpenses) * 100).toFixed(1)}% of total`
      ]);

      autoTable(pdf, {
        startY: yOffset,
        head: [['Item/Description', 'Amount', 'Notes']],
        body: expenseData,
        theme: 'grid',
        styles: { 
          fontSize: 10,
          cellPadding: 5,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      yOffset = pdf.lastAutoTable.finalY + 15;

      // Total Payments Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total Payments Collected', 20, yOffset);
      yOffset += 10;
      pdf.setFontSize(16);
      pdf.text(reportData.totalPayments.toLocaleString('en-PH', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }), 20, yOffset);
      yOffset += 20;

      // Paid Homeowners Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('List of Homeowners Who Paid', 20, yOffset);
      yOffset += 10;

      // Create paid homeowners table
      const paidHomeownersData = reportData.paidHomeowners.map((name, index) => {
        const homeowner = reportData.homeowners.find(h => h.name === name);
        return [
          name,
          homeowner?.blockLot || 'N/A',
          '2,000.00', // Assuming standard payment amount
          new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        ];
      });

      autoTable(pdf, {
        startY: yOffset,
        head: [['Homeowner Name', 'Block/Lot', 'Amount Paid', 'Date Paid']],
        body: paidHomeownersData,
        theme: 'grid',
        styles: { 
          fontSize: 10,
          cellPadding: 5,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      yOffset = pdf.lastAutoTable.finalY + 15;

      // Pending Homeowners Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('List of Homeowners with Pending Dues', 20, yOffset);
      yOffset += 10;

      // Create pending homeowners table
      const pendingHomeownersData = reportData.pendingHomeownersWithStatus.map(homeowner => [
        homeowner.name,
        'N/A', // Block/Lot
        '2,000.00', // Amount Due
        '200.00', // Penalty
        `${homeowner.status} status`
      ]);

      autoTable(pdf, {
        startY: yOffset,
        head: [['Homeowner Name', 'Block/Lot', 'Amount Due', 'Penalty', 'Notes']],
        body: pendingHomeownersData,
        theme: 'grid',
        styles: { 
          fontSize: 10,
          cellPadding: 5,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      pdf.save('monthly-financial-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "2000px" } }}>
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

      <Grid container spacing={3}>
        {/* Left Container */}
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              backgroundColor: "rgba(59, 30, 84, 0.04)",
              borderRadius: "15px",
              height: "100%"
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
                  maxHeight: "400px", 
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
            </Stack>
          </Paper>
        </Grid>

        {/* Right Container */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              backgroundColor: "rgba(59, 30, 84, 0.04)",
              borderRadius: "15px",
              height: "100%"
            }}
          >
            <Stack spacing={3}>
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
        </Grid>
      </Grid>
    </Box>
  );
}
