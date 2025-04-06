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
import React from "react";

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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ pl: 50 }}>
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
                    <TableCell>Due Period:</TableCell>
                    <TableCell align="right">January 2024</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Due Amount:</TableCell>
                    <TableCell align="right">₱5,000.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      ₱{total.toFixed(2)}
                    </TableCell>
                  </TableRow>
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
              <Button variant="contained" size="large">
                Send in Email
              </Button>
              <Button variant="text" onClick={() => setModalOpen(true)}>
                Exit
              </Button>
            </Stack>
          </CustomCard>
        </Stack>

        {/* Exit Confirmation Modal */}
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
