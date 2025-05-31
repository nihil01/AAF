package world.horosho.CarMeeter.Controllers.REST;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.COMMON.UserResponse;
import world.horosho.CarMeeter.DB.Models.POST.FirebaseToken;
import world.horosho.CarMeeter.Services.firebase.FirebaseService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/firebase")
public class FirebaseController {

    private final FirebaseService firebaseService;

    @PostMapping("/sendToken")
    public Mono<String> sendToken(
        @RequestBody FirebaseToken data,
        @AuthenticationPrincipal UserResponse principal
    ){
        return firebaseService
            .registerToken(principal.getUsername(), data.token(), data.deviceID())
            .onErrorResume(throwable -> Mono.error(new RuntimeException("Could not save token !")));
    }

}
