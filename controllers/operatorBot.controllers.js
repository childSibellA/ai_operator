import { chatGPT } from "../services/chatGPT.js";
import { telegramMsgSender } from "../middlewares/telegramMsgSender.js";
import {
  callTypingAPI,
  facebookMsgSender,
} from "../middlewares/facebookMsgSender.js";
import {
  createNewCustomer,
  getCustomer,
} from "../utils/db/customer.handlers.js";

// messageColector remains a string
let messageColector = "";

// Utility function to create a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function chatPreparation(message, chat_id) {
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

      if (!customer) {
        throw new Error("Failed to create new customer.");
      }

      return sms;
    } else {
      const result = await chatGPT(message, customer.threads_id);
      const { sms } = result;
      console.log(sms);
      return sms;
    }
  } catch (err) {
    console.error("Error handling GPT response:", err);
    // return "Sorry, something went wrong.";
  }
}

export async function handlerTelegram(req, res) {
  try {
    res.send("POST request handled");
    const { body } = req;
    const messageObj = body.message;
    const messageText = messageObj.text || "";

    // Append the new message to the messageColector string
    messageColector += messageText;

    // Await the delay of 2000 milliseconds (2 seconds)
    await delay(2000);

    // Check if the messageColector has accumulated text
    if (messageColector.length > 0) {
      const assistantResponse = await chatPreparation(
        messageColector,
        messageObj.chat.id
      );
      await telegramMsgSender(messageObj, assistantResponse);

      // Clear the messageColector after processing
      messageColector = "";
    }
  } catch (error) {
    console.error("Error in Telegram handler:", error);
    res.status(500).send("Error handling Telegram request.");
  }
}

export async function handlerFacebook(req, res) {
  console.log("req", req.body);
  // console.log("req", req.body?.entry[0]?.messaging);
  // console.log("req", req.body?.entry[0]);
  // console.log("req", req.query);
  // console.log("read", req.body?.entry[0]?.messaging[0]?.read?.watermark);
  try {
    const { body } = req;

    if (body.object === "page" && body.entry && body.entry[0].messaging) {
      const webhookEvent = body.entry[0].messaging[0];
      const chat_id = webhookEvent.sender.id;
      const newMessage = webhookEvent.message?.text || "";
      await callTypingAPI(chat_id, "mark_seen");
      await callTypingAPI(chat_id, "typing_on");

      if (newMessage) {
        // Await the delay of 2000 milliseconds (2 seconds)
        const assistantResponse = await chatPreparation(newMessage, chat_id);
        await delay(2000);

        // Process the new message through chatPreparation
        await facebookMsgSender(chat_id, assistantResponse);
        await callTypingAPI(chat_id, "typing_off");
      } else {
        console.log(webhookEvent, "webhook");
      }
      res.status(200).send("EVENT_RECEIVED");
    } else {
      res.status(404).send("Event not from a page subscription");
    }
  } catch (error) {
    console.error("Error in Facebook handler:", error);
    res.status(500).send("Error handling Facebook request.");
  }
}
