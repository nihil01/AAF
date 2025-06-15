package world.horosho.CarMeeter.DB.Repositories.vehicle;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import world.horosho.CarMeeter.DB.Models.POST.VehicleMedia;

public interface VehicleWithMediaRepository extends ReactiveCrudRepository<VehicleMedia, Long> {
}
