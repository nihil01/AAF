package world.horosho.CarMeeter.DB.Repositories;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.GET.Friend;
import world.horosho.CarMeeter.DB.Models.POST.Friends;

public interface FriendsRepository extends ReactiveCrudRepository<Friends, Long>{

    //1.
    @Query("""
            SELECT u.username, u.registered
            FROM users u
            JOIN friends f ON u.username = f.friend_name AND f.user_name = :name
            UNION
            SELECT u.username, u.registered
            FROM users u
            JOIN friends f ON u.username = f.user_name AND f.friend_name = :name;
            
        """)
    Flux<Friend> findFriendship(String name);

//2.
    @Query("""
            DELETE FROM friends
            WHERE (user_name = :userName AND friend_name = :friendName)
            OR (user_name = :friendName AND friend_name = :userName)
        """)
    Mono<String> deleteFriendship(String userName, String friendName);
}
