package world.horosho.CarMeeter.sockets.socketIo;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface UserPublicKeysRepository extends ReactiveCrudRepository<UserKeys, Long> {
    Mono<UserKeyProjection> findByUserId(long userId);
    Mono<Void> deleteByUserId(long userId);
}

