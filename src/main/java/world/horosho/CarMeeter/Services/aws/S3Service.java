package world.horosho.CarMeeter.Services.aws;

import com.amazonaws.SdkClientException;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.DeleteObjectsRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@Service
public class S3Service {

public Mono<String> uploadFileToS3(InputStream is) {
        return Mono.fromCallable(() -> {
            try {
                final AmazonS3 s3 = AmazonS3ClientBuilder.standard().withRegion(Regions.EU_CENTRAL_1).build();

                BufferedImage incomingImage = ImageIO.read(is);
                BufferedImage reservedBuffer = new BufferedImage(
                        400, 500, BufferedImage.TYPE_INT_RGB);

                Graphics2D graphics2D = reservedBuffer.createGraphics();
                graphics2D.drawImage(incomingImage, 0, 0, 300, 400, null);
                graphics2D.dispose();

                ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                ImageIO.write(reservedBuffer, "jpg", baos);
                byte[] bytes = baos.toByteArray();
                String key = UUID.nameUUIDFromBytes(bytes) + ".jpg";

                ObjectMetadata objectMetadata = new ObjectMetadata();
                objectMetadata.setContentLength(bytes.length);

                ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
                s3.putObject("aaf-app", key, bais, objectMetadata);

                return String.format("https://aaf-app.s3.eu-central-1.amazonaws.com/%s", key);
            } catch (IOException | SdkClientException e) {
                throw new RuntimeException(e);
            }finally {
                is.close();
            }
        })
        .subscribeOn(Schedulers.boundedElastic());
    }
    public Mono<Void> deleteFilesFromS3(List<String> urls) {
        return Mono.fromCallable(() -> {
            try {
                if (urls.isEmpty()) return Mono.empty();

                final AmazonS3 s3 = AmazonS3ClientBuilder.standard().withRegion(Regions.EU_CENTRAL_1).build();
                DeleteObjectsRequest deleteObjectsRequest = new DeleteObjectsRequest("aaf-app");
                List<DeleteObjectsRequest.KeyVersion> keys = urls.stream()
                        .map(url -> new DeleteObjectsRequest.KeyVersion(url.split("/")[3]))
                        .toList();
                deleteObjectsRequest.setKeys(keys);
                s3.deleteObjects(deleteObjectsRequest);
                return Mono.empty();
            } catch (SdkClientException e) {
                throw new RuntimeException(e);
            }
        })
        .subscribeOn(Schedulers.boundedElastic())
        .then();
    }

}