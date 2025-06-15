package world.horosho.CarMeeter.Controllers.REST;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.COMMON.UserResponse;
import world.horosho.CarMeeter.DB.Models.POST.Vehicle;
import world.horosho.CarMeeter.DB.Models.POST.VehicleUploadForm;
import world.horosho.CarMeeter.DB.Models.POST.VehiclesWithMedia;
import world.horosho.CarMeeter.Services.entities.VehicleService;

@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping(path = "/submitVehicleData", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<Vehicle> addVehicle(@Valid VehicleUploadForm form, @AuthenticationPrincipal UserResponse user) {
        System.out.println(form);

        return vehicleService.add(form, user.getId())
            .onErrorResume(e -> {
                return Mono.error(new RuntimeException("Error adding vehicle: " + e.getMessage()));
            });

    }

    @GetMapping("/getVehicleData")
    public Flux<VehiclesWithMedia> getVehicles(@AuthenticationPrincipal UserResponse user){

        return vehicleService.get(user.getId())
            .onErrorResume(e -> Mono.error(new RuntimeException("Error getting vehicle: " + e.getMessage())));
    }

    @DeleteMapping("/deleteVehicle/{uuid}")
    public Mono<Void> deleteVehicle(@PathVariable("uuid") String uuid, @AuthenticationPrincipal UserResponse user) {
        return vehicleService.delete(uuid, user.getId())
            .onErrorResume(e -> {
                return Mono.error(new RuntimeException("Error deleting vehicle: " + e.getMessage()));
            });
    }


}
