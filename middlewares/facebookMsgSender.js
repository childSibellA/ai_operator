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

export function callTypingAPI(sender_psid, action) {
  const requestBody = {
    recipient: { id: sender_psid },
    sender_action: action, // Use 'typing_on', 'typing_off', or 'mark_seen'
  };

  facebookAxios(requestBody);
}
