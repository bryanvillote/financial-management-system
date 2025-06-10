import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  Snackbar,
  TextField,
  Paper,
  Box,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import { useEffect, useState } from "react";
import SideMenu from "../components/dashboard/components/SideMenu";
import AppTheme from "../utils/share-theme/AppTheme";
import SearchIcon from "@mui/icons-material/Search";
import { API_BASE_URL } from "../config";

export default function AdminReg(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editData, setEditData] = useState({
    email: "",
    role: "",
    newPassword: "",
    currentPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setSnackbarMessage("Error fetching users");
      setSnackbarOpen(true);
    }
  };

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const validateInputs = (data) => {
    const { email, password, role } = data;
    let isValid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!role) {
      setSnackbarMessage("Please select a role");
      setSnackbarOpen(true);
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateInputs({ email, password, role })) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const result = await response.json();

      if (response.ok) {
        setSnackbarMessage("Admin registration successful!");
        setSnackbarOpen(true);
        fetchUsers();
        // Clear the input fields
        setEmail("");
        setPassword("");
        setRole("");
      } else {
        const errorMessage = result.errors
          ? result.errors[0].msg
          : result.message || "Registration failed. Please try again.";
        setSnackbarMessage(errorMessage);
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setSnackbarMessage("Network error occurred. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      if (userToDelete.role === "President") {
        setSnackbarMessage("President account cannot be deleted");
        setSnackbarOpen(true);
        handleDeleteDialogClose();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/auth/users/${userToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      setSnackbarMessage(data.message);
      setSnackbarOpen(true);

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbarMessage("Error deleting user");
      setSnackbarOpen(true);
    } finally {
      handleDeleteDialogClose();
    }
  };

  const handleEditClick = (user) => {
    setEditData({
      id: user._id,
      email: user.email,
      role: user.role,
      newPassword: "",
      currentPassword: "",
    });
    setEditDialogOpen(true);
    setEditError("");
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditData({
      id: "",
      email: "",
      role: "",
      newPassword: "",
      currentPassword: "",
    });
    setEditError("");
  };

  const handleEditSubmit = async () => {
    try {
      if (!editData.email || !/\S+@\S+\.\S+/.test(editData.email)) {
        setEditError("Please enter a valid email address");
        return;
      }

      if (!editData.role) {
        setEditError("Please select a role");
        return;
      }

      if (editData.newPassword && !editData.currentPassword) {
        setEditError("Current password is required to set a new password");
        return;
      }

      if (editData.newPassword && editData.newPassword.length < 6) {
        setEditError("New password must be at least 6 characters long");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/auth/users/${editData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: editData.email,
            role: editData.role,
            ...(editData.newPassword && {
              newPassword: editData.newPassword,
              currentPassword: editData.currentPassword,
            }),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      setSnackbarMessage("User updated successfully");
      setSnackbarOpen(true);
      handleEditClose();
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      setEditError(error.message || "Failed to update user");
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Update the role options to exclude Home Owner
  const roleOptions = [
    "President",
    "Vice President",
    "Treasurer",
    "Secretary",
    // Remove "Home Owner" from the list
  ];

  const handleDelete = async (userId) => {
    try {
      const userToDelete = users.find((user) => user._id === userId);
      if (userToDelete.role === "President") {
        setSnackbarMessage("Cannot delete President account");
        setSnackbarOpen(true);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/auth/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setSnackbarMessage("User deleted successfully");
        setSnackbarOpen(true);
        fetchUsers(); // Refresh the users list
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbarMessage(error.message || "Error deleting user");
      setSnackbarOpen(true);
    }
  };

  const handleUpdate = async () => {
    try {
      // Validate email
      if (!editData.email || !/\S+@\S+\.\S+/.test(editData.email)) {
        setEditError("Please enter a valid email address");
        return;
      }

      // Validate role
      if (!editData.role) {
        setEditError("Please select a role");
        return;
      }

      const updateData = {
        email: editData.email,
        role: editData.role,
      };

      // Only include password data if a new password is provided
      if (editData.newPassword) {
        if (!editData.currentPassword) {
          setEditError("Current password is required to change password");
          return;
        }
        if (editData.newPassword.length < 6) {
          setEditError("New password must be at least 6 characters long");
          return;
        }
        updateData.newPassword = editData.newPassword;
        updateData.currentPassword = editData.currentPassword;
      }

      const response = await fetch(
        `${API_BASE_URL}/auth/users/${editData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      setSnackbarMessage("User updated successfully");
      setSnackbarOpen(true);
      handleEditClose();
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error("Error updating user:", error);
      setEditError(error.message || "Failed to update user");
    }
  };

  // Add this new function for filtering users
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SideMenu />
      <Box sx={{ p: 3, pl: 80 }}>
        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontSize: "clamp(2rem, 5vw, 2.15rem)",
            textAlign: "center",
            mb: 4,
          }}
        >
          User Management
        </Typography>
        
        <Grid container spacing={3}>
          {/* Admin Registration Form */}
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: "15px",
                backgroundColor: "#ffffff",
                height: "100%"
              }}
            >
              <Typography variant="h5" sx={{ mb: 3, color: "#09036e" }}>
                Register New Admin
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <FormControl fullWidth>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Email
                  </Typography>
                  <TextField
                    id="email"
                    name="email"
                    type="email"
                    fullWidth
                    variant="outlined"
                    error={!!emailError}
                    helperText={emailError}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        height: '56px',
                        borderRadius: "15px",
                        fontSize: '1.1rem'
                      }
                    }}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Password
                  </Typography>
                  <TextField
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    variant="outlined"
                    error={!!passwordError}
                    helperText={passwordError}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        height: '56px',
                        borderRadius: "15px",
                        fontSize: '1.1rem'
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
                <FormControl required fullWidth>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Role
                  </Typography>
                  <Select 
                    value={role} 
                    onChange={handleRoleChange} 
                    displayEmpty
                    sx={{ 
                      height: '56px',
                      borderRadius: "15px",
                      fontSize: '1.1rem'
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select Role
                    </MenuItem>
                    {roleOptions.map((roleOption) => (
                      <MenuItem key={roleOption} value={roleOption}>
                        {roleOption}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  color="secondary"
                  sx={{ 
                    borderRadius: "15px", 
                    py: 2.5, 
                    fontSize: "1.3rem", 
                    backgroundColor: "#09036e", 
                    "&:hover": { backgroundColor: "#000000" } 
                  }}
                >
                  Register Admin
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Registered Users List */}
          <Grid item xs={12} md={7}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: "15px",
                backgroundColor: "#ffffff",
                height: "100%"
              }}
            >
              <Typography variant="h5" sx={{ mb: 3, color: "#09036e" }}>
                Registered Users
              </Typography>
              
              {/* Search Bar */}
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search users by email or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    height: '56px',
                    fontSize: '1.1rem'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <List
                sx={{
                  maxHeight: "60vh",
                  overflow: "auto",
                  borderRadius: "15px",
                }}
              >
                {filteredUsers.map((user) => (
                  <ListItem
                    key={user._id}
                    sx={{ 
                      mb: 1, 
                      border: "1px solid #ccc", 
                      borderRadius: "15px",
                      "&:hover": {
                        backgroundColor: "rgba(9, 3, 110, 0.04)"
                      }
                    }}
                  >
                    <ListItemText
                      primary={`Email: ${user.email}`}
                      secondary={`Role: ${user.role}`}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        onClick={() => handleEditClick(user)}
                        sx={{ 
                          mr: 1,
                          color: "#09036e",
                          "&:hover": {
                            backgroundColor: "rgba(9, 3, 110, 0.08)"
                          }
                        }}
                      >
                        Update
                      </Button>
                      {user.role !== "President" && (
                        <Button
                          onClick={() => handleDeleteClick(user)}
                          color="error"
                        >
                          Delete
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{ p: 4, backgroundColor: "white", margin: "auto", mt: 10 }}>
          <Typography variant="h6">Edit User</Typography>
          <TextField
            label="Email"
            value={editUser?.email || ""}
            onChange={(e) =>
              setEditUser({ ...editUser, email: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
          />
          <Select
            value={editUser?.role || ""}
            onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
            fullWidth
          >
            <MenuItem value="President">President</MenuItem>
            <MenuItem value="Vice President">Vice President</MenuItem>
            <MenuItem value="Treasurer">Treasurer</MenuItem>
          </Select>
          <Button onClick={handleUpdate} sx={{ mt: 2 }}>
            Save Changes
          </Button>
        </Box>
      </Modal>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the account for{" "}
            <strong>{userToDelete?.email}</strong>?
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              value={editData.email}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
              margin="normal"
              type="email"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  height: '56px',
                  fontSize: '1.1rem'
                }
              }}
            />
            <FormControl fullWidth margin="normal">
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Role
              </Typography>
              <Select
                labelId="edit-role-label"
                value={editData.role}
                label="Role"
                onChange={(e) =>
                  setEditData({ ...editData, role: e.target.value })
                }
                sx={{ 
                  height: '56px',
                  fontSize: '1.1rem'
                }}
              >
                <MenuItem value="President">President</MenuItem>
                <MenuItem value="Vice President">Vice President</MenuItem>
                <MenuItem value="Treasurer">Treasurer</MenuItem>
                <MenuItem value="Home Owner">Home Owner</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              value={editData.currentPassword}
              onChange={(e) =>
                setEditData({ ...editData, currentPassword: e.target.value })
              }
              margin="normal"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  height: '56px',
                  fontSize: '1.1rem'
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={editData.newPassword}
              onChange={(e) =>
                setEditData({ ...editData, newPassword: e.target.value })
              }
              margin="normal"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  height: '56px',
                  fontSize: '1.1rem'
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </AppTheme>
  );
}
