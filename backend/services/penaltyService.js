const { Homeowner, Billing } = require("../models");

// Progressive penalty durations (in milliseconds)
const BASE_PENALTY_DURATION = 5000; // 5 seconds base duration

const PENALTY_STATUSES = {
  0: "Active",
  1: "Warning",
  2: "Danger",
  3: "No Participation",
};

const PENALTY_DESCRIPTIONS = {
  1: "Warning Penalty - Minor violation",
  2: "Danger Penalty - Moderate violation",
  3: "No Participation Penalty - Severe violation",
};

const startPenalty = async (homeownerId) => {
  try {
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) throw new Error("Homeowner not found");

    const billing = await Billing.findOne({ homeownerId });
    if (!billing || billing.dueAmount === 0)
      throw new Error("No due payment found");

    const currentLevel = homeowner.penaltyLevel || 0;

    if (currentLevel >= 3) {
      return {
        message: "Maximum penalty level reached",
        penaltyLevel: 3,
        duration: 5,
      };
    }

    // Immediately update penalty info
    const nextLevel = currentLevel + 1;
    homeowner.penaltyLevel = nextLevel;
    homeowner.penaltyStartTime = new Date();
    homeowner.penaltyStatus = "Pending";
    await homeowner.save();

    // Schedule application of penalty status
    setTimeout(async () => {
      const updatedHomeowner = await Homeowner.findById(homeownerId);
      const updatedBilling = await Billing.findOne({ homeownerId });

      if (
        !updatedHomeowner ||
        !updatedBilling ||
        updatedBilling.dueAmount === 0
      ) {
        // Reset penalty if paid
        updatedHomeowner.penaltyLevel = 0;
        updatedHomeowner.penaltyStartTime = null;
        updatedHomeowner.status = "Active";
        updatedHomeowner.penaltyStatus = "None";
        await updatedHomeowner.save();
        return;
      }

      const level = updatedHomeowner.penaltyLevel;
      updatedHomeowner.status = PENALTY_STATUSES[level];
      updatedHomeowner.penaltyStatus = "Active";
      await updatedHomeowner.save();

      if (level < 3) {
        // Wait before starting next level
        await startPenalty(homeownerId);
      }
    }, BASE_PENALTY_DURATION);

    return {
      message: `Status will change to ${PENALTY_STATUSES[nextLevel]} in 5 seconds`,
      dueTime: new Date(Date.now() + BASE_PENALTY_DURATION),
      penaltyLevel: nextLevel,
      duration: 5,
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
      BASE_PENALTY_DURATION * homeowner.pendingPenaltyLevel;

    if (elapsedTime >= requiredDuration) {
      // Apply the penalty
      homeowner.penaltyLevel = homeowner.pendingPenaltyLevel;
      homeowner.status = PENALTY_STATUSES[homeowner.pendingPenaltyLevel];
      homeowner.penaltyStatus = "Active";

      if (!homeowner.penaltyRecords) {
        homeowner.penaltyRecords = [];
      }

      homeowner.penaltyRecords.push({
        level: homeowner.pendingPenaltyLevel,
        description: PENALTY_DESCRIPTIONS[homeowner.pendingPenaltyLevel],
        appliedAt: new Date(),
        duration: requiredDuration / 60000, // in minutes
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

    if (homeowner.penaltyLevel && homeowner.penaltyStartTime) {
      const currentTime = new Date();
      const elapsedTime = currentTime - homeowner.penaltyStartTime;

      if (elapsedTime >= BASE_PENALTY_DURATION) {
        const billing = await Billing.findOne({ homeownerId });

        if (!billing || billing.dueAmount === 0) {
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

const getCurrentPenaltyStatus = (penaltyLevel) => {
  return PENALTY_STATUSES[penaltyLevel] || "Active";
};

module.exports = {
  startPenalty,
  checkAndUpdatePenalty,
  getCurrentPenaltyStatus,
  PENALTY_STATUSES,
  PENALTY_DESCRIPTIONS,
  BASE_PENALTY_DURATION,
};
