import * as React from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box'; // Ensure Box is imported for spacing
import { styled } from '@mui/material/styles';

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

const CustomCard = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  position: 'relative',
  borderRadius: theme.spacing(2.5),
  boxShadow:
    'hsla(220, 60.00%, 2.00%, 0.12) 0px 8px 30px 0px, hsla(222, 25.50%, 10.00%, 0.06) 0px 10px 25px -5px',
  ...theme.applyStyles?.('dark', {
    boxShadow:
      'hsla(220, 60.00%, 2.00%, 0.12) 0px 8px 30px 0px, hsla(222, 25.50%, 10.00%, 0.06) 0px 10px 25px -5px',
  }),
}));

const TAX_RATE = 0.07;

function ccyFormat(num) {
  return `${num.toFixed(2)}`;
}

function priceRow(qty, unit) {
  return qty * unit;
}

function createRow(desc, qty, unit) {
  const price = priceRow(qty, unit);
  return { desc, qty, unit, price };
}

function subtotal(items) {
  return items.map(({ price }) => price).reduce((sum, i) => sum + i, 0);
}

const rows = [
  createRow('Paperclips (Box)', 100, 1.15),
  createRow('Paper (Case)', 10, 45.99),
  createRow('Waste Basket', 2, 17.99),
];

const invoiceSubtotal = subtotal(rows);
const invoiceTaxes = TAX_RATE * invoiceSubtotal;
const invoiceTotal = invoiceTaxes + invoiceSubtotal;

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function LayoutWithPadding() {
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleExitClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
    <Box sx={{display: 'flex', marginLeft: 35 }}> {/* Adds padding to shift content */}
      <Stack direction="row" spacing={4} sx={{ flex: 1 }}>
        {/* Left Card: Table */}
        <CustomCard>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="spanning table">
              <TableHead>
                <TableRow>
                  <TableCell align="center" colSpan={3}>
                    Details
                  </TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Desc</TableCell>
                  <TableCell align="right">Qty.</TableCell>
                  <TableCell align="right">Unit</TableCell>
                  <TableCell align="right">Sum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.desc}>
                    <TableCell>{row.desc}</TableCell>
                    <TableCell align="right">{row.qty}</TableCell>
                    <TableCell align="right">{row.unit}</TableCell>
                    <TableCell align="right">{ccyFormat(row.price)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell rowSpan={3} />
                  <TableCell colSpan={2}>Subtotal</TableCell>
                  <TableCell align="right">{ccyFormat(invoiceSubtotal)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tax</TableCell>
                  <TableCell align="right">{`${(TAX_RATE * 100).toFixed(0)} %`}</TableCell>
                  <TableCell align="right">{ccyFormat(invoiceTaxes)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell align="right">{ccyFormat(invoiceTotal)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CustomCard>

        {/* Right Card: Buttons */}
        <CustomCard sx={{justifyContent: 'flex-end', alignItems: 'flex-end', height: '20vh', paddingTop: 14 }}>
          <Typography variant="h6" sx={{ mt: 2, mb: 2,}}>Receipt Options</Typography>
          <Stack spacing={2} direction="column">
            <Button variant="contained" size='large' sx={{ mt: 1, borderRadius: '10px' }}>Save as PDF</Button>
            <Button variant="contained" size='large' sx={{ mt: 1, borderRadius: '10px' }}>Send in Email</Button>
            <Button variant="text" onClick={handleExitClick}>
              Exit
            </Button>
          </Stack>
        </CustomCard>
      </Stack>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="exit-modal-title"
        aria-describedby="exit-modal-description"
      >
        <Box sx={style} borderRadius={3} >
          <Typography id="exit-modal-title" variant="h6" component="h2">
            Do you really want to exit the receipt?
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: 'flex-end', marginTop: 2 }}
          >
            <Button variant="contained" color="error" onClick={handleCloseModal}>
              Yes
            </Button>
            <Button variant="text" onClick={handleCloseModal}>
              No
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
    </ThemeProvider>
  );
}
