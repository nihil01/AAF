package world.horosho.CarMeeter.DB.Models.POST;

import jakarta.validation.constraints.*;
import org.springframework.data.annotation.Transient;
import org.springframework.http.codec.multipart.FilePart;

public record VehicleUploadForm(
    @NotBlank(message = "Make is required")
    String make,

    @NotBlank(message = "Model is required")
    String model,

    @Min(value = 1900, message = "Year must be after 1900")
    int year,

    @NotBlank(message = "Engine specs are required")
    String engineSpecs,

    @Min(value = 1, message = "Horsepower must be greater than 0")
    int horsePower,

    @NotBlank(message = "Torque is required")
    String torque,

    @NotBlank(message = "0-100 time is required")
    String zeroToHundred,

    @NotBlank(message = "Story is required")
    @Size(min = 10, message = "Story must be at least 10 characters")
    String story,

    String modifications,

    @Transient
    @Size(max = 5, message = "Maximum 5 photos allowed")
    FilePart[] photos
){}