package world.horosho.CarMeeter.sockets.socketIo;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.COMMON.UserResponse;

@RestController
@RequestMapping("/api/v1/keys")
@RequiredArgsConstructor
public class KeyController {

    private final SocketIOService socketIOService;

    @PostMapping("/publish")
    public Mono<String> registerKey(@RequestBody KeyBundleDTO keyBundle, @AuthenticationPrincipal UserResponse user) {
        System.out.println("Key received: " + keyBundle.getPublicKey());
        return socketIOService.registerUserPublicKey(user.getId(), keyBundle.getPublicKey());
    }

    @GetMapping("/fetch/{userId}")
    public Mono<String> fetchKeys(@PathVariable Long userId) {
        return socketIOService.fetchUserKey(userId);
    }

}
