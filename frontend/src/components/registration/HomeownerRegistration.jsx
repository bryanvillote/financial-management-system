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
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Update the base URL to match your admin registration
  const API_URL = "http://localhost:8000";

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

  // Validate inputs
  const validateInputs = (data) => {
    const { blockNo, lotNo, phoneNo, email, password, name } = data;
    if (!blockNo || !lotNo || !phoneNo || !email || !name || (!isEditing && !password)) {
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
          `http://localhost:8000/homeowners/${editingHomeowner.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              blockNo: formData.blockNo,
              lotNo: formData.lotNo,
              phoneNo: formData.phoneNo,
              email: formData.email,
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
          "http://localhost:8000/homeowners/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              blockNo: formData.blockNo,
              lotNo: formData.lotNo,
              phoneNo: formData.phoneNo,
              email: formData.email,
              name: formData.name,
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
          "http://localhost:8000/auth/register",
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
            `http://localhost:8000/homeowners/${homeownerResult.data._id}`,
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
          marginLeft: 80,
          backgroundColor: "#ffffff",
          padding: 3,
        }}
      >
        {/* Form Card */}
        <Card
          sx={{
            width: "100%",
            borderRadius: 4,
            boxShadow: "0px 8px 40px hsla(220, 60%, 2%, 0.12)",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isEditing ? "Edit Homeowner" : "Register New Homeowner"}
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
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
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  type="submit"
                  size="large"
                  sx={{ borderRadius: "10px", flex: 1 }}
                >
                  {isEditing ? "Update" : "Register"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/app/homeowners")}
                  sx={{ borderRadius: "10px", flex: 1 }}
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
