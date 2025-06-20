package world.horosho.CarMeeter.sockets.socketIo;

import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/keys")
public class KeyController {

    private final ConcurrentHashMap<Long, KeyBundleDTO> signalKeys;

    public KeyController(ConcurrentHashMap<Long, KeyBundleDTO> signalKeys) {
        this.signalKeys = signalKeys;
    }

    @PostMapping("/publish")
    public Mono<Void> publishKeys(@RequestBody KeyBundleDTO keyBundle) {
        System.out.println(keyBundle);
        signalKeys.putIfAbsent(keyBundle.getUserId(), keyBundle);
        return Mono.empty();
    }

    @GetMapping("/fetch/{userId}")
    public Mono<KeyBundleDTO> fetchKeys(@PathVariable Long userId) {
        System.out.println(signalKeys);
        return Mono.just(signalKeys.getOrDefault(userId, new KeyBundleDTO()));
    }

}
