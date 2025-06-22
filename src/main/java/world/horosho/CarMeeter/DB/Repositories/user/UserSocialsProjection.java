package world.horosho.CarMeeter.DB.Repositories.user;
import java.time.Instant;


public record UserSocialsProjection(
        Long id,
        String username,
        Instant registered,
        String avatar
) {}

