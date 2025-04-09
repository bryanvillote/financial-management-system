const mongoose = require("mongoose");
const homeownerSchema = require("./homeowner.schema");

// Only create the model if it hasn't been registered
const Homeowner =
  mongoose.models.Homeowner || mongoose.model("Homeowner", homeownerSchema);

module.exports = {
  Homeowner,
};
