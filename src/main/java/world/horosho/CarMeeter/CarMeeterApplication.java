package world.horosho.CarMeeter;

import lombok.AllArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import world.horosho.CarMeeter.Configs.JwtProperties;
import world.horosho.CarMeeter.sockets.socketIo.SocketIoHandler;

import javax.annotation.PostConstruct;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
@AllArgsConstructor
public class CarMeeterApplication {

	private SocketIoHandler socketIOHandler;

	public static void main(String[] args) {
		SpringApplication.run(CarMeeterApplication.class, args);
	}

	@PostConstruct
	public void init() {
		if (socketIOHandler != null) socketIOHandler.startServer();
	}
}
