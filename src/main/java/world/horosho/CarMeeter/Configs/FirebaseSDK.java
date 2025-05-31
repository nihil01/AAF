package world.horosho.CarMeeter.Configs;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseSDK {

    @PostConstruct
    public void firebaseInit() {
        try {
            InputStream serviceAccount = getClass()
                    .getClassLoader()
                    .getResourceAsStream("carmeeter-admin-sdk.json");

            if (serviceAccount == null) {
                throw new RuntimeException("Firebase service account file not found");
            }

            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize Firebase", e);
        }
    }
}
