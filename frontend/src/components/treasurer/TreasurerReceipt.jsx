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
import { toast } from "mui-sonner";
import React, { useState } from "react";
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

const TAX_RATE = 0.07;

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

export default function TreasurerReceipt({ homeowner, billingData }) {
  const [modalOpen, setModalOpen] = useState(false);
  const receiptRef = React.useRef(null);
  const pdfRef = React.useRef(null);

  const calculateTotals = (dueAmount) => {
    const subtotal = dueAmount || 0;
    const taxes = subtotal * TAX_RATE;
    const total = subtotal + taxes;
    return { subtotal, taxes, total };
  };

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
      pdf.save(`Receipt_Block${homeowner.blockNo}_Lot${homeowner.lotNo}.pdf`);

      toast.success("PDF saved successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleSendEmail = async () => {
    if (!receiptRef.current || !homeowner) return;

    const loadingToastId = toast.loading(
      "Sending receipt to homeowner's email..."
    );

    try {
      const receiptHtml = receiptRef.current.outerHTML;

      const response = await fetch("http://localhost:8000/email/send-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: receiptHtml,
          email: homeowner.email,
          blockNo: homeowner.blockNo,
          lotNo: homeowner.lotNo,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send email");
      }

      toast.dismiss(loadingToastId);
      toast.success("Receipt sent successfully!");
      setModalOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.dismiss(loadingToastId);
      toast.error("Failed to send email");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }}>
        <Stack spacing={2} direction="row" sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleSaveAsPDF}
            sx={{ borderRadius: "10px" }}
          >
            Save as PDF
          </Button>
          <Button
            variant="contained"
            onClick={() => setModalOpen(true)}
            sx={{ borderRadius: "10px" }}
          >
            Send via Email
          </Button>
        </Stack>

        {/* Receipt Content */}
        <CustomCard ref={pdfRef}>
          <Box ref={receiptRef} sx={{ p: 3 }}>
            <Typography variant="h4" align="center" gutterBottom>
              Centro de San Lorenzo
            </Typography>
            <Typography variant="h6" align="center" gutterBottom>
              Official Receipt
            </Typography>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th">Block Number:</TableCell>
                    <TableCell>{homeowner?.blockNo}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Lot Number:</TableCell>
                    <TableCell>{homeowner?.lotNo}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Email:</TableCell>
                    <TableCell>{homeowner?.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Payment Status:</TableCell>
                    <TableCell>
                      <Typography
                        color={
                          billingData?.isPaid ? "success.main" : "error.main"
                        }
                        fontWeight="medium"
                      >
                        {billingData?.isPaid ? "PAID" : "UNPAID"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {billingData?.lastPaymentDate && (
                    <TableRow>
                      <TableCell component="th">Last Payment Date:</TableCell>
                      <TableCell>
                        {new Date(
                          billingData.lastPaymentDate
                        ).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  )}
                  {billingData?.lastPaymentAmount && (
                    <TableRow>
                      <TableCell component="th">Last Payment Amount:</TableCell>
                      <TableCell>
                        {formatCurrency(billingData.lastPaymentAmount)}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell component="th">Due Amount:</TableCell>
                    <TableCell>
                      {formatCurrency(billingData?.dueAmount || 0)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Tax Rate:</TableCell>
                    <TableCell>{(TAX_RATE * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Tax Amount:</TableCell>
                    <TableCell>
                      {formatCurrency((billingData?.dueAmount || 0) * TAX_RATE)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Total Amount Due:</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">
                        {formatCurrency(
                          (billingData?.dueAmount || 0) * (1 + TAX_RATE)
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </CustomCard>

        {/* Email Confirmation Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2" gutterBottom>
              Send Receipt via Email
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Send the receipt to {homeowner?.email}?
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setModalOpen(false)}
                fullWidth
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSendEmail} fullWidth>
                Send
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}
