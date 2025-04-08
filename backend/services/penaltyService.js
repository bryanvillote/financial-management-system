const Homeowner = require("../models/Homeowner");

const PENALTY_DURATIONS = {
  1: 2 * 60 * 1000, // 2 minutes in milliseconds
  2: 4 * 60 * 1000, // 4 minutes in milliseconds
  3: 5 * 60 * 1000, // 5 minutes in milliseconds
};

const PENALTY_STATUSES = {
  0: "Active",
  1: "Warning",
  2: "Danger",
  3: "No Participation",
};

const startPenalty = async (homeownerId, penaltyLevel) => {
  try {
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) {
      throw new Error("Homeowner not found");
    }

    // Set the new penalty level and start time
    homeowner.penaltyLevel = penaltyLevel;
    homeowner.penaltyStartTime = new Date();
    homeowner.status = PENALTY_STATUSES[penaltyLevel];

    await homeowner.save();

    // Schedule penalty expiration
    setTimeout(async () => {
      await checkAndUpdatePenalty(homeownerId);
    }, PENALTY_DURATIONS[penaltyLevel]);

    return homeowner;
  } catch (error) {
    console.error("Error starting penalty:", error);
    throw error;
  }
};

const checkAndUpdatePenalty = async (homeownerId) => {
  try {
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner || !homeowner.penaltyStartTime) return;

    const currentTime = new Date();
    const penaltyStartTime = new Date(homeowner.penaltyStartTime);
    const elapsedTime = currentTime - penaltyStartTime;

    // Determine the appropriate penalty level based on elapsed time
    let newPenaltyLevel = 0;
    for (let level = 1; level <= 3; level++) {
      if (elapsedTime >= PENALTY_DURATIONS[level]) {
        newPenaltyLevel = level;
      }
    }

    // If penalty duration has expired, reset to normal
    if (elapsedTime >= PENALTY_DURATIONS[homeowner.penaltyLevel]) {
      homeowner.penaltyLevel = 0;
      homeowner.penaltyStartTime = null;
      homeowner.status = PENALTY_STATUSES[0];
    } else {
      // Update to the next penalty level if applicable
      homeowner.penaltyLevel = newPenaltyLevel;
      homeowner.status = PENALTY_STATUSES[newPenaltyLevel];
    }

    await homeowner.save();
    return homeowner;
  } catch (error) {
    console.error("Error checking penalty:", error);
    throw error;
  }
};

module.exports = {
  startPenalty,
  checkAndUpdatePenalty,
  PENALTY_STATUSES,
  PENALTY_DURATIONS,
};
