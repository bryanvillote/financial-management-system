import { useTheme } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Header from "../dashboard/components/Header";

import EmailIcon from "@mui/icons-material/Email";
import PrintIcon from "@mui/icons-material/Print";
import {
  CssBaseline,
  Dialog,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "mui-sonner";
import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import AppTheme from "../../utils/share-theme/AppTheme";
import SideMenu from "../dashboard/components/SideMenu";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../dashboard/theme/customizations";
import { API_BASE_URL } from "../../config";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const theme = createTheme({
  palette: {
    primary: {
      main: "#3B1E54",
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: "#F0A8D0",
      light: "#FFC6C6",
      // dark: will be calculated from palette.secondary.main,
      contrastText: "#000000",
    },
  },
});

const Card = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  position: "relative",
  borderRadius: theme.spacing(3),
  boxShadow:
    "hsla(220, 60.00%, 2.00%, 0.12) 0px 8px 30px 0px, hsla(222, 25.50%, 10.00%, 0.06) 0px 10px 25px -5px",
  ...theme.applyStyles?.("dark", {
    boxShadow:
      "hsla(220, 60.00%, 2.00%, 0.12) 0px 8px 30px 0px, hsla(222, 25.50%, 10.00%, 0.06) 0px 10px 25px -5px",
  }),
}));

// Add this styled component for the receipt
const ReceiptPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "210mm",
  minHeight: "297mm",
  backgroundColor: "#fff",
  margin: "0 auto",
  color: "#000", // Ensure base text color is black
  "@media print": {
    width: "210mm",
    height: "297mm",
    margin: 0,
    padding: "20mm",
  },
}));

// Add styled components for consistent text styles
const LabelCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: "#000000",
  fontSize: "1rem",
  width: "30%",
  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
}));

const ValueCell = styled(TableCell)(({ theme }) => ({
  color: "#000000",
  fontSize: "1rem",
  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
}));

function createData(name, calories, fat) {
  return { name, calories, fat };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
];

