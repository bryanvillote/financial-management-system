import AddIcon from "@mui/icons-material/Add";
import { Chip } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeownerStats from "./HomeownerStats";

export default function HomeOwnerGrid() {
  const navigate = useNavigate();
  const [homeowners, setHomeowners] = useState([]);
  const [selectedHomeowner, setSelectedHomeowner] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const columns = [
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
      width: 400,
      renderCell: (params) => getActions(params),
    },
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
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, []);

  // Customize actions based on role
  const getActions = (params) => {
    if (userRole === "Treasurer") {
      return (
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleViewDetails(params.row)}
          >
            View Details
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleSendNotification(params.row)}
          >
            Send Notification
          </Button>
        </Stack>
      );
    }

    // Return full actions for President and Vice President
    return (
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          onClick={() => handleViewDetails(params.row)}
        >
          View Details
        </Button>
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
          onClick={() => handleDelete(params.row.id)}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => handleSendNotification(params.row)}
        >
          Send Notification
        </Button>
      </Stack>
    );
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
      </Stack>

      <Grid container spacing={3}>
        <Grid xs={12} lg={9}>
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
        <Grid xs={12} lg={3}>
          <HomeownerStats
            selectedHomeowner={selectedHomeowner}
            onPenaltyApplied={fetchHomeowners}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
