package world.horosho.CarMeeter.Controllers.REST;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.POST.User;
import world.horosho.CarMeeter.DB.Models.COMMON.UserResponse;
import world.horosho.CarMeeter.Services.entities.UserService;
import world.horosho.CarMeeter.Services.google.ApiClient;
import world.horosho.CarMeeter.Services.jwt.JwtService;
import world.horosho.CarMeeter.Services.mail.RecoveryRequest;

import java.net.InetSocketAddress;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final ApiClient apiClient;

    @PostMapping(value = "/authenticate", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public Mono<ResponseEntity<UserResponse>> auth(
            @Valid @ModelAttribute User user, ServerWebExchange exchange
    ) {
        InetSocketAddress address = exchange.getRequest().getRemoteAddress();
        String ipAddress = address != null ? address.getHostString() : "IP_ADDRESS_UNDEFINED";
        user.setIpAddress(ipAddress);
        System.out.println(user);
        return switch (user.getType()) {
            case "login" -> userService.loginUser(user).flatMap(this::getMono);

            case "register" ->
                userService.createUser(user).flatMap(userResponse -> {
                    if (userResponse.getSuccess()) {
                        return getMono(userResponse);

                    }else if(userResponse.getRegistered().equals("EMAIL_AWAITING")){
                        return Mono.just(ResponseEntity.status(HttpStatus.OK).body(new UserResponse("",
                                "","",true)));
                    }
                    else {
                        return Mono.just(ResponseEntity.badRequest().body(userResponse));
                    }
                });

            case "google_oauth" -> {
                if (user.getIdToken() != null && !user.getIdToken().isBlank()) {
                     yield apiClient.validateRequest(user.getIdToken(), user.getIpAddress())
                            .flatMap(this::getMono);
                } else {
                    yield Mono.just(ResponseEntity.badRequest().body(new UserResponse(
                            "Missing idToken for Google OAuth", null, null, false
                    )));
                }
            }

            default -> Mono.just(ResponseEntity.badRequest().body(new UserResponse(
                    "Unsupported authentication type", null, null, false
            )));
        };
    }


    @GetMapping( "/logout")
    public Mono<Void> logout(ServerWebExchange exchange) {
        return getReadyToken(exchange)
            .flatMap(strings -> jwtService.revokeToken(strings[0])
        );
    }

    @GetMapping("/refresh")
    public Mono<ResponseEntity<Void>> refresh(ServerWebExchange exchange) {
        return getReadyToken(exchange)
            .flatMap(strings -> {
                return jwtService.refreshToken(strings[0]).flatMap(newToken -> {
                    if (!newToken.equals("INVALID_REFRESH_TOKEN")){
                        exchange.getResponse()
                                .getHeaders()
                                .add("authorization", "Bearer %s".formatted(newToken));
                        return Mono.just(ResponseEntity.ok().build());
                    }

                return Mono.just(ResponseEntity.badRequest().build());
            });
        });
    }

    @GetMapping("/forgot-password")
    private Mono<ResponseEntity<Map<String, Boolean>>> forgotPassword(@RequestParam String email, ServerWebExchange exchange) {
        InetSocketAddress address = exchange.getRequest().getRemoteAddress();
        return userService.requestPasswordRecovery(email,
                        address != null ? address.getHostString() : "IP_ADDRESS_UNDEFINED")
            .map(userResponse -> ResponseEntity.ok().body(Map.of("success", userResponse.getSuccess())))
            .defaultIfEmpty(ResponseEntity.ok()
                .body((Map.of("success", false))))
            .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body((Map.of("success", false)))));
    }

    @PostMapping("/password-recovery")
    private Mono<ResponseEntity<Map<String, Boolean>>> passwordRecovery(
            @Valid @RequestBody RecoveryRequest recoveryRequest
    ) {
        System.out.println(recoveryRequest);

        return userService.recoverPassword(recoveryRequest)
                .map(userResponse -> ResponseEntity.ok().body(userResponse))
                .defaultIfEmpty(ResponseEntity.ok()
                    .body(Map.of("success", false)))
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", true))));
    }

    //UTILITY METHOD
    private Mono<ResponseEntity<UserResponse>> getMono(UserResponse userResponse) {
        if (userResponse.getSuccess()) {
            return Mono.zip(
                jwtService.signToken(userResponse, Instant.now().atZone(ZoneOffset.UTC).plusMonths(1).toInstant()),
                jwtService.signToken(userResponse, Instant.now().plus(15, ChronoUnit.MINUTES))
            ).map(tokens -> ResponseEntity.ok()
                .header("Refresh-Token", "Bearer " + tokens.getT1())
                .header("Authorization", "Bearer " + tokens.getT2())
                .contentType(MediaType.APPLICATION_JSON)
                .body(userResponse)
            );
        } else {
            return Mono.just(ResponseEntity.badRequest().body(userResponse));
        }
    }

    private static Mono<String[]> getReadyToken(ServerWebExchange exchange) {
        String rawToken = exchange.getRequest().getHeaders().getFirst("authorization");
        String[] data = new String[2];
        if (rawToken == null || !rawToken.startsWith("Bearer ")) {
            return Mono.empty();
        }
        InetSocketAddress address = exchange.getRequest().getRemoteAddress();

        data[0] = rawToken.split(" ")[1];
        data[1] = address != null ? address.getHostString() : "IP_ADDRESS_UNDEFINED";
        return Mono.just(data);
    }
}
