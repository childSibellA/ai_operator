import { handleMessage } from "./lib/Telegram.js";

export async function handler(req) {
  const { body } = req;
  if (body && body.message) {
    // console.log(body);
    const messageObj = body.message;
    await handleMessage(messageObj);
  }
  return;
}
