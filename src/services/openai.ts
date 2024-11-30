import OpenAI from 'openai';

const ASSISTANT_ID = 'asst_1adywEubGRTDXE2j9vq4OcDM';

export async function sendMessage(content: string) {
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Use environment variable for the API key
  });

  // Create a new thread
  const thread = await openai.beta.threads.create();
  const threadId = thread.id;

  // Send user message
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content,
  });

  // Trigger assistant response
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID,
  });

  // Poll for the response
  let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  while (runStatus.status !== 'completed') {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before polling again
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }

  // Retrieve the latest messages
  const messages = await openai.beta.threads.messages.list(threadId);
  return messages.data[0].content[0].text.value; // Return the assistant's response
}
