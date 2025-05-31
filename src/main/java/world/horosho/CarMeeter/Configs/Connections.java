package world.horosho.CarMeeter.Configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.socket.WebSocketSession;
import world.horosho.CarMeeter.DB.Models.COMMON.LatLng;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;


@Configuration
public class Connections {

    @Bean
    public ConcurrentHashMap<String, WebSocketSession> activeConnections(){
        return new ConcurrentHashMap<>();
    }

    @Bean
    public ConcurrentHashMap<String, List<String>> userFriends(){
        return new ConcurrentHashMap<>();
    }

    @Bean
    public ConcurrentHashMap<String, LatLng> userCords(){
        return new ConcurrentHashMap<>();
    }

}