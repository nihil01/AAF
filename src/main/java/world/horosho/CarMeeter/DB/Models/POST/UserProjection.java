package world.horosho.CarMeeter.DB.Models.POST;

import java.time.Instant;

public interface UserProjection {

    Integer getId();
    String getUsername();
    Instant getRegistered();

}
