package world.horosho.CarMeeter.Configs;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Setter
@Getter
@Configuration
@ConfigurationProperties(prefix = "spring.security.jwt")
public class JwtProperties {
    // Getters and setters
    private String secret;
    private String accessToken;
    private String refreshToken;

}