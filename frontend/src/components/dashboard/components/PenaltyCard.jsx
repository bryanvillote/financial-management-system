import { Button, Card, Stack, Typography } from "@mui/material";
import { toast } from "mui-sonner";
import { useEffect, useState } from "react";

export default function PenaltyCard({ selectedHomeowner, onPenaltyApplied }) {
  const [isApplying, setIsApplying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const calculateTimeUntilNextPenalty = (registrationDate, currentLevel) => {
    const now = new Date();
    const regDate = new Date(registrationDate);
    const daysSinceRegistration = Math.floor((now - regDate) / (1000 * 60 * 60 * 24));
    
    const penaltyThresholds = {
      0: 30,  // Warning at 30 days
      1: 60,  // Penalty 1 at 60 days
      2: 90,  // Penalty 2 at 90 days
      3: 120, // Penalty 3 at 120 days
      4: 150  // No Participation at 150 days
    };

    const nextThreshold = penaltyThresholds[currentLevel] || 150;
    const daysUntilNext = nextThreshold - daysSinceRegistration;
    
    return Math.max(0, daysUntilNext);
  };

  useEffect(() => {
    let timer;
    if (selectedHomeowner?.registrationDate && selectedHomeowner?.penaltyLevel !== undefined) {
      const updateTimer = () => {
        const daysLeft = calculateTimeUntilNextPenalty(
          selectedHomeowner.registrationDate,
          selectedHomeowner.penaltyLevel
        );

        if (daysLeft > 0) {
          setTimeLeft(daysLeft);
        } else {
          setTimeLeft(null);
          // Fetch updated data when timer expires
          onPenaltyApplied();
        }
      };

      updateTimer();
      timer = setInterval(updateTimer, 24 * 60 * 60 * 1000); // Update every 24 hours
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [selectedHomeowner, onPenaltyApplied]);

  const getPenaltyDescription = (level) => {
    switch (level) {
      case 0:
        return "Active";
      case 1:
        return "Warning (30 days)";
      case 2:
        return "Penalty 1 (60 days)";
      case 3:
        return "Penalty 2 (90 days)";
      case 4:
        return "Penalty 3 (120 days)";
      case 5:
        return "No Participation (150 days)";
      default:
        return "Active";
    }
  };

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
            Registration Date: {new Date(selectedHomeowner.registrationDate).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Status: {getPenaltyDescription(selectedHomeowner.penaltyLevel)}
            {timeLeft !== null && ` (${timeLeft} days until next level)`}
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
                ? `Penalty Active (${timeLeft} days)`
                : "Apply Penalty"}
            </Button>
          </Stack>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Select a homeowner to view penalty status
        </Typography>
      )}
    </Card>
  );
}
