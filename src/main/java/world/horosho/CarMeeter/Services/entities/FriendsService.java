package world.horosho.CarMeeter.Services.entities;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.GET.Friend;
import world.horosho.CarMeeter.DB.Models.POST.Friends;
import world.horosho.CarMeeter.DB.Repositories.FriendsRepository;

@Service

public class FriendsService {
    private final FriendsRepository friendsRepository;

    public FriendsService(FriendsRepository friendsRepository) {
        this.friendsRepository = friendsRepository;
    }

    public Mono<ResponseEntity<String>> removeFriend(String userID, String friendID){

        return friendsRepository
                .deleteFriendship(userID, friendID)
                .map(result -> ResponseEntity.ok("Friend removed successfully"))
                .onErrorResume(error -> Mono.just(ResponseEntity.badRequest().body("Failed to remove a friend!")));
    }

    public Mono<ResponseEntity<String>> addFriend(Friends user){

        return friendsRepository
                .save(user)
                .map(savedUser -> ResponseEntity.ok("Friend added successfully"))
                .onErrorResume(error -> Mono.just(ResponseEntity.badRequest().body("Failed to add friend " + error.getMessage())));
    }

    public Mono<ResponseEntity<Flux<Friend>>> getFriends(String uuid){
        return Mono.just(ResponseEntity.ok(friendsRepository
                .findFriendship(uuid)
                .switchIfEmpty(Flux.empty())
                .onErrorResume(throwable -> Flux.empty())));
    }

}
