const mongoose = require("mongoose");
const { Billing } = require("../models");

async function resetDueAmounts() {
  try {
    await mongoose.connect(process.env.DATABASE_URI);

    // Find all billing records with non-zero due amounts
    const billings = await Billing.find({ dueAmount: { $ne: 0 } });

    // Reset them to 0
    for (const billing of billings) {
      billing.dueAmount = 0;
      await billing.save();
    }

    console.log(`Reset ${billings.length} billing records to 0`);

    mongoose.disconnect();
  } catch (error) {
    console.error("Error resetting due amounts:", error);
  }
}

resetDueAmounts();
