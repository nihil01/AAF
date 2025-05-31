package world.horosho.CarMeeter.Services.google;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.COMMON.OauthUser;
import world.horosho.CarMeeter.DB.Models.COMMON.UserResponse;
import world.horosho.CarMeeter.Services.entities.UserService;
import world.horosho.CarMeeter.Services.entities.UserUtilities;

import java.security.GeneralSecurityException;
import java.util.List;

@Service
@AllArgsConstructor
public class ApiClient implements UserUtilities {

    private final UserService userService;
    private static final String CLIENT_ID_ANDROID
            = "794979457672-l913dtsm0bmg433sq1q9bn10akrcr87e.apps.googleusercontent.com";

    private static final String CLIENT_ID_IOS = "XXXXXXXXXXXXXXXXX";

public Mono<UserResponse> validateRequest(String token, String ipAddress) {
        return extractPayload(token).flatMap(payload -> {
            String userEmail = payload.getEmail();
            String userName = payload.get("name").toString();
            System.out.println("Received payload: " + payload);

            return userService.retrieveUser(userEmail)
                .flatMap(exists -> {
                    if (exists.getSuccess()) {
                        return Mono.just(exists);
                    } else {
                        return mapToUser(new OauthUser(userEmail, userName, ipAddress, token))
                            .flatMap(userService::saveUser);
                    }
                });
        })
        .doOnSuccess(response -> {
            System.out.println("Successfully validated request for user: " + response.getEmail());
        })
        .doOnError(error -> {
            System.err.println("Error validating request: " + error.getMessage());

        });
    }

    private Mono<GoogleIdToken.Payload> extractPayload(String token) {

        return Mono.fromCallable(() -> {
            var verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance())
                .setAudience(List.of(CLIENT_ID_ANDROID, CLIENT_ID_IOS))
                .build();

            GoogleIdToken idToken = verifier.verify(token);

            if (idToken == null) {
                throw new GeneralSecurityException("Invalid ID token");
            }

            return idToken.getPayload();
        });
    }
}
