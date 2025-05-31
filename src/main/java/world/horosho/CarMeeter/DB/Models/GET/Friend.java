package world.horosho.CarMeeter.DB.Models.GET;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("users")
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString

public class Friend {
    private String username;
    private Instant registered;
}
