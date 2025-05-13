package world.horosho.CarMeeter.DB.Models.POST;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("friends")
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString

public class Friends {
    @NotNull
    @Column("user_id")
    @Size(min = 8, max = 8, message = "User ID must be exactly 8 characters")
    private String userID;

    @NotNull
    @Column("friend_id")
    @Size(min = 8, max = 8, message = "Friend ID must be exactly 8 characters")
    private String friendID;
}