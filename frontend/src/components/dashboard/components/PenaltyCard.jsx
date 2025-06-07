import { Button, Card, Stack, Typography } from "@mui/material";
import { toast } from "mui-sonner";
import { useEffect, useState } from "react";

export default function PenaltyCard({ selectedHomeowner, onPenaltyApplied }) {
  const [isApplying, setIsApplying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const calculateNextPenaltyDuration = (currentLevel) => {
    const level = (currentLevel || 0) + 1;
    return 2 + (level - 1) * 2; // in seconds
  };

  useEffect(() => {
    let timer;
    if (
      selectedHomeowner?.penaltyStartTime &&
      selectedHomeowner?.penaltyLevel
    ) {
      const updateTimer = () => {
        const startTime = new Date(
          selectedHomeowner.penaltyStartTime
        ).getTime();
        const duration = 2592000000; // Fixed 30 days for each level
        const endTime = startTime + duration;
        const now = new Date().getTime();
        const remaining = Math.max(0, endTime - now);

        if (remaining > 0) {
          setTimeLeft(Math.ceil(remaining / 1000));
        } else {
          setTimeLeft(null);
          // Fetch updated data when timer expires
          onPenaltyApplied();
        }
      };

      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [selectedHomeowner, onPenaltyApplied]);

  const handleApplyPenalty = async () => {
    if (!selectedHomeowner) return;

    setIsApplying(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:8000/penalty/start/${selectedHomeowner._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to apply penalty");
      }

      const data = await response.json();

      const nextDuration = calculateNextPenaltyDuration(
        selectedHomeowner.penaltyLevel
      );
      toast.success(
        `Penalty process started. Status will update every 5 seconds.`,
        {
          duration: 5000,
        }
      );

      onPenaltyApplied();
    } catch (error) {
      console.error("Error applying penalty:", error);
      toast.error(error.message || "Failed to apply penalty");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Progressive Penalty System
      </Typography>
      {selectedHomeowner ? (
        <>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Selected: Block {selectedHomeowner.blockNo} Lot{" "}
            {selectedHomeowner.lotNo}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Level: {selectedHomeowner.penaltyLevel || 0}
            {timeLeft !== null && ` (${timeLeft}s remaining)`}
          </Typography>
          <Typography variant="body2" color="info.main" gutterBottom>
            Next Penalty:{" "}
            {calculateNextPenaltyDuration(selectedHomeowner.penaltyLevel)}{" "}
            seconds
          </Typography>
          <Stack direction="row" spacing={1} mt={2}>
            <Button
              variant="contained"
              color="error"
              disabled={isApplying || timeLeft !== null}
              onClick={handleApplyPenalty}
              fullWidth
            >
              {timeLeft !== null
                ? `Penalty Active (${timeLeft}s)`
                : "Apply Penalty"}
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
