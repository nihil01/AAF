package world.horosho.CarMeeter.Services.entities;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.POST.*;
import world.horosho.CarMeeter.DB.Repositories.UserRepository;
import world.horosho.CarMeeter.DB.Repositories.VehicleRepository;
import world.horosho.CarMeeter.DB.Repositories.VehicleWithMediaRepository;
import world.horosho.CarMeeter.Services.aws.S3Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final VehicleWithMediaRepository vehicleWithMediaRepository;
    private final S3Service s3Service;


    public Mono<Void> delete(String uuid, long id){
        return vehicleRepository
            .findMediaByUuid(uuid)
            .flatMap(vehicle -> {
                if (vehicle.getId() == id){
                    return s3Service.deleteFilesFromS3(vehicle.getPhoto_urls()).then(
                        vehicleRepository.deleteByUuid(vehicle.getUuid())
                    );
                }else{
                    return Mono.error(new RuntimeException("You are not owner of this vehicle!"));
                }
            })
            .doOnSuccess(vehicle -> log.debug("Deleting vehicle with UUID: {}", uuid));
    }

    
    public Flux<VehiclesWithMedia> get(long id){
        return findUserById(id)
            .flatMapMany(user -> vehicleRepository.findMediaByUserID((int) user.getId()))
            .doOnComplete(() -> System.out.println("Data retrieved!"))
            .doOnError(throwable -> System.out.println("error bro"));
    }

    public Mono<Vehicle> add(VehicleUploadForm vehicleForm, long id) {
        return findUserById(id)
            .flatMap(user -> createVehicle(vehicleForm, user.getId()))
            .flatMap(vehicleUuid -> processPhotosAndReturnVehicle(vehicleForm, vehicleUuid))
            .doOnSuccess(vehicle -> log.info("Successfully created vehicle with UUID: {}", vehicle))
            .doOnError(error -> log.error("Failed to create vehicle for user: {}", id, error));
    }

    private Mono<User> findUserById(long id) {
        return userRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("User not found with id: " + id)));
    }

    private Mono<String> createVehicle(VehicleUploadForm form, Long userId) {
        return formToVehicleClass(form, userId.intValue())
                .flatMap(vehicleRepository::saveAndReturn)
                .doOnSuccess(uuid -> log.debug("Created vehicle with UUID: {}", uuid));
    }

    private Mono<Vehicle> processPhotosAndReturnVehicle(VehicleUploadForm form, String vehicleUuid) {

        if (hasNoPhotos(form)) {
            return getVehicleByUuid(vehicleUuid);
        }
        return uploadPhotosAndSaveMedia(form.photos(), vehicleUuid)
            .map(vehiclesWithMedia -> vehiclesWithMedia);

    }

    private boolean hasNoPhotos(VehicleUploadForm form) {
        return form.photos() == null || form.photos().length == 0;
    }

    private Mono<VehiclesWithMedia> uploadPhotosAndSaveMedia(FilePart[] photos, String vehicleUuid) {
        return Flux.fromArray(photos)
                .flatMap(photo -> uploadPhotoAndCreateMedia(photo, vehicleUuid))
                .flatMap(vehicleWithMediaRepository::save)
                .then(vehicleRepository.findMediaByUuid(vehicleUuid))
                .doOnSuccess(v -> log.debug("Successfully uploaded {} photos for vehicle: {}",
                        photos.length, vehicleUuid));
    }

    private Mono<VehicleMedia> uploadPhotoAndCreateMedia(FilePart photo, String vehicleUuid) {
        return photo.content()
            .next()
            .flatMap(dataBuffer ->
                s3Service.uploadFileToS3(dataBuffer.asInputStream())
                    .map(url -> new VehicleMedia(vehicleUuid, url))
                    .doOnSuccess(media -> log.debug("Created media record for vehicle: {}", vehicleUuid))
            );
    }


    private Mono<Vehicle> getVehicleByUuid(String uuid) {
        return vehicleRepository.findByUuid(uuid)
            .switchIfEmpty(Mono.error(new RuntimeException("Vehicle not found with UUID: " + uuid)));
    }

//    private Mono<VehiclesWithMedia> getVehicleWithMedia(String uuid) {
//        return vehicleRepository.findMediaByUuid(uuid)
//                .switchIfEmpty(Mono.error(new RuntimeException("Vehicle not found with UUID: " + uuid)));
//    }

    private Mono<Vehicle> formToVehicleClass(VehicleUploadForm form, int userId) {
        return Mono.fromSupplier(() ->
                Vehicle.builder()
                        .id(userId)
                        .make(form.make())
                        .model(form.model())
                        .year(form.year())
                        .engineSpecs(form.engineSpecs())
                        .horsePower(form.horsePower())
                        .torque(form.torque())
                        .zeroToHundred(form.zeroToHundred())
                        .story(form.story())
                        .modifications(form.modifications())
                        .build()
        );
    }
}