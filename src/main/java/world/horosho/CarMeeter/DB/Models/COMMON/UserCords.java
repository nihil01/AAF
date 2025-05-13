package world.horosho.CarMeeter.DB.Models.COMMON;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserCords {

    private String userId;
    private String type;
    private double latitude;
    private double longitude;

}

