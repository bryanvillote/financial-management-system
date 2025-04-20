import {
  Box,
  Button,
  Modal,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  ThemeProvider,
  Typography,
  createTheme,
  styled,
} from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { jwtDecode } from "jwt-decode";
import { toast } from "mui-sonner";
import React, { useEffect, useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency";

// Theme setup
const theme = createTheme({
  palette: {
    primary: {
      main: "#3B1E54",
    },
    secondary: {
      main: "#F0A8D0",
      light: "#FFC6C6",
      contrastText: "#000000",
    },
  },
});

// Styled container card
const CustomCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow:
    "hsla(220, 60%, 2%, 0.12) 0px 8px 30px, hsla(222, 25.5%, 10%, 0.06) 0px 10px 25px -5px",
  background: "#fff",
  "& .MuiTableCell-root": {
    borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
    padding: theme.spacing(1.5),
  },
  "& .MuiTableRow-root:last-child .MuiTableCell-root": {
    borderBottom: "none",
  },
}));

// Data logic
const TAX_RATE = 0.07;

// Modal styles
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  width: 400,
  outline: "none",
};

// Add penalty level descriptions
const PENALTY_DESCRIPTIONS = {
  0: "None",
  1: "Warning (2 minutes)",
  2: "Danger (4 minutes)",
  3: "No Participation (5 minutes)",
};

// Add these constants at the top of the file
const BASE_PENALTY_DURATION = 3; // 3 seconds
const PENALTY_INCREMENT = 3; // 3 seconds increment

// Helper function to calculate current penalty duration
const calculatePenaltyDuration = (penaltyLevel) => {
  if (!penaltyLevel || penaltyLevel === 0) return 0;
  return BASE_PENALTY_DURATION + (penaltyLevel - 1) * PENALTY_INCREMENT;
};

// Helper function to get penalty description
const getPenaltyDescription = (penaltyLevel, penaltyStatus) => {
  if (!penaltyLevel || penaltyLevel === 0) return "No Active Penalty";
  const duration = calculatePenaltyDuration(penaltyLevel);
  const status = penaltyStatus === "Pending" ? "Pending" : "Active";
  return `Level ${penaltyLevel} (${duration} seconds) - ${status}`;
};

