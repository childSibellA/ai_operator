import { chatGPT } from "../services/chatGPT.js";
import { telegramMsgSender } from "../middlewares/telegramMsgSender.js";
import {
  createNewCustomer,
  getCustomer,
} from "../utils/db/customer.handlers.js";

async function chatPreparation(message, messageObj) {
  const chat_id = messageObj.chat.id;
  try {
    let customer = await getCustomer(chat_id);

    if (!customer) {
      const result = await chatGPT(message, "no thread");
      const { threads_id, sms } = result;

      const newCustomer = {
        chat_id,
        threads_id,
      };

      customer = await createNewCustomer(newCustomer);

      // Handle errors in case customer creation fails
      if (!customer) {
        throw new Error("Failed to create new customer.");
      }

      return telegramMsgSender(messageObj, sms);
    } else {
      // Use the existing customer thread
      const result = await chatGPT(message, customer.threads_id);
      const { sms } = result;
      return telegramMsgSender(messageObj, sms);
    }
  } catch (err) {
    console.error("Error handling GPT response:", err);
    return telegramMsgSender(messageObj, "Sorry, something went wrong.");
  }
}

export async function handlerTelegram(req, res) {
  try {
    res.send("POST request handled");
    const { body } = req;
    const messageObj = body.message;
    const messageText = messageObj.text || "";

    await chatPreparation(messageText, messageObj);
  } catch (error) {
    console.error("Error in Telegram handler:", error);
  }
}
