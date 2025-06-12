import {App} from "@capacitor/app";
import {SharedPreferences} from "../utilities/SharedPreferences";
import { HttpClient } from "./HttpClient.ts";
import type {UserResponse} from "./UserResponse.ts";

let appStateChangeListener: any;
let appUrlOpenListener: any;
let appRestoredResultListener: any;

let user: UserResponse | null = null;
let appState: boolean = true;

let socket: WebSocket | null;
let httpClient: HttpClient;

let messageCallback: (( latitude: number, longitude: number, user: string ) => void) | null = null;

(async function getUserData() {
    user = await SharedPreferences.getUserData();
    if (!user) {
        console.log("User data not found in SharedPreferences");
        return;
    }
    console.log("User data found in SharedPreferences");
}())

export type UserCords = {
    userName: string;
    type: string;
    latitude: number;
    longitude: number;
}

export function initialize() {
    console.log("Initializing App state listening events!!")
    httpClient = new HttpClient();
    //call by default (aka appState always true on first launch)
    manageConnection();

    appStateChangeListener = App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
        appState = isActive;
        //here manage connection will change based on app state
        manageConnection();
    });

    appUrlOpenListener = App.addListener('appUrlOpen', data => {
        console.log('App opened with URL:', data);
    });

    appRestoredResultListener = App.addListener('appRestoredResult', data => {
        console.log('Restored state:', data);
    });
}

export async function destroy() {
    await appStateChangeListener?.remove();
    await appUrlOpenListener?.remove();
    await appRestoredResultListener?.remove();

    sendData("disconnect", [0.0, 0.0]);

    console.log("APPLICATION DESTROYED!")
}

export async function sendData(type: string, cords: [number | undefined, number | undefined]) {
    if (!user || cords.some(v => v === undefined)) return;

    const data: UserCords = {
        userName: user.username,
        type,
        latitude: cords[0]!,
        longitude: cords[1]!
    };

    if (type === 'disconnect' && cords[0] === 0 && cords[1] === 0 && appState) {
        socket?.send(JSON.stringify(data));
        socket?.close();
        return;
    }

    if (appState && socket?.readyState === WebSocket.OPEN) {
        console.log("WebSocket: sending data");
        socket.send(JSON.stringify(data));
    } else {
        console.log("Silent push: sending data");
        await httpClient.silentPush(data);
    }

    if (messageCallback) {
        messageCallback(cords[0]!, cords[1]!, user.username);
    }

}


export function manageConnection() {
    console.log("Manage connection called!!")
    if (appState) {
        console.log("App is active!!")
        openConnectionOnActiveState();
    } else {
        socket?.close();
    }
}

export function setMessageCallback(callback: ( latitude: number, longitude: number, user: string ) => void) {
    messageCallback = callback;
}

async function openConnectionOnActiveState(){
    if (!socket || socket.readyState === WebSocket.CLOSED) {
        console.log("WebSocket: Trying to connect ayo!")
        socket = new WebSocket(`ws://10.20.30.3:8080/api/v1/socket`);

        socket.onopen = () => {
            console.log('WebSocket connection opened');
        };

        socket.onmessage = (event) => {
            console.log('Received message:', event.data);

            const {latitude, longitude, userName} = JSON.parse(event.data);

            if (messageCallback) {
                messageCallback(latitude, longitude, userName);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            socket = null;
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
            socket = null;
        };
    }
}