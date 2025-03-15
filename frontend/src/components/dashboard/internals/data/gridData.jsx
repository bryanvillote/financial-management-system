import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";

function renderStatus(status) {
  const colors = {
    Paid: "success",
    Unpaid: "default",
  };

  return <Chip label={status} color={colors[status]} size="small" />;
}

function renderPenalty(penalty) {
  const colors = {
    Penalty_1: "success",
    Penalty_2: "default",
    Penalty_3: "secondary",
    Penalty_4: "error",
  };

  return <Chip label={penalty} color={colors[penalty]} size="small" />;
}

export function renderAvatar(params) {
  if (params.value == null) {
    return "";
  }

  return (
    <Avatar
      sx={{
        backgroundColor: params.value.color,
        width: "24px",
        height: "24px",
        fontSize: "0.85rem",
      }}
    >
      {params.value.name.toUpperCase().substring(0, 1)}
    </Avatar>
  );
}

export const columns = [
  { field: "names", headerName: "Home Owner", flex: 1.5, minWidth: 200 },
  {
    field: "status",
    headerName: "Status",
    flex: 0.5,
    minWidth: 80,
    renderCell: (params) => renderStatus(params.value),
  },
  {
    field: "block",
    headerName: "Block",
    headerAlign: "right",
    align: "right",
    flex: 1,
    minWidth: 80,
  },
  {
    field: "lot",
    headerName: "Lot",
    headerAlign: "right",
    align: "right",
    flex: 1,
    minWidth: 100,
  },
  {
    field: "penalty",
    headerName: "Penalty",
    headerAlign: "right",
    align: "right",
    flex: 1,
    minWidth: 120,
    renderCell: (params) => renderPenalty(params.value),
  },
  {
    field: "due",
    headerName: "Due",
    headerAlign: "right",
    align: "right",
    flex: 1,
    minWidth: 120,
  },
];

export const rows = [
  {
    id: 1,
    names: "Bruce",
    status: "Paid",
    block: 12,
    lot: 1,
    due: "12/01/25",
    penalty: "Penalty 5",
  },
  {
    id: 2,
    names: "Jacky",
    status: "Paid",
    block: 10,
    lot: 5,
    due: "12/02/25",
    penalty: "Penalty 4",
  },
  {
    id: 3,
    names: "Bryan",
    status: "Unpaid",
    block: 2,
    lot: 21,
    due: "12/03/25",
    penalty: "Penalty 3",
  },
  {
    id: 4,
    names: "Jhon",
    status: "Unpaid",
    block: 2,
    lot: 9,
    due: "12/04/25",
    penalty: "Penalty 2",
  },
  {
    id: 5,
    names: "Zerkh",
    status: "Paid",
    block: 7,
    lot: 22,
    due: "12/05/25",
    penalty: "Penalty 1",
  },
];
