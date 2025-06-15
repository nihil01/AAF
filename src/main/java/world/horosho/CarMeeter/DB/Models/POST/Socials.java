package world.horosho.CarMeeter.DB.Models.POST;

import lombok.*;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;


@Table("user_social")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class Socials {

    @Column("user_id")
    private long userId;

    String avatar;
    String about;
    String social_networks;

}
