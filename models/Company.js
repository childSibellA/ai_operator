import mongoose from "mongoose";

const CompanySchema = mongoose.Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: false, unique: true, index: true }, // Indexed and set to unique
    address: { type: String, required: false },
    registration_id: { type: String, required: false, index: true }, // Indexed for better query performance
    registration_name: { type: String, required: false },
    logo: { type: String, required: false },
    main_logo: { type: String },
    ring_logo: { type: String },
    invoice_logo: { type: String, required: false },
    invoice_logo_background: { type: String, required: false },
    web_page: { type: String, required: false },
    fb_chat_id: { type: String, required: false },
    openai_api_key: { type: String, required: false },
    organization_id: { type: String, required: false },
    project_id: { type: String, required: false },
    assistant_id: { type: String, required: false },
    page_access_token: { type: String, required: false },
    phone_number: {
      code: { type: String, default: "+995" },
      flag: { type: String, default: "ge" },
      number: { type: String, required: false, match: /^[0-9]{9}$/ }, // Pattern for 9-digit numbers
    },
    system_instructions: {
      role: { type: String, default: "" },
      content: [
        {
          type: {
            type: String,
            required: false,
          },
          text: { type: String, required: false },
        },
      ],
    },
    payment_methods: [
      {
        bank_name: { type: String, required: false },
        account_number: { type: String, required: false },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    bot_active: {
      type: Boolean,
      default: true,
    },
    sections: {
      customers: Boolean,
      expenses: Boolean,
      invoices: Boolean,
      orders: Boolean,
      services: Boolean,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Creating the model from the schema
export const Company = mongoose.model("Company", CompanySchema);
