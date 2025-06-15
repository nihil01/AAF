package world.horosho.CarMeeter.Services.entities;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.GET.Profile;
import world.horosho.CarMeeter.DB.Models.GET.VehicleProfile;
import world.horosho.CarMeeter.DB.Models.POST.Socials;
import world.horosho.CarMeeter.DB.Models.POST.User;
import world.horosho.CarMeeter.DB.Models.COMMON.UserResponse;
import world.horosho.CarMeeter.DB.Models.PUT.BioRequest;
import world.horosho.CarMeeter.DB.Models.PUT.SocialNetworks;
import world.horosho.CarMeeter.DB.Redis.RedisService;
import world.horosho.CarMeeter.DB.Repositories.user.UserRepository;
import world.horosho.CarMeeter.DB.Repositories.user.UserSocialRepository;
import world.horosho.CarMeeter.DB.Repositories.vehicle.VehicleRepository;
import world.horosho.CarMeeter.Services.aws.S3Service;
import world.horosho.CarMeeter.Services.mail.MailRequest;
import world.horosho.CarMeeter.Services.mail.MailService;
import world.horosho.CarMeeter.Services.mail.RecoveryRequest;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService implements UserUtilities {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VehicleRepository vehicleRepository;
    private final UserSocialRepository userSocialRepository;

    private final MailService mailService;
    private final RedisService redisService;
    private final S3Service s3Service;

    //authentication logic

    public Mono<UserResponse> createUser(User user) {
        return userRepository.findByUsernameAndEmail(user.getUsername(), user.getEmail())
            .onErrorResume(e -> {
                System.err.println("SQL Error during user lookup: " + e.getMessage());
                return Mono.empty();
            })
            .flatMap(existingUser -> Mono.just(new UserResponse(0, "USER EXISTS",
                    "", Instant.now().toString(), false)))
            .switchIfEmpty(
                Mono.defer(() ->
                    checkUserPasswordLength(user.getPassword())
                        .flatMap(aBoolean -> {
                            System.out.println("user not found!");
                            if (aBoolean) {
                                //* check for otp status
                                return redisService.getEmailCodeRegistrationPending(user.getEmail()).flatMap(s -> {
                                    System.out.println("otp status: " + s);
                                    System.out.println("user provided otp " + user.getCode());
                                    //* approve user registration
                                    if (s.equals(user.getCode())) {

                                        user.setPassword(passwordEncoder.encode(user.getPassword()));

                                        return this.normalizeUserName(user.getUsername())
                                                .flatMap(s1 -> {
                                                    user.setUsername(s1);
                                                    return Mono.just(user);
                                                })
                                                .flatMap(userRepository::save)
                                                .onErrorResume(e -> {
                                                    System.err.println("SQL Error during user save: " + e.getMessage());
                                                    return Mono.empty();
                                                })
                                                .flatMap(savedUser -> userRepository.findByEmail(savedUser.getEmail())
                                                        .flatMap(this::mapToUserResponse));

                                        } else {
                                            System.out.println("Not equals !!");
                                            //* handle invalid code
                                            return Mono.just(new UserResponse(0, "", "",
                                                    Instant.now().toString(), false));
                                        }
                                    })
                                    .switchIfEmpty(Mono.defer(() -> mailService.sendEmail(new MailRequest(user.getUsername(), user.getEmail(),
                                            "", user.getIpAddress(), "CONFIRM_EMAIL"))
                                    ));
                            } else {
                                //* invalid password length
                                return Mono.just(new UserResponse(0, "", "", Instant.now().toString(),
                                        false));
                            }
                        })
                )
            );
    }

    public Mono<UserResponse> loginUser(User user) {
        return userRepository.findByEmail(user.getEmail())
                .flatMap(existingUser -> {

                    if (passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
                        return mapToUserResponse(existingUser);
                    } else {
                        return Mono.just(new UserResponse(0, "", "",
                                Instant.now().toString(), false));
                    }
                })
                .switchIfEmpty(Mono.just(new UserResponse(0, "", "",
                        Instant.now().toString(), false)));
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
        return Mono.just(new UserResponse(0, "", "",
                Instant.now().toString(), false));
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

    public Mono<UserResponse> retrieveUser(String email) {
        return userRepository.findByEmail(email)
            .flatMap(this::mapToUserResponse)
            .switchIfEmpty(Mono.just(new UserResponse(0, "", ""
                    , "", false)));
    }

    public Mono<UserResponse> saveUser(User user) {
        return normalizeUserName(user.getUsername())
            .map(normalizedUsername -> {
                user.setUsername(normalizedUsername);
                return user;
            })
            .flatMap(userRepository::save)
            .onErrorResume(e -> {
                System.err.println("Error saving user: " + e.getMessage());
                return Mono.empty();
            })
            .flatMap(this::mapToUserResponse);
    }

    private Mono<String> normalizeUserName(String username) {
        return Mono.just(username.toLowerCase(Locale.ROOT).replaceAll(" ", username.contains(" ") ? "_" : ""));
    }


    /**
     * The Profile retrieval section
         * Contains methods for retrieving user profile information including:
         * - Full user profile with vehicles and social data
         * - User's vehicles
         * - User's biographical and social information
     */
    //Profile user retrieval
    //*************************************************************************************************//
    public Mono<Profile> getUserProfileByUsername(String username) {
        return userRepository.findByUsername(username).flatMap(projection -> {
            System.out.println(projection);

            Mono<List<VehicleProfile>> vehicles = getUserVehicles(projection.getUsername());
            Mono<Socials> bio = getUserBio(projection.getId());
            Mono<Boolean> online = redisService.checkOnline(projection.getId());

            return Mono.zip(vehicles, bio, online).map(tuples -> {

                List<VehicleProfile> vehicleProfiles = tuples.getT1();
                Socials socials = tuples.getT2();
                Boolean status = tuples.getT3();

                return Profile.builder()
                    .registered(projection.getRegistered())
                    .online(status)
                    .avatar(socials.getAvatar())
                    .about(socials.getAbout())
                    .social_networks(socials.getSocial_networks())
                    .vehicles(vehicleProfiles)
                    .username(projection.getUsername())
                    .build();
            });
        });
    }

    private Mono<List<VehicleProfile>> getUserVehicles(String username) {
        return vehicleRepository.findUserVehicleDataByUsername(username).collectList()
                .switchIfEmpty(Mono.just(Collections.emptyList()));
    }

    private Mono<Socials> getUserBio(long id) {
        return userSocialRepository.findByUserId(id).switchIfEmpty(Mono.just(
            Socials.builder()
                .about("")
                .userId(id)
                .social_networks("")
                .avatar("")
                .build()
        ));
    }
    //*************************************************************************************************//

    //updating user bio
    public Mono<Void> updateUserBio(long id, BioRequest bio) throws JsonProcessingException {
        //check for valid social networks
        List<String> allowedSocials = List.of("instagram", "facebook");

        ObjectMapper mapper = new ObjectMapper();

        List<SocialNetworks> socialNetworks = mapper.readValue(bio.social_networks(), new TypeReference<>() {});
        System.out.println("social nets: " + socialNetworks);


        List<String> invalidSocials = socialNetworks.stream().map(SocialNetworks::type)
                .filter(name -> !allowedSocials.contains(name.toLowerCase(Locale.ROOT))).toList();

        if (!invalidSocials.isEmpty()) {
            return Mono.error(new RuntimeException("Invalid social networks: "
                    + String.join(", ", invalidSocials)));
        }

        //save user avatar
        return DataBufferUtils.join(bio.avatar().content()).flatMap(dataBuffer ->
            s3Service.uploadFileToS3(dataBuffer.asInputStream()).flatMap(avatarUrl -> {
                try {
                    return userSocialRepository.save(
                        Socials.builder()
                            .about(bio.about())
                            .social_networks(mapper.writeValueAsString(socialNetworks))
                            .avatar(avatarUrl)
                            .userId(id)
                            .build()
                    );
                } catch (JsonProcessingException e) {
                    return Mono.error(new RuntimeException(e));
                }
            }).then()
        );
    }

    /* User online handling section */
    /* - Gets data from redis */

    public Mono<Boolean> manageActivityStatus(int id, boolean state) {
        return state ? redisService.setOnline(id) : redisService.setOffline(id);
    }
}