export default function ReceiptUI() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const receiptRef = React.useRef(null);
  const pdfRef = React.useRef(null);
  const [homeownerData, setHomeownerData] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate totals based on actual billing data
  const calculateTotals = (dueAmount) => {
    const subtotal = dueAmount || 0;
    const taxes = subtotal * TAX_RATE;
    const total = subtotal + taxes;
    return { subtotal, taxes, total };
  };

  const fetchHomeownerData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No auth token found");
        return;
      }

      const decodedToken = jwtDecode(token);
      const userEmail = decodedToken.email;

      // Fetch homeowner data
      const homeownerResponse = await fetch(
        `http://localhost:8000/homeowners/email/${userEmail}`
      );
      const homeownerResult = await homeownerResponse.json();

      if (!homeownerResponse.ok) {
        throw new Error(
          homeownerResult.message || "Failed to fetch homeowner data"
        );
      }

      setHomeownerData(homeownerResult.data);

      // Fetch billing data
      const billingResponse = await fetch(
        `http://localhost:8000/billing/by-email/${userEmail}`
      );
      const billingResult = await billingResponse.json();

      if (!billingResponse.ok) {
        throw new Error(
          billingResult.message || "Failed to fetch billing data"
        );
      }

      setBillingData(billingResult.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeownerData();
  }, []);

  const handleSaveAsPDF = async () => {
    try {
      const pdfContent = pdfRef.current;
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Receipt_${homeownerData?.name || "Homeowner"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleSendEmail = async () => {
    if (!receiptRef.current || !homeownerData) return;

    // Create a unique ID for the loading toast so we can dismiss it later
    const loadingToastId = toast.loading("Sending receipt to your email...");

    try {
      // Get the HTML content of the receipt
      const receiptHtml = receiptRef.current.outerHTML;

      // Send to backend
      const response = await fetch("http://localhost:8000/email/send-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: receiptHtml,
          email: homeownerData.email,
          blockNo: homeownerData.blockNo,
          lotNo: homeownerData.lotNo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send email");
      }

      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      toast.success("Receipt sent to your email successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId);
      toast.error("Failed to send receipt: " + error.message);
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  if (error)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );

  const { subtotal, taxes, total } = calculateTotals(billingData?.dueAmount);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }}>
        {/* Receipt Content */}
        <Box ref={receiptRef} sx={{ p: 4, maxWidth: 1200, marginLeft: 50 }}>
          {/* Header */}
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
            Centro de San Lorenzo
          </Typography>

          {/* Main Content Grid */}
          <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
            {/* Left Card - Homeowner Information */}
            <CustomCard sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Homeowner Information
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Block & Lot:
                      </TableCell>
                      <TableCell>
                        Block {homeownerData?.blockNo || "N/A"}, Lot{" "}
                        {homeownerData?.lotNo || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Email:</TableCell>
                      <TableCell>{homeownerData?.email || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Status:</TableCell>
                      <TableCell
                        sx={{
                          color:
                            homeownerData?.status === "Active"
                              ? "success.main"
                              : "error.main",
                          fontWeight: "medium",
                        }}
                      >
                        {homeownerData?.status || "Active"}
                      </TableCell>
                    </TableRow>
                    {/* Add Penalty Information */}
                    {(homeownerData?.penaltyLevel > 0 ||
                      homeownerData?.penaltyStatus === "Pending") && (
                      <>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Penalty Level:
                          </TableCell>
                          <TableCell sx={{ color: "error.main" }}>
                            {getPenaltyDescription(
                              homeownerData.penaltyLevel ||
                                homeownerData.pendingPenaltyLevel,
                              homeownerData.penaltyStatus
                            )}
                          </TableCell>
                        </TableRow>
                        {homeownerData.penaltyStartTime && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Penalty Started:
                            </TableCell>
                            <TableCell>
                              {new Date(
                                homeownerData.penaltyStartTime
                              ).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CustomCard>

            {/* Right Card - Billing Information */}
            <CustomCard sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Billing Information
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", width: "40%" }}>
                        Due Amount:
                      </TableCell>
                      <TableCell>
                        {formatCurrency(billingData?.dueAmount)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Tax ({(TAX_RATE * 100).toFixed(0)}%):
                      </TableCell>
                      <TableCell>
                        {formatCurrency(billingData?.dueAmount * TAX_RATE)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Total Amount Due:
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          (billingData?.dueAmount || 0) * (1 + TAX_RATE)
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Payment Status:
                      </TableCell>
                      <TableCell>
                        <Typography
                          color={
                            billingData?.isPaid ? "success.main" : "error.main"
                          }
                          fontWeight="bold"
                        >
                          {billingData?.isPaid ? "PAID" : "UNPAID"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CustomCard>
          </Box>

          {/* Center Card - Add Penalty Warning if applicable */}
          <CustomCard sx={{ mb: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6" align="center" gutterBottom>
                Payment Reminder
              </Typography>
              <Typography variant="body1" align="center" color="text.secondary">
                Please ensure timely payment of your dues to avoid penalties.
                {billingData?.lastPaymentDate && (
                  <>
                    <br />
                    Last Payment:{" "}
                    {formatCurrency(billingData.lastPaymentAmount)} on{" "}
                    {new Date(billingData.lastPaymentDate).toLocaleDateString()}
                  </>
                )}
              </Typography>

              {/* Add Penalty Warning */}
              {homeownerData?.penaltyLevel > 0 && (
                <Typography
                  variant="body1"
                  align="center"
                  color="error.main"
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "error.lighter",
                    borderRadius: 1,
                    fontWeight: "medium",
                  }}
                >
                  ⚠️ Your account is currently under penalty level{" "}
                  {homeownerData.penaltyLevel}. The penalty duration will
                  increase by {PENALTY_INCREMENT} seconds for each unpaid
                  period. Please settle your payment to avoid further penalties.
                </Typography>
              )}

              <Typography
                variant="body2"
                align="center"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                This is an official receipt from Centro de San Lorenzo. Please
                keep this for your records.
              </Typography>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleSaveAsPDF}
                  disabled={loading}
                  sx={{ minWidth: 150 }}
                >
                  Save as PDF
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSendEmail}
                  disabled={loading}
                  sx={{ minWidth: 150 }}
                >
                  Send to Email
                </Button>
              </Box>
            </Stack>
          </CustomCard>
        </Box>

        {/* Hidden PDF content - This will be used for PDF generation */}
        <Box
          ref={pdfRef}
          sx={{
            position: "absolute",
            left: "-9999px",
            width: "210mm",
            padding: "20mm",
            backgroundColor: "#ffffff",
          }}
        >
          {/* PDF Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Centro de San Lorenzo
            </Typography>
            <Typography variant="h5" gutterBottom>
              Official Receipt
            </Typography>
            <Typography variant="body2">
              Date: {new Date().toLocaleDateString()}
            </Typography>
          </Box>

          {/* PDF Content Grid */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Homeowner Information Section */}
            <Box sx={{ border: "1px solid #ddd", p: 2, borderRadius: "4px" }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ borderBottom: "2px solid #000", pb: 1 }}
              >
                Homeowner Information
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: "none", py: 1 }}>
                      Block & Lot:
                    </TableCell>
                    <TableCell sx={{ border: "none", py: 1 }}>
                      Block {homeownerData?.blockNo || "N/A"}, Lot{" "}
                      {homeownerData?.lotNo || "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: "none", py: 1 }}>Email:</TableCell>
                    <TableCell sx={{ border: "none", py: 1 }}>
                      {homeownerData?.email || "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: "none", py: 1 }}>
                      Status:
                    </TableCell>
                    <TableCell sx={{ border: "none", py: 1 }}>
                      {homeownerData?.status || "Active"}
                    </TableCell>
                  </TableRow>
                  {(homeownerData?.penaltyLevel > 0 ||
                    homeownerData?.penaltyStatus === "Pending") && (
                    <>
                      <TableRow>
                        <TableCell sx={{ border: "none", py: 1 }}>
                          Penalty Status:
                        </TableCell>
                        <TableCell sx={{ border: "none", py: 1, color: "red" }}>
                          {getPenaltyDescription(
                            homeownerData.penaltyLevel ||
                              homeownerData.pendingPenaltyLevel,
                            homeownerData.penaltyStatus
                          )}
                        </TableCell>
                      </TableRow>
                      {homeownerData.penaltyStartTime && (
                        <TableRow>
                          <TableCell sx={{ border: "none", py: 1 }}>
                            Started On:
                          </TableCell>
                          <TableCell sx={{ border: "none", py: 1 }}>
                            {new Date(
                              homeownerData.penaltyStartTime
                            ).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </Box>

            {/* Billing Information Section */}
            <Box sx={{ border: "1px solid #ddd", p: 2, borderRadius: "4px" }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ borderBottom: "2px solid #000", pb: 1 }}
              >
                Billing Information
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ width: "40%", border: "none", py: 1 }}>
                      Due Amount:
                    </TableCell>
                    <TableCell sx={{ border: "none", py: 1 }}>
                      {formatCurrency(billingData?.dueAmount)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: "none", py: 1 }}>
                      Tax ({(TAX_RATE * 100).toFixed(0)}%):
                    </TableCell>
                    <TableCell sx={{ border: "none", py: 1 }}>
                      {formatCurrency(billingData?.dueAmount * TAX_RATE)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      sx={{ border: "none", py: 1, fontWeight: "bold" }}
                    >
                      Total Amount Due:
                    </TableCell>
                    <TableCell
                      sx={{ border: "none", py: 1, fontWeight: "bold" }}
                    >
                      {formatCurrency(
                        (billingData?.dueAmount || 0) * (1 + TAX_RATE)
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: "none", py: 1 }}>
                      Payment Status:
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "none",
                        py: 1,
                        color: billingData?.isPaid ? "green" : "red",
                      }}
                    >
                      {billingData?.isPaid ? "PAID" : "UNPAID"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* Payment History Section */}
            {billingData?.lastPaymentDate && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Last Payment: {formatCurrency(billingData.lastPaymentAmount)}{" "}
                  on{" "}
                  {new Date(billingData.lastPaymentDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            {/* Footer */}
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                This is an official receipt from Centro de San Lorenzo. Please
                keep this for your records.
              </Typography>
            </Box>

            {/* Signature Line */}
            <Box
              sx={{
                mt: 6,
                pt: 4,
                borderTop: "1px solid #000",
                width: "200px",
                mx: "auto",
                textAlign: "center",
              }}
            >
              <Typography variant="body2">Authorized Signature</Typography>
            </Box>
          </Box>
        </Box>

        {/* Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2" gutterBottom>
              Receipt sent successfully!
            </Typography>
            <Typography>
              The receipt has been sent to your email address.
            </Typography>
            <Button
              sx={{ mt: 2 }}
              variant="contained"
              onClick={() => setModalOpen(false)}
            >
              Close
            </Button>
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}
