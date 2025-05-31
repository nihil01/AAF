package world.horosho.CarMeeter.DB.Models.POST;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Getter
@Setter
@Builder
@Table("fcm_tokens")
public class FCM {
    @Id
    private long id;

    @Column("user_id")
    private long userId;

    @NotBlank
    private String fcm_token;

    @NotBlank
    private String device_id;

    private Instant created_at;
}
