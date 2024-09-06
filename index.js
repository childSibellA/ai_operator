import express from "express";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();
import operatorRoute from "./routes/operatorBot.routes.js";

const PORT = process.env.PORT || 5000;

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use("/chat", operatorRoute);

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
// app.post("*", async (req, res) => {
//   try {
//     await handler(req); // Handle the request with your custom handler
//     // console.log("POST request body:", req.body);
//     res.send("POST request handled");
//   } catch (error) {
//     console.error("Error handling POST request:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// Connect to the database (uncomment and modify as needed)
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
