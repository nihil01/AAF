package world.horosho.CarMeeter.sockets;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.COMMON.UserCords;


@Component
public class SocketHandler implements WebSocketHandler {

    private final SocketUtils socketUtils;

    public SocketHandler(SocketUtils socketUtils) {
        this.socketUtils = socketUtils;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        return session.receive()
                .map(WebSocketMessage::getPayloadAsText)
                .doOnNext(System.out::println)
                .flatMap(s -> {
                    ObjectMapper mapper = new ObjectMapper();
                    try {
                        UserCords userCords = mapper.readValue(s, UserCords.class);

                        switch (userCords.getType()) {
                            case "init" -> {
                                return socketUtils.registerUser(userCords.getUserId(), session);
                            }
                            case "broadcast" -> {
                                return socketUtils.broadcast(userCords.getUserId(), userCords);
                            }
                            case "disconnect" -> {
                                return socketUtils.removeUser(userCords.getUserId());
                            }
                            default -> {
                                return session.send(Mono.just(session.textMessage("Error: Unknown message type: " + userCords.getType())));
                            }
                        }

                    } catch (Exception e) {
                        return session.send(Mono.just(session.textMessage("Error: " + e.getMessage())));
                    }
                }).then();
    }
}
