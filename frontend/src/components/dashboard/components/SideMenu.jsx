import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import MenuContent from "./MenuContent";
import OptionsMenu from "./OptionsMenu";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu() {
  const [userData, setUserData] = useState({
    email: "",
    role: "",
    name: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const decodedToken = jwtDecode(token);

        // Get user data directly from the token
        setUserData({
          email: decodedToken.email,
          role: decodedToken.role,
          name:
            decodedToken.role === "Home Owner"
              ? await fetchHomeownerName(decodedToken.email, token)
              : decodedToken.email.split("@")[0],
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchHomeownerName = async (email, token) => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/homeowners/email/${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return `${response.data.firstName} ${response.data.lastName}`;
      } catch (error) {
        console.error("Error fetching homeowner data:", error);
        return email.split("@")[0]; // Fallback to email username if homeowner data fetch fails
      }
    };

    fetchUserData();
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      {/* <Box
        sx={{
          display: "flex",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <SelectContent />
      </Box> */}
      <Divider />
      <MenuContent />
      {/* <CardAlert /> */}
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          sizes="small"
          alt={userData.name || "User"}
          src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: "auto" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: "16px" }}
          >
            {userData.name || "User"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {userData.email}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block" }}
          >
            {userData.role}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
