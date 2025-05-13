package world.horosho.CarMeeter.Services.mail;

import reactor.core.publisher.Mono;
import world.horosho.CarMeeter.DB.Models.COMMON.UserResponse;
import world.horosho.CarMeeter.DB.Redis.RedisService;

import java.util.random.RandomGenerator;

public interface MailContract {

    RedisService getRedisService();

    Mono<UserResponse> sendEmail(MailRequest request);


    default Mono<String> getAvailableTemplates(String key){
        return switch (key) {
            case "RESET_PASS" -> Mono.just("""
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { color: #2c3e50; font-size: 24px; margin-bottom: 20px; }
                            .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
                            .warning { color: #e74c3c; }
                            .footer { margin-top: 20px; color: #7f8c8d; font-size: 14px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">Password Reset Request</div>
                            <div class="content">
                                <p>Dear %s,</p>
                    
                                <p>A password reset was requested from IP address: <strong>%s</strong></p>
                    
                                <p class="warning">If you did not request this password reset, please ignore this email or contact support immediately.</p>
                    
                                <p>To reset your password, please use the following code:</p>
                                <h2>%s</h2>
                    
                                <p><em>For security reasons, this password reset code will expire in 5 minutes.</em></p>
                            </div>
                            <div class="footer">
                                <p>Best regards,<br>CarMeeter Team</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    """);
            case "CONFIRM_EMAIL" -> Mono.just("""
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { color: #2c3e50; font-size: 24px; margin-bottom: 20px; }
                            .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
                            .warning { color: #e74c3c; }
                            .footer { margin-top: 20px; color: #7f8c8d; font-size: 14px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">Email Confirmation</div>
                            <div class="content">
                                <p>Dear %s,</p>
                    
                                <p>Thank you for registering with CarMeeter. To complete your registration, please verify your email address.</p>
                    
                                <p>Your confirmation code is:</p>
                                <h2>%s</h2>
                    
                                <p><em>This confirmation code will expire in 5 minutes.</em></p>
                    
                                <p class="warning">If you did not create an account with CarMeeter, please ignore this email.</p>
                            </div>
                            <div class="footer">
                                <p>Best regards,<br>CarMeeter Team</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    """);
            default -> Mono.just("");
        };
    }

    default Mono<Void> setResetOtp(String email, String code) {
        return getRedisService().setEmailOtpExpiration(email, code);
    }

    default Mono<Void> setRegisterOtp(String email, String code) {
        return getRedisService().setEmailCodeRegistrationPending(email, code);
    }

    default Mono<String> genOtp() {
        return Mono.fromSupplier(() -> String.valueOf(RandomGenerator.getDefault()
                .nextInt(100000, 999999)));
    }
}