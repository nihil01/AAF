package world.horosho.CarMeeter.Controllers.REST;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.COMMON.UserResponse;
import world.horosho.CarMeeter.DB.Models.GET.Friend;
import world.horosho.CarMeeter.DB.Models.GET.FriendsStruct;
import world.horosho.CarMeeter.Services.entities.FriendsService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/friends")
public class FriendsController {

    private final FriendsService friendsService;

    public FriendsController(FriendsService friendsService) {
        this.friendsService = friendsService;
    }

    @PostMapping(value = "/addFriend")
    public Mono<ResponseEntity<String>> addFriend(
        @AuthenticationPrincipal UserResponse principal,
        @RequestBody Map<String, String> request
    ){
        System.out.println(request);

        if(request.get("email") == null || request.get("email").equalsIgnoreCase(principal.getUsername())){
            return Mono.just(ResponseEntity.badRequest().body("You can't add yourself as a friend"));
        }

        return friendsService.addFriend(request.get("email"), principal.getUsername());
    }

    @GetMapping("/getUsersByName")
    public Mono<ResponseEntity<List<Friend>>> getUsersByName(
            @RequestParam String name
    ){

        if (name == null || name.isEmpty()){
            return Mono.just(ResponseEntity.badRequest().build());
        }

        return friendsService.getUsersByTheirUsernames(name).collectList().map(ResponseEntity::ok);
    }

    @GetMapping(value = "/getFriends")
    public Mono<ResponseEntity<FriendsStruct>> getFriends(
        @AuthenticationPrincipal UserResponse principal
    ){

        System.out.println(principal.getUsername());
        return friendsService.getFriends(principal.getUsername());
    }

    @GetMapping(value = "/manageFriend")
    public Mono<ResponseEntity<String>> manageFriend(
            @RequestParam String friendName,
            @RequestParam String action,
            @AuthenticationPrincipal UserResponse userResponse
            ){
        System.out.println(friendName);
        System.out.println(action);

        System.out.println(userResponse);
        return friendsService.manageFriend(friendName, userResponse.getUsername(), action)
            .onErrorResume(e -> {
                System.err.println("Error managing friend: " + e.getMessage());
                return Mono.just(ResponseEntity.internalServerError().body("Failed to manage friend"));
            })
            .defaultIfEmpty(ResponseEntity.notFound().build())
            .doOnSuccess(Mono::just);
    }

    @DeleteMapping(value = "/removeFriend")
    public Mono<ResponseEntity<String>> removeFriend(
        @RequestParam String friendName,
        @AuthenticationPrincipal UserResponse userResponse
    ){
        if (friendName == null || friendName.equalsIgnoreCase(userResponse.getUsername())){
            return Mono.just(ResponseEntity.badRequest().body("Something went wrong..."));
        }

        System.out.println(userResponse);
        System.out.println(friendName);

        return friendsService.removeFriend(userResponse.getUsername(), friendName);
    }

}
