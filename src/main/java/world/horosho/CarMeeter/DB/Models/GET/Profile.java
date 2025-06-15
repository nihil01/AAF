package world.horosho.CarMeeter.DB.Models.GET;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    String username;
    Instant registered;
    boolean online;
    String avatar;
    String about;
    String social_networks;
    List<VehicleProfile> vehicles;

}
