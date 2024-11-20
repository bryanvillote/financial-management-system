import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function BasicButtons() {
  return (
    <Box>
        <Stack spacing={2} direction="row">
      <Button variant="contained">Get Started</Button>
    </Stack>
    </Box>

  );
}
