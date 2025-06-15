package world.horosho.CarMeeter.DB.Models.PUT;

import org.springframework.http.codec.multipart.FilePart;

public record BioRequest(
    FilePart avatar,
    String about,
    String social_networks
) {
}