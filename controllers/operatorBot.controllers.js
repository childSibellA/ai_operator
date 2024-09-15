import { chatGPT } from "../services/chatGPT.js";
import { getCompany } from "../utils/db/company.handlers.js";
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

async function chatPreparation(message, chat_id, recipient_id, company) {
  try {
    const { assistant_id, _id } = company;

    let customer = await getCustomer(chat_id);

    if (!customer) {
      const result = await chatGPT(message, "no thread", assistant_id, _id);
      const { threads_id, sms } = result;

      const newCustomer = {
        chat_id,
        threads_id,
        company_id: _id,
      };

      customer = await createNewCustomer(newCustomer);

      if (!customer) {
        throw new Error("Failed to create new customer.");
      }

      return sms;
    } else {
      const result = await chatGPT(
        message,
        customer.threads_id,
        assistant_id,
        _id
      );
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
    const chat_id = messageObj.chat.id;
    const messageText = messageObj.text || "";
    console.log(body, "body");
    // Append the new message to the messageColector string
    messageColector += messageText;

    // Await the delay of 2000 milliseconds (2 seconds)
    // await delay(2000);

    // // Check if the messageColector has accumulated text
    // if (messageColector.length > 0) {
    //   const assistantResponse = await chatPreparation(
    //     messageColector,
    //     messageObj.chat.id
    //   );
    //   await telegramMsgSender(chat_id, assistantResponse);

    //   // Clear the messageColector after processing
    //   messageColector = "";
    // }
  } catch (error) {
    console.error("Error in Telegram handler:", error);
    res.status(500).send("Error handling Telegram request.");
  }
}

export async function handlerFacebook(req, res) {
  res.status(200).send("EVENT_RECEIVED");
  console.log("req", req.body);
  // console.log("read", req.body?.entry[0]?.messaging[0]?.read?.watermark);
  try {
    const { body } = req;

    if (body.object === "page" && body.entry && body.entry[0].messaging) {
      const webhookEvent = body.entry[0].messaging[0];
      console.log(webhookEvent, "webhook");
      const chat_id = webhookEvent.sender.id;
      const recipient_id = webhookEvent.recipient.id;
      let company = await getCompany(recipient_id);
      // if (company) {
      const { page_access_token } = company;

      const newMessage = webhookEvent.message?.text || "";
      await callTypingAPI(chat_id, "mark_seen", page_access_token);
      await callTypingAPI(chat_id, "typing_on", page_access_token);

      if (newMessage) {
        // Await the delay of 2000 milliseconds (2 seconds)
        const assistantResponse = await chatPreparation(
          newMessage,
          chat_id,
          recipient_id,
          company
        );
        await delay(2000);
        if (assistantResponse && page_access_token) {
          await facebookMsgSender(
            chat_id,
            assistantResponse,
            page_access_token
          );
          await callTypingAPI(chat_id, "typing_off", page_access_token);
        }
        // Process the new message through chatPreparation
      } else {
        console.log(webhookEvent, "webhook");
      }
      // } else {
      //   console.log(`new user ID is ${recipient_id}`);
      // }
    } else {
      res.status(404).send("Event not from a page subscription");
    }
  } catch (error) {
    console.error("Error in Facebook handler:", error);
    res.status(500).send("Error handling Facebook request.");
  }
}
