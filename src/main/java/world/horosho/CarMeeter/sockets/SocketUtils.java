package world.horosho.CarMeeter.sockets;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.COMMON.LatLng;
import world.horosho.CarMeeter.DB.Models.GET.Friend;
import world.horosho.CarMeeter.DB.Models.COMMON.UserCords;
import world.horosho.CarMeeter.DB.Repositories.FriendsRepository;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import static world.horosho.CarMeeter.Controllers.REST.SilentPushController.broadcastProducer;

@Component
public class SocketUtils {
    //temporary; replace with redis

    private final ConcurrentHashMap<String, WebSocketSession> activeConnections;
    private final ConcurrentHashMap<String, List<String>> userFriends;
    private final ConcurrentHashMap<String, LatLng> userCords;

    private final ObjectMapper mapper = new ObjectMapper();
    private final FriendsRepository friendsRepository;

    public SocketUtils(
            ConcurrentHashMap<String, WebSocketSession> activeConnections,
            ConcurrentHashMap<String, List<String>> userFriends,
            FriendsRepository friendsRepository,
            ConcurrentHashMap<String, LatLng> userCords
    ) {
        this.activeConnections = activeConnections;
        this.userFriends = userFriends;
        this.friendsRepository = friendsRepository;
        this.userCords = userCords;
    }

    public Mono<Void> registerUser(String userName, WebSocketSession session) {
        activeConnections.putIfAbsent(userName, session);

        return friendsRepository.findFriendship(userName)
                .collectList()
                .doOnNext(friends -> {
                    List<String> friendIds = friends.stream()
                            .map(Friend::getUsername)
                            .toList();
                    userFriends.put(userName, friendIds);
                })
                .then(Mono.fromRunnable(() -> {
                    System.out.println("User " + userName + " registered");
                    System.out.println(userFriends);
                }));


}

    public Mono<Void> removeUser(String userName) {
        userFriends.remove(userName);
        userCords.remove(userName);

        WebSocketSession session = activeConnections.remove(userName);
        return session.isOpen() ? session.close() : Mono.empty();
    }

    public Mono<Void> broadcast(UserCords cords) {

        return broadcastProducer(cords, mapper, userCords, userFriends, activeConnections);

    }
}
