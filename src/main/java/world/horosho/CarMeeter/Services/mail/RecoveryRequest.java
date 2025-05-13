package world.horosho.CarMeeter.Services.mail;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RecoveryRequest(
    @NotNull @NotEmpty @Email String email,
    @NotNull @NotEmpty String code,
    @NotNull @NotEmpty @Size(min = 8, max = 32)String password) {
}
