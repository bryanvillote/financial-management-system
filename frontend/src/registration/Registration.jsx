import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button'; // Import the Button component

export default function App() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
      }}
    >
      <Card sx={{ 
        minWidth: 1920, 
        maxWidth: '80%', 
        width: '50%',  
        height: 400, 
        display: 'flex', 
        flexDirection: 'column', 
        alignSelf: 'center', 
        padding: 4,  
        gap: 2, 
        margin: 'auto', 
        boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px', 
      }}> 
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%', 
            }}
          >
            <TextField required id="outlined-block-no" label="Block No." sx={{ m: 1, width: '25ch' }} />
            <TextField required id="outlined-lot-no" label="Lot No." sx={{ m: 1, width: '25ch' }} />
            <TextField id="outlined-phone-no" label="Phone No." type="tel" sx={{ m: 1, width: '25ch' }} />
            <TextField id="outlined-email" label="Email" type="email" sx={{ m: 1, width: '25ch' }} />

            <Button variant="contained" sx={{ mt: 2 }}>Save</Button> {/* Added the Save button */}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}