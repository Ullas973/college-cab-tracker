const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  phone: { type: String, required: true },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Driver", driverSchema);
