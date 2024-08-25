const OpenAI = require("openai");

async function chatGPT(threadId, message) {
  try {
    // Attempt to retrieve the existing thread
    const myThread = await OpenAI.beta.threads.retrieve(threadId);
    console.log("Thread retrieved:", myThread);

    // Send the message in the existing thread
    return await sendMessageToThread(threadId, message);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error(
        `Thread not found with id '${threadId}'. Creating a new thread.`
      );

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
  try {
    const run = await OpenAI.beta.threads.runs.create({
      assistant_id: "asst_kgkdsXRNabGYXh0mumyLDAO2",
    });
    console.log("New thread created:", run.thread.id);
    return run.thread.id;
  } catch (error) {
    console.error("Failed to create a new thread:", error.message);
    throw new Error("Failed to create a new thread");
  }
}

async function sendMessageToThread(threadId, message) {
  try {
    const threadMessage = await OpenAI.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });
    console.log("Message sent to thread:", threadMessage);
    return threadMessage;
  } catch (error) {
    console.error("Failed to send message to thread:", error.message);
    throw new Error("Failed to send message to thread");
  }
}

module.exports = { chatGPT };
