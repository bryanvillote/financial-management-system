import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router-dom";

export default function BasicButtons() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-start", // Align items to the left
        alignItems: "flex-end", // Align items to the bottom
        height: "100vh", // Full viewport height
        width: "100vw", // Full viewport width
        backgroundImage: `url('/subd.jpg')`, // Path to the SVG background
        backgroundSize: "cover", // Make the image cover the entire area
        backgroundRepeat: "no-repeat", // Prevents the image from repeating
        backgroundPosition: "center", // Center the background image
      }}
    >
      <Stack
        spacing={2}
        direction="row"
        sx={{ marginLeft: 10, marginBottom: 15 }}
      >
        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{
            borderRadius: "16px",
            backgroundColor: "#020140", // blue
            color: "#fff", // Text color
            fontSize: "1.5rem", // Larger text
            padding: "1rem 2rem", // Larger button padding
            "&:hover": {
              backgroundColor: "#3820A1", // Slightly darker pastel green on hover
            },
            zIndex: "10",
          }}
        >
          Get Started
        </Button>
      </Stack>
      <Box
        sx={{
          position: "absolute", // Positioning the text on the right
          right: 0, // Distance from the right edge
          top: 0, // Distance from the top edge
          width: "100%",
          height: "100%",
          color: "#fff", // Text color
          textAlign: "right", // Align text to the right
          background: "linear-gradient(to left, #020140, transparent)", // Fading blue background
        }}
      >
        <div
          style={{
            padding: "6rem",
          }}
        >
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: "light" }}>
              Centro de San Lorenzo Homeowners Association
            </div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "lighter",
                marginTop: "2px",
                fontStyle: "italic",
              }}
            >
              Sta. Rosa, Laguna
            </div>
          </div>
          <div>
            <div
              style={{
                fontWeight: "bold",
                fontStyle: "italic",
                fontSize: "3.5rem",
                marginTop: "8rem",
              }}
            >
              &quot;Built on faith,
              <br /> empowered by family,
              <br /> and flourishing in <br /> community&quot;
            </div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "lighter",
                marginTop: "1.5rem",
              }}
            >
              - where life grows together.
            </div>
          </div>
        </div>
      </Box>
    </Box>
  );
}
