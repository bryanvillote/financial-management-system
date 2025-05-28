/* eslint-disable react/display-name */
import { CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { TableVirtuoso } from "react-virtuoso";
import AppTheme from "../../utils/share-theme/AppTheme";
import Header from "../dashboard/components/Header";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import SideMenu from "../dashboard/components/SideMenu";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../dashboard/theme/customizations";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const theme = createTheme({
  palette: {
    primary: {
      main: "#3B1E54",
    },
    secondary: {
      main: "#F0A8D0",
      light: "#FFC6C6",
      contrastText: "#000000",
    },
  },
});

const columns = [
  {
    width: 200,
    label: "Expense Name",
    dataKey: "expenseName",
  },
  {
    width: 100,
    label: "Expense Amount",
    dataKey: "expenseAmount",
  },
  {
    width: 100,
    label: "Actions",
    dataKey: "actions",
  },
];

const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      sx={{ borderCollapse: "separate", tableLayout: "fixed" }}
    />
  ),
  TableHead: React.forwardRef((props, ref) => (
    <TableHead {...props} ref={ref} />
  )),
  TableRow,
  TableBody: React.forwardRef((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

export default function Expenses(props) {
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get("http://localhost:8000/expenses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched expenses:", response.data);
        setExpenses(response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };
    fetchExpenses();
  }, []);

  const addExpense = async () => {
    const newExpense = { expenseName, expenseAmount };
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        "http://localhost:8000/expenses",
        newExpense,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setExpenses((prevExpenses) => [...prevExpenses, response.data]);
      resetForm();
    } catch (error) {
      console.error(
        "Error adding expense:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const updateExpense = async () => {
    const updatedExpense = { expenseName, expenseAmount };
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.put(
        `http://localhost:8000/expenses/${editingExpenseId}`,
        updatedExpense,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExpenses((prevExpenses) =>
        prevExpenses.map((expense) =>
          expense._id === editingExpenseId ? response.data : expense
        )
      );
      resetForm();
    } catch (error) {
      console.error(
        "Error updating expense:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    const token = localStorage.getItem("authToken");

    try {
      await axios.delete(
        `http://localhost:8000/expenses/${expenseToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense._id !== expenseToDelete._id)
      );
    } catch (error) {
      console.error(
        "Error deleting expense:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const editExpense = (expense) => {
    setExpenseName(expense.expenseName);
    setExpenseAmount(expense.expenseAmount);
    setEditingExpenseId(expense._id);
  };

  const resetForm = () => {
    setExpenseName("");
    setExpenseAmount("");
    setEditingExpenseId(null);
  };

  const handleOpenExpenseModal = () => {
    resetForm();
    setExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setExpenseModalOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (editingExpenseId) {
      await updateExpense();
    } else {
      await addExpense();
    }
    handleCloseExpenseModal();
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />

        <SideMenu />
        <Stack
          spacing={2}
          sx={{
            alignItems: "center",
            mx: 3,
            pb: 5,
            mt: { xs: 8, md: 0 },
          }}
        >
          <Header />

          <Stack>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                padding: 4,
                minHeight: 600,
                alignItems: "stretch",
                marginLeft: 30,
              }}
            >
              <Paper sx={{ flex: 1, borderRadius: "20px", padding: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  px: 2 
                }}>
                  <h2>Homeowners Association Expenses</h2>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenExpenseModal}
                    sx={{ 
                      borderRadius: "10px",
                      ml: 4 
                    }}
                  >
                    Add Expense
                  </Button>
                </Box>
                <Paper 
                  style={{ 
                    height: 550, 
                    width: "100%",
                    overflow: "hidden"
                  }}
                  elevation={0}
                >
                  <TableVirtuoso
                    data={expenses}
                    components={VirtuosoTableComponents}
                    style={{ height: "100%" }}
                    fixedHeaderContent={() => (
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell
                            key={column.dataKey}
                            variant="head"
                            align={column.numeric || false ? "right" : "left"}
                            style={{ width: column.width }}
                            sx={{ 
                              backgroundColor: "background.paper",
                              fontWeight: "bold"
                            }}
                          >
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    )}
                    itemContent={(_index, row) => (
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell
                            key={column.dataKey}
                            align={column.numeric || false ? "right" : "left"}
                          >
                            {column.dataKey === "actions" ? (
                              <>
                                <Button 
                                  onClick={() => {
                                    editExpense(row);
                                    setExpenseModalOpen(true);
                                  }}
                                  size="small"
                                  sx={{ mr: 1 }}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  onClick={() => handleDeleteClick(row)}
                                  size="small"
                                  color="error"
                                >
                                  Delete
                                </Button>
                              </>
                            ) : (
                              row[column.dataKey]
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )}
                  />
                </Paper>
              </Paper>
            </Box>
          </Stack>
        </Stack>

        {/* Expense Form Modal */}
        <Dialog 
          open={expenseModalOpen} 
          onClose={handleCloseExpenseModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingExpenseId ? "Edit Expense" : "Add New Expense"}
            <IconButton
              aria-label="close"
              onClick={handleCloseExpenseModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                id="expense-name"
                label="Expense Name"
                variant="outlined"
                fullWidth
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                }}
              />
              <TextField
                id="expense-amount"
                label="Expense Amount"
                variant="outlined"
                fullWidth
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseExpenseModal} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              sx={{ borderRadius: "10px" }}
            >
              {editingExpenseId ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-expense-dialog-title"
          aria-describedby="delete-expense-dialog-description"
        >
          <DialogTitle id="delete-expense-dialog-title">
            Confirm Delete Expense
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-expense-dialog-description">
              Are you sure you want to delete the expense{" "}
              <strong>{expenseToDelete?.expenseName}</strong> with amount{" "}
              <strong>₱{expenseToDelete?.expenseAmount}</strong>?
              <br />
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </AppTheme>
  );
}
