package world.horosho.CarMeeter.DB.Repositories.user;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.GET.Friend;
import world.horosho.CarMeeter.DB.Models.POST.User;
import world.horosho.CarMeeter.DB.Models.POST.UserProjection;

public interface UserRepository extends ReactiveCrudRepository<User, Long> {
    Mono<User> findByEmail(String email);
    Mono<UserProjection> findByUsername(String friendshipUUID);
    Mono<User> findByUsernameAndEmail(String username, String email);
    Flux<Friend> findByUsernameContaining(String username);
}
