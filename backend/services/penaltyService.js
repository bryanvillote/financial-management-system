const { Homeowner, Billing } = require("../models");
const { STATUS_ENUM } = require("../models/schemas/homeowner.schema");

// Penalty durations in milliseconds
const PENALTY_INTERVALS = {
  WARNING: 30 * 24 * 60 * 60 * 1000,    // 30 days
  PENALTY_1: 60 * 24 * 60 * 60 * 1000,  // 60 days
  PENALTY_2: 90 * 24 * 60 * 60 * 1000,  // 90 days
  PENALTY_3: 120 * 24 * 60 * 60 * 1000, // 120 days
  NO_PARTICIPATION: 150 * 24 * 60 * 60 * 1000 // 150 days
};

// Map to store active timeouts
const activeTimeouts = new Map();

// Clear existing timeouts for a homeowner
const clearHomeownerTimeouts = (homeownerId) => {
  if (activeTimeouts.has(homeownerId)) {
    clearTimeout(activeTimeouts.get(homeownerId));
    activeTimeouts.delete(homeownerId);
  }
};

// Calculate next penalty based on registration date
const calculateNextPenalty = async (homeownerId) => {
  const homeowner = await Homeowner.findById(homeownerId);
  if (!homeowner || !homeowner.registrationDate) {
    return { status: STATUS_ENUM.ACTIVE, level: 0 };
  }

  const now = new Date();
  const timeSinceRegistration = now - new Date(homeowner.registrationDate);

  if (timeSinceRegistration >= PENALTY_INTERVALS.NO_PARTICIPATION) {
    return { status: STATUS_ENUM.NO_PARTICIPATION, level: 5 };
  } else if (timeSinceRegistration >= PENALTY_INTERVALS.PENALTY_3) {
    return { status: STATUS_ENUM.PENALTY_3, level: 4 };
  } else if (timeSinceRegistration >= PENALTY_INTERVALS.PENALTY_2) {
    return { status: STATUS_ENUM.PENALTY_2, level: 3 };
  } else if (timeSinceRegistration >= PENALTY_INTERVALS.PENALTY_1) {
    return { status: STATUS_ENUM.PENALTY_1, level: 2 };
  } else if (timeSinceRegistration >= PENALTY_INTERVALS.WARNING) {
    return { status: STATUS_ENUM.WARNING, level: 1 };
  } else {
    return { status: STATUS_ENUM.ACTIVE, level: 0 };
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

    // Calculate initial penalty status based on registration date
    const { status, level } = await calculateNextPenalty(homeownerId);
    
    // Update homeowner status
    homeowner.status = status;
    homeowner.penaltyLevel = level;
    homeowner.penaltyStatus = "Active";
    await homeowner.save();

    // Schedule next penalty check
    const nextCheck = setTimeout(async () => {
      await updateHomeownerStatus(homeownerId);
    }, 24 * 60 * 60 * 1000); // Check every 24 hours

    activeTimeouts.set(homeownerId, nextCheck);
    return nextCheck;
  } catch (error) {
    console.error("Error starting automatic penalty cycle:", error);
    throw error;
  }
};

// Update homeowner status based on registration date
const updateHomeownerStatus = async (homeownerId) => {
  try {
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) {
      throw new Error("Homeowner not found");
    }

    // Calculate new penalty status
    const { status, level } = await calculateNextPenalty(homeownerId);

    // Update homeowner status
    homeowner.status = status;
    homeowner.penaltyLevel = level;
    await homeowner.save();

    // Schedule next check
    const nextCheck = setTimeout(async () => {
      await updateHomeownerStatus(homeownerId);
    }, 24 * 60 * 60 * 1000); // Check every 24 hours

    activeTimeouts.set(homeownerId, nextCheck);
  } catch (error) {
    console.error("Error updating homeowner status:", error);
    throw error;
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
    homeowner.penaltyStatus = "None";
    await homeowner.save();

    // Start new penalty cycle
    return await startAutomaticPenaltyCycle(homeownerId);
  } catch (error) {
    console.error("Error resetting penalty cycle:", error);
    throw error;
  }
};

module.exports = {
  startAutomaticPenaltyCycle,
  resetPenaltyCycle,
  clearHomeownerTimeouts,
  updateHomeownerStatus,
  STATUS_ENUM,
};
