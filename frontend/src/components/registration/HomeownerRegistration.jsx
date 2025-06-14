import {
  Box,
  Button,
  Card,
  CardContent,
  createTheme,
  Snackbar,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

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

export default function HomeownerRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing || false;
  const editingHomeowner = location.state?.homeowner;

  const [formData, setFormData] = useState({
    blockNo: "",
    lotNo: "",
    phoneNo: "",
    email: "",
    password: "",
    name: "",
    registrationDate: null,
    houseModel: "",
    propertyTitleSerialNo: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const API_URL = API_BASE_URL;

  useEffect(() => {
    if (isEditing && editingHomeowner) {
      console.log("Editing homeowner data:", editingHomeowner);
      setFormData({
        blockNo: editingHomeowner.blockNo,
        lotNo: editingHomeowner.lotNo,
        phoneNo: editingHomeowner.phoneNo,
        email: editingHomeowner.email,
        name: editingHomeowner.name || "",
        password: "", // Password field is empty when editing
        registrationDate: editingHomeowner.registrationDate ? dayjs(editingHomeowner.registrationDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        houseModel: editingHomeowner.houseModel || "",
        propertyTitleSerialNo: editingHomeowner.propertyTitleSerialNo || "",
      });
    }
  }, [isEditing, editingHomeowner]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      registrationDate: date ? date.format('YYYY-MM-DD') : null,
    });
  };

  // Validate inputs
  const validateInputs = (data) => {
    const { blockNo, lotNo, phoneNo, email, password, name, registrationDate, houseModel, propertyTitleSerialNo } = data;
    if (!blockNo || !lotNo || !phoneNo || !email || !name || !registrationDate || !houseModel || !propertyTitleSerialNo || (!isEditing && !password)) {
      setSnackbarMessage("All fields are required");
      setSnackbarOpen(true);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setSnackbarMessage("Please enter a valid email address");
      setSnackbarOpen(true);
      return false;
    }
    if (!isEditing && password.length < 6) {
      setSnackbarMessage("Password must be at least 6 characters long");
      setSnackbarOpen(true);
      return false;
    }
    return true;
  };

  // Create or Update homeowner
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs(formData)) return;

    try {
      if (isEditing) {
        // Update existing homeowner
        const response = await fetch(
          `${API_URL}/homeowners/${editingHomeowner.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              blockNo: formData.blockNo,
              lotNo: formData.lotNo,
              phoneNo: formData.phoneNo,
              email: formData.email,
              registrationDate: formData.registrationDate,
              houseModel: formData.houseModel,
              propertyTitleSerialNo: formData.propertyTitleSerialNo,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update homeowner");
        }

        setSnackbarMessage("Homeowner updated successfully");
        setSnackbarOpen(true);

        // Navigate back to homeowners page after successful update
        setTimeout(() => {
          navigate("/app/homeowners");
        }, 2000);
      } else {
        // First create the homeowner
        const homeownerResponse = await fetch(
          `${API_URL}/homeowners`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              blockNo: formData.blockNo,
              lotNo: formData.lotNo,
              phoneNo: formData.phoneNo,
              email: formData.email,
              name: formData.name,
              registrationDate: formData.registrationDate,
              houseModel: formData.houseModel,
              propertyTitleSerialNo: formData.propertyTitleSerialNo,
            }),
          }
        );

        const homeownerResult = await homeownerResponse.json();

        if (!homeownerResponse.ok) {
          throw new Error(
            homeownerResult.message || "Failed to create homeowner"
          );
        }

        // Then create the user account
        const registerResponse = await fetch(
          `${API_URL}/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              role: "Home Owner",
            }),
          }
        );

        const registerResult = await registerResponse.json();

        if (!registerResponse.ok) {
          // If user creation fails, we should clean up the homeowner record
          await fetch(
            `${API_URL}/homeowners/${homeownerResult.data._id}`,
            {
              method: "DELETE",
            }
          );
          throw new Error(
            registerResult.message || "Failed to create user account"
          );
        }

        setSnackbarMessage("Homeowner registered successfully");
        setSnackbarOpen(true);

        // Clear form
        setFormData({
          blockNo: "",
          lotNo: "",
          phoneNo: "",
          email: "",
          password: "",
          name: "",
          registrationDate: null,
          houseModel: "",
          propertyTitleSerialNo: "",
        });

        // Navigate to homeowners page after successful registration
        setTimeout(() => {
          navigate("/app/homeowners");
        }, 2000);
      }
    } catch (error) {
      console.error("Operation error details:", error);
      setSnackbarMessage(error.message || "Operation failed");
      setSnackbarOpen(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginLeft: { xs: 0, md: 35 },
          backgroundColor: "#ffffff",
          padding: 4,
          maxWidth: "1200px",
          width: "100%",
          ml: { xs: 0, md: "280px" },
          mr: { xs: 2, md: 4 },
          mt: { xs: 8, md: 2 }
        }}
      >
        {/* Form Card */}
        <Card
          sx={{
            width: "100%",
            maxWidth: "800px",
            mx: "auto",
            borderRadius: 4,
            boxShadow: "0px 8px 40px hsla(220, 60%, 2%, 0.12)",
            mt: 2
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
              {isEditing ? "Edit Homeowner" : "Register New Homeowner"}
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                required
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
              <TextField
                required
                name="houseModel"
                label="House Model"
                value={formData.houseModel}
                onChange={handleChange}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
              <TextField
                required
                name="propertyTitleSerialNo"
                label="Property Title Serial Number"
                value={formData.propertyTitleSerialNo}
                onChange={handleChange}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
              <TextField
                required
                name="blockNo"
                label="Block No."
                value={formData.blockNo}
                onChange={handleChange}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
              <TextField
                required
                name="lotNo"
                label="Lot No."
                value={formData.lotNo}
                onChange={handleChange}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
              <TextField
                required
                name="phoneNo"
                label="Phone No."
                value={formData.phoneNo}
                onChange={handleChange}
                type="tel"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
              <TextField
                required
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Registration Date"
                  value={formData.registrationDate ? dayjs(formData.registrationDate) : null}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                      sx: { "& .MuiOutlinedInput-root": { borderRadius: "10px" } }
                    }
                  }}
                />
              </LocalizationProvider>
              {!isEditing && (
                <TextField
                  required
                  name="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
              )}
              <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  type="submit"
                  size="large"
                  sx={{ borderRadius: "15px", flex: 1, py: 1.5, backgroundColor: "#09036e", "&:hover": { backgroundColor: "#000000" }, fontSize: "20px" }}
                >
                  {isEditing ? "Update" : "Register"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/app/homeowners")}
                  sx={{ borderRadius: "15px", flex: 1, py: 1.5, fontSize: "20px", borderColor: "#09036e", }}
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </ThemeProvider>
  );
}