export default function Billing(props) {
  const theme = useTheme();
  const [homeowners, setHomeowners] = useState([]);
  const [selectedHomeowner, setSelectedHomeowner] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationStatus, setNotificationStatus] = useState({
    show: false,
    severity: "success",
    message: "",
  });
  const [editingDueAmount, setEditingDueAmount] = useState("");
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const receiptRef = useRef(null);
  const pdfRef = useRef(null);
  const TAX_RATE = 0.07;

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 250,
    },
    {
      field: "email",
      headerName: "Email",
      width: 300,
    },
    {
      field: "blockNo",
      headerName: "Block",
      width: 100,
    },
    {
      field: "lotNo",
      headerName: "Lot",
      width: 100,
    },
    {
      field: "dueAmount",
      headerName: "Due Amount",
      width: 150,
      renderCell: (params) => {
        const amount = params.row.dueAmount ?? 0;
        return formatCurrency(amount);
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleSelectHomeowner(params.row)}
            sx={{ 
              borderRadius: "15px",
              "&:focus": {
                outline: "none"
              }
            }}
          >
            Select
          </Button>
          <Button
            variant="contained"
            size="small"
            color="secondary"
            onClick={() => handleViewReceipt(params.row)}
            startIcon={<PrintIcon />}
            sx={{ 
              borderRadius: "15px",
              "&:focus": {
                outline: "none"
              }
            }}
          >
            Receipt
          </Button>
        </Stack>
      ),
    },
  ];

  const fetchHomeowners = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both homeowners and billing data
      const [homeownersResponse, billingResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/homeowners`),
        fetch(`${API_BASE_URL}/billing`),
      ]);

      if (!homeownersResponse.ok) {
        throw new Error("Failed to fetch homeowners");
      }

      const homeownersData = await homeownersResponse.json();
      const billingData = await billingResponse.json();

      // Create a map of billing data by homeowner ID for faster lookups
      const billingMap = billingData.reduce((acc, billing) => {
        acc[billing.homeownerId] = billing;
        return acc;
      }, {});

      // Combine homeowner and billing data (removed status information)
      const combinedData = homeownersData.map((homeowner) => ({
        ...homeowner,
        dueAmount: billingMap[homeowner._id]?.dueAmount ?? 0,
      }));

      setHomeowners(combinedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHomeowner = (homeowner) => {
    if (!homeowner) return;

    setSelectedHomeowner({
      _id: homeowner._id,
      name: homeowner.name,
      email: homeowner.email,
      blockNo: homeowner.blockNo,
      lotNo: homeowner.lotNo,
      dueAmount: homeowner.dueAmount || 0,
    });
    setPaymentAmount("");
    setEditingDueAmount("");
  };

  const handleUpdateDueAmount = async () => {
    if (!selectedHomeowner || editingDueAmount === "") return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/billing/${selectedHomeowner._id}/update-due`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dueAmount: Number(editingDueAmount),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update due amount");
      }

      // Show success notification
      setNotificationStatus({
        show: true,
        severity: "success",
        message: "Due amount updated successfully",
      });

      // Refresh the data
      await fetchHomeowners();

      // Update selected homeowner
      setSelectedHomeowner((prev) => ({
        ...prev,
        dueAmount: Number(editingDueAmount),
      }));
    } catch (error) {
      console.error("Error updating due amount:", error);
      setNotificationStatus({
        show: true,
        severity: "error",
        message: "Failed to update due amount",
      });
    }
  };

  const handlePayment = async () => {
    if (!selectedHomeowner) return;
    if (!paymentAmount) return;

    try {
      // Process the payment
      const paymentResponse = await fetch(`${API_BASE_URL}/billing/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeownerId: selectedHomeowner._id,
          amount: parseFloat(paymentAmount),
          referenceNumber: `PAY-${Date.now()}`,
        }),
      });

      if (!paymentResponse.ok) {
        const data = await paymentResponse.json();
        throw new Error(data.message || "Payment processing failed");
      }

      // Start the automatic penalty cycle
      const penaltyResponse = await fetch(`${API_BASE_URL}/homeowners/${selectedHomeowner._id}/start-penalty-cycle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!penaltyResponse.ok) {
        console.warn("Failed to start penalty cycle, but payment was processed");
      }

      // Update the currentReceipt if it's open for the same homeowner
      if (currentReceipt && currentReceipt._id === selectedHomeowner._id) {
        setCurrentReceipt(prev => ({
          ...prev,
          isPaid: true,
          lastPaymentDate: new Date().toISOString(),
          lastPaymentAmount: parseFloat(paymentAmount),
          dueAmount: 0
        }));
      }

      // Show success message
      toast.success("Payment processed successfully");

      // Reset form and refresh data
      setPaymentAmount("");
      setSelectedHomeowner(null);
      await fetchHomeowners();
    } catch (error) {
      setError(error.message);
      console.error("Error processing payment:", error);
      toast.error(error.message || "Failed to process payment");
    }
  };

  const handleSendNotification = async () => {
    if (!selectedHomeowner) return;

    const loadingToastId = toast.loading("Preparing to send payment reminder...");

    try {
      const response = await fetch(
        `${API_BASE_URL}/email/send-payment-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: selectedHomeowner.email,
            name: selectedHomeowner.name,
            dueAmount: selectedHomeowner.dueAmount,
            blockNo: selectedHomeowner.blockNo,
            lotNo: selectedHomeowner.lotNo,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send notification");
      }

      // Show success message with more details
      toast.success("Payment reminder sent successfully!", {
        description: `Reminder has been sent to ${selectedHomeowner.email}`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send payment reminder", {
        description: error.message || "Please try again later",
        duration: 5000,
      });
    } finally {
      toast.dismiss(loadingToastId);
    }
  };

  // Add this function to check if payment amount matches due amount
  const isPaymentValid = () => {
    if (!selectedHomeowner || !paymentAmount) return false;
    return parseFloat(paymentAmount) === selectedHomeowner.dueAmount;
  };

  const handleViewReceipt = (homeowner) => {
    // Find the latest homeowner data from the homeowners state
    const latestHomeownerData = homeowners.find(h => h._id === homeowner._id);
    
    setCurrentReceipt({
      ...homeowner,
      isPaid: latestHomeownerData?.dueAmount === 0,
      lastPaymentDate: latestHomeownerData?.lastPaymentDate,
      lastPaymentAmount: latestHomeownerData?.lastPaymentAmount,
      dueAmount: latestHomeownerData?.dueAmount || 0
    });
    setReceiptDialogOpen(true);
  };

  const handleSaveAsPDF = async () => {
    try {
      const pdfContent = pdfRef.current;
      const canvas = await html2canvas(pdfContent, {
        scale: 2, // Increased scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: pdfContent.offsetWidth,
        height: pdfContent.offsetHeight,
      });

      // Use A4 dimensions (210mm x 297mm)
      const imgWidth = 210;
      const imgHeight = 297;

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Receipt_${currentReceipt?.name || "Homeowner"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleSendEmail = async () => {
    if (!receiptRef.current || !currentReceipt) return;

    const loadingToastId = toast.loading("Preparing to send receipt...");

    try {
      // Get the receipt HTML content
      const receiptHtml = receiptRef.current.outerHTML;

      // Prepare the email data
      const emailData = {
        email: currentReceipt.email,
        subject: "Your HOA Payment Receipt",
        receiptHtml: receiptHtml,
        homeownerName: currentReceipt.name,
        blockNo: currentReceipt.blockNo,
        lotNo: currentReceipt.lotNo,
        dueAmount: currentReceipt.dueAmount,
        paymentDate: new Date().toLocaleDateString(),
        referenceNumber: `PAY-${Date.now()}`
      };

      // Update loading message
      toast.loading("Sending receipt to email...", { id: loadingToastId });

      // Send the email
      const response = await fetch(`${API_BASE_URL}/email/send-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send email");
      }

      // Show success message with more details
      toast.success("Receipt sent successfully!", {
        description: `Receipt has been sent to ${currentReceipt.email}`,
        duration: 5000,
      });
      
      setReceiptDialogOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email", {
        description: error.message || "Please try again later",
        duration: 5000,
      });
    } finally {
      toast.dismiss(loadingToastId);
    }
  };

  useEffect(() => {
    fetchHomeowners();
    const interval = setInterval(fetchHomeowners, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Add this useEffect to monitor the homeowners state
  useEffect(() => {
    console.log("Current homeowners state:", homeowners);
  }, [homeowners]);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <SideMenu />
        <Stack
          spacing={2}
          sx={{
            alignItems: "center",
            mx: "auto",
            pb: 5,
            mt: { xs: 8, md: 5 },
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
            pl: {md: "430px"}
          }}
        >
          <Header />
          <Stack 
            sx={{ 
              width: "100%", 
              maxWidth: '2500px', 
              mx: 'auto',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <h2>Homeowner Billings and Payments</h2>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                padding: 4,
                minHeight: 600,
                alignItems: "center",
                width: "100%",
                maxWidth: "2500px",
                overflow: "hidden",
              }}
            >
              {/* Table Container */}
              <Paper
                sx={{
                  borderRadius: "20px",
                  width: "100%",
                  padding: { xs: 1, md: 4 },
                  height: "fit-content",
                  overflow: "visible",
                  maxWidth: "2500px",
                  mx: "auto",
                  boxShadow: "0px 0px 10px 0px rgba(168, 168, 168, 0.69)",
                  backgroundColor: "#ffffff"
                }}
              >
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <TextField
                      size="small"
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{
                        width: '300px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          backgroundColor: '#ffffff',
                        },
                      }}
                    />
                  </Box>
                  <DataGrid
                    rows={homeowners.filter(homeowner => 
                      homeowner.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    columns={columns}
                    getRowId={(row) => row._id}
                    autoHeight
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    disableSelectionOnClick
                    sx={{
                      "& .MuiDataGrid-cell": {
                        fontSize: "0.875rem",
                        backgroundColor: "#ffffff"
                      },
                      "& .MuiDataGrid-columnHeader": {
                        backgroundColor: "#ffffff",
                      },
                      "& .MuiDataGrid-footerContainer": {
                        backgroundColor: "#ffffff"
                      },
                      width: "100%",
                      minWidth: "100%",
                      borderColor: "#ffffff"
                    }}
                  />
                </Box>
              </Paper>

              {/* Payment Details Card */}
              <Paper
                sx={{
                  borderRadius: "20px",
                  padding: 4,
                  width: "100%",
                  maxWidth: "2500px",
                  mx: "auto",
                  boxShadow: "0px 0px 10px 0px rgba(168, 168, 168, 0.69)",
                  backgroundColor: "#ffffff"
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    mb: 3,
                    fontWeight: "medium",
                    color: "primary.main",
                  }}
                >
                  Payment Details
                </Typography>

                {selectedHomeowner ? (
                  <Stack spacing={2.5}>
                    {/* Homeowner Info Section */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Selected Homeowner
                      </Typography>
                      <Typography variant="body1">
                        {selectedHomeowner.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Block {selectedHomeowner.blockNo}, Lot{" "}
                        {selectedHomeowner.lotNo}
                      </Typography>
                    </Box>

                    {/* Due Amount Section */}
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Due Amount
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={editingDueAmount}
                        onChange={(e) => setEditingDueAmount(e.target.value)}
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <Typography sx={{ mr: 1 }}>₱</Typography>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                          },
                        }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleUpdateDueAmount}
                        sx={{
                          mt: 1,
                          borderRadius: "15px",
                          textTransform: "none",
                          "&:focus": {
                            outline: "none"
                          }
                        }}
                      >
                        Update Due Amount
                      </Button>
                    </Box>

                    {/* Payment Amount Section */}
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Payment Amount
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <Typography sx={{ mr: 1 }}>₱</Typography>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                          },
                        }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handlePayment}
                        disabled={!selectedHomeowner || !paymentAmount || parseFloat(paymentAmount) !== selectedHomeowner.dueAmount}
                        sx={{
                          mt: 2,
                          borderRadius: "15px",
                          textTransform: "none",
                          "&:focus": {
                            outline: "none"
                          }
                        }}
                      >
                        Process Payment
                      </Button>
                    </Box>

                    {/* Notification Button */}
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EmailIcon />}
                      onClick={handleSendNotification}
                      sx={{
                        mt: 1,
                        borderRadius: "15px",
                        textTransform: "none",
                        "&:focus": {
                          outline: "none"
                        }
                      }}
                    >
                      Send Notification
                    </Button>
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="body1">
                      Select a homeowner to manage payments
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Stack>
        </Stack>

        {/* Receipt Dialog */}
        <Dialog
          open={receiptDialogOpen}
          onClose={() => setReceiptDialogOpen(false)}
          maxWidth={false}
          PaperProps={{
            sx: {
              width: "230mm",
              height: "320mm",
              maxWidth: "none",
              backgroundColor: "#ffffff",
            },
          }}
        >
          <DialogTitle
            sx={{ p: 3, pb: 0, borderBottom: "1px solid rgba(0, 0, 0, 0.12)" }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Typography
                variant="h6"
                sx={{ color: "#000000", fontWeight: 600 }}
              >
                Payment Receipt
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleSaveAsPDF}
                  startIcon={<PrintIcon />}
                  sx={{ 
                    bgcolor: "#3B1E54",
                    borderRadius: "15px",
                    "&:focus": {
                      outline: "none"
                    }
                  }}
                >
                  Save as PDF
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSendEmail}
                  startIcon={<EmailIcon />}
                  sx={{ 
                    bgcolor: "#3B1E54",
                    borderRadius: "15px",
                    "&:focus": {
                      outline: "none"
                    }
                  }}
                >
                  Send via Email
                </Button>
              </Stack>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <ReceiptPaper ref={pdfRef}>
              <Box ref={receiptRef} sx={{ p: 3 }}>
                <Typography variant="h4" align="center" gutterBottom>
                  Centro de San Lorenzo
                </Typography>
                <Typography variant="h6" align="center" gutterBottom>
                  HOA Payment Receipt
                </Typography>

                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <LabelCell>Homeowner Name:</LabelCell>
                        <ValueCell>{currentReceipt?.name}</ValueCell>
                      </TableRow>
                      <TableRow>
                        <LabelCell>Block Number:</LabelCell>
                        <ValueCell>{currentReceipt?.blockNo}</ValueCell>
                      </TableRow>
                      <TableRow>
                        <LabelCell>Lot Number:</LabelCell>
                        <ValueCell>{currentReceipt?.lotNo}</ValueCell>
                      </TableRow>
                      <TableRow>
                        <LabelCell>Email:</LabelCell>
                        <ValueCell>{currentReceipt?.email}</ValueCell>
                      </TableRow>
                      <TableRow>
                        <LabelCell>Payment Status:</LabelCell>
                        <ValueCell>
                          <Typography
                            color={
                              currentReceipt?.isPaid ? "success.main" : "error.main"
                            }
                            fontWeight="medium"
                          >
                            {currentReceipt?.isPaid ? "PAID" : "UNPAID"}
                          </Typography>
                        </ValueCell>
                      </TableRow>
                      {currentReceipt?.lastPaymentDate && (
                        <TableRow>
                          <LabelCell>Last Payment Date:</LabelCell>
                          <ValueCell>
                            {new Date(
                              currentReceipt.lastPaymentDate
                            ).toLocaleDateString()}
                          </ValueCell>
                        </TableRow>
                      )}
                      {currentReceipt?.lastPaymentAmount && (
                        <TableRow>
                          <LabelCell>Last Payment Amount:</LabelCell>
                          <ValueCell>
                            {formatCurrency(currentReceipt.lastPaymentAmount)}
                          </ValueCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <LabelCell>Due Amount:</LabelCell>
                        <ValueCell>
                          {formatCurrency(currentReceipt?.dueAmount || 0)}
                        </ValueCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 4,
                    textAlign: "center",
                    color: "#000000",
                    opacity: 0.87,
                  }}
                >
                  This is an official receipt of the Homeowners Association.
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    textAlign: "center",
                    color: "#000000",
                    opacity: 0.67,
                  }}
                >
                  Generated on {new Date().toLocaleString()}
                </Typography>
              </Box>
            </ReceiptPaper>
          </DialogContent>
        </Dialog>
      </ThemeProvider>
    </AppTheme>
  );
}
