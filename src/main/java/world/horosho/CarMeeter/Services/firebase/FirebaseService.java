package world.horosho.CarMeeter.Services.firebase;

import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Repositories.FCMRepository;
import world.horosho.CarMeeter.DB.Repositories.UserRepository;

@Service
@RequiredArgsConstructor
public class FirebaseService implements FirebaseUtilities{

    private final FCMRepository fcmRepository;
    private final UserRepository userRepository;

    public Mono<String> registerToken(String username, String token, String deviceID) {
        return userRepository.findByUsername(username)
            .switchIfEmpty(Mono.error(new RuntimeException("User not found with username: " + username)))
            .flatMap(projection -> projectionToFCM(projection, token, deviceID)
                .onErrorResume(e -> Mono.error(new RuntimeException("Failed to create FCM projection: " + e.getMessage())))
            .flatMap(fcm -> fcmRepository.save(fcm)
                .onErrorResume(e -> Mono.error(new RuntimeException("Failed to save FCM token: " + e.getMessage()))))
            .thenReturn("FCM data has been written in DB!")
            .onErrorResume(e -> {
                System.err.println("Error registering FCM token: " + e.getMessage());
                return Mono.error(e);
            }));
    }

    public Mono<Void> sendFriendshipNotification(int userID, String friend) {
        return fcmRepository.findByUserId(userID)
            .collectList()
            .flatMap(fcms -> Mono.when(
                fcms.stream()
                    .map(fcm -> sendNotification(fcm.getFcm_token(),
                        "New Friendship Request", "User: " + friend))
                    .toList()
            )
        );
    }

    private Mono<Void> sendNotification(String token, String title, String body) {

        //Notification sounds

        // for iOS
        Aps aps = Aps.builder()
                .setSound("default")
                .build();

        ApnsConfig apnsConfig = ApnsConfig.builder()
                .setAps(aps)
                .build();

        // for Android
        AndroidNotification androidNotification = AndroidNotification.builder()
                .setSound("default")
                .build();

        AndroidConfig androidConfig = AndroidConfig.builder()
                .setNotification(androidNotification)
                .build();

        Notification notification = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        Message message = Message.builder()
                .setToken(token)
                .setApnsConfig(apnsConfig)
                .setAndroidConfig(androidConfig)
                .setNotification(notification)
                .putData("dataLink", title.equals("New Friendship Request") ? "/connections" : "")
                .build();

        return Mono.fromCallable(() -> {
            try {
                FirebaseMessaging.getInstance().send(message);
                System.out.println("Successfully sent message");
                return null;
            } catch (FirebaseMessagingException e) {
                System.err.println("Error sending message: " + e.getMessage());
                throw new RuntimeException(e);
            }
            })
            .doOnSuccess(unused -> System.out.println("Successfully sent message"))
            .doOnError(e -> System.err.println("Error sending message: " + e.getMessage()))
            .then();
    }

}