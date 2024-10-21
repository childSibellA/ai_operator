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

export async function addNewMessage(customer, message, role, image_url) {
  const { chat_id, messages } = customer;
  try {
    const filter = { chat_id };
    const newMessage = {
      role,
      content: message,
      image_url: image_url || "",
    };

    const updatedMessages = [...messages, newMessage];
    const updatedCustomer = await Customer.findOneAndUpdate(
      filter,
      { messages: updatedMessages },
      { new: true, runValidators: true }
    );

    return updatedCustomer;
  } catch (error) {
    console.error("Error adding new message:", error);
    return false;
  }
}

export async function changeCustomerInfo(customer, phone_number, note) {
  const { chat_id } = customer;
  try {
    const filter = { chat_id };
    const updatedCustomer = await Customer.findOneAndUpdate(
      filter,
      {
        note,
        phone_number: {
          code: "+995",
          flag: "ge",
          number: phone_number,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer:", error);
    return false;
  }
}

export async function createNewCustomer(chat_id, company_id) {
  try {
    // Check if either chat_id already exists
    const existingChat = await Customer.findOne({ chat_id });

    console.log(existingChat, "validation");

    // Proceed to create a new customer only if both are not found or are empty
    if (!existingChat && !existingThread) {
      const customer = new Customer({
        company_id,
        operator_id: "66e2381a9f82da4fd0a0b74a",
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

export async function editCustomer(threads_id, newDetails, company_id) {
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
          company_id: company_id,
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
    console.log("Error updating customer:", error); // Log the error for debugging
    return false; // Return false in case of any errors
  }
}
