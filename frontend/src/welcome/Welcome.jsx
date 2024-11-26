import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function BasicButtons() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start', // Align items to the left
        alignItems: 'flex-end', // Align items to the bottom
        height: '100vh', // Full viewport height
        width: '100vw', // Full viewport width
        padding: 2, // Adds padding around the edges
        backgroundImage: `url('/SUBD.svg')`, // Path to the SVG background
        backgroundSize: 'cover', // Make the image cover the entire area
        backgroundRepeat: 'no-repeat', // Prevents the image from repeating
        backgroundPosition: 'center', // Center the background image
      }}
    >
      <Stack spacing={2} direction="row">
        <Button
          variant="contained"
          onClick={() => (window.location.href = '/login')} // Temporary redirect
          sx={{
            borderRadius: '16px',
            backgroundColor: '#b0e57c', // Pastel green
            color: '#fff', // Text color
            fontSize: '1.5rem', // Larger text
            padding: '1rem 2rem', // Larger button padding
            '&:hover': {
              backgroundColor: '#9bd867', // Slightly darker pastel green on hover
            },
          }}
        >
          Get Started
        </Button>
      </Stack>
    </Box>
  );
}
