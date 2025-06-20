package world.horosho.CarMeeter.sockets.socketIo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class KeyBundleDTO {
    private Long userId;
    private String publicKey;
}

