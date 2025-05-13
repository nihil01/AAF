package world.horosho.CarMeeter.Services.entities;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.POST.User;
import world.horosho.CarMeeter.DB.Models.COMMON.UserResponse;
import world.horosho.CarMeeter.DB.Redis.RedisService;
import world.horosho.CarMeeter.DB.Repositories.UserRepository;
import world.horosho.CarMeeter.Services.mail.MailRequest;
import world.horosho.CarMeeter.Services.mail.MailService;
import world.horosho.CarMeeter.Services.mail.RecoveryRequest;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService implements UserUtilities{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final MailService mailService;
    private final RedisService redisService;

    //authentication logic
    // Added error handling for SQL query execution

    public Mono<UserResponse> createUser(User user) {
        return userRepository.findByEmail(user.getEmail())
            .onErrorResume(e -> {
                System.err.println("SQL Error during user lookup: " + e.getMessage());
                return Mono.empty();
            })
            .flatMap(existingUser -> Mono.just(new UserResponse("", "", Instant.now().toString(),
                    false, null)))
            .switchIfEmpty(
                Mono.defer(() ->
                    checkUserPasswordLength(user.getPassword())
                        .flatMap(aBoolean -> {
                            System.out.println("user not found!");
                            if (aBoolean){
                                //* check for otp status
                                return redisService.getEmailCodeRegistrationPending(user.getEmail()).flatMap(s -> {
                                    System.out.println("otp status: " + s);
                                    System.out.println("user provided otp " + user.getCode());
                                    //* approve user registration
                                    if (s.equals(user.getCode())) {
                                        user.setPassword(passwordEncoder.encode(user.getPassword()));
                                        return userRepository.save(user)
                                            .onErrorResume(e -> {
                                                System.err.println("SQL Error during user save: " + e.getMessage());
                                                return Mono.empty();
                                            })
                                            .flatMap(savedUser -> userRepository.findByEmail(savedUser.getEmail())
                                            .flatMap(this::mapToUserResponse));
                                    } else {
                                        System.out.println("Not equals !!");
                                        //* handle invalid code
                                        return Mono.just(new UserResponse("", "",
                                                Instant.now().toString(), false, null));
                                    }
                                })
                                .switchIfEmpty(Mono.defer(() -> mailService.sendEmail(new MailRequest(user.getUsername(), user.getEmail(),
                                        "", user.getIpAddress(), "CONFIRM_EMAIL"))
                                ));
                            }else{
                                //* invalid password length
                                return Mono.just(new UserResponse("", "", Instant.now().toString(),
                                        false, null));
                            }
                        })
                )
            );
    }
    public Mono<UserResponse> loginUser(User user){
        return userRepository.findByEmail(user.getEmail())
            .flatMap(existingUser -> {

                if(passwordEncoder.matches(user.getPassword(),existingUser.getPassword())){
                    return mapToUserResponse(existingUser);
                }else{
                    return Mono.just(new UserResponse("", "",
                        Instant.now().toString(), false, null));
                }
            })
            .switchIfEmpty(Mono.just(new UserResponse("", "",
                Instant.now().toString(), false, null)));
    }


    //recovery BL
    public Mono<UserResponse> requestPasswordRecovery(String email, String ip) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        if (email != null && !email.isEmpty() && email.matches(emailRegex)) {
            return userRepository.findByEmail(email)
                .flatMap(user ->
                    mailService.sendEmail(new MailRequest(user.getUsername(), user.getEmail(),
                        "", ip, "RESET_PASS")));
        }
        return Mono.just(new UserResponse("", "",
                Instant.now().toString(), false, null));
    }

    public Mono<Map<String, Boolean>> recoverPassword(RecoveryRequest recoveryRequest) {
        return redisService.isEmailOtpValid(recoveryRequest.email(), recoveryRequest.code())
            .flatMap(isValid -> {
                if (Boolean.TRUE.equals(isValid.get("OTP-APPROVED"))) {

                    return Mono.just(isValid);
                } else if (Boolean.TRUE.equals(isValid.get("PASSWORD-RESET-APPROVED"))) {

                    return userRepository
                            .findByEmail(recoveryRequest.email())
                            .flatMap(user -> {
                                try {
                                    String encodedPassword = passwordEncoder.encode(recoveryRequest.password());
                                    user.setPassword(encodedPassword);
                                    return userRepository.save(user)
                                            .doOnSubscribe(s -> System.out.println("Начато обновление пользователя"))
                                            .doOnSuccess(savedUser -> System.out.println("Пользователь успешно обновлен с ID: " + savedUser.getEmail()));
                                } catch (Exception e) {
                                    System.err.println("Исключение при обработке пользователя: " + e.getMessage());
                                    e.printStackTrace();
                                    return Mono.error(e);
                                }
                            })
                            .map(savedUser -> (Map<String, Boolean>) new HashMap<>(isValid))
                            .onErrorResume(e -> {
                                Map<String, Boolean> errorResult = new HashMap<>();
                                errorResult.put("error", true);
                                errorResult.put("db_error", true);
                                return Mono.just(errorResult);
                            });
                } else {
                    System.out.println("Недействительный код для: " + recoveryRequest.email());
                    return Mono.just(isValid);
                }
            });
    }

    public Mono<UserResponse> retrieveUser(String email){
        return userRepository.findByEmail(email)
            .flatMap(this::mapToUserResponse)
            .switchIfEmpty(Mono.just(new UserResponse("", ""
                    , "", false,"")));
    }

    public Mono<UserResponse> saveUser(User user){
        return userRepository.save(user)
            .flatMap(this::mapToUserResponse);
    }

}
