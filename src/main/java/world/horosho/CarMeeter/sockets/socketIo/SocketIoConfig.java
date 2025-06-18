package world.horosho.CarMeeter.sockets.socketIo;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class SocketIoConfig {

    @Bean
    public SocketIOServer getSocketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname("10.20.30.2");
        config.setPort(9090);
        return new SocketIOServer(config);
    }

    @Bean
    public ConcurrentHashMap<String, List<String>> userRooms() {
        return new ConcurrentHashMap<>();
    }

}
