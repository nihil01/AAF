package world.horosho.CarMeeter.sockets.socketIo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("user_keys")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserKeys {

    @Id
    private long id;

    @Column("user_id")
    private long userId;

    @Column("public_key")
    private String publicKey;

}
