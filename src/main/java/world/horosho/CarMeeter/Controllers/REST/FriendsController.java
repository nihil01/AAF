package world.horosho.CarMeeter.Controllers.REST;

import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.GET.Friend;
import world.horosho.CarMeeter.DB.Models.POST.Friends;
import world.horosho.CarMeeter.Services.entities.FriendsService;

@RestController
@RequestMapping("/api/v1/friends")
public class FriendsController {

    private final FriendsService friendsService;

    public FriendsController(FriendsService friendsService) {
        this.friendsService = friendsService;
    }

    @PostMapping(value = "/addFriend", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public Mono<ResponseEntity<String>> addFriend(
        @Valid @ModelAttribute Friends user
    ){
        System.out.println(user);
        return friendsService.addFriend(user);
    }

    @GetMapping(value = "/getFriends/{uuid}")
    public Mono<ResponseEntity<Flux<Friend>>> getFriends(
        @PathVariable String uuid
    ){
        if (uuid == null || uuid.isEmpty()){
            return Mono.empty();
        }

        return friendsService.getFriends(uuid);
    }

//    @GetMapping("/test")
//    public Mono<ResponseEntity<UserResponse>> testAuthentication(@AuthenticationPrincipal UserResponse user){
//        return Mono.just(ResponseEntity.ok().body(user));
//    }

    @DeleteMapping(value = "/removeFriend")
    public Mono<ResponseEntity<String>> removeFriend(
        @RequestParam String userID, @RequestParam String friendID
    ){

        if (userID == null || userID.isEmpty() || friendID == null || friendID.isEmpty()){
            return Mono.empty();
        }

        return friendsService.removeFriend(userID, friendID);
    }

}
