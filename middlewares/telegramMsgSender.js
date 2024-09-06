import { telegramAxios } from "../apis/telegramAxios.js";

export function telegramMsgSender(messageObj, messageText) {
  console.log(messageObj, messageText, "sms");

  return telegramAxios().get("sendMessage", {
    chat_id: messageObj.chat.id,
    text: messageText,
  });
}
