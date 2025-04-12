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
import html2pdf from "html2pdf.js";
import { jwtDecode } from "jwt-decode";
import { toast } from "mui-sonner";
import React, { useEffect, useState } from "react";

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
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow:
    "hsla(220, 60%, 2%, 0.12) 0px 8px 30px, hsla(222, 25.5%, 10%, 0.06) 0px 10px 25px -5px",
}));

// Data logic
const TAX_RATE = 0.07;

// Use direct values instead of calculated ones
const subtotal = 5000.0; // Based on the Payment Amount
const taxes = subtotal * TAX_RATE;
const total = subtotal + taxes;

// Modal styles
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 3,
  width: 400,
};

export default function ReceiptUI() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const receiptRef = React.useRef(null);
  const [homeownerData, setHomeownerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHomeownerData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No auth token found");
        return;
      }

      const decodedToken = jwtDecode(token);
      const userEmail = decodedToken.email;

      const response = await fetch(
        `http://localhost:8000/homeowners/email/${userEmail}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch homeowner data");
      }

      if (!result.data) {
        throw new Error("No homeowner data found");
      }

      setHomeownerData(result.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching homeowner data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeownerData();
  }, []);

  const handleSaveAsPDF = () => {
    if (!receiptRef.current) return;
    const opt = {
      margin: 1,
      filename: "receipt.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(receiptRef.current).save();
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

  if (loading) {
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
  }

  if (error) {
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
  }

  if (!homeownerData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>No homeowner data found for your account.</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", marginLeft: 35 }}>
        <Stack direction="row" spacing={4} alignItems="flex-start">
          {/* Receipt Card */}
          <CustomCard ref={receiptRef} sx={{ flex: 2 }}>
            <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3 }}>
              Centro de San Lorenzo <br />
              Sta. Rosa, Laguna
            </Typography>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Block No:</TableCell>
                    <TableCell align="right">{homeownerData.blockNo}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Lot No:</TableCell>
                    <TableCell align="right">{homeownerData.lotNo}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Email:</TableCell>
                    <TableCell align="right">{homeownerData.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Phone Number:</TableCell>
                    <TableCell align="right">{homeownerData.phoneNo}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Status:</TableCell>
                    <TableCell align="right">
                      {homeownerData.status || "Active"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Penalty:</TableCell>
                    <TableCell align="right">
                      {homeownerData.penalty || "None"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Registration Date:</TableCell>
                    <TableCell align="right">
                      {new Date(homeownerData.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  {/* Add Penalty Records Section */}
                  {homeownerData.penaltyRecords &&
                    homeownerData.penaltyRecords.length > 0 && (
                      <>
                        <TableRow>
                          <TableCell colSpan={2}>
                            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                              Penalty Records
                            </Typography>
                          </TableCell>
                        </TableRow>
                        {homeownerData.penaltyRecords.map((record, index) => (
                          <React.Fragment key={index}>
                            <TableRow>
                              <TableCell>Penalty Type:</TableCell>
                              <TableCell align="right">
                                {record.description}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Applied On:</TableCell>
                              <TableCell align="right">
                                {new Date(
                                  record.appliedAt
                                ).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Duration:</TableCell>
                              <TableCell align="right">
                                {record.duration} minutes
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        ))}
                      </>
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          </CustomCard>

          {/* Action Buttons */}
          <CustomCard
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              justifyContent: "space-between",
              minHeight: "280px",
            }}
          >
            <Typography variant="h6">Receipt Options</Typography>
            <Stack spacing={2} mt={2}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSaveAsPDF}
              >
                Save as PDF
              </Button>
              <Button
                variant="contained"
                onClick={handleSendEmail}
                sx={{ textTransform: "none" }}
              >
                Send to Email
              </Button>
              <Button variant="text" onClick={() => setModalOpen(true)}>
                Exit
              </Button>
            </Stack>
          </CustomCard>
        </Stack>

        {/* Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom>
              Do you really want to exit the receipt?
            </Typography>
            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
              <Button
                variant="contained"
                color="error"
                onClick={() => setModalOpen(false)}
              >
                Yes
              </Button>
              <Button variant="text" onClick={() => setModalOpen(false)}>
                No
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}
