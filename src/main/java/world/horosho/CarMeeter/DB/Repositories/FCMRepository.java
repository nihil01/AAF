package world.horosho.CarMeeter.DB.Repositories;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import world.horosho.CarMeeter.DB.Models.POST.FCM;

public interface FCMRepository extends ReactiveCrudRepository<FCM, Long> {
    Flux<FCM> findByUserId(long id);
}
