const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.ORGANIZATION_ID,
  project: process.env.PORJECT_ID,
});

const assistant_id = process.env.ASISTENT_ID;

async function chatGPT(message) {
  console.log("Received message:", message);
  try {
    // Create a new empty thread
    const emptyThread = await openai.beta.threads.create();
    console.log("New thread created with ID:", emptyThread.id);

    // Send an initial message to the thread
    await sendMessageToThread(emptyThread.id, message);

    // Start a run with the assistant
    const run = await openai.beta.threads.runs.create(emptyThread.id, {
      assistant_id: assistant_id,
    });

    // Wait for a short period before checking the status
    await waitForCompletion(emptyThread.id, run.id);
  } catch (error) {
    console.log("An error occurred:", error.message);
  }
}

async function waitForCompletion(threadId, runId) {
  try {
    let runStatus;
    do {
      const run = await openai.beta.threads.runs.retrieve(threadId, runId);
      runStatus = run.status;
      console.log("Current run status:", runStatus);

      // If not completed, wait for a bit before checking again
      if (runStatus !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
      }
    } while (runStatus !== "completed");

    // Once completed, get and log the messages
    const messages = await openai.beta.threads.messages.list(threadId);
    messages.data.forEach((item) => {
      console.log(item.content);
    });
  } catch (error) {
    console.error("Error while waiting for completion:", error.message);
  }
}

async function sendMessageToThread(threadId, message) {
  try {
    const threadMessages = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });
    console.log("Message sent to thread:", threadMessages);
    return threadMessages;
  } catch (error) {
    console.error("Failed to send message to thread:", error.message);
    throw new Error("Failed to send message to thread");
  }
}

module.exports = { chatGPT };
