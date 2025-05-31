package world.horosho.CarMeeter.Services.mail;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record RecoveryRequest(
    @NotNull @NotEmpty @Email String email,
    @NotNull @NotEmpty String code,
    @NotNull String password) {
}
