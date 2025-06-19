import { io, Socket } from "socket.io-client";

let socket: Socket;

// Make socket available globally for direct access
declare global {
    interface Window {
        socket: typeof socket;
    }
}

export interface MessageDTO {
    from: number,
    to: number | null,
    message: string,
    type: string,
    room: string,
    timestamp?: number,
    publicKey?: string,
}

export const initializeSocket = () => {
    socket = io("http://localhost:9090", {
        autoConnect: false
    });

    window.socket = socket;

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
}


//Functions
export const connectSocket = () => {
    if(!socket) {
        initializeSocket();
    }
    socket.connect();
}

export const disconnectSocket = () => {
    if(socket) {
        socket.disconnect();
    }
}

export const sendMessage = (dto: MessageDTO) => {
    if(socket) {
        socket.emit("private_message", dto);
    }
}

export const registerForRoom = (dto: MessageDTO) => {
    if(socket) {
        socket.emit("room_creation", dto);
    }
}
