import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import HomeownerDataGrid from "./HomeownerDataGrid";
import HomeownerStats from "./HomeownerStats";

export default function HomeOwnerGrid() {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight="medium">
          Home Owners
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/app/registration")}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
          }}
        >
          Add Homeowner
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid xs={12} lg={9}>
          <HomeownerDataGrid />
        </Grid>
        <Grid xs={12} lg={3}>
          <HomeownerStats />
        </Grid>
      </Grid>
    </Box>
  );
}
