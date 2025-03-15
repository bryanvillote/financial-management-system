import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import HomeownerDataGrid from "./HomeownerDataGrid";
import HomeownerStats from "./HomeownerStats";

export default function HomeOwnerGrid() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Home Owners
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <HomeownerDataGrid />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: "column", sm: "row", lg: "column" }}>
            <HomeownerStats />
          </Stack>
        </Grid>
      </Grid>
      {/* <Copyright sx={{ my: 4 }} /> */}
    </Box>
  );
}
