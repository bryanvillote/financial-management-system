import { useTheme } from "@emotion/react";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Header from "../dashboard/components/Header";

import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AppTheme from "../../utils/share-theme/AppTheme";
import SideMenu from "../dashboard/components/SideMenu";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../dashboard/theme/customizations";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const theme = createTheme({
  palette: {
    primary: {
      main: "#3B1E54",
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: "#F0A8D0",
      light: "#FFC6C6",
      // dark: will be calculated from palette.secondary.main,
      contrastText: "#000000",
    },
  },
});

const Card = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  position: "relative",
  borderRadius: theme.spacing(3),
  boxShadow:
    "hsla(220, 60.00%, 2.00%, 0.12) 0px 8px 30px 0px, hsla(222, 25.50%, 10.00%, 0.06) 0px 10px 25px -5px",
  ...theme.applyStyles?.("dark", {
    boxShadow:
      "hsla(220, 60.00%, 2.00%, 0.12) 0px 8px 30px 0px, hsla(222, 25.50%, 10.00%, 0.06) 0px 10px 25px -5px",
  }),
}));

function createData(name, calories, fat) {
  return { name, calories, fat };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
];

export default function Billing(props) {
  const theme = useTheme();

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: "flex" }}>
          <SideMenu />
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
                mt: { xs: 8, md: 0 },
              }}
            >
              <Header />
              <Box sx={{ display: "flex", gap: 3, padding: 4, marginLeft: 30 }}>
                {/* Left Card Container */}
                <Card sx={{ flex: 1 }}>
                  {/* First Table */}
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 720 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Dessert (100g serving)</TableCell>
                          <TableCell align="right">Calories</TableCell>
                          <TableCell align="right">Fat&nbsp;(g)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow
                            key={row.name}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {row.name}
                            </TableCell>
                            <TableCell align="right">{row.calories}</TableCell>
                            <TableCell align="right">{row.fat}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Divider */}
                  <Divider sx={{ marginY: 2 }} />

                  {/* Second Table */}
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Dessert (100g serving)</TableCell>
                          <TableCell align="right">Calories</TableCell>
                          <TableCell align="right">Fat&nbsp;(g)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow
                            key={row.name}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {row.name}
                            </TableCell>
                            <TableCell align="right">{row.calories}</TableCell>
                            <TableCell align="right">{row.fat}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>

                {/* Right Card Container */}
                <Card sx={{ flex: 1 }}>
                  {/* Centered TextFields */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: 1,
                      minHeight: "300px",
                    }}
                  >
                    <TextField
                      id="outlined-basic"
                      label="Due Amount"
                      variant="outlined"
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                      }}
                    />
                    <TextField
                      id="outlined-basic-2"
                      label="Payment Amount"
                      variant="outlined"
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                      }}
                    />
                  </Box>

                  {/* Search Field */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: (theme) => theme.spacing(3.5),
                      right: (theme) => theme.spacing(2),
                    }}
                  >
                    <Paper
                      component="form"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: "2px 4px",
                        width: 215,
                      }}
                    >
                      <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search Homeowner"
                        inputProps={{ "aria-label": "search" }}
                        borderRadius={4}
                      />
                      <IconButton
                        type="button"
                        sx={{ p: "10px" }}
                        aria-label="search"
                      >
                        <SearchIcon />
                      </IconButton>
                    </Paper>
                  </Box>

                  {/* Buttons at Bottom-Right */}
                  <Box
                    sx={{
                      mt: "auto",
                      display: "flex",
                      justifyContent: "flex-end",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{ mt: 1, borderRadius: "10px" }}
                      size="large"
                    >
                      Notify Homeowner
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 1, borderRadius: "10px" }}
                      size="large"
                    >
                      Generate Receipt
                    </Button>
                  </Box>
                </Card>
              </Box>
            </Stack>
          </Box>
        </Box>
      </ThemeProvider>
    </AppTheme>
  );
}
