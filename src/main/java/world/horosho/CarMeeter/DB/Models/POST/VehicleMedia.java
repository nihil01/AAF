package world.horosho.CarMeeter.DB.Models.POST;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("vehicle_photos")
public class VehicleMedia {

    @Id
    private Long id;

    @Column("vehicle_uuid")
    private String vehicleUuid;

    @Column("photo_url")
    private String photoUrl;

    @Column("created_at")
    private LocalDateTime createdAt;

    // Constructor for creating new instances (without id and createdAt)
    public VehicleMedia(String vehicleUuid, String photoUrl) {
        this.vehicleUuid = vehicleUuid;
        this.photoUrl = photoUrl;
        // createdAt will be set by database default
    }
}