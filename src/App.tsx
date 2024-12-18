import { useState } from 'react';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]); // Message state

  const handleSend = async (message: string) => {
    const userMessage: Message = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]); // Add user's message to the UI

    try {
      const res = await fetch('/.netlify/functions/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }), // Send user message to function
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      if (data.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        console.error('Function error:', data.error);
      }
    } catch (error) {
      console.error('Error communicating with OpenAI:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chat with Assistant</h1>
      <div className="space-y-4 mb-4">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} role={msg.role} content={msg.content} />
        ))}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default App;
