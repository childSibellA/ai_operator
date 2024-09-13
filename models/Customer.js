import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    chat_id: {
      type: String,
      required: false,
    },
    threads_id: {
      type: String,
      required: false,
    },
    telegram_name: {
      type: String,
      required: false,
    },
    messages: [
      {
        role: { type: String, required: false },
        content: { type: String, required: false },
      },
    ],
    full_name: { type: String, required: false },
    gender: {
      type: String,
      enum: ["male", "female", "other"], // Common options, adjust as necessary
    },
    email_address: {
      type: String,
      required: false,
      // unique: true,
      // match: /^\S+@\S+\.\S+$/, // Basic email regex validation
      // trim: true,
    },
    phone_number: {
      code: {
        type: String,
        default: "+995",
        match: /^\+\d{1,3}$/, // Basic validation for country codes
        unique: false,
      },
      flag: {
        type: String,
        default: "ge",
        minLength: 2, // Minimum length for country code flags
        maxLength: 3, // Maximum length for country code flags
      },
      number: {
        type: String,
        required: false,
        unique: false,
        // match: /^\d{9}$/, // Assuming Georgian phone number format
        // trim: true,
      },
    },
    WDYAHAU: {
      type: String,
      enum: ["fb", "instagram", "other"], // Existing options, adjust if needed
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "active", "inactive"], // Add more statuses as needed
    },
    national_ID_number: {
      type: String,
      // trim: true,
      // match: /^\d+$/, // Basic numeric validation, adjust regex for specific format
    },
    connection_dates: [{ type: Date }], // Array of dates
    template_tour: { type: Boolean, default: false },
    note: {
      type: String,
      trim: true,
      maxLength: 500, // Limit note length
    },
    operator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    allocator_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Customer = mongoose.model("Customer", CustomerSchema);
