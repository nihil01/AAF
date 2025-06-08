package world.horosho.CarMeeter.Services.firebase;

import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.POST.FCM;
import world.horosho.CarMeeter.DB.Models.POST.User;

public interface FirebaseUtilities {

    default Mono<FCM> userToFCM(User user, String token, String deviceID) {
        return Mono.just(FCM.builder()
            .userId(user.getId())
            .device_id(deviceID)
            .fcm_token(token)
            .build());
    }

}
