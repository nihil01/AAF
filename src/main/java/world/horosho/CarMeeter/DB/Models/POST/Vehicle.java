package world.horosho.CarMeeter.DB.Models.POST;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table("vehicles")
public class Vehicle {

    @Id
    @Column("uuid")
    private String uuid;

    @Column("id")
    private Integer id;

    @Column("make")
    private String make;

    @Column("model")
    private String model;

    @Column("year")
    private Integer year;

    @Column("engine_specs")
    private String engineSpecs;

    @Column("horse_power")
    private Integer horsePower;

    @Column("torque")
    private String torque;

    @Column("zero_to_hundred")
    private String zeroToHundred;

    @Column("story")
    private String story;

    @Column("modifications")
    private String modifications;

    @Column("created_at")
    private LocalDateTime createdAt;

    // Constructor without uuid and createdAt (for new vehicles)
    public Vehicle(Integer id, String make, String model, Integer year,
                   String engineSpecs, Integer horsePower, String torque,
                   String zeroToHundred, String story, String modifications) {
        this.id = id;
        this.make = make;
        this.model = model;
        this.year = year;
        this.engineSpecs = engineSpecs;
        this.horsePower = horsePower;
        this.torque = torque;
        this.zeroToHundred = zeroToHundred;
        this.story = story;
        this.modifications = modifications;
    }
}