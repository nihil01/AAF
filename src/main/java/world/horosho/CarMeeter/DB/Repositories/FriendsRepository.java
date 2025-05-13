package world.horosho.CarMeeter.DB.Repositories;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.GET.Friend;
import world.horosho.CarMeeter.DB.Models.POST.Friends;

public interface FriendsRepository extends ReactiveCrudRepository<Friends, Long>{
//    @Query("""
//            SELECT u.*
//            FROM users u
//            JOIN friends f ON
//                (f.user_id = :uuid AND f.friend_id = u.user_uuid) OR
//                (f.friend_id = :uuid AND f.user_id = u.user_uuid)
//            """)
//    Mono<User> findFriendByID(String uuid);

    //1.
    @Query("""
            SELECT username, friendship_uuid, registered FROM users u
            JOIN friends f ON f.user_id = u.friendship_uuid
            WHERE f.friend_id = :uuid ORDER BY u.username;
        """)
    Flux<Friend> findFriendship(String uuid);

    //2.
    @Query("""
            DELETE FROM friends
            WHERE user_id = :userID AND friend_id = :friendID
        """)
    Mono<String> deleteFriendship(String userID, String friendID);
}
