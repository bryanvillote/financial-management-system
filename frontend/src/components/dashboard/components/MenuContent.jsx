import AdminPanel from "@mui/icons-material/AdminPanelSettingsRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import PersonalRecord from "@mui/icons-material/BookOnlineRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import MonetizationIcon from "@mui/icons-material/MonetizationOnRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useColorScheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const secondaryListItems = [
  { text: "Settings", icon: <SettingsRoundedIcon /> },
  { text: "About", icon: <InfoRoundedIcon /> },
];

export default function MenuContent() {
  const [role, setRole] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { mode, setMode } = useColorScheme();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setRole(decodedToken.role);
    }
  }, []);

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleAboutOpen = () => {
    setAboutOpen(true);
  };

  const handleAboutClose = () => {
    setAboutOpen(false);
  };

  const handleThemeChange = (event) => {
    setMode(event.target.value);
  };

  const mainListItems = [
    {
      text: "Dashboard",
      icon: <HomeRoundedIcon />,
      path: "/app/dashboard",
      allowedRoles: ["President", "Vice President"],
    },
    {
      text: "Reports",
      icon: <AnalyticsRoundedIcon />,
      path: "/app/reports",
      allowedRoles: ["President", "Vice President"],
    },
    {
      text: "Expenses",
      icon: <MonetizationIcon />,
      path: "/app/expenses",
      allowedRoles: ["President", "Vice President"],
    },
    {
      text: "HomeOwners",
      icon: <PeopleRoundedIcon />,
      path: "/app/homeowners",
      allowedRoles: ["President", "Vice President", "Treasurer"],
    },
    {
      text: "Billing & Payments",
      icon: <AssignmentRoundedIcon />,
      path: "/app/billing",
      allowedRoles: ["President", "Vice President", "Treasurer"],
    },
    {
      text: "User Roles",
      icon: <AdminPanel />,
      path: "/app/admin-register",
      allowedRoles: ["President", "Vice President"],
    },
    {
      text: "HO Personal Record",
      icon: <PersonalRecord />,
      path: "/app/receipt",
      allowedRoles: ["Vice President", "Home Owner"],
    },
  ];

  const filteredMainListItems = mainListItems.filter((item) => {
    if (!role) return false;
    return item.allowedRoles.includes(role);
  });

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {filteredMainListItems.map((item, index) => (
          <Link to={item.path} key={index}>
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              <ListItemButton selected={location.pathname === item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>

      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton 
              onClick={
                item.text === "Settings" 
                  ? handleSettingsOpen 
                  : item.text === "About" 
                  ? handleAboutOpen 
                  : undefined
              }
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Dialog open={settingsOpen} onClose={handleSettingsClose}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="theme-select-label">Theme</InputLabel>
            <Select
              labelId="theme-select-label"
              id="theme-select"
              value={mode}
              label="Theme"
              onChange={handleThemeChange}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">System</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettingsClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={aboutOpen} 
        onClose={handleAboutClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
            About Centro de San Lorenzo
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" paragraph>
              Established in 1979, Centro de San Lorenzo is a government-owned residential community located in Barangay Dita, Santa Rosa, Laguna. Managed by a dedicated Homeowners Association (HOA), the community is home to 700 active members committed to fostering a safe, organized, and sustainable neighborhood.
            </Typography>
            <Typography variant="body1" paragraph>
              To meet the growing demands of modern community management, the HOA has implemented a cutting-edge Information Management System. This web-based platform streamlines monthly dues tracking, financial reporting, and homeowner record management—enhancing transparency, efficiency, and accountability. Residents can easily access their payment history, receive automated notifications, and stay informed through a secure and user-friendly interface.
            </Typography>
            <Typography variant="body1">
              This digital transformation supports the community's commitment to good governance and sustainability, aligning with global development goals to create a more connected and resilient neighborhood.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAboutClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
