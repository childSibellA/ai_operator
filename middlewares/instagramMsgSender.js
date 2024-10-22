import {
  instagramAxiosGetUser,
  instagramAxiosPostMessage,
} from "../apis/instagramAxios.js";

// Send a message to an Instagram user via the Instagram Graph API
export function instagramMsgSender(
  senderPsid,
  messageText,
  insta_page_access_token
) {
  const requestBody = {
    messaging_product: "instagram",
    recipient: {
      id: senderPsid, // Instagram User ID
    },
    message: {
      text: messageText, // The message text you want to send
    },
  };

  instagramAxiosPostMessage(requestBody, insta_page_access_token);
}

// Fetch Instagram user information via Instagram Graph API
export function getCustomerInstagramInfo(
  instagramUserId,
  fields,
  access_token
) {
  console.log(instagramUserId, "instagram_user_id");
  const params = {
    fields,
    access_token,
  };

  const result = instagramAxiosGetUser(params, instagramUserId);
  return result;
}

// Send typing indicators or mark messages as seen on Instagram
export function callInstaTypingAPI(
  instagramUserId,
  action,
  fb_page_access_token
) {
  console.log(action, "action");
  const requestBody = {
    recipient: { id: instagramUserId },
    sender_action: action, // Use 'typing_on', 'typing_off', or 'mark_seen'
  };

  instagramAxiosPostMessage(
    requestBody,
    fb_page_access_token,
    action,
    instagramUserId
  );
}
