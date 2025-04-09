import { Button, Card, Stack, Typography } from "@mui/material";
import { toast } from "mui-sonner";
import { useState } from "react";

export default function PenaltyCard({ selectedHomeowner, onPenaltyApplied }) {
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPenalty = async (penaltyLevel) => {
    if (!selectedHomeowner) return;

    setIsApplying(true);
    try {
      const response = await fetch("http://localhost:8000/penalty/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeownerId: selectedHomeowner._id,
          penaltyLevel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to apply penalty");
      }

      const data = await response.json();

      // Show toast notification
      toast.success(data.message, {
        duration: 5000,
      });

      onPenaltyApplied();
    } catch (error) {
      console.error("Error applying penalty:", error);
      toast.error("Failed to apply penalty");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Apply Penalty
      </Typography>
      {selectedHomeowner ? (
        <>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Selected: {selectedHomeowner.blockNo}-{selectedHomeowner.lotNo}
          </Typography>
          <Stack direction="row" spacing={1} mt={2}>
            <Button
              variant="contained"
              color="warning"
              disabled={isApplying}
              onClick={() => handleApplyPenalty(1)}
            >
              Warning (2m)
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={isApplying}
              onClick={() => handleApplyPenalty(2)}
            >
              Danger (4m)
            </Button>
            <Button
              variant="contained"
              color="secondary"
              disabled={isApplying}
              onClick={() => handleApplyPenalty(3)}
            >
              No Part. (5m)
            </Button>
          </Stack>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Select a homeowner to apply penalty
        </Typography>
      )}
    </Card>
  );
}
