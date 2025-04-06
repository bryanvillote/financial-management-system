const Homeowner = require("../models/Homeowner");
const User = require("../models/User");

// Create
exports.registerHomeowner = async (req, res) => {
  try {
    const { blockNo, lotNo, phoneNo, email } = req.body;

    // Validate required fields
    if (!blockNo || !lotNo || !phoneNo || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if homeowner already exists
    const existingHomeowner = await Homeowner.findOne({
      $or: [{ email }, { blockNo, lotNo }],
    });

    if (existingHomeowner) {
      return res.status(400).json({
        success: false,
        message:
          "A homeowner with this email or block/lot number already exists",
      });
    }

    // Create new homeowner
    const homeowner = new Homeowner({
      blockNo,
      lotNo,
      phoneNo,
      email,
      status: "Active",
    });

    await homeowner.save();

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
exports.getAllHomeowners = async (req, res) => {
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
exports.getHomeownerById = async (req, res) => {
  try {
    const homeowner = await Homeowner.findById(req.params.id);
    if (!homeowner) {
      return res.status(404).json({ message: "Homeowner not found" });
    }
    res.status(200).json(homeowner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update
exports.updateHomeowner = async (req, res) => {
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
exports.deleteHomeowner = async (req, res) => {
  try {
    // First find the homeowner to get their email
    const homeowner = await Homeowner.findById(req.params.id);

    if (!homeowner) {
      return res.status(404).json({
        success: false,
        message: "Homeowner not found",
      });
    }

    // Delete the auth user record
    await User.findOneAndDelete({ email: homeowner.email });

    // Delete the homeowner record
    await Homeowner.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Homeowner and associated user account deleted successfully",
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

// Add this new controller method
exports.getHomeownerByEmail = async (req, res) => {
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
