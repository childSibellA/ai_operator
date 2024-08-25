const express = require("express");
const bodyParser = require("body-parser");
const { handler } = require("./controllers"); // Import your request handler
const connectDB = require("./config/db");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const PORT = process.env.PORT || 5000;

// Initialize Express app
const app = express();

// Middleware for parsing JSON bodies in requests
app.use(bodyParser.json());

// Example function to interact with chatGPT (uncomment and modify as needed)
/*
async function getGpt(message) {
  try {
    const response = await chatGPT(message);
    console.log(response, "resGPT");
    // Handle the response, e.g., send it back to the client
  } catch (err) {
    console.error("Error handling GPT response:", err);
  }
}
*/

// Example call to the getGpt function (uncomment and modify as needed)
// getGpt("hi");

// Handle GET requests
app.get("*", async (req, res) => {
  try {
    await handler(req); // Handle the request with your custom handler
    res.send("GET request handled");
    console.log("GET request received");
  } catch (error) {
    console.error("Error handling GET request:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Handle POST requests
app.post("*", async (req, res) => {
  try {
    await handler(req); // Handle the request with your custom handler
    // console.log("POST request body:", req.body);
    res.send("POST request handled");
  } catch (error) {
    console.error("Error handling POST request:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Connect to the database (uncomment and modify as needed)
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
