package world.horosho.CarMeeter.Services.entities;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.GET.Friend;
import world.horosho.CarMeeter.DB.Models.GET.FriendsStruct;
import world.horosho.CarMeeter.DB.Models.POST.Friends;
import world.horosho.CarMeeter.DB.Redis.RedisService;
import world.horosho.CarMeeter.DB.Repositories.FriendsRepository;
import world.horosho.CarMeeter.DB.Repositories.user.UserRepository;
import world.horosho.CarMeeter.Services.firebase.FirebaseService;

import java.util.List;
import java.util.Locale;

@Service
public class FriendsService {

    private final FriendsRepository friendsRepository;
    private final UserRepository userRepository;
    private final FirebaseService firebaseService;
    private final RedisService redisService;

    public FriendsService(FriendsRepository friendsRepository, UserRepository userRepository, RedisService redisService,
                          FirebaseService firebaseService) {
        this.friendsRepository = friendsRepository;
        this.firebaseService = firebaseService;
        this.redisService = redisService;
        this.userRepository = userRepository;
    }

    public Mono<ResponseEntity<String>> removeFriend(String userID, String friendID) {
        System.out.println(userID);
        System.out.println(friendID);

        return friendsRepository
            .deleteFriendship(userID, friendID)
            .map(result -> ResponseEntity.ok("Friend removed successfully"))
            .onErrorResume(error -> Mono.just(ResponseEntity.badRequest().body("Failed to remove a friend!")));
    }

    public Mono<ResponseEntity<String>> addFriend(String friend, String me) {
        return userRepository.findByUsername(friend)
            .flatMap(user -> {
                if (user == null) {
                    return Mono.error(new RuntimeException("User not found"));
                }

                return redisService.setFriendshipAwaiting(me, friend)
                    .then(firebaseService.sendFriendshipNotification(user.getId(), friend))
                    .then(Mono.just(ResponseEntity.ok("Friend request sent successfully")))
                    .onErrorResume(error -> Mono.just(ResponseEntity.badRequest().body("Failed to add friend: "
                            + error.getMessage())));

            })
            .switchIfEmpty(Mono.error(new RuntimeException("User not found")));
    }

    public Mono<ResponseEntity<FriendsStruct>> getFriends(String uuid) {
        return redisService.getFriendshipAwaiting(uuid)
            .flatMap(userRepository::findByUsername)
            .collectList()
            .zipWith(friendsRepository.findFriendship(uuid).collectList())
            .map(tuple -> {
                FriendsStruct friends = new FriendsStruct(tuple.getT1(), tuple.getT2());
                return ResponseEntity.ok(friends);
            })
            .doOnSuccess(resp -> System.out.println("Friends retrieved: " + resp.getBody()))
            .onErrorResume(e -> {
                e.printStackTrace();
                return Mono.just(ResponseEntity.ok(new FriendsStruct(List.of(), List.of())));
            });
    }


    public Mono<ResponseEntity<String>> manageFriend(String friendID, String myID, String action) {
        return switch (action.toLowerCase(Locale.ROOT)) {
            case "accept" -> redisService.removeFriendshipAwaiting(myID, friendID)
                    .flatMap(aBoolean -> {
                        if (aBoolean) {
                            return userRepository.findByUsername(friendID)
                                .flatMap(friend -> friendsRepository.save(new Friends(myID, friendID)))
                                .then(Mono.just(ResponseEntity.ok("User saved to friends!")));
                        } else {
                            return Mono.error(new RuntimeException("No friendship request found"));
                        }
                    });
            case "reject" -> redisService.removeFriendshipAwaiting(myID, friendID)
                    .then(Mono.just(ResponseEntity.ok("Friend request rejected!")))
                    .onErrorResume(error -> Mono.just(ResponseEntity.badRequest().body("Could not reject !")));
            default -> Mono.just(ResponseEntity.badRequest().body("Not cool"));
        };

    }

    public Flux<Friend> getUsersByTheirUsernames(String username){
        return userRepository.findByUsernameContaining(username).switchIfEmpty(Flux.empty());
    }

}
