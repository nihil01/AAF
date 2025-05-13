package world.horosho.CarMeeter.Configs;

import io.github.bucket4j.Bucket;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Configuration
public class RouterConfig implements WebFilter {

    private final Bucket bucketConfig;

    public RouterConfig(Bucket bucketConfig) {
        this.bucketConfig = bucketConfig;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {

        if (!bucketConfig.tryConsume(1)) {
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            return exchange.getResponse().setComplete();
        }

        return chain.filter(exchange);

    }
}
