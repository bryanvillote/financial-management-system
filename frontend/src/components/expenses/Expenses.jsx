import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import { TableVirtuoso } from 'react-virtuoso';
import Chance from 'chance';

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

const Card = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  position: 'relative',
  boxShadow:
  'hsla(220, 60.00%, 2.00%, 0.12) 0px 8px 40px 0px, hsla(222, 25.50%, 10.00%, 0.06) 0px 15px 35px -5px',
  backgroundColor: theme.palette.background.paper,
}));

const chance = new Chance(42);

function createData(id) {
  return {
    id,
    firstName: chance.first(),
    lastName: chance.last(),
    age: chance.age(),
    phone: chance.phone(),
    state: chance.state({ full: true }),
  };
}

const columns = [
  {
    width: 100,
    label: 'First Name',
    dataKey: 'firstName',
  },
  {
    width: 100,
    label: 'Last Name',
    dataKey: 'lastName',
  },
  {
    width: 50,
    label: 'Age',
    dataKey: 'age',
    numeric: true,
  },
  {
    width: 110,
    label: 'State',
    dataKey: 'state',
  },
  {
    width: 130,
    label: 'Phone Number',
    dataKey: 'phone',
  },
];

const rows = Array.from({ length: 200 }, (_, index) => createData(index));

const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
  ),
  TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
  TableRow,
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align={column.numeric || false ? 'right' : 'left'}
          style={{ width: column.width }}
          sx={{ backgroundColor: 'background.paper' }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
}

function rowContent(_index, row) {
  return (
    <React.Fragment>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          align={column.numeric || false ? 'right' : 'left'}
        >
          {row[column.dataKey]}
        </TableCell>
      ))}
    </React.Fragment>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        padding: 4,
        minHeight: 600,
        alignItems: 'stretch',
        marginLeft: 30,
      }}
    >
      {/* Left Card Container (70% width) */}
      <Card sx={{ flex: 7, borderRadius: '20px' }}>
        <Paper style={{ height: 550, width: 700 }}>
          <TableVirtuoso
            data={rows}
            components={VirtuosoTableComponents}
            fixedHeaderContent={fixedHeaderContent}
            itemContent={rowContent}
          />
        </Paper>
      </Card>

      {/* Right Card Container (30% width) */}
      <Card sx={{ flex: 3, borderRadius: '20px'}}>
        <h2>Homeowners Association Expense Tracker</h2> {/* Add this line to display the title */}
        {/* Vertical Alignment */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',  // Changed from 'row' to 'column' for vertical alignment
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            flex: 1,
          }}
        >
          <TextField id="expense-name" label="Expense Name" variant="outlined" fullWidth sx={{m: 1, width: '20', '& .MuiOutlinedInput-root': { borderRadius: '10px',},}} />
          <TextField id="expense-amount" label="Expense Amount" variant="outlined" fullWidth sx={{m: 1, width: '20', '& .MuiOutlinedInput-root': { borderRadius: '10px',},}}/>
          <Button variant="contained" color="primary" fullWidth size='large' sx={{ mt: 3, borderRadius: '10px' }}>
            Add Expense
          </Button>
        </Box>
      </Card>
    </Box>
    </ThemeProvider>
  );
}
