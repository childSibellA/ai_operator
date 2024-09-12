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

    const customer = new Customer({
      company_id: "66ca562ee370b0918a63669d",
      threads_id,
      chat_id,
    });

    await customer.save();

    return customer;
  } catch (error) {
    console.error("Error creating new customer:", error);
    return false;
  }
}

export async function editCustomer(threads_id, newDetails) {
  // Combine outputs from newDetails
  const combinedOutputs = {};

  newDetails.forEach((item) => {
    const parsedOutput = JSON.parse(item.output);
    Object.assign(combinedOutputs, parsedOutput);
  });

  const { phone_number, full_name } = combinedOutputs;

  try {
    // Update customer with new details
    const updatedCustomer = await Customer.findOneAndUpdate(
      { threads_id },
      {
        full_name,
        "phone_number.number": phone_number, // Correct syntax for updating nested fields
      },
      { new: true, runValidators: true } // Ensure the updated document is returned and validation is run
    );

    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer:", error); // Log the error for debugging purposes
    return false;
  }
}
