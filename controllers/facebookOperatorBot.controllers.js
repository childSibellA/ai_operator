import { createChatWithTools, imageInputLLM } from "../services/LLM.js";
import { getCompanyByFb } from "../utils/db/company.handlers.js";
import {
  telegramMsgSender,
  sendToAdmin,
} from "../middlewares/telegramMsgSender.js";
import {
  callTypingAPI,
  facebookMsgSender,
  getCustomerFbInfo,
} from "../middlewares/facebookMsgSender.js";
import {
  createNewCustomer,
  changeCustomerInfo,
  getCustomer,
  addNewMessage,
  createNewCustomerFromFb,
} from "../utils/db/customer.handlers.js";

// Utility function to create a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function handleNewCustomer(company, newMessage, customer_info) {
  let company_id = company._id;
  try {
    const newCustomer = await createNewCustomerFromFb(
      company_id,
      customer_info
    );

    if (newCustomer) {
      await handleExistingCustomer(newCustomer, newMessage, company);
    }
  } catch (error) {
    console.error("Error creating new customer:", error);
    return facebookMsgSender(
      chat_id,
      "Sorry, something went wrong while creating a new customer."
    );
  }
}

async function handleExistingCustomer(customer, newMessage, company) {
  const { chat_id, full_name, gender, bot_active, phone_number } = customer;
  const { fb_page_access_token, system_instructions, openai_api_key } = company;

  const text = newMessage;
  try {
    let role = "user";

    const updatedCustomer = await addNewMessage(customer, text, role);
    const { messages } = updatedCustomer;

    if (!bot_active) {
      return;
    }
    const simplifiedMessages = messages.map(({ role, content }) => ({
      role,
      content,
    }));
    let tool_choice = "auto";
    const assistant_resp = await createChatWithTools(
      simplifiedMessages,
      system_instructions,
      openai_api_key,
      full_name,
      phone_number,
      tool_choice
    );
    const { assistant_message, phone_from_llm, name_from_llm } = assistant_resp;

    // console.log(assistant_resp, "arg");

    if (assistant_message) {
      role = "assistant";
      let finalCustomer = await addNewMessage(
        updatedCustomer,
        assistant_message,
        role
      );

      let lastMessage =
        finalCustomer.messages[finalCustomer.messages.length - 1].content;

      // Send the response message
      return facebookMsgSender(chat_id, lastMessage, fb_page_access_token);
    } else {
      let updatedCustomerInfo = await changeCustomerInfo(
        updatedCustomer,
        phone_from_llm,
        name_from_llm
      );

      let tool_choice = "none";
      let assistant_resp = await createChatWithTools(
        simplifiedMessages,
        system_instructions,
        openai_api_key,
        full_name,
        phone_number,
        tool_choice
      );

      const { assistant_message } = assistant_resp;

      role = "assistant";
      let finalCustomer = await addNewMessage(
        updatedCustomer,
        assistant_message,
        role
      );

      let lastMessage =
        finalCustomer.messages[finalCustomer.messages.length - 1].content;

      // Send the response message
      return facebookMsgSender(chat_id, lastMessage, fb_page_access_token);
    }
  } catch (error) {
    console.error("Error handling existing customer:", error);
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
  console.log("body", req.body.object);

  try {
    const { body } = req;

    if (body.object === "page" && body.entry && body.entry[0].messaging) {
      const webhookEvent = body.entry[0].messaging[0];
      console.log(webhookEvent, "webhook");

      const chat_id = webhookEvent.sender.id;
      const recipient_id = webhookEvent.recipient.id;
      let company = await getCompanyByFb(recipient_id);
      if (company) {
        const { fb_page_access_token, bot_active, openai_api_key } = company;

        if (!bot_active) {
          console.log(
            bot_active,
            "Bot is not active. Stopping further actions."
          );
          return; // Exit the function early to prevent further processing
        }

        console.log(bot_active, "bot status");

        const fields =
          "id,name,first_name,last_name,profile_pic,locale,timezone,gender,birthday";

        const newMessage = webhookEvent.message?.text || "";
        const newImage = webhookEvent.message?.attachments || "";

        try {
          const customer = await getCustomer(chat_id);
          if (newMessage) {
            // Mark message as seen and typing action
            await callTypingAPI(chat_id, "mark_seen", fb_page_access_token);
            await callTypingAPI(chat_id, "typing_on", fb_page_access_token);

            if (!customer) {
              let customerInfo = await getCustomerFbInfo(
                chat_id,
                fields,
                fb_page_access_token
              );
              console.log(customerInfo, "customer info");
              // Handle new customer
              await handleNewCustomer(
                company,
                newMessage,
                customerInfo || { id: chat_id }
              );
            } else {
              // Handle existing customer
              await handleExistingCustomer(customer, newMessage, company);
            }
          }
          if (newImage) {
            let image_url = newImage[0].payload.url;
            let role = "user"; // Declare role here

            try {
              // Call imageInputLLM and await the result
              const image_descr = await imageInputLLM(
                openai_api_key,
                image_url
              );
              let full_descr = `მომხმარებელმა სურათი გამოგვიგზავნა რომლის აღწერაა:${image_descr}`;
              // Update the customer with the new image description
              const updatedCustomer = await addNewMessage(
                customer,
                full_descr,
                role,
                image_url
              );

              console.log(updatedCustomer, "updated customer");
            } catch (error) {
              console.error("Error processing image:", error);
            }
          } else {
            console.log("No new message or image content to process.");
          }
        } catch (err) {
          console.error("Error fetching user info or sending message:", err);
        }
      } else {
        // Handle case where company is not found
        sendToAdmin(`New user ID is ${recipient_id}`);
        console.log(`New user ID is ${recipient_id}`);
      }
    } else {
      res.status(404).send("Event not from a page subscription");
    }
  } catch (error) {
    console.error("Error in Facebook handler:", error);
    res.status(500).send("Error handling Facebook request.");
  }
}
