import BlockIcon from "@mui/icons-material/Block";
import DangerousIcon from "@mui/icons-material/Dangerous";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

export default function HomeOwnerPenaltyButton() {
  const [homeowners, setHomeowners] = useState([]);
  const [openPenaltyDialog, setOpenPenaltyDialog] = useState(false);
  const [selectedHomeowner, setSelectedHomeowner] = useState(null);

  const columns = [
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
              : params.value === "Danger"
              ? "error"
              : "default"
          }
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            color="primary"
            onClick={() => handlePenaltyClick(params.row)}
            title="Manage Penalties"
          >
            <WarningIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row._id)}
            title="Delete"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const handlePenaltyClick = (homeowner) => {
    setSelectedHomeowner(homeowner);
    setOpenPenaltyDialog(true);
  };

  const handleApplyPenalty = async (homeownerId, penaltyLevel) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/homeowners/penalty/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ homeownerId, penaltyLevel }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to apply penalty");
      }

      setOpenPenaltyDialog(false);
      fetchHomeowners();
    } catch (error) {
      console.error("Error applying penalty:", error);
      // Add appropriate error handling (e.g., show a snackbar)
    }
  };

  const handleDelete = async (homeownerId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/homeowners/${homeownerId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete homeowner");
      }

      fetchHomeowners();
    } catch (error) {
      console.error("Error deleting homeowner:", error);
      // Add appropriate error handling (e.g., show a snackbar)
    }
  };

  const fetchHomeowners = async () => {
    try {
      const response = await fetch("/api/homeowners");
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
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Add Penalty Dialog Component
  const PenaltyDialog = () => (
    <Dialog
      open={openPenaltyDialog}
      onClose={() => setOpenPenaltyDialog(false)}
    >
      <DialogTitle>Apply Penalty to {selectedHomeowner?.email}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Current Status: {selectedHomeowner?.status}
        </Typography>
        <Stack spacing={2}>
          <Button
            variant="contained"
            color="warning"
            startIcon={<WarningIcon />}
            onClick={() => handleApplyPenalty(selectedHomeowner?._id, 1)}
            fullWidth
          >
            5 secs
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DangerousIcon />}
            onClick={() => handleApplyPenalty(selectedHomeowner?._id, 2)}
            fullWidth
          >
            10 secs
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<BlockIcon />}
            onClick={() => handleApplyPenalty(selectedHomeowner?._id, 3)}
            fullWidth
          >
            15 secs
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenPenaltyDialog(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={homeowners}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row._id}
        disableSelectionOnClick
      />
      <PenaltyDialog />
    </div>
  );
}
