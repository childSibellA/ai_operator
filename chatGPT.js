const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key set up in the environment
});

async function chatGPT(message, threadId) {
  console.log("retrieved:", threadId, message);
  try {
    // Attempt to retrieve the existing thread
    const myThread = await openai.beta.threads.retrieve(
      "thread_wXFGeslhODZA8OVLY5NNukjf"
    );
    console.log("Thread retrieved:", myThread);

    // Send the message in the existing thread
    return await sendMessageToThread(
      "thread_wXFGeslhODZA8OVLY5NNukjf",
      message
    );
  } catch (error) {
    // if (error.response && error.response.status === 404) {
    //   console.error(
    //     `Thread not found with id '${threadId}'. Creating a new thread.`
    //   );
    //   // Create a new thread if it doesn't exist
    //   const newThreadId = await createNewThread();
    //   // Send the message in the new thread
    //   return await sendMessageToThread(newThreadId, message);
    // } else {
    //   console.error("An error occurred:", error.message);
    //   throw new Error("Failed to process the GPT interaction");
    // }
  }
}

async function createNewThread() {
  try {
    const run = await openai.beta.threads.runs.create({
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
