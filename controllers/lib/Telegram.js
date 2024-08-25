const axiosInstance = require("./axios");
const { getGptResponse } = require("./getrespons");

async function sendMessage(messageObj, messageText) {
  return axiosInstance.get("sendMessage", {
    params: {
      chat_id: messageObj.chat.id,
      text: messageText,
    },
  });
}

async function handleMessage(messageObj) {
  const messageText = messageObj.text || "";

  try {
    const response = await getGptResponse(messageText);
    console.log(response, "resGPT");
    return sendMessage(messageObj, "hiii");
  } catch (err) {
    console.error("Error handling GPT response:", err);
    return sendMessage(messageObj, "Sorry, something went wrong.");
  }
}

module.exports = { handleMessage };
