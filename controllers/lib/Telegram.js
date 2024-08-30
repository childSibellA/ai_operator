const axiosInstance = require("./axios");
const { chatGPT } = require("../../chatGPT");
const Customer = require("../../models/Customer");

function sendMessage(messageObj, messageText) {
  return axiosInstance.get("sendMessage", {
    chat_id: messageObj.chat.id,
    text: messageText,
  });
}

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
    console.log(customer, "custone");

    if (!customer) {
      // Create a new thread and save the customer
      const result = await chatGPT(message, "no thread");
      const { threads_id, sms } = result;
      console.log(result, "result");

      // Create a new customer entry
      customer = new Customer({
        threads_id,
        chat_id,
      });

      // Save the new customer to the database
      await customer.save();

      return sendMessage(messageObj, sms);
    } else {
      // Use the existing customer thread
      const result = await chatGPT(message, customer?.threads_id);
      const { sms } = result;
      return sendMessage(messageObj, sms);
    }
  } catch (err) {
    console.error("Error handling GPT response:", err);
    return sendMessage(messageObj, "Sorry, something went wrong.");
  }
}

function handleMessage(messageObj) {
  const messageText = messageObj.text || "";
  if (messageText.charAt(0) === "/") {
    const command = messageText.substr(1);
    switch (command) {
      case "start":
        return getGpt("გამარჯობა, რას მეტყვით თქვენს შესახებ", messageObj);
      // return sendMessage(
      //   messageObj,
      //   "მიწერეთ რა გაწუხებთ, მამა ფოტი დაგეხმარებათ სულიერი სამყაროს შექმნასა და ქრისტეს პოვნაში"
      // );
      default:
        // return sendMessage(messageObj, "Hey, hi, I do not get u");
        return getGpt(messageText, messageObj);
    }
  } else {
    getGpt(messageText, messageObj);
  }
}

module.exports = { handleMessage };
