import React, { useEffect, useRef, useState } from "react";
import { connectSocket, disconnectSocket, sendMessage, registerForRoom } from "../../net/SocketIO";
import type { MessageDTO } from "../../net/SocketIO";
import "./ChatComponent.css";
import { SharedPreferences } from "../../utilities/SharedPreferences";
import { 
  initializeRSAKeyPair, 
  getPeerPublicKey, 
  getCryptoKeyAsString,
  sendEncryptedMessage,
  receiveEncryptedMessage
} from "../../utilities/Crypto";

export interface Message {
  from: number;
  to: number;
  message: string;
  room: string;
  timestamp?: string;
  type?: string;
  encrypted?: boolean;
}

const ChatComponent: React.FC<{ userID: number | null; userName: string | null }> = ({ userID, userName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState("");
  const [currentUser, setCurrentUser] = useState(0);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [remoteKeyBundle, setRemoteKeyBundle] = useState<any>(null);
  const [peerPublicKey, setPeerPublicKey] = useState<CryptoKey | null>(null);
  const [peerPublicKeyString, setPeerPublicKeyString] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const initializeKeyBundle = async () => {
    console.log("🔑 Initializing key bundle for userID:", userID);
    try {
      await initializeRSAKeyPair(userID ?? 0);
      console.log("✅ Key bundle initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize key bundle:", error);
    }
  }

  const fetchPeerPublicKey = async () => {
    console.log("🔍 Fetching peer public key for userID:", userID);
    if (userID) {
      try {
        const publicKey = await getPeerPublicKey(userID.toString());
        if (publicKey) {
          setPeerPublicKey(publicKey);
          console.log("✅ Peer public key fetched and set");
          
          // Convert CryptoKey to string
          const publicKeyString = await getCryptoKeyAsString(publicKey);
          setPeerPublicKeyString(publicKeyString);
          
          console.log("Peer public key as string:", publicKeyString);
        } else {
          console.log("⚠️ No peer public key found for user:", userID);
        }
      } catch (error) {
        console.error("❌ Error fetching peer public key:", error);
      }
    } else {
      console.log("⚠️ No userID provided for peer public key fetch");
    }
  }

  useEffect(() => {

    const initializeChat = async () => {
      try {
        console.log("=== ChatComponent Initialization ===");
        console.log("Target userID:", userID);
        console.log("Target userName:", userName);
        
        // Connect socket first
        connectSocket();
        setConnected(true);

        // Get user data with proper error handling
        console.log("Fetching user data from preferences...");
        const userData = await SharedPreferences.getUserData();
        console.log("Raw user data from preferences:", userData);
        
        if (!userData) {
          console.error("No user data found in preferences!");
          alert("Error: No user data found. Please check if mock data was initialized properly.");
          return;
        }

        console.log("User data from preferences: " + userData.username + " " + userData.id);
        const userId = userData.id ?? 0;
        setCurrentUser(userId);
        setUserDataLoaded(true);
        console.log("Current user set to:", userId);
        
        // Only proceed if we have a valid user ID
        if (userId > 0) {
          console.log("Setting up room registration...");
          
          // Register for room - this should trigger room assignment from backend
          const roomRegistrationDto: MessageDTO = { 
            from: userId, 
            to: userID ?? 0, 
            message: "", 
            type: "ROOM_REGISTRATION", 
            room: "" 
          };
          
          console.log("Sending room registration:", roomRegistrationDto);
          registerForRoom(roomRegistrationDto);
          
          // Listen for room assignment response
          // @ts-ignore
          window.socket?.on("room_assigned", (response: any) => {
            console.log("Room assigned:", response);
            if (response.room) {
              setRoom(response.room);
              alert("Room assigned: " + response.room);
            }
          });
          
          // Listen for private messages
          // @ts-ignore
          window.socket?.on("private_message_received", async (dto: MessageDTO) => {
            console.log("Received message:", dto);
            if (dto.room) {
              setRoom(dto.room);
            }
            // Handle incoming messages here
            if (dto.message && dto.type === "PRIVATE_MESSAGE") {
              try {
                // Try to decrypt the message
                const decryptedMessage = await receiveEncryptedMessage(dto);
                console.log("Decrypted message:", decryptedMessage);
                setMessages(prev => [...prev, {
                  from: dto.from,
                  type: dto.type,
                  to: dto.to ?? 0,
                  message: decryptedMessage,
                  room: dto.room ?? "",
                  timestamp: new Date().toLocaleTimeString(),
                  encrypted: true
                }]);
              } catch (error) {
                console.error("Failed to decrypt message:", error);
                // Show encrypted message as fallback
                setMessages(prev => [...prev, {
                  from: dto.from,
                  type: dto.type,
                  to: dto.to ?? 0,
                  message: "[Encrypted Message]",
                  room: dto.room ?? "",
                  timestamp: new Date().toLocaleTimeString(),
                  encrypted: false
                }]);
              }
            }
          });
        } else {
          console.error("Invalid user ID:", userId);
          alert("Error: Invalid user ID. Please check mock data initialization.");
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        alert("Error initializing chat: " + error);
      }
    };

    initializeKeyBundle();
    fetchPeerPublicKey();
    initializeChat();

    // Listen for connect/disconnect
    // @ts-ignore
    window.socket?.on("connect", () => {
      console.log("Socket connected");
      setConnected(true);
    });
    // @ts-ignore
    window.socket?.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    return () => {
      console.log("Cleaning up chat component...");
      disconnectSocket();
      setConnected(false);
      // @ts-ignore
      window.socket?.off("connect");
      // @ts-ignore
      window.socket?.off("disconnect");
      // @ts-ignore
      window.socket?.off("room_assigned");
      // @ts-ignore
      window.socket?.off("private_message");
    };
  }, [userID, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "" || !room) {
      alert("Cannot send message: " + (!room ? "No room assigned" : "Empty message"));
      return;
    }
    
    try {
      let encryptedMessage = input;
      
      // Encrypt the message if encryption is ready and we have remote key bundle
      if (peerPublicKey && userID) {
        try {
          console.log("🔐 Starting encryption process...");
          console.log("Peer public key exists:", !!peerPublicKey);
          console.log("User ID:", userID);
          
          const dto: Message = {
            from: currentUser,
            to: userID,
            message: input,
            type: "PRIVATE_MESSAGE",
            room: room
          }

          console.log("📤 Calling sendEncryptedMessage with DTO:", dto);
          const encryptedData = await sendEncryptedMessage(dto, peerPublicKey);
          console.log("✅ sendEncryptedMessage completed:", encryptedData);
          
          encryptedMessage = encryptedData.message; // Use the encrypted message from the returned DTO
          console.log("Message encrypted successfully");
        } catch (error) {
          console.error("❌ Encryption failed, sending plain text:", error);
        }
      } else {
        console.log("⚠️ Encryption skipped - conditions not met:");
        console.log("  - peerPublicKey exists:", !!peerPublicKey);
        console.log("  - userID:", userID);
      }
      
      const dto: MessageDTO = { 
        from: currentUser, 
        to: userID ?? 0, 
        message: encryptedMessage, 
        type: "PRIVATE_MESSAGE", 
        room: room 
      };
      
      setMessages((prev) => [
        ...prev,
        {
          from: currentUser,
          to: userID ?? 0,
          message: input, // Show original text to sender
          timestamp: new Date().toLocaleTimeString(),
          room: room,
          encrypted: !!(peerPublicKey)
        },
      ]);
      
      console.log("Sending message:", dto);
      sendMessage(dto);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message: " + error);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span>Chat with {userName}</span>
        <span className={connected ? "status connected" : "status disconnected"}>{connected ? "Connected" : "Disconnected"}</span>
        {room && <span className="room-info">Room: {room}</span>}
        {peerPublicKey && <span className="encryption-status">🔒 E2E</span>}
      </div>
      
      {/* Debug info */}
      <div style={{ fontSize: '12px', padding: '5px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
        <div>User Data Loaded: {userDataLoaded ? 'Yes' : 'No'}</div>
        <div>Current User ID: {currentUser}</div>
        <div>Target User ID: {userID}</div>
        <div>Room: {room || 'Not assigned'}</div>
        <div>Encryption: {peerPublicKey ? 'Ready' : 'Initializing...'}</div>
        <div>Peer Public Key: {peerPublicKey ? 'Available' : 'Not available'}</div>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.from === currentUser ? "me" : "other"}`}>
            <span className="chat-text">
              {msg.message}
              {msg.encrypted && <span style={{ fontSize: '10px', color: '#666' }}> 🔒</span>}
            </span>
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
        <button
          onClick={handleSend} 
          className="chat-send-btn"
          title="Send message">
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatComponent; 