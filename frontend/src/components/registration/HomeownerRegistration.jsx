import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardContent,
  createTheme,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

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
  const [formData, setFormData] = useState({
    blockNo: "",
    lotNo: "",
    phoneNo: "",
    email: "",
    password: "",
  });
  const [homeowners, setHomeowners] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Update the base URL to match your admin registration
  const API_URL = "http://localhost:8000";

  // Fetch all homeowners
  const fetchHomeowners = async () => {
    try {
      const response = await fetch("http://localhost:8000/homeowners");
      if (!response.ok) {
        throw new Error("Failed to fetch homeowners");
      }
      const data = await response.json();
      setHomeowners(data);
    } catch (error) {
      console.error("Error fetching homeowners:", error);
      setSnackbarMessage("Failed to fetch homeowners");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    fetchHomeowners();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate inputs
  const validateInputs = (data) => {
    const { blockNo, lotNo, phoneNo, email, password } = data;
    if (!blockNo || !lotNo || !phoneNo || !email || !password) {
      setSnackbarMessage("All fields are required");
      setSnackbarOpen(true);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setSnackbarMessage("Please enter a valid email address");
      setSnackbarOpen(true);
      return false;
    }
    if (password.length < 6) {
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
      // First try to create the homeowner record
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
            name: `${formData.blockNo}-${formData.lotNo} Resident`, // Add a default name
            status: "Active",
          }),
        }
      );

      const homeownerData = await homeownerResponse.json();

      if (!homeownerResponse.ok) {
        throw new Error(
          homeownerData.message || "Failed to create homeowner record"
        );
      }

      // If homeowner creation was successful, create the user account
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

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        // If user creation fails, delete the homeowner record
        await fetch(
          `http://localhost:8000/homeowners/${homeownerData.data._id}`,
          {
            method: "DELETE",
          }
        );
        throw new Error(
          registerData.message || "Failed to create user account"
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
      });

      // Refresh homeowners list
      fetchHomeowners();
    } catch (error) {
      console.error("Operation error:", error);
      setSnackbarMessage(error.message || "Registration failed");
      setSnackbarOpen(true);
    }
  };

  // Edit homeowner
  const handleEdit = (homeowner) => {
    setFormData({
      blockNo: homeowner.blockNo,
      lotNo: homeowner.lotNo,
      phoneNo: homeowner.phoneNo,
      email: homeowner.email,
    });
    setEditingId(homeowner._id);
  };

  // Delete homeowner
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this homeowner? This will also delete their login account."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/homeowners/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        setSnackbarMessage("Homeowner deleted successfully");
        setSnackbarOpen(true);
        fetchHomeowners(); // Refresh the list
      } else {
        throw new Error(result.message || "Failed to delete homeowner");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbarMessage(error.message || "Failed to delete homeowner");
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
              {editingId ? "Edit Homeowner" : "Register New Homeowner"}
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
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
              <TextField
                required
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  type="submit"
                  size="large"
                  sx={{ borderRadius: "10px", flex: 1 }}
                >
                  {editingId ? "Update" : "Register"}
                </Button>
                {editingId && (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        blockNo: "",
                        lotNo: "",
                        phoneNo: "",
                        email: "",
                        password: "",
                      });
                    }}
                    sx={{ borderRadius: "10px" }}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Homeowners Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Block No.</TableCell>
                <TableCell>Lot No.</TableCell>
                <TableCell>Phone No.</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {homeowners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No homeowners found
                  </TableCell>
                </TableRow>
              ) : (
                homeowners.map((homeowner) => (
                  <TableRow key={homeowner._id}>
                    <TableCell>{homeowner.blockNo}</TableCell>
                    <TableCell>{homeowner.lotNo}</TableCell>
                    <TableCell>{homeowner.phoneNo}</TableCell>
                    <TableCell>{homeowner.email}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => handleEdit(homeowner)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(homeowner._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Snackbar for notifications */}
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
