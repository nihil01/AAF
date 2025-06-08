package world.horosho.CarMeeter.Services.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.Claim;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.Configs.JwtProperties;
import world.horosho.CarMeeter.DB.Models.COMMON.UserResponse;
import world.horosho.CarMeeter.DB.Redis.RedisService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Objects;

@Service
public class JwtService {

    private final RedisService redisService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Algorithm algorithm;
    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    public JwtService(
        RedisService redisService, JwtProperties jwtProperties) {
        this.redisService = redisService;
            this.algorithm = Algorithm.HMAC256(jwtProperties.getSecret());
    }

    public Mono<String> signToken(UserResponse data, Instant duration){
        return Mono.fromCallable(() -> {

            Map<String, Object> json = objectMapper.convertValue(data, new TypeReference<>(){});

            return JWT.create()
                .withExpiresAt(duration)
                .withIssuedAt(Instant.now())
                .withIssuer("car-meeter-api")
                .withPayload(json)
                .sign(algorithm);
        });
    }

    public Mono<Boolean> verifyToken(String token) {
        return Mono.fromCallable(() -> {
            try {
                JWT.require(algorithm)
                    .withIssuer("car-meeter-api")
                    .build()
                    .verify(token);
                return true;
            } catch (Exception e) {
                return false;
            }
        });
    }

    public Mono<UserResponse> extractUser(String token) {
        // Log the token for debugging
        log.debug("Extracting user from token: {}", token);

        return Mono.fromCallable(() -> {
            try {
                return JWT.decode(token);
            } catch (Exception e) {
                return null;
            }
        })
        .filter(Objects::nonNull)
        .map(decodedJWT -> {
            Map<String, Claim> claims = decodedJWT.getClaims();

            return new UserResponse(
                claims.get("id").asLong(),
                claims.get("email").asString(),
                claims.get("username").asString(),
                claims.get("registered").asString(),
                true);
        }).onErrorResume(e -> Mono.empty());
    }


    public Mono<String> refreshToken(String token) {
        return verifyToken(token)
        .flatMap(valid -> {
            if (!valid) {
                return Mono.just("INVALID_REFRESH_TOKEN");
            }

            return isTokenRevoked(token)
                .flatMap(isTokenRevoked -> {
                    if (isTokenRevoked){
                        return Mono.just("INVALID_REFRESH_TOKEN");
                    }

                    return Mono.fromCallable(() -> JWT.decode(token))
                        .map(decodedJWT -> {

                            Map<String, Claim> claims = decodedJWT.getClaims();

                            UserResponse userResponse = new UserResponse(
                                    claims.get("id").asLong(),
                                    claims.get("email").asString(),
                                    claims.get("username").asString(),
                                    claims.get("registered").asString(),
                                    true
                            );

                            Map<String, Object> data = objectMapper.convertValue(
                                    userResponse,
                                    new TypeReference<>() {}
                            );

                            return JWT.create()
                                .withExpiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                                .withIssuedAt(Instant.now())
                                .withIssuer("car-meeter-api")
                                .withPayload(data)
                                .sign(algorithm);
                });
            });
        });
    }


    public Mono<Void> revokeToken(String token) {
        return redisService.setRevokedToken(token);
    }

    public Mono<Boolean> isTokenRevoked(String token) {
        return redisService.isTokenRevoked(token);
    }

}

