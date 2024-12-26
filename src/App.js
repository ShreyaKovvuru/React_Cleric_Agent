import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Make sure to include the updated CSS

const App = () => {
  const [query, setQuery] = useState(""); // Stores the user's query
  const [messages, setMessages] = useState([]); // Chat history
  const [loading, setLoading] = useState(false); // Loading state
  const chatContainerRef = useRef(null); // Ref for chat container

  // Scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user's query to messages
    const userMessage = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery(""); // Clear input

    setLoading(true); // Show loader
    try {
      // Send the query to the backend
      const res = await axios.post(
        "http://localhost:8000/query", // The API endpoint
        { query }, // Payload in the format expected by the backend
        {
          headers: { "Content-Type": "application/json" }, // Set proper headers
        }
      );

      // Extract and format the "answer" part of the response
      const botMessage = {
        sender: "bot",
        text: typeof res.data.answer === "object" ? (
          <div className="json-container">
            <pre className="json-content">
              {JSON.stringify(res.data.answer, null, 4)}
            </pre>
          </div>
        ) : (
          res.data.answer
        ),
      };
      setMessages((prev) => [...prev, botMessage]); // Add bot's response
    } catch (err) {
      const errorMessage = { sender: "bot", text: "Something went wrong. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false); // Hide loader
    }
  };

  return (
    <div className="app">
      <div className="header">
        <div className="header-content">
          <h1 className="header-title">Cleric Query Agent</h1>
        </div>
      </div>
      <div className="chat-container" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-bubble ${message.sender === "user" ? "user-bubble" : "bot-bubble"}`}
          >
            {message.text}
          </div>
        ))}
        {loading && <div className="chat-bubble bot-bubble">...</div>}
      </div>
      <form onSubmit={handleSubmit} className="input-container">
        <input
          type="text"
          placeholder="Type your query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-box"
        />
        <button type="submit" className="send-button" disabled={loading}>
          {loading ? "Loading..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default App;
