import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button'; // Import the Button component
import { createTheme, ThemeProvider } from '@mui/material/styles';


const theme = createTheme({
  palette: {
    primary: {
      main: '#3B1E54',
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: '#F0A8D0',
      light: '#FFC6C6',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#000000',
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
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
        minWidth: 250, 
        maxWidth: '80%', 
        width: '50%',  
        height: 450, 
        display: 'flex', 
        flexDirection: 'column', 
        alignSelf: 'center', 
        padding: 5,  
        margin: 'auto',
        marginLeft: 70,
        borderRadius: 4,
        boxShadow: 'hsla(220, 60.00%, 2.00%, 0.12) 0px 8px 40px 0px, hsla(222, 25.50%, 10.00%, 0.06) 0px 15px 35px -5px', 
      }}> 
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              width: '100%', 

            }}
          >
            <TextField required id="outlined-block-no" label="Block No." sx={{m: 1, width: '30ch', '& .MuiOutlinedInput-root': { borderRadius: '10px',},}} />
            <TextField required id="outlined-lot-no" label="Lot No." sx={{m: 1, width: '30ch', '& .MuiOutlinedInput-root': { borderRadius: '10px',},}} />
            <TextField id="outlined-phone-no" label="Phone No." type="tel" sx={{m: 1, width: '30ch', '& .MuiOutlinedInput-root': { borderRadius: '10px',}, }} />
            <TextField id="outlined-email" label="Email" type="email" sx={{m: 1, width: '30ch', '& .MuiOutlinedInput-root': { borderRadius: '10px',}, }} />

            <Button variant="contained" size="large" color="primary" fullWidth sx={{ mt: 3, borderRadius: '10px' }}>Save</Button> {/* Added the Save button */}
          </Box>
        </CardContent>
      </Card>
    </Box>
    </ThemeProvider>
  );
}