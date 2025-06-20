package world.horosho.CarMeeter.sockets.socketIo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class SocketIoCommonDTO {

    private long from;
    private long to;
    private String message;
    private SocketEventTypes type;
    private String room;
    private Long timestamp;
    private String publicKey;
    private int[] iv;
    private String encryptedAESKey;
}