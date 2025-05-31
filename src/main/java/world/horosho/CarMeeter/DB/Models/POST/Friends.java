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
    @Column("user_name")
    private String user;

    @NotNull
    @Column("friend_name")
    private String friend;
}