import { Button } from "@mui/material";
import { toast } from "mui-sonner";
import { useState } from "react";
import { API_URL, getAuthHeaders } from '../../../utils/api';

export default function HomeOwnerPenaltyButton({ homeowner, onPenaltyApplied }) {
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPenalty = async () => {
    if (!homeowner) return;

    setIsApplying(true);
    try {
      const response = await fetch(`${API_URL}/penalty/start/${homeowner._id}`, {
        method: "POST",
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to apply penalty");
      }

      toast.success("Penalty process started. Status will update every 5 seconds.");
      onPenaltyApplied();
    } catch (error) {
      console.error("Error applying penalty:", error);
      toast.error(error.message || "Failed to apply penalty");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="error"
      disabled={isApplying}
      onClick={handleApplyPenalty}
      size="small"
    >
      {isApplying ? "Applying..." : "Apply Penalty"}
    </Button>
  );
} 