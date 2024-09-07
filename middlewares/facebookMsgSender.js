import { facebookAxios } from "../apis/facebookAxios.js";

export function facebookMsgSender(senderPsid, messageText) {
  const requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: {
      text: messageText,
    },
  };

  facebookAxios(requestBody);
}
