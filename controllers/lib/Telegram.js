const axiosInstance = require("./axios");
const { chatGPT } = require("../../chatGPT");
const { Customer } = require("../../models/Customer");

function sendMessage(messageObj, messageText) {
  return axiosInstance.get("sendMessage", {
    chat_id: messageObj.chat.id,
    text: messageText,
  });
}
async function getGpt(message, messageObj) {
  try {
    const customer = await Customer.find({ chat_id: messageObj.chat.id });
    if (!customer.length) {
      const result = await chatGPT(message, "new thread");
      console.log(result, "rsult");

      customer.threads_id = result.threads_id;
      await customer.save();

      return sendMessage(messageObj, result.response);
    } else {
      const response = await chatGPT(message, "thread");
      console.log(response, "resGPT");
      return sendMessage(messageObj, response);
    }
  } catch (err) {
    console.error("Error handling GPT response:", err);
  }
}

function handleMessage(messageObj) {
  const messageText = messageObj.text || "";
  if (messageText.charAt(0) === "/") {
    const command = messageText.substr(1);
    switch (command) {
      case "start":
        return sendMessage(
          messageObj,
          "Hi, I’m a bot. I can help you to get started"
        );
      default:
        return sendMessage(messageObj, "Hey, hi, I do not get you");
    }
  } else {
    getGpt(messageText, messageObj);
  }
}

module.exports = { handleMessage };
