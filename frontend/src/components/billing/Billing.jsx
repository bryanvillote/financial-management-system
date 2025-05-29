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
      width: 150,
    },
    {
      field: "email",
      headerName: "Email",
      width: 180,
    },
    {
      field: "blockNo",
      headerName: "Block",
      width: 70,
    },
    {
      field: "lotNo",
      headerName: "Lot",
      width: 70,
    },
    {
      field: "dueAmount",
      headerName: "Due Amount",
      width: 120,
      renderCell: (params) => {
        const amount = params.row.dueAmount ?? 0;
        return formatCurrency(amount);
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleSelectHomeowner(params.row)}
          >
            Select
          </Button>
          <Button
            variant="contained"
            size="small"
            color="secondary"
            onClick={() => handleViewReceipt(params.row)}
            startIcon={<PrintIcon />}
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
        fetch("http://localhost:8000/homeowners"),
        fetch("http://localhost:8000/billing"),
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

      // Combine homeowner and billing data
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
        `http://localhost:8000/billing/${selectedHomeowner._id}/update-due`,
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
      const response = await fetch("http://localhost:8000/billing/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeownerId: selectedHomeowner._id,
          amount: parseFloat(paymentAmount),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Payment processing failed");
      }

      // Restart the penalty system for the homeowner
      const restartResponse = await fetch(`http://localhost:8000/homeowners/restart-penalty/${selectedHomeowner._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!restartResponse.ok) {
        console.error("Failed to restart penalty system");
      }

      setPaymentAmount("");
      setSelectedHomeowner(null);
      await fetchHomeowners();
    } catch (error) {
      setError(error.message);
      console.error("Error processing payment:", error);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedHomeowner) return;

    try {
      const response = await fetch(
        "http://localhost:8000/email/send-payment-reminder",
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

      setNotificationStatus({
        show: true,
        severity: "success",
        message: "Payment reminder sent successfully",
      });

      // Hide the success message after 5 seconds
      setTimeout(() => {
        setNotificationStatus((prev) => ({ ...prev, show: false }));
      }, 5000);
    } catch (error) {
      console.error("Error sending notification:", error);
      setNotificationStatus({
        show: true,
        severity: "error",
        message: error.message || "Failed to send notification",
      });
    }
  };

  // Add this function to check if payment amount matches due amount
  const isPaymentValid = () => {
    if (!selectedHomeowner || !paymentAmount) return false;
    return parseFloat(paymentAmount) === selectedHomeowner.dueAmount;
  };

  const handleViewReceipt = (homeowner) => {
    setCurrentReceipt(homeowner);
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

    const loadingToastId = toast.loading("Sending receipt to email...");

    try {
      const receiptHtml = receiptRef.current.outerHTML;

      const response = await fetch("http://localhost:8000/email/send-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentReceipt.email,
          receiptHtml: receiptHtml,
          subject: "Your HOA Payment Receipt",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast.success("Receipt sent successfully!");
      setReceiptDialogOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
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
            mx: 3,
            pb: 5,
            mt: { xs: 8, md: 0 },
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden"
          }}
        >
          <Header />
          <Stack sx={{ width: "100%", maxWidth: '1200px', mx: 'auto',  }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                padding: 4,
                minHeight: 600,
                alignItems: "flex-start",
                marginLeft: { xs: 0, md: 35 },
                width: "100%",
                overflow: "hidden"
              }}
            >
              {/* Table Container */}
              <Paper
                sx={{
                  width: "100%",
                  padding: { xs: 1, md: 4 },
                  height: "fit-content",
                  overflow: "visible"
                }}
              >
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <DataGrid
                  rows={homeowners}
                  columns={columns}
                  getRowId={(row) => row._id}
                  autoHeight
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                  disableSelectionOnClick
                  sx={{
                    "& .MuiDataGrid-cell": {
                      fontSize: "0.875rem",
                    },
                    "& .MuiDataGrid-columnHeader": {
                      backgroundColor: "rgba(59, 30, 84, 0.08)",
                    },
                      width: "max-content"
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
                  maxWidth: "850px"
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
                          borderRadius: "10px",
                          textTransform: "none",
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
                        onClick={handlePayment}
                        sx={{
                          mt: 1,
                          borderRadius: "10px",
                          textTransform: "none",
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
                        borderRadius: "10px",
                        textTransform: "none",
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
                  sx={{ bgcolor: "#3B1E54" }}
                >
                  Save as PDF
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSendEmail}
                  startIcon={<EmailIcon />}
                  sx={{ bgcolor: "#3B1E54" }}
                >
                  Send via Email
                </Button>
              </Stack>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box ref={pdfRef}>
              <ReceiptPaper ref={receiptRef}>
                <Stack spacing={4}>
                  {/* Header Section */}
                  <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Typography
                      variant="h4"
                      gutterBottom
                      sx={{
                        color: "#000000",
                        fontWeight: 700,
                        fontSize: "2rem",
                        mb: 2,
                      }}
                    >
                      HOA Payment Receipt
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#000000",
                        fontWeight: 500,
                        opacity: 0.87,
                      }}
                    >
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>
                  </Box>

                  {/* Organization Info */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        color: "#000000",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                      }}
                    >
                      Homeowners Association
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "#000000", mb: 0.5 }}
                    >
                      123 Main Street
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "#000000", mb: 0.5 }}
                    >
                      City, State 12345
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#000000" }}>
                      Phone: (123) 456-7890
                    </Typography>
                  </Box>

                  {/* Homeowner Info */}
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                      mb: 4,
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: 2,
                    }}
                  >
                    <Table>
                      <TableBody>
                        <TableRow>
                          <LabelCell>Homeowner Name:</LabelCell>
                          <ValueCell>{currentReceipt?.name}</ValueCell>
                        </TableRow>
                        <TableRow>
                          <LabelCell>Email:</LabelCell>
                          <ValueCell>{currentReceipt?.email}</ValueCell>
                        </TableRow>
                        <TableRow>
                          <LabelCell>Block & Lot:</LabelCell>
                          <ValueCell>
                            Block {currentReceipt?.blockNo}, Lot{" "}
                            {currentReceipt?.lotNo}
                          </ValueCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Payment Details */}
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                      mb: 4,
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: 2,
                      backgroundColor: "#f8f8f8",
                    }}
                  >
                    <Table>
                      <TableBody>
                        <TableRow>
                          <LabelCell>Due Amount:</LabelCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: "#000000",
                              fontWeight: 500,
                              fontSize: "1rem",
                            }}
                          >
                            {formatCurrency(currentReceipt?.dueAmount || 0)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <LabelCell>Tax (7%):</LabelCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: "#000000",
                              fontWeight: 500,
                              fontSize: "1rem",
                            }}
                          >
                            {formatCurrency(
                              (currentReceipt?.dueAmount || 0) * TAX_RATE
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <LabelCell
                            sx={{
                              fontSize: "1.1rem",
                              fontWeight: 700,
                            }}
                          >
                            Total Amount:
                          </LabelCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: "1.1rem",
                              fontWeight: 700,
                              color: "#3B1E54",
                            }}
                          >
                            {formatCurrency(
                              (currentReceipt?.dueAmount || 0) * (1 + TAX_RATE)
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Payment Status */}
                  <Box
                    sx={{
                      mb: 4,
                      p: 2,
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: 2,
                      backgroundColor: "#f8f8f8",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#000000",
                        fontWeight: 600,
                      }}
                    >
                      Payment Status:{" "}
                      <Typography
                        component="span"
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color:
                            currentReceipt?.dueAmount > 0
                              ? "#d32f2f"
                              : "#2e7d32",
                        }}
                      >
                        {currentReceipt?.dueAmount > 0 ? "UNPAID" : "PAID"}
                      </Typography>
                    </Typography>
                  </Box>

                  {/* Footer */}
                  <Box
                    sx={{
                      mt: "auto",
                      textAlign: "center",
                      pt: 4,
                      borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#000000",
                        opacity: 0.87,
                        mb: 1,
                      }}
                    >
                      This is an official receipt of the Homeowners Association.
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#000000",
                        opacity: 0.67,
                      }}
                    >
                      Generated on {new Date().toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </ReceiptPaper>
            </Box>
          </DialogContent>
        </Dialog>
      </ThemeProvider>
    </AppTheme>
  );
}
