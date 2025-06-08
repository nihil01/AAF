package world.horosho.CarMeeter.DB.Models.POST;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class VehiclesWithMedia extends Vehicle {

    private List<String> photo_urls;
    private LocalDate created_at;

    public VehiclesWithMedia(Integer id, String make, String model, Integer year,
                           String engineSpecs, Integer horsePower, String torque,
                           String zeroToHundred, String story, String modifications,
                           List<String> photo_urls, LocalDate created_at) {
        super(id, make, model, year, engineSpecs, horsePower, torque,
              zeroToHundred, story, modifications);
        this.photo_urls = photo_urls;
        this.created_at = created_at;
    }

}