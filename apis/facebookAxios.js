import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

export function facebookAxios(requestBody, access_token) {
  axios
    .post(
      "https://graph.facebook.com/v20.0/me/messages",
      requestBody,
      {
        persistent_menu: [
          {
            locale: "default",
            composer_input_disabled: false,
            call_to_actions: [], // Empty array to remove all buttons
          },
        ],
      },
      {
        params: {
          access_token,
        },
      }
    )
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

export function removePersistentMenu() {
  axios
    .delete("https://graph.facebook.com/v20.0/me/messenger_profile", {
      params: {
        access_token: PAGE_ACCESS_TOKEN,
      },
      data: {
        fields: ["persistent_menu"], // Field to remove the persistent menu
      },
    })
    .then((res) => {
      console.log("Persistent menu removed successfully:", res.data);
    })
    .catch((err) => {
      if (err.response && err.response.data.error) {
        console.error("API response error:", err.response.data.error);
      } else {
        console.error("Unable to remove persistent menu:", err.message);
      }
    });
}

// Call the function to remove the persistent menu
removePersistentMenu();
