import { Button, Chip, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

export default function HomeownerDataGrid() {
  const [homeowners, setHomeowners] = useState([]);

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
      width: 250,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="warning"
            size="small"
            onClick={() => handleApplyPenalty(params.row._id, 1)}
          >
            5 secs
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleApplyPenalty(params.row._id, 2)}
          >
            10 secs
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => handleApplyPenalty(params.row._id, 3)}
          >
            15 secs
          </Button>
        </Stack>
      ),
    },
  ];

  const handleApplyPenalty = async (homeownerId, penaltyLevel) => {
    try {
      const response = await fetch(
        "http://localhost:8000/penalty/start", // Updated to match `PenaltyRoutes.jsx`
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

      // Refresh the homeowners list
      fetchHomeowners();
    } catch (error) {
      console.error("Error applying penalty:", error);
    }
  };

  const fetchHomeowners = async () => {
    try {
      const response = await fetch("http://localhost:8000/homeowners"); // Adjusted to real API
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

  return (
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
      checkboxSelection
    />
  );
}
