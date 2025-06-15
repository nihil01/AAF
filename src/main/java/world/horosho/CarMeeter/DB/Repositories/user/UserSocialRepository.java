package world.horosho.CarMeeter.DB.Repositories.user;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.POST.Socials;

public interface UserSocialRepository extends ReactiveCrudRepository<Socials, Long> {
    // Use userId field name instead of user_id to match entity property
    Mono<Socials> findByUserId(Long userId);
}

