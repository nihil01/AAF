package world.horosho.CarMeeter.DB.Repositories.user;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.POST.Socials;

import java.util.Collection;
import java.util.List;

public interface UserSocialRepository extends ReactiveCrudRepository<Socials, Long> {

    Mono<Socials> findByUserId(Long userId);

    @Query("""
        SELECT u.id, u.username, u.registered, s.avatar
        FROM users u
        LEFT JOIN user_social s ON u.id = s.user_id
        WHERE u.username LIKE CONCAT('%', :username, '%')
    """)
    Flux<UserSocialsProjection> findUserFriendDataByUsername(String username);
}

