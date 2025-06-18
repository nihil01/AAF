package world.horosho.CarMeeter.sockets.socketIo;

import com.corundumstudio.socketio.SocketIOServer;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
@AllArgsConstructor
public class SocketIoHandler {

    private final SocketIOServer socketIOServer;
    private final ConcurrentHashMap<String, List<String>> userRooms;

    public void startServer() {
        try {
            socketIOServer.start();
            this.registerEventListeners();
            System.out.println("Socket server started!! Listeners have been registered");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void registerEventListeners(){

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

            if (ackRequest.isAckRequested()){
                socketIOClient.sendEvent("room_creation", new SocketIoCommonDTO(
                        socketIoCommonDTO.getFrom(),
                        socketIoCommonDTO.getTo(),
                        "BLANK_BODY",
                        SocketEventTypes.ROOM_REGISTRATION,
                        roomName
                ));
                System.out.println("Room created event sent to the client");
            }

        });

        socketIOServer.addEventListener("private_message", SocketIoCommonDTO.class,
                    (socketIOClient, socketIoCommonDTO, ackRequest) -> {
            if (socketIoCommonDTO.getRoom() == null || socketIoCommonDTO.getRoom().isEmpty()) {
                socketIOClient.sendEvent("private_message", "BLANK_ROOM");
                System.out.println("Message sent to the room");
                return;
            }

            socketIOServer.getRoomOperations(socketIoCommonDTO.getRoom()).getClients().forEach(roomClient -> {
                if (!roomClient.getSessionId().equals(socketIOClient.getSessionId())) {

                    socketIOClient.sendEvent("private_message", socketIoCommonDTO);
                    System.out.println("messaj");
                    System.out.println("Message sent to the room " + socketIoCommonDTO.getMessage());
                }

            });
        });

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
}
