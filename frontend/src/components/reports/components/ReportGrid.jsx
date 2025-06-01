import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PageViewsBarChart from "../../dashboard/components/PageViewsBarChart";
import SessionsChart from "../../dashboard/components/SessionsChart";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function ReportGrid() {
  const [reportData, setReportData] = useState({
    month: format(new Date(), "MMMM yyyy"),
    totalPayments: 0,
    totalExpenses: 0,
    paidHomeowners: [],
    pendingHomeowners: []
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // Format date for API request (YYYY-MM)
      const formattedDate = format(new Date(), "yyyy-MM");
      
      // Fetch payments data
      const paymentsResponse = await fetch(`http://localhost:8000/billing`);
      const paymentsData = await paymentsResponse.json();
      
      // Fetch expenses data
      const expensesResponse = await fetch(`http://localhost:8000/expenses`);
      const expensesData = await expensesResponse.json();
      
      // Fetch homeowners data
      const homeownersResponse = await fetch(`http://localhost:8000/homeowners`);
      const homeownersData = await homeownersResponse.json();
      
      // Process data
      const totalPayments = paymentsData.reduce(
        (sum, payment) => sum + (parseFloat(payment.lastPaymentAmount) || 0), 
        0
      );
      
      const totalExpenses = expensesData.reduce(
        (sum, expense) => sum + (parseFloat(expense.expenseAmount) || 0), 
        0
      );
      
      // Get homeowners who paid this month
      const paidHomeowners = paymentsData
        .filter(payment => {
          const paymentDate = new Date(payment.lastPaymentDate);
          return format(paymentDate, "yyyy-MM") === formattedDate;
        })
        .map(payment => payment.homeownerName);
      
      // Get homeowners with pending dues
      const allHomeowners = homeownersData.map(homeowner => homeowner.name);
      const pendingHomeowners = allHomeowners.filter(name => !paidHomeowners.includes(name));
      
      setReportData({
        month: format(new Date(), "MMMM yyyy"),
        totalPayments,
        totalExpenses,
        paidHomeowners,
        pendingHomeowners
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('Financial Report', 105, 20, { align: 'center' });
      
      // Add date
      pdf.setFontSize(12);
      const currentDate = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${currentDate}`, 105, 30, { align: 'center' });
      
      // Add financial summary
      pdf.setFontSize(16);
      pdf.text(`Monthly Financial Summary for ${reportData.month}`, 20, 45);
      
      pdf.setFontSize(12);
      let yOffset = 55;
      
      // Add financial details
      pdf.text(`Total Payments Received: ${reportData.totalPayments.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}`, 20, yOffset);
      yOffset += 10;
      
      pdf.text(`Total Expenses Incurred: ${reportData.totalExpenses.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}`, 20, yOffset);
      yOffset += 15;
      
      // Add homeowners who paid
      pdf.text('Homeowners Who Paid:', 20, yOffset);
      yOffset += 10;
      
      if (reportData.paidHomeowners.length > 0) {
        reportData.paidHomeowners.forEach((homeowner, index) => {
          if (yOffset > 250) { // Check if we need a new page
            pdf.addPage();
            yOffset = 20;
          }
          pdf.text(`${index + 1}. ${homeowner}`, 25, yOffset);
          yOffset += 7;
        });
      } else {
        pdf.text('No homeowners have made payments this month.', 25, yOffset);
        yOffset += 7;
      }
      
      yOffset += 10;
      
      // Add homeowners with pending dues
      pdf.text('Homeowners With Pending Dues:', 20, yOffset);
      yOffset += 10;
      
      if (reportData.pendingHomeowners.length > 0) {
        reportData.pendingHomeowners.forEach((homeowner, index) => {
          if (yOffset > 250) { // Check if we need a new page
            pdf.addPage();
            yOffset = 20;
          }
          pdf.text(`${index + 1}. ${homeowner}`, 25, yOffset);
          yOffset += 7;
        });
      } else {
        pdf.text('All homeowners have paid their dues for this month.', 25, yOffset);
        yOffset += 7;
      }
      
      // Add charts on a new page
      pdf.addPage();
      const charts = document.querySelectorAll('.chart-container');
      
      yOffset = 20;
      
      // Convert each chart to canvas and add to PDF
      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        const canvas = await html2canvas(chart);
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate dimensions to maintain aspect ratio
        const imgWidth = 190; // Max width for A4
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add new page if needed
        if (yOffset + imgHeight > 270) {
          pdf.addPage();
          yOffset = 20;
        }
        
        pdf.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 10;
      }
      
      // Save the PDF
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
        sx={{ mb: 2 }}
      >
        <Typography component="h2" variant="h6">
          Overview
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

      {/* Financial Summary Card */}
      <Card 
        sx={{ 
          mb: 3,
          borderRadius: "15px",
          boxShadow: "0px 0px 10px 0px rgba(105, 105, 105, 0.64)",
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "medium", color: "primary.main" }}>
            Monthly Financial Summary for {reportData.month}
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Financial Overview */}
            <Grid xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  backgroundColor: "rgba(59, 30, 84, 0.04)",
                  borderRadius: "10px"
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
                  Financial Overview
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Payments Received
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                      {reportData.totalPayments.toLocaleString('en-PH', { 
                        style: 'currency', 
                        currency: 'PHP' 
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Expenses Incurred
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                      {reportData.totalExpenses.toLocaleString('en-PH', { 
                        style: 'currency', 
                        currency: 'PHP' 
                      })}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Homeowners Status */}
            <Grid xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  backgroundColor: "rgba(59, 30, 84, 0.04)",
                  borderRadius: "10px",
                  height: "100%"
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
                  Homeowners Status
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Homeowners Who Paid ({reportData.paidHomeowners.length})
                    </Typography>
                    <List dense sx={{ 
                      maxHeight: "150px", 
                      overflow: "auto",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      borderRadius: "5px",
                      p: 1
                    }}>
                      {reportData.paidHomeowners.length > 0 ? (
                        reportData.paidHomeowners.map((homeowner, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemText 
                              primary={`${index + 1}. ${homeowner}`}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText 
                            primary="No homeowners have made payments this month"
                            primaryTypographyProps={{ 
                              variant: "body2",
                              color: "text.secondary",
                              fontStyle: "italic"
                            }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Homeowners With Pending Dues ({reportData.pendingHomeowners.length})
                    </Typography>
                    <List dense sx={{ 
                      maxHeight: "150px", 
                      overflow: "auto",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      borderRadius: "5px",
                      p: 1
                    }}>
                      {reportData.pendingHomeowners.length > 0 ? (
                        reportData.pendingHomeowners.map((homeowner, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemText 
                              primary={`${index + 1}. ${homeowner}`}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText 
                            primary="All homeowners have paid their dues for this month"
                            primaryTypographyProps={{ 
                              variant: "body2",
                              color: "text.secondary",
                              fontStyle: "italic"
                            }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <Box className="chart-container">
            <SessionsChart />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box className="chart-container">
            <PageViewsBarChart />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
