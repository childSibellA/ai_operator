const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    chat_id: {
      type: String,
      required: true,
    },
    threads_id: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: false,
    },
    email_address: {
      type: String,
      required: false,
    },
    phone_number: {
      code: { type: String, required: false },
      flag: { type: String, required: false },
      number: { type: String, required: false },
    },
    status: {
      type: String,
      default: "pending",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", CustomerSchema);
