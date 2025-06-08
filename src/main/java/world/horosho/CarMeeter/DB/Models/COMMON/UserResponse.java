package world.horosho.CarMeeter.DB.Models.COMMON;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class UserResponse {

    private long id;
    private String email;
    private String username;
    private String registered;
    private Boolean success;

}
