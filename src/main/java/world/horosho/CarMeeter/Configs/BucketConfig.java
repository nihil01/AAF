package world.horosho.CarMeeter.Configs;
import io.github.bucket4j.Bucket;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class BucketConfig {

    @Bean
    public Bucket bucket() {
        return Bucket.builder()
            .addLimit(limit -> limit.capacity(30).refillGreedy(10, Duration.ofMinutes(2)))
            .build();
    }

    @Bean
    public Bucket strictBucket() {
        return Bucket.builder()
            .addLimit(limit -> limit.capacity(1).refillGreedy(1, Duration.ofMinutes(2)))
            .build();
    }
}
