// gptAssistant.js
require("dotenv").config();
const axios = require("axios");

const openaiApiKey = process.env.OPENAI_API_KEY;
const apiUrl = "https://api.openai.com/v1/chat/completions";

async function getGptResponse(prompt) {
  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-4o mini", // or "gpt-3.5-turbo"
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
        max_tokens: 140,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error(
      "Error getting GPT response:",
      error.response ? error.response.data : error.message
    );
    return "Sorry, I am unable to process your request right now.";
  }
}

module.exports = { getGptResponse };
