import AddIcon from "@mui/icons-material/Add";
import {
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomeOwnerGrid() {
  const navigate = useNavigate();
  const [homeowners, setHomeowners] = useState([]);
  const [selectedHomeowner, setSelectedHomeowner] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [homeownerToDelete, setHomeownerToDelete] = useState(null);

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "blockNo",
      headerName: "Block No",
      flex: 0.5,
      minWidth: 100,
    },
    {
      field: "lotNo",
      headerName: "Lot No",
      flex: 0.5,
      minWidth: 100,
    },
    {
      field: "phoneNo",
      headerName: "Phone No",
      flex: 0.8,
      minWidth: 150,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === "Active"
              ? "success"
              : ["Warning", "Penalty 1", "Penalty 2", "Penalty 3", "No Participation"].includes(params.value)
              ? "error"
              : "default"
          }
          sx={{
            backgroundColor: params.value === "No Participation" ? "#d32f2f" : undefined,
            color: params.value === "No Participation" ? "#ffffff" : undefined,
            fontWeight: params.value === "No Participation" ? "medium" : undefined,
            '& .MuiChip-label': {
              color: params.value === "No Participation" ? "#ffffff" : undefined
            }
          }}
        />
      ),
    },
    ...(userRole !== "Treasurer"
      ? [
          {
            field: "actions",
            headerName: "Actions",
            flex: 0.8,
            minWidth: 200,
            renderCell: (params) => (
              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" width="100%">
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleEdit(params.row)}
                  sx={{ 
                    minWidth: '60px',
                    borderRadius: "15px",
                    boxShadow: "0px 0px 10px 0px rgba(105, 105, 105, 0.64)",
                    backgroundColor: "#3B1E54",
                    "&:hover": {
                      backgroundColor: "#3B1E54",
                    }
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleDeleteClick(params.row)}
                  sx={{ 
                    minWidth: '80px',
                    borderRadius: "15px",
                    borderColor: "#d32f2f",
                    color: "#d32f2f",
                    "&:hover": {
                      borderColor: "#d32f2f",
                      backgroundColor: "rgba(211, 47, 47, 0.04)"
                    }
                  }}
                >
                  Delete
                </Button>
              </Stack>
            ),
          },
        ]
      : []),
  ];

  const fetchHomeowners = async () => {
    try {
      const response = await fetch("http://localhost:8000/homeowners");
      const data = await response.json();
      setHomeowners(data);
    } catch (error) {
      console.error("Error fetching homeowners:", error);
    }
  };

  useEffect(() => {
    fetchHomeowners();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchHomeowners();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, []);

  const handleEdit = (homeowner) => {
    navigate("/app/registration", {
      state: {
        isEditing: true,
        homeowner: {
          id: homeowner._id,
          blockNo: homeowner.blockNo,
          lotNo: homeowner.lotNo,
          phoneNo: homeowner.phoneNo,
          email: homeowner.email,
        },
      },
    });
  };

  const handleDeleteClick = (homeowner) => {
    setHomeownerToDelete(homeowner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!homeownerToDelete) return;
    try {
      const response = await fetch(`http://localhost:8000/homeowners/${homeownerToDelete._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete homeowner");
      fetchHomeowners();
    } catch (error) {
      console.error("Error deleting homeowner:", error);
    } finally {
      setDeleteDialogOpen(false);
      setHomeownerToDelete(null);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1400px",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: 2,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3, width: "100%" }}
      >
        <Typography variant="h5" fontWeight="medium">
          Homeowners List
        </Typography>
        {userRole !== "Treasurer" && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/app/registration")}
            sx={{
              borderRadius: "15px",
              textTransform: "none",
              boxShadow: "0px 0px 10px 0px rgba(105, 105, 105, 0.64)",
              ml: 1,
              backgroundColor: "#3B1E54",
              "&:hover": {
                backgroundColor: "#3B1E54",
              }
            }}
          >
            Add Homeowner
          </Button>
        )}
      </Stack>

      <Grid container spacing={3} sx={{ width: "100%", justifyContent: "center" }}>
        <Grid xs={12}>
          <DataGrid
            rows={homeowners}
            getRowId={(row) => row._id}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
              sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
              filter: { filterModel: { items: [] } },
            }}
            pageSizeOptions={[10, 25, 50]}
            onRowSelectionModelChange={(newSelection) => {
              const selected = homeowners.find(h => h._id === newSelection[0]);
              setSelectedHomeowner(selected);
            }}
            sx={{
              width: "100%",
              boxShadow: "0px 0px 10px 0px rgba(182, 182, 182, 0.52)",
              borderRadius: "20px",
              '& .MuiDataGrid-cell': { borderColor: 'divider' },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'background.paper',
                borderBottom: '2px solid',
                borderColor: 'divider'
              }
            }}
            autoHeight
            sortingMode="server"
            filterMode="server"
            disableRowSelectionOnClick
            checkboxSelection
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        </Grid>
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-homeowner-dialog-title"
        aria-describedby="delete-homeowner-dialog-description"
      >
        <DialogTitle id="delete-homeowner-dialog-title">
          Confirm Delete Homeowner
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-homeowner-dialog-description">
            Are you sure you want to delete the homeowner <strong>{homeownerToDelete?.email}</strong> with Block {homeownerToDelete?.blockNo}, Lot {homeownerToDelete?.lotNo}?
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="outlined"
            color="error"
            autoFocus
            sx={{
              borderRadius: "15px",
              borderColor: "#d32f2f",
              color: "#d32f2f",
              "&:hover": {
                borderColor: "#d32f2f",
                backgroundColor: "rgba(211, 47, 47, 0.04)"
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
