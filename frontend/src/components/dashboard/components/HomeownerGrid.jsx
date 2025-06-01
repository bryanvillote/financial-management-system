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
import { DataGrid } from "@mui/x-data-grid";
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
      width: 200,
    },
    {
      field: "blockNo",
      headerName: "Block No",
      width: 100,
    },
    {
      field: "lotNo",
      headerName: "Lot No",
      width: 100,
    },
    {
      field: "phoneNo",
      headerName: "Phone No",
      width: 150,
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === "Active"
              ? "success"
              : params.value === "Warning"
              ? "warning"
              : params.value === "Penalty 1"
              ? "error"
              : params.value === "Penalty 2"
              ? "error"
              : params.value === "Penalty 3"
              ? "error"
              : params.value === "No Participation"
              ? "default"
              : "default"
          }
          sx={{
            backgroundColor:
              params.value === "No Participation" ? "#d32f2f" : undefined,
            color: params.value === "No Participation" ? "white" : undefined,
          }}
        />
      ),
    },
    // Only show actions column if user is not a Treasurer
    ...(userRole !== "Treasurer"
      ? [
          {
            field: "actions",
            headerName: "Actions",
            width: 200,
            renderCell: (params) => (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleEdit(params.row)}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleDeleteClick(params.row)}
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
    }, 5000); // Update every 5 seconds instead of 30 seconds

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
    // Include phoneNo in the homeowner data being passed
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
      const response = await fetch(
        `http://localhost:8000/homeowners/${homeownerToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete homeowner");
      }

      // Refresh the homeowners list
      fetchHomeowners();
    } catch (error) {
      console.error("Error deleting homeowner:", error);
    } finally {
      setDeleteDialogOpen(false);
      setHomeownerToDelete(null);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight="medium">
          Home Owners
        </Typography>
        {/* Only show Add Homeowner button if user is not a Treasurer */}
        {userRole !== "Treasurer" && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/app/registration")}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
            }}
          >
            Add Homeowner
          </Button>
        )}
      </Stack>

      <Grid container spacing={3}>
        <Grid xs={12}>
          <DataGrid
            rows={homeowners}
            getRowId={(row) => row._id}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[10]}
            onRowSelectionModelChange={(newSelection) => {
              const selected = homeowners.find(
                (h) => h._id === newSelection[0]
              );
              setSelectedHomeowner(selected);
            }}
            sx={{ minWidth: 800 }}
          />
        </Grid>
      </Grid>

      {/* Add Delete Confirmation Dialog */}
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
            Are you sure you want to delete the homeowner{" "}
            <strong>{homeownerToDelete?.email}</strong> with Block{" "}
            {homeownerToDelete?.blockNo}, Lot {homeownerToDelete?.lotNo}?
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
    </Box>
  );
}
