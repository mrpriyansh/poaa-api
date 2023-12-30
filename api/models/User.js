const mongoose = require('mongoose');

const User = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  pAccountNo: {
    type: String,
  },
  pPassword: {
    type: String,
  },
  password: {
    type: String,
  },
  mobile: {
    type: Number,
  },
  userType: {
    type: String,
  },
  test: {
    type: String,
  },
});

module.exports = mongoose.model('Users', User);
