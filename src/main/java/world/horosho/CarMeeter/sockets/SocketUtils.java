package world.horosho.CarMeeter.sockets;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.GET.Friend;
import world.horosho.CarMeeter.DB.Models.COMMON.UserCords;
import world.horosho.CarMeeter.DB.Repositories.FriendsRepository;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SocketUtils {
    //temporary; replace with redis

    private final ConcurrentHashMap<String, WebSocketSession> activeConnections = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, List<String>> userFriends = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();
    private final FriendsRepository friendsRepository;

    public SocketUtils(FriendsRepository friendsRepository) {
        this.friendsRepository = friendsRepository;
    }

public Mono<Void> registerUser(String userID, WebSocketSession session) {
        activeConnections.putIfAbsent(userID, session);

        //set a friend list, according to user mapping (USER_ID => [FRIENDS_LIST])
        return friendsRepository.findFriendship(userID)
                .collectList()
                .doOnNext(friends -> {
                    List<String> friendIds = friends.stream()
                            .map(Friend::getFriendship_uuid)
                            .toList();
                    userFriends.put(userID, friendIds);
                })
                .then(Mono.fromRunnable(() -> {
                    System.out.println("User " + userID + " registered");
                    System.out.println(userFriends);
                }));


}

    public Mono<Void> removeUser(String userID) {
        WebSocketSession session = activeConnections.remove(userID);
        return session.isOpen() ? session.close() : Mono.empty();
    }

    public Mono<Void> broadcast(String userID, UserCords cords) {
        if (userFriends.get(userID) == null) {
            return Mono.empty();
        }

        return Mono.fromRunnable(() -> userFriends.get(userID).forEach(s -> {
            if (activeConnections.containsKey(s)) {
                try {
                    WebSocketSession session = activeConnections.get(s);
                    session.send(Mono.just(session.textMessage(mapper.writeValueAsString(cords))))
                            .subscribe();
                } catch (JsonProcessingException e) {
                    throw new RuntimeException(e);
                }
            }
        }));

    }
}
