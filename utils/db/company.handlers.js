import { Company } from "../../models/Company.js";

export async function getCompany(recipient_id) {
  try {
    const company = await Company.findOne({ fb_chat_id: recipient_id });
    if (company) {
      return company;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching company:", error);
    return false;
  }
}
