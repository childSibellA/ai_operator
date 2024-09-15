import { facebookAxios } from "../apis/facebookAxios.js";

export function facebookMsgSender(senderPsid, messageText, page_access_token) {
  const requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: {
      text: messageText,
    },
  };

  facebookAxios(requestBody, page_access_token);
}

export function callTypingAPI(sender_psid, action, page_access_token) {
  console.log(action, "action");
  const requestBody = {
    recipient: { id: sender_psid },
    sender_action: action, // Use 'typing_on', 'typing_off', or 'mark_seen'
  };

  facebookAxios(requestBody, page_access_token, action);
}
