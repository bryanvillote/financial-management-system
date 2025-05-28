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
  TableHead,
  TableRow,
  ThemeProvider,
  Typography,
  createTheme,
  styled,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { jwtDecode } from "jwt-decode";
import { toast } from "mui-sonner";
import React, { useEffect, useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../utils/context/useAuth';

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
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  background: "#fff",
  "& .MuiTableCell-root": {
    padding: theme.spacing(2),
    border: "1px solid #e0e0e0",
  },
  "& .MuiTableHead-root .MuiTableCell-root": {
    backgroundColor: "#3B1E54",
    color: "white",
    fontWeight: "bold",
    fontSize: "0.95rem",
  },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "rgba(59, 30, 84, 0.04)",
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

// Add this after the modalStyle constant
const qrDialogStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  textAlign: 'center',
};

export default function ReceiptUI() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const receiptRef = React.useRef(null);
  const pdfRef = React.useRef(null);
  const [homeownerData, setHomeownerData] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const fileInputRef = React.useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { logout } = useAuth();

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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setReceiptImage(file);
      toast.success("Receipt screenshot uploaded successfully");
    }
  };

  const handleSendEmail = async () => {
    if (!receiptRef.current || !homeownerData) return;

    // Create a unique ID for the loading toast so we can dismiss it later
    const loadingToastId = toast.loading("Sending receipt to your email...");

    try {
      // Use a simple message for the email body
      const simpleMessage = `<p>Attached is my proof of payment for Block ${homeownerData.blockNo}, Lot ${homeownerData.lotNo}.</p><p>Thank you,</p><p>Homeowner</p>`;

      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('html', simpleMessage);
      formData.append('email', homeownerData.email);
      formData.append('blockNo', homeownerData.blockNo);
      formData.append('lotNo', homeownerData.lotNo);
      
      if (receiptImage) {
        formData.append('receiptImage', receiptImage);
      }

      // Send to backend
      const response = await fetch("http://localhost:8000/email/send-receipt", {
        method: "POST",
        body: formData,
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

  const handleOpenQrDialog = () => {
    setQrDialogOpen(true);
  };

  const handleCloseQrDialog = () => {
    setQrDialogOpen(false);
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: isMobile ? "60vh" : "100vh",
          px: isMobile ? 2 : 0,
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
          height: isMobile ? "60vh" : "100vh",
          px: isMobile ? 2 : 0,
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );

  const { subtotal, taxes, total } = calculateTotals(billingData?.dueAmount);
  const totalAmount = (billingData?.dueAmount || 0) * (1 + TAX_RATE);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: isMobile ? 1 : 3 }}>
        {/* Mobile Logout Button */}
        {isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={logout}
              startIcon={<LogoutIcon />}
              sx={{
                borderRadius: 3,
                boxShadow: 2,
                fontWeight: 600,
                px: 3,
                py: 1.2,
                letterSpacing: 1,
                textTransform: 'none',
              }}
            >
              Logout
            </Button>
          </Box>
        )}
        {/* Receipt Content */}
        <Box ref={receiptRef} sx={{ p: isMobile ? 1 : 4, maxWidth: isMobile ? '100%' : 1200, marginLeft: isMobile ? 0 : 50 }}>
          {/* Header */}
          <Typography variant={isMobile ? "h6" : "h4"} align="center" gutterBottom sx={{ mb: isMobile ? 2 : 4 }}>
            Centro de San Lorenzo
          </Typography>

          {/* Main Content Grid */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: isMobile ? 1 : 3, mb: isMobile ? 1 : 3 }}>
            {/* Combined Information Table */}
            <CustomCard sx={{ p: isMobile ? 1 : 3 }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom sx={{ color: "#3B1E54", mb: isMobile ? 1 : 2 }}>
                Receipt Information
              </Typography>
              <TableContainer sx={{ maxHeight: isMobile ? 300 : 600, overflowX: 'auto' }}>
                <Table stickyHeader size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Field</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Homeowner Information Section */}
                    <TableRow>
                      <TableCell colSpan={2} sx={{ 
                        backgroundColor: 'rgba(59, 30, 84, 0.08)',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}>
                        Homeowner Information
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", width: "40%" }}>Name</TableCell>
                      <TableCell>{homeownerData?.name || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Block & Lot</TableCell>
                      <TableCell>
                        Block {homeownerData?.blockNo || "N/A"}, Lot{" "}
                        {homeownerData?.lotNo || "N/A"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                      <TableCell>{homeownerData?.email || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                      <TableCell>
                        <Chip
                          label={homeownerData?.status || "Active"}
                          color={homeownerData?.status === "Active" ? "success" : "error"}
                          size="small"
                          sx={{ fontWeight: "medium" }}
                        />
                      </TableCell>
                    </TableRow>
                    {(homeownerData?.penaltyLevel > 0 || homeownerData?.penaltyStatus === "Pending") && (
                      <>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>Penalty Level</TableCell>
                          <TableCell>
                            <Chip
                              label={getPenaltyDescription(
                                homeownerData.penaltyLevel || homeownerData.pendingPenaltyLevel,
                              homeownerData.penaltyStatus
                            )}
                              color="error"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        {homeownerData.penaltyStartTime && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Penalty Started</TableCell>
                            <TableCell>
                              {new Date(homeownerData.penaltyStartTime).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )}

                    {/* Billing Information Section */}
                    <TableRow>
                      <TableCell colSpan={2} sx={{ 
                        backgroundColor: 'rgba(59, 30, 84, 0.08)',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}>
                        Billing Information
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Due Amount</TableCell>
                      <TableCell>{formatCurrency(billingData?.dueAmount)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Tax ({(TAX_RATE * 100).toFixed(0)}%)</TableCell>
                      <TableCell>{formatCurrency(billingData?.dueAmount * TAX_RATE)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Total Amount Due</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "primary.main" }}>
                        {formatCurrency((billingData?.dueAmount || 0) * (1 + TAX_RATE))}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Payment Status</TableCell>
                      <TableCell>
                        <Chip
                          label={billingData?.isPaid ? "PAID" : "UNPAID"}
                          color={billingData?.isPaid ? "success" : "error"}
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>
                    </TableRow>
                    {billingData?.lastPaymentDate && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Last Payment</TableCell>
                        <TableCell>
                          {formatCurrency(billingData.lastPaymentAmount)} on{" "}
                          {new Date(billingData.lastPaymentDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Payment History Section */}
                    <TableRow>
                      <TableCell colSpan={2} sx={{ 
                        backgroundColor: 'rgba(59, 30, 84, 0.08)',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}>
                        Payment History (Last 12 Months)
                      </TableCell>
                    </TableRow>
                    {billingData?.paymentHistory?.length > 0 ? (
                      billingData.paymentHistory
                        .filter(payment => {
                          const paymentDate = new Date(payment.date);
                          const oneYearAgo = new Date();
                          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                          return paymentDate >= oneYearAgo;
                        })
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((payment, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              {new Date(payment.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>{formatCurrency(payment.amount)}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Chip
                                    label={payment.status}
                          color={
                                      payment.status === "Completed" 
                                        ? "success" 
                                        : payment.status === "Pending" 
                                        ? "warning" 
                                        : "error"
                          }
                                    size="small"
                                    sx={{ fontWeight: "medium" }}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    Ref: {payment.referenceNo || "N/A"}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">
                            No payment history available
                        </Typography>
                      </TableCell>
                    </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CustomCard>

            {/* Payment Button */}
            {!billingData?.isPaid && (
              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', mt: isMobile ? 1 : 2, gap: isMobile ? 1 : 0 }}>
                <Button
                  variant="contained"
                  size={isMobile ? "medium" : "large"}
                  startIcon={<QrCode2Icon />}
                  onClick={handleOpenQrDialog}
                  sx={{
                    backgroundColor: '#3B1E54',
                    '&:hover': { backgroundColor: '#2a1640' },
                    px: isMobile ? 2 : 4,
                    py: isMobile ? 1 : 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                  }}
                >
                  Pay Due Amount ({formatCurrency(totalAmount)})
                </Button>
              </Box>
            )}

            {/* QR Code Dialog */}
            <Dialog
              open={qrDialogOpen}
              onClose={handleCloseQrDialog}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                Scan QR Code to Pay
              </DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Due Amount: {formatCurrency(totalAmount)}
                  </Typography>
                  <Box
                    component="img"
                    src="/QRCode.jpg"
                    alt="Payment QR Code"
                    sx={{
                      width: 250,
                      height: 250,
                      objectFit: 'contain',
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      p: 1,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" align="center">
                    Scan this QR code using your mobile payment app to pay your due amount
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 0.5,
                    mt: 1,
                    p: 2,
                    bgcolor: 'rgba(59, 30, 84, 0.04)',
                    borderRadius: 1,
                    width: '100%'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#3B1E54' }}>
                      HOA
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#3B1E54' }}>
                      JO**L BR**N V.
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#3B1E54' }}>
                      Mobile Number: 099........388
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#3B1E54' }}>
                      User ID: ........70DM95
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" align="center">
                    Block {homeownerData?.blockNo}, Lot {homeownerData?.lotNo}
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  onClick={handleCloseQrDialog}
                  variant="outlined"
                  sx={{ minWidth: 120 }}
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </Box>

          {/* Center Card - Add Penalty Warning if applicable */}
          <CustomCard sx={{ mb: isMobile ? 1 : 3, p: isMobile ? 1 : 3 }}>
            <Stack spacing={isMobile ? 1 : 2}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} align="center" gutterBottom>
                Payment Reminder
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} align="center" color="text.secondary">
                Please ensure timely payment of your dues to avoid penalties.
                {billingData?.lastPaymentDate && (
                  <>
                    <br />
                    Last Payment: {formatCurrency(billingData.lastPaymentAmount)} on {new Date(billingData.lastPaymentDate).toLocaleDateString()}
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
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "center",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleSaveAsPDF}
                  disabled={loading}
                  sx={{ minWidth: isMobile ? 100 : 150, mb: isMobile ? 1 : 0 }}
                >
                  Save as PDF
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                />
                <Button
                  variant="contained"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  startIcon={<AttachFileIcon />}
                  sx={{ minWidth: isMobile ? 100 : 150, mb: isMobile ? 1 : 0 }}
                >
                  Upload Screenshot
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSendEmail}
                  disabled={loading}
                  sx={{ minWidth: isMobile ? 100 : 150 }}
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
