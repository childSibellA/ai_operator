import { openai, defoult_assistant } from "../config/openai.js";
import { editCustomer } from "../utils/db/customer.handlers.js";

export async function chatGPT(message, threads_id, assistant_id, company_id) {
  assistant_id = assistant_id || defoult_assistant;
  try {
    if (threads_id === "no thread") {
      // Create a new empty thread
      const emptyThread = await openai.beta.threads.create();
      // console.log("New thread created with ID:", emptyThread.id);

      // Send an initial message to the thread
      await sendMessageToThread(emptyThread.id, message);

      // Start a run with the assistant
      const run = await openai.beta.threads.runs.create(emptyThread.id, {
        assistant_id: assistant_id || defoult_assistant,
      });

      // Wait for the run to complete
      const messages = await waitForCompletion(
        emptyThread.id,
        run.id,
        company_id
      );
      if (!messages)
        throw new Error("Failed to retrieve messages after run completion.");

      const sms =
        messages.data[0]?.content[0]?.text?.value ||
        "No message content found.";
      const result = { sms, threads_id: emptyThread.id };
      return result;
    } else {
      // Send an initial message to the existing thread
      await sendMessageToThread(threads_id, message);

      // Start a run with the assistant
      const run = await openai.beta.threads.runs.create(threads_id, {
        assistant_id: assistant_id || defoult_assistant,
      });

      // Wait for the run to complete
      const messages = await waitForCompletion(threads_id, run.id, company_id);
      if (!messages)
        throw new Error("Failed to retrieve messages after run completion.");

      const sms =
        messages.data[0]?.content[0]?.text?.value ||
        "No message content found.";
      const result = { sms, threads_id };
      return result;
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
    throw error; // Propagate the error for higher-level handling
  }
}

async function waitForCompletion(threadId, runId, company_id) {
  try {
    let runStatus;
    let run;

    do {
      run = await openai.beta.threads.runs.retrieve(threadId, runId);
      runStatus = run.status;
      // console.log("Current run status:", runStatus);

      if (runStatus === "requires_action") {
        const toolOutputs =
          run.required_action.submit_tool_outputs.tool_calls.map((tool) => {
            if (tool.function.name === "get_customer_full_name") {
              return {
                tool_call_id: tool.id,
                output: tool.function.arguments,
              };
            } else if (tool.function.name === "get_customer_phone_number") {
              return {
                tool_call_id: tool.id,
                output: tool.function.arguments,
              };
            }
          });

        editCustomer(threadId, toolOutputs, company_id);
        // console.log(toolOutputs, "tool");

        if (toolOutputs.length > 0) {
          await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
            tool_outputs: toolOutputs,
          });
          // console.log("Tool outputs submitted successfully.");
        } else {
          await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
            tool_outputs: [],
          });
          throw new Error("Required tool call information is missing.");
        }
      } else if (runStatus !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
      }
    } while (runStatus !== "completed");

    // Once completed, retrieve and return the messages
    const messages = await openai.beta.threads.messages.list(threadId);
    // console.log(messages, "messages");
    return messages;
  } catch (error) {
    console.error("Error while waiting for completion:", error.message);
    throw error; // Propagate the error for higher-level handling
  }
}

async function sendMessageToThread(threadId, message) {
  try {
    const threadMessages = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });
    // console.log("Message sent to thread:", threadMessages);
    return threadMessages;
  } catch (error) {
    console.error("Failed to send message to thread:", error.message);
    throw error; // Ensure errors are properly thrown and handled
  }
}
