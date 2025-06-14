import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import AppTheme from "../../../utils/share-theme/AppTheme";
import SideMenu from "../components/SideMenu";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../theme/customizations";
import HomeOwnerGrid from "./HomeownerGrid";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 3 },
              pl: 30,
            }}
          >
            <HomeOwnerGrid />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
