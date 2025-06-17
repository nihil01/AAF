import { io } from "socket.io-client";

const socket = io("http://localhost:9090", {
    autoConnect: false
});

export interface PrivateChatMessageDTO {
    from: string;
    to: string;
    message: string;
}

//Functions
export const connectSocket = () => {
    socket.connect();
}

export const disconnectSocket = () => {
    socket.disconnect();
}

export const sendMessage = (dto: PrivateChatMessageDTO) => {
    socket.emit("private_message", dto);
}


export const subscribeToMessages = (callback: (dto: PrivateChatMessageDTO) => void) => {
    socket.on("private_message", callback);
    return () => socket.off("private_message", callback);
};

//Listeners
socket.on("connect", () => {
    console.log("Connected to server");
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

socket.on("error", (error) => {
    console.error(error);
});