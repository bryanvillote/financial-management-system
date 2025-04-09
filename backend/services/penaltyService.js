const { Homeowner } = require("../models");

const PENALTY_DURATIONS = {
  1: 2 * 60 * 1000, // 2 minutes in milliseconds
  2: 4 * 60 * 1000, // 4 minutes
  3: 5 * 60 * 1000, // 5 minutes
};

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

const startPenalty = async (homeownerId, penaltyLevel) => {
  try {
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) {
      throw new Error("Homeowner not found");
    }

    // Set pending penalty status
    homeowner.pendingPenaltyLevel = penaltyLevel;
    homeowner.penaltyStartTime = new Date();
    homeowner.penaltyStatus = "Pending";

    await homeowner.save();

    // Schedule the penalty application
    setTimeout(async () => {
      await applyPendingPenalty(homeownerId);
    }, PENALTY_DURATIONS[penaltyLevel]);

    // Return message for notification
    const minutes = PENALTY_DURATIONS[penaltyLevel] / 60000;
    return {
      message: `Penalty will be reflected in the homeowner's account after ${minutes} minutes`,
      dueTime: new Date(Date.now() + PENALTY_DURATIONS[penaltyLevel]),
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
    const requiredDuration = PENALTY_DURATIONS[homeowner.pendingPenaltyLevel];

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
        duration: PENALTY_DURATIONS[homeowner.pendingPenaltyLevel] / 60000, // in minutes
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

    // First check if there's a pending penalty to apply
    if (homeowner.pendingPenaltyLevel) {
      const result = await applyPendingPenalty(homeownerId);
      if (result) {
        return result;
      }
    }

    // Then check if current penalty should be cleared
    if (homeowner.penaltyLevel && homeowner.penaltyStartTime) {
      const elapsedTime = Date.now() - homeowner.penaltyStartTime.getTime();
      const penaltyDuration = PENALTY_DURATIONS[homeowner.penaltyLevel];

      if (elapsedTime >= penaltyDuration) {
        // Reset penalty
        homeowner.penaltyLevel = 0;
        homeowner.penaltyStartTime = null;
        homeowner.status = PENALTY_STATUSES[0];
        homeowner.penaltyStatus = "None";
        return await homeowner.save();
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
  PENALTY_DURATIONS,
  PENALTY_DESCRIPTIONS,
};
