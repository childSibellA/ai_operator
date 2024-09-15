import { telegramAxios } from "../apis/telegramAxios.js";

export function telegramMsgSender(chat_id, messageText) {
  return telegramAxios().get("sendMessage", {
    chat_id,
    text: messageText,
  });
}
