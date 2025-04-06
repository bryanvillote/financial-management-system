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
      const response = await fetch(`${API_URL}/homeowners`);
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
    const { blockNo, lotNo, phoneNo, email } = data;
    if (!blockNo || !lotNo || !phoneNo || !email) {
      setSnackbarMessage("All fields are required");
      setSnackbarOpen(true);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setSnackbarMessage("Please enter a valid email address");
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
      const url = editingId
        ? `${API_URL}/homeowners/${editingId}`
        : `${API_URL}/homeowners/register`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSnackbarMessage(
          editingId
            ? "Homeowner updated successfully"
            : "Homeowner registered successfully"
        );
        setSnackbarOpen(true);
        setFormData({ blockNo: "", lotNo: "", phoneNo: "", email: "" });
        setEditingId(null);
        fetchHomeowners();
      } else {
        setSnackbarMessage(result.message || "Operation failed");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Operation error:", error);
      setSnackbarMessage("Network error occurred");
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
    if (!window.confirm("Are you sure you want to delete this homeowner?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/homeowners/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSnackbarMessage("Homeowner deleted successfully");
        setSnackbarOpen(true);
        fetchHomeowners();
      } else {
        setSnackbarMessage("Failed to delete homeowner");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbarMessage("Network error occurred");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  type="submit"
                  size="large"
                  sx={{ borderRadius: "10px", flex: 1 }}
                >
                  {editingId ? "Update" : "Save"}
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
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
        />
      </Box>
    </ThemeProvider>
  );
}
