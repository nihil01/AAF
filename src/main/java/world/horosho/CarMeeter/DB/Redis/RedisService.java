package world.horosho.CarMeeter.DB.Redis;

import org.springframework.data.redis.core.ReactiveRedisOperations;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class RedisService {

    private final ReactiveRedisOperations<String, String> redisOperations;

    public RedisService(ReactiveRedisOperations<String, String> redisOperations) {
        this.redisOperations = redisOperations;
    }


    //TOKENS
    public Mono<Void> setRevokedToken(String token){
        System.out.println("Token added to Redis: " + token);
        return redisOperations.opsForValue().set("token:"+token, token, Duration.ofDays(30)).then();
    }


    public Mono<Boolean> isTokenRevoked(String token) {
        return redisOperations.opsForValue().get("token:"+token)
            .hasElement();
    }

    //===============================================================

    //EMAILS

    public Mono<Map<String, Boolean>> isEmailOtpValid(String email, String code) {


        return Mono.zip(
                isEmailOtpExpired(email), isPasswordResetPending(email)
            )
            .flatMap(tuple -> {
                Map<String, Boolean> map = new HashMap<>();

                System.out.println("Email: " + email);
                System.out.println("Code: " + code);
                System.out.println("Сохраненный код: " + tuple.getT1());
                System.out.println("Ожидается сброс пароля: " + tuple.getT2());

                boolean codeMatches = tuple.getT1() != null && tuple.getT1().equals(code);
                boolean resetPending = Boolean.TRUE.equals(tuple.getT2());

                if (codeMatches) {
                    map.put("OTP-APPROVED", true);
                    return setPasswordResetPending(email).thenReturn(map);

                } else if (resetPending) {
                    map.put("PASSWORD-RESET-APPROVED", true);

                } else {
                    map.put("ERROR", true);

                }

                return Mono.just(map);
            })
            .onErrorResume(e -> {
                System.err.println("Критическая ошибка в isEmailOtpValid: " + e.getMessage());
                Map<String, Boolean> errorMap = new HashMap<>();
                errorMap.put("ERROR", true);
                return Mono.just(errorMap);
            });
    }

    public Mono<Void> setEmailOtpExpiration(String email, String uuid){
        System.out.println("Email added to redis for pass reset: " + email);
        return redisOperations.opsForValue().set("email_otp:"+email, uuid, Duration.ofMinutes(5)).then();
    }


    public Mono<String> isEmailOtpExpired(String email) {
        // Добавляем отладку и обработку ошибок/пустых значений
        return redisOperations.opsForValue().getAndDelete("email_otp:"+email)
            .switchIfEmpty(Mono.defer(() -> {
                return Mono.just("");
            }));

    }

    public Mono<Void> setPasswordResetPending(String email) {
        return redisOperations.opsForValue().set("email_password_reset:" + email, email, Duration.ofMinutes(5)).then();
    }

    public Mono<Boolean> isPasswordResetPending(String email) {
        return redisOperations.opsForValue().getAndDelete("email_password_reset:"+email)
                .map(email::equals)
                .switchIfEmpty(Mono.defer(() -> Mono.just(false)))
                .onErrorResume(e -> Mono.just(false));
    }


    //EMAIL / USER CREATION

    public Mono<Void> setEmailCodeRegistrationPending(String email, String code) {
        return redisOperations.opsForValue().set("email_registration:" + email, code, Duration.ofMinutes(5)).then();
    }


    public Mono<String> getEmailCodeRegistrationPending(String email) {
        return redisOperations.opsForValue().getAndDelete("email_registration:" + email)
            .switchIfEmpty(Mono.defer(() -> {
                System.out.println("No registration pending for email: " + email);
                return Mono.empty();
        }));
    }

    //FRIENDS RETRIEVAL

    public Mono<Void> setFriendshipAwaiting(String myFriendshipUUID, String friendsUUID){
        // Add to a Redis set to store multiple mappings
        return redisOperations.opsForSet().isMember("friendship_awaiting:" + friendsUUID, myFriendshipUUID)
            .flatMap(aBoolean -> {
                if (!aBoolean) {
                    return redisOperations.opsForSet().add("friendship_awaiting:" + friendsUUID, myFriendshipUUID).then();
                } else {
                    return Mono.error(new IllegalStateException("Friendship request already exists"));
                }
            });
    }
    public Flux<String> getFriendshipAwaiting(String uuid){
        // Get all pending friend requests for this user
        return redisOperations.opsForSet().members("friendship_awaiting:" + uuid);
    }

    public Mono<Boolean> removeFriendshipAwaiting(String myFriendshipUUID, String friendsUUID){
        // Remove a specific friend request from the set
        return redisOperations.opsForSet().remove("friendship_awaiting:" + myFriendshipUUID, friendsUUID)
            .map(removed -> removed > 0)
            .onErrorResume(e -> {
                System.err.println("Error removing friendship request: " + e.getMessage());
                return Mono.just(false);
            })
            .doOnSuccess(result -> {
                if(result) {
                    System.out.println("Successfully removed friendship request");
                } else {
                    System.out.println("No friendship request found to remove");
                }
            });
    }


    //USE ACTIVITY OPERATIONS
    public Mono<Boolean> setOnline(int id){
        return redisOperations.opsForSet().isMember("online_users", String.valueOf(id))
            .flatMap(aBoolean -> {
                if (!aBoolean) {
                    return redisOperations.opsForSet().add("online_users", String.valueOf(id)).thenReturn(true);
                } else {
                    return Mono.just(false);
                }
        });
    }

    public Mono<Boolean> setOffline(int id){
        return redisOperations.opsForSet().isMember("online_users", String.valueOf(id))
            .flatMap(aBoolean -> {
                if (!aBoolean) {
                    return redisOperations.opsForSet().remove("online_users", String.valueOf(id)).thenReturn(true);
                } else {
                    return Mono.just(false);
                }
            });
    }

    public Mono<Boolean> checkOnline(int id){
        return redisOperations.opsForSet().members("online_users")
            .collectList()
            .map(userList -> userList.contains(String.valueOf(id)))
            .switchIfEmpty(Mono.defer(() -> Mono.just(false)))
            .onErrorResume(e -> {
                System.err.println("Error checking online users: " + e.getMessage());
                return Mono.just(false);
            });
    }



}
