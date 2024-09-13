import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

export function facebookAxios(requestBody) {
  axios
    .post("https://graph.facebook.com/v20.0/me/messages", requestBody, {
      params: {
        access_token: PAGE_ACCESS_TOKEN,
      },
    })
    .then((res) => {
      console.log("Message sent successfully", res.data);
    })
    .catch((err) => {
      if (err.response && err.response.data.error) {
        console.error("API response error:", err.response.data.error);
      } else {
        console.error("Unable to send message:", err.message);
      }
    });
}
