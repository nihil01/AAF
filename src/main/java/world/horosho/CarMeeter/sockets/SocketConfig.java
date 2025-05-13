package world.horosho.CarMeeter.sockets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class SocketConfig {

    private final SocketHandler socketHandler;

    @Autowired
    public SocketConfig(SocketHandler socketHandler) {
        this.socketHandler = socketHandler;
    }

    @Bean
    public HandlerMapping handlerMapping() {
        Map<String, WebSocketHandler> handlerMap = new HashMap<>();
        handlerMap.put("/api/v1/socket", socketHandler);
        return new SimpleUrlHandlerMapping(handlerMap, Ordered.HIGHEST_PRECEDENCE);
    }

}
