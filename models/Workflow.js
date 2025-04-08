const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  email: String,
  entry: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Workflow', workflowSchema);

