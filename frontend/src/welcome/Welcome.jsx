import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

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
        backgroundImage: `url('/SUBD.svg')`, // SVG background
        backgroundSize: 'cover', // or 'contain' depending on your needs
        overflow: 'hidden'
      }}
    >
      <Stack spacing={2} direction="row">
        <Button
          variant="contained"
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
