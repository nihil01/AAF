package world.horosho.CarMeeter.DB.Repositories.vehicle;

import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.GET.VehicleProfile;
import world.horosho.CarMeeter.DB.Models.POST.Vehicle;
import world.horosho.CarMeeter.DB.Models.POST.VehiclesWithMedia;

public interface VehicleRepository extends ReactiveCrudRepository<Vehicle, String> {

    // Insert and return the generated UUID
    @Query("INSERT INTO vehicles (id, make, model, year, engine_specs, horse_power, torque, zero_to_hundred, story, modifications) " +
            "VALUES (:#{#v.id}, :#{#v.make}, :#{#v.model}, :#{#v.year}, :#{#v.engineSpecs}, :#{#v.horsePower}, :#{#v.torque}, :#{#v.zeroToHundred}, :#{#v.story}, :#{#v.modifications}) " +
            "RETURNING uuid::text")
    Mono<String> saveAndReturn(Vehicle v);

    @Query("SELECT v.*, array_agg(vp.photo_url) as photo_urls " +
            "FROM vehicles v " +
            "LEFT JOIN vehicle_photos vp ON vp.vehicle_uuid = v.uuid " +
            "WHERE v.uuid::text = :uuid " +
            "GROUP BY v.uuid, v.id, v.make, v.model, v.year, v.engine_specs, v.horse_power, v.torque, v.zero_to_hundred, v.story, v.modifications, v.created_at")
    Mono<VehiclesWithMedia> findMediaByUuid(String uuid);

    @Query("SELECT v.*, array_agg(vp.photo_url) as photo_urls " +
            "FROM vehicles v " +
            "LEFT JOIN vehicle_photos vp ON vp.vehicle_uuid = v.uuid " +
            "WHERE v.id = :id " +
            "GROUP BY v.uuid, v.id, v.make, v.model, v.year, v.engine_specs, v.horse_power, v.torque, v.zero_to_hundred, v.story, v.modifications, v.created_at")
    Flux<VehiclesWithMedia> findMediaByUserID(int id);

    // Find vehicle by UUID
    @Query("SELECT * FROM vehicles WHERE uuid::text = :uuid")
    Mono<Vehicle> findByUuid(String uuid);

    Mono<Void> deleteByUuid(String uuid);

    //Find a group of user vehicles (to display in profile)
    @Query("SELECT v.make, v.model, v.year, v.engine_specs, v.horse_power, v.torque, v.zero_to_hundred, v.story, v.modifications, v.created_at, array_agg(vp.photo_url) as photo_urls \n" +
            "FROM users u LEFT JOIN vehicles v ON u.id = v.id LEFT JOIN\n" +
            "vehicle_photos vp ON v.uuid = vp.vehicle_uuid WHERE u.username = :username " + // Added missing space before GROUP BY
            "GROUP BY v.make, v.model, v.year, v.engine_specs, v.horse_power, v.torque, v.zero_to_hundred, v.story, v.modifications, v.created_at")
    Flux<VehicleProfile> findUserVehicleDataByUsername(String username);
}