import { chatGPT } from "../services/chatGPT.js";
import { Customer } from "../models/Customer.js";
import { telegramMsgSender } from "../middlewares/telegramMsgSender.js";

async function getCustomer(chat_id) {
  try {
    const customer = await Customer.findOne({ chat_id });
    return customer;
  } catch {
    return false;
  }
}

async function getGpt(message, messageObj) {
  const chat_id = messageObj.chat.id;
  try {
    // Await the result of getCustomer since it is an asynchronous function
    let customer = await getCustomer(chat_id);

    if (!customer) {
      // Create a new thread and save the customer
      const result = await chatGPT(message, "no thread");
      const { threads_id, sms } = result;

      // Create a new customer entry
      customer = new Customer({
        threads_id,
        chat_id,
      });

      // Save the new customer to the database
      await customer.save();

      return telegramMsgSender(messageObj, sms);
    } else {
      // Use the existing customer thread
      const result = await chatGPT(message, customer?.threads_id);
      const { sms } = result;
      return telegramMsgSender(messageObj, sms);
    }
  } catch (err) {
    console.error("Error handling GPT response:", err);
    return telegramMsgSender(messageObj, "Sorry, something went wrong.");
  }
}

export async function handlerTelegram(req, res) {
  res.send("POST request handled");
  const { body } = req;
  const messageObj = body.message;
  const messageText = messageObj.text || "";

  getGpt(messageText, messageObj);
}
