import { telegramAxios } from "../apis/telegramAxios.js";

export function telegramMsgSender(messageObj, messageText) {
  return telegramAxios().get("sendMessage", {
    chat_id: messageObj.chat.id,
    text: messageText,
  });
}
