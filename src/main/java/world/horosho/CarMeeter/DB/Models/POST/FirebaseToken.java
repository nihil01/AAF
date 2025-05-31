package world.horosho.CarMeeter.DB.Models.POST;

import jakarta.validation.constraints.NotBlank;

public record FirebaseToken(@NotBlank String token, @NotBlank String deviceID) {
}
