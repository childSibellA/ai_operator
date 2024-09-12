import { Customer } from "../../models/Customer.js";

export async function getCustomer(chat_id) {
  try {
    const customer = await Customer.findOne({ chat_id });
    return customer;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return false;
  }
}

export async function createNewCustomer(newCustomer) {
  try {
    const { chat_id, threads_id } = newCustomer;

    // Check if either chat_id or threads_id already exists
    const existingChat = await Customer.findOne({ chat_id });
    const existingThread = await Customer.findOne({ threads_id });

    // Proceed to create a new customer only if both are not found or are empty
    if (!existingChat && !existingThread) {
      const customer = new Customer({
        company_id: "66ca562ee370b0918a63669d",
        operator_id: "66e2381a9f82da4fd0a0b74a",
        threads_id,
        chat_id,
      });

      await customer.save();

      return customer;
    } else {
      console.log(
        "Customer with the same chat_id or threads_id already exists."
      );
      return null; // Return null if customer already exists
    }
  } catch (error) {
    console.error("Error creating new customer:", error);
    return false;
  }
}

export async function editCustomer(threads_id, newDetails) {
  // Combine outputs from newDetails into a single object
  const combinedOutputs = {};

  try {
    // Parse and combine details from newDetails array
    newDetails.forEach((item) => {
      const parsedOutput = JSON.parse(item.output);
      Object.assign(combinedOutputs, parsedOutput);
    });

    const { phone_number, full_name } = combinedOutputs;

    // Check for existing customer records based on phone number or threads_id
    const existingChat = await Customer.findOne({
      "phone_number.number": phone_number,
    });
    const existingThread = await Customer.findOne({ threads_id });

    // Proceed to update if either the phone number or threads_id exists
    if (existingChat || existingThread) {
      // Update the customer record with new details
      const updatedCustomer = await Customer.findOneAndUpdate(
        { threads_id },
        {
          company_id: "66ca562ee370b0918a63669d",
          operator_id: "66e2381a9f82da4fd0a0b74a",
          full_name,
          "phone_number.number": phone_number, // Correct syntax for nested fields
        },
        { new: true, runValidators: true } // Return the updated document and run validators
      );

      if (!updatedCustomer) {
        console.log("Customer not found for the given threads_id.");
        return null; // Return null if the customer wasn't found
      }

      return updatedCustomer; // Return the updated customer document
    } else {
      console.log(
        "No customer found with the provided phone number or threads_id."
      );
      return null; // Return null if neither record exists
    }
  } catch (error) {
    console.error("Error updating customer:", error); // Log the error for debugging
    return false; // Return false in case of any errors
  }
}
