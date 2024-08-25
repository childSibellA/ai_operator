const axiosInstance = require("./axios");
// const { getGptResponse } = require("./getGptResponse");
const { chatGPT } = require("../../chatGPT");

function sendMessage(messageObj, messageText) {
  return axiosInstance.get("sendMessage", {
    chat_id: messageObj.chat.id,
    text: messageText,
  });
}
async function getGpt(message, messageObj) {
  try {
    const response = await chatGPT(message, messageObj.chat.id);
    console.log(response, "resGPT");
    return sendMessage(messageObj, response);
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
