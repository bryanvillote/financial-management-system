import { Box, Paper, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import PenaltyCard from "./PenaltyCard";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow:
    "hsla(220, 60.00%, 2.00%, 0.12) 0px 8px 30px 0px, hsla(222, 25.50%, 10.00%, 0.06) 0px 10px 25px -5px",
  height: "100%",
}));

const StatBox = ({ title, value, color = "primary.main" }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      backgroundColor: "rgba(59, 30, 84, 0.04)",
    }}
  >
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h4" color={color} sx={{ fontWeight: "medium" }}>
      {value}
    </Typography>
  </Box>
);

export default function HomeownerStats({
  selectedHomeowner,
  onPenaltyApplied,
}) {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:8000/homeowners");
      const data = await response.json();

      setStats({
        total: data.length,
        active: data.filter((h) => h.status !== "inactive").length,
        pending: data.filter((h) => h.status === "pending").length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <StyledPaper elevation={0}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Overview
      </Typography>
      <Stack spacing={2}>
        <StatBox
          title="Total Homeowners"
          value={stats.total}
          color="primary.main"
        />
        <StatBox
          title="Active Members"
          value={stats.active}
          color="success.main"
        />
        <PenaltyCard
          selectedHomeowner={selectedHomeowner}
          onPenaltyApplied={onPenaltyApplied}
        />
      </Stack>
    </StyledPaper>
  );
}
