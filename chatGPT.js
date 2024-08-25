const OpenAI = require("openai");
const openai = new OpenAI();

async function chatGPT(message, threadId) {
  try {
    // Attempt to retrieve the existing thread
    const myThread = await openai.beta.threads.retrieve(threadId);
    console.log("Thread retrieved:", myThread);

    // Send the message in the existing thread
    return await sendMessageToThread(threadId, message);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error("Thread not found:", threadId);

      // Create a new thread if it doesn't exist
      const newThreadId = await createNewThread();

      // Send the message in the new thread
      return await sendMessageToThread(newThreadId, message);
    } else {
      console.error("An error occurred:", error.message);
      throw new Error("Failed to process the GPT interaction");
    }
  }
}

async function createNewThread() {
  const run = await openai.beta.threads.runs.create({
    assistant_id: "asst_kgkdsXRNabGYXh0mumyLDAO2",
  });
  console.log("New thread created:", run.thread.id);
  return run.thread.id;
}

async function sendMessageToThread(threadId, message) {
  const threadMessage = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });
  console.log("Message sent to thread:", threadMessage);
  return threadMessage;
}

module.exports = { chatGPT };
