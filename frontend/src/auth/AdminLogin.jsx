import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { jwtDecode } from "jwt-decode";
import { toast } from "mui-sonner";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "../components/dashboard/Dashboard";
import { useAuth } from "../utils/context/useAuth";
import AppTheme from "../utils/share-theme/AppTheme";
import ColorModeSelect from "../utils/share-theme/ColorModeSelect";
import ForgotPassword from "./ForgotPassword";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  marginTop: "10rem",
  borderRadius: "20px",
  padding: theme.spacing(4),
  gap: theme.spacing(3),
  [theme.breakpoints.up("sm")]: {
    maxWidth: "500px",
    height: "auto",
    minHeight: "430px",
  },
  boxShadow:
    "hsla(231, 67.30%, 9.60%, 0.84) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
}));

const LoginContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  width: "100vw",
  minHeight: "100%",
  padding: theme.spacing(2),
  backgroundImage: `linear-gradient(to right, #020140, transparent), url('/loginbg.png')`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

const getRoleBasedRedirectPath = (role) => {
  switch (role) {
    case "Treasurer":
      return "/app/homeowners";
    case "Vice President":
      return "/app/dashboard";
    case "President":
      return "/app/dashboard";
    case "Home Owner":
      return "/app/receipt";
    default:
      return "/login";
  }
};

export default function AdminLog(props) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/auth/verify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Get user role and redirect immediately
        const decodedToken = jwtDecode(token);
        const redirectPath = getRoleBasedRedirectPath(decodedToken.role);
        navigate(redirectPath, { replace: true });
      } else {
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Token verification error:", error);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };
  const validateInputs = () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Check if both fields are empty
    if (!email && !password) {
      toast.error("Please input valid credentials");
      return false;
    }

    // Check if email is empty but password is filled
    if (!email) {
      toast.error("Please enter your email address");
      return false;
    }

    // Check if password is empty but email is filled
    if (!password) {
      toast.error("Please enter your password");
      return false;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Validate password length
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleRedirect = () => {
    navigate("/register");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const decodedToken = jwtDecode(data.token);
        toast.success("Login Successful!");

        // Store token and handle login
        login(data.token);

        // Get the correct redirect path based on role
        const redirectPath = getRoleBasedRedirectPath(decodedToken.role);

        // Use setTimeout to ensure the toast is visible
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1000);
      } else {
        toast.error(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred during login.");
    }
  };

  const handleForgotPasswordOpen = () => {
    setForgotPasswordOpen(true);
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <LoginContainer direction="column" justifyContent="space-between">
        <ColorModeSelect
          sx={{ position: "fixed", top: "1rem", right: "1rem" }}
        />
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Log In
          </Typography>
          <Box
            component="form"
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="off"
                autoFocus
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="off"
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
              <Button
                onClick={handleForgotPasswordOpen}
                sx={{
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  }
                }}
              >
                Forgot Password?
              </Button>
            </Box>

            <ForgotPassword 
              open={forgotPasswordOpen} 
              handleClose={handleForgotPasswordClose} 
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLogin}
              sx={{
                backgroundColor: "#020140",
                marginTop: 1,
                borderRadius: "10px",
                padding: "12px 0",
                fontSize: "1.1rem",
                fontWeight: "500",
                '&:hover': {
                  backgroundColor: "#0A0A6B",
                }
              }}
            >
              Login
            </Button>
          </Box>
        </Card>
      </LoginContainer>
    </AppTheme>
  );
}
