import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

export function facebookAxiosPostMessage(requestBody, access_token, action) {
  axios
    .post("https://graph.facebook.com/v20.0/me/messages", requestBody, {
      params: {
        access_token,
      },
    })
    .then((res) => {
      if (action) {
        console.log(`${action} sent successfully`, res.data);
      } else {
        console.log("Message sent successfully", res.data);
      }
    })
    .catch((err) => {
      if (err.response && err.response.data.error) {
        console.error("API response error:", err.response.data.error);
      } else {
        console.error("Unable to send message:", err.message);
      }
    });
}

export async function facebookAxiosGetUser(params, userId) {
  try {
    // API call to get user info
    const response = await axios.get(
      `https://graph.facebook.com/v20.0/${userId}`,
      {
        params,
      }
    );

    // Log the user information
    console.log("User Information:", response.data);
    // return response.data; // Returns the user information
  } catch (error) {
    console.log("Error fetching user information:", error);
  }
}
