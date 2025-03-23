import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Modal,
  Snackbar,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
// import Card from "@mui/material/Card";
import CssBaseline from "@mui/material/CssBaseline";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
// import Stack from "@mui/material/Stack";
// import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import SideMenu from "../components/dashboard/components/SideMenu";
import AppTheme from "../utils/share-theme/AppTheme";

// const StyledCard = styled(Card)(({ theme }) => ({
//   display: "flex",
//   flexDirection: "column",
//   alignSelf: "center",
//   width: "100%",
//   padding: theme.spacing(4),
//   gap: theme.spacing(2),
//   margin: "auto",
//   maxWidth: "450px",
//   boxShadow: "0px 5px 15px rgba(0,0,0,0.1), 0px 15px 35px rgba(0,0,0,0.05)",
//   [theme.breakpoints.down("sm")]: {
//     padding: theme.spacing(2),
//   },
// }));

// const SignInContainer = styled(Stack)(({ theme }) => ({
//   height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
//   width: "100vw",
//   minHeight: "100%",
//   padding: theme.spacing(2),
//   backgroundColor: "#000",
//   // backgroundImage: `linear-gradient(to right, #020140, transparent), url('/loginbg.png')`,
//   // backgroundSize: "cover",
//   // backgroundRepeat: "no-repeat",
//   // backgroundPosition: "center",
//   [theme.breakpoints.up("sm")]: {
//     padding: theme.spacing(4),
//   },
//   "&::before": {
//     content: '""',
//     display: "block",
//     position: "absolute",
//     zIndex: -1,
//     ...theme.applyStyles("dark", {
//       backgroundImage:
//         "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
//     }),
//   },
// }));

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

  // const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/auth/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // const handleRedirect = () => {
  //   navigate("/login");
  // };

  // const handleClose = () => setOpen(false);

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
      alert("Please select a role.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateInputs({ email, password, role })) return;

    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const result = await response.json();

      if (response.ok) {
        setSnackbarMessage("Admin registration successful!");
        setSnackbarOpen(true);
        fetchUsers(); // Refresh the user list
        // Clear the input fields
        setEmail("");
        setPassword("");
        setRole("");
      } else {
        const errorMessage = result.errors
          ? result.errors[0].msg
          : result.message || "Registration failed. Please try again.";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Network error occurred. Please try again.");
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setOpen(true);
  };

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/auth/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setSnackbarMessage("User deleted successfully");
        setSnackbarOpen(true);
        fetchUsers(); // Refresh the user list
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/auth/users/${editUser._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: editUser.email, role: editUser.role }),
        }
      );

      if (response.ok) {
        setSnackbarMessage("User updated successfully");
        setSnackbarOpen(true);
        fetchUsers(); // Refresh the user list
        setOpen(false);
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SideMenu />
      <Grid container spacing={2} sx={{ padding: 2, paddingLeft: 70 }}>
        <Grid item xs={12} md={6}>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontSize: "clamp(2rem, 5vw, 2.15rem)",
              textAlign: "center",
              mb: 2,
            }}
          >
            Admin Registration
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxWidth: "450px",
              margin: "auto",
            }}
          >
            <FormControl>
              <FormLabel>Email</FormLabel>
              <TextField
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                fullWidth
                variant="outlined"
                error={!!emailError}
                helperText={emailError}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <TextField
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                fullWidth
                variant="outlined"
                error={!!passwordError}
                helperText={passwordError}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <FormControl>
              <FormLabel>Role</FormLabel>
              <Select
                id="role"
                name="role"
                value={role}
                onChange={handleRoleChange}
                fullWidth
                variant="outlined"
                required
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Choose role
                </MenuItem>
                <MenuItem value="President">President</MenuItem>
                <MenuItem value="Vice President">Vice President</MenuItem>
                <MenuItem value="Treasurer">Treasurer</MenuItem>
                <MenuItem value="Home Owner">Home Owner</MenuItem>
              </Select>
            </FormControl>
            {/* this forgot passowrd is disabled for now... */}
            {/* <ForgotPassword open={open} handleClose={handleClose} /> */}
            <Button type="submit" fullWidth variant="contained">
              Register Admin
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ mt: 4, width: "500px", margin: "auto" }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Registered Users
            </Typography>
            <List
              sx={{
                maxHeight: "60vh",
                overflow: "auto",
              }}
            >
              {users.map((user) => (
                <ListItem
                  key={user._id}
                  sx={{ mb: 1, border: "1px solid #ccc", borderRadius: "4px" }}
                >
                  <ListItemText
                    primary={`Email: ${user.email}`}
                    secondary={`Role: ${user.role}`}
                  />
                  <ListItemSecondaryAction>
                    <Button onClick={() => handleEdit(user)} sx={{ mr: 1 }}>
                      Update
                    </Button>
                    <Button
                      onClick={() => handleDelete(user._id)}
                      color="error"
                    >
                      Delete
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>
      </Grid>
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </AppTheme>
  );
}
