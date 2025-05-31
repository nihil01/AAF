package world.horosho.CarMeeter.Services.firebase;

import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.POST.FCM;
import world.horosho.CarMeeter.DB.Models.POST.UserProjection;

public interface FirebaseUtilities {

    default Mono<FCM> projectionToFCM(UserProjection projection, String token, String deviceID) {
        return Mono.just(FCM.builder()
            .userId(projection.getId())
            .device_id(deviceID)
            .fcm_token(token)
            .build());
    }

}
