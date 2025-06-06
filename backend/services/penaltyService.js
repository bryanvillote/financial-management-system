const { Homeowner, Billing } = require("../models");
const { STATUS_ENUM } = require("../models/schemas/homeowner.schema");

// Penalty durations in milliseconds (5 seconds for each level)
const PENALTY_INTERVAL = 2592000000; // 30 days

// Map to store active timeouts
const activeTimeouts = new Map();

// Clear existing timeouts for a homeowner
const clearHomeownerTimeouts = (homeownerId) => {
  if (activeTimeouts.has(homeownerId)) {
    clearTimeout(activeTimeouts.get(homeownerId));
    activeTimeouts.delete(homeownerId);
  }
};

// Start automatic penalty cycle for a new homeowner
const startAutomaticPenaltyCycle = async (homeownerId) => {
  try {
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) {
      throw new Error("Homeowner not found");
    }

    // Clear any existing timeouts
    clearHomeownerTimeouts(homeownerId);

    // Ensure homeowner starts with Active status
    homeowner.status = STATUS_ENUM.ACTIVE;
    homeowner.penaltyLevel = 0;
    homeowner.penaltyStatus = "None";
    await homeowner.save();

    // Schedule first warning after 5 seconds
    const warningTimeout = setTimeout(async () => {
      await updateHomeownerStatus(homeownerId, STATUS_ENUM.WARNING, 1);
    }, PENALTY_INTERVAL);

    activeTimeouts.set(homeownerId, warningTimeout);
    return warningTimeout;
  } catch (error) {
    console.error("Error starting automatic penalty cycle:", error);
    throw error;
  }
};

// Update homeowner status and schedule next penalty
const updateHomeownerStatus = async (homeownerId, status, penaltyLevel) => {
  try {
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) {
      throw new Error("Homeowner not found");
    }

    // Update homeowner status
    homeowner.status = status;
    homeowner.penaltyLevel = penaltyLevel;
    homeowner.penaltyStartTime = new Date();
    homeowner.penaltyStatus = "Active";
    await homeowner.save();

    // Schedule next penalty if not at max level
    if (penaltyLevel < 5) {
      const nextLevel = penaltyLevel + 1;
      const nextStatus = getNextPenaltyStatus(nextLevel);
      const nextTimeout = setTimeout(
        () => updateHomeownerStatus(homeownerId, nextStatus, nextLevel),
        PENALTY_INTERVAL
      );
      activeTimeouts.set(homeownerId, nextTimeout);
    }
  } catch (error) {
    console.error("Error updating homeowner status:", error);
    throw error;
  }
};

// Get next penalty status based on level
const getNextPenaltyStatus = (level) => {
  switch (level) {
    case 1:
      return STATUS_ENUM.WARNING;
    case 2:
      return STATUS_ENUM.PENALTY_1;
    case 3:
      return STATUS_ENUM.PENALTY_2;
    case 4:
      return STATUS_ENUM.PENALTY_3;
    case 5:
      return STATUS_ENUM.NO_PARTICIPATION;
    default:
      return STATUS_ENUM.ACTIVE;
  }
};

// Reset penalty cycle when payment is processed
const resetPenaltyCycle = async (homeownerId) => {
  try {
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) {
      throw new Error("Homeowner not found");
    }

    // Clear existing timeouts
    clearHomeownerTimeouts(homeownerId);

    // Reset homeowner status
    homeowner.status = STATUS_ENUM.ACTIVE;
    homeowner.penaltyLevel = 0;
    homeowner.penaltyStartTime = null;
    homeowner.penaltyStatus = "None";
    await homeowner.save();

    // Start new penalty cycle
    return await startAutomaticPenaltyCycle(homeownerId);
  } catch (error) {
    console.error("Error resetting penalty cycle:", error);
    throw error;
  }
};

// Start a new penalty cycle
const startPenaltyCycle = async (homeownerId) => {
  try {
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) {
      throw new Error("Homeowner not found");
    }

    // Clear any existing timeouts
    clearHomeownerTimeouts(homeownerId);

    // Start with Active status
    homeowner.status = STATUS_ENUM.ACTIVE;
    homeowner.penaltyLevel = 0;
    homeowner.penaltyStatus = "Active";
    await homeowner.save();

    // Schedule first warning after 5 seconds
    const warningTimeout = setTimeout(async () => {
      await updateHomeownerStatus(homeownerId, STATUS_ENUM.WARNING, 1);
    }, PENALTY_INTERVAL);

    activeTimeouts.set(homeownerId, warningTimeout);
    return warningTimeout;
  } catch (error) {
    console.error("Error starting penalty cycle:", error);
    throw error;
  }
};

module.exports = {
  startAutomaticPenaltyCycle,
  resetPenaltyCycle,
  clearHomeownerTimeouts,
  updateHomeownerStatus,
  startPenaltyCycle,
  STATUS_ENUM,
};
