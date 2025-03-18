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

import SideMenu from "../dashboard/components/SideMenu";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../dashboard/theme/customizations";

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

  const deleteExpense = async (id) => {
    const token = localStorage.getItem("authToken");

    try {
      await axios.delete(`http://localhost:8000/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense._id !== id)
      );
    } catch (error) {
      console.error(
        "Error deleting expense:",
        error.response ? error.response.data : error.message
      );
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
              <Paper sx={{ flex: 7, borderRadius: "20px", padding: 4 }}>
                <Paper style={{ height: 550, width: 700 }}>
                  <TableVirtuoso
                    data={expenses}
                    components={VirtuosoTableComponents}
                    fixedHeaderContent={() => (
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell
                            key={column.dataKey}
                            variant="head"
                            align={column.numeric || false ? "right" : "left"}
                            style={{ width: column.width }}
                            sx={{ backgroundColor: "background.paper" }}
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
                                <Button onClick={() => editExpense(row)}>
                                  Edit
                                </Button>
                                <Button onClick={() => deleteExpense(row._id)}>
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

              <Paper sx={{ flex: 3, borderRadius: "20px", padding: 4 }}>
                <h2>Homeowners Association Expense Tracker</h2>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    flex: 1,
                  }}
                >
                  <TextField
                    id="expense-name"
                    label="Expense Name"
                    variant="outlined"
                    fullWidth="20"
                    sx={{
                      m: 1,
                      "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                    }}
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                  />
                  <TextField
                    id="expense-amount"
                    label="Expense Amount"
                    variant="outlined"
                    fullWidth="20"
                    sx={{
                      m: 1,
                      width: "20",
                      "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                    }}
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ mt: 3, borderRadius: "10px" }}
                    onClick={editingExpenseId ? updateExpense : addExpense}
                  >
                    {editingExpenseId ? "Update Expense" : "Add Expense"}
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Stack>
        </Stack>
      </ThemeProvider>
    </AppTheme>
  );
}
