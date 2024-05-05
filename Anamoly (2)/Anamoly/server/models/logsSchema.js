const mongoose = require("mongoose");

// Define log schema
const logSchema = new mongoose.Schema({
    level: String,
    message: String,
    source: String,
    timestamp: String,
    label: Number
  }, {collection: "log_data"});
  
  // Create a model for the log data collection
  const Log = mongoose.model('log_data', logSchema);

  module.exports = Log;