import { Box, Paper, Stack, Typography, LinearProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow:
    "hsla(220, 60.00%, 2.00%, 0.12) 0px 8px 30px 0px, hsla(222, 25.50%, 10.00%, 0.06) 0px 10px 25px -5px",
  height: "100%",
}));

const StatBox = ({ title, value, color = "primary.main", icon, percentage }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      backgroundColor: "rgba(59, 30, 84, 0.04)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          backgroundColor: `${color}15`,
          borderRadius: 2,
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" color={color} sx={{ fontWeight: "medium" }}>
          {value}
        </Typography>
        {percentage !== undefined && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: `${color}15`,
                "& .MuiLinearProgress-bar": {
                  backgroundColor: color,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {percentage}% of total
            </Typography>
          </Box>
        )}
      </Box>
    </Stack>
  </Box>
);

export default function HomeownerStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:8000/homeowners");
      const data = await response.json();

      const total = data.length;
      const active = data.filter((h) => h.status === "Active").length;

      setStats({
        total,
        active,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <StyledPaper elevation={0}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Community Overview
      </Typography>
      <Stack spacing={2}>
        <StatBox
          title="Total Homeowners"
          value={stats.total}
          color="primary.main"
          icon={<PeopleAltIcon sx={{ color: "primary.main" }} />}
        />
        <StatBox
          title="Active Members"
          value={stats.active}
          color="success.main"
          icon={<CheckCircleIcon sx={{ color: "success.main" }} />}
          percentage={stats.total ? Math.round((stats.active / stats.total) * 100) : 0}
        />
      </Stack>
    </StyledPaper>
  );
}
