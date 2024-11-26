import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';
import Chance from 'chance';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

// BasicTextFields Component (Modified)
export function BasicTextFields() {
  return (
    <Card sx={{ backgroundColor: 'white', margin: '20px 50px' }}> {/* Added margin */}
      <CardContent>
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1, width: '25ch' },
            display: 'flex', 
            justifyContent: 'flex-end', 
          }}
          noValidate
          autoComplete="off"
        >
          <TextField id="outlined-basic" label="Expense Name" variant="outlined" />
          <TextField id="outlined-basic" label="Expense Amount" variant="outlined" />
        </Box>
      </CardContent>
    </Card>
  );
}

// ReactVirtualizedTable Component
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

export function ReactVirtualizedTable() {
  return (
    <Card sx={{ height: '80vh', width: '100%', backgroundColor: 'white' }}> 
      <CardContent>
        <Paper style={{ height: 400, width: '100%' }}>
          <TableVirtuoso
            data={rows}
            components={VirtuosoTableComponents}
            fixedHeaderContent={fixedHeaderContent}
            itemContent={rowContent}
          />
        </Paper>
      </CardContent>
    </Card>
  );
}

// BasicButtons Component
export function BasicButtons() {
  return (
    <Stack spacing={2} direction="row">
      <Button variant="contained">Contained</Button>
    </Stack>
  );
}

// Expenses Component (Default Export - Modified)
export default function Expenses() {
  return (
    <div style={{ 
      backgroundColor: 'black', 
      minHeight: '100vh', 
      width: "100vw", 
      display: 'flex',
      flexDirection: 'row', 
      padding: '20px'  // Removed alignItems: 'center'
    }}> 
      <ReactVirtualizedTable />

      <div>
      <BasicTextFields />
      <BasicButtons />
      </div>
    </div>
  );
}