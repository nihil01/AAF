package world.horosho.CarMeeter.DB.Repositories;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.POST.User;

public interface UserRepository extends ReactiveCrudRepository<User, Long> {
    Mono<User> findByEmail(String email);
}
