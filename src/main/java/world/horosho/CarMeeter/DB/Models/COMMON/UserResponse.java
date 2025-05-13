package world.horosho.CarMeeter.DB.Models.COMMON;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class UserResponse {

    private String email;
    private String username;
    private String registered;
    private Boolean success;
    private String friendship_uuid;

}
