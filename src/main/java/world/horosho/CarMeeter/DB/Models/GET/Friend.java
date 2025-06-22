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
    private long id;
    private String username;
    private Instant registered;
    private String avatar;

    public Friend(Friend friend, String avatar) {
        this.id = friend.getId();
        this.username = friend.getUsername();
        this.registered = friend.getRegistered();
        this.avatar = avatar;
    }

}
