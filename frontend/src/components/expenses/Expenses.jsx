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
import { API_BASE_URL } from "../../config";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
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
import HistoryIcon from '@mui/icons-material/History';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const theme = createTheme({
  palette: {
    primary: {
      main: "#1687fc",
    },
    secondary: {
      main: "#020140",
      light: "#FFC6C6",
      contrastText: "#000000",
    },
  },
});

const columns = [
  {
    width: 250,
    label: "Expense Name",
    dataKey: "expenseName",
    align: "left",
    headerAlign: "left",
    padding: "16px 24px",
    cellPadding: "16px 24px"
  },
  {
    width: 210,
    label: "Category",
    dataKey: "category",
    align: "left",
    headerAlign: "left",
    padding: "16px 24px",
    cellPadding: "16px 24px"
  },
  {
    width: 210,
    label: "Expense Amount",
    dataKey: "expenseAmount",
    align: "center",
    headerAlign: "left",
    padding: "16px 24px",
    cellPadding: "16px 24px",
    formatValue: (value) => `₱${value}`
  },
  {
    width: 280,
    label: "Actions",
    dataKey: "actions",
    align: "center",
    headerAlign: "left",
    padding: "16px 24px",
    cellPadding: "16px 24px"
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
  const [expenseCategory, setExpenseCategory] = useState("Others");
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogModalOpen, setAuditLogModalOpen] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(`${API_BASE_URL}/expenses`, {
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
    const newExpense = { 
      expenseName, 
      expenseAmount,
      category: expenseCategory,
      date: new Date()
    };
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/expenses`,
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
    const updatedExpense = { 
      expenseName, 
      expenseAmount,
      category: expenseCategory,
      date: new Date()
    };
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.put(
        `${API_BASE_URL}/expenses/${editingExpenseId}`,
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
        `${API_BASE_URL}/expenses/${expenseToDelete._id}`,
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
    setExpenseCategory(expense.category || "Others");
    setEditingExpenseId(expense._id);
  };

  const resetForm = () => {
    setExpenseName("");
    setExpenseAmount("");
    setExpenseCategory("Others");
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

  const fetchAuditLogs = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(`${API_BASE_URL}/expenses/audit-logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAuditLogs(response.data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  const handleOpenAuditLogModal = () => {
    fetchAuditLogs();
    setAuditLogModalOpen(true);
  };

  const handleCloseAuditLogModal = () => {
    setAuditLogModalOpen(false);
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
            mt: { xs: 8, md: 5 },
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
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxWidth: "1200px",
                mx: "auto",
                mt: 2,
                ml: { xs: 0, md: 55},
              }}
            >
              <Paper 
                sx={{ 
                  flex: 1, 
                  borderRadius: "20px", 
                  padding: 4,
                  width: "100%",
                  maxWidth: "1200px",
                  backgroundColor: "#ffffff"
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  px: 2,
                  backgroundColor: "#ffffff"
                }}>
                  <h2>Homeowners Association Expenses</h2>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<HistoryIcon />}
                      onClick={handleOpenAuditLogModal}
                      sx={{ 
                        borderRadius: "15px",
                        boxShadow: "0px 0px 10px 0px rgba(105, 105, 105, 0.64)",
                        "&:hover": {
                          backgroundColor: "#000000",
                          color: "#FFFFFF"
                        },
                        "&:focus": {
                          outline: "none"
                        }
                      }}
                    >
                      Activity Logs
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleOpenExpenseModal}
                      sx={{ 
                        borderRadius: "15px",
                        boxShadow: "0px 0px 10px 0px rgba(105, 105, 105, 0.64)",
                        "&:hover": {
                          backgroundColor: "#000000",
                          color: "#FFFFFF"
                        },
                        "&:focus": {
                          outline: "none"
                        }
                      }}
                    >
                      Add Expense
                    </Button>
                  </Box>
                </Box>
                <Paper 
                  style={{ 
                    height: 550, 
                    width: "100%",
                    overflow: "hidden",
                    backgroundColor: "#ffffff"
                  }}
                  elevation={0}
                >
                  <TableVirtuoso
                    data={expenses}
                    components={VirtuosoTableComponents}
                    style={{ height: "100%", backgroundColor: "#ffffff" }}
                    fixedHeaderContent={() => (
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell
                            key={column.dataKey}
                            variant="head"
                            align={column.headerAlign}
                            style={{ width: column.width }}
                            sx={{ 
                              backgroundColor: "#ffffff",
                              fontWeight: "bold",
                              padding: column.padding,
                              height: "52px",
                              borderBottom: "2px solid",
                              borderColor: "divider"
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
                            align={column.align}
                            style={{ width: column.width }}
                            sx={{
                              width: column.width,
                              maxWidth: column.width,
                              minWidth: column.width,
                              padding: column.cellPadding,
                              height: "52px",
                              borderBottom: "1px solid",
                              borderColor: "divider",
                              ...(column.dataKey === "expenseAmount" && {
                                fontFamily: "monospace",
                              }),
                            }}
                          >
                            {column.dataKey === "actions" ? (
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                gap: 1,
                              }}>
                                <Button 
                                  onClick={() => {
                                    editExpense(row);
                                    setExpenseModalOpen(true);
                                  }}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  sx={{ mr: 1 }}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  onClick={() => handleDeleteClick(row)}
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                >
                                  Delete
                                </Button>
                              </Box>
                            ) : column.dataKey === "expenseAmount" ? (
                              column.formatValue(row[column.dataKey])
                            ) : column.dataKey === "category" ? (
                              <Chip 
                                label={row.category || "Others"} 
                                size="small"
                                sx={{ 
                                  minWidth: "100px",
                                  fontWeight: "medium", 
                                  backgroundColor:
                                    row.category === "Maintenance" ? "#1687fc" :
                                    row.category === "Utilities" ? "#6cc24a" :
                                    row.category === "Security" ? "#c89c0b" :
                                    row.category === "Others" ? "#c81e1e" :
                                    "#c81e1e",
                                  color: '#fff',
                                }}
                              />
                            ) : (
                              row[column.dataKey]
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )}
                  />
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    alignItems: 'center',
                    p: 2,
                    borderTop: '2px solid',
                    borderColor: 'divider',
                    backgroundColor: '#ffffff'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Total Expenses: ₱{expenses.reduce((sum, expense) => sum + (parseFloat(expense.expenseAmount) || 0), 0).toLocaleString()}
                    </Typography>
                  </Box>
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
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "15px",
              boxShadow: "0px 0px 10px 0px rgba(105, 105, 105, 0.64)"
            }
          }}
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
              <FormControl fullWidth>
                <InputLabel id="expense-category-label">Category</InputLabel>
                <Select
                  labelId="expense-category-label"
                  id="expense-category"
                  value={expenseCategory}
                  label="Category"
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                  }}
                >
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                  <MenuItem value="Utilities">Utilities</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseExpenseModal}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
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

        {/* Audit Log Modal */}
        <Dialog 
          open={auditLogModalOpen} 
          onClose={handleCloseAuditLogModal}
          maxWidth="md"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "15px",
              boxShadow: "0px 0px 10px 0px rgba(105, 105, 105, 0.64)"
            }
          }}
        >
          <DialogTitle>
            Expense Audit Logs
            <IconButton
              aria-label="close"
              onClick={handleCloseAuditLogModal}
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
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User Email</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{log.userEmail}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </AppTheme>
  );
}