package world.horosho.CarMeeter.Controllers.REST;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.COMMON.UserResponse;
import world.horosho.CarMeeter.DB.Models.GET.Profile;
import world.horosho.CarMeeter.DB.Models.PUT.BioRequest;
import world.horosho.CarMeeter.Services.entities.UserService;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final UserService userService;

    @GetMapping
    public Mono<Profile> getVehicleProfile(
            @AuthenticationPrincipal UserResponse user,
            @RequestParam(value = "username", required = false) String username) {

        System.out.println(user);
        System.out.println("username: " + username);

        if (user == null) {
            return Mono.error(new IllegalArgumentException("User not authenticated"));
        }

        if (username == null || username.isBlank()) {
            return userService.getUserProfileByUsername(user.getUsername())
                    .switchIfEmpty(Mono.error(new IllegalArgumentException("Profile not found")));
        }

        return userService.getUserProfileByUsername(username)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Profile not found")));
    }

    @PutMapping(path = "/updateBio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<Void> updateProfile(
            @AuthenticationPrincipal UserResponse principal,
            BioRequest request
    ) {
        System.out.println(request);
        try {
            return userService.updateUserBio(principal.getId(), request);
        } catch (JsonProcessingException e) {
            return Mono.error(e);
        }

    }


}
