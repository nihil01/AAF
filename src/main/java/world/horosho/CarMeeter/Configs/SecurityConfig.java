package world.horosho.CarMeeter.Configs;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.security.web.server.authentication.ServerAuthenticationFailureHandler;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.Services.jwt.JwtAuthentication;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthenticationManager authenticationManager;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        // Создаем и настраиваем фильтр аутентификации
        AuthenticationWebFilter authenticationWebFilter = new AuthenticationWebFilter(authenticationManager);
        authenticationWebFilter.setServerAuthenticationConverter(jwtAuthenticationConverter());
//        authenticationWebFilter.setAuthenticationSuccessHandler(successAuthenticationHandler());
//        authenticationWebFilter.setAuthenticationFailureHandler(failureAuthenticationHandler());

        // Отключаем хранение контекста безопасности в сессии, так как используем JWT
        http.securityContextRepository(NoOpServerSecurityContextRepository.getInstance());

        return http
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers(HttpMethod.POST, "/api/v1/auth/**").permitAll()
                .pathMatchers(HttpMethod.GET, "/api/v1/auth/**").permitAll()
                .pathMatchers("/api/v1/socket/**").permitAll()
                .anyExchange().authenticated()
            )
            .exceptionHandling(exceptionHandlingSpec ->
                exceptionHandlingSpec.authenticationEntryPoint((exchange, ex) ->
                    Mono.fromRunnable(() ->
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED)
                    )
                )
            )
            .addFilterAt(authenticationWebFilter, SecurityWebFiltersOrder.AUTHENTICATION)
            .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
            .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .cors(corsSpec -> corsSpec.configurationSource(this.corsWebFilter()))
            .build();
    }

    @Bean
    public ServerAuthenticationConverter jwtAuthenticationConverter() {
        return exchange -> {
            // Handle WebSocket authentication
            if (isWebSocketRequest(exchange)) {
                return Mono.empty();
            }
            // Handle HTTP authentication
            return handleHttpAuthentication(exchange);
        };
    }

    private boolean isWebSocketRequest(ServerWebExchange exchange) {
        return exchange.getRequest().getPath().toString().contains("/api/v1/socket");
    }

    // Handle HTTP Bearer token from Authorization header
    private Mono<Authentication> handleHttpAuthentication(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String authToken = authHeader.substring(7);
            return Mono.just(new JwtAuthentication(authToken));
        }
        return Mono.empty();
    }

    private ServerAuthenticationSuccessHandler successAuthenticationHandler() {
        return (webFilterExchange, authentication) -> {
            ServerWebExchange exchange = webFilterExchange.getExchange();
            return webFilterExchange.getChain().filter(exchange);
        };
    }

    private ServerAuthenticationFailureHandler failureAuthenticationHandler() {
        return (webFilterExchange, exception) -> {
            ServerWebExchange exchange = webFilterExchange.getExchange();
            return Mono.fromRunnable(() -> {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            });
        };
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(List.of(
                "http://localhost",
                "http://localhost:5174",
                "http://localhost:5173",
                "http://localhost:8080",
                "http://10.20.30.3:8080"
        ));

        corsConfig.setExposedHeaders(List.of("authorization", "refresh-token"));
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        corsConfig.setAllowedHeaders(Collections.singletonList("*"));
        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(8000L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }

}