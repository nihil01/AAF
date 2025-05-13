package world.horosho.CarMeeter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import world.horosho.CarMeeter.Configs.JwtProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class CarMeeterApplication {

	public static void main(String[] args) {
		SpringApplication.run(CarMeeterApplication.class, args);
	}

}
