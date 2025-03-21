import AdminPanel from "@mui/icons-material/AdminPanelSettingsRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
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

const secondaryListItems = [
  { text: "Settings", icon: <SettingsRoundedIcon /> },
  { text: "About", icon: <InfoRoundedIcon /> },
];

export default function MenuContent() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setRole(decodedToken.role);
    }
  }, []);

  const mainListItems = [
    { text: "Dashboard", icon: <HomeRoundedIcon />, path: "/app/dashboard" },
    { text: "Reports", icon: <AnalyticsRoundedIcon />, path: "/app/reports" },
    { text: "Expenses", icon: <MonetizationIcon />, path: "/app/expenses" },
    {
      text: "HomeOwners",
      icon: <PeopleRoundedIcon />,
      path: "/app/homeowners",
    },
    {
      text: "Billing & Payments",
      icon: <AssignmentRoundedIcon />,
      path: "/app/billing",
    },
    {
      text: "Admin Registration",
      icon: <AdminPanel />,
      path: "/app/admin-register",
    },
  ];

  const filteredMainListItems = mainListItems.filter((item) => {
    if (role === "Treasurer") {
      return item.text === "Expenses" || item.text === "Billing & Payments";
    }
    // Add more conditions for other roles if needed
    return true;
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
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
