const OpenAI = require('openai'); // Import OpenAI library

exports.handler = async (event) => {
  const { message } = JSON.parse(event.body); // Parse the request body

  // Initialize OpenAI with API key from Netlify environment variables
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in Netlify environment
  });

  try {
    // Create a thread
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;

    // Send user message to OpenAI
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    // Trigger assistant's response
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: 'asst_1adywEubGRTDXE2j9vq4OcDM', // Replace with your assistant ID
    });

    // Poll for the run status until it's completed
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (runStatus.status !== 'completed') {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    // Retrieve the latest messages from the thread
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data[0].content[0].text.value;

    // Return the assistant's response
    return {
      statusCode: 200,
      body: JSON.stringify({ response: lastMessage }),
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
