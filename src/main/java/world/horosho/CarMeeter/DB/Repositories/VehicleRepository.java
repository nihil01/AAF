package world.horosho.CarMeeter.DB.Repositories;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
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
}