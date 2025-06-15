package world.horosho.CarMeeter.DB.Models.GET;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleProfile {
    private String make;
    private String model;
    private Integer year;
    private String engineSpecs;
    private Integer horsePower;
    private Integer torque;
    private Double zeroToHundred;
    private String story;
    private String modifications;
    private LocalDateTime created_at;
    private List<String> photo_urls;
}