const { Homeowner, Billing } = require("../models");
const { startAutomaticPenaltyCycle, clearHomeownerTimeouts } = require("../services/penaltyService");
const { STATUS_ENUM } = require("../models/schemas/homeowner.schema");

exports.processPayment = async (req, res) => {
  try {
    const { homeownerId, amount, referenceNumber } = req.body;

    // Validate homeowner exists
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) {
      return res.status(404).json({ message: "Homeowner not found" });
    }

    // Find or create billing record
    let billing = await Billing.findOne({ homeownerId });
    if (!billing) {
      billing = new Billing({ homeownerId, dueAmount: 0 });
    }

    // Add payment to history
    billing.paymentHistory.push({
      date: new Date(),
      amount: parseFloat(amount),
      status: "Completed",
      referenceNo: referenceNumber
    });

    // Update billing
    billing.dueAmount = Math.max(0, billing.dueAmount - parseFloat(amount));
    billing.lastPaymentDate = new Date();
    billing.lastPaymentAmount = parseFloat(amount);
    await billing.save();

    // Reset homeowner status
    homeowner.status = STATUS_ENUM.ACTIVE;
    homeowner.penaltyLevel = 0;
    homeowner.penaltyStatus = "None";
    homeowner.penaltyStartTime = null;
    await homeowner.save();

    // Restart the automatic penalty cycle
    clearHomeownerTimeouts(homeownerId);
    await startAutomaticPenaltyCycle(homeownerId);

    res.status(201).json({
      message: "Payment processed successfully and penalty cycle restarted",
      billing: {
        dueAmount: billing.dueAmount,
        lastPaymentDate: billing.lastPaymentDate,
        lastPaymentAmount: billing.lastPaymentAmount,
        paymentHistory: billing.paymentHistory
      },
      homeowner: {
        ...homeowner.toObject(),
        status: homeowner.status
      },
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Error processing payment", error: error.message });
  }
};

// Get billing info by email
exports.getBillingByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const homeowner = await Homeowner.findOne({ email });

    if (!homeowner) {
      return res.status(404).json({
        success: false,
        message: "Homeowner not found",
      });
    }

    let billing = await Billing.findOne({ homeownerId: homeowner._id });

    // If no billing record exists but there's a last payment, create one
    if (!billing && homeowner.lastPaymentDate) {
      billing = new Billing({
        homeownerId: homeowner._id,
        dueAmount: 0,
        lastPaymentDate: homeowner.lastPaymentDate,
        lastPaymentAmount: homeowner.lastPaymentAmount,
        paymentHistory: [{
          date: homeowner.lastPaymentDate,
          amount: homeowner.lastPaymentAmount,
          status: "Completed",
          referenceNo: "LEGACY-" + Math.random().toString(36).substr(2, 9)
        }]
      });
      await billing.save();
    }

    // If billing exists but no payment history, add the last payment to history
    if (billing && (!billing.paymentHistory || billing.paymentHistory.length === 0) && billing.lastPaymentDate) {
      billing.paymentHistory = [{
        date: billing.lastPaymentDate,
        amount: billing.lastPaymentAmount,
        status: "Completed",
        referenceNo: "LEGACY-" + Math.random().toString(36).substr(2, 9)
      }];
      await billing.save();
    }

    // Transform payment history to match the expected format
    const paymentHistory = billing?.paymentHistory?.map(payment => ({
      amount: payment.amount,
      status: payment.status,
      referenceNumber: payment.referenceNo,
      createdAt: payment.date,
      details: {
        monthlyDue: payment.amount,
        carSticker: 0,
        expenses: 0
      }
    })) || [];

    // Add debug logging
    console.log("Billing record:", billing);
    console.log("Payment History before transform:", billing?.paymentHistory);
    console.log("Payment History after transform:", paymentHistory);

    const response = {
      success: true,
      data: {
        dueAmount: billing?.dueAmount || 0,
        lastPaymentDate: billing?.lastPaymentDate || null,
        lastPaymentAmount: billing?.lastPaymentAmount || null,
        isPaid: billing ? billing.dueAmount === 0 : true,
        paymentHistory: paymentHistory
      }
    };

    console.log("Final response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error fetching billing info:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
