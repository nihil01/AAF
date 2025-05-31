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

    private final Bucket strictBucket;
    private final Bucket bucket;

    public RouterConfig(Bucket strictBucket, Bucket bucket) {
        this.strictBucket = strictBucket;
        this.bucket = bucket;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {

        if (exchange.getRequest().getPath().value().contains("/api/v1/silent/nearby")){
            System.out.println("Contains path i need!!");
            if (!strictBucket.tryConsume(1)) {
                exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                return exchange.getResponse().setComplete();
            }
        }

        if (!bucket.tryConsume(1)) {
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            return exchange.getResponse().setComplete();
        }

        return chain.filter(exchange);

    }
}