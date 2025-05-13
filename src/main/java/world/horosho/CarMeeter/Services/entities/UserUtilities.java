package world.horosho.CarMeeter.Services.entities;

import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.COMMON.OauthUser;
import world.horosho.CarMeeter.DB.Models.POST.User;
import world.horosho.CarMeeter.DB.Models.COMMON.UserResponse;

import java.time.Instant;

public interface UserUtilities {

    default Mono<UserResponse> mapToUserResponse(User user){
        return Mono.just(new UserResponse(user.getEmail(), user.getUsername(), user.getRegistered().toString(),
                true, user.getFriendshipUUID()));
    }

    default Mono<User> mapToUser(OauthUser user){
        System.out.println("MAP MAP MAP");
        User newUser = new User(user.getEmail(), user.getUsername(), user.getIpAddress(), user.getIdToken());
        newUser.setRegistered(Instant.now());
        System.out.println(newUser);
        return Mono.just(newUser);
    }


    default Mono<Boolean> checkUserPasswordLength(String pass){
        return Mono.just(pass.length() > 1 && pass.length() < 25);
    }

}
