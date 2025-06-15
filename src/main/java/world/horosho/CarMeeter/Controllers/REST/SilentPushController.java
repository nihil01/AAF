package world.horosho.CarMeeter.Controllers.REST;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.COMMON.LatLng;
import world.horosho.CarMeeter.DB.Models.COMMON.UserCords;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/silent")
@RequiredArgsConstructor
public class SilentPushController {

    private final ConcurrentHashMap<String, WebSocketSession> activeConnections;
    private final ConcurrentHashMap<String, List<String>> userFriends;
    private final ConcurrentHashMap<String, LatLng> userCords;

    @PostMapping("/push")
    public Mono<Void> addSilentPush(@RequestBody UserCords cords) {

        System.out.println("Incoming data from silent push!!");
        System.out.println(cords);
        System.out.println("Oya ! user friends here! " + userFriends);

        ObjectMapper mapper = new ObjectMapper();
        switch (cords.getType()) {
            case "broadcast" -> {

                return broadcastProducer(cords, mapper, userCords, userFriends, activeConnections);

            }
            case "disconnect" -> {
                WebSocketSession s = activeConnections.remove(cords.getUserName());
                if (s.isOpen()) s.close();
                userCords.remove(cords.getUserName());
                userFriends.remove(cords.getUserName());
            }
        }
        return Mono.empty();
    }

    public static Mono<Void> broadcastProducer(@RequestBody UserCords cords, ObjectMapper mapper,
                    ConcurrentHashMap<String, LatLng> userCords, ConcurrentHashMap<String, List<String>> userFriends,
                    ConcurrentHashMap<String, WebSocketSession> activeConnections) {
        userCords.put(cords.getUserName(), new LatLng(cords.getLatitude(), cords.getLongitude()));

        if (userFriends.get(cords.getUserName()) == null) {
            return Mono.empty();
        }

        return Mono.fromRunnable(() -> userFriends.get(cords.getUserName()).forEach(s -> {
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

    @GetMapping("/nearby")
    public Mono<Map<String, LatLng>> getNearbyUsers(@RequestParam Double lat, @RequestParam Double lon) {

        System.out.println("New request!");
        if (lat == null || lon == null || Double.isNaN(lat) || Double.isNaN(lon)) return Mono.empty();

        double delta = 0.01;

        return Mono.just(
            userCords.entrySet()
                .stream()
                .filter(entry -> {
                    System.out.println("Processing entry " + entry);
                    LatLng latLng = entry.getValue();
                    return Math.abs(latLng.latitude() - lat) <= delta
                            && Math.abs(latLng.longitude() - lon) <= delta;
                })
                .sorted(Comparator.comparingDouble(entry ->
                        euclidDistance(new LatLng(lat, lon), entry.getValue())))
                .limit(10)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        HashMap::new
                ))
        );
    }

    private double euclidDistance(LatLng user, LatLng target) {
        return Math.sqrt(Math.pow(user.latitude() - target.latitude(), 2) + Math.pow(user.longitude() - target.longitude(), 2));
    }

}
