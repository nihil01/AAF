import React, {useEffect, useRef, useState} from "react";
import type {MessageDTO} from "../../net/SocketIO";
import {connectSocket, disconnectSocket, registerForRoom, sendMessage} from "../../net/SocketIO";
import "./ChatComponent.css";
import {SharedPreferences} from "../../utilities/SharedPreferences";
import {
  getPeerPublicKey,
  receiveEncryptedMessage,
  sendEncryptedMessage
} from "../../utilities/Crypto";
import {IonButton, IonIcon, useIonAlert} from "@ionic/react";
import {close} from "ionicons/icons";
import {sqliteService} from "../../sqlite/sqlite";
import {CustomLoaderComponent} from "../loader/CustomLoaderComponent.tsx";

export interface Message {
  from: number;
  to: number;
  message: string;
  room: string;
  timestamp?: string;
  type?: string;
}

const ChatComponent: React.FC<{ userID: number | null; userName: string | null,
   setChatOpen: (chatOpen: boolean) => void }> = ({ userID, userName, setChatOpen }) => {

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState("");
  const [currentUser, setCurrentUser] = useState(0);
  const [peerPublicKey, setPeerPublicKey] = useState<CryptoKey | null>(null);
  const [messageSentTimestamp, setMessageSentTimestamp] = useState<number>(0);

  //await untial data from sqlite is initialized
  const [sqliteInitializedFlag, setSqliteInitializedFlag] = useState<boolean>(false);
  const [presentAlert] = useIonAlert()
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isMessageSendingAllowed = (): boolean => {

    return (messageSentTimestamp + 5000 <= new Date().getTime());

  }

  const fetchPeerPublicKey = async () => {
    console.log("🔍 Fetching peer public key for userID:", userID);
    if (userID) {
      try {
        const publicKey = await getPeerPublicKey(userID.toString());
        if (publicKey) {
          setPeerPublicKey(publicKey);
          console.log("✅ Peer public key fetched and set");
        } else {
          console.log("⚠️ No peer public key found for user:", userID);
          //close chat
          setChatOpen(false);
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
          window.socket?.on("room_assigned", (response: any) => {
            console.log("Room assigned:", response);
            if (response.room) {
              setRoom(response.room);
              alert("Room assigned: " + response.room);
            }
          });
          
          // Listen for private messages
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
          //read user chat
          await readUserChat();
        } else {
          console.error("Invalid user ID:", userId);
          alert("Error: Invalid user ID. Please check mock data initialization.");
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        alert("Error initializing chat: " + error);
      }
    };

    fetchPeerPublicKey().then(() => initializeChat());


    // Listen for connect/disconnect
    window.socket?.on("connect", () => {
      console.log("Socket connected");
      setConnected(true);
    });
    
    window.socket?.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    return () => {
      console.log("Cleaning up chat component...");
      disconnectSocket();
      setConnected(false);
      window.socket?.off("connect");
      window.socket?.off("disconnect");
      window.socket?.off("room_assigned");
      window.socket?.off("private_message");
    };
  }, [userID, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const readUserChat = async () => {
    if(room != null && room != ""){
      try {
        const data = await sqliteService.getUserChatData(room);
        console.log("User chat data:", JSON.parse(data));

        setSqliteInitializedFlag(false);
        for(let i = 0; i < JSON.parse(data).length; i++){
          //update in chatbox
          setMessages(prev => [...prev, {
            from: currentUser,
            to: userID ?? 0,
            message: JSON.parse(data)[i].message,
            timestamp: new Date().toLocaleTimeString(),
            room: room,
          }]);
        }
        setSqliteInitializedFlag(true);
      } catch (error) {
        console.error("Error reading user chat:", error);
      }
    }    
  }

  const handleSend = async () => {
    if (input.trim() === "" || !room) {
      alert("Cannot send message: " + (!room ? "No room assigned" : "Empty message"));
      return;
    }
    
    try {
      // Encrypt the message if encryption is ready and we have remote key bundle
      if (peerPublicKey && userID) {

        if (!isMessageSendingAllowed()) return await presentAlert({
          header: 'Warning',
          message: "Wow brother ! Wait 5 sec before sending again!",
          buttons: ['OK']
        })

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
          };

          console.log("📤 Calling sendEncryptedMessage with DTO:", dto);
          const encryptedData: MessageDTO = await sendEncryptedMessage(dto, peerPublicKey);

          await sqliteService.insertIntoUserChat(room, input);

          console.log("✅ sendEncryptedMessage completed:", encryptedData);
          
          console.log("Message encrypted successfully");

          
          
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
          
          console.log("Sending message:", encryptedData);
          sendMessage(encryptedData);
          setInput("");

        } catch (error) {
          console.error("❌ Encryption failed, sending plain text:", error);
        }finally {
          setMessageSentTimestamp(new Date().getTime());
          console.log("Message sent! Timestamp defined");
        }
      } else {
        console.log("⚠️ Encryption skipped - conditions not met:");
        console.log("  - peerPublicKey exists:", !!peerPublicKey);
        console.log("  - userID:", userID);
      }
      
  
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


      { !sqliteInitializedFlag && <CustomLoaderComponent/> }

      <div className="chat-header d-flex flex-column">
        <span>Chat with {userName}</span>
        <span className={connected ? "status connected" : "status disconnected"}>{connected ? "Connected🔒" : "Disconnected🔒"}</span>
      </div>
      <IonButton style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }} fill="clear" color="medium" onClick={() => setChatOpen(false)}>
          <IonIcon icon={close} />
      </IonButton>
      
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.from === currentUser ? "me" : "other"}`}>
            <span className="chat-text">
              {msg.message}
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