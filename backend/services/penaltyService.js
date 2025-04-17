const { Homeowner, Billing } = require("../models");

// Progressive penalty durations (in milliseconds)
const BASE_PENALTY_DURATION = 10000; // 10 seconds base duration
const PENALTY_INCREMENT = 10000; // 10 seconds increment

const PENALTY_STATUSES = {
  1: "Warning",
  2: "Danger",
  3: "No Participation",
  0: "Active",
};

const PENALTY_DESCRIPTIONS = {
  1: "Warning Penalty - Minor violation",
  2: "Danger Penalty - Moderate violation",
  3: "No Participation Penalty - Severe violation",
};

const startPenalty = async (homeownerId) => {
  try {
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) {
      throw new Error("Homeowner not found");
    }

    // Get current billing status
    const billing = await Billing.findOne({ homeownerId });
    if (!billing || billing.dueAmount === 0) {
      throw new Error("No due payment found");
    }

    // Calculate next penalty level
    const currentLevel = homeowner.penaltyLevel || 0;
    const nextLevel = currentLevel + 1;
    const penaltyDuration =
      BASE_PENALTY_DURATION + (nextLevel - 1) * PENALTY_INCREMENT;

    // Set penalty status
    homeowner.penaltyLevel = nextLevel;
    homeowner.penaltyStartTime = new Date();
    homeowner.status = PENALTY_STATUSES[Math.min(nextLevel, 3)]; // Cap at level 3 status
    homeowner.penaltyStatus = "Active";

    await homeowner.save();

    // Schedule the next penalty check
    setTimeout(async () => {
      try {
        // Check if payment has been made
        const currentBilling = await Billing.findOne({ homeownerId });
        if (currentBilling && currentBilling.dueAmount > 0) {
          // If still unpaid, start next penalty level
          await startPenalty(homeownerId);
        } else {
          // If paid, reset penalty
          const homeowner = await Homeowner.findById(homeownerId);
          if (homeowner) {
            homeowner.penaltyLevel = 0;
            homeowner.penaltyStartTime = null;
            homeowner.status = "Active";
            homeowner.penaltyStatus = "None";
            await homeowner.save();
          }
        }
      } catch (error) {
        console.error("Error in penalty progression:", error);
      }
    }, penaltyDuration);

    // Return message for notification
    const seconds = penaltyDuration / 1000;
    return {
      message: `Penalty level ${nextLevel} applied for ${seconds} seconds`,
      dueTime: new Date(Date.now() + penaltyDuration),
      penaltyLevel: nextLevel,
      duration: seconds,
    };
  } catch (error) {
    throw new Error(`Error starting penalty: ${error.message}`);
  }
};

const applyPendingPenalty = async (homeownerId) => {
  try {
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner || !homeowner.pendingPenaltyLevel) {
      return null;
    }

    const elapsedTime = Date.now() - homeowner.penaltyStartTime.getTime();
    const requiredDuration =
      BASE_PENALTY_DURATION +
      (homeowner.pendingPenaltyLevel - 1) * PENALTY_INCREMENT;

    if (elapsedTime >= requiredDuration) {
      // Apply the penalty
      homeowner.penaltyLevel = homeowner.pendingPenaltyLevel;
      homeowner.status = PENALTY_STATUSES[homeowner.pendingPenaltyLevel];
      homeowner.penaltyStatus = "Active";

      // Add penalty to receipt records
      if (!homeowner.penaltyRecords) {
        homeowner.penaltyRecords = [];
      }

      homeowner.penaltyRecords.push({
        level: homeowner.pendingPenaltyLevel,
        description: PENALTY_DESCRIPTIONS[homeowner.pendingPenaltyLevel],
        appliedAt: new Date(),
        duration:
          (BASE_PENALTY_DURATION +
            (homeowner.pendingPenaltyLevel - 1) * PENALTY_INCREMENT) /
          60000, // in minutes
      });

      homeowner.pendingPenaltyLevel = null;

      return await homeowner.save();
    }

    return null;
  } catch (error) {
    throw new Error(`Error applying penalty: ${error.message}`);
  }
};

const checkAndUpdatePenalty = async (homeownerId) => {
  try {
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) {
      throw new Error("Homeowner not found");
    }

    // Check if there's an active penalty
    if (homeowner.penaltyLevel && homeowner.penaltyStartTime) {
      const currentTime = new Date();
      const penaltyDuration =
        BASE_PENALTY_DURATION +
        (homeowner.penaltyLevel - 1) * PENALTY_INCREMENT;

      const elapsedTime = currentTime - homeowner.penaltyStartTime;

      // If penalty duration has passed, check billing status
      if (elapsedTime >= penaltyDuration) {
        const billing = await Billing.findOne({ homeownerId });

        if (!billing || billing.dueAmount === 0) {
          // Reset penalty if paid
          homeowner.penaltyLevel = 0;
          homeowner.penaltyStartTime = null;
          homeowner.status = "Active";
          homeowner.penaltyStatus = "None";
          await homeowner.save();
        }
      }
    }

    return homeowner;
  } catch (error) {
    throw new Error(`Error checking penalty: ${error.message}`);
  }
};

module.exports = {
  startPenalty,
  checkAndUpdatePenalty,
  PENALTY_STATUSES,
  PENALTY_DESCRIPTIONS,
  BASE_PENALTY_DURATION,
  PENALTY_INCREMENT,
};
