import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

const StyledPaper = styled(Paper)(({ theme }) => ({
  height: "calc(100vh - 200px)",
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow:
    "hsla(220, 60.00%, 2.00%, 0.12) 0px 8px 30px 0px, hsla(222, 25.50%, 10.00%, 0.06) 0px 10px 25px -5px",
}));

function renderStatus(status) {
  const colors = {
    Paid: "success",
    Unpaid: "default",
    Active: "success",
    Inactive: "default",
  };

  return (
    <Chip label={status} color={colors[status] || "default"} size="small" />
  );
}

function renderPenalty(penalty) {
  const colors = {
    Penalty_1: "success",
    Penalty_2: "warning",
    Penalty_3: "secondary",
    Penalty_4: "error",
    None: "default",
  };

  return (
    <Chip label={penalty} color={colors[penalty] || "default"} size="small" />
  );
}

export default function HomeownerDataGrid() {
  const [homeowners, setHomeowners] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
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
      renderCell: (params) => renderStatus(params.value || "Active"),
    },
    {
      field: "penalty",
      headerName: "Penalty",
      width: 130,
      renderCell: (params) => renderPenalty(params.value || "None"),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 120,
      valueGetter: () => {
        return new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      },
    },
  ];

  const fetchHomeowners = async () => {
    try {
      const response = await fetch("http://localhost:8000/homeowners");
      if (!response.ok) {
        throw new Error("Failed to fetch homeowners");
      }
      const data = await response.json();

      // Transform the data
      const homeownersWithId = data.map((homeowner) => ({
        id: homeowner._id,
        blockNo: homeowner.blockNo,
        lotNo: homeowner.lotNo,
        email: homeowner.email,
        phoneNo: homeowner.phoneNo,
        status: homeowner.status || "Active",
        penalty: homeowner.penalty || "None",
        dueDate: new Date().toLocaleDateString(),
      }));

      setHomeowners(homeownersWithId);
    } catch (error) {
      console.error("Error fetching homeowners:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and set up refresh interval
  useEffect(() => {
    fetchHomeowners();
    const interval = setInterval(fetchHomeowners, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <StyledPaper elevation={0}>
      <DataGrid
        rows={homeowners}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        disableSelectionOnClick
        loading={loading}
        autoHeight
        initialState={{
          sorting: {
            sortModel: [{ field: "blockNo", sort: "asc" }],
          },
          pagination: {
            pageSize: 10,
          },
        }}
        sx={{
          border: "none",
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "rgba(59, 30, 84, 0.08)",
            borderRadius: "16px 16px 0 0",
          },
          "& .MuiDataGrid-virtualScroller": {
            marginTop: "46px !important",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "rgba(59, 30, 84, 0.04)",
          },
        }}
      />
    </StyledPaper>
  );
}
