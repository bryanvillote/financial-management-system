const { Homeowner, Billing } = require("../models");

const billingService = {
  async getBillingInfo(homeownerId) {
    const billing = await Billing.findOne({ homeownerId }).populate(
      "homeownerId"
    );
    if (!billing) {
      // Create a new billing record if none exists
      const homeowner = await Homeowner.findById(homeownerId);
      if (!homeowner) {
        throw new Error("Homeowner not found");
      }
      const newBilling = await Billing.create({
        homeownerId,
        dueAmount: 0,
      });
      return {
        _id: homeowner._id,
        name: homeowner.name,
        email: homeowner.email,
        dueAmount: newBilling.dueAmount,
      };
    }
    return {
      _id: billing.homeownerId._id,
      name: billing.homeownerId.name,
      email: billing.homeownerId.email,
      dueAmount: billing.dueAmount,
    };
  },

  async getAllBillingInfo() {
    const homeowners = await Homeowner.find();
    const billingPromises = homeowners.map(async (homeowner) => {
      const billing = await Billing.findOne({ homeownerId: homeowner._id });
      return {
        _id: homeowner._id,
        name: homeowner.name,
        email: homeowner.email,
        dueAmount: billing ? billing.dueAmount : 0,
      };
    });
    return Promise.all(billingPromises);
  },

  async processPayment(homeownerId, amount) {
    let billing = await Billing.findOne({ homeownerId });
    if (!billing) {
      billing = await Billing.create({
        homeownerId,
        dueAmount: 0,
      });
    }

    billing.dueAmount = Math.max(0, billing.dueAmount - amount);
    billing.lastPaymentDate = new Date();
    billing.lastPaymentAmount = amount;
    await billing.save();

    return {
      homeownerId,
      amountPaid: amount,
      remainingBalance: billing.dueAmount,
    };
  },
};

module.exports = billingService;
