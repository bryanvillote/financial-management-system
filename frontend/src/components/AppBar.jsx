import MuiAppBar from "@mui/material/AppBar";

export default function AppBar() {
  return (
    <MuiAppBar
      position="fixed"
      sx={{
        height: "64px", // Fixed height
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      {/* AppBar content */}
    </MuiAppBar>
  );
}
