const { Homeowner, Billing, AuditLog } = require("../models");
const User = require("../models/User");
const { startAutomaticPenaltyCycle, clearHomeownerTimeouts } = require("../services/penaltyService");

// Create
const registerHomeowner = async (req, res) => {
  try {
    const { blockNo, lotNo, phoneNo, email, name } = req.body;

    // Validate required fields
    if (!blockNo || !lotNo || !phoneNo || !email || !name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if homeowner already exists
    const existingHomeowner = await Homeowner.findOne({
      $or: [{ email }, { $and: [{ blockNo }, { lotNo }] }],
    });

    if (existingHomeowner) {
      return res.status(400).json({
        success: false,
        message:
          existingHomeowner.email === email
            ? "A homeowner with this email already exists"
            : "A homeowner with this block and lot number already exists",
      });
    }

    // Check if user exists in auth system
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // Create new homeowner
    const homeowner = new Homeowner({
      blockNo,
      lotNo,
      phoneNo,
      email,
      name,
      status: "Active",
    });

    await homeowner.save();

    // Initialize billing record with 0 due amount
    await Billing.create({
      homeownerId: homeowner._id,
      dueAmount: 0,
    });

    // Start automatic penalty cycle for new homeowner
    await startAutomaticPenaltyCycle(homeowner._id);

    // Create audit log
    const auditLog = new AuditLog({
      action: "CREATE",
      entityType: "Homeowner",
      entityId: homeowner._id,
      details: `Created new homeowner: ${homeowner.name}`,
      homeownerName: homeowner.name,
      timestamp: new Date(),
    });
    await auditLog.save();

    res.status(201).json({
      success: true,
      message: "Homeowner registered successfully",
      data: homeowner,
    });
  } catch (error) {
    console.error("Error in registerHomeowner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register homeowner",
      error: error.message,
    });
  }
};

// Read (all)
const getAllHomeowners = async (req, res) => {
  try {
    const homeowners = await Homeowner.find().sort({ createdAt: -1 });
    res.status(200).json(homeowners);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch homeowners",
      error: error.message,
    });
  }
};

// Read (single)
const getHomeownerById = async (req, res) => {
  try {
    const homeowner = await Homeowner.findById(req.params.id);
    if (!homeowner) {
      return res.status(404).json({ 
        success: false,
        message: "Homeowner not found" 
      });
    }

    // Return complete homeowner data including status information
    res.status(200).json({
      success: true,
      data: {
        _id: homeowner._id,
        name: homeowner.name,
        email: homeowner.email,
        blockNo: homeowner.blockNo,
        lotNo: homeowner.lotNo,
        phoneNo: homeowner.phoneNo,
        status: homeowner.status || "Active",
        penaltyLevel: homeowner.penaltyLevel,
        penaltyStatus: homeowner.penaltyStatus,
        createdAt: homeowner.createdAt,
        updatedAt: homeowner.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update
const updateHomeowner = async (req, res) => {
  try {
    const { blockNo, lotNo, phoneNo, email } = req.body;

    // Validate required fields
    if (!blockNo || !lotNo || !phoneNo || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const homeowner = await Homeowner.findByIdAndUpdate(
      req.params.id,
      { blockNo, lotNo, phoneNo, email },
      { new: true, runValidators: true }
    );

    if (!homeowner) {
      return res.status(404).json({
        success: false,
        message: "Homeowner not found",
      });
    }

    // Create audit log
    const auditLog = new AuditLog({
      action: "UPDATE",
      entityType: "Homeowner",
      entityId: homeowner._id,
      details: `Updated homeowner: ${homeowner.name}`,
      homeownerName: homeowner.name,
      timestamp: new Date(),
    });
    await auditLog.save();

    res.status(200).json({
      success: true,
      message: "Homeowner updated successfully",
      data: homeowner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update homeowner",
      error: error.message,
    });
  }
};

// Delete
const deleteHomeowner = async (req, res) => {
  try {
    // First find the homeowner to get their email
    const homeowner = await Homeowner.findById(req.params.id);

    if (!homeowner) {
      return res.status(404).json({
        success: false,
        message: "Homeowner not found",
      });
    }

    // Delete the auth user record if exists
    await User.findOneAndDelete({ email: homeowner.email });

    // Delete the associated billing record
    await Billing.findOneAndDelete({ homeownerId: homeowner._id });

    // Delete the homeowner record
    await Homeowner.findByIdAndDelete(req.params.id);

    // Create audit log before deleting
    const auditLog = new AuditLog({
      action: "DELETE",
      entityType: "Homeowner",
      entityId: homeowner._id,
      details: `Deleted homeowner: ${homeowner.name}`,
      homeownerName: homeowner.name,
      timestamp: new Date(),
    });
    await auditLog.save();

    res.status(200).json({
      success: true,
      message: "Homeowner and all associated records deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete homeowner",
      error: error.message,
    });
  }
};

// Get homeowner by email
const getHomeownerByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const homeowner = await Homeowner.findOne({ email });

    if (!homeowner) {
      return res.status(404).json({
        success: false,
        message: "Homeowner not found",
      });
    }

    // Return all homeowner data
    res.status(200).json({
      success: true,
      data: {
        _id: homeowner._id,
        blockNo: homeowner.blockNo,
        lotNo: homeowner.lotNo,
        phoneNo: homeowner.phoneNo,
        email: homeowner.email,
        status: homeowner.status || "Active",
        penalty: homeowner.penalty || "None",
        createdAt: homeowner.createdAt,
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching homeowner",
      error: error.message,
    });
  }
};

// Start penalty cycle
const startPenaltyCycle = async (req, res) => {
  try {
    const { id } = req.params;
    const homeowner = await Homeowner.findById(id);

    if (!homeowner) {
      return res.status(404).json({
        success: false,
        message: "Homeowner not found",
      });
    }

    // Clear any existing timeouts
    clearHomeownerTimeouts(id);

    // Start the automatic penalty cycle
    await startAutomaticPenaltyCycle(id);

    res.status(200).json({
      success: true,
      message: "Penalty cycle started successfully",
      data: {
        homeownerId: id,
        status: homeowner.status,
        penaltyLevel: homeowner.penaltyLevel,
        penaltyStatus: homeowner.penaltyStatus
      }
    });
  } catch (error) {
    console.error("Error starting penalty cycle:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start penalty cycle",
      error: error.message,
    });
  }
};

// Get audit logs
const getAuditLogs = async (req, res) => {
  try {
    console.log('Fetching audit logs...');
    const auditLogs = await AuditLog.find({ entityType: 'Homeowner' })
      .sort({ timestamp: -1 })
      .limit(100);
    
    console.log('Found audit logs:', auditLogs.length);
    res.status(200).json(auditLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
};

// Export all controller functions
module.exports = {
  registerHomeowner,
  getAllHomeowners,
  getHomeownerById,
  updateHomeowner,
  deleteHomeowner,
  getHomeownerByEmail,
  startPenaltyCycle,
  getAuditLogs
};
