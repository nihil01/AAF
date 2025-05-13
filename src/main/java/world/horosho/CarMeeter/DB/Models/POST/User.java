package world.horosho.CarMeeter.DB.Models.POST;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("users")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class User {

    @Id
    private long id;

    @NotBlank
    @Pattern(regexp = "^(login|register)$", message = "Invalid type")
    @Transient
    private String type;

    @NotBlank
    @Email
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Invalid email format")
    protected String email;

    @NotNull
    @Size(max = 30)
    protected String username;

    @NotNull
    private String password;

    @Column("ip_address")
    protected String ipAddress;

    @Column("friendship_uuid")
    private String friendshipUUID;

    private Instant registered;

    private String idToken;

    @Transient
    private String code;

    public User(String type, String email, String username, String password, String ipAddress, String idToken) {
        this.type = type;
        this.email = email;
        this.username = username;
        this.password = password;
        this.ipAddress = ipAddress;
        this.idToken = idToken;
    }

    // Упрощённый конструктор без пароля
    public User(String email, String username, String ipAddress, String idToken) {
        this.email = email;
        this.username = username;
        this.ipAddress = ipAddress;
        this.idToken = idToken;
    }



}