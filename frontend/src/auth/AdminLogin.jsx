import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { toast } from "mui-sonner";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Dashboard from "../components/dashboard/Dashboard";
import { useAuth } from "../utils/context/useAuth";
import AppTheme from "../utils/share-theme/AppTheme";
import ColorModeSelect from "../utils/share-theme/ColorModeSelect";
import ForgotPassword from "./ForgotPassword";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "flex-start",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  marginTop: "6rem",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "400px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
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

export default function AdminLog(props) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
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
        setLoggedIn(true);
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

      const text = await response.text();

      if (response.ok) {
        const { token } = JSON.parse(text);
        toast.success("Login Successful!");
        // Wait for a short time to allow the toast to be displayed
        setTimeout(() => {
          login(token);
          setLoggedIn(true);
          navigate("/app/dashboard");
        }, 1000);
      } else {
        const error = JSON.parse(text);
        toast.error(error.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "An error occurred.");
    }
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

  if (loggedIn) {
    return <Dashboard />;
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
            Log in
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
                autoComplete="email"
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
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <ForgotPassword />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={handleLogin}
            >
              Log in
            </Button>
          </Box>
          <Divider>or</Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography sx={{ textAlign: "center" }}>
              Don&apos;t have an account?{" "}
              <Button
                component="button"
                variant="text"
                onClick={handleRedirect}
              >
                Register
              </Button>
            </Typography>
          </Box>
        </Card>
      </LoginContainer>
    </AppTheme>
  );
}
