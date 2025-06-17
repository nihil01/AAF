import React, { useEffect, useRef, useState } from "react";
import { connectSocket, disconnectSocket, sendMessage, subscribeToMessages } from "../../net/SocketIO";
import type { PrivateChatMessageDTO } from "../../net/SocketIO";
import "./ChatComponent.css";

interface Message {
  from: string;
  to: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
}

const ChatComponent: React.FC<{ currentUser: string; userName: string }> = ({ currentUser, userName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    connectSocket();
    setConnected(true);

    const unsubscribe = subscribeToMessages((dto: PrivateChatMessageDTO) => {
      // Only add messages between these two users
      if (
        (dto.from === currentUser && dto.to === userName) ||
        (dto.from === userName && dto.to === currentUser)
      ) {
        setMessages((prev) => [
          ...prev,
          {
            from: dto.from,
            to: dto.to,
            text: dto.message,
            sender: dto.from === currentUser ? "me" : "other",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    });

    // Listen for connect/disconnect
    // @ts-ignore
    window.socket?.on("connect", () => setConnected(true));
    // @ts-ignore
    window.socket?.on("disconnect", () => setConnected(false));

    return () => {
      disconnectSocket();
      setConnected(false);
      unsubscribe();
      // @ts-ignore
      window.socket?.off("connect");
      // @ts-ignore
      window.socket?.off("disconnect");
    };
  }, [currentUser, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === "") return;
    const dto: PrivateChatMessageDTO = { from: currentUser, to: userName, message: input };
    setMessages((prev) => [
      ...prev,
      {
        from: currentUser,
        to: userName,
        text: input,
        sender: "me",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    console.log(dto);
    
    sendMessage(dto);
    setInput("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span>Chat with {userName}</span>
        <span className={connected ? "status connected" : "status disconnected"}>{connected ? "Connected" : "Disconnected"}</span>
        <span className ={connected ? "status connected" : "status disconnected"}></span>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.sender}`}>
            <span className="chat-user">{msg.sender === "me" ? "You" : msg.from}:</span>
            <span className="chat-text">{msg.text}</span>
            <span className="chat-timestamp">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button onClick={handleSend} className="chat-send-btn">Send</button>
      </div>
    </div>
  );
};

export default ChatComponent; 