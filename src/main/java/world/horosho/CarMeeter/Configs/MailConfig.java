package world.horosho.CarMeeter.Configs;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.MailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;


@Configuration
public class MailConfig {

    @Bean
    public MailSender mailSender() {

        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("email-smtp.eu-central-1.amazonaws.com"); // Замени на свой SMTP-сервер
        mailSender.setPort(587);
        mailSender.setUsername("AKIASFIXCUIBAJJD3AXW"); // Твой email
        mailSender.setPassword("BK8/88jovkocA8kZDIiUtWRppqYmrNL34eCPoF9+YKbK"); // Твой пароль или App Password для Gmail

        mailSender.getJavaMailProperties().put("mail.smtp.auth", "true");
        mailSender.getJavaMailProperties().put("mail.smtp.starttls.enable", "true");
        mailSender.getJavaMailProperties().put("mail.smtp.starttls.required", "true");
        mailSender.getJavaMailProperties().put("mail.debug", "true");


        return mailSender;
    }
}
