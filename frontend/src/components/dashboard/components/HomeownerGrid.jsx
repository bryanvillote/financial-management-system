import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from '@mui/icons-material/History';
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
import HomeownerAuditLogs from "./HomeownerAuditLogs";
import { API_BASE_URL } from "../../../config";

// Function to render status chip
const renderStatus = (status) => {
  const colors = {
    Active: "success",
    Warning: "warning",
    "Penalty 1": "error",
    "Penalty 2": "error",
    "Penalty 3": "error",
    "No Participation": "error",
  };

  return (
    <Chip
      label={status}
      color={colors[status] || "default"}
      size="small"
      sx={{
        backgroundColor: status === "No Participation" ? "#d32f2f" : undefined,
        color: status === "No Participation" ? "#ffffff" : undefined,
        fontWeight: status === "No Participation" ? "medium" : undefined,
        '& .MuiChip-label': {
          color: status === "No Participation" ? "#ffffff" : undefined
        }
      }}
    />
  );
};

// Function to render penalty chip
const renderPenalty = (penalty) => {
  const colors = {
    None: "default",
    Pending: "warning",
    Active: "error"
  };

  return (
    <Chip
      label={penalty}
      color={colors[penalty] || "default"}
      size="small"
    />
  );
};

export default function HomeOwnerGrid() {
  const navigate = useNavigate();
  const [homeowners, setHomeowners] = useState([]);
  const [selectedHomeowner, setSelectedHomeowner] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [homeownerToDelete, setHomeownerToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditLogModalOpen, setAuditLogModalOpen] = useState(false);

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "blockNo",
      headerName: "Block",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "lotNo",
      headerName: "Lot",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "phoneNo",
      headerName: "Phone",
      width: 150,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => renderStatus(params?.value || "Active"),
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
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/homeowners`);
      const data = await response.json();
      setHomeowners(data);
    } catch (error) {
      console.error("Error fetching homeowners:", error);
    } finally {
      setLoading(false);
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
          registrationDate: homeowner.registrationDate,
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
      const response = await fetch(`${API_BASE_URL}/homeowners/${homeownerToDelete._id}`, {
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
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<HistoryIcon />}
            onClick={() => setAuditLogModalOpen(true)}
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
          {userRole !== "Treasurer" && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => navigate("/app/registration")}
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
              Add Homeowner
            </Button>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={3} sx={{ width: "100%", justifyContent: "center" }}>
        <Grid xs={12}>
          <DataGrid
            rows={homeowners}
            getRowId={(row) => row._id}
            columns={columns}
            loading={loading}
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
              },
              '& .MuiDataGrid-toolbarContainer': {
                padding: '8px 16px',
                '& .MuiButton-root': {
                  color: '#3B1E54',
                  '&:hover': {
                    backgroundColor: 'rgba(59, 30, 84, 0.04)'
                  }
                }
              },
              '& .MuiDataGrid-quickFilterInput': {
                padding: '4px 8px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                '&:focus': {
                  borderColor: '#3B1E54',
                  outline: 'none'
                }
              }
            }}
            autoHeight
            disableRowSelectionOnClick
            checkboxSelection
            slots={{ 
              toolbar: GridToolbar,
              filterPanel: () => (
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>Filter by Status</Typography>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'all') {
                        // Clear filter
                        setHomeowners(homeowners);
                      } else {
                        // Apply filter
                        const filtered = homeowners.filter(h => h.status === value);
                        setHomeowners(filtered);
                      }
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      width: '200px',
                      color: '#3B1E54'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Warning">Warning</option>
                    <option value="Penalty 1">Penalty 1</option>
                    <option value="Penalty 2">Penalty 2</option>
                    <option value="Penalty 3">Penalty 3</option>
                    <option value="No Participation">No Participation</option>
                  </select>
                </Box>
              )
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { 
                  debounceMs: 500,
                  placeholder: 'Search homeowners...'
                },
                sx: {
                  '& .MuiButton-root': {
                    color: '#3B1E54'
                  }
                }
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

      <HomeownerAuditLogs
        open={auditLogModalOpen}
        onClose={() => setAuditLogModalOpen(false)}
      />
    </Box>
  );
}
