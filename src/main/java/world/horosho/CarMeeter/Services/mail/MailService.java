package world.horosho.CarMeeter.Services.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailSender;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import world.horosho.CarMeeter.DB.Models.COMMON.UserResponse;
import world.horosho.CarMeeter.DB.Redis.RedisService;

@RequiredArgsConstructor
@Service
public class MailService implements MailContract {

    private final RedisService redisService;
    private final MailSender mailSender;

    @Override
    public RedisService getRedisService() {
        return redisService;
    }

    @Override
    public Mono<UserResponse> sendEmail(MailRequest request) {
        return genOtp().flatMap(otp -> {
            MimeMessage mimeMessage = ((JavaMailSender) mailSender).createMimeMessage();
            try {
                MimeMessageHelper message = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                message.setTo(request.email());
                message.setFrom("admin@horosho.world");
                message.setSubject(request.theme().equals("RESET_PASS") ? "Password recovery"
                        : request.theme().equals("CONFIRM_EMAIL") ? "Registration" : "");

                return getAvailableTemplates(request.theme()).flatMap(template -> {
                    try {
                        switch (request.theme()){
                            case "RESET_PASS" ->
                                message.setText(template.formatted(request.username(), request.ip(), otp), true);
                            case "CONFIRM_EMAIL" ->
                                message.setText(template.formatted(request.username(), otp), true);
                        }

                        ((JavaMailSender) mailSender).send(mimeMessage);
                        return Mono.empty();
                    } catch (MessagingException e) {
                        return Mono.error(new RuntimeException(e));
                    }
                })
                .subscribeOn(Schedulers.boundedElastic())
                .onErrorResume(e -> Mono.error(new RuntimeException("Failed to send password reset email", e)))

                .then(request.theme().equals("RESET_PASS") ? setResetOtp(request.email(), otp)
                        : request.theme().equals("CONFIRM_EMAIL") ? setRegisterOtp(request.email(), otp): Mono.empty())

                .thenReturn(new UserResponse(request.email(), request.username(), "EMAIL_AWAITING", true));
            } catch (MessagingException e) {
                return Mono.error(new RuntimeException(e));
            }
        });
    }
}