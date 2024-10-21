import OpenAI from "openai";

const tools = [
  {
    type: "function",
    function: {
      name: "get_customer_phone_number",
      description: "For the customer, registration ask phone number",
      parameters: {
        type: "object",
        properties: {
          phone_number: {
            type: "string",
            description:
              "The customer's phone number without the country code (e.g., 4567890).",
          },
        },
        additionalProperties: false,
        required: ["phone_number"],
      },
      strict: true,
    },
  },
];

export async function createChatWithTools(
  messagesFromDb,
  system_instructions,
  apiKey,
  full_name,
  tool_choice
) {
  const openai = new OpenAI({
    apiKey,
  });
  let customer_info = `მომხმარებლის სახელი არის${full_name}`;
  let instructions = {
    role: "system",
    content: [
      {
        type: "text",
        text: `${system_instructions} ${customer_info}`,
      },
    ],
  };

  let messages = [instructions, ...messagesFromDb];
  // console.log(messages, "messsage");
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      tools: tools,
      tool_choice: tool_choice || "auto",
      parallel_tool_calls: false,
      response_format: {
        type: "text",
      },
    });

    if (response.choices[0].message.tool_calls) {
      const toolCall = response.choices[0].message.tool_calls[0];
      const argument = JSON.parse(toolCall.function.arguments);
      // console.log(argument, "arguments");
      return {
        assistant_message: null,
        phone_number: argument.phone_number || null,
      };
    } else {
      const assistant_message = response.choices[0].message.content || "";
      return { assistant_message, phone_number: null };
    }
  } catch (error) {
    console.log("An error occurred:", error.message);
  }
}

export async function createTextChat(messages) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [messages],
    temperature: 1,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: {
      type: "text",
    },
  });
  const assistant_message = response.choices[0].message.content;
  return assistant_message;
}

export async function imageInputLLM(apiKey, url) {
  const openai = new OpenAI({
    apiKey,
  });
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "აღწერე სურათი, ტურის მდებარეობა, ფასი, დრო და რამდენ ადამიანზეა გათვლილი",
          },
          {
            type: "image_url",
            image_url: {
              url,
            },
          },
        ],
      },
    ],
  });

  console.log(response.choices[0].message, "response");

  const image_descr = response.choices[0].message.content;
  return image_descr;
}
