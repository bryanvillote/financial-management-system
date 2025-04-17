import { useTheme } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Header from "../dashboard/components/Header";

import EmailIcon from "@mui/icons-material/Email";
import { CssBaseline } from "@mui/material";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
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

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      renderCell: (params) => params.row.name || "N/A",
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
      renderCell: (params) => params.row.email || "N/A",
    },
    {
      field: "blockNo",
      headerName: "Block",
      width: 100,
      renderCell: (params) => params.row.blockNo || "N/A",
    },
    {
      field: "lotNo",
      headerName: "Lot",
      width: 100,
      renderCell: (params) => params.row.lotNo || "N/A",
    },
    {
      field: "dueAmount",
      headerName: "Due Amount",
      width: 150,
      renderCell: (params) => {
        const amount = params.row.dueAmount ?? 0;
        return `₱${Number(amount).toFixed(2)}`;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleSelectHomeowner(params.row)}
        >
          Select
        </Button>
      ),
    },
  ];

  const fetchHomeowners = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch homeowners first
      const homeownersResponse = await fetch(
        "http://localhost:8000/homeowners"
      );
      if (!homeownersResponse.ok) {
        throw new Error("Failed to fetch homeowners");
      }
      const homeownersData = await homeownersResponse.json();

      // Initialize with 0 due amounts
      const initialHomeowners = homeownersData.map((homeowner) => ({
        ...homeowner,
        dueAmount: 0,
      }));

      // Then fetch billing data
      const billingResponse = await fetch("http://localhost:8000/billing");
      if (billingResponse.ok) {
        const billingData = await billingResponse.json();

        // Update homeowners with billing data only if it exists
        initialHomeowners.forEach((homeowner) => {
          const billing = billingData.find(
            (b) => b.homeownerId === homeowner._id
          );
          if (billing && billing.dueAmount !== undefined) {
            homeowner.dueAmount = billing.dueAmount;
          }
        });
      }

      setHomeowners(initialHomeowners);
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

  const handleDueAmountChange = async (newAmount) => {
    if (!selectedHomeowner) return;

    try {
      const response = await fetch(
        `http://localhost:8000/billing/${selectedHomeowner._id}/update-due`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dueAmount: parseFloat(newAmount),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update due amount");
      }

      // Update the local state and refresh the data
      await fetchHomeowners();
    } catch (error) {
      console.error("Error updating due amount:", error);
      setError(error.message);
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

  useEffect(() => {
    fetchHomeowners();
  }, []);

  // Add this useEffect to monitor the homeowners state
  useEffect(() => {
    console.log("Current homeowners state:", homeowners);
  }, [homeowners]);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: "flex" }}>
          <SideMenu />
          <Box
            component="main"
            sx={{ flexGrow: 1, p: 3, mt: { xs: 8, md: 0 } }}
          >
            <Header />
            <Collapse in={notificationStatus.show}>
              <Alert
                severity={notificationStatus.severity}
                sx={{ mb: 2 }}
                onClose={() =>
                  setNotificationStatus((prev) => ({ ...prev, show: false }))
                }
              >
                {notificationStatus.message}
              </Alert>
            </Collapse>
            <Box sx={{ display: "flex", gap: 3, padding: 4 }}>
              {/* Left Card - Homeowners Grid */}
              <Card sx={{ flex: 2 }}>
                <DataGrid
                  rows={homeowners}
                  columns={columns}
                  getRowId={(row) => row._id}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 },
                    },
                  }}
                  pageSizeOptions={[10]}
                  loading={loading}
                  error={error}
                  onStateChange={(state) => {
                    console.log("DataGrid state:", state);
                  }}
                />
              </Card>

              {/* Right Card - Payment Form */}
              <Card sx={{ flex: 1 }}>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={3}>
                    <TextField
                      label="Selected Homeowner"
                      value={
                        selectedHomeowner
                          ? `${selectedHomeowner.name} (Block ${selectedHomeowner.blockNo} Lot ${selectedHomeowner.lotNo})`
                          : ""
                      }
                      disabled
                      fullWidth
                    />
                    <TextField
                      label="Due Amount"
                      type="number"
                      value={
                        editingDueAmount === ""
                          ? selectedHomeowner?.dueAmount || ""
                          : editingDueAmount
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditingDueAmount(value);
                      }}
                      onBlur={() => {
                        if (editingDueAmount !== "") {
                          handleDueAmountChange(editingDueAmount);
                        }
                      }}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <span style={{ marginRight: 8 }}>₱</span>
                        ),
                      }}
                      inputProps={{
                        min: 0,
                        step: "0.01",
                        placeholder: "0.00",
                      }}
                    />
                    <TextField
                      label="Payment Amount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      fullWidth
                      error={paymentAmount && !isPaymentValid()}
                      helperText={
                        paymentAmount && !isPaymentValid()
                          ? "Payment amount must match the due amount"
                          : ""
                      }
                      InputProps={{
                        startAdornment: (
                          <span style={{ marginRight: 8 }}>₱</span>
                        ),
                      }}
                      inputProps={{
                        min: 0,
                        step: "0.01",
                        placeholder: "0.00",
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handlePayment}
                      disabled={
                        !selectedHomeowner || loading || !isPaymentValid()
                      }
                      fullWidth
                    >
                      Process Payment
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleSendNotification()}
                      disabled={!selectedHomeowner}
                      startIcon={<EmailIcon />}
                      fullWidth
                    >
                      Notify Homeowner
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </AppTheme>
  );
}
