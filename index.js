import express from "express";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
dotenv.config();
import operatorRoute from "./routes/operatorBot.routes.js";
connectDB();

const PORT = process.env.PORT || 5000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use("/chat", operatorRoute);

// // Handle GET requests
// app.get("*", async (req, res) => {
//   try {
//     await handler(req); // Handle the request with your custom handler
//     res.send("GET request handled");
//     console.log("GET request received");
//   } catch (error) {
//     console.error("Error handling GET request:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Fb Webhook Verification
app.get("/chat/facebook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Instagram Webhook Verification
app.get("/chat/instagram", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Verify the webhook token for Instagram
  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("INSTAGRAM_WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Instagram Webhook Event Handling
app.post("/chat/inst", (req, res) => {
  try {
    const body = req.body;
    console.log(body, "body");

    if (body.object === "instagram") {
      // Process Instagram webhook events (e.g., messages, mentions)
      console.log("Received Instagram event:", JSON.stringify(body, null, 2));

      // Loop through each entry and handle messages/mentions
      body.entry.forEach((entry) => {
        entry.messaging.forEach((event) => {
          if (event.message) {
            console.log("Received Instagram Message: ", event.message);
            // Handle message events here
          } else if (event.mention) {
            console.log("Received Instagram Mention: ", event.mention);
            // Handle mention events here
          }
        });
      });

      res.status(200).send("EVENT_RECEIVED");
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error("Error handling Instagram webhook event:", error);
    res.sendStatus(500);
  }
});
