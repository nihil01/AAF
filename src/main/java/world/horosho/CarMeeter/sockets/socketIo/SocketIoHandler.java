package world.horosho.CarMeeter.sockets.socketIo;

import com.corundumstudio.socketio.SocketIOServer;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
@AllArgsConstructor
public class SocketIoHandler {

    private final SocketIOServer socketIOServer;
    private final ConcurrentHashMap<String, List<String>> userRooms;
    private final ConcurrentHashMap<Long, KeyBundleDTO> signalKeys;

    public void startServer() {
        try {
            socketIOServer.start();
            this.registerAllEventListeners();
            System.out.println("Socket server started!! Listeners have been registered");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void registerAllEventListeners(){

        this.roomRelatedEvents();

        socketIOServer.addDisconnectListener(socketIOClient -> {
            try {
                socketIOClient.disconnect();
            } catch (Exception e) {
                throw new RuntimeException(e);
            } finally {
                socketIOClient.getAllRooms().forEach(room ->
                    userRooms.computeIfPresent(room, (roomName, userList) -> {
                        userList.remove(socketIOClient.getSessionId().toString());
                        return userList.isEmpty() ? null : userList;
                    }));

                System.out.println("User disconnected");
            }
        });
    }

    public void roomRelatedEvents(){
        socketIOServer.addEventListener("room_creation", SocketIoCommonDTO.class,
            (socketIOClient, socketIoCommonDTO, ackRequest) -> {

                System.out.println("request!!");
                String roomName = Math.min(socketIoCommonDTO.getTo(), socketIoCommonDTO.getFrom())
                        + ":" + Math.max(socketIoCommonDTO.getTo(), socketIoCommonDTO.getFrom());

                System.out.println(roomName);

                if (!userRooms.containsKey(roomName)) {
                    userRooms.put(roomName, new ArrayList<>(List.of(socketIOClient.getSessionId().toString())));
                    System.out.println("No key found, creating a new room ...");
                }else{
                    userRooms.get(roomName).add(socketIOClient.getSessionId().toString());
                    System.out.println("Room already created, adding user to the room ...");
                }

                socketIOClient.joinRoom(roomName);
                System.out.println("User joined in the room");


            socketIOClient.sendEvent("room_assigned", new SocketIoCommonDTO(
                socketIoCommonDTO.getFrom(),
                socketIoCommonDTO.getTo(),
                socketIoCommonDTO.getMessage() == null ? "Room created" : socketIoCommonDTO.getMessage(),
                socketIoCommonDTO.getType() == null ? SocketEventTypes.ROOM_REGISTRATION : socketIoCommonDTO.getType(),
                roomName,
                new Date().getTime(),
                socketIoCommonDTO.getPublicKey(),
                socketIoCommonDTO.getIv(),
                socketIoCommonDTO.getEncryptedAESKey()
            ));

            System.out.println("Room created event sent to the client");
        });

        socketIOServer.addEventListener("private_message", SocketIoCommonDTO.class,
            (socketIOClient, socketIoCommonDTO, ackRequest) -> {

                if (socketIoCommonDTO.getRoom() == null || socketIoCommonDTO.getRoom().isEmpty()) {
                    socketIOClient.sendEvent("private_message", "BLANK_ROOM");
                    System.out.println("Message sent to the room");
                    return;
                }

                System.out.println("Message sent from client " + socketIOClient.getSessionId().toString());

                socketIOServer.getRoomOperations(socketIoCommonDTO.getRoom()).getClients().forEach(roomClient -> {
                    System.out.println("Client in tha room: " + roomClient.getSessionId().toString());
                    if (!roomClient.getSessionId().toString().equalsIgnoreCase(socketIOClient.getSessionId().toString()) ) {

                        roomClient.sendEvent("private_message_received", socketIoCommonDTO);
                        System.out.println("messaj");
                        System.out.println("Message sent to the room " + socketIoCommonDTO.getMessage() +
                                " to client " + roomClient.getSessionId().toString());
                    }

                });
            });
    }

}